# Parameters

These are system parameters that are settable by owner, and may change before launch.

> Contained in `contracts/libraries/DataTypes.sol`

## Orderbook Parameters

| Description                                            | Current? | Location                     |
| ------------------------------------------------------ | -------- | ---------------------------- |
| InitialCR                                              | 1.7      | Asset.initialCR              |
| Liquidation ratio (MaintenanceCR)                      | 1.5      | Asset.primaryLiquidationCR   |
| Secondary Liquidation                                  | 1.4      | Asset.secondaryLiquidationCR |
| Forced Bid Price Buffer                                | 1.1      | Asset.forcedBidPriceBuffer   |
| Liquidation Reset Time                                 | 12 Hours | Asset.resetLiquidationTime   |
| Time after flag when liquidation available to all      | 8 Hours  | Asset.secondLiquidationTime  |
| Time after when liquidation available to first flagger | 6 Hours  | Asset.firstLiquidationTime   |
| Minimum CR                                             | 1.1      | Asset.minimumCR              |
| Minimum Eth Required in Ask Order                      | 0.1 ETH  | Asset.minAskEth              |
| Minimum Eth Required in Bid Order                      | 0.1 ETH  | Asset.minBidEth              |
| Minimum Erc Required in Short Order                    | 2000     | Asset.minShortErc            |

## Penalty Fees

| Description                             | %    | Location           |
| --------------------------------------- | ---- | ------------------ |
| Liquidation Fees: Penalty fee to caller | 2.5% | Asset.tappFeePct   |
| Liquidation Fees: Penalty fee to TAPP   | 0.5% | Asset.callerFeePct |

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
| Exit short, liquidation, and decrease collateral | 15 mins  | OF.FifteenMinutes                          |
| Backwards Match Tolerance from Oracle Price      | 0.5%     | startingShortWithinOracleRange bool        |
| Deviation Threshold for Oracle Price             | 0.5%     | updateOracleAndStartingShortViaThreshold() |

## Orderbook Ranges

|                                      | Range    |
| ------------------------------------ | -------- |
| InitialCR                            | 1 - 15X  |
| primaryLiquidationCR (MaintenanceCR) | 1 - 5X   |
| secondaryLiquidationCR               | 1 - 5X   |
| forcedBidPriceBuffer                 | 1 - 2X   |
| minimumCR                            | 1 - 1.2X |

## Fee Ranges

|             | Range   |
| ----------- | ------- | ------ |
| Tapp Fees   | 0 - 25% |
| Caller Fees | 0 - 25% | inimun |
| dETH Tithe  | 0 - 33% |

## Liquidation Time Ranges

|                         | Ranges       |
| ----------------------- | ------------ |
| Reset Liquidation Time  | 1 - 48 hours |
| First Liquidation Time  | 1 - 48 hours |
| Second Liquidation Time | 1 - 48 hours |

| Withdrawal Fees | Current | Range   | Location                     |
| --------------- | ------- | ------- | ---------------------------- |
| stEth           | 0.25%   | 0-2.00% | withdraw (BridgeRouterFacet) |
| rETH            | 0.50%   | 0-2.00% | withdraw (BridgeRouterFacet) |

| Unstake Fees | Current | Range   | Location                       |
| ------------ | ------- | ------- | ------------------------------ |
| stEth        | 0%      | 0-1.00% | unstakeEth (BridgeRouterFacet) |
| rETH         | 0%      | 0-1.00% | unstakeEth (BridgeRouterFacet) |
