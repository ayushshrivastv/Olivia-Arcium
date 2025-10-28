import { MainLayout } from '@/src/layout/Layout';

export default function Rewards() {
  return (
    <MainLayout>
        <div className="relative w-full min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
          <div className="w-full flex items-center justify-center pt-32 pb-16" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <div className="text-center px-4 max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-light mb-6 text-white" style={{ textShadow: '0 0 20px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,1), 0 0 60px rgba(0,0,0,0.9), 2px 2px 8px rgba(0,0,0,1)', WebkitTextStroke: '1px rgba(0,0,0,0.8)' }}>
                Decentralised Permissionless Prediction Market
              </h1>
              <p className="text-white text-2xl mb-8 font-light" style={{ textShadow: '0 0 15px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,1), 2px 2px 6px rgba(0,0,0,1)', WebkitTextStroke: '0.5px rgba(0,0,0,0.8)' }}>
                Rewards
              </p>
              <div className="rounded-xl p-8 mt-12 text-left" style={{ backgroundColor: 'rgba(10, 10, 10, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <p className="text-white text-lg leading-relaxed" style={{ textShadow: '0 0 10px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,1), 1px 1px 4px rgba(0,0,0,1)', WebkitTextStroke: '0.3px rgba(0,0,0,0.9)' }}>
                  Olivia rewards accurate predictions proportionally. When markets resolve, participants who predicted correctly share the prize pool based on their contribution. 
                  <br /><br />
                  The more precise your forecast, the larger your reward. Built on Solana, settlements are instant with minimal transaction fees. 
                  <br /><br />
                  No intermediaries, no delays—just transparent, automated payouts to your wallet. Your predictions become your earnings the moment markets close.
                </p>
              </div>
            </div>
          </div>
        </div>
    </MainLayout>
  );
}

