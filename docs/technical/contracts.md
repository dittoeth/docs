# Contracts

## Files

- [EIP-2535](https://eips.ethereum.org/EIPS/eip-2535) Diamond Proxy related
  - `Diamond.sol`: proxy contract itself
  - `facets/`: Each Diamond Facet contract in the system. These contain every `external` function, or every user facing function in the system
  - `libraries/DataTypes.sol`: all structs used
  - `libraries/AppStorage.sol`: single struct that contains all data in the diamond
  - `libraries/LibXXX.sol`: shared internal library functions that may be used across any of the facets. These are inlined into each facet when deployed.
- `contracts/interfaces/`: Separate interfaces not auto-generated in `interfaces/`
- `bridges/`: standalone contracts to bridge between between ETH and staked ETH.
  - `BridgeReth.sol`: bridge to deposit rETH into zETH
  - `BridgeSteth.sol`: bridge to deposit stETH into zETH
- `governance/`: governance contracts for DAO
- `libraries/`: bulk of shared logic contained in library files that are inserted into Facets
- `mocks/`: mock files for Chainlink, Lido, Rocket Pool
- `tokens/`
  - `/Asset.sol`: base ERC-20 used in the system.
    - `zETH.sol` (via `Asset.sol`): stablecoin for ETH backed by liquid staking derivative (no yield).
    - `CUSD.sol` (via `Asset.sol`): stablecoin for USD, backed by zETH.
  - `Ditto.sol` (via `tokens/Asset.sol`): DAO token
- `deploy/`: deploy scripts
- `interfaces/`: auto generated folder by running a script that reads all Facets and produces interfaces from `.sol` files. It's useful to check `IDiamond.sol` which includes all facets.

## Modifiers

- **onlyOwner**: Verifies the caller is the owner of the diamond contract. Owner will initially be the contract deployers, but will be set to the DAO at a future date.
- **nonReentrantView**: Reentrancy guard for view functions. Only applicable for protocols integrating with DittoETH.
- **onlyDiamond**: Checks that the caller is the diamond contract. This is to give privileged access to certain external functions.

  | **_onlyOwner_**           | **_nonReentrantView_**  | **_onlyDiamond_**   |
  | ------------------------- | ----------------------- | ------------------- |
  | withdrawTapp              | getZethTotal            | deposit (bridge)    |
  | transferOwnership         | getCollateralRatio      | depositEth (bridge) |
  | setOracle                 | getAssetCollateralRatio | withdraw (bridge)   |
  | setVault                  | getBids                 | unstake (bridge)    |
  | setTithe                  | getAsks                 | createForcedBid     |
  | setDittoMatchedRate       | getShorts               |                     |
  | setDittoShorterRate       | getShortIdAtOracle      |                     |
  | setInitialMargin          | getShortRecords         |                     |
  | setPrimaryLiquidationCR   | getShortRecord          |                     |
  | setSecondaryLiquidationCR | getShortCountOf         |                     |
  | setForcedBidPriceBuffer   | getZethBalance          |                     |
  | setMinimumCR              | getAssetBalance         |                     |
  | setResetLiquidationTime   | getUndistributedYield   |                     |
  | setSecondLiquidationTime  | getYield                |                     |
  | setFirstLiquidationTime   | getDittoMatchedReward   |                     |
  | setTappFeePct             | getDittoReward          |                     |
  | setCallerFeePct           |                         |                     |
  | setMinEth                 |                         |                     |
  | createBridge              |                         |                     |
  | setWithdrawalFee          |                         |                     |
  | setUnstakeFee             |                         |                     |
  | deleteBridge              |                         |                     |
  | createMarket              |                         |                     |

- **nonReentrant**: Prevents calling another nonReentrant function within the diamond proxy.
- **isNotFrozen**: Checks that the asset is not frozen.
- **onlyValidAsset**: Checks if the address passed as the asset belongs to the system.
- **isFrozen**: Checks that the asset being called is frozen.
- **onlyValidShortRecord**: Checks that a short record is valid for a given asset, user, and id.
- **isValidAndNotFrozen**: Combines onlyValidAsset and isNotFrozen modifiers (helped prevent stack too deep).

  |                                  | **_nonReentrant_** | **_isNotFrozen_** | **_isPermanentlyFrozen_** | **_onlyValidAsset_** | **_onlyValidShortRecord_** |
  | -------------------------------- | ------------------ | ----------------- | ------------------------- | -------------------- | -------------------------- |
  | **_cancelAsk()_**                | ✅                 |                   |                           | ✅                   |                            |
  | **_cancelBid()_**                | ✅                 |                   |                           | ✅                   |                            |
  | **_cancelOrderFarFromOracle()_** | ✅                 |                   |                           | ✅                   |                            |
  | **_cancelShort()_**              | ✅                 |                   |                           | ✅                   |                            |
  | **_claimDittoMatchedReward()_**  | ✅                 |                   |                           |                      |                            |
  | **_combineShorts()_**            | ✅                 | ✅                |                           |                      | ✅                         |
  | **_createAsk()_**                | ✅                 | ✅                |                           | ✅                   |                            |
  | **_createBid()_**                | ✅                 | ✅                |                           | ✅                   |                            |
  | **_createLimitShort()_**         | ✅                 | ✅                |                           | ✅                   |                            |
  | **_decreaseCollateral()_**       | ✅                 | ✅                |                           |                      | ✅                         |
  | **_deposit()_**                  | ✅                 |                   |                           |                      |                            |
  | **_depositAsset()_**             | ✅                 | ✅                |                           | ✅                   |                            |
  | **_depositZeth()_**              | ✅                 |                   |                           |                      |                            |
  | **_depositEth()_**               | ✅                 |                   |                           |                      |                            |
  | **_distributeYield()_**          | ✅                 |                   |                           | ✅ ¹                 |                            |
  | **_exitShort()_**                | ✅                 | ✅                |                           |                      | ✅                         |
  | **_exitShortErcEscrowed()_**     | ✅                 | ✅                |                           |                      | ✅                         |
  | **_exitShortWallet()_**          | ✅                 | ✅                |                           |                      | ✅                         |
  | **_flagShort()_**                | ✅                 | ✅                |                           |                      | ✅                         |
  | **_increaseCollateral()_**       | ✅                 | ✅                |                           |                      | ✅                         |
  | **_liquidate()_**                | ✅                 | ✅                |                           |                      | ✅                         |
  | **_liquidateSecondary()_**       | ✅                 | ✅                |                           | ✅                   |                            |
  | **_redeemErc()_**                | ✅                 |                   | ✅                        |                      |                            |
  | **_shutdownMarket()_**           | ✅                 | ✅                |                           | ✅                   |                            |
  | **_unstakeEth()_**               | ✅                 |                   |                           |                      |                            |
  | **_updateYield()_**              | ✅                 |                   |                           |                      |                            |
  | **_withdraw()_**                 | ✅                 |                   |                           |                      |                            |
  | **_withdrawZeth()_**             | ✅                 |                   |                           |                      |                            |
  | **_withdrawAsset()_**            | ✅                 |                   |                           | ✅                   |                            |
  | **_withdrawDittoReward()_**      | ✅                 |                   |                           |                      |                            |

  ¹ Modifier is on internal function call `_distributeYield`, which is inside a loop in the top level `distributeYield` call.

## Testing

> We mock Chainlink, Lido, Rocket Pool in our tests

- `scripts/`: misc scripts for during dev
- `test/`: unit tests
  - `test/utils/OBFixture.sol`: setup to create all contracts, helper functions used in tests, init code

## Gas Testing

> `FOUNDRY_PROFILE=gas` to deploy with the optimizer. We write specific tests for gas to try to isolate the estimated gas per function by trying to take into account the cost of warm/cold storage slots.

- `test-gas/`: specific tests for average gas usage. (set profile to be compiled using optimizer.
  - `test-gas/GasHelper.sol`: same for the gas tests. Adds the `startMeasuringGas`/`stopMeasuringGas` helpers.
- `.gas.json`: Gas is written to separate temp files, and `npm run gas` updates them to JSON.

## Optimizations

DittoETH utilizes several gas saving optimizations to bring down the gas cost of using the system. As a general rule, optimizations were focused on the 80% use case.

- **Diamond Proxy**: Requires two external calls, but gives internal access to storage and library calls.
- **Struct packing**: See the `STypes` library in `DataTypes.sol` to see how storage slots are allocated for struct variables. Struct variables that are commonly accessed and wrote to are put into the same slot if possible.
- **Hint system**: Users or frontends must pass a hint to accurately find the accurate place in `bidOrders`, `askOrders`, `shortOrders` linked lists. This eliminates the need for iterating over a large number of Orders.
- **Reuse IDs**: Ids are recycled after use for the following storage variables: `bidOrders`, `askOrders`, `shortOrders`, and `shortRecords`. This is applicable for the `STypes.Orders` and `STypes.ShortRecords` structs. The cost to set storage after initial use goes down from 20k to 5k gas because the slots are not cleared after use.
- **Utilize unused storage**: `Constants.HEAD` of the `bidOrders` mapping represents the HEAD of the linked list and is never used as an order. This allows `ercAmount` and `creationTime` to be repurposed for `oraclePrice` and `oracleTime`. This is abstracted in the codebase as the `setPriceAndTime` function.
  - Another instance is using the `Diamond proxy` address, which is `address(this)` as the `TAPP` address in some of our mappings.
- **Keep Storage Non-Zero**: In `YieldFacet`, `dittoMatchedShares` and `dittoReward` are left at 1 `wei`, which effectively serves as zero and avoids the evm penalty of setting storage of a zeroed slot in subsequent calls.
- **Virtual Accounting**: zETH and `stable assets` are tracked virtually, which are only burned and minted when entering and exiting the system. This reduces the need for an external call to the ERC-20 for `transfer`, `mint`, `burn`, ect.
- **Store Oracle Data**: External (live) oracle data is only queried when certain conditions have been met. Otherwise, the system uses an internally stored price and time.
