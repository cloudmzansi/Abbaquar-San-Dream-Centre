import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#083060] text-white pt-16 pb-8" role="contentinfo">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/assets/abbaquar-logo.webp" 
                alt="Abbaquar Logo" 
                className="h-10 w-10 rounded-lg"
                width="40"
                height="40"
              />
              <span className="text-xl font-bold">Abbaquar - San Dream Centre</span>
            </div>
            <p className="mb-6 text-gray-300 text-sm leading-relaxed">
              We are a cultural organization geared towards assisting, uplifting and rebuilding our community.
            </p>
            <address className="flex flex-col space-y-4 not-italic">
              <div className="flex items-start">
                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg mr-3">
                  <MapPin className="h-5 w-5 text-[#D72660]" aria-hidden="true" />
                </div>
                <span className="text-gray-300 text-sm">61 Gardenia Road, Wentworth,<br />Durban, 4052</span>
              </div>
              <div className="flex items-start">
                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg mr-3">
                  <Phone className="h-5 w-5 text-[#D72660]" aria-hidden="true" />
                </div>
                <a 
                  href="tel:+27842515740" 
                  className="text-gray-300 text-sm hover:text-white transition-colors"
                  aria-label="Call us at 084 251 5740"
                >
                  084 251 5740
                </a>
              </div>
              <div className="flex items-start">
                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg mr-3">
                  <Mail className="h-5 w-5 text-[#D72660]" aria-hidden="true" />
                </div>
                <a 
                  href="mailto:info@abbaquar-sandreamcentre.co.za"
                  className="text-gray-300 text-sm break-all hover:text-white transition-colors"
                  aria-label="Email us at info@abbaquar-sandreamcentre.co.za"
                >
                  info@abbaquar-sandreamcentre.co.za
                </a>
              </div>
            </address>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3" role="list">
              <li>
                <Link 
                  to="/about-us" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                  aria-label="Learn about our mission"
                >
                  Our Mission
                </Link>
              </li>
              <li>
                <Link 
                  to="/activities" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                  aria-label="View our activities"
                >
                  Activities
                </Link>
              </li>
              <li>
                <Link 
                  to="/gallery" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                  aria-label="Browse our gallery"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                  aria-label="Get in touch with us"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>

          {/* Operational Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Operational Hours</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="sr-only">Monday to Thursday</dt>
                <dd className="text-gray-300">Mon - Thu: 9am - 4pm</dd>
              </div>
              <div>
                <dt className="sr-only">Friday</dt>
                <dd className="text-gray-300">Friday: 10am - 2pm</dd>
              </div>
              <div>
                <dt className="sr-only">Weekend</dt>
                <dd className="text-gray-300">Sat & Sun: Closed</dd>
              </div>
            </dl>
          </div>

          {/* Stay Connected */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Stay Connected</h3>
            <p className="mb-4 text-gray-300">
              Join our community to receive updates about our activities and events.
            </p>
            <div className="flex space-x-4" role="list" aria-label="Social media links">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-10 w-10 rounded-full bg-[#D72660] flex items-center justify-center hover:bg-opacity-80 transition-colors"
                aria-label="Visit our Facebook page"
              >
                <Facebook className="h-5 w-5" aria-hidden="true" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-10 w-10 rounded-full bg-[#D72660] flex items-center justify-center hover:bg-opacity-80 transition-colors"
                aria-label="Visit our Twitter page"
              >
                <Twitter className="h-5 w-5" aria-hidden="true" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-10 w-10 rounded-full bg-[#D72660] flex items-center justify-center hover:bg-opacity-80 transition-colors"
                aria-label="Visit our Instagram page"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6">
          <p className="text-center text-gray-300">
            <small>Copyright © {new Date().getFullYear()} Abbaquar - San Dream Centre. All Rights Reserved.</small>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
