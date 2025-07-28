import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, Suspense } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import { lazyLoad, lazyLoadWithSkeleton } from "./utils/lazyLoad";


// Eagerly load critical routes for best performance
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load non-critical routes to reduce initial bundle size
import { lazy } from 'react';

const LoadingFallback = () => <div className="h-screen w-full flex items-center justify-center"><div className="animate-pulse rounded-xl bg-muted h-12 w-12"></div></div>;

// Lazy load non-critical routes
const Gallery = lazy(() => import("./pages/Gallery"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Activities = lazy(() => import("./pages/Activities"));
const Contact = lazy(() => import("./pages/Contact"));

// Lazy load admin routes which are rarely accessed by most users
const AdminLogin = lazy(() => import("./pages/Admin/Login"));
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard"));
const GalleryAdmin = lazy(() => import("./pages/Admin/Gallery"));
const ActivitiesAdmin = lazy(() => import("./pages/Admin/Activities"));
const EventsAdmin = lazy(() => import("./pages/Admin/Events"));
const ContactMessages = lazy(() => import("./pages/Admin/ContactMessages"));

const BackupExport = lazy(() => import("./pages/Admin/BackupExport"));

// Simple function to scroll to top of page
function scrollToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0; // For Safari
}

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    // Set appropriate title based on route
    const isAdminRoute = location.pathname.startsWith('/login');
    document.title = isAdminRoute 
      ? 'Admin Panel | Abbaquar-San Dream Centre' 
      : 'Abbaquar-San Dream Centre';
    
    // Scroll to top on route change
    scrollToTop();
  }, [location.pathname]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/gallery" element={<Suspense fallback={<LoadingFallback />}><Gallery /></Suspense>} />
      <Route path="/about-us" element={<Suspense fallback={<LoadingFallback />}><AboutUs /></Suspense>} />
      <Route path="/activities" element={<Suspense fallback={<LoadingFallback />}><Activities /></Suspense>} />
      <Route path="/contact" element={<Suspense fallback={<LoadingFallback />}><Contact /></Suspense>} />
      
      {/* Admin Routes */}
      <Route path="/login" element={<Navigate to="/login/dashboard" replace />} />
      <Route path="/login/auth" element={<AdminLogin />} />
      <Route 
        path="/login/dashboard" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/login/gallery" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <GalleryAdmin />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/login/activities" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ActivitiesAdmin />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/login/events" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <EventsAdmin />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/login/messages" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ContactMessages />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/login/backup" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SpeedInsights />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
