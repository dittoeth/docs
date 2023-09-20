<script setup>
import Author from './Author.vue'
</script>

# CDP vs Order Book

<Author  />

You've made it to the third entry in the multi-part series introducing DittoETH, a new decentralized stablecoin protocol on Ethereum. If you haven't read them yet, consider catching up on the series:

- [Part 1 - Comparison of Decentralized Stablecoins](/blog/stablecoins)
- [Part 2 - Endogenous vs Exogenous Cryptocurrencies](/blog/exogenous)
- Part 3 - CDP vs Order Book
- Part 4 - Gas Comparisons of Decentralized Stablecoins (coming soon)

In this post the focus will be on CDPs vs Order Books and why DittoETH has made certain design choices for integrating Order Books into the protocol.

Collateralized Debt Position (CDP) is a system first created by MakerDAO which locks up crypto as collateral within a smart contract. Users are then able to issue an IOU, in the form of stablecoins at a specific price, against their escrowed collateral. With this lended stablecoin, users can then take it and sell on the market. The terms in which to settle the debt are written into the smart contract and executed when the stablecoin is returned. As a result, prior to closure of the debt, users are exposed to fluctuations in prices of the stablecoin relative to their escrowed collateral.

Most protocols, such as MakerDAO, SNX and LQTY, issue stablecoins using CDPs that are pegged to the US dollar. The overall goal of the CDP is to mint a stablecoin that is backed by an underlying cryptocurrency at various ratios, which is subject to market fluctuations.

> Unlike a CDP backed stablecoin, a centralized stablecoin (USDC, USDT and PAX) are claimed to be backed by redeemable dollar holdings within external financial institutions.

However, CDPs have a few drawbacks. It creates a reliance on external decentralized exchanges to sell the stablecoin asset. This can lead to fragmented liquidity depth and therefore price deviations as the CDP creator that does not want the stablecoin will need to sell it for another crypto asset. Dependency on external exchanges, mostly AMMs, means very large traders can impact the spot price by selling into the AMM. This is unfavorable for maintaining the peg price and creates a point of friction that makes it unsuitable for very large trades at once.

Users have become accustomed to using CDPs for minting stablecoins, but this was not always the original method in the earlier days of crypto. The first decentralized stablecoin platform Bitshares (by Dan Larimer) also used an order book to create pegged assets[^fn1]. An order book is simply a list of buy and sell orders for a specific asset. Limit orders give users the matched price that they want, if they are willing to wait for the order to be filled at an indeterminate time in the future.

When making stablecoins on smart contract platforms like Ethereum, developers from the very beginning moved away from the order book in favor of CDPs, arguing that order books are too cost prohibitive to employ. But over the years there has been an emergence of a pursuit to try to add “limits order” features that are inherent to order books like with Uniswap and CoW Swap. Polymarket, another prediction market platform, began using AMMs at first, but has since moved towards using off-chain Central Limit Order Books (CLOB). The crypto community has yet to see another order book deployed for creating stablecoins.

Overall, the order book has several advantages over CDPs. The ability to handle more liquidity and transaction throughput through limit orders can help maintain the spot price. The garnering of more liquidity in-house can also allow for a stronger peg, as written about by Liquity in their blog stating some of the shortcomings of a CDP:

> “Despite this, it still does not guarantee a hard peg of $1 due to the need to have liquidity for the stablecoin on external decentralized exchanges.”[^fn2]

Most importantly, order books allow for coincidence of wants, where two parties can exchange crypto assets aligned with their preferences. This contrasts with CDPs which impose extra steps by requiring a single user to mint and create a debt position at the same time. An order book would allow one user to create the stablecoin and another to simultaneously collateralize with secured crypto debt. This matching scheme with two separate users allows order books to more directly match users who only want pegged assets with users who only want to short that asset. The result is a more efficient process, as opposed to creating a CDP with the intent to sell the pegged asset. The user will have to mint, create the debt, and then also get rid of the stablecoin on an AMM for the crypto asset they prefer, which could drag on the newly minted stablecoin price. Moreover, what also needs to be factored in is the friction of another 150-200k in gas fees for the swap.

A side benefit to this efficient matching of wants and needs in an order book is the possibility for more obscure stable assets that very few people may want to be created, such as one tracking the Nikkei 225. It helps resolve problems that Synthetix once had: bootstrapping stablecoin markets for pegged assets like Tesla and GLD. Doing so is next to impossible for assets for which there is no AMM and will never be a large AMM for. Although CDPs give a user instant liquidity with themselves, it doesn't necessarily translate to more liquidity elsewhere. Thus CDPs can have hidden liquidity issues, since protocols often need to subsidize liquidity pools (Curve, Uniswap, Balancer, etc) outside of the platform. On the other hand, an order book can maintain the liquidity internally.

At a minimum, an order book can be superior to a CDP because it can replicate the functions of a CDP if users so choose, by matching with themselves on the order book.

It is worth noting that AMM providers take on heavy risks in exchange for rewards gained through inflation of some other coin. When the price moves strongly in one direction, they face losses from rebalancing that will tend to be greater than the fees collected for providing the liquidity. This is all in an effort to provide standby liquidity to help users move from one asset to another. AMMs do however have an advantage where liquidity can be bootstrapped from a handful of individuals users.

---

In summary:

Orders allow for the exchange of assets directly without any monetary medium, for which orders can be created or filled at any time and for any market.

### Order Book Advantages:

1. More efficient price discovery, eg. what you ask for is what you get
2. Double coincidence of wants pairing makes for less friction without need to send to AMM, which can depress spot price
3. Houses liquidity internally for a stronger peg
4. Can better handle large market makers and large trades
5. Can replicate a CDP if needed
6. Tried and true approach in TradFi

### Order Book Disadvantages:

1. For smaller markets, illiquidity often means a dead market
2. Potential for higher gas costs that increases proportionally with each order matched
   - In high order matching, gas costs can exceed block gas limit leading to failed transactions

### CDP Advantages:

1. Instant liquidity with yourself
2. Potentially lower gas costs

### CDP Disadvantages:

1. Require external market (often subsidized) to exchange the stablecoins, usually an AMM
2. Highly inefficient for lower demand stablecoin assets that do not have an AMM

On the Ethereum mainnet there have only been a few real full implementations of a CLOB that includes an on-chain matching engine, such as Augur and Clober. DittoETH will add to this short list, a new protocol that has optimized the order book in a way that can be just as cheap (if not more) as opening a CDP on other DeFi platforms. It uses an order hint system to save users gas fees when placing limit orders, compact struct packing, and re-using order structs to do so.

The next and final blog post in the series will examine these gas costs in comparison with other projects that mint stablecoins.

A new day arrives for decentralization.

―Ditto

[^fn1]: https://bitcointalk.org/index.php?topic=223747.0 & https://github.com/BitSharesEurope/bitshares-whitepapers/blob/master/pdfs/bitshares-general.pdf
[^fn2]: https://www.liquity.org/blog/introducing-liquity-v2
