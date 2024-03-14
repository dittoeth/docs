# Concepts

The system creates stable assets that are collateralized by staked ETH. These stable assets are tracked in a `Vault` and use `Bridge` contracts to deposit/withdraw staked ETH into a `Vault`.

At launch there will on be support for one base `Vault`: ONE. In the future, different `Vaults` may correspond to different risk-profiles of the underlying LSTs which generate yield.

## Stable Assets

Stable assets such as dollar stablecoins track the value of a derivative. This system uses price oracles to monitor that positions maintain a healthy CR (collateral ratio).

Stable assets require proper backing (not under or fractional collateralization) to be created. Because the collateral itself may be volatile, it is over-collateralized for the asset to maintain the correct price index.

## Orderbook

MakerDAO's CDP (collateralized debt position) is "one sided" in the sense that a single user locks collateral to generate their stable asset, DAI.

This system uses an _orderbook_ to match buy and sell sides (thus two sided) to create a stable asset. A buyer takes their ETH with the intent of getting the stable asset (dUSD, Ditto USD). A [shorter](../overview/glossary#shorter) takes their ETH with the intent of getting the yield of their collateral in addition to the extra collateral of the buyer as well as taking a lended sell position against USD. The orderbook model allows for the shorter to be incredibly [efficient](../technical/misc#Capital) with their provided collateral.

## Vaults

A `Vault` can hold many stable assets. All assets in the same `Vault` are collateralized by the same basket of underlying LSTs.

- ETH and LST, as well as assets issued by the protocol, can enter and exit the system via the `VaultFacet`
  - On withdrawal, ERC-20 tokens are minted and `ercEscrowed` are decreased
  - Conversely, upon deposit these ERC-20 tokens are burned and `ercEscrowed` are increased
- `Vaults` are tracked as uints, where constant ONE is `Vault = 1`
- There is only a single `Vault` at launch, but a new `Vault` can be made with `createVault`

### Vault - Functions

These are the functions of `VaultFacet`, which allow both depositing and withdrawing dETH and stable assets.

| Function      | Token        | Internal Accounting |
| ------------- | ------------ | ------------------- |
| depositAsset  | burns ERC-20 | +ercEscrowed        |
| withdrawAsset | mints ERC-20 | -ercEscrowed        |

Assets also exist **virtually** within the system, similar to dETH. There is a corresponding `AssetUser.ercEscrowed` for virtual accounting of each stable asset, such like there is one `VaultUser.ethEscrowed` to hold the amount of ETH collateral per user. Because assets are virtual, ERCs are only minted and burned when they enter/exit the system via `VaultFacet`.

## dETH

Because the system takes in multiple kinds of collateral, the system is denominated in dETH, an ERC-20 ETH stablecoin (similar to WETH) that represents a basket of ETH LSTs (Liquid Staking Tokens, like rETH and stETH). LSTs are the underlying collateral for dETH that bear yield due to Ethereum staking rewards.

**dETH can be created in 2 ways**:

- Deposit LSTs directly (a user already has the stETH/rETH)
- Deposit ETH and mint stETH/rETH (a user comes in with ETH)

**dETH can be redeemed**:

- Withdraw to stETH/rETH directly (subject to fees)

Because dETH within the system exists **virtually** (not as an ERC-20 balance), dETH is only minted when withdrawing outside the system and only burned when depositing into the system. `VaultUser.ethEscrowed` is the internal variable that tracks dETH at a per user level.

> Given that each `Vault` in the future may have different underlying collaterals and risk profiles, there needs to be a mechanism in place to move between vaults. One approach is to do a conversion when migrating collateral between vaults. The other is to create a separate dETH per vault which has it's own value (this is already supported but not used since the system will only start off with a single vault and thus a single dETH).

## Bridges

Bridges allow escrowing collateral into the system (specifically for LSTs).

Bridges are separate contracts from the Diamond that are only callable by `BridgeRouterFacet.sol` to handle depositing and withdrawing LST collateral.

- `createBridge` can be used to add a new collateral type

### BridgeRouter

The `BridgeRouterFacet` is responsible for routing deposits/withdraws to the proper bridge (using `interfaces/IBridge.sol`). Each bridge contract has a unique implementation for interacting with its corresponding LST.

The initial launch will support [stETH](https://docs.lido.fi/guides/steth-integration-guide) (Lido) and [rETH](https://docs.rocketpool.net/overview/glossary.html#reth-rocket-pool-staking-deposit-token) (Rocket Pool), with designs on supporting other quality ETH LSTs in the future.

### Bridge - Functions

These are the functions of `BridgeRouterFacet`, which allow depositing and withdrawing ETH and ETH LSTs.

| Function   | Token           | Internal Accounting | Fee                                         |
| ---------- | --------------- | ------------------- | ------------------------------------------- |
| depositEth | -ETH            | +ethEscrowed        |                                             |
| deposit    | -stETH or -rETH | +ethEscrowed        |                                             |
| withdraw   | -stETH or -rETH | -ethEscrowed        | `Bridge.withdrawalFee` + stETH/rETH premium |

**Depositing:**

- `deposit()`: if you come in with an LST, it will deposit into a bridge and increase `VaultUser.ethEscrowed`
- `depositEth()`: if you come in with ETH, it will deposit into a bridge and increase `VaultUser.ethEscrowed`

**Withdrawing:**

- `withdraw()`: decreases `VaultUser.ethEscrowed` and gives you the LST specified, subject to `Bridge.withdrawalFee` and stETH/rETH premium for LST withdrawn past credit balance
- _`withdrawTapp()`_: a special function protected by `onlyOwner` which enables the diamond owner to withdraw dETH fees accrued to the `TAPP` as LST

> **Note**: `Bridge.withdrawalFee` planned to launch at 0%, likely to remain 0% and solely rely on stETH/rETH premium fees to prevent arbitrage.
