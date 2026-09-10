import SolarHero from '../components/home/SolarHero';
import ServiceTiers from '../components/home/ServiceTiers';
import GridVsSolar from '../components/home/GridVsSolar';
import HowItWorks from '../components/home/HowItWorks';
import WhySolarBD from '../components/home/WhySolarBD';
import FinalCTA from '../components/home/FinalCTA';

export default function Home() {
  return (
    <div>
      <SolarHero />
      <ServiceTiers />
      <GridVsSolar />
      <HowItWorks />
      <WhySolarBD />
      <FinalCTA />
    </div>
  );
}
