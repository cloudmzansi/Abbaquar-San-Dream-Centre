import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Mission from "@/components/Mission";
import About from "@/components/About";
import Activities from "@/components/Activities";
import UpcomingEvents from "@/components/UpcomingEvents";
import Donate from "@/components/Donate";
import VolunteerSection from "@/components/VolunteerSection";
import Contact from "@/components/Contact";
import { SEO, SEOConfigs } from "@/components/SEO";

const Index = () => {
  return (
    <>
      <SEO {...SEOConfigs.home} />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Hero />
          <Mission />
          <About />
          <Activities displayOn="home" />
          <UpcomingEvents displayOn="home" />
          <Donate />
          <VolunteerSection />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
