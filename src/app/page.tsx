import FeatureSections from '../components/home/FeatureSections';
import { MainLayout } from '../components/layout/layout';
import HeroSection from '../components/home/HeroSection';

export default function Home() {
  return (
    <MainLayout>
      <div className="relative w-full min-h-screen">
        <HeroSection />
        <FeatureSections />
      </div>
    </MainLayout>
  );
}
