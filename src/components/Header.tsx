import { useState, useEffect, useCallback, memo } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useScrollTop } from '../hooks/use-scroll-top';

const Header = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Use our optimized hook for scroll functionality
  const { scrollToTop, navigateTo } = useScrollTop();
  
  // Handle navigation with proper scrolling
  const handleNavigation = useCallback((path: string) => {
    // Only navigate if we're not already on this path
    if (location.pathname !== path) {
      navigateTo(path);
    } else {
      // If we're already on this page, just scroll to top
      scrollToTop();
    }
  }, [location.pathname, navigateTo, scrollToTop]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : 'auto';
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    document.body.style.overflow = 'auto';
  }, [location]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Optimized scroll handler with useCallback to prevent recreating on every render
  const handleScroll = useCallback(() => {
    let ticking = false;
    return () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setIsScrolled(currentScrollY > 20);
          if (currentScrollY < 50) {
            setShowHeader(true);
          } else if (currentScrollY > lastScrollY) {
            setShowHeader(false);
            if (mobileMenuOpen) {
              setMobileMenuOpen(false);
              document.body.style.overflow = 'auto';
            }
          } else {
            setShowHeader(true);
          }
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
  }, [lastScrollY, mobileMenuOpen]);
  
  // Add scroll event listener with the optimized handler
  useEffect(() => {
    const scrollHandler = handleScroll();
    window.addEventListener('scroll', scrollHandler, { passive: true });
    return () => {
      window.removeEventListener('scroll', scrollHandler);
    };
  }, [handleScroll]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 bg-[#083060] transition-transform duration-300 ${
          showHeader ? 'translate-y-0' : '-translate-y-full'
        } border-b border-white/40 z-50`}
        role="banner"
      >
        <div className="container-custom py-3">
          <nav className="flex justify-between items-center relative" aria-label="Main navigation">
            <div className="flex items-center">
              {/* Logo - special handling when on home page */}
              <Link 
                to="/" 
                className="flex items-center" 
                onClick={() => handleNavigation('/')}
                aria-label="Go to homepage"
              >
                <img 
                  src="/assets/abbaquar-logo.webp" 
                  alt="Abbaquar Logo" 
                  className="h-14 md:h-16 mr-3 rounded-2xl" 
                  width="64" 
                  height="64" 
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center space-x-1" role="menubar">
                {/* Home link - always use button for consistent behavior */}
                <Link 
                  to="/" 
                  className="px-4 py-2 text-white/90 hover:text-white transition-all rounded-xl hover:bg-white/10"
                  role="menuitem"
                  onClick={() => handleNavigation('/')}
                  aria-current={location.pathname === '/' ? 'page' : undefined}
                >
                  Home
                </Link>
                <Link 
                  to="/about-us" 
                  className="px-4 py-2 text-white/90 hover:text-white transition-all rounded-xl hover:bg-white/10"
                  role="menuitem"
                  onClick={() => handleNavigation('/about-us')}
                  aria-current={location.pathname === '/about-us' ? 'page' : undefined}
                >
                  About Us
                </Link>
                <Link 
                  to="/activities" 
                  className="px-4 py-2 text-white/90 hover:text-white transition-all rounded-xl hover:bg-white/10"
                  role="menuitem"
                  onClick={() => handleNavigation('/activities')}
                  aria-current={location.pathname === '/activities' ? 'page' : undefined}
                >
                  Activities
                </Link>
                <Link 
                  to="/events" 
                  className="px-4 py-2 text-white/90 hover:text-white transition-all rounded-xl hover:bg-white/10"
                  role="menuitem"
                  onClick={() => handleNavigation('/events')}
                  aria-current={location.pathname === '/events' ? 'page' : undefined}
                >
                  Events
                </Link>
                <Link 
                  to="/gallery" 
                  className="px-4 py-2 text-white/90 hover:text-white transition-all rounded-xl hover:bg-white/10"
                  role="menuitem"
                  onClick={() => handleNavigation('/gallery')}
                  aria-current={location.pathname === '/gallery' ? 'page' : undefined}
                >
                  Gallery
                </Link>
                <Link 
                  to="/contact" 
                  className="px-4 py-2 text-white/90 hover:text-white transition-all rounded-xl hover:bg-white/10"
                  role="menuitem"
                  onClick={() => handleNavigation('/contact')}
                  aria-current={location.pathname === '/contact' ? 'page' : undefined}
                >
                  Contact
                </Link>
              </div>
              <div className="flex items-center ml-24">
                <a 
                  href="/#donate" 
                  className="px-6 py-2.5 rounded-xl font-semibold bg-[#D72660] text-white hover:bg-opacity-90 transition-all"
                  role="button"
                >
                  Donate
                </a>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden rounded-full p-2 hover:bg-white/10 transition-all relative z-50"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6 text-white" aria-hidden="true" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } z-40`}
        onClick={toggleMobileMenu}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <div 
        id="mobile-menu"
        className={`fixed inset-x-0 top-0 bg-[#083060] transition-transform duration-300 ease-in-out transform md:hidden pt-20 ${
          mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        } z-40`}
        role="dialog"
        aria-label="Mobile menu"
        aria-modal="true"
        aria-hidden={!mobileMenuOpen}
      >
        <nav 
          className="container-custom py-6 flex flex-col space-y-4"
          aria-label="Mobile navigation"
        >
          {/* Home link in mobile menu - always use button for consistent behavior */}
          <Link 
            to="/" 
            className="px-4 py-3 text-white/90 hover:text-white transition-all rounded-xl hover:bg-white/10 text-lg"
            onClick={() => {
              toggleMobileMenu();
              handleNavigation('/');
            }}
            aria-current={location.pathname === '/' ? 'page' : undefined}
          >
            Home
          </Link>
          <Link 
            to="/about-us" 
            className="px-4 py-3 text-white/90 hover:text-white transition-all rounded-xl hover:bg-white/10 text-lg"
            onClick={() => {
              toggleMobileMenu();
              handleNavigation('/about-us');
            }}
            aria-current={location.pathname === '/about-us' ? 'page' : undefined}
          >
            About Us
          </Link>
          <Link 
            to="/activities" 
            className="px-4 py-3 text-white/90 hover:text-white transition-all rounded-xl hover:bg-white/10 text-lg"
            onClick={() => {
              toggleMobileMenu();
              handleNavigation('/activities');
            }}
            aria-current={location.pathname === '/activities' ? 'page' : undefined}
          >
            Activities
          </Link>
          <Link 
            to="/events" 
            className="px-4 py-3 text-white/90 hover:text-white transition-all rounded-xl hover:bg-white/10 text-lg"
            onClick={() => {
              toggleMobileMenu();
              handleNavigation('/events');
            }}
            aria-current={location.pathname === '/events' ? 'page' : undefined}
          >
            Events
          </Link>
          <Link 
            to="/gallery" 
            className="px-4 py-3 text-white/90 hover:text-white transition-all rounded-xl hover:bg-white/10 text-lg"
            onClick={() => {
              toggleMobileMenu();
              handleNavigation('/gallery');
            }}
            aria-current={location.pathname === '/gallery' ? 'page' : undefined}
          >
            Gallery
          </Link>
          <Link 
            to="/contact" 
            className="px-4 py-3 text-white/90 hover:text-white transition-all rounded-xl hover:bg-white/10 text-lg"
            onClick={() => {
              toggleMobileMenu();
              handleNavigation('/contact');
            }}
            aria-current={location.pathname === '/contact' ? 'page' : undefined}
          >
            Contact
          </Link>
          <div className="flex gap-4 mt-4">
            <Link 
              to="/contact" 
              className="flex-1 px-4 py-3 text-white/90 hover:text-white transition-all rounded-xl border border-white/20 text-center text-lg"
              onClick={toggleMobileMenu}
              aria-current={location.pathname === '/contact' ? 'page' : undefined}
            >
              Contact
            </Link>
            <a 
              href="/#donate" 
              className="flex-1 px-4 py-3 rounded-xl font-semibold bg-[#D72660] text-white hover:bg-opacity-90 transition-all text-center text-lg"
              onClick={toggleMobileMenu}
              role="button"
            >
              Donate
            </a>
          </div>
        </nav>
      </div>
    </>
  );
});

export default Header;
