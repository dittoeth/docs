<script setup>
import Author from './Author.vue'
</script>

# Refreshing DittoETH

<Author  />

> August 15, 2024

Today marks the 53rd anniversary when President Richard Nixon ended the Bretton Woods System on August 15, 1971— what we have come to know as the termination of the Gold Standard. In response, I am releasing the next set of updates to DittoETH, to drastically enhance usage and bring it to feature completion. I have worked very hard and diligently on this upgrade to address the outstanding issues related to DittoETH. There are a total of six new major features:

- Redemption Mechanism
- Algorithmic Interest Rate 
- Leveraged Short Positions
- Enforced Minimum Short Record Debt Requirement
- Bridge Enhancements (dealing with arbitrage between LST)
- Recovery Mode

### Redemption
DittoETH now has a Redemption Mechanism that is inspired by Liquity but with two significant differences. The first is that while Liquity maintains a sorted list of debt positions, DittoETH will not. Instead, DittoETH requires redeemers to submit a sorted slate of debt positions. The system will validate whether the provided slate is properly sorted by risk. This removes the need for maintaining a sorted list, which provides significant gas savings. The second difference is the introduction of a dispute period, allowing anyone to challenge whether the proposed slate is incorrect. Once the dispute period is over, the redeemer can claim the ETH owed to them. For more information on this, check out this [post](https://dittoeth.com/blog/redemptions
).

### Algorithmic Interest Rate
DittoETH will now have a mechanism to charge shorters a fee if dUSD is traded at a discount on the order book. This fee will be given to dUSD holders as yield. As with the Redemption Mechanism, read more about this new feature [here](https://dittoeth.com/blog/interest_rate).

### Leveraged Short Positions
As time passes, DittoETH will have the ability to allow shorters to create short records at lower CR (as low as 110%). This can be done as soon as the TAPP has enough funds to handle potential undercollateralized bad debt. Once in place, a shorter would only need to put up 10% of collateral to match on the order book, creating a leveraged position of 10X. This is possible because of the distinct advantage that an order book has over a CDP. Order books allow two separate users to bring capital needed to mint Ditto assets. A bid brings 100% of the ETH to back the asset minted, and the shorter would only need to bring a fraction of that. The short position's initial CR will then be whatever the shorter brought in plus the 100% that came from the bidder. This ability for short records to become highly leveraged will be a powerful tool for traders who want to speculate on the price of ETH rising.

### Enforced Minimum Short Record Debt Requirement
DittoETH will have a minimum short record debt requirement, which currently will be set at $250 for dUSD. This is to manage dust amounts on the order book as well as to ensure that redeeming/liquidating a short record is always profitable. When a short order is placed on the order book, it must have enough collateral to create $250 for the price and CR they are seeking. If the short record is partially filled and cancelled prior to it being fully filled, then the short record will become a CDP for the remaining portion where the resultant debt amount will rise to the minimum $250.

### Bridge Enhancements
There are also updates to the Bridges with regards to depositing and withdrawing. Previously, DittoETH gave users the LST based on their choice. Since the LST’s are co-mingled, there was the possibility of incurring a fee. The new bridge update will be more precise to ensure users do not drain one LST in favor of another. First, the system records the type of LST that the user deposits in the form of credit. Upon withdrawal, the user will then withdraw first from the LST they have credit for. If the remaining withdraw amounts for a given LST exceeds that of the deposited amount, the user will incur a commensurate fee. This fee is determined by the LST discount to ETH on the LST pool oracles.

### Recovery Mode
DittoETH will now have a Recovery Mode to maintain enough collateral during sell-off market swings. In DittoETH, each asset (like DUSD) has its own recoveryCR. DittoETH compares the system-wide assetCR to the recoveryCR whenever certain functions are called. When the assetCR is at Recovery Mode levels, certain exceptions are allowed, while others are prevented. For example:

- **Allow**: Primary Liquidation can occur higher than the usual CR (up to the recoveryCR) if the assetCR is itself lower than the recoveryCR
- **Prevent**:
    - Creating a Limit Short Order: if it's created at a CR that makes the assetCR low enough to hit recovery mode
    - Decreasing Collateral: if it lowers the assetCR low enough to hit recovery mode

This Recovery Mode will be important to ensure that the overall system is collateralized to at least 150% and is far away from having fractional reserves. This feature was introduced to enable the creation of leveraged short positions, while protecting the system so that the leveraged short positions do not drag the system's CR below 150%.

---

These upgrades were audited in various private and public Code4Arena and Codehawks contests. You can start using DittoETH with these features now. Stay tuned for our upcoming incentives program for those who use DittoETH.

-Ditto

