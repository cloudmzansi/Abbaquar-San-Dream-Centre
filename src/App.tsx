import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import ProtectedRoute from "./components/admin/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Gallery from "./pages/Gallery";
import AboutUs from "./pages/AboutUs";
import Activities from "./pages/Activities";
import Contact from "./pages/Contact";

import AdminLogin from "./pages/Admin/Login";
import AdminDashboard from "./pages/Admin/Dashboard";
import GalleryAdmin from "./pages/Admin/Gallery";
import ActivitiesAdmin from "./pages/Admin/Activities";
import EventsAdmin from "./pages/Admin/Events";

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    // Set appropriate title based on route
    const isAdminRoute = location.pathname.startsWith('/login');
    document.title = isAdminRoute 
      ? 'Admin Panel | Abbaquar-San Dream Centre' 
      : 'Abbaquar-San Dream Centre';
  }, [location.pathname]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/activities" element={<Activities />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Admin Routes */}
      <Route path="/login" element={<Navigate to="/login/dashboard" replace />} />
      <Route path="/login/auth" element={<AdminLogin />} />
      <Route 
        path="/login/dashboard" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/login/gallery" 
        element={
          <ProtectedRoute>
            <GalleryAdmin />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/login/activities" 
        element={
          <ProtectedRoute>
            <ActivitiesAdmin />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/login/events" 
        element={
          <ProtectedRoute>
            <EventsAdmin />
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
