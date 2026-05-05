import * as Constants from  "./constant.ts";

interface JupiteRouterPlan {
    swapInfo: {
      label: string;
    };
    //percent: number; Added but dont needed yet. Im lazy
}

export interface JupResponse {
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
    contextSlot: number,
    timeTaken : number,
    swapUsdValue: string,
}

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

async function printQuote(quote : JupResponse){
    console.log('Input : ' + formatTokenAmount(quote.inAmount, Constants.JITOSOL_DECIMALS)+' JitoSOL')
    console.log('Output : ' + formatTokenAmount(quote.outAmount, Constants.JITOSOL_DECIMALS)+' Sol')
    console.log('Minimum received : '+ formatTokenAmount(quote.otherAmountThreshold, Constants.JITOSOL_DECIMALS) +' Sol')
    console.log('Slippage : ' + quote.slippageBps/100 +'%')
    console.log('Price Impact : ' + quote.priceImpactPct) // Will be cleaned later
    console.log('Route : ' + quote.routePlan[0].swapInfo.label)

    if (Number(quote.priceImpactPct) < 0.01)
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
    const url = new URL(Constants.JUPITER_QUOTE_API)
    url.searchParams.set("inputMint", Constants.JITOSOL_MINT)
    url.searchParams.set("outputMint", Constants.WSOL_MINT)
    url.searchParams.set("amount", parseTokenAmount(process.argv[2], Constants.JITOSOL_DECIMALS).toString() ?? Constants.LAMPORT_PER_SOL)
    url.searchParams.set("slippageBps", Constants.slippage_bps.toString())
    url.searchParams.set("swapMode", "ExactIn")
    url.searchParams.set("restrictIntermediateTokens", "true")
    const response = await fetch(url, {headers: {"x-api-key": process.env.JUPITER_API_KEY.toString()}})
    if(!response.ok)
        throw new Error(`Jupiter quote failed: ${response.status} ${response.statusText}`)

//    console.log(await response.json())
    const quote = await response.json() as JupResponse;
    //console.log(quote)
    printQuote(quote);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
