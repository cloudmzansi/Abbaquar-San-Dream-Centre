import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FAQSchema } from './StructuredData';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title?: string;
  description?: string;
  faqs: FAQItem[];
  className?: string;
}

export const FAQ: React.FC<FAQProps> = ({ 
  title = "Frequently Asked Questions", 
  description = "Find answers to common questions about Abbaquar-San Dream Centre",
  faqs,
  className = ""
}) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#073366] mb-4 font-serif">
              {title}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#073366] focus:ring-inset"
                  aria-expanded={openItems.has(index)}
                  aria-controls={`faq-answer-${index}`}
                >
                  <h3 className="text-lg font-semibold text-[#073366] pr-4">
                    {faq.question}
                  </h3>
                  {openItems.has(index) ? (
                    <ChevronUp className="h-5 w-5 text-[#073366] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#073366] flex-shrink-0" />
                  )}
                </button>
                
                <div
                  id={`faq-answer-${index}`}
                  className={`px-6 transition-all duration-300 ease-in-out ${
                    openItems.has(index) 
                      ? 'max-h-96 opacity-100 pb-4' 
                      : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Data for FAQ */}
      <FAQSchema faqs={faqs} />
    </section>
  );
};

// Predefined FAQ data for the organization
export const organizationFAQs: FAQItem[] = [
  {
    question: "What is Abbaquar-San Dream Centre?",
    answer: "Abbaquar-San Dream Centre is a cultural organisation dedicated to assisting, uplifting and rebuilding our community. We focus on empowering the youth and supporting the elderly through various programs and activities including ballet, karate, dance, music lessons, and youth programs."
  },
  {
    question: "Where is Abbaquar-San Dream Centre located?",
    answer: "We are located in Wentworth, Durban, KwaZulu-Natal, South Africa. Our centre serves the local community and surrounding areas with our cultural and youth development programs."
  },
  {
    question: "What activities and programs do you offer?",
    answer: "We offer a variety of activities including ballet classes, karate training, dance lessons, music education, and comprehensive youth programs. All activities are designed to empower and develop our community members."
  },
  {
    question: "How can I get involved with Abbaquar-San Dream Centre?",
    answer: "You can get involved by attending our events, participating in our programs, volunteering your time, or making a donation to support our community initiatives. Contact us to learn more about specific opportunities."
  },
  {
    question: "Are your programs free to attend?",
    answer: "Many of our programs are offered free of charge to make them accessible to all community members. Some specialized programs may have nominal fees. Please contact us for specific program details and pricing."
  },
  {
    question: "How can I donate to support your work?",
    answer: "You can donate through our secure online donation system, or contact us directly for other donation options. All donations go directly towards supporting our community programs and initiatives."
  },
  {
    question: "What age groups do you serve?",
    answer: "We serve community members of all ages, with a particular focus on youth development and elderly support. Our programs are designed to be inclusive and accessible to everyone in our community."
  },
  {
    question: "How can I stay updated on your events and activities?",
    answer: "You can stay updated by visiting our website regularly, following us on social media, or contacting us to join our mailing list. We regularly post updates about upcoming events and activities."
  }
];
