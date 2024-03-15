# Exit Short

A user can decrease their `ercDebt`, and potentially leave the `shortRecord` position entirely to get back the underlying collateral. After exiting the `shortRecord`, the shorter receives any unclaimed yield if the `short.updatedAt` time is greater than the `YIELD_DELAY_SECONDS` ago, as calculated in the function `disburseCollateral()`.

> `short.updatedAt` changes whenever shorter calls the following: fills a short, partially exits a short, `increaseCollateral()`, `combineShort()`

General Restrictions:

- Shorter can only exit a valid amount (greater than 0 and less than/equal to total ercDebt of short)
- Cannot exit in a way that leaves behind the minimum amount of ETH or less than `minShortErc`
- Can only exit if the CR of the `shortRecord` increases
- Can only primary exit `FullyFilled` SR (prevents possible error of matching with own short order in the case of `PartialFill` SR)

**Primary Exit Short**:

The primary way to exit a short is by going onto the orderbook as a bid via `exitShort()`. The shorter will use their short's collateral as the sole source of ETH for the bid. The shorter must update the cached oracle data and [startingShortId](../technical/ob#Matching) if applicable (15 minutes since last update). Additionally, the ETH offered in the buy back cannot exceed the short's collateral.

**Secondary Exit Short**:

The secondary way to exit a short is by the shorter providing their own `ercEscrowed` virtual amount `exitShortErcEscrowed()` or an appropriate amount of the `ercDebt` from their wallet (i.e. MetaMask) via `exitShortWallet()`.

> If shorter exits via their wallet, the systems burns the ercDebt that is exited.
