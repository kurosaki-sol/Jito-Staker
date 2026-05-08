import * as Constants from  "./constant.ts";
import dotenv from 'dotenv';

import {getBase64Decoder, getBase64Encoder, getCompiledTransactionMessageDecoder, getTransactionDecoder} from "@solana/kit";

dotenv.config()

interface JupiteRouterPlan {
    swapInfo: {
      label: string;
    };
    //percent: number; Added but dont needed yet. Im lazy
}

// To be re-organized properly
export interface JupOrderResponse {
    inputMint: string,
    inAmount: string,
    outputMint : string,
    outAmount: string,
    otherAmountThreshold: string,
    swapMode: string,
    slippageBps: number,
    priceImpact: number,
    priceImpactPct : string,
    routePlan : JupiteRouterPlan[],
    router: string,
    transaction: string | null,
    requestId: string,
    lastValidBlockHeight: string,
    signatureFeeLamports: number, 
    prioritizationFeeLamports: number,
    rentFeeLamports: number,
    contextSlot: number,
    timeTaken : number,
    error : string | null,
    swapUsdValue: string,
}

export interface JupExecResponse{

}

// TO BE REFACTORED
function formatTokenAmount(rawAmount : string, decimals : number): string{
    const amount = BigInt(rawAmount)
    const base = 10n ** BigInt(decimals);

    const whole = amount / base
    const fraction = amount % base
    const fractionText = fraction.toString().padStart(decimals, "0")

    if (fractionText.length == 0)
            return whole.toString()

    return `${whole.toString()}.${fractionText}`
}

//This function will only send a already signed transaction to Jupiter with the V2 /execute - RequestId is returned from the jup /order
async function executeJupiterOrder(signedTransactionBase64: string, requestId: string){
    if(!process.env.JUPITER_API_KEY)
        throw new Error("Jupiter API is missing.")
    const url = new URL(Constants.JUPITER_EXECUTE_API);
    url.searchParams.set("requestId", requestId);
    url.searchParams.set("signedTransactionBase64", signedTransactionBase64);
    const response = await fetch(url, {headers: {"x-api-key" : process.env.JUPITER_API_KEY}})
    if(!response.ok)
        throw new Error(`Jupiter execute failed: ${response.status} ${response.statusText}\n${response.text}`)
    const exec = await response.json() as JupExecResponse;
}

function decodeJupTransaction(transactionBase: string){
    const txid = getTransactionDecoder().decode(getBase64Encoder().encode(transactionBase));
    const message = getCompiledTransactionMessageDecoder().decode(txid.messageBytes)
    //If --debug Mode :
    if(process.argv[5]){
    console.log("Debug mode - Jupiter message :")
    console.dir(message, {depth: null});
    }
    else
        {
    console.log("Version:", message.version);
    console.log("Required signers:", message.header.numSignerAccounts);
    console.log("Static accounts:", message.staticAccounts.length);
    console.log("Instructions:", message.instructions.length);
    console.log("Address lookup tables:", message.addressTableLookups.length);
    console.log("Lifetime token:", message.lifetimeToken);
    console.log("Signer:", message.staticAccounts[0]);
    }
}

async function printQuote(quote : JupOrderResponse){

    if(quote.error)
        throw new Error(`${quote.error}`)
    console.log('======== Quote ========');
    console.log('Input : ' + formatTokenAmount(quote.inAmount, Constants.JITOSOL_DECIMALS)+' JitoSOL')
    console.log('Output : ' + formatTokenAmount(quote.outAmount, Constants.JITOSOL_DECIMALS)+' Sol')
    console.log('Minimum received : '+ formatTokenAmount(quote.otherAmountThreshold, Constants.JITOSOL_DECIMALS) +' Sol')
    console.log('Slippage : ' + quote.slippageBps/100 +'%')
    console.log('Price Impact' + quote.priceImpact)
    //console.log('Price Impact percentage : ' + quote.priceImpactPct) // Will be cleaned later
    console.log('Route : ' + quote.routePlan[0].swapInfo.label)
    console.log('Router : ' + quote.router)
    //Print if this is a transaction
    if(quote.transaction){
        console.log('Signature Fee : ', formatTokenAmount(quote.signatureFeeLamports.toString(), Constants.JITOSOL_DECIMALS))
        console.log('Priority Fee : ', formatTokenAmount(quote.prioritizationFeeLamports.toString(), Constants.JITOSOL_DECIMALS))
    }
    console.log('======== Transaction ========');
    if (quote.transaction)
        decodeJupTransaction(quote.transaction);


    if (Math.abs(quote.priceImpact) < 0.01) // treshold to be determinated - NOTE
        console.log("\nThis instant unstake route looks safe for this amount.")
    else
        console.log("\nPrice impact too high. Jito delayed unstake may be cheaper.")
}

function parseTokenAmount(rawAmount : string, decimals: number): bigint{
    //Security in case of bad args
    // 1 : Trim 
    // 2 : Check invalid args
    // 3 : 
    const amount = rawAmount.trim();
    if (!/^\d+(\.\d+)?$/.test(amount))
        throw new Error(`Invalid token amount : ${rawAmount}`)
    const [whole = "0", fraction = ""] = amount.split('.');
    // Better than doing a slice tbh because that was only 
    if (fraction.length > decimals)
        throw new Error(`Too many decimals : ${rawAmount}`)
    const fracpadded =  fraction.padEnd(decimals, "0")
    return BigInt(whole + fracpadded);
}

async function main() {
    if(!process.env.JUPITER_API_KEY)
        throw new Error("Jupiter API is missing.")
    const taker = process.argv[3];
    const receiver = process.argv[4];
    const url = new URL(Constants.JUPITER_QUOTE_API)
    url.searchParams.set("inputMint", Constants.WSOL_MINT)
    url.searchParams.set("outputMint", Constants.JITOSOL_MINT)
    url.searchParams.set("amount", parseTokenAmount(process.argv[2], Constants.JITOSOL_DECIMALS).toString() ?? "1")
    //new params for the order v2
    if(taker)
        url.searchParams.set("taker", taker)
    if(receiver)
        url.searchParams.set("receiver", receiver)
    url.searchParams.set("slippageBps", Constants.slippage_bps.toString())
    url.searchParams.set("swapMode", "ExactIn")
    url.searchParams.set("restrictIntermediateTokens", "true")
    const response = await fetch(url, {headers: {"x-api-key" : process.env.JUPITER_API_KEY}})
    if(!response.ok)
        throw new Error(`Jupiter quote failed: ${response.status} ${response.statusText}\n${response.text}`)
    const quote = await response.json() as JupOrderResponse;
    //console.log(quote);
    printQuote(quote);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
