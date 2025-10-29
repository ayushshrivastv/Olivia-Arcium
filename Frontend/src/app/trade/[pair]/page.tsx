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
  // For pairs like "NYC-MAYORUSDC", we need to split properly
  // USDC is always 4 characters at the end
  const baseCurrency = pair.slice(0, -4); // Everything except last 4 chars
  const quoteCurrency = pair.slice(-4); // Last 4 chars

  return (
    <ClientTradingPage
      pair={pair}
      baseCurrency={baseCurrency}
      quoteCurrency={quoteCurrency}
    />
  );
}
