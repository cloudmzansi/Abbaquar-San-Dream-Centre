import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Phone, MapPin, Mail } from 'lucide-react';
import MapboxMap from '@/components/MapboxMap';
import HomeContactForm from '@/components/HomeContactForm';

const Contact = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section aria-labelledby="contact-hero-title" className="bg-[#073366] py-24 pt-32" role="banner">
          <div className="container-custom">
            <h1 id="contact-hero-title" className="text-[#F5F5F0] text-4xl md:text-5xl font-bold mb-6 text-center">Contact Us</h1>
            <p className="text-[#E0E9FF] text-xl text-center max-w-3xl mx-auto">
              No matter what stage, age, or season you find yourself in, Abbaquar-San Dream Centre is for you! 
              We invite you to come just as you are and be part of this community of people who are striving 
              towards improving lives!
            </p>
          </div>
        </section>

        {/* Contact Form and Information Section */}
        <section aria-labelledby="contact-info-title" className="py-16 bg-gray-100">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:grid-rows-1">
              <div className="lg:col-span-2 lg:h-full">
                <div className="bg-[#083060]/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl h-full p-6 sm:p-8">
                  <h2 id="contact-info-title" className="text-xl sm:text-2xl font-bold mb-6 text-[#F5F5F0]">Send us a message</h2>
                  <HomeContactForm showContainer={false} />
                </div>
              </div>
              
              <div className="flex flex-col lg:h-full space-y-6">
                <div className="bg-[#083060]/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-white/20 shadow-lg transform transition-all duration-300 hover:shadow-xl flex-1">
                  <h3 className="text-lg font-semibold mb-4 text-white">Contact Information</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-white/10 p-3 rounded-lg flex-shrink-0">
                        <MapPin className="h-6 w-6 text-[#D4A017]" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-base mb-1">Address</h4>
                        <p className="text-gray-200 text-sm leading-relaxed">
                          61 Gardenia Road,<br />
                          Merewent, Durban,<br />
                          4052,<br />
                          KwaZulu-Natal,<br />
                          South Africa
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-white/10 p-3 rounded-lg flex-shrink-0">
                        <Phone className="h-6 w-6 text-[#D4A017]" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-base mb-1">Phone</h4>
                        <p className="text-gray-200 text-sm">084 251 5740</p>
                        <p className="text-gray-200 text-sm">072 267 2587</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-white/10 p-3 rounded-lg flex-shrink-0">
                        <Mail className="h-6 w-6 text-[#D4A017]" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-base mb-1">Email</h4>
                        <p className="text-gray-200 text-sm break-all">olivia@abbaquar-sandreamcentre.co.za</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#083060]/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-white/20 shadow-lg transform transition-all duration-300 hover:shadow-xl flex-1">
                  <h3 className="text-lg font-semibold mb-4 text-white">Operational Times</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-200 text-sm">
                      <span className="font-medium">Monday - Thursday</span>
                      <span>9am - 4pm</span>
                    </div>
                    <div className="flex justify-between text-gray-200 text-sm">
                      <span className="font-medium">Friday</span>
                      <span>10am - 2pm</span>
                    </div>
                    <div className="flex justify-between text-gray-200 text-sm">
                      <span className="font-medium">Saturday - Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Map Section */}
        <section aria-labelledby="find-us-title" className="py-12 bg-white">
          <div className="container-custom">
            <h2 id="find-us-title" className="text-3xl font-bold mb-8 text-center text-[#073366]">Find Us</h2>
            <div className="h-[400px] rounded-xl overflow-hidden shadow-lg">
              <MapboxMap />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
