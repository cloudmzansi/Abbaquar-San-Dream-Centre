# Abbaquar San Dream Centre

A modern, responsive website for the Abbaquar San Dream Centre, a community-focused nonprofit organisation based in South Africa. Built with React, TypeScript, and Tailwind CSS, featuring a comprehensive admin panel for content management.

## 🌟 Overview

Abbaquar San Dream Centre is a community organisation that serves people of all ages and stages of life. The website showcases their activities, events, gallery, and provides donation capabilities, while offering a powerful admin panel for content management.

## ✨ Key Features

### 🎯 Public Features
- **Responsive Design**: Optimised for all devices with mobile-first approach
- **Hero Section**: Compelling landing page with call-to-action buttons
- **Activities Showcase**: Display of community programmes and initiatives
- **Events Management**: Upcoming events with detailed information
- **Photo Gallery**: Interactive image gallery with lightbox functionality
- **Contact Forms**: Multiple contact options with form validation
- **Donation System**: Integrated PayFast payment gateway for donations
- **About Us**: Comprehensive information about the organisation and team
- **Interactive Map**: Location-based services with Mapbox integration

### 🔧 Admin Panel Features
- **Secure Authentication**: Protected admin routes with login system

- **Content Management**: 
  - Gallery image upload and management
  - Activities creation and editing
  - Events scheduling and management
  - Contact message handling
- **Data Export**: Backup and export functionality for data management

- **Password Management**: Password visibility toggle and forgot password functionality

### 🚀 Performance Features
- **Lazy Loading**: Optimised bundle splitting for faster page loads
- **Image Optimization**: WebP format with responsive sizing
- **Web Vitals**: Core Web Vitals optimisation for better SEO

- **PWA Ready**: Service worker for offline capabilities

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **Lucide React** for icons

### Backend & Database
- **Supabase** for database and authentication
- **PostgreSQL** for data storage
- **Row Level Security** for data protection

### Payment & Performance
- **PayFast** for payment processing
- **Vercel Analytics** for visitor tracking
- **Web Vitals** for performance monitoring

### Development Tools
- **ESLint** for code quality
- **TypeScript** for type safety
- **Vitest** for testing
- **Sharp** for image processing

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── ui/             # Base UI components (Radix-based)
│   └── ...             # Feature-specific components
├── pages/              # Route components
│   ├── Admin/          # Admin panel pages
│   └── ...             # Public pages
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and services
├── contexts/           # React contexts
├── types/              # TypeScript type definitions
├── styles/             # Global styles
└── utils/              # Helper functions
```

## 🎨 Design System

### Colour Palette
- **Primary Blue**: `#083060` - Main brand colour
- **Accent Pink**: `#D72660` - Call-to-action elements
- **Dark Blue**: `#052548` - Background gradients
- **Light Blue**: `#E0E9FF` - Text and accents

### Typography
- **Font Family**: Poppins (primary), Serif (headings)
- **Responsive**: Fluid typography scaling
- **Accessibility**: High contrast ratios

### Components
- **Consistent Spacing**: 8px grid system
- **Rounded Corners**: 12px (xl) for cards, 8px for buttons
- **Shadows**: Subtle depth with backdrop blur effects
- **Transitions**: Smooth 200ms animations

## 🔐 Security Features

- **Protected Routes**: Admin panel with authentication
- **Input Validation**: Form validation and sanitisation
- **CSRF Protection**: Secure form submissions
- **Data Encryption**: Sensitive data encryption
- **Row Level Security**: Database-level access control



### Performance Monitoring
- **Lighthouse Scores**: Regular performance audits
- **Bundle Analysis**: Optimised code splitting
- **Image Optimization**: Automatic WebP conversion
- **Caching Strategy**: Efficient resource loading

## 🌐 Deployment

- **Platform**: Vercel for hosting
- **CDN**: Global content delivery
- **SSL**: Automatic HTTPS encryption
- **Environment**: Production-optimised builds

## 📱 Mobile Optimisation

- **Responsive Design**: Mobile-first approach
- **Touch Interactions**: Optimised for touch devices
- **Performance**: Fast loading on mobile networks
- **Accessibility**: Screen reader friendly

## 🎯 SEO Features

- **Meta Tags**: Comprehensive meta information
- **Structured Data**: Rich snippets for search engines
- **Sitemap**: Automatic sitemap generation
- **Robots.txt**: Search engine directives
- **Open Graph**: Social media sharing optimisation

## 🔄 Content Management

### Admin Capabilities
- **Image Upload**: Drag-and-drop gallery management
- **Event Creation**: Rich text editor for events
- **Activity Management**: CRUD operations for activities
- **Message Handling**: Contact form message processing
- **Data Export**: Backup and export functionality

### User Experience
- **Intuitive Interface**: Easy-to-use admin panel
- **Real-time Updates**: Instant content changes
- **Bulk Operations**: Efficient content management
- **Search & Filter**: Quick content discovery

## 🌍 Accessibility

- **WCAG 2.1 Compliance**: Level AA standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and descriptions
- **Colour Contrast**: High contrast ratios
- **Focus Management**: Clear focus indicators

## 📈 Performance Metrics

- **Lighthouse Score**: 90+ across all metrics
- **Core Web Vitals**: Optimised for user experience
- **Bundle Size**: Efficient code splitting
- **Image Loading**: Optimised image delivery
- **Caching**: Strategic resource caching

## 🤝 Contributing

This project follows modern web development best practices:
- **TypeScript**: Type-safe development
- **ESLint**: Code quality standards
- **Prettier**: Consistent code formatting
- **Git Hooks**: Pre-commit quality checks

## 📄 License

This project is proprietary software developed for Abbaquar San Dream Centre. All rights reserved.

---

**Built with ❤️ for the Abbaquar San Dream Centre community** 