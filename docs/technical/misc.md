# Miscellaneous

Technical concepts that don't readily fit into any other category and/or temporary staging place for ideas to be placed in another section later

## Note about Ditto rates

The amount of ditto tokens minted in a given time period is virtually guaranteed be less than the total amount of ditto tokens available to mint for these reasons:

1. Less than 100% of users will mint their tokens because they are waiting to accrue more tokens before minting, forgetfulness, loss of private key, etc.
2. Anytime `disburseCollateral()` is called (through liquidation, exit, decrease, etc.) yield earned by the collateral in the `shortRecord` is distributed to the owner, but the user loses any claim to the proportional ditto token rewards from that dETH yield.
3. Ditto token rewards for shorters are reduced at CR above the CR derived from `initialCR`.

## updateYield protection

One potential drawback to using DittoETH is infrequent yield rate updates. Yield earned from LST is only realized within the system when `updateYield()` is called. When enough yield has accrued it is possible for a user to enter the system and create a large `shortRecord` position in order to earn a disproportionate amount of yield compared to the small amount of time spent within the system. This is mitigated in three ways:

1. Preventing yield distributions to newly created/modified `shortRecords` by use of `ShortRecord.updatedAt`. This primarily protects against flash loans.
2. When calling `increaseCollateral()` the constant `CRATIO_MAX` is checked to prevent collateral stuffing.
3. Forcing yield updates when large amounts of ETH are deposited into any of the bridges. While this doesn't eliminate the risk of a user creating multiple smaller deposits under the established thresholds, it does add complexity and cost to a potential abuser. The thresholds include `BRIDGE_YIELD_UPDATE_THRESHOLD`, where the `updateYield()` call only happens once DittoETH has reached a certain level of maturity (ie. 1000 ether) based on `dethTotal`, and `BRIDGE_YIELD_PERCENT_THRESHOLD` which defines a large deposit as a certain % of `dethTotal` in a `Vault.`

> **Note**: It's possible for `dethYieldRate` (uint80) to overflow at 1.2M x LST rewards per unit of `dethCollateral`. At expected steady state volume this should not be a problem, although it is possible to "use up" a large portion of `dethYieldRate` in the incipient stages of release where there is very little `dethCollateral`. However, this may also be unlikely as LST rewards will also be very small soon after release.

## Orderbook Dust

Two concepts of "dust" exist within the orderbook.

The first is a minimum order amount which is the smallest amount of ETH that must be contained in any order type in order to be sent or added to the orderbook. There is a `minAskEth` and a `minBidEth` as well as a `minShortErc`. These minimums are necessary to reduce the gas costs of matching against a bunch of smaller order amounts or unnecessary spam orders. These values are also checked against previous orders that have already been placed on the orderbook and are being partially matched. However, the restriction is relaxed by `Constants.DUST_FACTOR` so that limit orders are guaranteed to match at least some significant portion of the original requested amount. Otherwise, limit orders even 1 wei beneath `minAskEth` or `minBidEth` would be unfairly removed.

Scenario:

- There are one bid existing on the orderbook with `ercAmount` of 2000 at oracle price
- An incoming ask appears at the same price but with a slightly lower `ercAmount` at 1999
- The orders match since they have the same price and the ask order is completely filled
- Normally, the bid would leave behind any `ercAmount` unfilled. In this case, 1 `ercAmount` is too low to leave behind.
- Thus, the remaining bid is cancelled and the bidder gets the remaining ETH back in their escrow
- But if the remaining bid ETH is >= the `minBidEth * Constants.DUST_FACTOR`, then the remaining bid can be left on the orderbook

The second is slightly more complicated and only arises after partial matches of an incoming order. An incoming order may satisfy the minimum requirements but after a partial match can have a small amount of `ercAmount` left. In this case when `ercAmount * price` rounds down to 0 `ethFilled` will be propagated through the algorithms in `LibOrders.sol` and `BidOrdersFacet.sol` as 0 and can cause unintended consequences, especially for parts of the code that rely on the assumption that `ethFilled > 0.` For this reason, any remaining dust amounts defined as `ercAmount * price == 0` (less than 1 wei) are removed from the orderbook.

## Small shortRecords

The existence of small `shortRecords` (low `ercAmount`) with unhealthy CR would be unattractive to liquidators because of small fee payouts. 

To mitigate this scenario, the following features discourage and/or prevent holding a `shortRecord` with small amounts of collateral:

- `minShortErc` and `minAskEth` on order creation
- Partial `exitShort()` must leave at least `minBidEth` collateral (since primary liquidation uses `createForcedBid()`)

There are also cases where small `shortRecords` are created unintentionally. While the system requires the shorter to create a short order with `minShortErc`, it cannot control for situations where the order is partially matched. Here are some possible scenarios:

- Scenario 1: A shorter creates a short order at/above `minShortErc`. An incoming bid partially matches with the short order, which creates a `shortRecord` under `minShortErc`. The shorter cancels the short order before the rest can be filled. As a result, there is now a `shortRecord` under `minShortErc` in the system causing the issues highlighted above. More `shortRecords` like this continue to exist in the system, leading to accumulation of bad debt.
- Scenario 2: Like scenario 1, a short order is partially matched by an incoming bid. This time, the created `shortRecord` is above `minShortErc`, but the remaining short order's `ercAmount` is below `minShortErc`. The shorter then exit's the short position (or is liquidated) before the the remaining short order can be filled. As a result, there is now a short order under `minShortErc` on the orderbook. When that short order is filled, it will create a brand new `shortRecord` under `minShortErc`, resulting in the same problem as scenario 1.

> **Note**: Partial matching orders are expected to be a common occurrence, thus it is prudent to prevent `shortRecords` under `minShortErc` from impacting the system

The system solves for these issues mainly by automatically cancelling short orders that are under `minShortErc`. If the short order is under `minShortErc`, cancelling a short order via `cancelShort()` will increase the `ercDebt` and `collateral` of the corresponding `shortRecord` to the level of `minShortErc`. Secondly, first check if the corresponding short order's `ercAmount` is under `minShortErc` or will be under after the call in functions that delete `shortRecords` (i.e. `exitShort`, `liquidate`, `combineShorts` ...etc). If so, cancel the short order prior to deleting the `shortRecord`. This removes the possibility of a new `shortRecord` under `minShortErc` being formed.

## dUSD trading at discount

Normally, the redemption mechanism should be enough to restore parity. One reason that dUSD may still sell at a discount even with ongoing redemptions is because redemptions are only permitted for `shortRecords` under 2 CR. ShortRecords also can't be liquidated via primary/secondary liquidation when CR levels are too high. If dUSD holders continue to want to sell to get ETH, especially when ETH price is increasing, they would be willing to sell dUSD under oracle price, creating a discount.

As a fallback, the system dynamically checks for the discount deviation from the saved oracle price and increases the `dethTitheMod` value accordingly. This changes the amount of yield shorters can earn. The higher the deviation, the lower the yield shorters receive, which may lead some shorters to `exitShort` and create a `forcedBid` on the orderbook and match against the discounted dUSD. When users are matching back at acceptable levels (<1% of the saved oracle price), the tithe will return back to normal.

> **Note**: The loss of yield should dampen the demand for dETH, bringing the relationship between dUSD and dETHback into parity.

Depending on the discount, the tithe is updated using continuous values instead of discrete. The table below only shows the discrete cutoffs to provide high level understanding.

| Discount | Tithe |
| -------- | ----- |
| < 1%     | 10%   |
| 1% - 2%  | 32.5% |
| 2% - 3%  | 55%   |
| 3% - 4%  | 77.5% |
| >= 4%    | 100%  |

## Recovery Mode

Ditto has a similar mechanism to Liquity's [Recovery Mode](https://docs.liquity.org/faq/recovery-mode). At a high level, Liquity tracks the total collateral of the system (TCR) so that when it goes under 150%, it kicks into Recovery Mode, which liquidates a Trove at 150% instead of 110% to incentivize users to bring the TCR back to 150%.

In Ditto, each asset (i.e dUSD) has it's own `recoveryCR`. Rather than having a mode that turns on or off, Ditto adds a few checks:

- **Allow**: Primary and Secondary Liquidations can occur at higher than the usual margin call level (up to the `recoveryCR`) if the total `assetCR` is itself lower than the `recoveryCR`
- **Prevent**:
  - Creating a Limit Short Order: if it's created at a CR that makes the total CR low enough to hit recovery mode
  - Decreasing Collateral: if it's lowers the total CR low enough to hit recovery mode

## Capital Efficiency

`createLimitShort` allows a user to input a custom `shortOrderCR` which specifies the CR that the shorter wants to provide. 

In the future, DittoETH will have the ability for `shortRecords` to be created at lower CRs, as low as 110%. This can be done safely when the TAPP has enough funds to handle undercollateralized bad debt. Once in place, a shorter at the minimum would only need to put up 10% of collateral to match on the orderbook, creating a leveraged position of 10X. This comes from the distinct advantage that an orderbook has over a CDP because of the efficiency of having two separate users bring the capital for minting Ditto Assets. 

`Asset.initialCR` represents the lowest CR that a short record can be created at, taking into account the funds provided by both the bidder and shorter on match. So if the `Asset.initialCR` is 1.7, then a new shorter can provide a minimum of 0.7 CR to satisfy the constraint, given that the bidder is always providing 1 CR of ETH, since they want the equivalent amount of dUSD for their ETH. The `shortRecord's` initial CR will then be whatever the shorter provided plus the 100% that came from the bidder. This ability for `shortRecords` to become highly leveraged will be a powerful tool for traders who want to speculate on the price of ETH rising.
