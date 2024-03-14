# System Lifecycle

The dUSD market will be the first of many on DittoETH. The following example will track the lifecycle of dETH and the asset: dUSD.

## Entering

- Before a market is established, users must enter with ETH or an accepted LST and mint dETH. This occurs using `deposit` & `depositEth` in the `BridgeRouterFacet`.
- Once a market is sufficiently established and has enough external liquidity, users can sell stable assets like dUSD via `depositAsset` in `VaultFacet`.

## Trading

- dUSD is created by a shorter who is posting dETH collateral matching with a bidder who wants dUSD for dETH. A short order is created using `createLimitShort` in `ShortOrdersFacet`.
- Bids can be created using `createBid` in `BidOrdersFacet`.
- Once dUSD is created, users can also sell directly for dETH using `createAsk` in `AskOrdersFacet`.
- Unlike short orders, bids and asks can be market orders.

## Exiting

- Once created, users are able to remove dUSD from the system and mint the respective ERC-20 equivalents via `withdrawAsset` in `VaultFacet`.
  - This will allow users to create liquidity on external protocols such as Uniswap, Curve, etc.
- Another way to exit the system is to redeem dETH for the underlying LSTs. This occurs in `BridgeRouterFacet`:
  - `withdraw` gives the user the LST directly.
- A large portion of the dETH should be locked in as collateral to secure the short positions. So most dETH cannot be redeemed until shorters have winded down their positions.

## Manage Shorts

- In order to maintain a healthy CR, shorters can use the following in `ShortRecordFacet`:
  - `increaseCollateral`: increases collateral to prevent liquidation.
  - `decreaseCollateral`: decreases collateral, which may allow a user to open additional shorts.
  - `combineShorts`: combine the debt and collateral of multiple shorts.
- Shorters can close or reduce their debt positions using the following in `ExitShortFacet`:
  - `exitShortWallet`: burn dUSD from their wallet.
  - `exitShortErcEscrowed`: decrease dUSD from their virtual account.
  - `exitShort`: buys back debt from the orderbook using the short record's collateral.

## Liquidations

- Shorts that have fallen below the `liquidationCR` are available for liquidations.
  - `liquidate` in `PrimaryLiquidationFacet` calls are incentivized with a fee.
  - Using `liquidateSecondary` in `SecondaryLiquidationFacet` users can bring dUSD directly and clear bad debt. No fee is given.
