import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'organization' | 'localBusiness' | 'event' | 'faq';
  data: any;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  useEffect(() => {
    // Remove any existing structured data script
    const existingScript = document.querySelector('script[data-structured-data]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'true');
    script.textContent = JSON.stringify(data);
    
    // Add to head
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.querySelector('script[data-structured-data]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null;
};

// Organization Schema Component
export const OrganizationSchema: React.FC = () => {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "NonProfit",
    "name": "Abbaquar-San Dream Centre",
    "alternateName": "Abbaquar",
    "description": "A cultural organisation geared towards assisting, uplifting and rebuilding our community.",
    "url": "https://abbaquar.org",
    "logo": "https://abbaquar.org/assets/abbaquar-logo.webp",
    "image": "https://abbaquar.org/assets/hero.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "San Dream Centre",
      "addressLocality": "Wentworth, Durban",
      "addressRegion": "Western Cape",
      "addressCountry": "ZA"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+27-XX-XXX-XXXX",
      "contactType": "customer service",
      "availableLanguage": ["English", "Afrikaans", "Xhosa"]
    },
    "sameAs": [
      "https://facebook.com/abbaquar",
      "https://twitter.com/abbaquar",
      "https://instagram.com/abbaquar"
    ],
    "foundingDate": "2020",
    "areaServed": {
      "@type": "Place",
      "name": "Wentworth, Durban, KwaZulu-Natal, South Africa"
    },
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": -33.9249,
        "longitude": 18.4241
      },
      "geoRadius": "50000"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Community Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Youth Programs",
            "description": "Educational and recreational activities for youth"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Community Support",
            "description": "Assistance and support for community members"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Cultural Activities",
            "description": "Cultural events and activities"
          }
        }
      ]
    }
  };

  return <StructuredData type="organization" data={organizationData} />;
};

// Local Business Schema Component
export const LocalBusinessSchema: React.FC = () => {
  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Abbaquar-San Dream Centre",
    "description": "A cultural organisation geared towards assisting, uplifting and rebuilding our community.",
    "url": "https://abbaquar.org",
    "logo": "https://abbaquar.org/assets/abbaquar-logo.webp",
    "image": "https://abbaquar.org/assets/hero.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "San Dream Centre",
      "addressLocality": "Wentworth, Durban",
      "addressRegion": "Western Cape",
      "addressCountry": "ZA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -33.9249,
      "longitude": 18.4241
    },
    "telephone": "+27-XX-XXX-XXXX",
    "openingHours": "Mo-Su 09:00-17:00",
    "priceRange": "Free",
    "paymentAccepted": "Cash, Credit Card, EFT",
    "currenciesAccepted": "ZAR",
    "areaServed": {
      "@type": "Place",
      "name": "Wentworth, Durban, KwaZulu-Natal, South Africa"
    },
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": -33.9249,
        "longitude": 18.4241
      },
      "geoRadius": "50000"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Community Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Youth Programs",
            "description": "Educational and recreational activities for youth"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Community Support",
            "description": "Assistance and support for community members"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Cultural Activities",
            "description": "Cultural events and activities"
          }
        }
      ]
    }
  };

  return <StructuredData type="localBusiness" data={localBusinessData} />;
};

// Event Schema Component
export const EventSchema: React.FC<{ event: any }> = ({ event }) => {
  const eventData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.startDate,
    "endDate": event.endDate,
    "location": {
      "@type": "Place",
      "name": event.location || "Abbaquar-San Dream Centre",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "San Dream Centre",
        "addressLocality": "Wentworth, Durban",
        "addressRegion": "Western Cape",
        "addressCountry": "ZA"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": "Abbaquar-San Dream Centre",
      "url": "https://abbaquar.org"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "ZAR",
      "availability": "https://schema.org/InStock",
      "url": `https://abbaquar.org/events/${event.id}`
    },
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
  };

  return <StructuredData type="event" data={eventData} />;
};

// FAQ Schema Component
export const FAQSchema: React.FC<{ faqs: Array<{ question: string; answer: string }> }> = ({ faqs }) => {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return <StructuredData type="faq" data={faqData} />;
};
