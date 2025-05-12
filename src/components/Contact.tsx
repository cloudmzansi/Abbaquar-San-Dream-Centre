import { Phone, MapPin, Mail } from 'lucide-react';
import { useState } from 'react';
import HomeContactForm from './HomeContactForm';

const Contact = () => {

  return (
    <section className="py-24 bg-gray-100">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="text-[#D72660] font-semibold mb-4 block tracking-wide uppercase text-sm">Get In Touch</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 font-serif">Contact Us</h2>
          <div className="mx-auto w-24 h-1 bg-[#D72660] rounded mb-6" />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Have questions or want to get involved? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:grid-rows-1">
          <div className="lg:col-span-2 lg:h-full">
            <div className="bg-[#083060]/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl h-full">
              <div className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[#F5F5F0]">Send us a message</h2>
                <HomeContactForm showContainer={false} />
              </div>
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
                    <p className="text-gray-200 text-sm leading-relaxed">61 Gardenia Road, Wentworth, Durban, 4052</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg flex-shrink-0">
                    <Phone className="h-6 w-6 text-[#D4A017]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-base mb-1">Phone</h4>
                    <p className="text-gray-200 text-sm">084 251 5740</p>
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
  );
};

export default Contact;
