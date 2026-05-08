# Routing Stake And Unstake

The final product should not expose random protocol details first.

It should help the user choose the right route.

This repo should eventually support:

```txt
stake SOL -> JitoSOL
unstake JitoSOL -> SOL instantly
unstake JitoSOL -> SOL directly through Jito
```

## Staking Route

For staking, the default route should be:

```txt
Jito direct mint
```

The user gives SOL and receives JitoSOL.

This is the protocol-aligned staking route.

Jupiter can quote `SOL -> JitoSOL`, but that is a swap, not a direct stake deposit. It may be useful for comparison, but it should not be the main staking story.

## Unstaking Routes

For unstaking, the app should compare:

```txt
Jupiter instant route
Direct Jito route
```

The default route depends on the user's goal.

## Route Decision

Simple product rule:

```txt
if user wants SOL now:
  use Jupiter instant unstake

if user wants lower protocol-native exit and can wait:
  use direct Jito unstake
```

More advanced rule:

```txt
quote Jupiter route
estimate direct unstake fee
check amount size
check price impact
check slippage threshold
show both options if tradeoff is meaningful
```

## Initial Thresholds

The first version can be simple:

```txt
Jupiter route looks safe when:
price impact is low
minimum received is acceptable
route exists
transaction can be built
```

Direct unstake becomes more relevant when:

```txt
amount is large
Jupiter price impact is high
slippage tolerance would need to be high
user explicitly chooses lower fee over speed
```

Jito's own user-facing docs mention direct unstaking as especially relevant for large amounts and fee optimization.

## UI Copy

The UI should compare the routes clearly.

```txt
Instant via Jupiter
Fastest. Uses market liquidity. Output can vary with slippage.

Direct via Jito
Protocol-native. Fixed unstaking fee. May require waiting until stake deactivation completes.
```

For a gaming app, this matters because player intent is different:

```txt
I want to play now
=> instant route

I am done and want to exit cheaply
=> direct route
```

## Why This Matters For TNTX-Style Apps

Players may leave SOL idle between games, tournaments, and reward cycles.

The staking integration should let them:

```txt
stake idle SOL
unstake quickly when they want to play
use direct unstaking when they are optimizing fees
```

That creates a better product story than a simple swap button:

```txt
bring staking to gaming balances
keep exits flexible
route users based on intent
```

## Future SDK Shape

The future SDK should expose route-specific functions:

```txt
buildStakeSolWithJitoTransaction()
getInstantUnstakeOrderWithJupiter()
executeJupiterOrder()
buildDirectUnstakeJitoSolTransaction()
chooseUnstakeRoute()
```

The CLI and frontend should use the same core functions.

Frontend:

```txt
wallet signs
```

Script:

```txt
local keypair signs
```

Core:

```txt
no console.log
no process.argv
no direct process.env access
```

That separation is what lets this repo grow from a learning project into a small integration kit later.
