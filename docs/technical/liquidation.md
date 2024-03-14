# Liquidation

A `shortRecord` is liquidatable when it is under-collateralized. But unlike other systems, a liquidator may not have to cover the debt themselves.

## Primary Liquidation

To encourage a high CR, the system allows a `shortRecord` position to be liquidatable under `primaryLiquidationCR`. At a high CR, the shorter has time to either add collateral (`increaseCollateral()`) or exit their position (`exitShort()`).

> Note: `liquidate()`: uses the Orderbook to do a "forced bid" on behalf of the user. This is allowed when the CR is under `primaryLiquidationCR`.

Assuming a full liquidation, and `primaryLiquidationCR = 1.5, penaltyCR = 1.1, c = collateral, c2 = collateral to buy back debt, callerFee = callerFee + gasFee`:

| CR              | Liquidator | Shorter | Pool             | Description                   |
| --------------- | ---------- | ------- | ---------------- | ----------------------------- |
| CR >= 1.5       | n/a        | n/a     | n/a              | n/a                           |
| 1.1 <= CR < 1.5 | callerFee  | c - c2  | tappFee          | shorter gets remaining collat |
| CR <= 1.1       | callerFee  | 0       | c - c2 + tappFee | pool gets remaining collat    |

When `CR >= penaltyCR`, the shorter will get back some of their collateral, with `1 CR` worth of collateral being burned to cover the position's debt. When `CR < penaltyCR`, the shorter doesn't get anything back, and the remaining collateral goes to the TAPP. If the `CR < 1`, then the TAPP is getting less collateral back in paying off the under-collateralized debt.

For a primary liquidation, there is both a fee for the TAPP (`tappFeePct`) and a fee for the liquidator (`callerFeePct`). Note that the gasFee and callerFee added together are given to the liquidator. The gasFee represents a reimbursement of the base gas fee used to execute the `forcedBid`, paid in dETH. In the rare case that the combined short collateral and TAPP balance is insufficient to cover all fees, the `gasFee` is waived and the `tappFee` is rerouted to the liquidator in its place. Importantly, the liquidation will always be able to cover the `tappFee` and `callerFee`, as described in [Local Black Swan](blackswan#local-black-swan).

> Note: Since the gasFee is paid from the TAPP, the `shortHintArray` passed to the `forcedBid` is restricted in size to prevent a malicious user from attempting to drain the TAPP through intentionally incorrect short hints. This is the only place in the protocol where a hint array is intentionally limited.

In the case where a `shortRecord` can only be partially liquidated and `CR < penaltyCR`, the TAPP assumes ownership of the `shortRecord` by adding the asset debt obligations and collateral to the singular TAPP `shortRecord` that is created at orderbook deployment. This maintains the integrity of the system for two reasons:

1. The shorter would have lost all collateral anyways (had a full liquidation gone through) by failing to maintain a high enough CR
2. Consolidating all partially liquidated `shortRecords` with `CR < penaltyCR` into one place:

   a. allows the DAO to better evaluate the health of the system

   b. reduces the amount of small `shortRecords` with low CR that might not be liquidated due to lack of fees

## Secondary Liquidation

Additionally, there are two other liquidation options available for users who want to skip the orderbook. These options allows anyone to exchange the stable asset for dETH and liquidate a `shortRecord` position who is below `liquidationCR`.

Similar to exiting a short, there are two main ways to do this:

- A user has `ercEscrowed` already in the system.
- A user has the asset in their wallet.

What makes secondary liquidation `liquidateSecondary()` unique is that a user can liquidate multiple shorts at once, rather than just one. The user passes in an array of `BatchLiquidation`. `liquidateSecondary()` loops through each of the shorts to see if they are valid.

```solidity
struct BatchLiquidation {
  address shorter;
  uint8 shortId;
  uint16 shortOrderId; //Used to check size of corresponding short order
}
```

When using one of the secondary methods only full (instead of partial) liquidations are possible, and there is no fee given to the liquidator. This incentivizes users to prioritize primary liquidations as these are more beneficial to the system to the extent that they encourage activity on orderbooks. However, partial liquidations are allowed for the TAPP `shortRecord` because the asset debt may grow too large for many users to fully liquidate. In the case where primary liquidations can't be completed due to extenuating circumstances (such as low orderbook volume) and the erc debt of the TAPP `shortRecord` rapidly grows it becomes especially important for as many users as possible to be able to utilize the secondary liquidation methods for the TAPP `shortRecord`.

## Recovery Mode

Primary and Secondary Liquidations can occur at higher than the usual liquidation level (up to the `recoveryCR`) if the total `assetCR` is itself lower than the `recoveryCR`. See [Recover Mode](../technical/misc#Recovery) pages for more information.

## Small ShortRecords

The system handles the case where the `shortRecord` is too [small](../technical/misc#Small) to incentivize liquidations.
