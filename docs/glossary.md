# Glossary

## Collateral

Collateral is an asset that a borrower pledges as a security for a loan. This asset backs the pegged asset that is tied to the debt. The system accepts ETH Liquid Staking Derivatives (LSDs) as collateral.

## CR

Collateral Ratio. The ratio between the collateral and the debt for a position. A CR of 1 means that the debt is fully covered or collateralized. An over collateralized position means the CR is greater than 1. The system maintains an over-collateralization of assets to ensure protocol solvency and price stability.

## ERC-20

ERC-20 (Ethereum Request for Comment 20) is a technical standard for fungible tokens. The system uses this for zETH and the other stable assets.

## LSD

Liquid Staking Derivatives are ERC-20 tokens that are issued by staking providers or yield generating protocols. These tokenized IOUs allow users to both earn yield from staking on their ETH and still retain liquidity.

## shortRecord

`shortRecord` is the system term for a position of debt that generates yield. It is a short position, where the _shorter_ owes debt corresponding to the stable asset. Therefore, this debt is over collateralized by the shorter to ensure the pegged asset is fully backed, while generating yield for the shorter.

## shorter

The user or address that has control of a `shortRecord`, or short position.

## Stablecoin

A token that targets a particular price index, whether 1 USD, or 1 EUR, etc. A pegged asset.

## zETH

A token that is 1:1 value of ETH, similar to WETH and is the main ERC-20 asset of the system used to make Bid or Short Orders. Although zETH is mainly backed by a basket of LSDs, yield can only be extracted when a trader is in a short position. Thus it is theoretically possible a shorter can earn more yield per unit of zETH they are collateralizing with.
