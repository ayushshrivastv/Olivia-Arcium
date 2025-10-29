import { MainLayout } from '@/src/layout/Layout';

export default function Learn() {
  return (
    <MainLayout>
        <div className="relative w-full min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
          <div className="w-full flex items-center justify-center pt-32 pb-16" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <div className="text-center px-4 max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-light mb-6 text-white" style={{ textShadow: '0 0 20px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,1), 0 0 60px rgba(0,0,0,0.9), 2px 2px 8px rgba(0,0,0,1)', WebkitTextStroke: '1px rgba(0,0,0,0.8)' }}>
                Learn
              </h1>
              <p className="text-white text-lg mb-6 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: '0 0 15px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,1), 2px 2px 6px rgba(0,0,0,1)', WebkitTextStroke: '0.5px rgba(0,0,0,0.8)' }}>
                Olivia operates as a decentralized, permissionless prediction market on Solana. Anyone can create markets on any predictable event—sports, politics, crypto prices, or global trends.
              </p>
              <p className="text-white text-lg mb-6 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: '0 0 15px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,1), 2px 2px 6px rgba(0,0,0,1)', WebkitTextStroke: '0.5px rgba(0,0,0,0.8)' }}>
                Your predictions remain private using Multi-Party Computation (MPC) technology powered by Arcium. No one knows your positions until market resolution, protecting your strategies from front-running.
              </p>
              <p className="text-white text-lg mb-8 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: '0 0 15px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,1), 2px 2px 6px rgba(0,0,0,1)', WebkitTextStroke: '0.5px rgba(0,0,0,0.8)' }}>
                Smart contracts handle settlements automatically. When outcomes are determined, rewards distribute instantly to successful predictors, creating a transparent, trustless ecosystem for forecasting the future.
              </p>
            </div>
          </div>
        </div>
    </MainLayout>
  );
}

