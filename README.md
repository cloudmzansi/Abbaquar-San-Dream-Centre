# Abbaquar San Dream Centre

A modern, responsive website for the Abbaquar San Dream Centre, a community-focused nonprofit organisation based in South Africa. Built with React, TypeScript, and Tailwind CSS, featuring a comprehensive admin panel for content management.

## 🌟 Overview

Abbaquar San Dream Centre is a community organisation that serves people of all ages and stages of life. The website showcases their activities, events, gallery, and provides donation capabilities, while offering a powerful admin panel for content management.

## ✨ Key Features

### 🎯 Public Features
- **Responsive Design**: Optimised for all devices with mobile-first approach
- **Hero Section**: Compelling landing page with call-to-action buttons
- **Activities Showcase**: Display of community programmes and initiatives
- **Events Management**: Upcoming events with detailed information and scheduling
- **Photo Gallery**: Interactive image gallery with lightbox functionality
- **Contact Forms**: Multiple contact options with form validation
- **Donation System**: Integrated PayFast payment gateway for donations
- **About Us**: Comprehensive information about the organisation and team
- **Interactive Map**: Location-based services with Mapbox integration
- **Team Showcase**: Dynamic team member profiles with roles and photos

### 🔧 Admin Panel Features
- **Secure Authentication**: Protected admin routes with login system
- **Dashboard Analytics**: Real-time statistics and system health monitoring
- **Content Management**: 
  - Gallery image upload and management with drag-and-drop
  - Activities creation and editing with display location control
  - Events scheduling and management with advanced date/time handling
  - Team member management with profile photos and role management
  - Contact message handling
- **Advanced Features**:
  - Drag-and-drop reordering for activities and team members
  - Bulk operations for gallery management
  - Real-time search and filtering
  - Grid and list view modes
  - Image optimization and validation
- **Data Export**: Backup and export functionality for data management
- **Password Management**: Password visibility toggle and forgot password functionality
- **System Monitoring**: Performance tracking and health status indicators

### 🚀 Performance Features
- **Lazy Loading**: Optimised bundle splitting for faster page loads
- **Image Optimization**: WebP format with responsive sizing and automatic compression
- **Web Vitals**: Core Web Vitals optimisation for better SEO
- **Database Optimization**: Performance indexes and Row Level Security
- **Caching Strategy**: Efficient resource loading and browser caching

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **Lucide React** for icons
- **React Beautiful DnD** for drag-and-drop functionality

### Backend & Database
- **Supabase** for database and authentication
- **PostgreSQL** for data storage with advanced indexing
- **Row Level Security** for data protection
- **Real-time subscriptions** for live updates

### Payment & Performance
- **PayFast** for payment processing
- **Vercel Analytics** for visitor tracking
- **Web Vitals** for performance monitoring
- **Sharp** for image processing and optimization

### Development Tools
- **ESLint** for code quality
- **TypeScript** for type safety
- **Vitest** for testing
- **Database migrations** for schema management

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
- **Image Upload Security**: File type and size validation

## 📊 Database Schema

### Core Tables
- **activities**: Community programmes with display location control
- **events**: Scheduled events with advanced date/time handling
- **gallery_images**: Photo gallery with categorization
- **team_members**: Team profiles with roles and photos
- **donations**: Payment records with PayFast integration

### Performance Optimizations
- **Indexed Queries**: Optimized database performance
- **RLS Policies**: Secure data access patterns
- **Automatic Timestamps**: Created/updated tracking
- **Soft Deletes**: Data preservation strategies

## 🌐 Deployment

- **Platform**: Vercel for hosting
- **CDN**: Global content delivery
- **SSL**: Automatic HTTPS encryption
- **Environment**: Production-optimised builds
- **Database**: Supabase with automatic backups

## 📱 Mobile Optimisation

- **Responsive Design**: Mobile-first approach
- **Touch Interactions**: Optimised for touch devices
- **Performance**: Fast loading on mobile networks
- **Accessibility**: Screen reader friendly
- **Progressive Web App**: Offline capabilities

## 🎯 SEO Features

- **Meta Tags**: Comprehensive meta information
- **Structured Data**: Rich snippets for search engines
- **Sitemap**: Automatic sitemap generation
- **Robots.txt**: Search engine directives
- **Open Graph**: Social media sharing optimisation

## 🔄 Content Management

### Admin Capabilities
- **Image Upload**: Drag-and-drop gallery management with validation
- **Event Creation**: Rich text editor for events with scheduling
- **Activity Management**: CRUD operations with display control
- **Team Management**: Member profiles with photo uploads and role management
- **Message Handling**: Contact form message processing
- **Data Export**: Backup and export functionality
- **Real-time Updates**: Instant content changes across the site

### User Experience
- **Intuitive Interface**: Easy-to-use admin panel with modern UI
- **Drag-and-Drop**: Visual content reordering
- **Bulk Operations**: Efficient content management
- **Search & Filter**: Quick content discovery
- **Grid/List Views**: Flexible content display options

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
- **Image Loading**: Optimised image delivery with WebP
- **Caching**: Strategic resource caching
- **Database Performance**: Optimized queries and indexing

## 🤝 Contributing

This project follows modern web development best practices:
- **TypeScript**: Type-safe development
- **ESLint**: Code quality standards
- **Prettier**: Consistent code formatting
- **Git Hooks**: Pre-commit quality checks
- **Database Migrations**: Version-controlled schema changes

## 📄 License

This project is proprietary software developed for Abbaquar San Dream Centre. All rights reserved.

---

**Built with ❤️ for the Abbaquar San Dream Centre community** 