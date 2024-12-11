# Interview with Phuwanai Thummavet


> December 12, 2024

On our featured auditor this week, our guest is Phuwanai Thummavet, aka serial-coder, is a leading smart contract auditor and security researcher with deep expertise in Ethereum and EVM chains. On Code4rena he is ranked #46 for 2024 and #173 all time. After transitioning from private blockchain work with Hyperledger Fabric, he’s become a key figure in Southeast Asia’s growing Web3 ecosystem. Today, we’ll explore his journey, the challenges of smart contract auditing, and his insights into the future of blockchain security.

**1. To kick things off, would you mind introducing yourself and telling us about your path into the world of auditing within Web3 and Ethereum?**

My name is Phuwanai Thummavet (aka serial-coder) from Thailand. I've been an independent security researcher for a year, focusing on EVM chains mainly. I was a lead smart contract auditor for 2 years at Valix Consulting, an audit firm localized in Bangkok. Before I entered the auditing journey, I was a private blockchain architect and developer working on Hyperledger Fabric for 3 years.

The turning point that changed me to the public blockchain domain (i.e., Ethereum) was that I saw a new challenging career opportunity to be a smart contract auditor, which has a higher upside in terms of income. And I began to think auditing could be my long-term prospect for work. By the way, IT security is also one domain of my interest. 

**2. I see you're from Thailand. How has the reception of crypto been there? Has there been good adoption of crypto by the public? Do you see it becoming a significant and growing part of the economy?**

Of course, we can say that Thailand is the biggest hub of the crypto industry in Southeast Asia. At the time of this interview, Thailand is holding the Devcon, ETHGlobal, and many other side events. The reception of the crypto in Thailand was pretty good. We have many crypto communities in several cities from the north to the south, including Bangkok, Chiang Mai, Phuket, etc.

Thailand is one of the world's strongest countries with crypto-adoption. There are many research groups and businesses. Regarding the regulation, we have one of the most advanced regulations in attempting to advocate related businesses and protect citizens. Even though some rules may impede the adoption, I think they can be improved as time passes. Hence, I still can see a lot of possible opportunities out there waiting for new inventors to discover.

**3. What is the tech scene like in Thailand generally?**

In the last bull-market wave, many companies kept an eye on DeFi and NFT products primarily. Nowadays, they are expanding their attention to broader domains, for instance, building public goods products, researching on-ramp and off-ramp solutions for better crypto adoptions, synthesizing real-world assets on-chain, creating crypto-arbitrage products, etc.

In other technology sectors in Thailand, I think healthcare is an interesting. As you know, the world is facing an aging society. Thailand is a well-known country where foreigners come for therapy. We provide the world's standard health services with competitive pricing.


**4. What are you keeping an eye on these days in the crypto and other tech spaces?**

I still keep my eye on crypto tech primarily. I'm interested in products or solutions for onboarding users to the crypto space, especially products applying Account Abstraction.

The emergence of Uniswap V4's Hook feature is also intriguing to me. On the one hand, I can foresee the next evolution of DeFi derived from this feature. On the other hand, the Hook feature also brings challenging security concerns for developers as well as auditors.

Off-chain oracle technologies are also one of my interests. Many Chainlink competitors have emerged recently, such as Pyth and RedStone. They have a pull model as opposed to Chainlink's push model. As an auditor, pull oracles come with many new challenging security concerns.

**5. You mentioned account abstraction (AA). From your standpoint, what’s the latest on this? It seems like it should have taken off very quickly, but that doesn't seem to be the case yet. Is there something I'm missing from a technical standpoint that still has a ways to go, or are most users of crypto just on desktops?**

I'm unsure what is the actual holdup of AA. It could be because it was introduced in a bear market period and is waiting for the next bull-market wave to shine, or it is still too complex and needs a more standardized version for broad adoption.

However, you can see some actual implementations. For instance, Safe provides the [AA as a modular part](https://docs.safe.global/home/safe-core) of their wallet, or ZKsync also supports a [native AA](https://docs.zksync.io/zksync-protocol/account-abstraction) that gives better flexibility and user experience.

Furthermore, I also see the upcoming evolution of the AA in [ERC-7579](https://eips.ethereum.org/EIPS/eip-7579) aiming to minimize the AA complexity and standardize it for better interoperability and easier adoptions.

**6. That’s very interesting. Could you name a few security concerns related to the pull model vs. Chainlink’s push model? What are the benefits of using the pull model?**

Both models have their limitations. The pull model was introduced for cost efficiency, lower latency, and more use case flexibility compared to the push oracles. In the push model, the oracle network (e.g., Chainlink) offers regularly scheduled updates to keep on-chain data up-to-date. This way requires much more expensive gas costs to support every asset on every existing chain.

Meanwhile, the pull model offers a more dynamic and flexible approach by delegating users as price update deliverers. Specifically, an update payload will be appended to the user transaction, which will be extracted and verified on-chain. After validation, the update payload will take immediate effect, and then a contract requesting the asset price can consume the updated price atomically in the same transaction.

On the one hand, the pull model can reduce costs and latency as the oracle network does not need to update on-chain assets' price data periodically. On the other hand, allowing users to deliver price updates may come with a larger attack surface than the push model.

Example security concerns:
- Can a user evade updating the price data?
- Can a user replay a spent update payload?
- Can front-running attacks with a newer update payload DoS other transactions with older update payloads?
- Multiple price updates in the same block (or transaction) can occur in the pull model. Can this lead to price manipulation?
- Etc.

**7. Have you been in touch with the people you used to work with at Hyperledger? What’s been happening in that scene? How has their road to adoption been on the corporate side?**

I sometimes give consultations regarding Hyperledger (Fabric) architecture to my clients. As you may know, Fabric is a private/enterprise blockchain framework. It is usually used privately by enterprises or corporates to solve some purposes, such as reducing trust between parties in the consortium, enhancing transparency and traceability of supply chains, etc. As it's used locally, you may only see it a little.

There are a lot of private adoptions, especially in the supply chain domain. Some shipping companies use a private blockchain to track their shipments, collecting data from sensors attached to their containers, which can be tracked back later if issues occur, providing non-repudiation to all parties involved.

**8. What’s been the most interesting project you’ve audited thus far, and what has been the most challenging?**

I gained new knowledge from every project I participated in. For example, your project was my first time auditing an order book system implemented on-chain, which was eye-opening to me.

But, if I had to pick one, I would say Uniswap V2. It was the very first project I learned about auditing. Uniswap V2 has a simple but powerful codebase. I learned the power of the atomic transaction and the immutable concept from it, which turned me into the auditing journey.

**9. If you could go back and give your younger self one piece of career advice, what would it be?**

For sure, I should sold my house and bought Bitcoin. lol

Another one may be that I should entered the audit career earlier.

**10. Outside of your professional work, what hobbies or interests do you have that help you unwind or inspire creativity?**

My hobby is watching movies and concerts. I watch a variety of movies. But I prefer sci-fi movies (e.g., Interstellar, Inception) and adventure movies (e.g., Indiana Jones, National Treasure). I'm also fascinated by conspiracy-fiction movies (like Angels & Demons, The Da Vinci Code).

Another is watching all kinds of motorsports at tracks. I used to ride motorbikes, but it's not for now.

**11. Looking ahead, what personal goals do you have for your career in the next few years?**

I still believe that auditing could be my long-term career. I might sometimes wind down from audit contests and change my focus on bug bounty hunting more. Or, I may change my focus to another specific domain, such as the ZK field.

**That's the end of our interview with serial-coder. To follow and keep in touch with Phuwanai Thummavet, follow him on [0x_serial_coder](https://x.com/0x_serial_coder) on X, [github](https://github.com/serial-coder), or his website where he writes various articles at https://www.serial-coder.com/.**

**If you are interested in being part of an interview for any talks about the latest and top of mind on Ethereum, just send me a message on X @dittoproj or email me at support@dittoeth.com.**