import { Link } from 'react-router-dom';
import { useEffect, useState, memo } from 'react';

// Memoize the Hero component to prevent unnecessary re-renders
const Hero = memo(() => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Mark component as loaded after initial render
  useEffect(() => {
    setIsLoaded(true);
    
    // Report LCP (Largest Contentful Paint) to analytics
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log(`LCP: ${entry.startTime}ms`);
          }
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      return () => observer.disconnect();
    }
  }, []);
  return (
    <section className="bg-gradient-to-b from-[#083060] to-[#052548] text-gray-800 min-h-screen flex items-center pt-[88px]">
      <div className="container-custom flex-grow flex items-center py-16">
        <div className="flex flex-col md:flex-row items-center gap-12 w-full">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-white text-center md:text-left font-serif">
              Welcome to the Abbaquar-San Dream Centre
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-lg text-gray-200 text-center md:text-left">
              No matter what stage, age, or season you find yourself in, the Abbaquar-San Dream Centre is for you! 
              We invite you to come just as you are and be part of this community.
            </p>
            
            <div className="flex flex-row flex-wrap gap-4 justify-center md:justify-start">
              <a href="/#donate" 
                className="bg-[#D72660] text-white px-8 py-3.5 text-lg rounded-xl font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105"
              >
                Donate Now - Help Today
              </a>
              <Link 
                to="/activities" 
                className="bg-[#083060] text-white px-8 py-3.5 text-lg rounded-xl font-semibold hover:bg-opacity-90 transition-all border border-white/20 transform hover:scale-105"
              >
                Our Activities
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/assets/hero.jpg" 
                  alt="Abbaquar-San Dream Centre community event" 
                  width="600" 
                  height="400"
                  className="w-full h-full object-cover"
                  loading="eager" 
                  fetchpriority="high"
                  decoding="async"
                  onLoad={() => setIsLoaded(true)}
                  style={{
                    // Reserve space to prevent layout shift
                    aspectRatio: '600/400',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default Hero;
