import * as Constants from  "./constant.ts";

export interface JupResponse {
    inputMint: string,
    inAmount: string,
    outputMint : string,
    outAmount: string,
    otherAmountThreshold: string,
    swapMode: string,
    slippageBps: number,
    priceImpactPct : string,
    routePlan : unknown[],
    contextSlot: number,
    timeTaken : number,
    swapUsdValue: string,
}

async function main() {
    const url = new URL(Constants.JUPITER_QUOTEAPI)
    url.searchParams.set("inputMint", Constants.JITOSOL_MINT)
    url.searchParams.set("outputMint", Constants.WSOL_MINT)
    url.searchParams.set("amount", Constants.LAMPORT_PER_SOL.toString())
    url.searchParams.set("slippageBps", Constants.slippage_bps.toString())
    url.searchParams.set("swapMode", "ExactIn")
    url.searchParams.set("restrictIntermediateTokens", "true")
    const response = await fetch(url)
    if(!response.ok)
        throw new Error(`Jupiter quote failed: ${response.status} ${response.statusText}`)
    const quote = await response.json() as JupResponse;
    console.log(quote)
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
