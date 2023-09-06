# Orderbook

The system mints pegged assets (stablecoins) using an orderbook, using over-collateralized staked ETH.

## Orders

The system is a central limit orderbook, with the addition of Limit Short order type. Orders take in a price (ETH) and an amount. Market orders don't place an order on the OB if there is no match.

- Limit Bid + Market Bid (`createBid()`)
- Limit Ask + Market Ask (`createAsk()`)
- Limit Short (no Market Short) (`createLimitShort()`)

> **Note**: Orders have a minimum ETH amount (`price * amount`): `if (eth < MIN_ETH) revert Errors.OrderUnderMinimumSize()`. This prevents small orders from clogging up the Orderbook.

This minimum check is done for incoming Orders as well as existing ones, so new orders cannot be smaller than a certain amount, and matched limit orders won't be placed on the OB if the amount is too small.

### Order Struct

To keep gas down, we try to use struct packing where helpful. `Order` is 2 slots.

<!-- TODO: update struct -->

- `creationTime`: Timestamp of when an order is created in seconds.
- `id`, `prevId`, `nextId`: Order id, uses `uint16` (65536). Because we can re-use order ids, we don't expect to have that many on the orderbook at once without matching.
- `price`: `uint80` is max of 1.2m. This would be the price of the asset in terms of ETH, so it's reasonable to expect an order to never pass anything higher.
- `ercAmount`: `uint88` is a max of 300m. Don't expect orders higher than this. Can also just make multiple orders instead.
- `orderType`: The Order type as of most the recent action
- `prevOrderType`: The Order type before the most recent action. (Example: Re-using a matched id for a LimitBid shows the `orderType` is LimitBid, while the `prevOrderType` is Matched; likewise for a previously Cancelled Order)
- `initialMargin` (Short): How much more a Short needs to be over-collateralized.
- `shortRecordId` (Short): Corresponding `shortRecord` id if the Short order isn't fully matched (it overwrites the same `shortRecord` position rather than create a new one)

```solidity
struct Order {
    // SLOT 1: 160 + 16 + 16 + 16 + 8 + 8 + 8 + 8 = 240 (16 unused)
    address addr;
    uint16 prevId;
    uint16 id;
    uint16 nextId;
    O orderType;
    O prevOrderType;
    uint8 initialMargin; // @dev only used for LimitShort
    uint8 shortRecordId; // @dev only used for LimitShort
    // SLOT 2: 80 + 88 + 32 = 200 (56 unused)
    uint80 price;
    uint88 ercAmount;
    uint32 creationTime;
}
```

## Short Orders

The system's "sell" side also includes shorters.

When a bid and short `Order` match, it will create/modify a debt position called a `shortRecord`. This idea is similar to a Collateral Debt Position (CDP) in MakerDAO or Trove in Liquity.

The difference is that the shorter doesn't gain the ERC, but the bidder gains it. However, the shorter does get the bidder's collateral as a part of their shorter position, and thus the yield since the collateral is staked.

| User    | Brings               | Receives        | Claim to Yield |
| ------- | -------------------- | --------------- | -------------- |
| Bidder  | zETH                 | ERC asset       | None           |
| Shorter | zETH x initialMargin | "`shortRecord`" | Yes            |

Note:

- The bidder doesn't receive the ERC in the wallet until they withdraw, it's virtually accounted for to save gas if they make multiple trades before they want to withdraw.
- The shorter provides a multiplied amount of zETH because the position needs to be over-collateralized, starting from a limit set by the system.
- The shorter doesn't receive an asset. They get a debt position that receives the yield from their collateral, which also includes the bidder's portion.

The collateral used in both the bid and short order is combined to virtually "mint" an asset (in our case, the ERC isn't actually minted until the user withdraws to save on gas). In the case of USD, it would mint a pegged asset to USD.

- `1 CR = 100% collateral ratio`, meaning the `shortRecord` is fully collateralized at a given oracle price.

```
            collateral
CR = -----------------------
     debt * getOraclePrice()
```

- Short orders are required to be over-collateralized (above 1 CR), unlike a bid or short. The minimum ratio that is required for a short Order is at least `initialMargin`, which is saved to each `Order`. (ex: `if (ethEscrowed < shortEth * initialMargin) revert`)

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

Other systems have one 1 CDP, Vault, or Trove per address. Because of our orderbook, we allow multiple `shortRecord` positions. This can be useful if you want the flexibility of multiple positions, but also makes it difficult to manage if you don't want to track each ones CR.

> We have a `combineShort` function that allows you to specify which of your shorts you want to combine. It will merge positions by weighting each position.

## Shorter Yield

Shorters have an incentive to match on the Orderbook because while the bidder gets the minted asset (USD), the shorter gets the bidder's collateral, thus it's portion of staking yield.

Example:

- Setup: `ETH/USD` is `$2000`, so `USD/ETH` is `0.0005`. `initialMargin = 5`.
- Bidder places a bid order of $1 at price 0.0005 eth
- Shorter places a short order at the same parameters (but they must a multiple of `initialMargin` zETH).
- When they match, the bidder gets $1 of CUSD. The shorter gets a `shortRecord` position worth `price * amount * (initialMargin + 1)` of collateral which is `0.0005 * 1 * (5 + 1) = 0.003 zETH`.

The `+1` is what gives the shorter extra yield for matching against a bid order, which results in `1 / initialMargin` extra yield.

If `initialMargin` is 5, shorters are providing 5x as much zETH as the bidder (1x zETH). Thus a shorter is getting 6x yield vs 5x on their own, which is `1/5` or `20%` more.

## `shortRecord`

```solidity
struct ShortRecord {
  // SLOT 1: 8 + 8 + 8 + 64 + 80 + 88 = 256
  SR shortRecordType;
  uint8 prevId;
  uint8 nextId;
  uint64 ercDebtRate; // socialized penalty rate
  uint80 collateral; // price * ercAmount * initialMargin
  uint88 ercDebt;
  // SLOT 2: 160 + 24 + 72 = 256
  address flagger;
  uint24 updatedAt; // hours
  uint72 zethYieldRate;
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

- `increaseCollateral()`: add more to the position by taking from your `ethEscrowed`
- `decreaseCollateral()`: remove collateral from position, which increases your `ethEscrowed`
- `combineShorts()`: uses a weighted average to combine multiple `ShortRecords` into one, as it's easier to manage fewer positions. Having fewer positions lowers the gas costs of getting yield, which loops over each `shortRecord`.
- `exitShort()`: a user can decrease their `ercDebt`, and potentially leave the position entirely to get back the underlying collateral.

### Events

We emit events when a `shortRecord` is created and removed to track the list of addresses that should be liquidatable.

- `ShortRecordCreated` when a `shortRecord` by a user is created at index i
- `ShortRecordDeleted` when a `shortRecord` by a user is deleted at index i

These events can be used by an indexer service to determine a list of shorters and thus a list of `shortRecords` that are margin callable. There should be a query that gives back a sorted list of positions by CR, from lowest to highest. This could be used by a front-end to margin call positions or by bots.

## Ordered Linked List

For this limit orderbook, we use a `mapping` to represent a doubly-linked list with a HEAD.

`mapping(address asset => mapping(uint16 id => DataTypes.Order))`

The `DataTypes.Order` struct contains a `prevId` and `nextId` to maintain the link between orders. This makes it possible to cancel/match orders (`cancelBid()`,`cancelAsk()`,`cancelShort()`) and sort them by price. Using `prevId`and `nextId` also allows us to recycle order ids that have been previously cancelled/matched. By linking the cancelled/matched order struct to the HEAD of the linked list, we effectively store a queue of re-usable order ids that are currently inactive. This provides substantial gas savings as we do not need to re-initialize a new Order struct each time a new order is made. See below in section (Re-using Orders).

The system uses the `Constants.HEAD` id as the starting point to iterate through the orders. To iterate through the orders, you can start at `HEAD` and get `id.nextId` until `id` is back at `TAIL`.

> **Note**: `TAIL` and `HEAD` are both constants with the value of 1. The difference in nomenclature is simply for readability.

Since matching multiple orders requires more gas than matching one order of the same amount, the system also requires a minimum ETH amount to be used in a new order. This way, the orderbook isn't filled with super low order amounts. If an incoming limit order is matched and has an leftover amount, the remaining won't be placed on the orderbook if it is under the same minimum ETH amount.

## Order Hints

Since the linked list of orders needs to be sorted, inserting a new limit order can be expensive. The contract needs to loop to find the right place to add an order starting from `HEAD`. The farther away the order's price is from `HEAD`, the more gas is required. This means doing a `SLOAD` on each order until the incoming order finds its proper place.

A `hintId` is used to lower gas costs by providing the contract the place in the list that a new limit order is supposed to be in. The contract verifies that the incoming order is correct, which is done by checking that the incoming orders price is in between the hint price and the next price.

- for a ask or short: `hintOrder.price >= order.price >= nextOrder.price`
- for a bid: `hintOrder.price <= order.price <= nextOrder.price`

> This verification also checks against a user providing an invalid hint like a non-existent order, or an order that is cancelled/matched via `findOrderHintId()`.

The `hintId` will be exact if the orderbook doesn't change between the snapshot in time when an order is placed by a user and when it's executed. But it's possible the orderbook will have changed depending on how much a user pays in gas, MEV, etc.

`HEAD <-> ..NEWLY_CREATED_ORDERS.. <-> HINT_ID <-> ..NEWLY_CREATED_ORDERS..`

A `hintId` could turn out to be offset/incorrect in a few ways:

- if the `hintId` is wrong but the hint order itself wasn't re-used as orders were added in-between the hint and the incoming order.
  - Loop from `hintId`.
- if the `hintId` was cancelled and re-used.
  - There might not be a reasonable `id` to guess to start looping from. By providing multiple hints instead of just one, we can try verifying against each hint.
- if the `hintId` was matched and re-used.
  - It's likely that the incoming order would also be matched, or at least be placed close to the start of `HEAD`. Loop from the first order.

The system checks whether the hint was cancelled/matched and re-used by checking the creationTime of the order. If the creationTime in actuality is different than the creationTime provided, then it implies the order was re-used.

## Matching Bids to Shorts

Because the system allows for short orders to be _placed_ under the oracle price, but not "matched", our system can behave differently than a normal orderbook. Usually an orderbook loops through its orders starting from the start of the Linked List (namely `HEAD`). But, in this case it would need to start from the first short order that is at or above oracle price, `startingShortId`.

This becomes an issue when the oracle price changes, given the cost of looping through orders to find where to start matching. To solve for this, we incorporated another hint (`shortHintId`) to determine where to start matching short based on the current oracle price.

Because the oracle price can change to be anything, the `startingShortId` is dynamic and changes according to that oracle price. There isn't a guaranteed way for a call to provide an exact hint of where the starting short would be because it wouldn't have access to a price not determined yet. Instead, we allow some leeway by checking that the provided `startingShortId` price is within 1% of the actual oracle price at that moment. If it's below the oracle price, or over 1% of the oracle price, the transaction will fail.

> This is very different from a normal orderbook since it always matches from `HEAD`.

If `startingShortId` is valid within that range but is not exact, the orderbook will match _downwards_ until it hits the true `startingShortId`. Once it hits that, the system will match back _upwards_ and will behave like a normal orderbook again. We do this to allow the next order to set the new oracle price within some reasonable range of values when the oracle price needs to change (freshness).

The issue is that an order can stay in the mempool for an indeterminable period of time. As a result, the state of the orderbook could be completely different from when the transaction was made, like a snapshot in time.

A bidder has an incentive to pass in a lower price oracle hint, so they can match at a lower price. Since our matching algorithm prioritizes limit asks over shorts, the incoming bid will match against all ask orders under the `startingShortId` price before going to the shorts.

Example using prices:

Short orders linked list

```sh
   id: HEAD    1       2             3          4     5
price:  N/A  $1000 .. $1000.5 .. $1004.999 .. $1005 $1006
```

Scenario: the oracle price is actually `$1000`, and the `startingShortId` is supposed to be `id == 1`. We allow a user to pass in a different `startingShortId`, such as `id == 2`, because the price of that order ($1000.5) is within +0.5% of $1000 (basically between $1000-$1005). This means `id == 3` or `id == 4` is also a valid hint, but `id == 5` wouldn't be.

If `id == 4`, then assuming the order was large enough, it would attempt to match down from 4 until it hits `id == 1`. If it doesn't finish and the oracle is still the same, the next order would continue to match downward until it hits the correct `startingShortId` of `id == 1`, and then continue to match upward as normal until the order is completely filled.

## Re-using Orders

> Context: [EIP-2929: Gas cost increases for state access opcodes](https://eips.ethereum.org/EIPS/eip-2929) and [EIP-3529: Reduction in refunds](https://eips.ethereum.org/EIPS/eip-3529). Refunds were used before to incentivize clearing storage, but the use of gas tokens lead to EIP-3529. State expiry is a new proposal to handle storage bloat.

- A zero to non-zero `SSTORE` costs 20k + 2100 per slot.
- A non-zero to non-zero `SSTORE` costs 5k per slot. Re-using an order means modifying the order, so it would cost 10k.

The OrderBook normally goes from `HEAD <-> ... id .. <-> TAIL`.

- `->` represents `id.nextId`
- `<-` represents `id.prevId`
- `<->` represents both directions

In the scenario where `ID` is a order that is cancelled/matched, the link between PREV (`id.prevId`) and NEXT (`id.nextId`) is set.

```solidity
BEFORE: HEAD <- >.. <- HEAD <-> .. PREV <-> ID <-> NEXT
 AFTER: HEAD <- >.. <- HEAD <-> .. PREV <--------> NEXT
```

`ID` itself can be deleted, but there could be a benefit to re-using old storage slots if possible. In the case of this kind of linked list, we can think about re-using old orders to make the creation of new ones cheaper.

`HEAD.prevId` is unused, and just points to `HEAD`. When an `Order` is either cancelled/matched, we can move it on the side of `HEAD.prevId` rather than delete it.

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

Normally, a new order id is generated for a new order. Since id is a uint16, we have a maximum value of ~65,000. We aim to never hit that value, thereby reducing overflow errors, by re-using the ids. It is also the case that the greater the depth that the orderbook is able to grow, the more orders that can be re-used in the future.

In summary, the gas savings from re-using ids (if an order is 2 slots) are as follows:

- it's `20k + 20k = 40k` for a new order.
- it's `5k + 5k = 10k` for a reused order.
- This should save `40k - 10k = 30k` on all new orders over time.

## Cancelling Spam Orders

While re-using ids greatly reduces the chance of hitting the ~65,000 limit, there is always a risk of adversarial attack that attempts to prevent market operations. Specifically, attackers might try to spam the network with small orders. To mitigate this completely, the system allows for anybody to cancel the last order in a given orderbook via `cancelOrderFarFromOracle()`. The DAO can also call this function, to an even greater effect.

To prevent anybody from abusing this ability, there are heavy restrictions in place:

1. This can only be called when the order id > 65,000. Since we expect normal market participants to place orders that have reasonable likelihood to be matched, it is unlikely that order id's ever reach this level.
2. The DAO cannot cancel more than 1000 orders
3. Non-DAO users can only the last orders can be cancelled

Given the restrictions, it is unlikely that this function is ever called. However, its existence will effectively deter attackers from attempting to spam the network. Combined with the fact that each order requires a minimum ETH amount, it will be uneconomical for an attacker.
