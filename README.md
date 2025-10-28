# arcium prediction market

a decentralized prediction market leveraging arcium's confidential computing infrastructure for secure, transparent, and verifiable outcome resolution.

## overview

this prediction market combines the transparency of public betting with the integrity of confidential voting mechanisms. built on arcium, it ensures that while market activities remain visible, the resolution process maintains confidentiality until completion, preventing manipulation and ensuring fair outcomes.

## architecture

<img width="1064" alt="Screenshot 2025-02-11 at 5 50 06 PM" src="https://github.com/user-attachments/assets/6b31f943-ba80-435c-b7f7-7f06b9d34259" />

the system operates through a hybrid model where public transparency meets confidential resolution, creating a trustless environment for prediction markets.

## core features

### market creation and participation
users can create prediction markets for any verifiable future event. participants place bets on outcomes with full visibility of market activity, current odds, and betting volumes.

### transparent market dynamics
all market activities including bet placements, odds movements, and liquidity changes remain publicly visible. this transparency builds trust while maintaining competitive market dynamics.

### confidential quorum resolution
when events conclude, a selected quorum votes on outcomes using encrypted submissions. this confidential voting mechanism prevents coordination and manipulation during the critical resolution phase.

### orderbook integration
advanced orderbook functionality allows for sophisticated trading strategies including limit orders, market making, and complex position management across different outcome scenarios.

### cryptographic vote tallying
votes remain encrypted throughout the voting period and are only decrypted collectively after the voting window closes. this ensures no early influence on voting patterns.

### stake-based accountability
quorum members stake tokens that face slashing penalties for incorrect votes, aligning incentives for accurate outcome determination.

## technical implementation

### workflow sequence

1. **market initialization**: users deploy markets with defined parameters, resolution criteria, and timeframes

2. **public betting phase**: transparent order matching through integrated orderbook system with real-time odds calculation

3. **event occurrence**: automated detection triggers quorum selection from eligible stakers

4. **encrypted resolution**: selected quorum members submit confidential votes using arcium's mpc infrastructure  

5. **outcome determination**: votes decrypt simultaneously after voting period, tallying occurs transparently

6. **settlement execution**: winning positions receive payouts while incorrect quorum votes face stake penalties

### confidential computing advantages

arcium's mpc capabilities ensure that individual votes remain hidden during collection while still enabling public verification of the final tally. this prevents vote buying, coordination attacks, and outcome manipulation.

## demo

watch the system in action:

https://github.com/user-attachments/assets/128e3030-3661-4043-b7cd-de04e5c63540

## unique value proposition

unlike traditional prediction markets that suffer from oracle manipulation or centralized resolution, this system provides:

- **tamper-resistant outcomes**: confidential voting prevents coordination until resolution
- **transparent operations**: all market activity remains publicly auditable  
- **economic security**: stake slashing ensures quorum accountability
- **advanced trading**: full orderbook functionality for sophisticated market participants
- **cryptographic integrity**: mpc-based vote collection maintains confidentiality without trusted parties

## getting started

detailed setup and deployment instructions for running your own arcium prediction market instance.
