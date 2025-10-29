interface NoTableProps {
  asks: [string, string][];
  isNYCMayorMarket?: boolean;
}

export const NoTable = ({ asks, isNYCMayorMarket = false }: NoTableProps) => {
  const relevantAsks = asks.slice(0, 30);
  let currentTotal = 0;

  const asksWithTotal: [string, string, number][] = [];

  for (let i = 0; i < relevantAsks.length; i++) {
    const [price, quantity] = relevantAsks[i];
    currentTotal += Number(quantity);
    asksWithTotal.push([price, quantity, currentTotal]);
  }

  const maxTotal = currentTotal;

  // For NYC Mayor market, generate No percentages around 10-13%
  const noPercentages = isNYCMayorMarket ? [12, 11, 13, 10, 12, 11, 13, 10, 12, 11] : null;

  return (
    <div>
      {asksWithTotal.map(([price, quantity, total], index) => {
        // For NYC Mayor market, override price with calculated No percentage
        const displayPrice = isNYCMayorMarket && noPercentages
          ? (noPercentages[index % noPercentages.length] / 100).toFixed(5)
          : price;
        
        return (
          <No
            maxTotal={maxTotal}
            key={`${price}-${index}`}
            price={displayPrice}
            quantity={quantity}
            total={total}
            isNYCMayorMarket={isNYCMayorMarket}
          />
        );
      })}
    </div>
  );
};

function No({
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
        paddingLeft: '2px',
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
          right: 0,
          width: `${(100 * total) / maxTotal}%`,
          height: '100%',
          background: 'rgba(228, 75, 68, 0.325)',
          transition: 'width 0.3s ease-in-out',
        }}
      ></div>
      <div className="flex justify-between text-sm w-full px-2">
        <div>{quantity}</div>
        <div className="">
          {isNYCMayorMarket 
            ? `${(Number(price) * 100).toFixed(1)}%`
            : Number(price).toFixed(5)}
        </div>
      </div>
    </div>
  );
}
