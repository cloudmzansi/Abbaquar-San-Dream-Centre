import { Heart, Users, ArrowRight } from 'lucide-react';

const VolunteerSection = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-[#073366] to-[#0a4a8a] text-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="text-[#D4A017] font-semibold mb-4 block tracking-wide uppercase text-sm">Get Involved</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">Want to Volunteer?</h2>
          <div className="mx-auto w-24 h-1 bg-[#D4A017] rounded mb-6" />
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Join our community of dedicated volunteers and make a real difference in the lives of youth and families in Wentworth. 
            Your time and skills can help us create lasting positive change.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="bg-[#D4A017] p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Make a Difference</h3>
            <p className="text-gray-200">
              Help us empower youth and support families through our various community programs and activities.
              Every hour you volunteer creates lasting positive change.
            </p>
          </div>

          <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="bg-[#D4A017] p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Join Our Community</h3>
            <p className="text-gray-200">
              Become part of our growing network of volunteers dedicated to community development and youth empowerment.
              Connect with like-minded individuals who share your passion.
            </p>
          </div>

          <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="bg-[#D4A017] p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Take Action</h3>
            <p className="text-gray-200">
              Whether you have a few hours or want to commit regularly, there's a place for you in our volunteer program.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={scrollToContact}
            className="inline-flex items-center gap-3 bg-[#D72660] hover:bg-[#b91c47] text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            aria-label="Contact us to volunteer"
          >
            <span>Contact Us to Volunteer</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="text-gray-300 mt-4 text-sm">
            We'll get back to you within 24 hours to discuss volunteer opportunities
          </p>
        </div>
      </div>
    </section>
  );
};

export default VolunteerSection;
