# Stake SOL With Jito Direct Mint

This is the core staking flow of the repo.

Jupiter is useful for instant unstaking, but staking itself should go through Jito's stake pool path.

The product goal is:

```txt
user has idle SOL
-> app offers staking
-> user signs one transaction
-> user receives JitoSOL
```

## Why Direct Mint?

For staking, we want the app to create real JitoSOL flow.

The preferred path is:

```txt
SOL -> Jito stake pool -> JitoSOL
```

This is different from swapping SOL for JitoSOL on a DEX.

Swapping can be useful in some cases, but direct mint is the protocol-native staking path and is the stronger integration story for a Jito-aligned app.

## What The Official Docs Give Us

Jito's developer docs describe two broad implementation styles:

```txt
Assisted staking
Use the SPL stake pool library helpers.

Manual transaction building
Build the DepositSol instruction and accounts yourself.
```

For this repo, the first practical implementation should use the assisted path first.

The official docs list the mainnet addresses:

```txt
SPL Stake Pool Program:
SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy

Jito Stake Pool:
Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb

JitoSOL Mint:
J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn
```

These addresses are reference data. They are not the whole integration.

The app still needs to build a transaction, get it signed by the wallet, send it, and handle the result.

## Assisted Staking Flow

The first implementation should look like:

```txt
amount in SOL
-> parse to lamports
-> call SPL stake pool depositSol helper
-> receive instructions and extra signers
-> build transaction
-> wallet signs transaction
-> send transaction
-> user receives JitoSOL
```

The important app-level inputs are:

```txt
amount
user wallet public key
connection / RPC endpoint
Jito stake pool address
```

The important app-level output is:

```txt
transaction signature
```

## What Users Should See

The UI should not say only:

```txt
Stake
```

It should explain what the user receives:

```txt
You are depositing SOL into the Jito stake pool.
You will receive JitoSOL.
JitoSOL represents staked SOL plus accumulated rewards.
```

The app should also keep a small SOL reserve for fees. A user should not stake every lamport if they still need SOL for game entries, priority fees, or later transactions.

## What Can Go Wrong?

- The user has enough SOL for staking but not enough SOL for transaction fees.
- The JitoSOL associated token account may need to be created.
- RPC simulation can fail.
- The wallet can reject the transaction.
- The pool/account addresses must match the selected network.
- Testnet/devnet addresses differ from mainnet.

## What We Build Later

The target helper should eventually look like:

```txt
buildStakeSolWithJitoTransaction({
  amountLamports,
  userPublicKey,
  connection
})
```

It should return a transaction that a frontend wallet can sign.

For CLI usage, a local signer can be plugged in later, but the main course path should remain wallet-first.

## Sources

- Jito staking integration docs: https://www.jito.network/docs/jitosol/jitosol-liquid-staking/for-developers/staking-integration/
- Jito deployed programs: https://www.jito.network/docs/jitosol/jitosol-liquid-staking/security/deployed-programs/
