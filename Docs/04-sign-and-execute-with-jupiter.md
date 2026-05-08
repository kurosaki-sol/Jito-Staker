# Sign And Execute With Jupiter

At this point, Jupiter can return a base64 transaction from `/order`.

We can also decode that transaction locally and inspect the compiled message.

This chapter is about signing and executing the Jupiter instant unstake route only.

The broader repo still needs to cover:

```txt
staking with Jito direct mint
unstaking without Jupiter
route selection between both unstake paths
```

The next step is execution:

```txt
base64 transaction from /order
-> user signs it
-> signed transaction is encoded back to base64
-> signed transaction + requestId are sent to /execute
```

## Frontend First, Scripts Second

This course is mainly for app builders.

In a real frontend app, the user signs with their wallet:

```txt
Phantom
Solflare
Backpack
Wallet Standard wallet
```

That means the app should not touch private keys.

The frontend flow is:

```txt
connected wallet public key
-> Jupiter /order with taker
-> base64 transaction
-> decode transaction
-> wallet signs transaction
-> encode signed transaction
-> Jupiter /execute
```

For scripts, the flow can be similar, but the signer may be a local keypair.

That is useful for testing and automation, but it is more dangerous because it involves private keys. This repo should keep local keypair signing as an advanced path, not the main path.

## `/execute`

Jupiter `/execute` is the managed execution endpoint.

It expects:

```txt
signedTransaction
requestId
```

`requestId` comes from `/order`.

`signedTransaction` is the same transaction Jupiter returned, but signed by the wallet and encoded back to base64.

## Why We Do Not Execute The Unsigned Transaction

The transaction returned by `/order` is assembled, but it is not signed by the user's wallet.

If the decoded message says:

```txt
Required signers: 1
Signer: <user wallet>
```

then that wallet must sign the transaction before execution.

Sending the unsigned transaction to `/execute` should not work.

## The Clean Architecture

To keep this repo useful for both frontends and scripts, the code should be split mentally into two layers.

Core functions:

```txt
getJupiterOrder()
decodeJupiterTransaction()
executeJupiterOrder()
parseTokenAmount()
formatTokenAmount()
```

These should return data and avoid `console.log`.

CLI or app layer:

```txt
read process.argv
read process.env
print output
ask wallet to sign
handle user errors
```

This matters because the same core functions should eventually work in:

```txt
React frontend
Next.js app
Node script
CLI demo
```

## Execution Flow

The full flow is:

1. Parse the amount.
2. Call `/order` with `inputMint`, `outputMint`, `amount`, and `taker`.
3. Check that `transaction` is a non-empty base64 string.
4. Decode the transaction for debugging or display.
5. Ask the wallet to sign the transaction.
6. Encode the signed transaction back to base64.
7. Call `/execute` with `signedTransaction` and `requestId`.
8. Show the execution result to the user.

## What Can Go Wrong

- The wallet rejects the signature request.
- The transaction expires before signing or execution.
- The user no longer has enough input token balance.
- Slippage protection is triggered.
- Jupiter cannot land the transaction.
- The network request fails before Jupiter returns a response.
- A script signs with the wrong keypair.

## What We Build Next

The next code step is not signing yet.

First we add a clean function for `/execute`:

```txt
executeJupiterOrder(signedTransactionBase64, requestId)
```

That function should only POST data and return Jupiter's response.

The signing step can then be plugged in from either:

```txt
frontend wallet
local keypair script
```

This keeps the implementation flexible instead of hardcoding one signing method too early.
