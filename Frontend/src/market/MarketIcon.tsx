import Image from 'next/image';

const getMarketImage = (base_asset: string): string => {
  const marketImages: Record<string, string> = {
    'ELECTION2028': '/Election 2028.jpeg',
    'NYC-MAYOR': '/NY Election.png', // Using NY Election image for NYC Mayor
    'GOVSHUTDOWN': '/Government Shutdown.jpeg',
    'NYELECTION': '/NY Election.png',
  };
  
  return marketImages[base_asset] || '/Solana.jpg';
};

export const MarketIcon = ({ base_asset }: { base_asset: string }) => (
  <div className="w-12 h-12 relative rounded-full overflow-hidden flex-shrink-0">
    <Image
      src={getMarketImage(base_asset)}
      alt={base_asset}
      fill
      className="object-cover rounded-full"
    />
  </div>
);
