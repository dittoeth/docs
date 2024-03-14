# Parameters

These are system parameters that are settable by owner, and may change before launch.

> Contained in `contracts/libraries/DataTypes.sol`

## Orderbook Parameters

| Description                         | Current? | Location                   |
| ----------------------------------- | -------- | -------------------------- |
| InitialCR                           | 1.7      | Asset.initialCR            |
| Liquidation ratio                   | 1.5      | Asset.liquidationCR        |
| Forced Bid Price Buffer             | 1.1      | Asset.forcedBidPriceBuffer |
| Penalty CR                          | 1.1      | Asset.penaltyCR            |
| Minimum Eth Required in Ask Order   | 0.1 ETH  | Asset.minAskEth            |
| Minimum Eth Required in Bid Order   | 0.1 ETH  | Asset.minBidEth            |
| Minimum Erc Required in Short Order | 2000     | Asset.minShortErc          |

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

| Description                                                              | Constant | Location                                   |
| ------------------------------------------------------------------------ | -------- | ------------------------------------------ |
| Bid order, limit short, exit short, liquidation, and decrease collateral | 15 mins  | OF.FifteenMinutes                          |
| Backwards Match Tolerance from Oracle Price                              | 0.5%     | startingShortWithinOracleRange bool        |
| Deviation Threshold for Oracle Price                                     | 0.5%     | updateOracleAndStartingShortViaThreshold() |

## Orderbook Ranges

|                      | Range    |
| -------------------- | -------- |
| initialCR            | 1 - 15X  |
| liquidationCR        | 1 - 5X   |
| forcedBidPriceBuffer | 1 - 2X   |
| penaltyCR            | 1 - 1.2X |

## Fee Ranges

|             | Range   |
| ----------- | ------- |
| Tapp Fees   | 0 - 25% |
| Caller Fees | 0 - 25% |
| dETH Tithe  | 0 - 33% |

| Withdrawal Fees | Current | Range   | Location                     |
| --------------- | ------- | ------- | ---------------------------- |
| stEth           | 0.25%   | 0-2.00% | withdraw (BridgeRouterFacet) |
| rETH            | 0.50%   | 0-2.00% | withdraw (BridgeRouterFacet) |
