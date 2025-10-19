'use client';

import { FloatingNav } from '@/src/components/ui/floating-navbar';
import { IconCurrencyBitcoin, IconTrophy, IconBook, IconNews, IconWallet, IconHome } from '@tabler/icons-react';

export function Navbar() {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <IconHome className="h-4 w-4 text-white" />,
    },
    {
      name: "Trade",
      link: "/trade/BTC-USD",
      icon: <IconCurrencyBitcoin className="h-4 w-4 text-white" />,
    },
    {
      name: "Rewards",
      link: "/rewards",
      icon: <IconTrophy className="h-4 w-4 text-white" />,
    },
    {
      name: "Learn",
      link: "/learn",
      icon: <IconBook className="h-4 w-4 text-white" />,
    },
    {
      name: "News",
      link: "/news",
      icon: <IconNews className="h-4 w-4 text-white" />,
    },
  ];

  return (
    <>
      <FloatingNav navItems={navItems} />
      <div className="fixed top-10 right-10 z-50">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200"
          style={{
            backgroundColor: 'rgba(10, 10, 10, 0.7)',
            border: '1px solid rgba(85, 34, 224, 0.5)',
            backdropFilter: 'blur(10px)',
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(85, 34, 224, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(85, 34, 224, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(10, 10, 10, 0.7)';
            e.currentTarget.style.borderColor = 'rgba(85, 34, 224, 0.5)';
          }}
        >
          <IconWallet className="h-4 w-4" />
          <span>Connect Wallet</span>
        </button>
      </div>
    </>
  );
}
