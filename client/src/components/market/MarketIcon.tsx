import Image from 'next/image';

export const MarketIcon = ({ base_asset }: { base_asset: string }) => (
  <div className="w-12 h-12 relative rounded-full overflow-hidden flex-shrink-0">
    <Image
      src="/kohli.png"
      alt={base_asset}
      fill
      className="object-cover rounded-full"
    />
  </div>
);
