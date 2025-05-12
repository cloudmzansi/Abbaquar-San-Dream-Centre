import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Activities from "@/components/Activities";

const ActivitiesPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow" aria-label="main content">
        {/* Hero Section */}
        <section aria-labelledby="activities-hero-title" className="bg-[#073366] text-white py-20 mt-[88px]">
          <div className="container-custom">
            <h1 id="activities-hero-title" className="text-4xl md:text-5xl font-bold mb-6 text-center">Our Activities</h1>
            <p className="text-xl text-center max-w-3xl mx-auto">
              Join Our Community and discover what we offer. We provide various activities to engage, 
              educate, and empower members of our community.
            </p>
          </div>
        </section>

        <Activities showHeader={false} />
      </main>
      <Footer />
    </div>
  );
};

export default ActivitiesPage;
