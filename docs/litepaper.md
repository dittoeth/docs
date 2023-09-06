# Litepaper

## Abstract

DittoETH is a decentralized pegged asset issuance protocol built on Ethereum. The asset protocol is built with the original principals of cryptocurrencies, offering censorship resistance, neutrality, custody-less, and permissionless trades and collateral management. Pegged assets or DittoAssets are collateralized by ETH, or liquid staking derivatives (LSD) of ETH, as opposed to using an endogenous collateral. DittoETH is inspired by the original implementation of Bitshares in creating what was previously called polymorphic digital assets (PMDA). Bitshares was the first project to create these synthetic pegged assets, specifically by using orderbooks.

DittoETH can support pegged assets for fiat currencies, cryptocurrencies (long and short) and commodities. In order for users to issue pegged assets, a high collateralization of staked ETH must be locked in the contract to maintain protocol solvency and price stability.

## Pegged Asset Issuance

Pegged assets are ERC-20 tokens that track the price of a targeted asset. Users can mint these DittoAssets by providing collateral in the form of staked ETH. This enables users to get price exposure to the pegged asset (ie. BTC), while having all the advantages of decentralized cryptocurrencies. Pegged assets are issued against over-collateralized loans to ensure the robustness and solvency of the DittoETH ecosystem, bolstering the protocols health especially during turbulent market conditions.

Users will be able to deposit staked ETH onto the DittoETH exchange platform to either enter a long or short position against a particular pegged asset. Short traders that successfully enter a position will be able to earn yield in the form of zETH, which will come from the staked ETH. They will also be loaned staked ETH from the long trader, and this additional collateral provides them further opportunity to earn greater yield than if they were just holding the staked ETH.

The DittoETH Protocol will allow users to create, manage, and speculate on pegged tokens that can represent any financial instrument in the world. On-chain oracle price feeds will enable the protocol to re-create assets such as cryptos, stocks, currencies, bonds, and commodities. In addition, the neutrality of DittoETH ensures an open and full-access trading for any user.

## Market Collateralization

The protocol will start with users depositing staked ETH derivatives, such as rETH or stETH, as well as ETH itself. They will be given a wrapped token zETH, which represents claims to ETH in the protocol. Shorters play an important role in helping to mint the pegged asset for the protocol. This happens when shorters' trades are matched on the orderbook with a corresponding long trader. Upon match, the orderbook mints the pegged asset and gives it to the long trader. In return for entering a short position, the shorter will earn rewards from staking. Additionally, the shorter will also be given the zETH of the long trader, which will be added to their collateral. This additional zETH will immediately boost the shorter's Collateralization Ratio (CR), allowing them to earn even more yield from the additional zETH that is included as part of their overall collateral.

Initially to place a short order, the shorter must have a high collateralization ratio of 500% as their initial margin. Thus, when the trade is matched, their CR can increase to 600% from the additional zETH that came from the matched long bid order. If shorters become undercollateralized, margin callers are incentivized to play a critical role in the liquidation process by selecting undercollateralized debt positions for liquidation. Acting as a primary participant in the protocol, they can help reduce tail risk and thus collect penalty fees for their work in margin calling.

## History of Pegged Assets in Cryptocurrencies

The original inspiration of DittoETH comes from Bitshares, the first project to conceive of and implement a pegged asset on the blockchain in what they called PMDA in 2014. Essentially it used a cryptocurrency to collateralize the issuance of these pegged assets, all while using an orderbook. However, there were several limitations that prevented the network from achieving enough adoption and scalability. First, Bitshares used an endogenous currency to back their assets, which became subject to high fluctuations. Secondly, the system also charged an interest rate fee to shorters, which disincentivized traders from collateralizing, preventing the system from achieving consistent stability. As a result, the PMDA's often de-pegged from the targeted asset they were trying to track.

MakerDAO was the successor to Bitshares, as some of the developers themselves were part of the Bitshares community. The aim of MakerDAO was to create a stablecoin that closely tracked the US dollar. They believed that removing the orderbook and allowing a single user to collateralize without the need for another trading partner would provide more instant liquidity and therefore more collateralized positions. Initially, MakerDAO also used ETH as the sole collateral which resolved the problem of endogenous collateral.

In MakerDAO, Collateralized Debt Positions (CDP's), needed to be over-collateralized to protect lenders in the event the CDP's value fell below the value of the outstanding debt. MakerDAO had a CR of at least 150%. But to hold a CDP, which is essentially a short position, would have a higher asymmetric risk than holding the pegged asset. Therefore, asking users to come into the system to provide more collateral is challenging because of these asymmetric disincentives. Thus, in this similar case to Bitshares, MakerDAO was unable to address the problem of attracting enough collateral during highly volatile markets. Ultimately, the initial stablecoin DAI could not hold peg. Although currently MakerDAO one of the largest DeFi projects, it mostly uses a centralized USDC to maintain its pegged value to USD.

Synthetix is a project that is closest to addressing this issue. They achieve a high CR of 400% by giving interest to those who collateralize. They do this by some form of inflation and network activity rewards that is then offered to the takers. Synthetix also uses a single user mint and collateralization method, which provides the advantage of instant liquidity.

However, as collateralized as the synthetic assets are in Synthetix, it has a significant shortcoming. It uses a native endogenous currency (SNX), and is therefore like Bitshares by being subject to idiosyncratic price fluctuations. Over time it may potentially lack enough users holding that token to collateralize, hindering the protocol's ability to scale their pegged assets. Synthetix nonetheless will continue to be viable, as long as they are able to continue to generate yield to pay their stakers.

Liquity is a well designed stablecoin platform that tracks closely to the price of USD. In Liquity, the protocol only uses ETH as collateral, and has three key distinctions: 1) users can mint LUSD at 110% above the price oracle, 2) users will be margin called if below 110%, 3) at any point in time holders of LUSD can redeem the collateral backing from the least collateralized position. The third point is important, as holding LUSD serves to be similar to putting money in the bank and having the ability to ask for withdrawal at any point in time. Therefore, if LUSD ever drops below $1.00, the holder can know with confidence they can redeem the fair ETH collateral value from the collateralizer. These mechanisms ensure LUSD ranges between a price of $1.00 and $1.10.

Since collateralizers can be redeemed against, or margin called called at any point in time, the total CR of LUSD has often been around 2.5X. However, even with that high collateralization achieved, LUSD merely tracks the price of USD and could take a length of time to find parity. LUSD will have a maximum premium of 10% above the price of USD, especially in periods when their stablecoin, LUSD, is in high demand. For these reasons, this could make LUSD less attractive as a stablecoin since there is not perfect 1:1 convertibility with USD. In comparison to all the stablecoin projects in DeFi, Liquity has the most decentralized and censorship resistant stablecoin, as it has no need for any governance.

DittoETH has improved upon the mechanisms of each of these projects by first exclusively using staked ETH to collateralize the pegged asset. In contrast to projects with endogenous tokens, this choice to exclusively use staked ETH will allow more users who can come into the system and collateralize with an asset that has usage value outside of our protocol. Thus, it enables the possibility for greater liquidity and potentially more trading pegged asset pairs. Returning back to Bitshares use of orderbook in DittoETH would also help to mitigate the premiums that could exist in stablecoins.

## Incentive Structure for Shorters

The protocol's incentive structure for shorters compensates them for the risks they take on. They will continue to earn the yield in the same manner as if they were staking. In addition, they will also be given the zETH from the long user they matched with, which will be added to their collateral balance. This additional zETH allows them to earn even more yield than they would have normally if they have held the staked ETH.

The additional yield can only be achieved because DittoETH has chosen to use an orderbook, which requires two separate users to come to create the pegged asset. This coincidence of wants allows for the long user to immediately forgo their zETH in exchange for the pegged asset. Although the tradeoff to Synthetix's protocol is that there is not instant liquidity, this matching scheme with two separate users allows DittoETH to more directly match users who only want pegged assets with users who only want to short that asset.

## Staked ETH as Collateral

All DittoAssets are backed by staked ETH LSDs. These pegged assets are minted when shorters take their staked ETH, in the form of zETH, and matches on the orderbook with a long position that desires the DittoAsset.

## How Assets Work

DittoAssets are pegged assets that track the price of the underlying asset. They allow holders to gain exposure on Ethereum to various asset classes without holding the underlying assets themselves or trusting a custodian. DittoAssets are backed by the staked ETH, which is used as collateral at a ratio of 500%.

A zETH holder can mint CUSD by locking their zETH as collateral via the DittoETH smart contract. The steps involved when an zETH holder mints are:

The DittoETH contract puts the zETH holders short position on the orderbook at the specified price and quantity. This short order will only go through if the shorter has enough zETH to ensure that their CR is above 500%. When placed on the orderbook, the zETH will be locked up during this time, until either the trade is executed or cancelled.

#### DittoAsset Creation and the CR (Shorters, debt, and pooled counterparties)

These pegged assets on DittoETH are backed by a 500% CR, although this can be raised or lowered in the future through community governance mechanisms. Shorters incur debt for facilitating the minting of DittoAssets, as they are effectively borrowing against their staked ETH to speculate on the future price of the DittoAsset relative to ETH. The value of this debt in ETH terms can increase or decrease independently of their original minted value, based on the exchange rates and supply of the pegged asset within the network.

#### Managing and Burning Debt

In order to exit the system and close their position to unlock collateralized zETH, shorters must buyback this debt by acquiring and burning the DittoAsset. Shorters can close their position by using their excess collateral to buy the pegged asset on the orderbook, or by providing the asset in their virtual balance or wallet to fully settle their debt position. At its simplest: a shorter that facilitated minting 10 CUSD must re-acquire 10 CUSD on the orderbook or from another market to burn their debt owed. A shorter is only responsible for their individual debt and not of the protocols debt pool. Therefore, they need to burn only the debt that was assigned to them when matched with a long position.

In the mechanisms above, a shorter on DittoETH can potentially gain substantially more rewards as opposed if they held the staked ETH solely. These incentives to maintain a higher CR give confidence to the markets that DittoAssets are backed by sufficient collateral to absorb large price shocks. If the value of ETH fluctuates, each staker's CR will fluctuate. For example, if pegged BTC (cBTC) halved in price, the cost of debt in ETH terms for the shorters that collateralized against BTC would halve. This means conversely, if BTC doubled in price, the shorter's debt value would increase by double, requiring twice the amount of ETH to pay down their debt. If their ratio is above 500%, shorters can adjust their ratio by removing the excess collateral to another short position. They can also try to acquire the pegged asset to burn if their ratio is below 500%.

#### Unique Shorting Rules

In DittoETH, there are special rules that pertain to shorters exclusively. All short orders are limit orders for the purpose of having standby liquidity and collateral for bidders to match with. DittoETH uses the price oracle to determine the price that pegged assets should be minted at in a matched trade or conversely burned during a margin call. Thus, shorts cannot be matched below the oracle price. If a short order is submitted to the orderbook and it is below the oracle price, the short order will be placed on the orderbook at the specified limit price. The short orders must meet collateral requirements, up to the initial margin (5X), before it can be placed on the orderbook.

DittoETH allows users to manage many different short positions at once. Thus, if a user places several different limit shorts on the orderbook at various prices, and several different bids match with one short limit, they will be combined within that specific short record and its identification that it was created with. This is performed through retaining a unique short identification for each short made.

Users can also combine different short in their account. This is beneficial as it makes the cost of claiming rewards cheaper and possibly allows a shorter to combine an at risk position with a well-collateralized one into a consolidated position. Overall, having fewer trades will make management easier if desired by the user.

Traders that intend to place limit short orders can only do so when their short trades are sufficiently collateralized above the initial margin (500%). After given the additional zETH from the bid user, the shorter can adjust their collateral downwards, to a minimum of at least the initial margin. If their position falls below the initial margin, they will no longer be able to decrease their collateral and will only be allowed to increase. To be considered a healthy short, it should be above the initial margin.

### Margin Calls Parameters

DittoETH has two internal margin call contracts, Primary and an Secondary method, that allow for accounts to be liquidated as soon as the account's CR drops below a certain level. The Primary method can be used as soon as the CR drops below 200%, while the Secondary is reserved for when the CR is below 150%. These levels are set to ensure that the system as a whole is not at risk of becoming under-collateralized. The system prioritizes the use of the Primary Method over the Secondary by awarding additional fees to primary margin callers.

#### Primary Margin Call Method

In the Primary Margin Call Method, when an account is below 200% and is flagged for liquidation, a liquidation timer of 10 hours begins on the account to give a window of opportunity to the flagged shorter to fix their CR and stop the liquidation countdown. To halt the liquidation timer and remove the flag, the shorter must reach the target maintenance margin CR (200%) again by either the price moving favorably or by adding additional collateral.

If after 10 hours have passed and the short is still below the maintenance margin CR, the person who flagged the account will have two hours to margin call the position. The flagger will be given first privileges to perform this action. If they fail to do so within the allotted time frame, then any other participant can come in and liquidate the position. Whoever margin calls the position will be able to earn approximately .5% in fees. However, if after 16 hours and no one has liquidated the position, then the short will no longer be margin callable. For positions that still are below the maintenance margin, users will need to re-flag the short to re-initiate the liquidation timer and wait another 10 hours once more before margin calling.

When a short is margin called, the liquidator will initially pay for the gas fees to perform the action. However, the liquidator will be re-compensated with not only .5% in fees of the short debt position, but also for the base gas fees in the form of zETH.

If margin called, short positions will have to pay at a maximum 10% above the oracle price. In other words, the margin call will perform a forced bid, purchasing sell or short orders to be at most 10% above the oracle price. The limit of 10% above the oracle price is to prevent the under-collateralized short from being forced to buy the pegged asset exorbitantly above the oracle price, which would work against the protocol's goal of tracking near the price feed. Additionally, having the price be 10% above oracle increases the likelihood of the order being matched as we expect most orders to match at oracle price. If only a portion of the margin call can be filled, as there are not enough trades on the orderbook, then another user can come in and try to to margin call at another time. In the case where the 16 hour window has passed, margin callers must re-flag the short to begin the process again to liquidate the partial debt position.

When the short is margin called, the shorter will reimburse the margin caller in the form of zETH for the gas base fees spent for liquidation. The shorter will also pay a penalty fee to the margin caller (.5%) and to the protocol (2.5%), of which the protocol will put into a stability pool, also known ask the Treasury Asset Protection Pool (TAPP). If the shorter cannot pay for any of these fees from its collateral, the protocol will attempt to use the TAPP to reimburse for the fees.

#### Secondary Margin Call

DittoETH has a secondary method for margin calling that can only be used when the CR is 1.5x or below. The margin caller will have the option of providing the actual pegged asset in exchange for the collateral of the shorter at the oracle price. This method helps to enforce a lower floor for the price of the pegged asset to match the oracle price, especially if the orderbook is in a market condition where there is low liquidity with insufficient asks to fulfill the margin call using the Primary Margin Call Method. This method can be initiated immediately without the waiting period of the primary method. If a short is currently flagged for margin call by a user but has fallen below 1.5x, then the Secondary method can override the Primary method and execute an instant liquidation.

Currently, there is no reward fee for the margin caller who uses the Secondary Margin Call Method, as this only serves as a redemption window to ensure convertibility from the pegged asset back to zETH. However, if the Secondary Method is used on a short position that has a CR less than or equal to 1.1, then any remaining collateral will be given to the TAPP after paying off the debt and will not be returned to the shorter. Effectively, the shorter will lose all their collateral at these low CR levels. DittoETH does not prevent using the Secondary method for CR's below 1, which would mean a Margin Caller would take on losses for liquidating at those levels.

## The Treasury Asset Protection Pool (TAPP)

In the event when a single short position becomes under-collateralized, and is unable to fully pay back its debt or the penalty and gas fee reimbursements, DittoETH has a stability pool called the Treasury Asset Protection Pool (TAPP) that will make up the difference to support stability of the asset market. The TAPP is funded by the penalties from Primary Margin Calls and from the small tithe taken from the earned ETH rewards generated by the staked ETH. The TAPP will be important in dampening the effect that large sudden price shocks can have on a particular market pegged asset. In the future, when the TAPP is sufficiently large enough, the community may choose to distribute fees earned on the protocol to the governance token holders. Refer to the [Treasury Asset Protection Pool](technical/blackswan#tapp) page for more reading on the stability fund.

## The Orderbook

The DittoETH smart contracts maintain an orderbook for every market created on the platform. Anybody can create a new order or fill an existing order at any time. Orders are filled by an automated matching engine that exists within DittoETH smart contracts. Requests to buy or sell shares are fulfilled immediately if there is a matching order already on the orderbook. It may be filled by buying or selling pegged assets with other participants. If the order is a limit, and there is no matching order, or the request can be only partially filled, the remainder is placed on the orderbook. Orders are never executed at a worse price than the price set by the trader, but may be executed at a better price.

## Yield Mechanism

DittoETH provides interest to collateralized shorts in the form of zETH. The amount of yield that should be distributed to everyone is periodically updated when a single user claims yield for themselves. Using this method, the gas fees for this system are small and reasonable.

A matched short record must age for two weeks before they can qualify for yield earnings. Since the yield that is distributed is the earnings that came from all unmatched limit orders, it is possible the matching order could be given a much larger windfall of yield, more than the zETH had earned alone. This happens because they acquired the yield from orders that matched under two weeks or from users that cancelled their orders, making them ineligible to claim the orderbook's accrued interest.

> **Note**: The first user cannot claim until another user joins the claims process to get the orderbook rewards. This is to prevent one user from taking all of the rewards for just being the first 2 weeks old trade to match.

## The Oracles

The value of all market pegged assets in the DittoETH protocol is determined by oracles from Chainlink that push price feeds on-chain. See the [Oracles](technical/oracles) page for more about the use of this design within DittoETH.
