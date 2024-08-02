<script setup>
import Author from './Author.vue'
</script>

# New Feature #2 - Interest Rate Yield

<Author  />

## Introduction:

One of DittoETH’s biggest features in the upcoming upgrade is dynamic yield earnings for dUSD holders. These holders can lock their assets into an xERC4626 tokenized vault in exchange for new shares in the form of yDUSD (abbreviated for yield DUSD). The main intent of this feature is to reward holding dUSD and to disincentivize shorters from keeping their debt positions open during times when dUSD is trading at a discount. This feature introduces a powerful, market driven way to help restore the price peg of the underlying dUSD asset.

## Why is this needed:

DittoETH already has means to restore the peg in the form of liquidations and redemptions, so why is this feature needed? Other protocols have a redemption mechanism that track all debt positions from least collateralized to most, where the least collateralized are always redeemable on a rolling basis. Perhaps one unintended consequence of this design choice is that over-collateralized positions are at risk of redemption. Recently, positions with over 500% CR were redeemed in these protocols simply because they were the least collateralized. I believe the spirit of debt redemptions is to effectively rid the system of potentially unhealthy debt, not to haphazardly redeem them on the mere basis of being the least collateralized in the system. This is why shorts (i.e. debt) are only eligible for redemption in DittoETH if they have a CR less than 200%.

Thus, liquidations and redemptions should be sufficient in restoring the peg, except for the scenario where dUSD is trading at a discount and none of the debt positions have a CR under 200%. For example, this can occur when ETH is appreciating quickly over a short period of time and the market is willing to divest from dUSD into ETH at a discount. In these cases, it benefits the system if users opt to hold onto dUSD or if debt positions are closed out, which causes buy pressure for dUSD while making it scarcer. Hence, this yield feature for dUSD holders is needed.

## How does it work:

Earlier, I mentioned that this feature “disincentivize[s] shorters from keeping their debt positions open”. But how does yield for dUSD holders help with this? DittoETH aims to do this by having the dUSD yield be sourced by fees incurred to shorters. Essentially, when the dUSD being sold at a discount hits a volume threshold, each debt position incurs a 0.1% increase to their debt owed. At the same time, the system mints that 0.1% additional debt to the aforementioned xERC4626 yDUSD vault. As a result, any users holding onto yDUSD will be eligible to exchange for more dUSD than they deposited.

## Additional Details:

There are multipliers applied to any discounted match to expedite the likelihood of hitting the threshold. One is a flat 10x multiplier applied, and the other is a time based one that represents the number of days elapsed since discounts started happening. The time based multiplier is capped at 14 days and resets after the first non-discounted match happens. These multipliers are included to further act as a deterrent to trading at a discount. The longer discounts are happening, the harsher the penalty should be. While small in magnitude, the fee incurred can happen frequently enough during extended periods of discounted trading, making it costly to continue doing so. Additionally, whenever non-discounted trades happen, the tracked volume of discounted dUSD sold is reduced commensurately. However, there is no multiplier attached to this reduction so the rate of hitting the threshold is higher than the rate of reduction. This is to further deter discounted trades from happening.

## Conclusion:

This implementation allows for an algorithmic fee that is driven by market forces rather than set by a central party. Since fees are charged as debt, this allows dUSD holders to continue to earn yield in dUSD, since that is the asset they are seeking rather than giving them LST ETH. Overall, this mechanism is intended to drive dUSD back towards peg without making the system more collateralized than it needs to be.

Two of the largest new features to DittoETH in this upgrade, redemptions and interest paid to dUSD holders, will enable DittoETH to be a feature complete platform that enhances the overall stability of pegged assets. I am excited to finally invite others to try this Decentralized Stableasset platform.

Stay tuned for more information on this launch.
