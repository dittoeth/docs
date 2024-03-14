# Short Record As NFT

DittoEth allows the shorter the option to mint an NFT based on their `shortRecord`. Once an NFT is created, the shorter gains the right to transfer the NFT and the underlying short. The NFT follows the ERC-721 standard. As such, all existing ERC-721 functions are at the shorter's disposal, such as transferFrom and safeTransferFrom.

### NFT in Diamond

DittoEth combines the ERC-721 standard with the diamond proxy standard by making the ERC-721 contract a diamond facet.

### Minting NFT

To mint an NFT, the following criteria must be met:

1. The market must not be frozen.
2. The `shortRecord` must be valid (i.e. the `shortRecord` ercDebt must be > 0, `shortRecord` must not be closed)
3. The `shortRecord` must not already have a non-zero `tokenId`

The system relies on `shortRecord.tokenId` to mark whether an NFT of a short has been minted. Each NFT minted is assigned a unique `tokenId` based on a global `tokenIdCounter`. This counter monotonically increases and never decreases. `tokenIdCounter` is a uint40 because the assumption is that it will never hit the max value of ~1T. For reference, Ethereum had ~2B total tx as of 2023 and NFT transaction is a small fraction of that.

The ownership of the NFT is tracked by the `nftMapping`.

```solidity
mapping(uint256 tokenId => STypes.NFT) nftMapping;
```

Minting an NFT `shortRecord` using `tokenIdCounter`

```solidity
s.nftMapping[s.tokenIdCounter] = STypes.NFT({
  owner: msg.sender,
  assetId: s.asset[asset].assetId,
  shortRecordId: shortRecordId,
  uint16 shortOrderId;
});
```

### Transferring NFT

DittoEth allows a shorter to transfer their `shortRecord` to another address only if the `shortRecord` has a corresponding NFT. A `shortRecord` cannot be transferred if the `shortRecord` is `Closed` or if its ercDebt is zero (being fully redeemed on).

The `shortRecord` is deleted from the transferrer and is re-created under the ownership of the recipient. Note that the recipient can only receive the NFT if they have enough space in the `shortRecords` mapping.

Additionally, the transferrer must claim yield prior to transferring or else they forfeit it.

### Combining Shorts with NFTs

Shorters can also call `combineShorts` on shortRecords with NFTs. If the shorter is combining one or more shorts with NFTs, is required that the first `shortRecord` has an NFT in the array provided. This is because `combineShorts` collapses all `shortRecords` into the first `shortRecord`. This does not apply if a shorter is combining `shortRecords` without NFTs. All other NFTs corresponding to the shorts being provided are subsequently burned.

It is important to realize that the NFT's minted are not affected by the underlying data of the `shortRecord` itself. The only thing tying the `shortRecord` with the NFT is the `shortRecord` id. Therefore, there is nothing lost by having the NFT of the first `shortRecord` being combined as the NFT for the newly combined `shortRecord`.
