import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, Suspense } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from "./components/admin/ProtectedRoute";


// Eagerly load critical routes for best performance
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load non-critical routes to reduce initial bundle size
import { lazy } from 'react';
import { PageLoadingFallback } from './components/ui/loading-fallback';

// Lazy load non-critical routes
const Gallery = lazy(() => import("./pages/Gallery"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Activities = lazy(() => import("./pages/Activities"));
const Events = lazy(() => import("./pages/Events"));
const Contact = lazy(() => import("./pages/Contact"));

// Lazy load admin routes which are rarely accessed by most users
const AdminLogin = lazy(() => import("./pages/Admin/Login"));
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard"));
const GalleryAdmin = lazy(() => import("./pages/Admin/Gallery"));
const ActivitiesAdmin = lazy(() => import("./pages/Admin/Activities"));
const TeamAdmin = lazy(() => import("./pages/Admin/Team"));
const VolunteersAdmin = lazy(() => import("./pages/Admin/Volunteers"));
const EventsAdmin = lazy(() => import("./pages/Admin/Events"));
const BackupExport = lazy(() => import("./pages/Admin/BackupExport"));

// Add scrollToTop utility function
function scrollToTop() {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    // Set appropriate title based on route
    const isAdminRoute = location.pathname.startsWith('/login');
    document.title = isAdminRoute 
      ? 'Admin Panel | Abbaquar-San Dream Centre' 
      : 'Abbaquar-San Dream Centre';
    
    // Check if this is a return from PayFast donation
    const urlParams = new URLSearchParams(location.search);
    const isDonationReturn = urlParams.has('donation');
    
    if (isDonationReturn) {
      // Don't scroll to top when returning from donation flow
      // The user should stay where they were on the donate section
      // Also disable browser's automatic scroll restoration for this case
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      return;
    }
    
    // Re-enable automatic scroll restoration for normal navigation
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
    }
    
    // Scroll to top on route change (but not for donation returns)
    scrollToTop();
  }, [location.pathname, location.search]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/gallery" element={<Suspense fallback={<PageLoadingFallback />}><Gallery /></Suspense>} />
      <Route path="/about-us" element={<Suspense fallback={<PageLoadingFallback />}><AboutUs /></Suspense>} />
      <Route path="/activities" element={<Suspense fallback={<PageLoadingFallback />}><Activities /></Suspense>} />
      <Route path="/events" element={<Suspense fallback={<PageLoadingFallback />}><Events /></Suspense>} />
      <Route path="/contact" element={<Suspense fallback={<PageLoadingFallback />}><Contact /></Suspense>} />
      
      {/* Admin Routes */}
      <Route path="/login" element={<Navigate to="/login/dashboard" replace />} />
      <Route path="/login/auth" element={<AdminLogin />} />
      <Route 
        path="/login/dashboard" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback />}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/login/gallery" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback />}>
              <GalleryAdmin />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/login/activities" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback />}>
              <ActivitiesAdmin />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/login/team" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback />}>
              <TeamAdmin />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/login/volunteers" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback />}>
              <VolunteersAdmin />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/login/events" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback />}>
              <EventsAdmin />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/login/backup" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback />}>
              <BackupExport />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      
      {/* Legacy admin routes - redirect to new paths */}
      <Route path="/admin" element={<Navigate to="/login" replace />} />
      <Route path="/admin/login" element={<Navigate to="/login/auth" replace />} />
      <Route path="/admin/dashboard" element={<Navigate to="/login/dashboard" replace />} />
      <Route path="/admin/gallery" element={<Navigate to="/login/gallery" replace />} />
      <Route path="/admin/activities" element={<Navigate to="/login/activities" replace />} />
      <Route path="/admin/events" element={<Navigate to="/login/events" replace />} />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SpeedInsights />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  );
};

export default App;
