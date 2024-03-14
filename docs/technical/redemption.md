# Redemptions

It is critical for dUSD to maintain a stable peg to the USD. One issue to protect against is when dUSD's price trading at less than 100 cents on the dollar specifically on the orderbook. This can happen if the demand for ETH is so much higher than dUSD that dUSD holders are willing to sell at a discount. The primary way Ditto handles this is through redemptions.

Ditto redemptions follow the idea of [Liquity's redemptions](https://docs.liquity.org/faq/lusd-redemptions) in spirit. Redemptions are the ability to redeem LUSD for ETH at face value (i.e. 1 LUSD for $1 of ETH), which happens immediately in Liquity because the Troves are always sorted from least to greatest collateral ratio. But keeping all Troves (CDPs) sorted can be costly since each transaction that affects any trove will need to modify the sorted list, which is why Liquity has a hint system to make it more gas efficient to know where to place changed Troves in the sorted list.

Ditto's `shortRecords` (similar to a Trove/CDP) are not sorted, rather they are organized by each address. This is because, unlike in other protocols, each user can have multiple `shortRecord` positions at once. So, a different approach needs to be created to implement a redemption-like system where users are able to redeem the stable asset for ETH while only doing it against the lowest CR `shortRecords`.

Because it's expensive to sort all `shortRecords` or to prove that a given `shortRecord` is the lowest CR, Ditto introduces a two-step process for redemption that includes a dispute period. Instead of redeeming in one transaction, the redemption has to be claimed in a separate transaction if the dispute time period passes without issue. To dissuade users from redeeming against really high CR `shortRecords`, or just `shortRecords` out of order, a penalty gets applied to incorrect proposers.

In a sense, proposed redemptions are optimistic. They apply changes to the existing `shortRecords` but can be reverted/restored if a dispute happens in between the time that a proposer might claim the redemption.

Redemptions in Ditto has four main functions:

- `proposeRedemption`: a user can propose an amount of dUSD (the stable asset) to redeem ETH against (with a fee)
- `disputeRedemption`: a user can get a fee from the proposer for disputing an incorrect proposal
- `claimRedemption`: a user can get the ETH that they proposed correctly after the claim time period has passed
- `claimRemainingCollateral`: an extra function, where the shorter that was correctly redeemed on can get back any remaining collateral if `claimRedemption` has not been called

## Proposing a Redemption

The first action in a redemption is called a proposal since redemptions don't happen immediately as one transaction. The system doesn't know if the redemption is valid until a specific dispute period passes. A redeemer (referred to as proposer in this phase) provides a list of `shortRecords` to redeem against.

A key concept is that the `collateral` and `ercDebt` of the proposed `shortRecord` is decreased at the moment of proposal, even if the proposal is incorrect. The decreased amount is stored in the proposer's slate, which is saved in the proposer's `AssetUSer.SSTORE2Pointer` (More on that below in the Technical section). If properly disputed, the `collateral` and `ercDebt` of the proposed `shortRecord's` will be updated accordingly. In most cases, `shortRecords` that are proposed are "fully proposed", meaning that the `ercDebt` becomes zero. However, the `shortRecord` is not closed because `deleteShortRecord()` is not called on proposal. A `shortRecord` is closed only after the dispute period ends and the redemption has been claimed.

Partial redemptions can occur too, but are limited to the first and last proposal in the slate. The last proposal can be partial because `redemptionAmount` can be less than the total `ercDebt` of proposed shorts. The first proposal can also be partial, which is best illustrated by this example:

- There is a `shortRecord` with `ercDebt` of $5000
- Proposer A partially proposes this `shortRecord`. The remaining `ercDebt` is $2500.
- Proposer B creates their own slate, with this `shortRecord` as their first proposal. This `shortRecord` is now "fully proposed with `ercDebt` of 0
- Proposer A is correctly disputed and this `shortRecord` is removed from their slate. The `ercDebt` is now $2500
- Proposer B's first proposer is now technically "partially proposed" with `ercDebt` of $2500

### Constraints

- There can only be one proposal at a time per user
- Proposers need to escrow their dUSD: enough `ercEscrowed` to cover the `redemptionAmount`
- Proposers need a minimum amount: `redemptionAmount` needs to be at least `minShortErc`
- The list of `shortRecords` needs to have an debt amount of at least `minShortErc`
- Any partially redeemed `shortRecords` must have a debt amount of at least`minShortErc` after redemption
- Proposers needs to have enough `ethEscrowed` to cover the `redemptionFee`
- `shortRecords` that are invalid to be proposed:
  - if it's not sorted
  - if it's greater than the max allowable CR
  - if it's already closed
  - if it's already redeemed on (`ercDebt` is 0)
  - if it's the user's ShortRecord

### Fees

The only fee for proposals are `redemptionFees`. This is another concept borrowed from Liquity where fees are implemented to throttle the rate of redemptions. `redemptionFees` increases based on the amount of debt being proposed and decreases based on the time elapsed between proposals.

A proposer can input their preferred `maxRedemptionFee`. The proposal reverts if `redemptionFee` exceeds the user's `maxRedemptionFee`, protecting them from unexpected costs.

### Time to Dispute

`timeToDispute` allows users to dispute any invalid proposals for a reward. It is based on the `shortRecord` with the highest CR in the proposal slates. The higher the CR, the longer the `timeToDispute`. The longer wait increases the chance for disputers to find any invalid proposals. Disputes are not permitted once `timeToDispute` ends.

## Disputing a Redemption

A disputer can provide a single `shortRecord` with a CR lower than a `shortRecord` in the proposal. If valid, it will remove all `shortRecord`s that were invalid (not correctly sorted), and applies a penalty based on difference in incorrect debt. The disputer is rewarded by receiving this penalty, which effectively is paid by the proposer.

### Constraints

- Cannot dispute yourself
- Cannot dispute if the redeemer has no proposal
- Cannot dispute with any ShortRecord already in the proposal itself
- Can only dispute with another ShortRecord that
  - has a CR lower than the target ShortRecord
  - has a `updatedAt` time earlier than the time that the proposal was created (there is also a buffer in case the proposal takes time to transaction and to prevent front-running a proposal with a newly created ShortRecord that has a CR lower than a proposal that the proposer didn't know about)

## Claiming a Redemption

After a redeemer's `timeToDispute` has elapsed, they can claim the ETH earned from the redemption. After claiming the ETH, the redeemer's `AssetUSer.SSTORE2Pointer` is deleted, which allows the redeemer to propose new `shortRecords` again.

When a redeemer calls `claimRedemption`, all of the valid `shortRecords` in the slate are closed out and their remaining collateral is given back to the shorter. Closing out the `shortRecord` allows the shorter to re-use that `shortRecord` in the future.

> NOTE:`shortRecords` that have been already claimed by shorters via `cliamRemaingCollateral` will skipped in this function call.

### Constraints

- Cannot claim if redeemer has no active proposal
- Cannot claim if `timeToDispute` has not elapsed

## Claiming Remaining Collateral

`claimRemainingCollateral` is an extra function that allows shorters who have been redeemed against to claim their remaining collateral and close out the `shortRecord` that was redeemed in the case where a redeemer fails to call `claimRedemption`. This function requires the shorter to pass in the redeemer's address and the correct index of the `shortRecord` in the redeemer's slate. If verified, the shorter's `shortRecord` is closed and the remaining collateral is given back to the shorter.

> NOTE: If a redeemer has already called `claimRedemption`, their `AssetUSer.SSTORE2Pointer` is deleted. This prevents verification and thus prevents a shorter from claiming their remaining collateral multiple times.

---

## Technical

### Proposal Storage

[`SSTORE2`](https://github.com/transmissions11/solmate/blob/main/src/utils/SSTORE2.sol) is used (specifically `solmate`) to save proposals when `proposeRedemption` is run in a gas-efficient way rather than the usual way of saving data. Unlike the rest of the protocol, this implementation is uniquely suited to take advantage of it because a proposal is immutable (and thus doesn't need to be changed). Given each user can only propose once, Ditto can save the resulting `address` of saving all the proposal data in `SSTORE2`, making it cheaper to both read/write rather than saving each ShortRecord in storage.

See [0xsequence/sstore2](https://github.com/0xsequence/sstore2?tab=readme-ov-file#gas-savings) for more details on gas savings, taking advantage of different scalings of gas cost for contract creation (using contracts themselves as storage). In particular, once the system needs to read/write 32 bytes, it's more efficient to use `SSTORE2` than SSTORE.

Since the interface to write data is `SSTORE.write(bytes memory data)`, proposeRedemption creates the bytes version of each valid ShortRecord by concating all the data into `bytes`. To get back the `ShortRecord[]`, Ditto can read each bytes in a loop since each property is a fixed bytes. Some light use of assembly is used to make writing/reading more gas efficient.

Rather than updating the SSTORE value during proposal and dispute, the system saves and update the last index of the array that SSTORE2 points to. This index is saved in `AssetUser.slateLength`. Upon proposal, the `AssetUser.slateLength` is set to the length of the proposal slate, which has datatype of `MTypes.ProposalInput[]`. If successfully disputed, then the `AssetUser.slateLength` is decreased (Or in the case where the entire thing is incorrect, the entire `AssetUSer.SSTORE2Pointer` is deleted). This is an additional gas saving technique.
