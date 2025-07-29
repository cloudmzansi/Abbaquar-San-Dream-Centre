import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, Users, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getTeamMembers } from '@/lib/teamService';
import { TeamMember } from '@/types/supabase';

const AboutUs = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const members = await getTeamMembers();
        setTeamMembers(members);
      } catch (err: any) {
        console.error('Failed to load team members:', err);
        setError('Failed to load team members');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamMembers();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section aria-labelledby="hero-title" className="bg-[#073366] text-white py-24 pt-32">
          <div className="container-custom">
            <h1 id="hero-title" className="text-4xl md:text-5xl font-bold mb-6 text-center">About Us</h1>
            <p className="text-xl text-center max-w-3xl mx-auto">
              Empowering the Youth
            </p>
          </div>
        </section>

        {/* About Organization Section */}
        <section aria-labelledby="organization-title" className="py-16 md:py-24 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <span className="text-[#D72660] font-semibold mb-4 block">About Us</span>
              <h2 id="organization-title" className="text-4xl md:text-5xl font-bold mb-6 text-[#073366] font-serif">Empowering the Youth</h2>
              <div className="mx-auto w-24 h-1 bg-[#D72660] rounded mb-6" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="rounded-2xl overflow-hidden shadow-xl order-1 lg:order-1">
                <img 
                  src="/assets/empowering-the-youth.jpg"
                  alt="Empowering the Youth" 
                  className="w-full h-96 object-cover"
                  width="600"
                  height="400"
                />
              </div>
              <div className="order-2 lg:order-2">
                <p className="text-gray-600 mb-6 text-lg">
                  We are a cultural organisation geared towards assisting, uplifting and rebuilding our community. 
                  As an organisation our efforts lie predominately with the youth as well as the elderly 
                  within our community. We offer various activities for the youth, namely Ballet, Karate, 
                  Dance Music lessons and a Youth program.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Royal House Section */}
        <section aria-labelledby="royal-house-title" className="py-16 md:py-24 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <span className="text-[#D72660] font-semibold mb-4 block">Abbaquar-San Royal House</span>
              <h2 id="royal-house-title" className="text-4xl md:text-5xl font-bold mb-6 text-[#073366] font-serif">Who We Work With</h2>
              <div className="mx-auto w-24 h-1 bg-[#D72660] rounded mb-6" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-gray-600 mb-6 text-lg">
                  The Abbaquar-San Royal House is now official and recognised in Parliament. 
                  This comes after President Cyril Ramaphosa announced in March that the Traditional 
                  and Khoisan Leadership Act would come into effect from 1 April 2021.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="/assets/who-we-work-with.jpg"
                  alt="Abbaquar-San Royal House" 
                  className="w-full h-96 object-cover"
                  width="600"
                  height="400"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Team Section */}
        <section aria-labelledby="our-team-title" className="py-16 md:py-24 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <span className="text-[#D72660] font-semibold mb-4 block">Meet Our People</span>
              <h2 id="our-team-title" className="text-4xl md:text-5xl font-bold mb-6 text-[#073366] font-serif">Our Team</h2>
              <div className="mx-auto w-24 h-1 bg-[#D72660] rounded mb-6" />
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Dedicated individuals working together to make a difference in our community.
              </p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#073366]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-6 rounded-lg text-center text-red-600 mb-8">
                <p>{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {teamMembers.map((member, index) => (
                  <div key={member.id} className="bg-white rounded-2xl overflow-hidden shadow-lg text-center">
                    <div className="aspect-square overflow-hidden">
                      {member.image_path ? (
                        <img 
                          src={member.image_path} 
                          alt={`${member.name} - ${member.role}`}
                          className="w-full object-cover object-top"
                          width="208"
                          height="208"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Users className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="font-bold text-[#073366] text-sm md:text-base">{member.name}</h3>
                      <p className="text-gray-600 text-xs md:text-sm mt-1">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Next Steps Section */}
        <section aria-labelledby="next-steps-title" className="py-16 md:py-24 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center mb-10 md:mb-16">
              <span className="text-[#D72660] font-semibold mb-4 block">Your Journey</span>
              <h2 id="next-steps-title" className="text-4xl md:text-5xl font-bold mb-6 text-[#073366] font-serif">Next Steps</h2>
              <div className="mx-auto w-24 h-1 bg-[#D72660] rounded mb-6" />
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Want to know what to do next? Follow these steps below or contact us and we will get back to you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Learn More Card */}
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg text-center">
                <div className="bg-[#FDE68A]/20 p-4 rounded-2xl mb-4 md:mb-6 w-12 md:w-16 h-12 md:h-16 flex items-center justify-center mx-auto">
                  <BookOpen className="h-6 md:h-8 w-6 md:w-8 text-[#D72660]" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-[#073366]">Learn More</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Check what we about and who we are partnered with to familiarize what Abbaquar stands for.
                </p>
              </div>

              {/* Get Involved Card */}
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg text-center">
                <div className="bg-[#C4B5FD]/20 p-4 rounded-2xl mb-4 md:mb-6 w-12 md:w-16 h-12 md:h-16 flex items-center justify-center mx-auto">
                  <Users className="h-6 md:h-8 w-6 md:w-8 text-[#4E2D7A]" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-[#073366]">Get Involved</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Have a look at our different activities we offer at Abbaquar-San Dream Centre or make a donation.
                </p>
              </div>

              {/* Have Questions Card */}
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg text-center">
                <div className="bg-[#FCA5A5]/20 p-4 rounded-2xl mb-4 md:mb-6 w-12 md:w-16 h-12 md:h-16 flex items-center justify-center mx-auto">
                  <Heart className="h-6 md:h-8 w-6 md:w-8 text-[#D72660]" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-[#073366]">Have Questions?</h3>
                <p className="text-sm md:text-base text-gray-600">
                  We are more than happy to answer any questions you have for us.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
