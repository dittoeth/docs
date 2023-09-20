# Oracles

The value of all DittoAssets in the DittoETH system is determined by oracles that push price feeds on-chain. The price feeds are primarily supplied by Chainlink's independent node operators.

DittoETH has a unique mechanism for updating the oracle price. It caches the latest Chainlink spot price to substantially save on gas, while doing so frequently enough to ensure appropriate freshness. Users trading on the orderbook will update the oracle price, while providing "hints" to the backend corresponding to the correct index to match or place a limit order on the table. Thus, certain trades made will play a role in helping update the "hint" index for the next possible trade near the price feed.

Ultimately the purpose of using an oracle price feed at all is to fix the minting and burning of pegged assets to the actual price of the targeted asset. Because of these rules, DittoAssets are minted at the oracle price or better. Conversely, these assets are burned at the appropriate price when liquidations are performed.

The minted assets can currently be anything that has a corresponding Chainlink Oracle, as that price feed is used to determine whether an asset is minted.

- For `USD`, the [`ETH/USD`](https://data.chain.link/ethereum/mainnet/crypto-usd/eth-usd) chainlink price feed is used. `price.inv()` gets `USD/ETH`.
- The system supports adding multiple assets ([`XAU`](https://data.chain.link/ethereum/mainnet/commodities/xau-usd), `JPY`). For `EUR`, the `EUR/USD` price is multiplied by `USD/ETH` to get `EUR/ETH`.

> The system validates asset addresses with `onlyValidAsset()`, which can only be added via `createMarket()`.

In the off-chance Chainlink fails, the system uses more decentralized solutions as a fallback (i.e. Uniswap TWAP).

## Conditions for Updating Oracle

Any actions related to shorts attempt to check the latest Oracle price. To save on gas, a cached oracle price is used in some cases by saving the last `oracleTime` and `oraclePrice`.

The saved oracle price is updated if:

- `createLimitBid()` and it's 1hr past the saved oracle time.
- `createForcedBid()` (exit short, liquidation) and it's 15min past the saved oracle time.
- `decreaseCollateral()` or `createLimitShort()` and it's 15 min past the saved oracle time.
- `createLimitBid()` or `createLimitShort()` is about to match and price is outside of the chainlink price window of 0.5%.

This 15 minute window for forced bid is necessary to ensure the protocol is still functioning during periods of high volatility and network congestion. The protocol is at risk of becoming under-collateralized if the oracle price cannot update during a period of high congestion. Therefore, updating the oracle more frequently is particularly important for liquidations.

Regarding the last condition for updating saved oracle, the assumption is that users will have knowledge of the true price of an asset outside of the system. Therefore, they will attempt to match at that price if the actual price is better than what is reflected in the saved oracle price. When this happens, and the difference between the match price and the cached oracle price is greater than 0.5%, the user will update the cache price with the latest Chainlink price. It will be economically better for the users to make the trade, which outweighs the cost of updating the oracle.

## TWAP Backup

Currently, the ETH/USD orderbook uses Uniswap's TWAP as a backup feed to get ETH price in USD. To get this data, a call is made to a simplified version of their `consult()` function defined in their `OracleLibrary.sol`. Specifically, the WETH/USDC liquidity pool address is passed, as well as WETH's and USDC's respective ERC-20 addresses. Prices are averaged between the current time and 30 minutes prior. Afterwards, the ETH price in USD is inverted to get the USD in ETH price, which is the denomination used internally.

## Circuit Breakers

Since the system is heavily dependent on oracles, data validity is paramount. The system includes a circuit breaker design that falls back to a more decentralized oracle in the event that Chainlink data is unusable. Given the pegged assets contained in the system, it is critical to ensure that market operations continue regardless of third party issues. Hence the emphasis on falling back rather than reverting to prevent delay or freeze in activity.

Broadly speaking, there are two categories of circuit breaking events:

1. Invalid fetch data from Chainlink.
2. Large price deviation between Chainlink and the system's cached oracle price.

### Invalid Fetch Data

The following are checked regarding incoming Chainlink data:

1. `roundId == 0`
2. `timeStamp == 0`
3. `price <= 0`
4. `timeStamp > block.timestamp` (Implies Chainlink data is coming from the future)
5. `timeStamp > block.timestamp + 2 hours` (stale Data: Chainlink has not updated a round in over 2 hours)

If any of these checks are triggered, price defaults to using the TWAP values.

### Price Deviation

> Large price deviations is a highly unlikely scenario. This feature is included as a means to handle a black swan event

The price deviation circuit breaker is triggered when the delta between the saved oracle price and the incoming Chainlink price is greater than 50% in either direction. When this is triggered, the TWAP price is compared against the Chainlink price. To keep saved price changes smoother between updates, the system selects the price that is closest to the current saved price.

As an added measure of safety, the system checks the liquidity of the pool to ensure fidelity of the data. The less liquidity in the pool, the higher the risk for price manipulation in that pool. For the WETH/USDC pool, the system reverts if the pool has less than 100 ETH.
