# System Lifecycle

The cUSD market will be the first of many on DittoETH. The following example will track the lifecycle of zETH and the asset: cUSD.

### Entering

- Before a market is established, users must enter with ETH or an accepted LST and mint zETH. This occurs using `deposit` & `depositEth` in the `BridgeRouterFacet`.
- Once a market is sufficiently established and has enough external liquidity, users can swap into zETH / cUSD and enter via `depositZETH` & `depositAsset` in `VaultFacet`.

### Trading

- cUSD is created by a shorter who is posting zETH collateral matching with a bidder who wants cUSD for zETH. A short order is created using `createLimitShort` in `ShortOrdersFacet`.
- Bids can be created using `createBid` in `BidOrdersFacet`.
- Once cUSD is created, users can also sell directly for zETH using `createAsk` in `AskOrdersFacet`.
- Unlike short orders, bids and asks can be market orders.

### Exiting

- Once created, users are able to remove zETH / cUSD from the system and mint the respective ERC-20 equivalents via `withdrawzETH` & `withdrawAsset` in `VaultFacet`.
  - This will allow users to create liquidity on external protocols such as Uniswap, Curve, etc.
- Another way to exit the system is to redeem zETH for ETH or the underlying LSTs. This can occur one of two ways in `BridgeRouterFacet`:
  - `unstakeEth` requests unstaking from an LST protocol, trading the LST for ETH.
  - `withdraw` gives the user the LST directly.
- A large portion of the zETH should be locked in as collateral to secure the short positions. So most zETH cannot be redeemed until shorters have winded down their positions.

### Manage Shorts

- In order to maintain a healthy CR, shorters can use the following in `ShortRecordFacet`:
  - `increaseCollateral`: increases collateral to prevent liquidation.
  - `decreaseCollateral`: decreases collateral, which may allow a user to open additional shorts.
  - `combineShorts`: combine the debt and collateral of multiple shorts.
- Shorters can close or reduce their debt positions using the following in `ExitShortFacet`:
  - `exitShortWallet`: burn cUSD from their wallet.
  - `exitShortErcEscrowed`: decrease cUSD from their virtual account.
  - `exitShort`: buys back debt from the orderbook.

### Liquidations

- Shorts that have fallen below the `primaryLiquidationCR` must first be flagged for liquidation using `flagShort` in `MarginCallPrimaryFacet`.
  - After a set time has passed, the flagger (the person who called flagShort) has priority in calling `liquidate`.
  - There is a period after which anyone can call `liquidate`.
  - `liquidate` calls are incentivized with a fee.
- Shorts that continue to fall and drop below the `secondaryLiquidationCR` can bypass the orderbook.
  - Using `liquidateSecondary` users can bring cUSD directly and clear bad debt. No fee is given.
