<script setup>
import Author from './Author.vue'
</script>

# Gas Comparisons for Decentralized Stablecoins on Ethereum

<Author  />

Here it is! My fourth and final entry in the multi-part series introducing DittoETH. In this post, I will cover the state of decentralized stablecoins on Ethereum and give a gas comparison of each. Be sure to catch up on the other parts of the series if you haven't yet:

- [Part 1 - Comparison of Decentralized Stablecoins](/blog/stablecoins)
- [Part 2 - Endogenous vs Exogenous Cryptocurrencies](/blog/exogenous)
- [Part 3 - CDP vs Order Book](/blog/orderbook)
- Part 4 - Gas Comparisons of Decentralized Stablecoins 

There have been various attempts to create decentralized stablecoins, either using ETH as collateral or a protocol's own endogenous currency. MakerDAO was the first in 2017, introducing the concept of using a CDP (collateralized debt position) for opening and minting the stablecoin.

A year later, the first endogenous stablecoin, Synthetix, was released, followed by two other protocols that could be categorized as using their own endogenous token: Ampleforth and Beanstalk. While there have been others, many have failed since then, as endogenous currencies face potential breakdowns when demand for the token dries up. These protocols all employ various methods to mint their pegged asset.

| | Synthetix | Ampleforth | Beanstalk |
|:--|:--|:--|:--|
| Year Launched | 2018 | 2019 | 2021 |
| Description | Initially synthetic assets protocol using its own token SNX for collateralization | Stablecoin that is backed by internal rebasing token | Uses a dynamic peg mechanism with their endogenous token that incentivizes users to maintain a stable price |
| Stablecoin Name | sUSD | AMPL | Bean |
| Pegged Asset | USD | USD | Soft peg to USD |
| Collateral Type | Endogenous: SNX | Endogenous: AMPL | Endogenous: BEAN |
| Method | CDP | Contracting and<br>Expanding Supply | Contracting and Expanding of debt-based supply that is sold to external exchanges |

There are currently a few unique protocols that use exogenous collateral, specifically ETH. The most notable projects that differ from MakerDAO are RAI, Liquity, and crvUSD.

| | MakerDao | RAI | Liquity | GHO | crvUSD |
|:--|:--|:--|:--|:--|:--|
| Year Launched | 2017 | 2021 | 2021 | 2023 | 2023 |
| Description | First stablecoin platform on Ethereum | Decentralized and immutable floating stablecoin | Decentralized and immutable stablecoin with interest free borrowing | Decentralized multi-collateral stablecoin, fully backed, transparent and native to Aave Protocol | Curve native stablecoin using LLAMMA for soft, continuous liquidations. Turns collateral into AMM that rebalances in price fluctuations. |
| Stablecoin Name | DAI | RAI | LUSD | GHO | crvUSD |
| Pegged Asset | USD | Floating to USD | USD | USD | USD |
| Collateral Type | Exogenous: RWA, USDC,<br>ETH, LST, etc | Exogenous: ETH | Exogenous: ETH | Exogenous: Various | Exogenous: ETH LST's,<br>wBTC, and tBTC |
| Method | CDP | CDP | CDP | CDP | CDP |
| Minimum Debt | 5,000 DAI | ~3809 RAI | 2,000 LUSD | Various | No Minimum |
| Fees | 1-3% Variable Annually | 0.5% Variable | 0.5% - one time of debt | 1-5% Variable | 1-5% Variable |
| Minimum C-Ratio | ~185% | 135% | 110% | Various | Various |
| Debt name | Vault | Safe | Trove | Vault | Vault |
| Liquidation Fee | 10-33% | 10% | 200 LUSD + 0.5% of the<br>Trove's collateral | Various | At least 1% |

RAI was co-founded and architected by Nikolai Mushegian, an early and influential developer who primarily worked on MakerDAO and Bitshares. He built RAI out of dismay with the centralization taking place within MakerDAO. RAI functions differently from other stablecoins. Instead of aiming for a fixed price pegged to an asset, RAI floats and gradually veers towards a stable price over time. RAI is an intriguing stablecoin that remained true to the principles of immutability and decentralization. How could we have expected anything less from Nikolai? The only downside was its slow-moving peg to the ETH/USD price, resulting in it being over/under pegged throughout its duration. Ideally, users should have a more reliable fixed peg.

Liquity is a decentralized stablecoin that, like RAI, is censorship-resistant and exists without embedded governance in the protocol. Thus, Liquity is immune to oversight and regulation from centralized authorities and institutions. Instead of using liquidation functions to manage and remove bad debt from the system, Liquity employs a redemption mechanism allowing any LUSD user to redeem for the appropriate amount of ETH according to the oracle price. This mechanism functions like a bank, allowing convertibility of money in the bank account to cash at any point in time, which gives LUSD its underlying floor price.

CrvUSD is one of the more recent overcollateralized stablecoins that uses a method called Lending-Liquidating AMM Algorithm (LLAMMA). It essentially turns one's collateral into an LP position in an AMM that will rebalance during price changes. CrvUSD innovates on other stablecoins by allowing positions to be softly converted into other assets through AMMs or slowly liquidated over time via the LLAMMA mechanism. As a result, it can reduce risk and losses borne by the borrower compared to other systems. This design allows it to closely mimic Uniswap's V3 pools, where liquidity can be spread across different price points.

How does DittoETH compare to the rest? DittoETH is the first DeFi project on Ethereum to create a stablecoin using an order book instead of a CDP. Thus, one user can bid solely for the minted asset, such as dUSD, while another separate user can back the dUSD with ETH or ETH LSTs. Read [CDP vs Order Book](https://dittoeth.com/blog/orderbook) for more about the differences between the two approaches.

| | DittoETH |
|:--|:--|
| Year Launched | 2024 |
| Description | Decentralized stable asset protocol that uses an order book |
| Stablecoin Name | dUSD |
| Pegged Asset | USD |
| Collateral Type | Exogenous: ETH LST's |
| Method | Order Book |
| Minimum Debt | 250 - 2,000 dUSD |
| Fees | 10% of yield to fund insurance TAPP |
| Minimum C-Ratio | ~170% (initially at launch) |
| Debt name | Short Record |
| Liquidation Fee | At Least 5% |

When comparing the various gas costs of each exogenous protocol, DittoETH's costs are comparable, if not cheaper, than the other projects despite using an order book.

| | DittoETH | MakerDao | Synthetix | RAI | Liquity | crv | Gravita[^1] | Prisma[^1] | GHO |
|:--|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Open CDP[^2] | 474k | 596k | 459k | 611k | 527k | 1.1m | 587k | 656k | 619k |
| Increase Collateral | 90k | 234k | N/A | 225k | 316k | 845k | 344k | 394k | 317k |
| Decrease Collateral | 93k | 252k | N/A | 235k | 319k | 845k | N/A | N/A | 377k |
| Close CDP[^3] | 228k | 434k | 455k | 412k | 619k | 1-2m | 507k | 540k | 677k |

To compare between protocols[^4], I calculated what it would take to create a CDP on DittoETH, which is still possible on an order book. This means a single user has to create both the minted asset and the short debt position backing it. Normally, an order book would only require a user to be on one side, which is more efficient compared to a CDP. The cheapest protocols for opening a CDP were Synthetix and DittoETH, using roughly ~460,000 in gas. This held true even when adjusting the collateral or closing the CDP. The most expensive overall was crvUSD, mainly due to the gas fees consumed when managing other AMMs.

Based on these comparisons, DittoETH represents a significant breakthrough for decentralized stable assets through its gas-optimized order book. Even when matching with a high number of 20 orders, the gas fees of DittoETH are still relatively similar to crvUSD. This raises an interesting point: it could be said that CDPs have been obfuscating and outsourcing their gas costs to AMMs, which can be quite high during the initial setup. Additionally, AMMs are often subsidized at the beginning to bootstrap liquidity. It would seem more efficient to have the liquidity in-house on the order book instead of having to bootstrap liquidity elsewhere on an AMM, which creates friction and fragmentation in liquidity depth.

| # of matches on order book | DittoETH gas costs |
|:--|--:|
| 5 Matched Trades | 530k |
| 10 Matched Trades | 833k |
| 20 Matched Trades | 1,608k |

It's no surprise that DittoETH has similar or even lower gas costs compared to other stablecoin CDP protocols, as I've spent an enormous amount of thought and time optimizing it from scratch rather than foroking an existing codebase. 

It's now entirely feasible to use an order book on Ethereum mainnet. DittoETH will bring back into the fold important concepts that were lost when CDPs became the norm for minting pegged assets.

If you're curious, give DittoETH a try for yourself. It is now up and running at [ui.dittoeth.com](https://ui.dittoeth.com).

[^1]: Fork comparisons, forks of Liquity that use LST's
[^2]: this includes depositing collateral
[^3]: this includes repaying and withdrawing collateral
[^4]: see https://gist.github.com/ditto-eth/b105edd3e623c9dd9eca367fb04c053d