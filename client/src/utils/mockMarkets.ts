export type CryptoCurrency = {
  name: string;
  symbol: string;
  price: string;
  numericPrice: number;
  change: number;
  changePercent: string;
  marketCap: string;
  link: string;
  bgColor: string;
  iconSymbol: string;
};

export const generateCurrencies = (): CryptoCurrency[] => {
  const baseCurrencies = [
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      price: '103,260.0',
      numericPrice: 103260.0,
      change: -0.11,
      changePercent: '-0.11%',
      marketCap: '2,026.069B',
      link: '/price/BTCUSDC',
      bgColor: '#F7931A',
      iconSymbol: '₿',
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      price: '2,589.49',
      numericPrice: 2589.49,
      change: 4.26,
      changePercent: '4.26%',
      marketCap: '306.319B',
      link: '/price/ETHUSDC',
      bgColor: '#627EEA',
      iconSymbol: 'Ξ',
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      price: '0.99980',
      numericPrice: 0.9998,
      change: -0.05,
      changePercent: '-0.05%',
      marketCap: '105.292B',
      link: '/price/USDTUSDC',
      bgColor: '#26A17B',
      iconSymbol: '₮',
    },
    {
      name: 'Solana',
      symbol: 'SOL',
      price: '179.03',
      numericPrice: 179.03,
      change: 3.22,
      changePercent: '3.22%',
      marketCap: '77.330B',
      link: '/price/SOLUSDC',
      bgColor: '#9945FF',
      iconSymbol: '◎',
    },
    {
      name: 'Dogecoin',
      symbol: 'DOGE',
      price: '0.20525',
      numericPrice: 0.20525,
      change: 0,
      changePercent: '',
      marketCap: '32.721B',
      link: '/price/DOGEUSDC',
      bgColor: '#C2A633',
      iconSymbol: 'Ð',
    },
    {
      name: 'Litecoin',
      symbol: 'LTC',
      price: '98.28',
      numericPrice: 98.28,
      change: 0,
      changePercent: '',
      marketCap: '7.475B',
      link: '/price/LTCUSDC',
      bgColor: '#345D9D',
      iconSymbol: 'Ł',
    },
    // Additional cryptocurrencies for testing pagination
    {
      name: 'Cardano',
      symbol: 'ADA',
      price: '0.45',
      numericPrice: 0.45,
      change: 1.2,
      changePercent: '1.2%',
      marketCap: '15.8B',
      link: '/price/ADAUSDC',
      bgColor: '#0033AD',
      iconSymbol: 'A',
    },
    {
      name: 'Polkadot',
      symbol: 'DOT',
      price: '7.25',
      numericPrice: 7.25,
      change: -0.8,
      changePercent: '-0.8%',
      marketCap: '9.2B',
      link: '/price/DOTUSDC',
      bgColor: '#E6007A',
      iconSymbol: 'D',
    },
    {
      name: 'XRP',
      symbol: 'XRP',
      price: '0.50',
      numericPrice: 0.5,
      change: 2.5,
      changePercent: '2.5%',
      marketCap: '26.9B',
      link: '/price/XRPUSDC',
      bgColor: '#23292F',
      iconSymbol: 'X',
    },
    {
      name: 'Binance Coin',
      symbol: 'BNB',
      price: '328.41',
      numericPrice: 328.41,
      change: 0.9,
      changePercent: '0.9%',
      marketCap: '50.6B',
      link: '/price/BNBUSDC',
      bgColor: '#F3BA2F',
      iconSymbol: 'B',
    },
    {
      name: 'Avalanche',
      symbol: 'AVAX',
      price: '23.18',
      numericPrice: 23.18,
      change: -1.3,
      changePercent: '-1.3%',
      marketCap: '8.5B',
      link: '/price/AVAXUSDC',
      bgColor: '#E84142',
      iconSymbol: 'A',
    },
    {
      name: 'Chainlink',
      symbol: 'LINK',
      price: '14.50',
      numericPrice: 14.5,
      change: 3.5,
      changePercent: '3.5%',
      marketCap: '8.3B',
      link: '/price/LINKUSDC',
      bgColor: '#2A5ADA',
      iconSymbol: 'L',
    },
  ];

  return baseCurrencies;
};
