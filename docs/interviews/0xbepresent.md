# Interview with auditor 0xbepresent



> October 9, 2024

This week for our featured interview, we are joined by 0xbepresent who was part of our last DittoETH auditing invitational. In our second contest, with Code4Arena, he came in 7th place. He is currently ranked #168 for 2024 overall in the leaderboards.   

He shares his journey into Web3 auditing, highlighting his transition from bug bounty hunting in Web2 to exploring Ethereum and smart contracts. We briefly go into the latest developments in security practices for smart contracts, including on-chain emergency response mechanisms, called "Trap", by Drosera. This allows the contract to response to the incident, such as pausing the system, without needing to wait for the governance model to intervene.

**1. Thank you for joining us! To start, could you introduce yourself and share your journey into the auditing space in Web3 and Ethereum?**

Thank you so much, I appreciate the interview. I’m 0xbepresent. I had some knowledge of Bitcoin and Ethereum, but I hadn’t really gotten involved beyond buying some coins. In my free time, I used to do hacking on bug bounty programs in Web2, and that’s where I discovered the Code4rena competitions. Toward the end of 2022, I started studying Ethereum, Smart Contracts and Solidity. The technology and ideology behind decentralization seemed amazing to me, so at the beginning of 2023, I decided to start participating in Web3 audits on different platforms (Code4rena, Sherlock, Codehawks). Initially, it was just something I did in my free time, but by early 2024, I decided to go full-time. Besides the competitions, I’ve been fortunate enough to participate in private audits. Web3 is a space where there’s always something new happening, and it pushes you to keep learning constantly, making the process even more interesting.

**2. How do you approach auditing for decentralized applications (dApps) differently compared to traditional applications? What unique challenges do you face?**

In both types of applications, the methodologies differ, but the essence is the same: you need to understand a system deeply enough to exploit it somehow. What's interesting with web3 audits is that you can often spot vulnerabilities just by reading the code, which isn't always the case with traditional apps. One of the most exciting challenges is that web3 is constantly evolving, so there's always new tech coming out, which keeps things challenging.

**3. In your experience, what are the most common mistakes developers make when writing smart contracts that lead to security vulnerabilities?**

 Writing complex code isn’t a good sign, as complexity breeds bugs. A smart contract should be clear and solve specific problems. It’s also super important to document everything well. When you're actively involved in the documentation process, you can catch incorrect implementations early on. Another common mistake is not writing tests for every line of code. Writing tests helps reveal issues you might have missed in the code itself. Developers should also be able to clearly define their own invariants, which helps guide the right type of fuzz testing needed for the project.

**4. Who has been a mentor or inspiration for you in your journey, and how have they impacted your approach to your work?**

I feel really fortunate to be able to learn from the whole community because one of the unique things about Web3 is that everything is public, including the vulnerabilities. You learn a lot just by reading vulnerability reports on platforms like solodit.xyz, and that really inspires me in my audits. Being able to see real-world examples of issues and how they were discovered helps improve my own approach and keeps me sharp.

**5. Outside of your professional work, what hobbies or interests do you have that help you unwind or inspire creativity?**

I’ve been practicing meditation for quite a few years, and I find it helps with various things, like staying focused on a single task. It also helps create a “mental reset" whenever there’s a lot of mental fatigue. On the other hand, I do a lot of exercise and hiking, which really helps clear my mind and create space for creativity

**6. If you could go back and give your younger self one piece of advice related to your career, what would it be?**

I think a good piece of advice would be to make decisions without fear of what might happen. Fear of the future can be paralyzing, and sometimes staying still isn’t the best option, moving forward in some way is always better. Fear is an illusion created in your mind. If you learn to control that part, you’ll make decisions that are more in line with what you really want in your career.

**7. What are the most exciting trends in crypto and Ethereum that you are looking forward to seeing develop? What are you keeping an eye on nowadays crypto and other tech spaces?**

I’m currently interested in layer 2 protocols that make the use of these technologies more efficient for users. It’s crucial for more people to adopt these technologies, and that will happen when there are lower fees and faster transactions. I also think that permissionless protocols like Uniswap or DittoETH should continue to be developed, as the modern world needs financial alternatives to the traditional systems.

**8. Looking ahead, what trends do you foresee in smart contract auditing and security practices within the Ethereum ecosystem?**

In audits and smart contracts, we currently can't have complete certainty that we're free from bugs. Considering that protocol code on the blockchain is public, there needs to be on-chain mechanisms to respond to incidents in an on-chain way. I’ve read about some proposals, but this is just getting started.
        
On the other hand, there are patterns like Function Requirements-Effects-Interactions + Protocol Invariants (FREI-PI), which help developers consistently verify invariants within their programming, improving security. I’m looking forward to seeing more of these patterns being used and more developers creating new ones.
        
I also see the need for tools that help with fuzzing and property-based testing at a higher level. The current issue is that there are fuzz testing tools that work in Solidity, but they leave out languages like Rust. This means auditors or developers need to be able to create tests at a higher level without having to code them themselves.

**On-chain mechanisms to respond to incidents on the blockchain? This is very interesting, could you elaborate more on this?**

This is also something new to me, it's called "Trap" by Drosera. Basically, the idea is for the developer to create a smart contract that collects on-chain data, and then have another function within the same contract to determine if the collected data is valid. If the data is not valid, the contract responds to the incident (pausing, updating protocol configurations, circuit breaking, etc.). They call this "security infrastructure as Solidity code." This security infrastructure is then deployed to a manager so operators can run it 24/7. I find it really interesting because I think it's crucial to develop security infrastructure given how smart contracts work on the blockchain. Without it, there will never be full trust from the user.

**9. Looking ahead, what personal goals do you have for your career in the next few years?**

I’d like to stay involved in web3 in some way. It’s a technology that still has a long way to go before it’s adopted by many users, which makes it really exciting.

**That's the end of our interview with 0xbepresent. To follow and keep in touch with 0xbepresent, follow him on [@0xbepresent](https://x.com/0xbepresent) on X, [github](https://github.com/0xbepresent/audits), or his website where he writes various articles at https://bepresent.mx/.**

**If you are interested in being part of an interview for any talks about the latest and top of mind on Ethereum, just send me a message on X @dittoproj or email me at support@dittoeth.com.**