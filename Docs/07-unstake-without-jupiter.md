# Unstake Without Jupiter

Jupiter gives us the instant exit path.

But the repo also needs to explain how to unstake without Jupiter.

That route matters because:

```txt
large withdrawals may be cheaper through direct unstaking
some users may want protocol-native unstaking
Jupiter liquidity or slippage may be temporarily bad
apps should not depend on one exit route only
```

## The Two Exit Paths

For JitoSOL -> SOL, there are two main routes:

```txt
Instant route:
JitoSOL -> SOL through Jupiter liquidity

Direct route:
JitoSOL -> stake account -> deactivate -> withdraw SOL
```

Jito's own unstaking overview frames the tradeoff clearly:

```txt
Jupiter trading:
instant, simple, variable fee/slippage

Direct unstaking:
fixed 0.1% fee, no slippage, but up to around 2 days
```

## Direct Unstaking Is Not Instant

Direct unstaking is not just the reverse of staking.

The high-level user flow is:

```txt
1. initiate unstake
2. receive / create a stake account
3. deactivate the stake account
4. wait for epoch boundary
5. withdraw SOL
```

The waiting period comes from Solana stake deactivation mechanics, not from Jupiter.

For a gaming app, this matters a lot. If a player wants to use SOL immediately, direct unstaking is usually the wrong UX.

## Assisted Unstake Flow

Jito's developer docs show an assisted unstaking path using the SPL stake pool library.

Conceptually:

```txt
amount in JitoSOL raw units
-> call withdrawStake helper
-> choose reserve or non-reserve withdrawal mode
-> build transaction
-> wallet signs
-> user receives stake account or SOL depending on route/liquidity
```

The docs describe two important modes:

```txt
useReserve: false
withdraw to a stake account, then deactivate before SOL is liquid

useReserve: true
attempt immediate SOL through the stake pool reserve
```

Reserve withdrawal can be instant, but it depends on available reserve liquidity and pool parameters. It should not be treated as always available.

## Product Messaging

The UI should not hide the delay.

Bad copy:

```txt
Unstake
```

Better copy:

```txt
Direct unstake
Lower fee, no swap slippage, but may take up to an epoch before SOL is withdrawable.
```

For players, the app should probably default to Jupiter for normal exits and show direct unstaking as an advanced or cheaper route.

## What Can Go Wrong?

- The user expects instant SOL but receives a stake account workflow.
- The user forgets to deactivate or withdraw.
- Reserve withdrawal may not have enough liquidity.
- The wallet may need multiple confirmations over time.
- Direct unstaking may be cheaper but operationally worse for a game flow.

## What We Build Later

The future helper should be explicit:

```txt
buildDirectUnstakeJitoSolTransaction({
  amountRaw,
  userPublicKey,
  useReserve
})
```

And the UI should label the mode:

```txt
Direct unstake through Jito
```

not:

```txt
Instant unstake
```

## Sources

- Jito unstaking overview: https://www.jito.network/docs/jitosol/get-started/unstaking-jitosol-flow/unstaking-overview/
- Jito staking integration docs: https://www.jito.network/docs/jitosol/jitosol-liquid-staking/for-developers/staking-integration/
