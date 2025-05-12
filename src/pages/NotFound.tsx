import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Removed console.error for production readiness
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="bg-[#073366] py-20 mt-24">
          <div className="container-custom">
            <h1 id="notfound-title" aria-labelledby="notfound-title" className="text-[#F5F5F0] text-4xl md:text-5xl font-bold mb-6 text-center">Page Not Found</h1>
            <p className="text-[#E0E9FF] text-xl text-center max-w-3xl mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>

        <section className="py-16">
          <div className="container-custom">
            <div className="bg-[#073366] p-8 rounded-lg shadow-md text-center">
              <h2 aria-labelledby="error-title" className="text-2xl font-bold mb-6 text-[#F5F5F0]">404 Error</h2>
              <p className="text-[#E0E9FF] mb-8">
                We couldn't find the page at: <span className="font-mono bg-[#0A2647] px-2 py-1 rounded">{location.pathname}</span>
              </p>
              <div className="space-y-4">
                <p className="text-[#E0E9FF]">Here are some helpful links:</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    to="/" 
                    aria-label="Return to home page"
                    className="px-6 py-2 rounded-xl font-bold bg-[#D4A017] text-white hover:bg-opacity-90 transition-colors shadow-md"
                  >
                    Return Home
                  </Link>
                  <Link 
                    to="/contact" 
                    aria-label="Contact us page"
                    className="px-6 py-2 rounded-xl font-bold bg-[#D4A017] text-white hover:bg-opacity-90 transition-colors shadow-md"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
