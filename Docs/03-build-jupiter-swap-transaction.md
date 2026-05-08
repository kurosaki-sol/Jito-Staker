# Build The Jupiter Order Transaction

At this point, we can quote an instant unstake route:

```txt
JitoSOL -> SOL
```

This chapter is only about the Jupiter instant unstake path.

It does not replace the Jito-native staking or direct unstaking flows.

But a quote alone is not enough to let the user execute the swap.

The next step is to ask Jupiter to build an order transaction that the user can sign with their wallet.

## Where We Are

The previous script does this:

```txt
JitoSOL amount
-> Jupiter /order without taker, or with taker for transaction mode
-> expected SOL output
-> minimum received
-> route summary
```

That is useful, but nothing has moved on-chain yet. Jupiter has only told us what should happen and, when a `taker` is provided, what transaction should be signed.

## What Changes Now

Now we need a wallet public key.

Jupiter can return a quote without a wallet. But it cannot assemble the final signable transaction unless it knows which wallet will sign.

The new flow is:

```txt
amount
+ taker public key
-> Jupiter /order
-> base64 transaction
-> wallet signs transaction
-> signed transaction goes to Jupiter /execute
```

## Jupiter V2: `/order` vs `/execute`

Jupiter Swap API v2 uses a cleaner flow for the happy path:

```txt
GET /swap/v2/order
POST /swap/v2/execute
```

### `/order`

`/order` answers:

```txt
If I swap this exact amount, what should I receive?
```

If no `taker` is provided, Jupiter returns quote data but no transaction:

```txt
transaction: null
```

If `taker` is provided and the order can be built, Jupiter returns a base64-encoded transaction:

```txt
transaction: "AQAAAAAAAA..."
```

If `taker` is provided but Jupiter cannot build the transaction, Jupiter can return:

```txt
transaction: ""
error: "Insufficient funds"
```

So the script needs to handle three states:

```txt
transaction === null
quote only

transaction === ""
transaction build failed

transaction is a base64 string
transaction is ready to be signed
```

### `/execute`

`/execute` answers:

```txt
Here is the signed transaction. Please execute it.
```

It expects the signed transaction encoded as base64 and the `requestId` returned by `/order`.

This part comes later. At this stage, we only decode and inspect the transaction returned by `/order`.

## Order Response Fields

The useful response fields are:

- `inAmount`: raw input amount.
- `outAmount`: expected raw output amount.
- `otherAmountThreshold`: minimum output after slippage protection.
- `slippageBps`: max slippage in basis points.
- `priceImpact`: price impact as a number.
- `routePlan`: liquidity route chosen by Jupiter.
- `router`: winning router, such as `metis`.
- `transaction`: base64 transaction, `null`, or empty string.
- `requestId`: ID needed later for `/execute`.
- `lastValidBlockHeight`: validity window for the transaction.
- `signatureFeeLamports`: signature fee estimate.
- `prioritizationFeeLamports`: priority fee estimate.
- `rentFeeLamports`: rent estimate, often for ATA creation.

`priceImpactPct` may still appear in responses, but Jupiter marks it as deprecated in v2. Prefer `priceImpact`.

## Required New Input

```txt
taker
```

For a real app, this comes from the connected wallet.

For a CLI script, it can come from:

```txt
process.argv[3]
```

Example:

```bash
npx tsx ts/src/quote-jito-sol-to-sol.ts 1 <TAKER_PUBLIC_KEY>
```

The script can also accept a `receiver`, but this is not required for the normal case where the same wallet signs and receives the output.

## The Flow

The complete instant unstake transaction flow is:

1. Parse the JitoSOL amount.
2. Request a `JitoSOL -> SOL` order from Jupiter.
3. Check the quote safety fields.
4. If no `taker` is provided, display quote-only mode.
5. If `taker` is provided, inspect `transaction`.
6. If `transaction` is empty, show Jupiter's error.
7. If `transaction` is base64, decode it locally.
8. Later, ask the wallet to sign it.
9. Later, send the signed base64 transaction to `/execute`.

## Decoding The Jupiter Transaction

The transaction returned by `/order` is base64-encoded.

The decoding flow is:

```txt
base64 transaction
-> bytes
-> Solana transaction decoder
-> compiled transaction message decoder
```

This repo uses `@solana/kit` for that because it is the modern Solana TypeScript SDK path.

The important mental model:

```txt
getBase64Encoder().encode(base64String)
```

turns the base64 string from Jupiter into bytes.

Then:

```txt
getTransactionDecoder().decode(transactionBytes)
```

turns those bytes into a transaction object.

Then:

```txt
getCompiledTransactionMessageDecoder().decode(transaction.messageBytes)
```

turns the transaction message bytes into a readable compiled message.

## What The Decoded Message Shows

A decoded Jupiter transaction can show fields like:

```txt
version
header.numSignerAccounts
staticAccounts
lifetimeToken
instructions
addressTableLookups
```

For example:

```txt
version: 0
header.numSignerAccounts: 1
staticAccounts.length: 16
instructions.length: 8
addressTableLookups.length: 3
```

This tells us:

- `version: 0` means Jupiter returned a Solana v0 transaction.
- `numSignerAccounts: 1` means one wallet needs to sign.
- The first static account is usually the signer.
- `instructions` contains the compiled actions Jupiter assembled.
- `addressTableLookups` means the transaction uses lookup tables to fit more accounts into a v0 transaction.

You may see programs such as:

- `ComputeBudget111111111111111111111111111111`, because Jupiter can add compute budget instructions.
- `JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4`, the Jupiter aggregator program.
- `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`, the SPL Token program.
- `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`, the Associated Token Account program.
- `11111111111111111111111111111111`, the System Program.

This confirms that Jupiter is not just returning a quote. It is assembling a real Solana transaction.

## Debug Output

The full decoded message can be large.

The default output should be a short summary:

```txt
Decoded Jupiter transaction
Version: 0
Required signers: 1
Signer: <public key>
Static accounts: 16
Instructions: 8
Address lookup tables: 3
Lifetime token: <blockhash-like value>
```

Full message output should be kept behind a debug flag:

```bash
npx tsx ts/src/quote-jito-sol-to-sol.ts 1 <TAKER_PUBLIC_KEY> --debug
```

## What Can Go Wrong

- The quote can expire before the transaction is sent.
- The user may not have enough JitoSOL.
- The user may not have enough SOL for transaction fees.
- Jupiter can return `transaction: ""` with an error message.
- The swap route can become invalid.
- The transaction can fail simulation.
- The slippage threshold can be hit.
- The wallet can reject the signature request.
- The network request can fail before Jupiter returns an HTTP response.

## Why This Matters

This is the difference between a dashboard and a real app integration.

A quote tells the user what should happen.

A transaction lets the user actually sign and execute it.

For the final product flow, this is the first real version of:

```txt
Instant unstake:
JitoSOL -> SOL with Jupiter
```

The next implementation step is:

```txt
sign the decoded transaction with a wallet
encode the signed transaction back to base64
POST it to Jupiter /execute with requestId
```

After that, the course returns to the missing Jito-native pieces:

```txt
SOL -> JitoSOL with Jito direct mint
JitoSOL -> SOL without Jupiter
route selection between instant and direct exits
```
