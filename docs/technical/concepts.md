# Concepts

The system creates stable assets that are collateralized by staked ETH (zETH). We track assets in `Vaults` and use `Bridge` contracts to deposit/withdraw staked ETH into `Vaults`.

## Stable Assets

Stable assets require proper backing (not under or fractional collateralization) to be created. Because the collateral itself may be volatile, it should be over-collateralized for the asset to maintain the correct price index.

Stable assets such as dollar stablecoins track the value of a derivative. This system uses price oracles to monitor that positions maintain a healthy CR (collateral ratio).

The system uses an orderbook to match buy and sell sides to create the asset.

## zETH

The system is denominated in zETH, an ERC-20 ETH stablecoin (similar to WETH) that represents a basket of ETH LSTs.

ETH LSTs are Liquid Staking Tokens, like rETH and stETH. These are the underlying collateral for zETH that bear yield due to Ethereum staking rewards.

**zETH can be created in 2 ways**:

- Deposit LSTs like stETH/rETH directly
- Deposit ETH, which either dequeues the internal withdrawal queue or mints new stETH/rETH

**zETH can be redeemed in 3 ways** (fastest to slowest):

- Withdraw to stETH/rETH directly (subject to fees)
- Unstake via the native LST protocol (subject to fees)
- Enter the internal withdrawal queue (no fees)

Any zETH within the system exists **virtually**, not as an ERC-20 balance. `VaultUser.ethEscrowed` is an internal variable that tracks zETH while in the system, at a per user level.

zETH is only minted when withdrawing outside the system and only burned when depositing into the system.

## Vaults

One `Vault` can hold many assets, and all assets in the same `Vault` are collateralized by the same basket of underlying LST. Different `Vaults` correspond to different risk-profiles of the underlying LST that generates yield.

At launch there will on be support for one base `Vault`: Carbon.

In the system, `AssetUser.ercEscrowed` is responsible for virtual accounting of stable assets.

- ETH and LST, as well as assets issued by the protocol, can enter and exit the system via the `VaultFacet`
  - On withdrawal, ERC-20 tokens are minted and `ethEscrowed` / `ercEscrowed` are decreased
  - Conversely, upon deposit these ERC-20 tokens are burned and `ethEscrowed` / `ercEscrowed` are increased
- `Vaults` are tracked as uints, where Carbon `Vault = 1`.

### Functions

These are the functions of `VaultFacet`, which allow both depositing and withdrawing zETH and stable assets.

| Function      | Token        | Internal Accounting |
| ------------- | ------------ | ------------------- |
| depositzETH   | burns zETH   | +ethEscrowed        |
| depositAsset  | burns ERC-20 | +ercEscrowed        |
| withdrawzETH  | mints zETH   | -ethEscrowed        |
| withdrawAsset | mints ERC-20 | -ercEscrowed        |

## Bridges

We have bridges for ERC-20 tokens external to the system, specifically for LSTs.

The `BridgeRouterFacet` is responsible for routing deposits/withdraws to the proper bridge (using `interfaces/IBridge.sol`). Each bridge contract has a unique implementation for interacting with its corresponding LST.

We are launching with support for [stETH](https://docs.lido.fi/guides/steth-integration-guide) (Lido) and [rETH](https://docs.rocketpool.net/overview/glossary.html#reth-rocket-pool-staking-deposit-token) (Rocket Pool), in addition to supporting other quality ETH LSTs in the future.

### Functions

These are the functions of `BridgeRouterFacet`, which allow depositing and withdrawing ETH and ETH LSTs.

| Function   | Token           | Internal Accounting | Fee                    |
| ---------- | --------------- | ------------------- | ---------------------- |
| depositEth | -ETH            | +ethEscrowed        |
| deposit    | -stETH or -rETH | +ethEscrowed        |                        |
| withdraw   | -stETH or -rETH | -ethEscrowed        | `Bridge.withdrawalFee` |
| unstakeEth | +stETH or +rETH | -ethEscrowed        | `Bridge.unstakeFee`    |

**Depositing:**

- `deposit()`: if you come in with an LST, it will deposit it and increase `VaultUser.ethEscrowed`
- `depositEth()`: if you come in with ETH, it will deposit into a bridge and increase `VaultUser.ethEscrowed`.

**Withdrawing:**

- `withdraw()`: decreases `VaultUser.ethEscrowed` and gives you the LST specified, subject to `Bridge.withdrawalFee`.
- `unstakeEth()`: will attempt to use the Bridge's native protocol to give back their own token.
- _`withdrawTapp()`_: A special function protected by `onlyOwner` which enables the diamond owner to withdraw zETH fees accrued to the `TAPP` as LST.
