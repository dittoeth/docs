# Parameters

These are system parameters that are settable by owner.

> Contained in `contracts/libraries/DataTypes.sol`

## Orderbook Parameters

| Description                                            | Current?   | Location                     |
| ------------------------------------------------------ | ---------- | ---------------------------- |
| Initial Margin                                         | 3          | Asset.initialMargin          |
| Liquidation ratio (Maintenance Margin)                 | 1.75       | Asset.primaryLiquidationCR   |
| Secondary Margin                                       | 1.5        | Asset.secondaryLiquidationCR |
| Forced Bid Price Buffer                                | 1.1        | Asset.forcedBidPriceBuffer   |
| Liquidation Reset Time                                 | 16 Hours   | Asset.resetLiquidationTime   |
| Time after when margin call available to first flagger | 10 Hours   | Asset.firstLiquidationTime   |
| Time after flag when margin call available to all      | 12 Hours   | Asset.secondLiquidationTime  |
| Minimum CR                                             | 1.1        | Asset.minimumCR              |
| Minimum Eth Required in Order                          | 0.0001 ETH | Asset.minEth                 |

## Penalty Fees

| Description                             | %    | Location           |
| --------------------------------------- | ---- | ------------------ |
| Margin Call Fees: Penalty fee to caller | 2.5% | Asset.tappFeePct   |
| Margin Call Fees: Penalty fee to TAPP   | .5%  | Asset.callerFeePct |

## Reward Rates

| Description                    | %       | Location               |
| ------------------------------ | ------- | ---------------------- |
| Elapsed time for Ditto rewards | 2 weeks | Constants.MIN_DURATION |

## Oracle

> OF is Oracle Frequency

These are all constants.

| Description                                      | Constant | Location                                   |
| ------------------------------------------------ | -------- | ------------------------------------------ |
| Bid order and create limit short                 | 1 Hour   | OF.OneHour                                 |
| Exit short, margin call, and decrease collateral | 15 mins  | OF.FifteenMinutes                          |
| Backwards Match Tolerance from Oracle Price      | 1%       | startingShortWithinOracleRange bool        |
| Deviation Threshold for Oracle Price             | .5%      | updateOracleAndStartingShortViaThreshold() |

## Orderbook Ranges

|                                           | Range   |
| ----------------------------------------- | ------- |
| Initial Margin                            | 1 - 10X |
| primaryLiquidationCR (Maintenance Margin) | 1 - 5X  |
| primaryLiquidationCR (Maintenance Margin) | 1 - 5X  |
| Secondary Margin                          | 1 - 5X  |
| Liquidation Limit                         | 1 - 2X  |
| Minimum Cratio                            | 1 - 2X  |

## Fee Ranges

|                   | Range   |
| ----------------- | ------- |
| Tapp Fees         | 0 - 25% |
| Caller Fees       | 0 - 25% |
| Gas Fees Estimate | 0 - 25% |
| zETH Tithe        | 0 - 33% |

## Liquidation Time Ranges

|                         | Ranges       |
| ----------------------- | ------------ |
| Reset Liquidation Time  | 1 - 48 hours |
| First Liquidation Time  | 1 - 48 hours |
| Second Liquidation Time | 1 - 48 hours |

| Withdrawal Fees | Current | Range    | Location                     |
| --------------- | ------- | -------- | ---------------------------- |
| stEth           | .10%    | 0-15.00% | withdraw (BridgeRouterFacet) |
| rETH            | .5%     | 0-15.00% | withdraw (BridgeRouterFacet) |

| Unstake Fees | Current | Range           | Location                       |
| ------------ | ------- | --------------- | ------------------------------ |
| stEth        | .0%     | 0-2.55% (uint8) | unstakeEth (BridgeRouterFacet) |
| rETH         | .0%     | 0-2.55% (uint8) | unstakeEth (BridgeRouterFacet) |
