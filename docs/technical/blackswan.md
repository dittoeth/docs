# Black Swan

There are two potential black swan scenarios that we account for to mitigate damages to the system:

1. **Global:** when the underlying collateral (like stETH, rETH) is worth less than the equivalent amount of ETH. (ex: stETH drops in value compared to ETH).

   It's not safe to assume that LSD ETH is worth `1:1` to ETH, even if most of the time it is. The risk of something like stETH de-pegging (as in the [past](https://www.nansen.ai/research/on-chain-forensics-demystifying-steth-depeg)) is less when withdrawals are open, but there is still smart contract risk. This kind of assumption was also broken with USDC given the events surrounding SVB.

2. **Local:** when ETH drops in value compared to the asset being minted (ex: ETH compared to `USD`) to the point where enough `shortRecords` become undercollateralized to break the price peg of the stable asset.

## Global Black Swan

The system does two things in this scenario:

- Prevents yield from being updated if the ETH value of the underlying LSD in a `Vault` is lower than the last saved value
- If `zethTotalNew <= zethTotal`, haircut anyone that exits the system (on withdraw)

> **Note**: There is no haircut for withdrawing ETH directly (`withdrawEth()`) because given the queue, someone that is entering the system by calling `depositEth` takes their place (replacing their collateral 1:1).

> **Note**: it is disadvantageous for a user to `withdraw()` in a time of negative yield due to the penalty fee but it is allowed.

- `updateYield()` calls `getZethTotal()` which gives us the total amount of zETH value in our system by adding up the zETH in every type of collateral where `total zETH = total stETH + total rETH`.
- `getZethTotal()` should usually be higher or at least equal to what was last saved in our storage, `s.uintVault[vault].zethTotal`. If not, we revert with `if (zethTotalNew <= zethTotal) revert Errors.NoYield();`
- If there is less zETH than before (like a slashing event), then the `getZethTotal()` will be lower. So to do a haircut amount, we ask that anyone that does a withdrawal out of the system to the underlying collateral to potentially pay a haircut fee to account for this loss in ETH.

So instead of withdrawing `amount`, they have to withdraw `amount.mul(zethTotalNew).div(zethTotal)`;

## Local Black Swan

### TAPP

The Treasury Asset Protection Pool (TAPP) is used for bolstering the stability of market pegged assets during periods of large price shock movements. It is shared across markets within DittoETH and thus any market has access to TAPP funds to prevent the default of low and under-collateralized `shortRecords`. Its various parameters can be managed by DAO controlled governance voting.

The TAPP is funded when DittoETH takes a tithe from earned rewards of staked ETH and also from Primary Margin Call penalty fees. The fund generally attempts to pay back the under-collateralized debt and any penalty or gas fees that need to be distributed when a liquidated `shortRecord` lacks the collateral to do so itself. In events when the CR of a shorter is below 1, the Primary Margin Call method will use the TAPP to take on losses of the under-collateralized shortRecord.

The TAPP will also be contributed additional zETH when a shortRecord's CR is below or equal to 1.1. When a `shortRecord` is margin called with a CR at these levels, any remaining collateral that was not used to settle the debt will be given to the TAPP, and the shorter will be returned nothing.

> **Note**: In the future, when the TAPP is sufficiently large enough, the community may choose to distribute fees earned on the protocol to the governance token holders.

When a `shortRecord` is margin called through the primary `liquidate()` method and it does not have enough zETH to pay down its debt, as well as cover penalty and base gas fee reimbursements, the TAPP will automatically be used. In these instances, the TAPP's zETH balance will be used as the forced bid for the margin call. Afterwards, the entire collateral of the `shortRecord` will be given to the TAPP and the `shortRecord` will be closed out with nothing. However, if the forced bid can only settle a portion of the debt, then the remainder of collateral will remain with the TAPP and not be given back to the shorter. Effectively, the `shortRecord` will be given to the TAPP. This will occur in cases when there are not enough orders to perform a full margin call.

> **Note**: It is possible the TAPP could be used above 1.1, if base gas fees are very high. In this situation, since the TAPP will be needed to cover the base gas fees to close the shortRecord, the shorter will lose all remaining collateral and be closed out. This will occur because the`shortRecord`will put the CR below 1.1 after accounting for base gas fees.

Most likely these approaches will not be needed. The system has a large number of ways to mitigate the risks of a black swan unwind, including requiring high CR to create a `shortRecord` and the fact that TAPP will receive zETH accumulated over time from the fee charged to the overall yield of the protocol.

### Redistribution

When ETH value as collateral drops precipitously and the `TAPP` has low amounts of zETH, all orderbooks have the same mechanism in place to save the asset peg by always allowing execution of margin calls. Instead of freezing the market upon the first instance of an under-collateralized `shortRecord`, the unbacked asset debt is socialized over every `shortRecord` in proportion to each position's `ercDebt` balance. As long as the CR of the entire system is above 1, this allows market operations to continue indefinitely and undisturbed unless:

1. The DAO steps in and freezes/dissolves the market
2. The max `ercDebtRate` is reached (uint64 max ~18.45x)

`ercDebtRate` is calculated as `ercDebt[socialized] / (ercDebt[Asset] - ercDebt[socialized])` and is written to every `shortRecord` record to modify each position's `ercDebt` amount. This functions in the same manner as yield rate, but affects the asset debt instead of zETH. The formulation of `ercDebtRate` is as follows:

- `short.collateral` is added to `s.vaultUser[m.vault][address(this)].ethEscrowed` (where address(this) = TAPP) and checked against `m.ethDebt`, where `m.ethDebt = m.short.ercDebt.mul(m.oraclePrice).mul(m.forcedBidPriceBuffer + m.tappFeePct + m.callerFeePct)`. This checks against the worst case scenario of a forced bid match at `oraclePrice * forcedBidPriceBuffer` and the subsequent fees. If this condition is not met, `ercDebt` is removed from the `shortRecord` to the point where a worst case forced bid can be guaranteed fulfillment. Thus, `tappFee`, `callerFee` and the possibility of a full liquidation are guaranteed by the removal of `ercDebt`.
- The `ercDebt` removed from the `shortRecord` is then socialized among all remaining `shortRecords` of the asset order book by an increased `ercDebtRate`.

Assuming `minimumCR = 1.1, forcedBidPriceBuffer = 1.1, tappFee = 2.5%, callerFee = 0.5%, CR Combined = ethEscrowed (short collateral + Tapp balance) against ercDebt, loseCollateral = shorter loses leftover collateral`:

| Short     | TAPP     | CR Combined | Description           | loseCollateral |
| --------- | -------- | ----------- | --------------------- | -------------- |
| CR = 1.13 | CR = 0   | 1.13        | ercDebtSocialized = 0 | No             |
| CR = 1.12 | CR = 0   | 1.12\*      | ercDebtSocialized > 0 | Yes            |
| CR = 0.90 | CR = 0.5 | 1.40        | ercDebtSocialized = 0 | Yes            |

> **Note**: It is possible for a shorter to be penalized at a CR higher than the minimumCR when the TAPP is low or empty in order to guarantee liquidation execution. In the highly unlikely scenario of a low/empty TAPP, it is arguable that we have already entered black swan territory, hence the over-conservative reallocation of ercDebt to save the asset peg. See (\*)

### Emergency Market Shutdown

In the event a market cannot be salvaged by redistributing bad debt to other `shortRecords`, anyone can permanently freeze that market by calling `shutdownMarket` once the CR of the entire asset breaches the threshold set by `minimumCR`.

- It is assumed that `shutdownMarket` will be called shortly after the c-ratio of the asset falls since the last saved Oracle price before freezing is used to facilitate asset conversions back to zETH.
- It is in the best interest of asset holders to freeze the market and guarantee redemptions closer to par, but in case of delay the DittoDao is able to call this function as well.

In this worst case scenario, the asset will need to be discontinued and a redemption claims process (`redeemErc`) automatically becomes available:

```solidity
amtZeth = amtErc * price * assetCR;
```

- `amtErc` can be redeemed from one of or both Wallet balance and Escrow balance
- price is the last saved oracle price
- if `assetCR` is between 1 and `minimumCR > 1`, collateral is sent to TAPP to make `assetCR = 1`
- `assetCR` less than 1 is unmodified

The redemption mechanism functions similarly to the secondary liquidation methods which allow redemptions of asset from wallets and escrowed balances. However, instead of targeting a specific `shortRecord`, all of the collateralized zETH is bundled together into one singular balance whereby asset holders can make automatic redemptions based on the frozen price and assetCR. Due to market closure, there is no need to track individual `shortRecords` and at this point all shorter collateral is lost. To reinstate the asset orderbook, a new contract will need to be established.
