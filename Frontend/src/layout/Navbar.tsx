'use client';

import { FloatingNav } from '@/src/ui/FloatingNavbar';
import { IconCurrencyBitcoin, IconTrophy, IconBook, IconNews, IconHome } from '@tabler/icons-react';
import { WalletButton } from '@/src/components/WalletButton';

export function Navbar() {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <IconHome className="h-4 w-4 text-white" />,
    },
    {
      name: "Markets",
      link: "/markets",
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
      <WalletButton />
    </>
  );
}
