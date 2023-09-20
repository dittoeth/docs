# Miscellaneous

Technical concepts that don't readily fit into any other category and/or temporary staging place for ideas to be placed in another section later

## shortRecord Id DOS Protection

`shortRecordIdCounter` is a uint8 (max 255) for struct packing/gas saving purposes but can overflow relatively easily. A malicious actor can create the max number of shortRecords and prevent matching by flooding the orderbook with short orders that overflow `shortRecordIdCounter` upon creation of the next `shortRecord`.

To counteract this behavior the `shortRecord` in position 254 is modified/blended anytime a new `shortRecord` would have been created with a `shortRecordIdCounter` greater than 254. Usage is restricted to 254 (as opposed to 255) for the following reasons:

1. Position 255 can be used as a flag and `shortRecordIdCounter` can completely stay within uint8. This avoids needing to use uint16 in memory which can introduce new errors. In other words, instead of having to check `uint16 id < 256` the smaller check `uint8 id < 255` is used because the last position 255 is sacrificed.
2. Within the function `createShortRecord()` in LibShortRecord.sol if 255 is a valid `shortRecordIdCounter` then the function would need to add checks for if `shortRecord` 255 is being created for the first time or simply being modified. When position 255 is instead only used as a flag, the function automatically knows that the `shortRecord` in position 254 is already created and can call `fillShortRecord()` appropriately.

The design choice to always modify the `shortRecord` in position 254 (as opposed to whatever is next to HEAD) reduces the complexity and gas costs associated with `setShortRecordIds()` function in LibShortRecord.sol. If any `shortRecord` in the position of `HEAD.nextId` can be filled by overflow `shortOrders` then every `shortRecord` can potentially be modified by multiple `shortOrders.` To prevent this, only the `shortRecord` in position 254 is modifiable by multiple `shortOrders`. This way the function `setShortRecordIds()` can operate under the simple assumption that (for every `shortRecordIdCounter` besides id 254) only one `shortOrder` points to one `shortRecord`. To account for the special treatment of `shortRecordIdCounter` 254 the natural re-use of `shortRecordIdCounter` 254 is prohibited even after it has been closed, eliminating the need to implement extra logic regarding `prevId/nextId` specifically for `shortRecordIdCounter` 254. Additionally, reserving position 254 allows a user to always know where "overflow" `shortOrders` will be filled.

Note that the max number of distinct shortRecords per address is 253 (254 - SHORT_STARTING_ID + 1).

## Combine flagged shortRecords

There are no flag restrictions on `combineShorts()` but if there is a flag on any of the `shortRecords`, the resulting c-ratio must be high enough to remove the flag. The purpose is to prevent a user from prematurely removing a flag from a `shortRecord` by combining it with another non-flagged `shortRecord`.

However, if a `shortRecord` is eligible to be flagged but hasn't been, there are no c-ratio requirements for the resulting `shortRecord` for these reasons:

1. Many low CR `shortRecords` vs 1 doesn't make a difference to the health of the system
2. Having fewer low CR `shortRecords` is actually better and easier to manage/liquidate
3. A user might want to increase the collateral for all of their flaggable `shortRecords` at once (after combining)

## Note about Ditto rates

The amount of ditto tokens minted in a given time period is virtually guaranteed be less than the total amount of ditto tokens available to mint for these reasons:

1. Less than 100% of users will mint their tokens because they are waiting to accrue more tokens before minting, forgetfulness, loss of private key, etc.
2. Anytime `disburseCollateral()` is called (through liquidation, exit, decrease, etc.) yield earned by the collateral in the `shortRecord` is distributed to the owner, but the user loses any claim to the proportional ditto token rewards from that dETH yield.
3. Ditto token rewards for shorters are reduced at CR above the CR derived from `initialCR`.

## updateYield protection

One potential drawback to using DittoETH is infrequent yield rate updates. Yield earned from LST is only realized within the system when `updateYield()` is called. When enough yield has accrued it is possible for a user to enter the system and create a large `shortRecord` position in order to earn a disproportionate amount of yield compared to the small amount of time spent within the system. This is mitigated in three ways:

1. Preventing yield distributions to newly created/modified `shortRecords` by use of `ShortRecord.updatedAt`. This primarily protects against flash loans.
2. When calling `increaseCollateral()` the constant `CRATIO_MAX` is checked to prevent collateral stuffing.
3. Forcing yield updates when large amounts of ETH are deposited into any of the bridges. While this doesn't eliminate the risk of a user creating multiple smaller deposits under the established thresholds, it does add complexity and cost to a potential abuser. The thresholds include `BRIDGE_YIELD_UPDATE_THRESHOLD` - where the `updateYield()` call only happens once DittoETH has reached a certain level of maturity (ie. 1000 ether) based on `dethTotal` - and `BRIDGE_YIELD_PERCENT_THRESHOLD` which defines a large deposit as a certain % of `dethTotal` in a `Vault.`

> **Note**: It's possible for `dethYieldRate` (uint80) to overflow at 1.2M x LST rewards per unit of `dethCollateral`. At expected steady state volume this should not be a problem, although in the incipient stages of release where there is very little `dethCollateral` it is possible to "use up" a large portion of `dethYieldRate`. However, this may also be unlikely as LST rewards will also be very small soon after release.

## Orderbook Dust

Two concepts of "dust" exist within the orderbook.

The first is a minimum order amount which is the smallest amount of ETH that must be contained in any order type in order to be sent or added to the orderbook. There is a `minAskEth` and a `minBidEth` as well as a `minShortErc`. These minimums are necessary to reduce the gas costs of matching against a bunch of smaller order amounts or unnecessary spam orders. These values are also checked against previous orders that have already been placed on the orderbook and are being partially matched. However, the restriction is relaxed by `Constants.DUST_FACTOR` so that limit orders are guaranteed to match at least some significant portion of the original requested amount. Otherwise, limit orders even 1 wei beneath `minAskEth` or `minBidEth` would be unfairly removed.

The second is slightly more complicated and only arises after partial matches of an incoming order. An incoming order may satisfy the minimum requirements but after a partial match can have a small amount of `ercAmount` left. In this case when `ercAmount * price` rounds down to 0 `ethFilled` will be propagated through the algorithms in `LibOrders.sol` and `BidOrdersFacet.sol` as 0 and can cause unintended consequences, especially for parts of the code that rely on the assumption that `ethFilled > 0.` For this reason, any remaining dust amounts defined as `ercAmount * price == 0` (less than 1 wei) are removed from the orderbook.

## Small shortRecords

One potential issue for the system is the existence of small `shortRecords` with unhealthy CR that are unattractive to liquidators because of small fee payouts. To mitigate this scenario, the following features discourage and/or prevent holding a `shortRecord` with small amounts of collateral:

- `minShortErc` and `minAskEth` on order creation
- `exitShort()` partial must leave at least `minBidEth` collateral (since primary liquidation uses `createForcedBid()`)
- `decreaseCollateral()` must leave at least `minBidEth` collateral (coming soon)
- `distributeYield()` checks `minBidEth` collateral and prevents collection of yield while under the threshold. However, yield still accrues and is accessible once collateral >= `minBidEth` so that holders of `PartialFill` SR are not punished (coming soon)

> **Note**: `minBidEth` is used because holders of `shortRecords` could fall below `minShortErc` when the price of ETH rises relative to the underlying asset and honest users reallocate capital.
