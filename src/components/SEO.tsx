import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { OrganizationSchema, LocalBusinessSchema, EventSchema, FAQSchema } from './StructuredData';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'event';
  structuredData?: {
    type: 'organization' | 'localBusiness' | 'event' | 'faq';
    data?: any;
  };
  noindex?: boolean;
  nofollow?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Abbaquar-San Dream Centre - Community Development & Youth Programs | Wentworth, Durban',
  description = 'Abbaquar-San Dream Centre is a cultural organisation in Wentworth, Durban dedicated to assisting, uplifting and rebuilding our community through youth programs, cultural activities, and community support services.',
  keywords = 'community development, youth programs, Wentworth Durban, cultural activities, community support, nonprofit organization, South Africa, KwaZulu-Natal',
  canonical,
  ogImage = 'https://abbaquar.org/assets/hero.jpg',
  ogType = 'website',
  structuredData,
  noindex = false,
  nofollow = false
}) => {
  const baseUrl = 'https://abbaquar.org';
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl;

  // Generate robots meta content
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
    'max-image-preview:large',
    'max-snippet:-1',
    'max-video-preview:-1'
  ].join(', ');

  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content={robotsContent} />
        <link rel="canonical" href={fullCanonical} />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={fullCanonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Abbaquar-San Dream Centre" />
        <meta property="og:locale" content="en_ZA" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:site" content="@abbaquar" />
        <meta name="twitter:creator" content="@abbaquar" />

        {/* Additional Meta Tags */}
        <meta name="author" content="Abbaquar-San Dream Centre" />
        <meta name="geo.region" content="ZA-WC" />
        <meta name="geo.placename" content="Wentworth, Durban" />
        <meta name="geo.position" content="-33.9249;18.4241" />
        <meta name="ICBM" content="-33.9249, 18.4241" />
      </Helmet>

      {/* Structured Data */}
      {structuredData?.type === 'organization' && <OrganizationSchema />}
      {structuredData?.type === 'localBusiness' && <LocalBusinessSchema />}
      {structuredData?.type === 'event' && structuredData.data && (
        <EventSchema event={structuredData.data} />
      )}
      {structuredData?.type === 'faq' && structuredData.data && (
        <FAQSchema faqs={structuredData.data} />
      )}
    </>
  );
};

// Predefined SEO configurations for different pages
export const SEOConfigs = {
  home: {
    title: 'Abbaquar-San Dream Centre - Community Development & Youth Programs | Wentworth, Durban',
    description: 'Join Abbaquar-San Dream Centre in Wentworth, Durban. Support our mission to uplift youth and families through community programs, cultural activities, and volunteer opportunities. Make a difference today.',
    keywords: 'community development, youth programs, Wentworth Durban, cultural activities, community support, nonprofit organization, South Africa, KwaZulu-Natal, volunteer opportunities, community volunteering, youth empowerment, Durban community center, donate to community, family support programs',
    structuredData: { type: 'organization' as const }
  },
  about: {
    title: 'About Us - Abbaquar-San Dream Centre | Community Development in Wentworth, Durban',
    description: 'Learn about Abbaquar-San Dream Centre\'s mission to assist, uplift and rebuild our community through cultural activities and youth development programs in Wentworth, Durban.',
    keywords: 'about us, community development, Wentworth Durban, nonprofit, youth programs, cultural activities',
    canonical: '/about-us',
    structuredData: { type: 'localBusiness' as const }
  },
  activities: {
    title: 'Community Activities & Programs - Abbaquar-San Dream Centre',
    description: 'Discover our community activities and programs including youth development, cultural events, and community support services in Wentworth, Durban.',
    keywords: 'community activities, youth programs, cultural events, Wentworth Durban, community support',
    canonical: '/activities'
  },
  events: {
    title: 'Upcoming Events - Abbaquar-San Dream Centre | Community Events in Wentworth, Durban',
    description: 'Join our upcoming community events and cultural activities in Wentworth, Durban. Stay connected with Abbaquar-San Dream Centre\'s latest events and programs.',
    keywords: 'community events, cultural activities, Wentworth Durban events, youth programs, community gatherings',
    canonical: '/events'
  },
  gallery: {
    title: 'Photo Gallery - Abbaquar-San Dream Centre | Community Activities & Events',
    description: 'Browse our photo gallery showcasing community activities, events, and the impact of Abbaquar-San Dream Centre\'s programs in Wentworth, Durban.',
    keywords: 'photo gallery, community photos, Wentworth Durban, cultural activities, youth programs',
    canonical: '/gallery'
  },
  contact: {
    title: 'Contact Us - Abbaquar-San Dream Centre | Get in Touch',
    description: 'Contact Abbaquar-San Dream Centre in Wentworth, Durban. Get in touch for community support, youth programs, or to learn more about our services.',
    keywords: 'contact us, Wentworth Durban, community support, youth programs, get in touch',
    canonical: '/contact'
  }
};
