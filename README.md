# JitoSOL - How Could You Bring Staking To Your App?

###### Written as a real learning note, with some help structuring the research and examples. If my `skibidi gen z brain` can understand it, yours can too.

## What is JitoSOL? [Skip if you already know]

JitoSOL is a liquid staking token on Solana.

Instead of staking SOL directly and waiting through native stake activation/deactivation flows, users can deposit SOL into Jito's stake pool and receive JitoSOL.

JitoSOL represents staked SOL plus accumulated staking rewards and MEV-related rewards. Over time, 1 JitoSOL should represent more than 1 SOL.

## What Are We Building?

We are building a practical app integration flow:

```txt
Stake:
SOL -> JitoSOL using Jito direct mint

Instant unstake:
JitoSOL -> SOL using Jupiter instant swap

Direct unstake:
JitoSOL -> stake account -> deactivate -> withdraw SOL

Router:
choose between instant Jupiter exit and direct Jito unstake
```

## Why This Repo Exists

The official Jito docs are useful, but they are mostly reference-oriented.

This repo tries to answer the app-builder question:

> Ok, I know the JitoSOL mint and stake pool exist. How do I actually add staking and instant unstaking to my app without getting lost?

## Repo Structure

```txt
docs/
  Course-style explanations

ts/
  TypeScript app integration examples

rust/
  Lower-level Rust / CPI deep dive
```

## Learning Path

1. Understand SOL, WSOL, and JitoSOL.
2. Quote JitoSOL -> SOL using Jupiter for instant unstake.
3. Build and inspect the Jupiter order transaction.
4. Understand wallet signing and Jupiter `/execute`.
5. Stake SOL -> JitoSOL using Jito direct mint.
6. Unstake JitoSOL without Jupiter using the Jito/SPL stake pool route.
7. Build a product router for instant vs direct unstake.
8. Study the Rust/CPI side once the app flow makes sense.

## Resources

Jito official documentation:
https://www.jito.network/docs/hub/overview/#getting-started

Jito deployed programs:
https://www.jito.network/docs/jitosol/jitosol-liquid-staking/security/deployed-programs/#jito-stake-pool-addresses

Jito staking integration:
https://www.jito.network/docs/jitosol/jitosol-liquid-staking/for-developers/staking-integration/

Jito unstaking overview:
https://www.jito.network/docs/jitosol/get-started/unstaking-jitosol-flow/unstaking-overview/

The Medium post that made me want to document the struggle:
https://medium.com/@chajesse/the-struggle-of-integrating-jito-staking-vault-into-my-solana-program-3195b5b3c7a5
