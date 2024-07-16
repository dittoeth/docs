<script setup>
import Author from './Author.vue'
</script>

# New Feature #1 - Redemptions

<Author  />

Until now, DittoETH relied on liquidations to bring the price of the pegged Ditto asset (ie. dUSD) back to parity. However, there are instances where the price does not track because people are selling the pegged asset for a like-kind asset, such as DAI.

In order to handle this, a redemption mechanism has been implemented to create a floor price and restore the peg. DittoETH’s redemptions harnesses ideas from Liquity’s methodology, while still maintaining the order book functionality. A user with the pegged asset can redeem from the lowest collateralized short and receive ETH at the oracle price in return.

A key difference from Liquity is that DittoETH’s approach has a slight delay inherent to the process. This is necessary because of DittoETH’s gas optimized design choice to not construct a sorted table of debt holders like Liquity. Instead, a dispute process exists that enforces correct redemptions from lowest CR to highest CR without the need for a literal sorted table.

Here are several assumptions that can be made about the redemption process:

1. Redemptions happen infrequently, or during certain important periods of time. According to Liquity’s QMT, only a fraction of the debt holders would need to be redeemed against in order to restore the peg. For example, if the Ditto asset price is below peg by 5%, only 5% of stablecoins is needed to be redeemed to restore peg.
2. Delayed redemptions are suitable, if within reason. There are already acceptable forms of delayed settlement taking place in crypto (e.g. going from L2 to L1) and traditional finance (ETF and mutual fund redemptions could take as long as three days). Yet the underlying assets still retain their face value.
3. Penalties, rather than reward incentives, are effective and acceptable forms of enforcement. This can be seen in the economics that underpins the vast majority of blockchains, for example Bitcoin POW and Ethereum POS.

## Proposals

Proposers create a "slate" of shorts for redemption (a slate is immmutable). Each short within the slate is then evaluated to see if it has been included correctly (i.e. Are all shorts under 2X CR? Are they sorted from lowest CR to highest CR?… etc). Invalid shorts are removed from the slate. Next, the slate is assigned a dispute period. The duration is determined by the short with the highest CR in the slate. The higher the CR, the longer the duration. If the highest CR in the slate is 1.1x or lower, redemptions are immediate there is no dispute period. But if the highest CR in the slate is 2x, then the dispute period is 6 hours. Here is a simple example: If a slate has 3 shorts, one with a CR of 1.1x, one with 1.2x and one with a CR of 2x, the dispute period would be 6 hours.

Additionally, the timestamp and the oracle price at the time of proposal are saved with the slate, which is necessary because redemptions do not happen immediately. When users dispute proposals, they need to use the saved oracle price as a reference point to prevent any malicious disputing.

Lastly, a Liquity inspired redemption fee is a calculated at the point of proposal and decays over time. Larger and more frequent redemptions result in higher fees. This is meant to slow down the rate of redemption. As mentioned in assumption #1 above, the system only needs a portion of redemptions to restore peg. Beyond that, redemptions are to be discouraged.

Before moving on, one thing to note is that proposals are optimistic despite the possibility of disputing. This means that all redemptions are assumed to be correct until proven otherwise. As such, the collateral and debt of the short is removed at the point of proposal, but can be restored if disputed correctly.

## Disputes

This mechanism is the key to enforcing redemptions in order. Without this, malicious users can propose higher CR shorts while ignoring lower CR ones, which can be quite unfair to the shorter being redeemed on. Within the dispute period, any user in the system can dispute an active redemption slate. The exception is that a proposer cannot dispute themselves. To dispute, a user provides any active short (disputing short) that has a lower CR than any of the shorts included in a proposed slate.

If the proposal is properly disputed and thus determined to be invalid, the disputer would be rewarded a fee while the proposer would incur a penalty. Subsequently, all shorts in the slate that have a higher CR than the disputing short would no longer be subject to redemption. A simple example, using the same 3 shorts mentioned above with 1.1x, 1.2x, and 2x CR. If a disputer provides a short with a CR of 1.15x, then the proposer would no longer be allowed to redeem the shorts with 1.2x and 2x CR, respectively. Those shorts would have their collateral and debt amounts restored based on amounts prior to proposal. Additionally, the proposer would incur a penalty based on the incorrect proposals. The more incorrect proposals, the larger the penalty.

But what about the scenarios where malicious users try to harm proposers? Let’s say they create a new short with a low CR after a proposal slate has been made. Or if they take an existing short and lower its CR to be lower than the proposed shorts. To protect proposers from this, the system compares the saved timestamp of the proposal with the last update time of the disputing short (Whenever a short is updated/created, the update time changes). If the disputing short’s last update time is less than or equal to the proposal time, then the disputing short is valid. An additional 1 hour buffer is also applied to protect against any delays experienced in the mempool.

Only after the dispute period ends, the proposer can claim the ETH from the shorts in the proposal.

## Final Considerations:

The redemption mechanism is only one way to restore peg. DittoETH will continue to retain the liquidation mechanism as a backstop for extreme scenarios where prices drop very quickly and there are no redeemers available to remove risky debt. Additionally, there may be instances where there is a lot of demand for ETH and not enough redemptions are allowed since the system only permits redemptions on shorts with CR under 2x. In these cases, DittoETH will rely on a dynamically shifting interest rate to rebalance the forces of supply and demand of the asset to bring back the price towards peg. More on this in another future post.

I'm really excited to see this upgrade and the few others in action. Make sure to follow me for the actual date of deployment of the latest DittoETH.
