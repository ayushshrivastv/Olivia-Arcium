interface YesTableProps {
  bids: [string, string][];
  isNYCMayorMarket?: boolean;
}

export const YesTable = ({ bids, isNYCMayorMarket = false }: YesTableProps) => {
  const relevantBids = bids.slice(0, 30);
  let currentTotal = 0;

  const bidsWithTotal: [string, string, number][] = [];

  for (let i = 0; i < relevantBids.length; i++) {
    const [price, quantity] = relevantBids[i];
    currentTotal += Number(quantity);
    bidsWithTotal.push([price, quantity, currentTotal]);
  }

  const maxTotal = currentTotal;

  // For NYC Mayor market, generate Yes percentages around 86-90%
  const yesPercentages = isNYCMayorMarket ? [88, 87, 89, 90, 86, 88, 87, 89, 90, 86] : null;

  return (
    <div>
      {bidsWithTotal.map(([price, quantity, total], index) => {
        // For NYC Mayor market, override price with calculated Yes percentage
        const displayPrice = isNYCMayorMarket && yesPercentages
          ? (yesPercentages[index % yesPercentages.length] / 100).toFixed(5)
          : price;
        
        return (
          <Yes
            maxTotal={maxTotal}
            total={total}
            key={`${price}-${index}`}
            price={displayPrice}
            quantity={quantity}
            isNYCMayorMarket={isNYCMayorMarket}
          />
        );
      })}
    </div>
  );
};

function Yes({
  price,
  quantity,
  total,
  maxTotal,
  isNYCMayorMarket = false,
}: {
  price: string;
  quantity: string;
  total: number;
  maxTotal: number;
  isNYCMayorMarket?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        position: 'relative',
        width: '100%',
        backgroundColor: 'transparent',
        overflow: 'hidden',
        marginTop: '2px',
        paddingTop: '2px',
        paddingBottom: '2px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${(100 * total) / maxTotal}%`,
          height: '100%',
          background: 'rgba(1, 167, 129, 0.325)',
          transition: 'width 0.3s ease-in-out',
        }}
      ></div>
      <div className={`flex justify-between text-sm w-full px-2`}>
        <div className="">
          {isNYCMayorMarket 
            ? `${(Number(price) * 100).toFixed(1)}%`
            : Number(price).toFixed(5)}
        </div>
        <div>{quantity}</div>
      </div>
    </div>
  );
}
