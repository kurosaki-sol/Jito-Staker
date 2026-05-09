# Instant Unstake With Jupiter

This section starts with the easiest part of the integration: quoting an instant exit from JitoSOL back to SOL.

Jupiter is not the whole staking integration.

In this repo, Jupiter is a market route:

```txt
market buy:
SOL -> JitoSOL

market sell:
JitoSOL -> SOL
```

The staking path itself should still be Jito direct mint:

```txt
SOL -> JitoSOL through the Jito stake pool
```

This chapter focuses on the sell side:

```txt
JitoSOL -> SOL
```

The goal is not to send a transaction yet. The goal is to understand what Jupiter tells us before we let a user swap.

## What We Are Quoting

We ask Jupiter for a quote from:

```txt
JitoSOL -> SOL
```

In practice, Jupiter uses the wrapped SOL mint as the SOL side of the route:

```txt
JitoSOL mint:
J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn

WSOL mint:
So11111111111111111111111111111111111111112
```

For the first version, we quote a fixed amount:

```txt
1 JitoSOL = 1_000_000_000 raw units
```

JitoSOL and SOL both use 9 decimals, so this keeps the first example simple.

## Why Jupiter?

Jito's delayed unstake flow can be cheaper for large withdrawals, but it is not instant. A user may need to wait until the next epoch.

For an app, that is not always acceptable. If a player wants to exit JitoSOL and use SOL immediately, Jupiter can route a swap through available liquidity.

This gives us the product flow:

```txt
Stake:
SOL -> JitoSOL with Jito direct mint

Market acquire:
SOL -> JitoSOL with Jupiter

Instant unstake:
JitoSOL -> SOL with Jupiter

Fallback:
Jito delayed unstake if the Jupiter route is too expensive
```

## Building The Quote URL

The quote script builds a Jupiter URL with these parameters:

```txt
inputMint=JitoSOL mint
outputMint=WSOL mint
amount=1000000000
slippageBps=50
swapMode=ExactIn
restrictIntermediateTokens=true
```

`ExactIn` means:

```txt
I know exactly how much JitoSOL I am giving.
Tell me how much SOL I should receive.
```

`slippageBps=50` means:

```txt
0.50% max slippage
```

If the final swap would receive less than Jupiter's minimum threshold, the transaction should fail instead of giving the user a worse result.

## Understanding The Quote Response

The script reads a few important fields from Jupiter.

### `inAmount`

The raw amount sent into the route.

For this first script:

```txt
1000000000 = 1 JitoSOL
```

### `outAmount`

The estimated raw amount Jupiter expects to return.

Example:

```txt
1275000000 = 1.275 SOL
```

This is only a quote. The final transaction still needs a slippage guard.

### `otherAmountThreshold`

The minimum raw amount the user should receive after slippage protection.

This is one of the most important fields for user safety.

If the final swap would return less than this value, the swap should fail.

### `slippageBps`

The max slippage tolerance in basis points.

```txt
50 bps = 0.50%
100 bps = 1.00%
```

Higher slippage makes the transaction more likely to succeed, but it also allows a worse execution price.

### `priceImpact`

The estimated impact of this swap size on the route price.

For small JitoSOL amounts, this should usually be low. If this number gets too high, the app should warn the user and suggest delayed unstaking instead.

The first safety rule in this repo is intentionally simple:

```txt
if abs(priceImpact) < threshold:
  Jupiter instant unstake looks safe for this amount
else:
  Jito delayed unstake may be cheaper
```

This is not the final production rule. It is just a first learning rule.

Note: Jupiter v2 may still return `priceImpactPct`, but the newer field to prefer is `priceImpact`.

### `routePlan`

The route Jupiter found.

Each route item contains a `swapInfo.label`, such as:

```txt
AlphaQ
Manifest
Meteora
```

Jupiter can also split a route across multiple liquidity sources. That means the app should not assume there is always only one route item.

## Why We Format Amounts With BigInt

Jupiter returns token amounts as strings.

That is a good thing. Raw token amounts can get larger than JavaScript's safe integer limit.

The rule for this repo:

```txt
raw API amount: string
math: BigInt
display: string
```

For example:

```txt
1275773763 raw units
```

with 9 decimals becomes:

```txt
1.275773763 SOL
```

This is why the script uses a small `formatTokenAmount` helper instead of `Math.floor`.

`Math.floor` would turn `1.275773763` into `1`, which is wrong for user-facing output.

## What Can Go Wrong?

- Jupiter liquidity can change between quote and transaction.
- The route can split across multiple AMMs.
- Price impact can become high for larger amounts.
- Slippage tolerance can be too strict or too loose.
- The user may receive less than the displayed quote if the transaction executes near the threshold.

This is why the first script only quotes and prints a summary. Sending a real swap transaction comes later.

## What We Have So Far

At this point, the repo can:

- ask Jupiter for a `JitoSOL -> SOL` quote;
- format raw token amounts into human-readable SOL values;
- show the expected output and minimum received;
- show the Jupiter route;
- print a basic safety message based on price impact.

Next step:

```txt
Turn the quote into a Jupiter swap transaction that a wallet can sign.
```

After the Jupiter instant path, this repo comes back to the Jito-native paths:

```txt
Stake SOL with Jito direct mint
Acquire JitoSOL with Jupiter
Unstake without Jupiter
Choose the right route for the user
```
