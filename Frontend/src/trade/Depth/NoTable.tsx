export const NoTable = ({ asks }: { asks: [string, string][] }) => {
  const relevantAsks = asks.slice(0, 30);
  let currentTotal = 0;

  const asksWithTotal: [string, string, number][] = [];

  for (let i = 0; i < relevantAsks.length; i++) {
    const [price, quantity] = relevantAsks[i];
    currentTotal += Number(quantity);
    asksWithTotal.push([price, quantity, currentTotal]);
  }

  const maxTotal = currentTotal;

  return (
    <div>
      {asksWithTotal.map(([price, quantity, total]) => (
        <No
          maxTotal={maxTotal}
          key={price}
          price={price}
          quantity={quantity}
          total={total}
        />
      ))}
    </div>
  );
};

function No({
  price,
  quantity,
  total,
  maxTotal,
}: {
  price: string;
  quantity: string;
  total: number;
  maxTotal: number;
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
        <div className="">{Number(price).toFixed(5)}</div>
      </div>
    </div>
  );
}
