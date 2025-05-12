import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, Users, BookOpen } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

const teamMembers: TeamMember[] = [
  { name: "Brylan Kock", role: "Paramount Chief", image: "/assets/brylan-kock.webp" },
  { name: "Chief Mervyn Damas", role: "District Chief", image: "/assets/chief-mervyn-damas.webp" },
  { name: "Chieftess Olivia Jones", role: "Chairperson", image: "/assets/chieftess-olivia-jones.webp" },
  { name: "Genevieve Coughlan", role: "Treasurer", image: "/assets/genevieve-coughlan.webp" },
  { name: "Headwoman Nolene Ogle", role: "Deputy Chairperson", image: "/assets/headwoman-nolene-ogle.webp" },
  { name: "Jason Abrahams", role: "Senior Chief", image: "/assets/jason-abrahams.webp" },
  { name: "Karen Smarts", role: "Secretary", image: "/assets/karen-smarts.webp" },
  { name: "Kevin Louw", role: "District Chief", image: "/assets/kevin-louw.webp" },
  { name: "Michell Houston", role: "Personal Assistant to District Chiefs", image: "/assets/michell-houston.webp" },
  { name: "Stanley Smith", role: "Marketing Manager", image: "/assets/stanley-smith.webp" }
];

const AboutUs = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section aria-labelledby="hero-title" className="bg-[#073366] text-white py-20 mt-[88px]">
          <div className="container-custom">
            <h1 id="hero-title" className="text-4xl md:text-5xl font-bold mb-6 text-center">About Us</h1>
            <p className="text-xl text-center max-w-3xl mx-auto">
              Empowering the Youth
            </p>
          </div>
        </section>

        {/* About Organization Section */}
        <section aria-labelledby="organization-title" className="py-16 md:py-24">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <span className="text-[#D72660] font-semibold mb-4 block">Who We Are</span>
              <h2 id="organization-title" className="text-4xl md:text-5xl font-bold mb-6 text-[#073366] font-serif">Our Organization</h2>
              <div className="mx-auto w-24 h-1 bg-[#D72660] rounded mb-6" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="rounded-2xl overflow-hidden shadow-xl order-1 lg:order-1">
                <img 
                  src="/placeholder.svg"
                  alt="The Royal House" 
                  className="w-full h-96 object-cover"
                  width="600"
                  height="400"
                />
              </div>
              <div className="order-2 lg:order-2">
                <p className="text-gray-600 mb-6 text-lg">
                  We are a cultural organization geared towards assisting, uplifting and rebuilding our community. 
                  As an organization our efforts lie predominately with the youth as well as the elderly 
                  within our community. We offer various activities for the youth, namely Ballet, Karate, 
                  Dance Music lessons and a Youth program.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Royal House Section */}
        <section aria-labelledby="royal-house-title" className="py-16 md:py-24">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <span className="text-[#D72660] font-semibold mb-4 block">Our Heritage</span>
              <h2 id="royal-house-title" className="text-4xl md:text-5xl font-bold mb-6 text-[#073366] font-serif">The Royal House</h2>
              <div className="mx-auto w-24 h-1 bg-[#D72660] rounded mb-6" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-gray-600 mb-6 text-lg">
                  The Abbaquar-San Royal house is now official and recognised in Parliament. 
                  This comes after President Cyril Ramaphosa announced in March that the Traditional 
                  and Khoisan Leadership Act would come into effect from 1 April 2021.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="/placeholder.svg"
                  alt="Royal House" 
                  className="w-full h-96 object-cover"
                  width="600"
                  height="400"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Team Section */}
        <section aria-labelledby="our-team-title" className="py-16 md:py-24 bg-abbaquar-light">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <span className="text-[#D72660] font-semibold mb-4 block">Meet Our People</span>
              <h2 id="our-team-title" className="text-4xl md:text-5xl font-bold mb-6 text-[#073366] font-serif">Our Team</h2>
              <div className="mx-auto w-24 h-1 bg-[#D72660] rounded mb-6" />
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Dedicated individuals working together to make a difference in our community.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg text-center">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={`${member.name} - ${member.role}`}
                      className="w-full h-52 object-cover object-top"
                      width="208"
                      height="208"
                      style={member.name === 'Brylan Kock' ? { objectPosition: 'top' } : {}}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="font-bold text-[#073366] text-base md:text-lg">{member.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Next Steps Section */}
        <section aria-labelledby="next-steps-title" className="py-16 md:py-24 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <span className="text-[#D72660] font-semibold mb-4 block">Your Journey</span>
              <h2 id="next-steps-title" className="text-4xl md:text-5xl font-bold mb-6 text-[#073366] font-serif">Next Steps</h2>
              <div className="mx-auto w-24 h-1 bg-[#D72660] rounded mb-6" />
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Want to know what to do next? Follow these steps below or contact us and we will get back to you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
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
