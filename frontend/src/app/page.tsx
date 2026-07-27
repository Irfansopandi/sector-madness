import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BrandStory from "@/components/BrandStory";
import FeaturedCollection from "@/components/FeaturedCollection";
import CampaignGallery from "@/components/CampaignGallery";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeaturedCollection />
      <BrandStory />
      <CampaignGallery />
      <Footer />
    </main>
  );
}
