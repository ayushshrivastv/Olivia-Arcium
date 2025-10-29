import ClientTradingPage from './ClientTradingPage';

export default async function TradingPage({
  params,
}: {
  params: Promise<{ pair?: string }>;
}) {
  const { pair } = await params;
  
  if (!pair) {
    throw new Error('Trading pair is required');
  }

  // Extract base and quote currency from pair
  // Handle both formats: "NYC-MAYOR" (just base) or "NYC-MAYORUSDC" (base + quote)
  let baseCurrency: string;
  let quoteCurrency: string;
  
  if (pair.endsWith('USDC')) {
    // Has quote currency, split it
    baseCurrency = pair.slice(0, -4); // Everything except last 4 chars (USDC)
    quoteCurrency = pair.slice(-4); // Last 4 chars (USDC)
  } else {
    // No quote currency, use as-is
    baseCurrency = pair;
    quoteCurrency = 'USDC'; // Default quote currency
  }

  return (
    <ClientTradingPage
      pair={pair}
      baseCurrency={baseCurrency}
      quoteCurrency={quoteCurrency}
    />
  );
}
