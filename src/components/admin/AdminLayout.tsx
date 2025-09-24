import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Image, FileImage, Calendar, Home, LogOut, Menu, X, Mail, Database, Bell, Settings, Users, Heart } from 'lucide-react';
import { signOut } from '@/lib/authService';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login/auth');
    } catch (error) {
      alert('Error signing out. Please try again.');
    }
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/login/dashboard' },
    { icon: Image, label: 'Gallery', path: '/login/gallery' },
    { icon: FileImage, label: 'Activities', path: '/login/activities' },
    { icon: Users, label: 'Team & Volunteers', path: '/login/team' },
    { icon: Calendar, label: 'Events', path: '/login/events' },
  ];

  const toolItems = [
    { icon: Database, label: 'Backup', path: '/login/backup' },
  ];

  // Simulated user info (replace with real user data if available)
  const user = {
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: '/assets/abbaquar-logo.webp',
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-poppins bg-[#073366] bg-opacity-90">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`bg-[#073366] border-r border-white/10 text-white flex flex-col justify-between w-64 p-4 md:p-6 flex-shrink-0 h-screen overflow-y-auto fixed left-0 top-0 z-50 transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex-1 flex flex-col">
          {/* Mobile close button */}
          <div className="flex items-center justify-between mb-8 md:hidden">
            <img src="/assets/abbaquar-logo.webp" alt="Logo" className="h-16 w-auto" />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white hover:text-white/80 transition-colors p-2"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Desktop logo */}
          <div className="hidden md:flex items-center justify-center mb-8">
            <img src="/assets/abbaquar-logo.webp" alt="Logo" className="h-16 w-auto" />
          </div>
          {/* Navigation sections */}
          <nav className="space-y-4 flex-1">
            <div>
              <div className="uppercase text-xs text-white/40 mb-2 pl-2 tracking-widest">Main</div>
              {navItems.slice(0, 1).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm group
                    ${isActive(item.path)
                      ? 'bg-[#4f7df9]/30 text-white border border-white/20 shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <div>
              <div className="uppercase text-xs text-white/40 mb-2 pl-2 tracking-widest">Content</div>
              {navItems.slice(1, 5).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm group
                    ${isActive(item.path)
                      ? 'bg-[#4f7df9]/30 text-white border border-white/20 shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <div>
              <div className="uppercase text-xs text-white/40 mb-2 pl-2 tracking-widest">Tools</div>
              {toolItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm group
                    ${isActive(item.path)
                      ? 'bg-[#4f7df9]/30 text-white border border-white/20 shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>
          <div className="mt-4 pt-3 border-t border-white/10">
            <button
              aria-label="Sign out"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 text-sm"
            >
              <LogOut size={20} className="flex-shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
      
      {/* Mobile header */}
      <header className="md:hidden bg-[#073366] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-white hover:text-white/80 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <img src="/assets/abbaquar-logo.webp" alt="Logo" className="h-8 w-auto" />
          <span className="text-white font-medium text-sm">Admin</span>
        </div>
        <div className="w-6" /> {/* Spacer for centering */}
      </header>
      
      {/* Main content area with header */}
      <div className="flex-1 flex flex-col bg-[#0c2342] md:ml-64">
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 