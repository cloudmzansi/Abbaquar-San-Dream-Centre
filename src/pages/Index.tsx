import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Mission from "@/components/Mission";
import UpcomingEvents from "@/components/UpcomingEvents";
import Activities from "@/components/Activities";
import About from "@/components/About";
import Donate from "@/components/Donate";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Mission />
        <UpcomingEvents displayOn="home" />
        <Activities displayOn="home" />
        <About />
        <Donate />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
