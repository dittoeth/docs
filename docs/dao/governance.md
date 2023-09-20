# DittoDAO Governance

## Overview

The DittoDAO governance contracts use industry standard contracts from OpenZeppelin, specifically the OZ Governor and the TimelockController. This setup allows for DITTO holders or Ditto Delegates to vote and execute proposals such as diamond proxy upgrades, system parameters updates, and fund distribution.

Proposals and DITTO delegation can be viewed on the DittoDAO [Tally](https://www.tally.xyz/gov/dittodao) home page.

### Governance Parameters

- Ditto proposals have a 1 day delay, followed by a 1 week voting period.
- The proposal threshold is set to 100,000 DITTO.
- The quorum is 4% of the total supply.

### Timelock Parameters

- DittoTimelock will initially have a delay set to zero.
- Both the Ditto Governor and Ditto Safe are proposers and executors of the timelock.
