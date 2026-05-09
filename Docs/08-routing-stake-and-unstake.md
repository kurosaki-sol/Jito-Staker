# Routing Stake And Unstake

The final product should not expose random protocol details first.

It should help the user choose the right route.

This repo should eventually support:

```txt
Jito direct mint:
SOL -> JitoSOL through the Jito stake pool

Jupiter market acquire:
SOL -> JitoSOL through market liquidity

Jupiter instant exit:
JitoSOL -> SOL through market liquidity

Jito direct unstake:
JitoSOL -> stake pool withdrawal
```

## Getting JitoSOL

There are two routes for getting JitoSOL.

### Jito Direct Mint

```txt
SOL -> Jito stake pool -> JitoSOL
```

The user gives SOL and receives JitoSOL.

This is the protocol-aligned staking route.

### Jupiter Market Acquire

```txt
SOL -> JitoSOL through Jupiter
```

This is a market buy of existing JitoSOL.

It may be useful for:

```txt
fast execution
best effective market price
comparison against direct mint
```

But it should not be described as protocol-native staking.

## Unstaking Routes

There are two routes for exiting JitoSOL.

```txt
Jupiter instant exit
Direct Jito unstake
```

The default route depends on the user's goal.

## Route Decision

Simple product rule:

```txt
if user wants protocol-native staking:
  use Jito direct mint

if user wants market acquire or best immediate quote:
  use Jupiter SOL -> JitoSOL

if user wants SOL now:
  use Jupiter JitoSOL -> SOL

if user wants lower protocol-native exit and can wait:
  use direct Jito unstake
```

More advanced rule:

```txt
quote Jupiter buy route
estimate Jito direct mint output
quote Jupiter sell route
estimate direct unstake fee/time
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
Stake via Jito
Protocol-native deposit into the Jito stake pool.

Buy via Jupiter
Market swap from SOL to existing JitoSOL.

Instant via Jupiter
Fastest exit. Uses market liquidity. Output can vary with slippage.

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
stake idle SOL through Jito direct mint
buy JitoSOL through Jupiter when market route is preferable
sell JitoSOL quickly when they want to play
use direct unstaking when they are optimizing exit fees
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
getAcquireJitoSolOrderWithJupiter()
getInstantUnstakeOrderWithJupiter()
executeJupiterOrder()
buildDirectUnstakeJitoSolTransaction()
chooseAcquireRoute()
chooseExitRoute()
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
