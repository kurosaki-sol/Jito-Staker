# Build The Jupiter Swap Transaction

At this point, we can quote an instant unstake route:

```txt
JitoSOL -> SOL
```

But a quote is not a transaction.

The next step is to ask Jupiter to build a real swap transaction that the user can sign with their wallet.

## Where We Are

The previous script does this:

```txt
JitoSOL amount
-> Jupiter Quote API
-> expected SOL output
-> minimum received
-> route summary
```

That is useful, but nothing has moved on-chain yet.

## What Changes Now

Now we need a wallet public key.

Jupiter cannot build the final transaction without knowing which user will sign and receive the result.

The new flow is:

```txt
user public key
+ quote response
-> Jupiter Swap API
-> serialized transaction
-> wallet signs transaction
-> transaction is sent to Solana
```

## Quote API vs Swap API

### Quote API

The Quote API answers:

```txt
If I swap this exact amount, what should I receive?
```

It returns fields like:

```txt
inAmount
outAmount
otherAmountThreshold
priceImpactPct
routePlan
```

### Swap API

The Swap API answers:

```txt
Given this quote and this user wallet, what transaction should the user sign?
```

It returns a serialized transaction.

That transaction still needs to be:

```txt
deserialized
signed
sent
confirmed
```

## Required New Input

The new required input is:

```txt
userPublicKey
```

For a real app, this comes from the connected wallet.

For a CLI script, it can come from:

```txt
process.argv[3]
```

Example:

```bash
npx tsx ts/src/build-jupiter-swap-transaction.ts 1 <USER_PUBLIC_KEY>
```

## The Flow

The complete instant unstake transaction flow is:

1. Parse the JitoSOL amount.
2. Request a `JitoSOL -> SOL` quote from Jupiter.
3. Check the quote safety fields.
4. Send the quote and `userPublicKey` to Jupiter's Swap API.
5. Receive the serialized transaction.
6. Deserialize the transaction.
7. Ask the wallet to sign it.
8. Send the signed transaction to Solana.
9. Confirm the transaction.

## What Can Go Wrong

- The quote can expire before the transaction is sent.
- The user may not have enough JitoSOL.
- The user may not have enough SOL for transaction fees.
- The swap route can become invalid.
- The transaction can fail simulation.
- The slippage threshold can be hit.
- The wallet can reject the signature request.

## Why This Matters

This is the difference between a dashboard and a real app integration.

A quote tells the user what should happen.

A transaction lets the user actually do it.

For the final product flow, this is the first real version of:

```txt
Instant unstake:
JitoSOL -> SOL with Jupiter
```

The next implementation step is:

```txt
getJupiterSwapTransaction(quote, userPublicKey)
```
