import DemosSection from "@/components/Home/DemoSection/DemoSection";
import FeatureOneDemo from "@/components/Home/FeatureOneDemo/FeatureOneDemo";
import FeatureTwoDemo from "@/components/Home/FeatureTwoDemo/FeatureTwoDemo";
import FooterDemo from "@/components/Home/FooterDemo/FooterDemo";
import HeroSection from "@/components/Home/HeroSection/HeroSection";

import "@/assets/css/gotur-landing.css";
export const metadata = {
  title: "Home || Gotur || Travel & Tour NextJS Template",
  description:
    "Gotur is a modern travel & tour booking NextJS Template. It is perfect for travel agencies, tour operators, trip holiday booking websites, adventure and booking companies looking for a unique and intuitive search function and all other travel & tourism websites and businesses.",
  icons: {
    icon: "/favicon-32x32.png",
  },
};

const page = () => {
  return (
    <div className='page-wrapper'>
      <HeroSection />
      <FeatureTwoDemo />
      <DemosSection />
      <FeatureOneDemo />
      <FooterDemo />
    </div>
  );
};
export default page;
