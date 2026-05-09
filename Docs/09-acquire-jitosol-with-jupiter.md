# Acquire JitoSOL With Jupiter

This route is useful, but it must be named honestly.

```txt
SOL -> JitoSOL through Jupiter
```

is not the same as:

```txt
SOL -> Jito stake pool -> JitoSOL
```

The first is a market swap. The second is protocol-native staking through the Jito stake pool.

## Why Include This Route?

For a real app, users may care about:

```txt
speed
best effective output
liquidity
simple wallet UX
```

Sometimes a Jupiter route can be attractive because it gives the user JitoSOL immediately from market liquidity.

But for the Jito integration story, direct mint remains the stronger staking path.

## Route Names

Use precise names:

```txt
Jito direct mint
Protocol-native stake deposit.

Jupiter acquire
Market buy of existing JitoSOL.
```

Avoid calling the Jupiter route:

```txt
stake with Jupiter
```

That phrase hides the fact that the app is doing a swap.

## Product Tradeoff

Jito direct mint:

```txt
SOL enters the Jito stake pool.
JitoSOL is minted through the protocol.
No DEX market route.
Better Jito-aligned staking story.
```

Jupiter acquire:

```txt
SOL is swapped for existing JitoSOL.
Execution depends on route liquidity.
Price can include slippage.
Useful for fast market access.
```

## How This Fits The Course

The Jupiter work already gives us a reusable primitive:

```txt
inputMint
outputMint
amount
taker
-> Jupiter /order
```

For instant unstake:

```txt
inputMint = JitoSOL
outputMint = WSOL
```

For market acquire:

```txt
inputMint = WSOL
outputMint = JitoSOL
```

That means the same Jupiter order flow can support both directions.

## What We Build Later

The helper should be direction-aware:

```txt
getJupiterJitoSolOrder({
  side: "buy" | "sell",
  amountRaw,
  taker
})
```

Where:

```txt
buy:
SOL -> JitoSOL

sell:
JitoSOL -> SOL
```

The route selector can then compare:

```txt
Jito direct mint
Jupiter market buy
```

for getting JitoSOL.

## What Can Go Wrong?

- The user thinks they are staking, but they are only buying JitoSOL.
- The market price is worse than the stake pool rate.
- Slippage is too high.
- The route depends on available DEX liquidity.
- The wallet may need SOL for fees even when swapping.

## UI Copy

Good UI copy:

```txt
Stake via Jito
Deposit SOL into the Jito stake pool and receive JitoSOL.

Buy via Jupiter
Swap SOL for existing JitoSOL through market liquidity.
```

This keeps the app honest while still giving users both options.
