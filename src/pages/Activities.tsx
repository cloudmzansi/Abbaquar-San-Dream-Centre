import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Activities from "@/components/Activities";
import { SEO, SEOConfigs } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";

const ActivitiesPage = () => {
  return (
    <>
      <SEO {...SEOConfigs.activities} />
      <div className="flex flex-col min-h-screen">
        <Header />
        <Breadcrumb />
        <main className="flex-grow" aria-label="main content">
        {/* Hero Section */}
        <section aria-labelledby="activities-hero-title" className="bg-[#073366] text-white py-24 pt-32">
          <div className="container-custom">
            <h1 id="activities-hero-title" className="text-4xl md:text-5xl font-bold mb-6 text-center font-serif">Our Activities</h1>
            <p className="text-xl text-center max-w-3xl mx-auto">
              Join our community and discover what we offer. We provide various activities to engage, 
              educate, and empower members of our community.
            </p>
          </div>
        </section>

        <Activities showHeader={false} />
              </main>
        <Footer />
      </div>
    </>
  );
};

export default ActivitiesPage;
