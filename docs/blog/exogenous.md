<script setup>
import Author from './Author.vue'
</script>

# DittoETH Introductory Series - Part 2 (endogenous vs exogenous)

<Author  />

Welcome to Part 2 of the DittoETH introductory series. The inaugural [post](/blog/stablecoins) covered the current landscape of decentralized stablecoins in order to understand how DittoETH fits into this ecosystem.

Part 2 specifically focuses on why DittoETH uses exogenous collateral.

- [Part 1 - Comparison of Decentralized Stablecoins](/blog/stablecoins)
- Part 2 - Endogenous vs Exogenous Cryptocurrencies
- [Part 3 - CDP vs Order Book](/blog/orderbook)
- Part 4 - Gas Comparisons of Decentralized Stablecoins (coming soon)

Decentralized stablecoins can be broadly categorized under two collateralization methods: endogenous and exogenous currencies. Endogenous refers to collateral that is embedded natively to the protocol or platform itself. As explained in the previous post, the largest stablecoins that use endogenous collateral are Synthetix, Ampleforth and Beanstalk. Conversely, exogenous means the collateral is external to the protocol.

### Endogenous

Bitshares was the very first and early implementation of decentralized stablecoins that used their own currency BTS to collateralize pegged assets. However, because BTS was only used within the Bitshares system and for the purposes of collateralizing, there was very little natural outside demand for the currency. As a result, it suffered from the high fluctuating prices of BTS, which over time led to more and more collateralizers getting liquidated and exhausted out of the system. Soon the system had very few who wanted to participate.

The largest case of an endogenous currency failing was Terra Luna, where users staked native token LUNA to create pegged assets of TerraUSD, in exchange for yield. Terra Luna was unable to withstand the price collapses of crypto that took place in 2022, and perhaps noteworthy is speculation that the LUNA crash took place because a larger holder sold their LUNA to maliciously attack the protocol. Regardless, the sell-off caused a cascade of reactions that led to a fast crash of the endogenous currency. Soon, TerraUSD became undercollateralized and the system eventually de-pegged and never recovered.

The Terra Luna de-peg is a case study of the vulnerabilities of using an endogenous currency with the sole purpose of creating pegged assets:

1.  It is very hard to bootstrap.
2.  Since the liquidity of the endogenous currency is thin, it will be subject to manipulation. Whales can more easily manipulate the price and effect the functioning of the system.
3.  Endogenous currencies have little intrinsic value, and value is derived from what someone else thinks it's' worth. What is the network value of the currency? Why would anyone want to use it for anything outside of collateralizing? The value is nothing if the collateral was created for the sole purpose of being collateral.
4.  Terra Luna was not backed by anything other than their own coin. Thus, using an endogenous currency means that there are fewer users in the system, which leads to less active users who are willing to create and collateralize pegged assets. In a scenario of falling prices, there are very few buyers who are willing to buy the currency to avert the price from falling.

### Exogenous

Decentralized stablecoins using exogenous currencies can offer more resiliency and stability because the market, seeing that the coin has network value, offers strong buying support when the pegged asset price falls. Using Ether is the ideal collateral because of it's intrinsic value on mainnet, where DittoETH will be deployed.

DittoETH will use ETH liquid staking tokens (LSTs) to collateralize stable assets. LSTs are becoming the defacto derivative of Ether because it gives the user the passive yield from staking. For these reasons, most protocols are moving towards collateralizing using LSTs.

As Ethereum's adoption continues, the potential number of users entering the DittoETH system will grow and naturally allow for more pegged assets to be minted beyond USD such as EUR, RMB, and GLD.

The next post in the series focuses on CDP vs Order Books, and why DittoETH introduces a novel update on order books for creating stable assets. Follow the project on [Twitter](https://twitter.com/dittoproj)!

―Ditto
