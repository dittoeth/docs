# Orderbook

The system mints pegged assets (stablecoins) using an orderbook, using over-collateralized staked ETH.

## Orders

The system is a central limit orderbook, with the addition of the Limit Short order type. Orders specify a price (ETH) and an amount. Market orders don't remain on the OB if there is no match.

- Limit Bid + Market Bid (`createBid()`)
- Limit Ask + Market Ask (`createAsk()`)
- Limit Short (no Market Short) (`createLimitShort()`)

> **Note**: Orders have a minimum ETH amount (`price * amount`): `if (eth < MIN_ETH) revert Errors.OrderUnderMinimumSize()`. This prevents small orders from clogging up the Orderbook.

This minimum check is done for incoming Orders as well as existing ones, so new orders cannot be smaller than a certain amount, and matched limit orders are removed from the OB if the remaining amount is too small.

### Order Struct

To keep gas down, struct packing is employed. `Order` is 2 slots.

- `ercAmount`: `uint88` is a max of 300m. Don't expect orders higher than this. Can also just make multiple orders instead.
- `price`: `uint80` is max of 1.2m. This would be the price of the asset in terms of ETH, so it's reasonable to expect an order to never pass anything higher.
- `id`, `prevId`, `nextId`: Order id uses `uint16` (65536). Because order ids are reuseable, it's not expected to have that many on the orderbook at once without matching.
- `orderType`: The Order type as of most the recent action.
- `prevOrderType`: The Order type before the most recent action. (Example: Re-using a matched id for a LimitBid shows the `orderType` is LimitBid, while the `prevOrderType` is Matched; likewise for a previously Cancelled Order).
- `initialMargin` (Short): Over-collateralization requirement for shorts.
- `shortRecordId` (Short): Corresponding `shortRecord` id if the Short order isn't fully matched (it overwrites the same `shortRecord` position rather than create a new one)
- `addr`: The user's address.
- `creationTime`: Timestamp of when an order is created in seconds.

```solidity
// 2 slots
struct Order {
    // SLOT 1: 88 + 80 + 16 + 16 + 16 + 8 + 8 + 16 + 8 = 256
    uint88 ercAmount; // max 300m erc
    uint80 price; // max 1.2m eth
    // max orders 65k, with id re-use
    uint16 prevId;
    uint16 id;
    uint16 nextId;
    O orderType;
    O prevOrderType;
    // @dev storing as 500 with 2 decimals -> 5.00 ether
    uint16 initialMargin; // @dev only used for LimitShort
    uint8 shortRecordId; // @dev only used for LimitShort
    // SLOT 2: 160 + 32 = 192 (64 unused)
    address addr; // 160
    // @dev diff against contract creation timestamp to prevent overflow in 2106
    uint32 creationTime; // seconds
    uint64 filler;
}
```

## Short Orders

The system's "sell" side also includes shorters.

When a bid and short `Order` match, it will create/modify a debt position called a `shortRecord`. This idea is similar to a Collateral Debt Position (CDP) in MakerDAO or Trove in Liquity.

The difference is that the shorter doesn't gain the stable asset, rather the bidder gains it. However, the shorter does get the bidder's collateral as a part of their shorter position, and thus the yield since the collateral is staked.

| User    | Brings               | Receives      | Claim to Yield |
| ------- | -------------------- | ------------- | -------------- |
| Bidder  | zETH                 | stable asset  | None           |
| Shorter | zETH x initialMargin | `shortRecord` | Yes            |

Notes:

- The bidder doesn't receive the stable asset in the wallet until they withdraw, it's virtually accounted for to save gas if they make multiple trades before they want to withdraw.
- The shorter provides a multiplied amount of zETH because the position needs to be over-collateralized, starting from a limit set by the system.
- The shorter doesn't receive any stable asset. They get a debt position that receives the yield from their collateral, which also includes the bidder's portion.

The collateral used in both the bid and short order is combined to virtually "mint" an asset (the stable asset isn't actually minted until the user withdraws to save on gas). In the case of USD, it would mint a pegged asset to USD.

- `1 CR = 100% collateral ratio`, meaning the `shortRecord` is fully collateralized at a given oracle price.

```
            collateral
CR = -----------------------
     debt * getOraclePrice()
```

- Short orders are required to be over-collateralized (above 1 CR), unlike a bid or short. The minimum ratio that is required for a short Order is at least `initialMargin`, which is saved to each `Order`. (ex: `if (ethEscrowed < shortEth * initialMargin) revert`).
- The system allows the shorter to specify the CR so that it fits between `initialMargin < CR < MAX CR`.

> **Note**: Short orders can be made at any limit price, but `shortRecords` are to be created at or above oracle price due to the constraint that assets should be minted at or above oracle price.

In the example below, assume the current oracle price is **10.5**. Bids are sorted from highest to lowest in price and asks are sorted lowest to highest. The shorts under 10 aren't matched against bids even though the highest bid is 10. This is because shorts can't be matched below the oracle price of 10.5. This nuance is specific for shorts. If instead a new ask comes in below 10, it would be matched like normal.

| Bids | Asks | Shorts |
| ---- | ---- | ------ |
| 10   | 13   | 12     |
| 9    | 12   | 11     |
| 8    | 11   | --9--  |
| 7    | 11   | 8      |
| 6    | 10.6 | 7      |

> **Note**: When there is an incoming bid, the system prioritizes limit asks over limit shorts. If there are asks and shorts of the same price, the bid will match with the ask first.

### Multiple ShortRecords

Other systems have one 1 CDP, Vault, or Trove per address. Because of the orderbook model, multiple `shortRecord` positions are allowed. This can be useful if you want the flexibility of multiple positions, but also makes it difficult to manage if you don't want to track each CR.

> The `combineShorts` function allows you to specify which of your shorts you want to combine. It will merge positions by weighting each position.

## Shorter Yield

Shorters have an incentive to match on the Orderbook because while the bidder gets the minted asset (USD), the shorter gets the bidder's collateral, thus it's portion of staking yield.

Example:

- Setup: `ETH/USD` is `$2000`, so `USD/ETH` is `0.0005`. `initialMargin = 5`.
- Bidder places a bid order of $1 at price 0.0005 eth.
- Shorter places a short order at the same parameters (but they must a multiple of `initialMargin` zETH).
- When they match, the bidder gets $1 of cUSD. The shorter gets a `shortRecord` position worth `price * amount * (initialMargin + 1)` of collateral which is `0.0005 * 1 * (5 + 1) = 0.003 zETH`.

The `+1` is what gives the shorter extra yield for matching against a bid order, which results in `1 / initialMargin` extra yield.

If `initialMargin` is 5, shorters are providing 5x as much zETH as the bidder (1x zETH). Thus a shorter is getting 6x yield vs 5x on their own, which is `1/5` or `20%` more.

## shortRecord

`shortRecord` is also 2 slots.

- `collateral`: `uint88` is a max of 300m. collateral is denominated in ETH.
- `ercDebt`: `uint88` to match `Order.ercAmount`.
- `status: `uint8` enum to show whether a short is partially filled (meaning there is still a corresponding short order that isn't completely filled on the orderbook), filled, or closed.
- `id`, `prevId`, `nextId`: id, uses `uint8` (255). Similar to order id but because this is per address, doesn't need to be so large.
- `zethYieldRate`: `uint80` is a max of 1.2m. Tracks the current yield rate for this `shortRecord`, which is updated with `distributeYield`.
- `ercDebtRate`: `uint64` is a max of 18x. Tracks if a penalty needs to be applied across all `shortRecords` if the system isn't able to handle the debt.
- `tokenId`: `uint40` is a max of 1T (no decimals since it's a count). Used to track which NFT a `shortRecord` corresponds with.
- `flaggerId`: `uint24` is a max of 16m. Instead of saving the flagger address, an id is used to look up the address.
- `updatedAt`: `uint24` holds hours. This just tracks the last time a `shortRecord` was modified (created, increaseCollateral, etc), which is used to deal with getting yield via flash loan.

```solidity
// 2 slots
// @dev zethYieldRate should match Vault
struct ShortRecord {
    // SLOT 1: 88 + 88 + 8 + 8 + 8 + 8 = 208 (48 remaining)
    uint88 collateral; // price * ercAmount * initialMargin
    uint88 ercDebt; // same as Order.ercAmount
    SR status;
    uint8 prevId;
    uint8 id;
    uint8 nextId;
    // SLOT 2: 80 + 64 + 40 + 24 + 24 = 224 (24 remaining)
    uint80 zethYieldRate;
    uint64 ercDebtRate; // socialized penalty rate
    uint40 tokenId; //As of 2023, Ethereum had ~2B total tx. Uint40 max value is 1T, which is more than enough
    uint24 flaggerId;
    uint24 updatedAt; // hours
}
```

> **Note**: Not only is `updatedAt` used to reflect when a `shortRecord` is created/updated, but also it is used to determine whether a shorter can receive yield and if a short can be liquidated.

A `shortRecord` saves the debt position a shorter creates when a short `Order` is matched. So a matched short `Order` will create a `shortRecord`.

> **Note**: Unlike other systems, each user can have multiple `shortRecords` tracked in a mapping.

```solidity
mapping(
  address asset
    => mapping(address account => mapping(uint16 id => DataTypes.ShortRecord))
  ) shortRecords;
```

The `shortRecord` saves the amount of debt the user owes in `ercDebt`, as well as the current `collateral`.

Short functions:

- `increaseCollateral()`: add more to the position by taking from your `ethEscrowed`.
- `decreaseCollateral()`: remove collateral from position, which increases your `ethEscrowed`.
- `combineShorts()`: uses a weighted average to combine multiple `ShortRecords` into one, as it's easier to manage fewer positions. Having fewer positions lowers the gas costs of getting yield, which loops over each `shortRecord`.
- `exitShort()`: a user can decrease their `ercDebt`, and potentially leave the position entirely to get back the underlying collateral.

### Events

Events are emitted when a `shortRecord` is created and removed to track the list of addresses that should be liquidatable.

- `ShortRecordCreated` when a `shortRecord` by a user is created at index i.
- `ShortRecordDeleted` when a `shortRecord` by a user is deleted at index i.

These events can be used by an indexer service to determine a list of shorters and thus a list of `shortRecords` that are margin callable. There should be a query that gives back a sorted list of positions by CR, from lowest to highest. This could be used by a front-end to margin call positions or by bots.

## Ordered Linked List

For this limit orderbook, a `mapping` is used to represent a doubly-linked list with a HEAD:

`mapping(address asset => mapping(uint16 id => DataTypes.Order))`

The `DataTypes.Order` struct contains a `prevId` and `nextId` to maintain the link between orders. This makes it possible to cancel/match orders (`cancelBid()`,`cancelAsk()`,`cancelShort()`) and sort them by price. Using `prevId`and `nextId` also allows the recycling of order ids that have been previously cancelled/matched. By linking the cancelled/matched order struct to the HEAD of the linked list, a queue of re-usable order ids (that are currently inactive) is stored. This provides substantial gas savings by avoiding re-initializing a new Order struct each time a new order is made. See below in section (Re-using Orders).

The system uses the `Constants.HEAD` id as the starting point to iterate through the orders. To iterate through the orders, you can start at `HEAD` and get `id.nextId` until `id` is back at `TAIL`.

> **Note**: `TAIL` and `HEAD` are both constants with the value of 1. The difference in nomenclature is simply for readability.

Since matching multiple orders requires more gas than matching one order of the same amount, the system also requires a minimum ETH amount to be used in a new order. This way, the orderbook isn't filled with super low order amounts. If an incoming limit order is matched and has a leftover amount, the remaining won't be placed on the orderbook if it is under the same minimum ETH amount.

## Order Hints

Since the linked list of orders needs to be sorted, inserting a new limit order can be expensive. The contract needs to loop to find the right place to add an order starting from `HEAD`. The farther away the order's price is from `HEAD`, the more gas is required. This means doing an `SLOAD` on each order until the incoming order finds its proper place.

A `hintId` is used to lower gas costs by providing the contract the place in the list that a new limit order is supposed to be in. The contract verifies that the incoming order is correct, which is done by checking that the incoming order price is in between the hint price and the next price.

- for a ask or short: `hintOrder.price >= order.price >= nextOrder.price`
- for a bid: `hintOrder.price <= order.price <= nextOrder.price`

> This verification also checks against a user providing an invalid hint like a non-existent order, or an order that is cancelled/matched via `findOrderHintId()`.

The `hintId` will be exact if the orderbook doesn't change between the snapshot in time when an order is placed by a user and when it's executed. But it's possible the orderbook will have changed depending on how much a user pays in gas, MEV, etc.

`HEAD <-> ..NEWLY_CREATED_ORDERS.. <-> HINT_ID <-> ..NEWLY_CREATED_ORDERS..`

A `hintId` could turn out to be offset/incorrect in a few ways:

- if the `hintId` is wrong but the hint order itself wasn't re-used as orders were added in-between the hint and the incoming order.
  - Loop from `hintId`.
- if the `hintId` was cancelled and re-used.
  - There might not be a reasonable `id` to guess to start looping from. By providing multiple hints instead of just one, the other hints can be used for verification.
- if the `hintId` was matched and re-used.
  - It's likely that the incoming order would also be matched, or at least be placed close to the start of `HEAD`. Loop from the first order.

The system checks whether the hint was cancelled/matched and re-used by checking the creationTime of the order. If the creationTime in actuality is different than the creationTime provided, then it implies the order was re-used.

## Matching Bids to Shorts

Because the system allows for short orders to be _placed_ under the oracle price, but not "matched", this system can behave differently than a normal orderbook. Usually an orderbook loops through its orders starting from the start of the Linked List (namely `HEAD`). But, in this case it would need to start from the first short order that is at or above oracle price, `startingShortId`.

This becomes an issue when the oracle price changes, given the cost of looping through orders to find where to start matching. To solve for this, another hint specific to shorts (`shortHintId`) is incorporated to determine where to start matching shorts based on the current oracle price.

Because the oracle price can change to be anything, the `startingShortId` is dynamic and changes according to that oracle price. There isn't a guaranteed way for a call to provide an exact hint of where the starting short would be because it wouldn't have access to a price not determined yet. Instead, some leeway is allowed by checking that the provided `startingShortId` price is within 1% of the actual oracle price at that moment. If it's below the oracle price, or over 1% of the oracle price, the transaction will fail.

> This is very different from a normal orderbook since that always matches from `HEAD`.

If `startingShortId` is valid within that range but is not exact, the orderbook will match _downwards_ until it hits the true `startingShortId`. Once it hits that, the system will match back _upwards_ and will behave like a normal orderbook again. This is to allow the next order to set the new oracle price within some reasonable range of values when the oracle price needs to change (freshness).

The issue is that an order can stay in the mempool for an indeterminable period of time. As a result, the state of the orderbook could be completely different from when the transaction was made, like a snapshot in time.

A bidder has an incentive to pass in a lower price oracle hint, so they can match at a lower price. Since the matching algorithm prioritizes limit asks over shorts, the incoming bid will match against all ask orders under the `startingShortId` price before going to the shorts.

Example using prices:

Short orders linked list

```sh
   id: HEAD    1         2           3          4          5
price:  N/A  $1000 .. $1000.5 .. $1009.999 .. $1010 .. $1010.001
```

Scenario: the oracle price is actually `$1000`, and the `startingShortId` is supposed to be `id == 1`. A user can pass in a different `startingShortId`, such as `id == 2`, because the price of that order ($1000.5) is within +1.0% of $1000 (basically between $1000-$1010). This means `id == 3` or `id == 4` is also a valid hint, but `id == 5` wouldn't be.

If `id == 4`, then assuming the order was large enough, it would attempt to match down from 4 until it hits `id == 1`. If it doesn't finish and the oracle is still the same, the next order would continue to match downward until it hits the correct `startingShortId` of `id == 1`, and then continue to match upward as normal until the order is completely filled.

## Re-using Orders

> Context: [EIP-2929: Gas cost increases for state access opcodes](https://eips.ethereum.org/EIPS/eip-2929) and [EIP-3529: Reduction in refunds](https://eips.ethereum.org/EIPS/eip-3529). Refunds were used before to incentivize clearing storage, but the use of gas tokens lead to EIP-3529. State expiry is a new proposal to handle storage bloat.

- A zero to non-zero `SSTORE` costs 20k + 2100 per slot.
- A non-zero to non-zero `SSTORE` costs 5k per slot. Re-using an order means modifying the order, so it would cost 10k.

The OrderBook normally goes from `HEAD <-> ... id .. <-> TAIL`.

- `->` represents `id.nextId`
- `<-` represents `id.prevId`
- `<->` represents both directions

In the scenario where `ID` is an order that is cancelled/matched, the link between PREV (`id.prevId`) and NEXT (`id.nextId`) is set.

```solidity
BEFORE: HEAD <- > .. <- HEAD <-> .. PREV <-> ID <-> NEXT
 AFTER: HEAD <- > .. <- HEAD <-> .. PREV <--------> NEXT
```

`ID` itself can be deleted, but there could be a benefit to re-using old storage slots if possible. In the case of this kind of linked list, re-using old orders can make the creation of new ones cheaper.

`HEAD.prevId` is unused, and just points to `HEAD`. When an `Order` is either cancelled/matched, it's moved on the side of `HEAD.prevId` rather than being deleted.

> The area to the left of HEAD is untouched by the matching algorithm, making it an ideal place to store this data

This just requires a few extra operations on match.

- `id.prevId = HEAD.prevId; // 5k`
- `HEAD.prevId = id; // 5k`
- `id.order = CANCELLED; // 5k`

This will cost `15k` gas to set each cancel/match, as opposed to deleting the order.

In the example below, ID1 and ID2 are cancelled/matched sequentially. The most recent cancelled/matched ID is placed immediately before HEAD and any prior IDs get pushed back towards the left.

```solidity
BEFORE: HEAD <------------------- HEAD <-> (ID1) <-> (ID2) <-> (ID3) <-> NEXT <-> TAIL
AFTER1: HEAD <- [ID1] <---------- HEAD <-----------> (ID2) <-> (ID3) <-> NEXT <-> TAIL
AFTER2: HEAD <- [ID1] <- [ID2] <- HEAD <---------------------> (ID3) <-> NEXT <-> TAIL
```

When a new order comes in, check that `HEAD.prevId != HEAD`. If true, it means the new order can use it, otherwise it should make a new order.

Continuing the example above, a new order would re-use the last cancelled/matched ID, which is ID2.

```solidity
BEFORE: HEAD <- [ID1] <- [ID2] <- HEAD <---------------------> (ID3) <-----------> NEXT <-> TAIL
AFTER1: HEAD <- [ID1] <---------- HEAD <---------------------> (ID3) <-> (ID2) <-> NEXT <-> TAIL
```

Normally a new order id is generated for a new order. Id is a uint16, giving a maximum capacity of ~65,000. That value should never be hit if ids are re-used. It is also the case that the greater the depth that the orderbook is able to grow, the more orders that can be re-used in the future.

In summary, the gas savings from re-using ids (if an order is 2 slots) are as follows:

- it's `20k + 20k = 40k` for a new order.
- it's `5k + 5k = 10k` for a reused order.
- This should save `40k - 10k = 30k` on all new orders over time.

## Cancelling Spam Orders

While re-using ids greatly reduces the chance of hitting the ~65,000 limit, there is always a risk of adversarial attack that attempts to prevent market operations. Specifically, attackers might try to spam the network with small orders. To mitigate this completely, the system allows for anybody to cancel the last order in a given orderbook via `cancelOrderFarFromOracle()`. The DAO can also call this function, to an even greater effect.

To prevent anybody from abusing this ability, there are heavy restrictions in place:

1. This can only be called when the order id > 65,000. Rational market participants are expected to place orders that have reasonable likelihood to be matched, so it is unlikely that order ids ever reach this level.
2. The DAO cannot cancel more than 1000 orders.
3. Non-DAO users can only cancel the last order.

Given the restrictions, it is unlikely that this function is ever called. However, its existence will effectively deter attackers from attempting to spam the network. Combined with the fact that each order requires a minimum ETH amount, it will be uneconomical for an attacker.
