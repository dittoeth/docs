# Litepaper

## Abstract

DittoETH is a decentralized pegged asset issuance protocol built on Ethereum. The protocol is built with the original principals of cryptocurrencies, offering censorship resistance, neutrality, custody-less and permissionless trades, and collateral management. Pegged assets or DittoAssets are collateralized by ETH via liquid staking tokens (LST) of ETH, as opposed to endogenous collateral. DittoETH is inspired by the original implementation of Bitshares in creating what was previously called polymorphic digital assets PMDA[^1]. Bitshares was the first project to create these synthetic pegged assets, specifically by using orderbooks[^2].

DittoETH can support pegged assets for fiat currencies, cryptocurrencies (long and short) and commodities. In order for users to issue pegged assets, a high collateralization of staked ETH must be locked in the contract to maintain protocol solvency and price stability. Additionally, the neutrality of DittoETH ensures open and full-access trading for any user. 

## Pegged Asset Issuance

Pegged assets are ERC-20 tokens that track the price of a targeted asset. Users can mint these DittoAssets by providing collateral in the form of staked ETH. This enables users to get price exposure to the pegged asset (ie. BTC) while having all the advantages of decentralized cryptocurrencies. Pegged assets are issued against over-collateralized loans to ensure the robustness and solvency of the DittoETH ecosystem.

Users will be able to deposit staked ETH onto the DittoETH exchange platform to either enter a long or short position against a particular pegged asset. Short traders that successfully enter a position will be able to earn yield in the form of dETH, which will come from the staked ETH. They will also be loaned staked ETH from the long trader, and this additional collateral earns them staking rewards beyond their own staked ETH.

The DittoETH Protocol will allow users to create, manage, and speculate on pegged tokens that can represent any financial instrument in the world. On-chain oracle price feeds will enable the protocol to re-create assets such as cryptos, stocks, currencies, bonds, and commodities.

## Market Collateralization

The protocol will start with users depositing staked ETH derivatives, such as rETH or stETH, as well as ETH itself. They will be given a wrapped token dETH, which represents claims to ETH in the protocol. Shorters play the vital role of minting pegged assets for the protocol. This happens when shorters' trades are matched on the orderbook with a corresponding long trader. Upon match, the orderbook mints the pegged asset and gives it to the long trader. In return for entering a short position, the shorter will earn rewards from staking. Additionally, the shorter will also be given the dETH of the long trader, which will be added to their collateral. This additional dETH will immediately boost the shorter's Collateralization Ratio (CR), allowing them to earn even more yield from the additional dETH that is included as part of their overall collateral.

Initially to place a short order, the shorter must provide enough collateral in their position to reach a minimum collateralization ratio. See the parameters [table](overview/parameters) listed for all figures and parameter levels set. When a trade is matched, the shorter's CR can increase 100% from the additional dETH that came from the matched long bid order. If shorters become undercollateralized, liquidators are incentivized to play a critical role in the liquidation process by selecting undercollateralized debt positions for liquidation. Acting as a primary participant in the protocol, they can help reduce tail risk and thus collect penalty fees for their work in liquidating.

## History of Pegged Assets in Cryptocurrencies

The original inspiration of DittoETH comes from Bitshares, the first project to conceive of and implement a pegged asset on the blockchain in what they called PMDA, in 2014. Essentially it used a cryptocurrency to collateralize the issuance of these pegged assets with an orderbook. However, there were several limitations that prevented the network from achieving enough adoption and scalability. First, Bitshares used an endogenous currency to back their assets, which became subject to high fluctuations. Secondly, the system charged an interest rate fee to shorters, which disincentivized traders from collateralizing and prevented the system from achieving consistent stability. As a result, the PMDA's often de-pegged from the targeted asset they were trying to track.

MakerDAO[^3] was the successor to Bitshares, as some of the developers themselves were part of the Bitshares community[^4]. The aim of MakerDAO was to create a stablecoin that closely tracked the US dollar. They believed that removing the orderbook and allowing a single user to collateralize without the need for another trading partner would provide more instant liquidity and therefore more collateralized positions. Initially, MakerDAO also used ETH as the sole collateral which resolved the problem of endogenous collateral.

In MakerDAO, Collateralized Debt Positions (CDP), needed to be over-collateralized to protect lenders in the event the CDP's value fell below the value of the outstanding debt. MakerDAO had a CR requirement of at least 150%. But to hold a CDP, which is essentially a short position, would have a higher asymmetric risk than holding the pegged asset. Therefore, asking users to come into the system to provide more collateral is challenging because of these asymmetric disincentives. Thus, in this similar case to Bitshares, MakerDAO was unable to address the problem of attracting enough collateral during highly volatile markets. Ultimately, the initial stablecoin DAI could not hold peg. Although currently one of the largest DeFi projects, MakerDAO mostly uses the centralized USDC to maintain its pegged value to USD.

Synthetix[^5] is a project that is closest to addressing this issue. They achieve a high CR of 400% by giving interest to those who collateralize. They do this by some form of inflation and network activity rewards that is then offered to the takers. Synthetix also uses a single user mint and collateralization method, which provides the advantage of instant liquidity.

However, as collateralized as the synthetic assets are in Synthetix, it has a significant shortcoming. It uses a native endogenous currency (SNX), and is therefore like Bitshares by being subject to idiosyncratic price fluctuations. Over time it may potentially lack enough users holding that token to collateralize, hindering the protocol's ability to scale their pegged assets. Synthetix nonetheless will continue to be viable, as long as they are able to continue to generate yield to pay their stakers.

Liquity[^6] is a well designed stablecoin platform that tracks closely to the price of USD. In Liquity, the protocol only uses ETH as collateral, and has three key distinctions: 1) users can mint LUSD at 110% above the price oracle, 2) users will be liquidated if below 110%, 3) at any point in time holders of LUSD can redeem the collateral backing from the least collateralized position. The third point is important, as holding LUSD serves to be similar to putting money in the bank and having the ability to ask for withdrawal at any point in time. Therefore, if LUSD ever drops below $1.00, the holder can know with confidence they can redeem the fair ETH collateral value from the collateralizer. These mechanisms ensure LUSD ranges between a price of $1.00 and $1.10.

Since collateralizers can be redeemed against, or liquidated called at any point in time, the total CR of LUSD has often been around 2.5X. In comparison to all the stablecoin projects in DeFi, Liquity has the most decentralized and censorship resistant stablecoin, as it has no need for any governance.

DittoETH has improved upon the mechanisms of each of these projects by first exclusively using staked ETH to collateralize the pegged asset. In contrast to projects with endogenous tokens, this choice to exclusively use staked ETH will allow more users to enter the system and collateralize with an asset that has value outside of the protocol. Thus, it enables the possibility for greater liquidity and more pegged asset pairs. Returning back to the orderbook model found in Bitshares also helps to mitigate the premiums that could exist in stablecoins.

## Incentive Structure for Shorters

The protocol's incentive structure for shorters compensates them for the risks they take on. They will continue to earn the yield in the same manner as if they were staking. In addition, they will also be given the dETH from the long user they matched with, which will be added to their collateral balance. This additional dETH allows them to earn even more yield than they would have compared to solely holding the staked ETH.

The additional yield can only be achieved because DittoETH has chosen to use an orderbook, which requires two separate users to come to create the pegged asset. This coincidence of wants allows for the long user to immediately forgo their dETH in exchange for the pegged asset. Although the tradeoff to Synthetix's protocol is that there is not instant liquidity, this matching scheme with two separate users allows DittoETH to more directly match users who only want pegged assets with users who only want to short that asset.

## Staked ETH as Collateral

All DittoAssets are backed by staked ETH LSTs. These pegged assets are minted when shorters take their staked ETH, in the form of dETH, and match on the orderbook with a long position that desires the DittoAsset.

## How Assets Work

DittoAssets are pegged assets that track the price of the underlying asset. They allow holders to gain exposure on Ethereum to various asset classes without holding the underlying assets themselves or trusting a custodian. DittoAssets are backed by staked ETH, which is used as collateral.

A dETH holder can mint dUSD by locking their dETH as collateral via the DittoETH smart contract. The steps involved when an dETH holder mints are:

- The DittoETH contract puts the dETH holders short position on the orderbook at the specified price and quantity.
- This short order will only go through if the shorter has enough dETH to satisfy the inital short order collateral requirements.
- When placed on the orderbook, the dETH will be locked up during this time, until either the trade is executed or cancelled.
- Upon matching, the requisite amount of dUSD is minted and the dETH from the long user is included in the collateral balance of the newly formed position.

#### DittoAsset Creation and the CR (Shorters, debt, and pooled counterparties)

These pegged assets on DittoETH are backed by at the very least the Recovery Mode C-Ratio in the system, although this can be raised or lowered in the future through community governance mechanisms. Shorters incur debt for facilitating the minting of DittoAssets, as they are effectively borrowing against their staked ETH to speculate on the future price of the DittoAsset relative to ETH. The value of this debt in ETH terms can increase or decrease independently of their original minted value, based on the exchange rates and supply of the pegged asset within the network.

#### Managing and Burning Debt

In order to exit the system and close their position to unlock collateralized dETH, shorters must buy back this debt by acquiring and burning the DittoAsset. Shorters can close their position by using their excess collateral to buy the pegged asset on the orderbook, or by providing the asset in their virtual balance or wallet to fully settle their debt position. At its simplest: a shorter that facilitated minting 10 dUSD must re-acquire 10 dUSD on the orderbook or from another market to burn their debt owed. A shorter is only responsible for their individual debt and not the protocol's debt pool. Therefore, they need to burn only the debt that was assigned to them when matched with a long position.

In the mechanisms above, a shorter on DittoETH can potentially gain substantially more rewards compared with solely holding staked ETH. These incentives to maintain a higher CR give confidence to the markets that DittoAssets are backed by sufficient collateral to absorb large price shocks. If the value of ETH fluctuates, each staker's CR will fluctuate. For example, if pegged BTC (cBTC) halved in price, the cost of debt in ETH terms for the shorters that collateralized against BTC would halve. Conversely, if BTC doubled in price, the shorter's debt value would double, requiring twice the amount of ETH to pay down their debt. Shorters can adjust their CR downwards by removing excess collateral. They can also try to acquire the pegged asset to burn in order to raise their CR.

#### Unique Shorting Rules

In DittoETH, there are special rules that pertain to shorters exclusively. All short orders are limit orders for the purpose of having standby liquidity and collateral for bidders to match with. DittoETH uses the price oracle to determine the price that pegged assets should be minted at in a matched trade or burned at during a liquidation. Thus, shorts cannot be matched below the oracle price. If a short order is submitted to the orderbook and it is below the oracle price, the short order will be placed on the orderbook at the specified limit price. The short orders must meet collateral requirements, before being placed on the orderbook or matching.

DittoETH allows users to manage many different short positions at once. Users can also combine different short positions attached to their account. This is beneficial as it makes the cost of claiming rewards cheaper and possibly allows a shorter to combine an at-risk position with a well-collateralized one into a consolidated position.

Traders that intend to place limit short orders can only do so when their short trades are sufficiently collateralized above the initial short order CR. After given the additional dETH from the bid user, the shorter can adjust their collateral downwards, to a minimum of at least the initialCR. If their position falls below the initialCR, they will no longer be able to decrease their collateral and will only be allowed to increase. To be considered a healthy short position, the CR must be above the initialCR.

### Maintaining Price Peg

It is critical for dUSD to maintain a stable peg to the USD. One issue to protect against is when dUSD's price trading at less than 100 cents on the dollar specifically on the orderbook. This can happen if the demand for ETH is so much higher than dUSD that dUSD holders are willing to sell at a discount.

Liquity allows a swap from LUSD to ETH immediately through their redemption system. The main issue with that is that the CDP owners can be redeemed upon even at very high CR. If everyone has a high CR, especially when the price of ETH itself goes up, then a shorter can still be redeemed on because LUSD holders may want to leave in favor of ETH rather than LUSD. As of March 2023, Troves with 500%+ CR were being redeemed on. This is not ideal for shorters, because shorts with higher CR should be protected. Ditto attempts to implement redemptions where only shorts under 2x CR can be redeemed.

Normally, a redemption mechanism should be enough to restore parity as it can routinely get rid of debt in the system. But if redemptions are not viable, dUSD holders will need place an ask on the orderbook, which may lead to dUSD holders selling under the oracle price at a loss in order to get ETH. In this case, DittoETH employs a separate mechanism to further maintain the peg. When the difference between internal orderbook ETH price and the oracle price increases, the system will dynamically increase the tithe, which limits the yield a short position can earn. This loss of yield will drive shorters to exit their positions (via a forced bid), which will buy up any of the low asks and bring the price up to peg. Refer to the [Redemptions](technical/redemptions) and [dUSD trading at discount](technical/misc#dUSD) pages for more information.

### Liquidation Parameters

DittoETH has two internal liquidation contracts, the Primary and Secondary methods, that allow for short positions to be liquidated as soon as the CR drops below a certain level. The Primary and Secondary method are used as soon as the CR drops below a specific level. Refer to the [parameters](overview/parameters) to see the latest settings of the liquidation levels. These levels are set to ensure that the system as a whole is not at risk of becoming under-collateralized. The system prioritizes the use of the Primary method over the Secondary by awarding additional fees to primary liquidators.

#### Primary Liquidation Method

The Primary Liquidation Method is for when an account is below a liquidation CR. To prevent liquidation, the shorter must reach the target CR again by either the price moving favorably or by adding additional collateral.

When a short is liquidated, the liquidator will initially pay for the gas fees to perform the action. However, the liquidator will be compensated with not only 0.5% in fees of the short debt position, but also reimbursed for the base gas fees in the form of dETH.

If liquidated, short positions will have to pay at a maximum 10% above the oracle price. In other words, the liquidation will perform a forced bid, purchasing sell or short orders to be at most 10% above the oracle price. The limit of 10% above the oracle price is to prevent the under-collateralized short from being forced to buy the pegged asset exorbitantly above the oracle price, which would work against the protocol's goal of tracking near the price feed. Additionally, having the price be 10% above oracle increases the likelihood of the order being matched as most orders are expected to match at oracle price. If only a portion of the liquidation can be filled, as there are not enough trades on the orderbook, then another user can come in and try to liquidate at another time.

When the short is liquidated, the shorter will reimburse the liquidator in the form of dETH for the gas base fees spent for liquidation. The shorter will also pay a penalty fee to the liquidator (0.5%) and to the protocol (2.5%), of which the protocol will put into a stability pool, also known ask the Treasury Asset Protection Pool (TAPP). If the shorter cannot pay for any of these fees from its collateral, the protocol will attempt to use the TAPP to pay out fees.

#### Secondary Liquidation

DittoETH has a secondary method for liquidating, giving users a second option of providing the actual pegged asset in exchange for the collateral of the shorter at the oracle price. This method helps to enforce a lower floor for the price of the pegged asset to match the oracle price, especially if the orderbook is in a market condition where there is low liquidity with insufficient asks to fulfill the liquidation using the Primary Liquidation Method.

Currently, there is no reward fee for the liquidator who uses the Secondary Liquidation Method, as this only serves as a redemption window to ensure 1:1 convertibility from the pegged asset back to dETH. However, if the Secondary Method is used on a short position that has a CR less than or equal to 1.1, then any remaining collateral will be given to the TAPP after paying off the debt and will not be returned to the shorter. Effectively, the shorter will lose all their collateral at these low CR levels. DittoETH does not prevent using the Secondary Method for CR below 1, which would mean a liquidator would take on losses at those levels.

## The Treasury Asset Protection Pool (TAPP)

In the event when a single short position becomes under-collateralized, and is unable to fully pay back its debt or the penalty and gas fee reimbursements, DittoETH has a stability pool called the Treasury Asset Protection Pool (TAPP) that will make up the difference to support stability of the asset market. The TAPP is funded by the penalties from Primary Liquidations and from the small tithe taken from the earned ETH rewards generated by the staked ETH. The TAPP will be important in dampening the effect that large sudden price shocks can have on a particular pegged asset. In the future, when the TAPP is sufficiently large enough, the community may choose to distribute fees earned on the protocol to the governance token holders. Refer to the [Treasury Asset Protection Pool](technical/blackswan#tapp) page for more reading on the stability fund.

## The Orderbook

The DittoETH smart contracts maintain an orderbook for every market created on the platform. Anybody can create a new order or fill an existing order at any time. Orders are filled by an automated matching engine that exists within DittoETH smart contracts. Requests to buy or sell shares are fulfilled immediately if there is a matching order already on the orderbook. It may be filled by buying or selling pegged assets with other participants. If the order is a limit, and there is no matching order, or the request can be only partially filled, the remainder is placed on the orderbook. Orders are never executed at a worse price than the price set by the trader, but may be executed at a better price.

## Yield Mechanism

DittoETH provides interest to collateralized shorts in the form of dETH. The amount of yield that should be distributed to everyone is periodically updated through a publically accessible function callable by anyone. Using this method, the gas fees for this system are small and reasonable.

A matched short record must age for a set amount of time (in seconds) before qualifying for yield distributions. Since the yield that is distributed also includes the earnings from all unmatched limit orders, it is possible the short position could be given a much larger windfall of yield above what was earned by the collateral in the short.

> **Note**: The first user cannot claim until another user joins the claims process to get the orderbook rewards. This is to prevent one user from taking all of the rewards for just being the first trade to match past the eligibility threshold.

## The Oracles

The value of all market pegged assets in the DittoETH protocol is determined by oracles from Chainlink that push price feeds on-chain. See the [Oracles](technical/oracles) page for more about the use of this design within DittoETH.

[^1]: [Bitshares Whitepaper](https://prestonbyrne.com/wp-content/uploads/2014/08/f8ee9-bitshares20white20paper202.pdf)
[^2]: [Bitcoin Forum post](https://bitcointalk.org/index.php?topic=223747.0), [Bitshares 2.0 Whitepaper](https://github.com/BitSharesEurope/bitshares-whitepapers/blob/master/pdfs/bitshares-general.pdf)
[^3]: https://makerdao.com/en/whitepaper/sai
[^4]: [Little-Known Facts About MakerDAO](https://blog.makerdao.com/little-known-facts-about-makerdao/): "MakerDAO almost started on BitShares"
[^5]: [Synthetix Litepaper](https://docs.synthetix.io/synthetix-protocol/the-synthetix-protocol/synthetix-litepaper)
[^6]: [Liquity Whitepaper](https://docsend.com/view/bwiczmy)
