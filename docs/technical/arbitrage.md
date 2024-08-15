# Bridge Credit System

A unique problem arises for any `Vault` that accepts more than one LST as collateral: arbitrage. Currently this only pertains to `Vault.ONE` which holds both stETH and rETH.

In order to mitigate predatory arbitrage in the bridges, a fee and credit system based on the stETH/rETH market premium/discount has been implemented to protect honest users of the system during bridge deposits and withdrawals.

# LST Arbitrage:

rETH and stETH can at any time trade at a premium or at a discount relative to their underlying value. If users can deposit and withdraw into and out of DittoETH using LST par value, then whenever one LST is trading at a premium to the other, the bridge of the LST deemed more valuable by the market will be drained and the bridge of the LST deemed less valuable will be stuffed. Consequently, honest users who bring their preferred LST into the system may be forced to withdraw a different LST.

# Fees:

One way to protect users is to implement a flat fee on all withdrawals. However, to accurately react to market trends would take an enormous amount of oversight from the DittoDAO/admin roles and hurt one of the protocol's main long-term goals: decentralization.

Thus, DittoETH employs a dynamic fee to protect the integrity of the bridges. The fee is designed to capture the premium/discount differential between rETH and stETH by comparing the reported ETH value from Rocketpool and Lido with the UniswapV3 rETH/ETH LP and UniswapV3 wstETH/ETH LP, respectively. An important distinction is the fee is based on the differential and not solely a premium or discount. For example, if rETH is trading at a 1% premium and stETH is trading at a 1% discount, a user would be charged ~2% (101/99) fee on rETH withdrawn. Conversely, withdrawing stETH in these conditions would incur a 0% fee. Another example is both stETH and rETH are trading at discounts of 1% and 2%, respectively. In these conditions, a user trying to withdraw stETH would incur a (99/98) ~1% fee even though both are discounted by the market, because the fee is based on the relative difference in premium/discount and not the absolute premium or discount.

> **Note**: Withdrawing the LST trading at a relative discount incurs a 0% fee (instead of a negative fee/bonus) because deposits into DittoETH are escrowed according to the underlying value reported by Rocketpool and Lido and not market conditions.

# Credit System:

Since the fee exists to target arbitrage that is harmful to DittoETH users, a withdrawal credit system is also implemented to remove fees up to user principal. Upon depositing LST into the bridges, each user is given credit by the system to withdraw fee-free up to that amount. For example, if a user brings 1 stETH into the protocol, gains 0.5 ETH yield and withdraws 1.5 stETH, they only pay fees on the extra 0.5 ETH and only if stETH is trading at a relative premium to rETH.

In order to ensure that the credit system works as intended, an extra stipulation is that users are required to use their bridge credit when withdrawing. Users who enter with rETH must leave with rETH, and users who enter with stETH must leave with stETH. This helps maintain the natural LST distribution of the `Vault` and prevents users from entering DittoETH with the sole purpose of just swapping LST. There is also no unstaking offered directly through DittoETH to avoid complications surrounding the credit/fee system.

However, there are two exceptions when the credit withdrawal restriction does not apply:

1. When a user has zero credits left, they can choose which bridge to withdraw from. This should only happen when a user is leaving the system with more LST than they entered with due to trading gains and/or yield, and can only happen after a user has completely exhausted existing bridge credits.
2. If the bridge corresponding to the credit a user holds is empty, they may apply their credit to the other bridge at a 1-1 ratio.

While completely preventing arbitrage is likely not possible, the dynamic fees are intended to be accurate/high enough to prevent arbitrage enough to the point where the natural LST distribution is maintained. The dynamic fee in addition to gas fees and any third party fees (ie. Uniswap) likely total enough to make arbitrage through DittoETH a rare occurrence.
