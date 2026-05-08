# Wallet Signing

At this point, the app can:

```txt
call Jupiter /order
receive a base64 transaction
decode the transaction locally
inspect the compiled message
prepare an /execute request
```

That is only one route in the full integration.

The same wallet-signing model will also matter for:

```txt
Jito direct mint staking
Jito direct unstaking
Jupiter instant unstaking
```

But the transaction still needs to be signed.

## The Important Rule

For the main app flow, the app should not touch private keys.

The user signs with their wallet.

```txt
Jupiter transaction
-> wallet signs
-> signed transaction
-> Jupiter /execute
```

That is the correct model for a frontend app.

## Why The Transaction Needs A Signature

When we decode the Jupiter transaction, we can inspect:

```txt
header.numSignerAccounts
staticAccounts
```

If the decoded message says:

```txt
Required signers: 1
Signer: <user wallet>
```

then the wallet at that address must sign the transaction.

The base64 transaction from `/order` is assembled, but it is not authorized yet.

## Frontend Flow

In a frontend app, the flow should be:

```txt
connected wallet public key
-> /order with taker
-> base64 transaction
-> decode transaction
-> wallet.signTransaction(transaction)
-> encode signed transaction to base64
-> /execute with signedTransaction + requestId
```

This fits apps using wallets such as:

```txt
Phantom
Solflare
Backpack
Wallet Standard compatible wallets
```

## Script Flow

For a Node script or CLI, the flow can be:

```txt
local keypair
-> /order with keypair public key as taker
-> decode transaction
-> sign with local keypair
-> encode signed transaction to base64
-> /execute
```

This is useful for testing, but it is not the main path for this course.

Local keypair signing means handling private keys, so it should be documented as an advanced path.

## What Should Be Shared

Both frontend and scripts should share these core functions:

```txt
getJupiterOrder()
decodeJupiterTransaction()
executeJupiterOrder()
parseTokenAmount()
formatTokenAmount()
```

Only the signing layer should change.

Frontend:

```txt
wallet signs
```

Script:

```txt
local keypair signs
```

## What We Need Next

The next technical problem is:

```txt
How do we turn the unsigned base64 transaction into something a signer can sign?
```

Then:

```txt
How do we turn the signed transaction back into base64 for /execute?
```

The target helper will eventually look like:

```txt
signJupiterTransaction(transactionBase64, signer)
```

But the signer type depends on the environment:

```txt
frontend wallet signer
local keypair signer
```

So we should not hardcode the signing method too early.

## What Can Go Wrong

- The connected wallet is not the `taker`.
- The wallet rejects the signature request.
- The transaction expires before the user signs.
- The user changes token balances before signing.
- The app signs with the wrong keypair in a script.
- The signed transaction is encoded incorrectly before `/execute`.

## Current Recommendation

For the main course path:

```txt
use frontend wallet signing
```

For local testing:

```txt
add a separate advanced script later
```

This keeps the main integration safe and app-oriented while still leaving room for CLI users.
