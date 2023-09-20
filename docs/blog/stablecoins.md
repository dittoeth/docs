<script setup>
import Author from './Author.vue'
</script>

# DittoETH Introductory Series - Part 1 (stablecoins)

<Author  />

Welcome to the DittoETH introductory series! This is the first in a multi-part series introducing a new decentralized stablecoin protocol on Ethereum, DittoETH. In short, the protocol issues stable assets through the overcollateralization of exogenous cryptocurrencies, all via an Order Book.

This inaugural post covers the current landscape of decentralized stablecoins in order to understand how DittoETH fits into this ecosystem, while also highlighting some of the unique differences and benefits that DittoETH vitally brings to the table.

Part 2 specficially focuses on why DittoETH uses exogenous collateral, and is followed by a deep dive into answering the question of _why use an order book?_ Part 4 features the gas optimized results of DittoETH compared to the protocols mentioned in Part 1.

- Part 1 - Comparison of Decentralized Stablecoins
- [Part 2 - Endogenous vs Exogenous Cryptocurrencies](/blog/exogenous)
- [Part 3 - CDP vs Order Book](/blog/orderbook)
- Part 4 - Gas Comparisons of Decentralized Stablecoins (coming soon)

### Stablecoins

Stablecoins are tokens without the volatility. Since its release in 2015, Ethereum has witnessed several attempts to create a [decentralized](https://vitalik.ca/general/2022/05/25/stable.html) [stablecoin](https://ethereum.org/en/stablecoins/), either using a protocol's own endogenous currency or ETH itself as collateral.

In 2017, MakerDAO introduced the concept of using a [CDP](https://blog.makerdao.com/dai-is-now-live/) (collateralized debt position) for opening and minting the stablecoin using ETH.

### Endogenous Protocols

Just a year later, Synthetix released the first endogenous stablecoin, and was followed by three other protocols that could be categorized as using their own endogenous token: Ampleforth, FraxUSD, and Beanstalk.

Of course there have been many other attempts, but most have imploded since then, as endogenous currencies face potential breakdowns when demand for the token dries up (more in the next post).

They all employ various ways to mint their pegged asset:

|                              | Synthetix |            Ampleforth            |                     Frax                      |                   Beanstalk                    |
| :--------------------------: | :-------: | :------------------------------: | :-------------------------------------------: | :--------------------------------------------: |
|        Year Launched         |   2018    |               2019               |                     2020                      |                      2021                      |
|       Stablecoin Name        |   sUSD    |               AMPL               |                     Frax                      |                      Bean                      |
|         Pegged Asset         |    USD    |               USD                |                      USD                      |                Soft peg to USD                 |
| Collateral Type (Endogenous) |    SNX    |               AMPL               |                 FXS and USDC                  |                      BEAN                      |
|            Method            |    CDP    | Contracting and Expanding Supply | fractional and algorithmic (prior March 2023) | Contracting and Expanding of debt-based supply |

Synthetix started with multiple kinds of synthetic assets, using it's own SNX token for collateralization. This explains the high CR of 500% (as of [2/27/23](https://docs.synthetix.io/staking/current-protocol-parameters) and also the [governance](https://sips.synthetix.io/all-sccp/) needed to continually adjust the target C-Ratio).

Ampleforth is a stablecoin that is backed by an internal rebasing token.

Frax was partially undercollateralized using their governance token FXS and USDC to algorithmically bring the peg price back into balance. More recently, due to the perception that FRAX was less safe because of this, the stablecoin has moved to full collateralization with plans to retire the algorithm in favor of using exogenous collateral such as USDC and FraxETH. Nonetheless, the usage of USDC adds centralizing properties to the stablecoin protocol.

Beanstalk uses a dynamic peg mechanism with their endogenous token that incentivizes users to maintain a stable price.

### Exogenous Protocols

Here are a few notable protocols that use exogenous collateral (in this case ETH):

|                             |        MakerDao         |       RAI       |                  Liquity                  |      GHO      |          crvUSD           |
| :-------------------------: | :---------------------: | :-------------: | :---------------------------------------: | :-----------: | :-----------------------: |
|        Year Launched        |          2017           |      2021       |                   2021                    |     2023      |           2023            |
|       Stablecoin Name       |           DAI           |       RAI       |                   LUSD                    |  GHO (Aave)   |      crvUSD (Curve)       |
|        Pegged Asset         |           USD           | Floating to USD |                    USD                    |      USD      |            USD            |
| Collateral Type (Exogenous) | RWA/USDC, ETH, LST, etc |       ETH       |                    ETH                    |    Various    | ETH LST's, wBTC, and tBTC |
|           Method            |           CDP           |       CDP       |                    CDP                    |      CDP      |            CDP            |
|        Minimum Debt         |        5,000 DAI        |    ~3809 RAI    |                2,000 LUSD                 |    Various    |        No Minimum         |
|            Fees             | 1-3 % Variable Annually |  .5% Variable   |          .5% - one time of debt           | 1-5% Variable |       1-5% Variable       |
|         Minimum CR          |          ~185%          |      135%       |                   110%                    |    Various    |          Various          |
|          Debt name          |          Vault          |      Safe       |                   Trove                   |     Vault     |           Vault           |
|       Liquidation Fee       |         10-33%          |       10%       | 200 LUSD + 0.5% of the Trove's collateral |    Various    |        At least 1%        |

MakerDAO originally started off using only ETH, but unfortunately has incorporated centralized stablecoins such as USDC and is moving towards Real World Assets to back the stablecoin.

RAI was co-founded and architected by Nikolai Mushegian, an early and influential developer who had chiefly worked on MakerDAO and Bitshares. He built RAI, dismayed with the centralization that was taking place with MakerDAO. RAI worked differently from other stablecoins; instead of trying to have a fixed priced to a pegged asset, RAI would be floating and over time would veer towards a stable price. RAI is a stablecoin that has stayed true to the principals of immutability and decentralization. But some make the argument that RAI is nothing more than a slow pegging USD stablecoin since it uses the ETH/USD oracle price, and thus users may rather have a fixed peg that is more reliable.

Liquity is a one-time fee decentralized stablecoin, and very much like RAI, is censorship resistant and without governance embedded in the protocol. Thus Liquity is immune to oversight and regulation from centralized authority and institutions. Instead of having liquidation functions to manage and remove bad debt from the system, Liquity uses a redemption mechanism that allows for any LUSD holder to redeem for the appropriate amount of ETH according to the oracle price. This in turn functions like a bank, and allows instant convertibility of LUSD to ETH, which gives LUSD its underlying floor price.

Aave's GHO design philosophy was similar to MakerDAO, allowing for various and multiple collateral types to be used to mint GHO. However because USDC and other centralized stablecoins can be used to mint GHO, the stablecoin cannot be fully categorized as decentralized and immutable.

CrvUSD is the latest novel over-collateralized stablecoin that uses a method called Lending-Liquidating AMM Algorithm (LLAMMA). It essentially turns one's collateral into an LP position in an AMM that will rebalance during price changes. Instead of having instantaneous liquidations at one moment, the LLAMMA mechanism allows for positions to be softly converted into other assets through AMM's or slowly liquidated over time. As a result, it can reduce risk and losses borne by the borrower compared to other systems. This design allows it to very similarly mimic Uniswap's V3 pools, where liquidity can be spread across different price points. At the moment, crvUSD does not allow centralized stablecoins such as USDC to be used as collateral, which supports an adherance to properties of decentralization. A critique about crvUSD involves its indirect reliance on certain stablecoins (USDC, UDST, USDP & TUSD), because peg keepers/arbitrageurs who help maintain the peg for a reward will mint or burn crvUSD based on pools of these centralized stablecoin through other AMM's. This mechanism is necessary to maintain the peg and raises questions whether crvUSD could function without any relationship to these stablecoins, which is crucially important for preserving decentralization.

### DittoETH

What's next for decentralized stablecoins?

DittoETH is a decentralized stable asset protocol that will be releasing soon. It will be the first project on Ethereum to create stable assets using an order book instead of a CDP to over-collateralize stable assets like USD, with future support for other assets (EUR, RMB, GLD etc).

|                             |                        DittoETH                         |
| :-------------------------: | :-----------------------------------------------------: |
|        Year Launched        |                       2023 (soon)                       |
|         Description         | Decentralized stable asset protocol using an order book |
|       Stablecoin Name       |                          dUSD                           |
|        Pegged Asset         |                           USD                           |
| Collateral Type (Exogenous) |                       rETH/stETH                        |
|           Method            |                       Order Book                        |
|        Minimum Debt         |                    500 - 2,000 dUSD                     |
|            Fees             |           10% of yield to fund insurance TAPP           |
|       Minimum C-Ratio       |                          ~150%                          |
|          Debt name          |                      Short Record                       |
|       Liquidation Fee       |                       At Least 3%                       |

It will also take the lowest fees out of any protocol, as fees are instead drawn from the yield coming from liquid staked ETH rather than on deposit/withdraw. DittoETH was built around the design philosophy of decentralization and censorship-resistance on Ethereum, giving users the power of unstoppable stable assets.

For a further history of decentralized stablecoins, check out the [litepaper](https://dittoeth.com/litepaper). To get updates, follow the protocol on [Twitter](https://twitter.com/dittoproj)!

―Ditto
