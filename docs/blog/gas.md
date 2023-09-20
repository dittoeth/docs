<script setup>
import Author from './Author.vue'
</script>

# Gas Testing in Foundry

<Author  />

Gas measures the cost of operations on Ethereum (see [eth docs](https://ethereum.org/en/developers/docs/gas/)). Contracts that use less gas will thus cost less to use for users.

(gas bad)

---

Seriously though, this post will be going through the methodology on how to measure the gas costs of your contract's functions, as accurately as possible. Moving forward the gas will be referring to the "units of gas used" by an operation (op code) or function, not the gas cost in ETH (gas \* fee) as seen on a [gastracker](https://etherscan.io/gastracker). The gas costs of a contract call are "unitless" in the sense they don't have a price until it's multiplied by the base fee and priority fee which is always changing. What's important is to reduce the gas used by your protocol to save user's ETH.

> Again, this post is about measuring gas costs. if you're looking for gas optimization help, check out my last [post] on storage packing.

Measurement
