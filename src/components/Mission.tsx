import { Heart, Users, Calendar, Book } from 'lucide-react';

const Mission = () => {
  return (
    <section id="mission" className="py-16 md:py-24 bg-gray-50">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#073366] font-serif">Our Mission</h2>
          <div className="mx-auto w-24 h-1 bg-[#D72660] rounded mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            We aim to create a safe haven for our youth, getting them off the streets; creating a place where we can help 
            our youth achieve their dreams; to uplift our youth and empower them with various skills development programs; 
            to introduce extramural activities back to the community and reintroduce family values into the community.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Safe Haven Card */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg text-center">
            <div className="bg-[#FDE68A]/20 p-4 rounded-2xl mb-4 md:mb-6 w-12 md:w-16 h-12 md:h-16 flex items-center justify-center mx-auto">
              <Heart className="h-6 md:h-8 w-6 md:w-8 text-[#D72660]" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-[#073366]">Safe Haven</h3>
            <p className="text-sm md:text-base text-gray-600">Creating a safe environment for the youth in our community.</p>
          </div>

          {/* Community Support Card */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg text-center">
            <div className="bg-[#C4B5FD]/20 p-4 rounded-2xl mb-4 md:mb-6 w-12 md:w-16 h-12 md:h-16 flex items-center justify-center mx-auto">
              <Users className="h-6 md:h-8 w-6 md:w-8 text-[#4E2D7A]" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-[#073366]">Community Support</h3>
            <p className="text-sm md:text-base text-gray-600">Supporting families and building stronger community bonds.</p>
          </div>

          {/* Extramural Activities Card */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg text-center">
            <div className="bg-[#FCA5A5]/20 p-4 rounded-2xl mb-4 md:mb-6 w-12 md:w-16 h-12 md:h-16 flex items-center justify-center mx-auto">
              <Calendar className="h-6 md:h-8 w-6 md:w-8 text-[#D72660]" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-[#073366]">Extramural Activities</h3>
            <p className="text-sm md:text-base text-gray-600">Reintroducing extramural activities for youth development.</p>
          </div>

          {/* Skills Development Card */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg text-center">
            <div className="bg-[#A7F3D0]/20 p-4 rounded-2xl mb-4 md:mb-6 w-12 md:w-16 h-12 md:h-16 flex items-center justify-center mx-auto">
              <Book className="h-6 md:h-8 w-6 md:w-8 text-[#1E5C2A]" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-[#073366]">Skills Development</h3>
            <p className="text-sm md:text-base text-gray-600">Empowering youth with skills and education for a better future.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
