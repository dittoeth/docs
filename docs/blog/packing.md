<script setup>
import Author from './Author.vue'
</script>

# A Dive into Storage Packing

<Author  />

> **Assumed Audience**: Maybe you just finished reading Uniswap's [Intro to Gas Optimization](https://docs.uniswap.org/blog/intro-to-gas-optimization), and were left wondering how the packing of [`Slot0`](https://github.com/Uniswap/v3-core/blob/d8b1c635c275d2a9450bd6a78f3fa2484fef73eb/contracts/UniswapV3Pool.sol#L56-L74) even works. You have questions about the specifics of EVM storage costs. You want some guidance in the kinds of questions to ask in regards to organizing contract data. Some real-world examples? Join me into the depths of storage, anon.

There are plenty of tips and tricks online that give you copy-paste examples of how to save some gas. But let's face it, a lot of them are either trivial (`++i`), general programming knowledge applied not specific to solidity like [short circuiting](https://en.wikipedia.org/wiki/Short-circuit_evaluation), just solidity trivia (use custom errors vs revert), or too much complexity for the situation (assembly in some cases). What I'm looking to do is have a clearer understanding of the underlying system so I can get the underlying principles, whether it's output from Stack Overflow/ChatGPT, a gas trick from Twitter.

To be clear, while micro-optimizations _can_ add up and gas golfing is fun, they pale in comparison to appropriate data organization (like when to use a mapping over an array), appropriate algorithms for those structures, or simply removing features from your product. It's hard to justify saving some gas at the cost of readability from gas tricks when so much more is still on the table.

It so happens that one of the most effective gas optimizations (imo) involves efficient data organization, via _storage packing_. (also known as variable packing, struct packing)

## Structs 101

What is a `struct` anyway?

`Structs` (see solidity [docs](https://docs.soliditylang.org/en/latest/types.html#structs)) are just composite data types, types made up of other types.

They are akin to Structs in C or Objects in JavaScript. (and separate from [user-defined value types](https://soliditylang.org/blog/2021/09/27/user-defined-value-types/))

```solidity
struct Funder {
  address addr;
  uint256 amount;
}
```

Basically anywhere you use another data type like `uint` or `address`, you can use a struct too.

```solidity
contract A {
  Funder f; // in storage
  mapping(uint a => Funder f) funders; // in a mapping

  // in parameter or return
  function fn(Funder f) public returns (Funder) {
    // in memory
    Funder memory f2;
    // usage
    f.addr;
    f2.amount;
    funders[0].amount;
  }
}
```

This post is specifically concerned with the use of Structs in `storage` for gas efficiency, so not when a struct is used to organize data in memory or in function arguments.

Packing refers to the fact that data can be more efficiently stuffed into the same space to save memory. Languages like C also do [packing](https://www.joshcaratelli.com/blog/struct-packing), so the term refers to similar concepts.

```solidity
struct Funder {
  address addr; // slot 0
  uint256 amount; // [!code --] // slot 1
  uint8 amount; // [!code ++] // slot 0
}
```

Each field/variable in a struct takes up a full slot (32 bytes), unless the value of the data type is itself smaller than that.

Solidity will automatically "pack" multiple variables if they fit into a single slot. And If the next field makes the slot overflow 32 bytes, then that next will start the next slot. (this is also why storage packing might be referred to slot packing, which lets this idea be applied to other languages like Huff; what matters is that the EVM operators on 32 byte slots and make using of each byte is more efficient, whether you have access to the abstraction of a struct or not)

> "If a value type does not fit the remaining part of a storage slot, it is stored in the next storage slot." - [solidity docs](https://docs.soliditylang.org/en/v0.8.17/internals/layout_in_storage.html)

So storage packing is akin to playing tetris or packing a moving box, like compressing data to enable the reuse of costly space (in `storage`) that would of been unused otherwise.

> "It might be beneficial to use reduced-size types if you are dealing with storage values because the compiler will pack multiple elements into one storage slot, and thus, combine multiple reads or writes into a single operation." - [solidity docs](https://docs.soliditylang.org/en/v0.8.17/internals/layout_in_storage.html)

## Doing Less

To save on costs, the general lesson is the same:

_the more code\* that is run, the more resources are consumed_.

> To be sure\*, different operations cost different amounts of gas to prevent unnecessary spam or load on the network (with a base gas cost of `21000`), so it's important to know the difference between opcodes. A single line could cost a ton of gas, and hundreds of lines of a different operation could cost a tiny amount.

In other words, the specifics come down to doing less work.

With Solidity/EVM, this _resource_ is the [gas](https://ethereum.org/en/developers/docs/gas/) a function or a transaction will consume. The _work_ are the set of [EVM opcodes](https://www.evm.codes/) run.

To take a step back, the EVM makes it expensive to save anything to the blockchain (saving means saving it to every node in the system which can't be free or cheap). So anytime a protocol don't _have_ to save data on-chain, the cheaper the protocol will be for users. Everything comes down to doing less (assuming it can't be off-chain). So we want to minimize storage, both in the amount used and how often it's used (tradeoff being levels of decentralization of data/compute/etc)

Like other virtual machines, the EVM (Ethereum Virtual Machine) has a set of operations (op codes), that show how much things cost. [evm.codes](https://www.evm.codes/) is one such site. For the purposes of this article (and something to have in the back of your mind when developing a contract), the ones to focus on are `SLOAD` (54) and `SSTORE` (55). Solidity compiles to EVM just like other languages, so the numbers aren't one-to-one but gives a general idea of the cost.

> Note: Memorizing the numbers isn't that important and will come naturally as familiarity ensues over time. Macro Security has a fun cheat sheet for [gas numbers](https://0xmacro.com/library/gas-nums)

The `S` in `SSTORE` stands for storage store (there is also `MSTORE` which is memory store, and an upcoming `TSTORE` for transient store). From the [docs](https://docs.soliditylang.org/en/latest/introduction-to-smart-contracts.html#storage-memory-and-the-stack), it states that there are different places where data can be stored in the EVM.

So two main takeaways for our purposes:

1. Storage is [stored](https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html) in 256-bit words (32 bytes), called slots. Variables in slots are compacted according to a set of rules. The cost of storage is calculated according to the use of these slots.
2. Storage is expensive, especially when compared to memory. It's writing persistent data to the chain vs temporary data. Writing a contract is even more expensive since it's permanent data (outside of self-destruct which is deprecated/being removed).

## Storage Terms

There are a lot of specifics around gas costs (memory allocation, refunds, etc) but the most important thing regarding storage is regarding the number of slots used in a transaction and what values are used in those slots.

Lets explain a few terms:

A _slot_ refers to a storage place (using a `key` to find it). Here's an example of a struct with a single number that takes up 1 slot.

```solidity
struct Order {
  uint256 price;
}
```

If I wanted to add another number with the same size, I can just append it to the bottom, and it will take up 2 slots.

```solidity
struct Order {
  uint256 price;
  uint256 amount;
}
```

The basics of struct packing start here: if these values (according to you) can be smaller, then they can fit into 1 slot, which will cost less than the 2 slots that was there originally.

```solidity
struct Order {
  uint128 price;
  uint128 amount;
}
```

Here's an example of this approach using ArtGobblers contracts (which also happens to have a price and a count):

Assuming there wasn't any other data needed, the struct takes up 1 slot (which saves 20k/deploy and 5k/update when compared to 2 slots). Both fields don't have to be a `uint256`, as a `uint128` is well enough size to handle a price amount and a count (any lower uint would take up less space, but if there is only 1 slot to fill with no additional data, then might as well split up the 256 in half).

```solidity
struct LegendaryGobblerAuctionData {
    uint128 startPrice;
    uint128 numSold;
}

LegendaryGobblerAuctionData public legendaryGobblerAuctionData;
```

Every blog post about gas optimization copies this example.

```solidity
uint128 a; // slot 0
uint256 b; // slot 1
uint128 c; // slot 2

uint128 a; // slot 0
uint128 b; // slot 0
uint256 c; // slot 1
```

> I think we can do a lot better here. The biggest question is: **why** is a, b, or c a `uint256` in the first place?

A slot can be _warm_ or _cold_, depending on if that location was already accessed before in that transaction.

A slot's value can be _dirty_ or _clean_ depending on if has been updated already, and the value can also be zero or non-zero (relevant for the purposes of gas calculation).

---

Both reading and writing to slots cost gas. Accessing a slot means doing an `SLOAD`, and writing to a slot means doing an `SSTORE`. I can refer directly to the [docs](https://0xmacro.com/library/gas-nums) for every case, but it's best to build an intuition on how much things cost overall.

TL;DR: goal is to minimize the number of `SLOAD` (reads) and `SSTORE` (writes) in a transaction while being able to do whatever the function needs.

- `SLOAD`: is ~`2k` gas
- `SSTORE`: is ~`20k` gas for a new value (going from zero to non-zero)
- `SSTORE`: is ~`5k` gas for editing an old value (going from non-zero to non-zero)

> Note: It's always important to have a grasp on how to measure any changes that are made, so you may need a setup to tell you the gas costs of functions so you can determine if a change actually reflects a savings and whether the tradeoff in readability/complexity is worth it.

## SLOAD

A `SLOAD` operation is reading/accessing/viewing a storage slot (gas is simpler to understand than `SSTORE`).

- If cold, it costs `2100` to load
- If warm, it costs `100` to load

So `2100` the first time a slot is loaded, and `100` every time after that.

**Note**: A common optimization just based on this would be to save the value of the `SLOAD` as memory, so the access should be generally a lot less via `MLOAD` (51). This is particularly useful for when you need to read the value in a loop (also why some suggest caching the array.length value in memory, as it's also an `SLOAD`). Of course if you don't need to read it again, you won't need to save it to memory either.

```solidity
uint256 temp = price;
for (uint256 i = 0; i < 3; i++) { // use temp }
```

**Note**: This is the cost of loading 1 slot. If a struct contains multiple slots, it might be better to load only the specific slot required for a function (sometimes you need to load the whole thing; in that case you might as well save it to memory). If you only need 1 out of many, it's recommended to use the `storage` keyword.

```solidity
struct Order {
  uint256 price;
  uint256 amount;
}
Order storage o = s;
o.price; // only loads the price slot if it's in a separate slot.
o.amount; // new SLOAD (unless struct packed both into 1 slot)
```

## SSTORE

A `STORE` operation is writing to a storage slot (gas calculation here depends on if the slot being is "dirty" or "clean", meaning it was previously written or not).

The TL;DR is that setting it's really expensive to set a slot to a non-zero value. What matters here isn't necessarily the exact gas value but how it compares to other operations (these all have changed in the past and will change in the future). Again the `SLOAD` is `2,100` gas for a cold read, and `100` for a warm one (already read in the transaction earlier).

The basic version (the actual values are a lot more complicated) is:

- zero to nonzero: `22,100` gas
- nonzero to nonzero: `5,000` gas

All storage slots default to a value of zero, whether arrays, mappings, or other primitive values like `uint256` (this is why you don't have to initialize values to zero like `uint256 count = 0;`)

> From the solidity [docs](https://docs.soliditylang.org/en/latest/types.html#mapping-types): You can think of mappings as hash tables, which are virtually initialised such that every possible key exists and is mapped to a value whose byte-representation is all zeros, a type’s default value.

So if a slot hasn't be written to before, the gas will be ~20k each.

Going from zero to non-zero is high: `22,100` gas for each slot.

```solidity{4}
contract User {
  uint256 count; // defaults to zero
  function write() public {
    count = 1; // +22.1k gas
  }
}
```

> You might notice that the `2,100` gas from a `SLOAD` is there (in a sense, it's included in the cost if it's a cold slot). If the slot key is warm, then you can minus the `2,100` gas from the `SSTORE` (`22.1k` becomes `20k`, `5k` becomes `2.9k`).

Going from a non-zero to non-zero is still `5,000` gas, although at this moment it's 4x less than writing a value from zero.

```solidity{4}
contract User {
  uint256 count = 1; // already non-zero
  function write() public {
    count = 1; // +5k gas
  }
}
```

If you have already written to the same slot in the same transaction, then it's a lot cheaper (`100` gas like a warm `SLOAD`). It was already written to previously so it doesn't need to cost a lot because the code could of been written to just save that value.

```solidity{4}
contract User {
  uint256 count = 1;
  function write() public {
    count = 2; // +5k gas
    count = 3; // +100 gas, but could of just removed the line earlier
    count = 4; // +100 gas, but could of just removed the line earlier
  }
}
```

---

One last thing to note on `SSTORE` (yet another confusing thing) is **storage refunds**: a refund of gas at the end of the tx if you set slots back to the default of zero.

They used to be much greater, but now they are reduced due to using (one could say exploiting) them for [gas arbitrage](https://gastoken.io). Summary is that contracts were made to write to storage slots (still `20,000` gas each) when gas prices were cheap, and then to refund those storage slots by writing them to zero when gas prices were higher. So create contracts with storage and then self-destruct them to get the refund. [EIP-3529](https://eips.ethereum.org/EIPS/eip-3529) was created to address the issue. (prob worth it's own post both from a technical and social standpoint)

I'm not too confident it's that important to know refund calculations; just that setting storage slots back to zero can potentially give you a limited refund of gas, as it's not 100% of the cost back.

You can either to a `delete count;` or just something like `count = 0;`.

## Checking Slots

It's not too hard to check the slots manually by simply adding up the uint values, but there are some other approaches, other than realizing that the gas costs went up. (It might be cool to implement an editor extension in the future that does it for you, like [JuanBlanco.solidity](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity))

- [foundry: `cast storage`](https://book.getfoundry.sh/reference/cast/cast-storage) can be used to get a table of storage slots for a deployed contract (e.g. `cast storage 0x5Af0D9827E0c53E4799BB226655A1de152A425a5`).
- [foundry: `forge inspect Contract storage-layout --pretty`](https://github.com/foundry-rs/foundry/pull/1524) does something similar without needing to deploy

```sh
$ forge inspect LilGnosis storage-layout --pretty
+----------+--------------------------+------+--------+-------+
| Name     | Type                     | Slot | Offset | Bytes |
+=============================================================+
| nonce    | uint256                  | 0    | 0      | 32    |
|----------+--------------------------+------+--------+-------|
| quorum   | uint256                  | 1    | 0      | 32    |
```

Nomad has a cool [script](https://github.com/nomad-xyz/monorepo/blob/9b6f68278cf687f9f19065d52b0fac6a128346b1/scripts/storage-inspect.sh#L20) using `forge inspect` to even check if the storage layout has changed in change you didn't mean to change the slots around.

- [assembly: `field.slot` and `field.offset`](https://docs.soliditylang.org/en/latest/assembly.html#access-to-external-variables-functions-and-libraries): can be used to access slot values.

Can test this in an editor like [remix](https://remix.ethereum.org)

```solidity{15-16}
contract C {
  struct Order {
    uint128 price;
    uint128 amount;
  }
  Order o; // slot 0
  uint128 a; // slot 1
  uint128 b; // slot 1, offset: 16
  uint256 c; // slot 2

  function get() public pure {
    uint256 slot;
    uint256 offset;
    assembly {
        slot := o.slot
        offset := o.offset
    }
  }
}
```

## Storage Questions

I think to do storage packing efficiently, it really moves up to the abstraction level of the product; beyond the basics of splitting uint256 into uint128 to save a slot, there's a lot more that depends on what tradeoffs should be made.

- What is the minimum amount of data I _have_ to store on-chain? Storing less on chain means less data to pack into a struct, so either it will take up less slots, or other values can take up more space.
- Is it possible to represent a piece of data smaller than I would normally think to do? What is the smallest compression of data that would let me get back the same value?
- What features are required for this product to function? Are certain data fields just nice to have? How much do I care about the gas costs? Is it possible to move it into another struct?
- Moving structs around: Are certain functions called more than others? Which pieces of data in a struct are called together?
- What's the maximum value this data should take? (if it's a counter, it might not need to be `uint256`)
- Does this data need a certain amount of precision (think about for a price/amount/ratio)?
- Is a certain data field only used for view functions?

I'll add some examples and links to issues/PRs on GitHub of other projects doing these kinds of optimizations for more context.

## Efficient Ordering

> Can the fields in a struct be re-ordered?

Going back to the simple example, this is the case where the fields in a struct can be re-ordered and shifted so that the struct takes up less slots (assuming each field is already fixed in size and can't be smaller). This is the simplest win you can make without much effort. The key goal is here is simply to reduce the number of slots created/used in a struct, assuming each field itself can't be shrunk smaller.

```solidity
uint128 a; // [!code --] // slot 0
uint256 b; // [!code --] // slot 1
uint128 c; // [!code --] // slot 2
uint128 a; // [!code ++] // slot 0
uint128 b; // [!code ++] // slot 0
uint256 c; // [!code ++] // slot 1
```

[Tozex/Smart-Contract-Library#13](https://github.com/Tozex/Smart-Contract-Library/issues/13) contains an example of a re-ordering slot optimization to save 1 slot.

## Smallest Size

> What is the smallest type that covers the project's use case? (this question may be re-visited multiple times throughout development)

The goal of using smaller types is two-fold:

- it can decrease the number of slots a struct takes up
- or at least create room for other fields to increase or even a new field to be added

The key is to think about the assumptions one has over various fields in the system and to turn those into constraints (e.g. having a maximum number of users, orders, tokens, etc). These decisions will make it possible to reduce the `uint` size of a field and save gas, assuming one is ok with the tradeoffs made to code readability (more complexity), ux on the user's part (maybe more reverts, or limitations on how a system is used like only specific prices).

[@frovoll's tight variable packing](https://fravoll.github.io/solidity-patterns/tight_variable_packing.html) page gives the example of a postal code in Germany having at most 5 digits. Because a `uint16` has a max of `2^16-1` or `63,535`, it wouldn't fit all the codes without moving to the next uint increment, which would be `uint24`, which has a max value that is 256x higher. (if you are willing, you can also just use a uint17, though that doesn't exist in Solidity on it's own, so you'd need to make your own logic to handle the bits, which I'll talk about further down)

Example from [soundxyz/sound-protocol#192](https://github.com/soundxyz/sound-protocol/pull/192):

The discussion mentions that a `uint24` (16.7m) is a "sufficient quantity upper bound", and that the extra space will "aid in followup change to pack data into BaseMinter aux storage". So they were ok with a smaller max value, and the benefit helps in the future. A review comment mentions that the max value might be an issue, but this is fine if the protocol moves to an L2 in the future.

```solidity
struct EditionMintData {
    ...
    // The maximum number of tokens that can can be minted for this sale.
    uint32 maxMintable; // [!code --]
    uint24 maxMintable; // [!code ++]
    // The maximum number of tokens that a wallet can mint.
    uint32 maxMintablePerAccount; // [!code --]
    uint24 maxMintablePerAccount; // [!code ++]
    // The total number of tokens minted so far for this sale.
    uint32 totalMinted; // [!code --]
    uint24 totalMinted; // [!code ++]
}
```

---

## Smaller Increments than uint8

Solidity only supports "automatic" packing in increments of `uint8`, which is the smallest increment they support in terms of uint types. For anything smaller, one needs to implement custom logic for retrieving and updating data.

> NOTE: both a `bool` and `enum` take up the same space as a `uint8`. An array and mapping all take up it's own slot on its own, in addition to a slot for each of their elements.

The max values below don't really matter in the case when you actually want a `bool` to take up 1 bit vs 8 bits like by default in Solidity, as then you can figure out maxes in increments of 2x (1 bit) vs 256x (8 bit).

### BitMaps

Open Zeppelin has a [BitMap](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/structs/BitMaps.sol) implementation that can be used to store 256 booleans in a single slot. [Bit fields](https://en.wikipedia.org/wiki/Bit_field) are helpful when each bit/boolean is used to track something. This [blog](https://hiddentao.com/archives/2018/12/10/using-bitmaps-for-efficient-solid ity-smart-contracts) describes using them for an implementation of the Battleship board.

To learn more, I'd check [fiveoutofnine's post](https://hackmd.io/@fiveoutofnine/Skl9eRbX9#Overview-of-Tic-tac-toe) on bitmath and implementing tic-tac-toe. I know he's used this approach in the past to implement an on-chain [chess game](https://github.com/fiveoutofnine/fiveoutofnine-chess) as well as the first [Curta puzzle](https://www.curta.wtf/puzzle/1)!

### Aave v3

As an example, Aave v3's [ReserveConfigurationMap](https://github.com/aave/aave-v3-core/blob/27a6d5c83560694210849d4abf09a09dec8da388/contracts/protocol/libraries/types/DataTypes.sol#L38-L610) is a single slot named `data` which they packed beyond what's possible with Solidity's limited support for struct packing. This is especially useful if one is able to pack every config value into 1 struct, when things are just booleans, or smaller than uint8.

::: details `struct ReserveConfigurationMap { uint256 data; }` with comments

```solidity
struct ReserveConfigurationMap {
  //bit 0-15: LTV
  //bit 16-31: Liq. threshold
  //bit 32-47: Liq. bonus
  //bit 48-55: Decimals
  //bit 56: reserve is active
  //bit 57: reserve is frozen
  //bit 58: borrowing is enabled
  //bit 59: stable rate borrowing enabled
  //bit 60: asset is paused
  //bit 61: borrowing in isolation mode is enabled
  //bit 62: siloed borrowing enabled
  //bit 63: flashloaning enabled
  //bit 64-79: reserve factor
  //bit 80-115 borrow cap in whole tokens, borrowCap == 0 => no cap
  //bit 116-151 supply cap in whole tokens, supplyCap == 0 => no cap
  //bit 152-167 liquidation protocol fee
  //bit 168-175 eMode category
  //bit 176-211 unbacked mint cap in whole tokens, unbackedMintCap == 0 => minting disabled
  //bit 212-251 debt ceiling for isolation mode with (ReserveConfiguration::DEBT_CEILING_DECIMALS) decimals
  //bit 252-255 unused

  uint256 data;
}
```

:::

This just means custom logic to both read/write the values of `data`, since you can't just do something like `data.LTV` anymore.

As an example for "asset is paused" (bit 60),

```solidity{6-7,11}
uint256 internal constant PAUSED_MASK = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFF;
uint256 internal constant IS_PAUSED_START_BIT_POSITION = 60;

function setPaused(DataTypes.ReserveConfigurationMap memory self, bool paused) internal pure {
  self.data =
    (self.data & PAUSED_MASK) |
    (uint256(paused ? 1 : 0) << IS_PAUSED_START_BIT_POSITION);
}

function getPaused(DataTypes.ReserveConfigurationMap memory self) internal pure returns (bool) {
  return (self.data & ~PAUSED_MASK) != 0;
}
```

### ERC721A

[ERC721A](https://github.com/chiru-labs/ERC721A) also packs their ownership mapping for the ERC721.

```solidity
// OZ
mapping(uint256 tokenId => address) private _owners;
```

The normal mapping for an NFT contract has the key as the tokenId and the value as the owner's address. But remembering that the value of each mapping takes up 1 slot means it can be filled with other data to potentially optimize something. Because an address takes up `160` bits, there is `96` bits left over in the slot. This type of [savings](https://chiru-labs.github.io/ERC721A/#/design) for ERC721A makes it possible to make batch minting a "near constant cost", as for them, `_mint` is only 3 `SSTORE`.

```solidity
// Mapping from token ID to ownership details
// An empty struct value does not necessarily mean the token is unowned.
// See {_packedOwnershipOf} implementation for details.
//
// Bits Layout:
// - [0..159]   `addr`
// - [160..223] `startTimestamp`
// - [224]      `burned`
// - [225]      `nextInitialized`
// - [232..255] `extraData`
mapping(uint256 => uint256) private _packedOwnerships;
```

The main thing that is done to save gas is to not have to `SSTORE` for each NFT that is minted. In the naive or normal approach, the contract would need to set the same address for each NFT that is minted. Because the address is the same, it's already intuitive to think that there is a waste there, as the address is buying the next n NFTs anyway. So the idea is that there is a way to link the consecutive NFTs in a way that an address that buys in bulk only pays the cost of 1 NFT (plus some more to track things), and is able to handle things like transferring NFTs, burning them, calling `balanceOf`. With all these changes, ERC721A becomes a better approach for this kind of NFT (bulk minting).

## Max Values

One may eventually memorize the max values of various `uint`s if you spend any amount of time trying to reduce a type to a smaller `uint`. You can learn about this in a few ways: this [article](https://velvetshark.com/articles/max-int-values-in-solidity) lists the max values out.

In solidity (`>=0.6.8`), you can get the max/min of any integer type:

```solidity
type(uint256).min;
type(uint256).max;
```

The simplest thing imo is just to run a command in your browser console. Right click your browser, click "Inspect Element", and open to the `console` tab. Then test out various max values by just doing a `2**num-1`, like `2**80-1`.

### Prices and Amounts

If you want a max value when accounting for wei (18 decimals) such as for an ERC token amount, then you can just divide that by `10**18`. So for a `uint80`: `(2**80-1)/10**18`: `~1,208,925.82` which means it will have a maximum value of 1.2m with 18 decimals.

Just to make it simple (if you know one of the values, you can just multiply/divide by 256 each increment to get the next one). `2**n-1` with 18 decimals (for prices/amounts):

```sh
uint64 = 18.45
uint72 = 4.722k
uint80 = 1.2m
uint88 = 300m
uint96 = 79B
uint104 = 1.2T
```

If one only requires increments of either prices or amounts (`$1` with increments of `$0.01`, so `$1.01`, `$1.02`), then you can compress that to even less data.

### Timestamps

Here's an example from [Cyfrin/2023-07-beedle](https://github.com/Cyfrin/2023-07-beedle/blob/658e046bda8b010a5b82d2d85e824f3823602d27/src/utils/Structs.sol#L34-L55) (via Codehawks). The auditors recommend using a `uint64` to pack the variables.

```solidity
struct Loan {
  // @notice the timestamp of the loan start
  uint256 startTimestamp; // [!code --]
  uint64 startTimestamp; // [!code ++]
  // @notice the timestamp of a refinance auction start
  uint256 auctionStartTimestamp; // [!code --]
  uint64 auctionStartTimestamp; // [!code ++]
}
```

This [stackoverflow post](https://ethereum.stackexchange.com/questions/28969/what-uint-type-should-be-declared-for-unix-timestamps) has a similar question, with some saying a `uint32` is enough (`2**32-1` would be the year 2106).

It really depends on what the timestamp is used for. If you are able to co-locate the timestamp with other fields that are being read/written to, then it's best to try to keep that type smaller so it can potentially fit in 1 slot (this could be the case if you needed to keep the timestamp of an Order when it's created or when it expires).

If you are just tracking a time interval or difference, then you could potentially store even less of a uint. Another thing to think about is just granularity (something to note for any value). Maybe you only care about minutes, or hours, or days rather than seconds. This means the max uint can be a lot smaller. For example, if hours is good enough (round down or up), then a `uint24` can fit `timestampInHours` instead of a `uint32`.

### Counters

- If you are just tracking an index, it can probably be a lot smaller than a `uint256`.

## Reusing Fields

Some contracts (I can't find an example atm) try to re-use the value of an id that is large (say a `uint256` id) to encode extra information in it.

Uniswap v4 does something [weird](https://twitter.com/bantg/status/1668964281277136898?s=20) by forcing [hooks](https://github.com/Uniswap/v4-core/blob/73938802cad600beb07bd805cc9883e25bf87261/contracts/libraries/Hooks.sol#L7-L11) to mine a specific address for the various hooks that need to be called (annoying but doesn't take long). This saves gas since you woudln't need to do a `SLOAD` to read some config values and already have the `address` there.

```solidity
// @notice V4 decides whether to invoke specific hooks by inspecting the leading bits of the address that
/// the hooks contract is deployed to.
/// For example, a hooks contract deployed to address: 0x9000000000000000000000000000000000000000
/// has leading bits '1001' which would cause the 'before initialize' and 'after modify position' hooks to be used.
library Hooks {
```

It asks that you encode the config values into the address itself. I could argue this is a specific version of struct packing potentially since it moves the config values that would normally be booleans in a `uint8` or individual booleans that don't need to be tracked or immutable since they can be read from the contract. Of course in this kind of scenario, this is best for values that are constant and can't change, which works great for these hooks.

## Co-locate Fields

> When there are multiple slots, which sets of fields are loaded or stored in the same functions?

If a functions writes to multiple fields, it would be better if there were stored at the same slot, so they are can be re-arranged to save gas.

```solidity
struct Totals {
  address aToken; // Slot 0
  address debtToken; // Slot 1
  uint96 aTokenTotal; // Slot 1
  uint96 debtTotal; // Slot 2
}
```

If we started with this struct, (assuming total could fit in a `uint96`), it would make sense to move the totals alongside the `address` to make 2 slots instead of 3.

```solidity
struct Totals {
  address aToken; // Slot 0
  uint96 debtTotal; // Slot 0
  address debtToken; // Slot 1
  uint96 aTokenTotal; // Slot 1
}
```

This is maybe a contrived example but say one arranged it like this. Assuming that `aToken` and `aTokenTotal` are both read in the same functions and same for the `debtToken` and `debtTotal`, it would be better to move them so they match, so the transaction doesn't need to read/write to 2 different slots. So in this case, it's not that there are _more_ slots than in the previous example, but that the slots are arranged to minimize the number of read/writes (`SLOAD/SSTORE`).

```solidity
struct Totals {
  address aToken; // Slot 0
  uint96 aTokenTotal; // Slot 0 (read together)
  address debtToken; // Slot 1
  uint96 debtTotal; // Slot 1 (read together)
}
```

In some cases, you will have to make a decision between tradeoffs because multiple functions touch the same storage variables. So you may choose to make certain functions cheaper (creating an order) at the expense of others (margin call).

## More Packing in the Wild

Even just searching "struct packing" on [GitHub](https://github.com/search?q=Struct+packing+language%3Asolidity&type=issues) can get you some potentially interesting examples to get an idea of what can be done (a lot of these will be from audit reports).

An an example, via [proveuswrong/contracts-tp#24](https://github.com/proveuswrong/contracts-tp/issues/24), there was an issue that the struct actually took up 2 slots: 160 + 8 + 8 + 8 + 80 = 264, so the `articleStorageAddress` would need to be changed to a `uint72`. It's good to re-iterate the the `RulingOptions` enum and the `bool` are both `uint8`. And the comment next to `articleStorageAddress` makes it clear it could of just been a `uint16` but they wanted to fill the slot and calculated the value incorrectly at first, causing an extra slot to be added.

```solidity
struct DisputeData {
  address payable challenger; // 160
  RulingOptions outcome; // 8
  uint8 articleCategory;
  bool resolved; // 8
  uint80 articleStorageAddress; // [!code --] // 2^16 is sufficient. Just using extra available space.
  uint72 articleStorageAddress; // [!code ++]
}
```

I'd would love to hear examples of different ways struct packing shows up in the wild! It would be great to get a list of different approaches or ideas, or any tips that I didn't get to mention.

## Future Ideas

It would be nice to have built-in support for struct packing that isn't solely down to increments of `uint8`, like in [ethereum/solidity#13175](https://github.com/ethereum/solidity/issues/13175), which suggests adding something like a `packed` keyword and with corresponding compiler changes to automatically do the bit shifting/masking work when reading and writing to different fields.

```solidity
struct packed Foo {
    bool val1;
    bool val2;
}
```

This kind of logic can also potentially be generated with a build-time compiler (d1ll0n's [stack-packer](https://github.com/d1ll0n/stack-packer) does something similar to this by auto generating getters/setters).

Better gas reporting like described in [foundry-rs/foundry#1795](https://github.com/foundry-rs/foundry/issues/1795) would be lovely. Seeing in-line uses of `SSTORE`/`SLOAD` might be helpful as well (I know some might use a convention of `$val` or `s_val` to mark things as storage).

---

Thanks for scrolling through ^^, let me know if you learned anything, found errors, or wanted more info on [Twitter](https://twitter.com/dittoproj)!
