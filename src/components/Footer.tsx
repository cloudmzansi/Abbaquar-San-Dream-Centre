import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';

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
              We are a cultural organisation geared towards assisting, uplifting and rebuilding our community.
            </p>
            <address className="flex flex-col space-y-4 not-italic">
              <div className="flex items-center">
                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg mr-3">
                  <MapPin className="h-6 w-6 text-[#D72660]" aria-hidden="true" />
                </div>
                <span className="text-gray-300 text-sm">61 Gardenia Road, Wentworth,<br />Durban, 4052</span>
              </div>
              <div className="flex items-center">
                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg mr-3">
                  <Phone className="h-6 w-6 text-[#D72660]" aria-hidden="true" />
                </div>
                <a 
                  href="tel:+27842515740" 
                  className="text-gray-300 text-sm hover:text-white transition-colors"
                  aria-label="Call us at 084 251 5740"
                >
                  084 251 5740
                </a>
              </div>
              <div className="flex items-center">
                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg mr-3">
                  <Mail className="h-6 w-6 text-[#D72660]" aria-hidden="true" />
                </div>
                <a 
                  href="mailto:olivia@abbaquar-sandreamcentre.co.za"
                  className="text-gray-300 text-sm break-all hover:text-white transition-colors"
                  aria-label="Email us at olivia@abbaquar-sandreamcentre.co.za"
                >
                  olivia@abbaquar-sandreamcentre.co.za
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
                href="https://www.facebook.com/abbaquar.san68/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-10 w-10 rounded-full bg-[#D72660] flex items-center justify-center hover:bg-opacity-80 transition-colors"
                aria-label="Visit our Facebook page"
              >
                <Facebook className="h-5 w-5" aria-hidden="true" />
              </a>
              <a 
                href="https://wa.me/27842515740" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-10 w-10 rounded-full bg-[#D72660] flex items-center justify-center hover:bg-opacity-80 transition-colors"
                aria-label="Contact us on WhatsApp"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  className="h-5 w-5" 
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" clipRule="evenodd" d="M19.3929 4.6071C18.3832 3.59497 17.1844 2.79047 15.8663 2.23268C14.5481 1.67489 13.1336 1.37463 11.7043 1.35C6.19429 1.35 1.71429 5.82429 1.71429 11.3343C1.71429 13.0114 2.16429 14.6343 2.99429 16.0629L1.65 22.5257L8.25 21.2057C9.63 21.9771 11.1557 22.3843 12.7157 22.3843H12.72C18.2271 22.3843 22.5 17.91 22.5 12.3986C22.5 9.54 21.5357 6.83143 19.3929 4.6071ZM11.7043 20.6271H11.7014C10.3071 20.6271 8.93571 20.2371 7.74429 19.5086L7.45714 19.3329L3.76714 20.1214L4.56857 16.5214L4.37143 16.2214C3.56713 14.9831 3.13618 13.5518 3.12857 12.0857C3.12857 6.79286 6.9 2.45 11.7157 2.45C14.0071 2.45 16.1657 3.32857 17.7927 4.96143C18.5921 5.7548 19.2242 6.68428 19.6541 7.70253C20.084 8.72077 20.3035 9.80946 20.3 10.9071C20.2929 16.6029 16.1271 20.6271 11.7043 20.6271ZM16.2557 13.4886C15.9786 13.35 14.6943 12.7186 14.4429 12.6243C14.1914 12.53 14.0071 12.4814 13.8229 12.7586C13.6386 13.0357 13.1414 13.6214 12.9814 13.8057C12.8214 13.99 12.6614 14.0157 12.3843 13.8771C11.2265 13.3948 10.2071 12.6726 9.4 11.7614C9.14876 11.4339 9.50175 11.4663 9.82741 10.8149C9.89571 10.6306 9.84714 10.47 9.77714 10.3314C9.70714 10.1929 9.32143 8.90714 9.08857 8.35286C8.85857 7.82143 8.62429 7.89 8.45714 7.88143C8.31427 7.87408 8.17099 7.87094 8.02786 7.872C7.89256 7.8774 7.76077 7.91313 7.6415 7.97658C7.52222 8.04004 7.41867 8.12988 7.33714 8.24C7.08571 8.51857 6.40286 9.15 6.40286 10.4343C6.40286 11.7186 7.36714 12.9557 7.48429 13.14C7.60143 13.3243 9.06143 15.5929 11.3243 16.73C13.0371 17.6043 13.6757 17.6486 14.4786 17.5114C14.9614 17.4229 16.0043 16.86 16.2371 16.21C16.47 15.56 16.47 15.0057 16.3971 14.88C16.3243 14.7543 16.1486 14.68 15.8843 14.5414L16.2557 13.4886Z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/abbaquarsandreamcentre/" 
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
            <small>
              Copyright © {new Date().getFullYear()} Abbaquar - San Dream Centre. All Rights Reserved.
            </small>
            <br />
            <small>
              Made with <span role="img" aria-label="green heart" style={{color: '#27ae60', fontSize: '1em', verticalAlign: 'middle'}}>&#128154;</span> by <a href="https://mofi.co.za" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Cloud Mzansi</a>.
            </small>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
