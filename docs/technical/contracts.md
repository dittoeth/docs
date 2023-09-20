# Contract Overview

## Files

- [EIP-2535](https://eips.ethereum.org/EIPS/eip-2535) Diamond Proxy related:
  - `Diamond.sol`: proxy contract itself
  - `facets/`: each Diamond Facet contract in the system. These contain every `external` function, or every user facing function in the system
  - `libraries/DataTypes.sol`: all structs used
  - `libraries/AppStorage.sol`: single struct that contains all data in the diamond
  - `libraries/LibXXX.sol`: shared internal library functions that may be used across any of the facets. These are inlined into each facet when deployed.
- `contracts/interfaces/`: separate interfaces not auto-generated in `interfaces/`
- `bridges/`: standalone contracts to bridge between between ETH and staked ETH.
  - `BridgeReth.sol`: bridge to deposit rETH into dETH
  - `BridgeSteth.sol`: bridge to deposit stETH into dETH
- `governance/`: governance contracts for DAO
- `libraries/`: bulk of shared logic contained in library files that are inserted into Facets
- `mocks/`: mock files for Chainlink, Lido, Rocket Pool
- `tokens/`
  - `/Asset.sol`: base ERC-20 used in the system.
    - `dETH.sol` (via `Asset.sol`): stablecoin for ETH backed by liquid staking derivative (no yield)
    - `dUSD.sol` (via `Asset.sol`): stablecoin for USD, backed by dETH
  - `Ditto.sol` (via `tokens/Asset.sol`): DAO token
- `deploy/`: deploy scripts
- `interfaces/`: auto generated folder by running a script that reads all Facets and produces interfaces from `.sol` files. It's useful to check `IDiamond.sol` which includes all facets.

## Modifiers

- **onlyDAO**: Verifies the caller is the owner of the diamond contract. Owner is currently the DittoTimelockController, which is governed by the DittoDAO.
- **onlyAdminOrDAO**: Verifies the caller is the admin or the DittoDAO, which allows for quicker responses to time sensitive actions.
- **nonReentrantView**: Reentrancy guard for view functions. Only applicable for protocols integrating with DittoETH.
- **onlyDiamond**: Checks that the caller is the diamond contract. This is to give privileged access to certain external functions.

  | **_onlyDAO_**     | **_onlyAdminOrDAO_**      | **_nonReentrantView_**  | **_onlyDiamond_**   |
  | ----------------- | ------------------------- | ----------------------- | ------------------- |
  | withdrawTapp      | shutdownMarket            | getDethTotal            | deposit (bridge)    |
  | transferOwnership | cancelOrderFarFromOracle  | getCollateralRatio      | depositEth (bridge) |
  | setVault          | transferAdminship         | getAssetCollateralRatio | withdraw (bridge)   |
  | createBridge      | setTithe                  | getBids                 | createForcedBid     |
  | deleteBridge      | setDittoMatchedRate       | getAsks                 |                     |
  | createMarket      | setDittoShorterRate       | getShorts               |                     |
  | diamondCut¹       | setInitialCR              | getShortIdAtOracle      |                     |
  |                   | setPrimaryLiquidationCR   | getShortRecords         |                     |
  |                   | setSecondaryLiquidationCR | getShortRecord          |                     |
  |                   | setForcedBidPriceBuffer   | getShortCountOf         |                     |
  |                   | setMinimumCR              | getDethBalance          |                     |
  |                   | setResetLiquidationTime   | getAssetBalance         |                     |
  |                   | setSecondLiquidationTime  | getUndistributedYield   |                     |
  |                   | setFirstLiquidationTime   | getYield                |                     |
  |                   | setTappFeePct             | getDittoMatchedReward   |                     |
  |                   | setCallerFeePct           | getDittoReward          |                     |
  |                   | setMinAskEth              |                         |                     |
  |                   | setMinBidEth              |                         |                     |
  |                   | setMinShortErc            |                         |                     |
  |                   | setWithdrawalFee          |                         |                     |

  ¹ onlyDAO is enforced via `enforceIsContractOwner()` in `LibDiamond.sol`

- **nonReentrant**: Prevents calling another nonReentrant function within the diamond proxy.
- **isNotFrozen**: Checks that the asset is not frozen.
- **onlyValidAsset**: Checks if the address passed as the asset belongs to the system.
- **isFrozen**: Checks that the asset being called is frozen.
- **onlyValidShortRecord**: Checks that a short record is valid for a given asset, user, and id.
- **isPermanentlyFrozen**: Checks that an asset is not permanently frozen.

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
  | **_updateYield()_**              | ✅                 |                   |                           |                      |                            |
  | **_withdraw()_**                 | ✅                 |                   |                           |                      |                            |
  | **_withdrawAsset()_**            | ✅                 |                   |                           | ✅                   |                            |
  | **_withdrawDittoReward()_**      | ✅                 |                   |                           |                      |                            |

  ¹ Modifier is on internal function call `_distributeYield`, which is inside a loop in the top level `distributeYield` call.

## Testing

> Chainlink, Lido, Rocket Pool mocked in the tests

- `scripts/`: misc scripts for during dev
- `test/`: unit tests
  - `test/utils/OBFixture.sol`: setup to create all contracts, helper functions used in tests, init code

## Gas Testing

> `FOUNDRY_PROFILE=gas` to deploy with the optimizer. Specific tests for gas to try to isolate the estimated gas per function by trying to take into account the cost of warm/cold storage slots.

- `test-gas/`: specific tests for average gas usage. Set profile to be compiled using optimizer.
  - `test-gas/GasHelper.sol`: same for the gas tests. Adds the `startMeasuringGas`/`stopMeasuringGas` helpers.
- `.gas.json`: Gas is written to separate temp files, and `npm run gas` updates them to JSON.

## Optimizations

DittoETH utilizes several gas saving optimizations to bring down the gas cost of using the system. As a general rule, optimizations were focused on the 80% use case.

- **Diamond Proxy**: Requires two external calls, but gives internal access to storage and library calls.
- **Struct packing**: See the `STypes` library in `DataTypes.sol` to see how storage slots are allocated for struct variables. Struct variables that are commonly accessed and wrote to are put into the same slot if possible.
- **Hint system**: Users or frontends must pass a hint to accurately find the accurate place in `bidOrders`, `askOrders`, `shortOrders` linked lists. This reduces the need for iterating over a large number of Orders.
- **Reuse IDs**: Ids are recycled after use for the following storage variables: `bidOrders`, `askOrders`, `shortOrders`, and `shortRecords`. This is applicable for the `STypes.Orders` and `STypes.ShortRecords` structs. The cost to set storage after initial use goes down from 20k to 5k gas because the slots are not cleared after use.
- **Utilize unused storage**: `Constants.HEAD` of the `bidOrders` mapping represents the HEAD of the linked list and is never used as an order. This allows `ercAmount` and `creationTime` to be repurposed for `oraclePrice` and `oracleTime`. This is abstracted in the codebase as the `setPriceAndTime` function.
  - Another instance is using the `Diamond proxy` address, which is `address(this)` as the `TAPP` address in some of the mappings.
- **Keep Storage Non-Zero**: In `YieldFacet`, `dittoMatchedShares` and `dittoReward` are left at 1 `wei`, which effectively serves as zero and avoids the evm penalty of setting storage of a zeroed slot in subsequent calls.
- **Virtual Accounting**: dETH and `stable assets` are tracked virtually, which are only burned and minted when entering and exiting the system. This reduces the need for an external call to the ERC-20 for `transfer`, `mint`, `burn`, ect.
- **Store Oracle Data**: External (live) oracle data is only queried when certain conditions have been met. Otherwise, the system uses an internally stored price and time.
