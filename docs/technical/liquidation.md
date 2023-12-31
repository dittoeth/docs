# Liquidation

A `shortRecord` is liquidatable when it is under-collateralized. But unlike other systems, a liquidator may not have to cover the debt themselves.

### Flagging Short

When a short's CR is below the `primaryLiquidationCR` (i.e. 4), any user in the system can flag the short to indicate that it is liquidatable. Once a short is flagged, it can be liquidated after a certain period of time (Only applies to primary liquidation). This provides the shorter a window of time to increase their CR and avoid being liquidated.

When flagging a short for liquidation, it will only be required to read the latest Oracle spot price without needing to update the price for the system. The spot price is used to compute the short's latest CR.

> Note: Instead of saving the `flagger` address, a `ShortRecord` saves the `flaggerId` instead. This is done to save space in the struct. A mapping from id to address (`flagMapping`) is used to lookup the address instead. There is also a corresponding `AssetUser.g_flaggerId` to lookup a user's flagId.

### Primary Liquidation

To encourage a high CR, the system allows a `shortRecord` position to be liquidatable under `primaryLiquidationCR`. But at a high CR, the shorter has time to either add collateral (`increaseCollateral()`) or exit their position (`exitShort()`).

- `liquidate()`: uses the Orderbook to do a "forced bid" on behalf of the user. This is allowed when the CR is under `primaryLiquidationCR`.
  - A liquidator must first `flagShort()`, which checks `CR < primaryLiquidationCR`.
  - And after a period of time can call `liquidate()`.
  - Because the `primaryLiquidationCR` is higher than 1 CR, shorter has time to `increaseCollateral()`.

> Note: if the CR is already under `minimumCR`, `liquidate()` can be called without needing to first `flagShort()`, since the requirement to flag is only helpful to give a warning to the shorter to make their position healthy. If the position is already low, there's no need for it.

Assuming `flagShort()` was successful,

- `firstLiquidationTime` is 6hrs, `secondLiquidationTime` is 8hrs, `resetLiquidationTime` is 12hrs (these are modifiable)
- Between `flaggedAt` and `firstLiquidationTime`, `liquidate()` isn't callable.
- Between `firstLiquidationTime` and `secondLiquidationTime`, `liquidate()` is only callable by `short.flagger`.
- Between `secondLiquidationTime` and `resetLiquidationTime`, `liquidate()` is callable by anyone.
- Past `resetLiquidationTime`, `liquidate()` isn't callable.

> Note: Due to the natural truncation of hours (ie. 10hrs30min becomes 10hrs) in the function `getOffsetTimeHours()`, each liquidation time can only be approximated to the last hour. It was deemed more conservative to the shorters to allow a greater amount of time to provide collateral. Hence, the liquidation time requirements found in `_canLiquidate()` assume the `>,<=` format instead of `>=,<`. However, because the operands are used in a consistent manner, the separation between liquidation times is maintained at 2hrs and 4hrs.

Assuming a full liquidation, and `primaryLiquidationCR = 1.5, minimumCR = 1.1, c = collateral, c2 = collateral to buy back debt, callerFee = callerFee + gasFee`:

| CR              | Liquidator | Shorter | Pool             | Description                   |
| --------------- | ---------- | ------- | ---------------- | ----------------------------- |
| CR >= 1.5       | n/a        | n/a     | n/a              | n/a                           |
| 1.1 <= CR < 1.5 | callerFee  | c - c2  | tappFee          | shorter gets remaining collat |
| CR <= 1.1       | callerFee  | 0       | c - c2 + tappFee | pool gets remaining collat    |

When `CR >= minimumCR`, the shorter will get back some of their collateral, with `1 CR` worth of collateral being burned to cover the position's debt. When `CR < minimumCR`, the shorter doesn't get anything back, and the remaining collateral goes to the TAPP. If the `CR < 1`, then the TAPP is getting less collateral back in paying off the under-collateralized debt.

For a primary liquidation, there is both a fee for the TAPP (`tappFeePct`) and a fee for the liquidator (`callerFeePct`). Note that the gasFee and callerFee added together are given to the liquidator. The gasFee represents a reimbursement of the base gas fee used to execute the `forcedBid`, paid in dETH. In the rare case that the combined short collateral and TAPP balance is insufficient to cover all fees, the `gasFee` is waived and the `tappFee` is rerouted to the liquidator in its place. Importantly, the liquidation will always be able to cover the `tappFee` and `callerFee`, as described in [Local Black Swan](blackswan#local-black-swan).

> Note: Since the gasFee is paid from the TAPP, the `shortHintArray` passed to the `forcedBid` is restricted in size to prevent a malicious user from attempting to drain the TAPP through intentionally incorrect short hints. This is the only place in the protocol where a hint array is intentionally limited.

In the case where a flagged `shortRecord` can only be partially liquidated and `CR < minimumCR`, the TAPP assumes ownership of the `shortRecord` by adding the asset debt obligations and collateral to the singular TAPP `shortRecord` that is created at orderbook deployment. This maintains the integrity of the system for two reasons:

1. The shorter would have lost all collateral anyways (had a full liquidation gone through) by failing to maintain a high enough CR
2. Consolidating all partially liquidated `shortRecords` with `CR < minimumCR` into one place:
   a. allows the DAO to better evaluate the health of the system
   b. reduces the amount of small `shortRecords` with low CR that might not be liquidated due to lack of fees

### Secondary Liquidation

If the CR falls too quickly (`CR < secondaryLiquidationCR`), two other options are available.

This skips the orderbook and allows anyone that wants to exchange the stable asset for dETH and liquidate a `shortRecord` position. There is also no time delay for a `shortRecord` to change their position since it is getting close to a CR of 1. This is akin to redemptions in Liquity, but you need to specify a `shortRecord`.

Similar to exiting a short, there are two main ways to do this:

- A user has `ercEscrowed` already in the system.
- A user has the asset in their wallet.

What makes secondary liquidation `liquidateSecondary()` unique is that a user can liquidate multiple shorts at once, rather than just one. The user passes in an array of `BatchLiquidation`. `liquidateSecondary()` loops through each of the shorts to see if they are valid (i.e. `CR < secondaryLiquidationCR`, short is not active..etc).

```solidity
struct BatchLiquidation {
  address shorter;
  uint8 shortId;
}
```

When using one of the secondary methods only full (instead of partial) liquidations are possible, and there is no fee given to the liquidator. This incentivizes users to prioritize primary liquidations as these are more beneficial to the system to the extent that they encourage activity on orderbooks. However, partial liquidations are allowed for the TAPP `shortRecord` because the asset debt may grow too large for many users to fully liquidate. In the case where primary liquidations can't be completed due to extenuating circumstances (such as low orderbook volume) and the erc debt of the TAPP `shortRecord` rapidly grows it becomes especially important for as many users as possible to be able to utilize the secondary liquidation methods for the TAPP `shortRecord`.
