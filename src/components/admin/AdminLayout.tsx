import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Image, FileImage, Calendar, Home, LogOut, Menu, X, Mail, Database, Bell, Settings, Users } from 'lucide-react';
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
    { icon: Users, label: 'Team', path: '/login/team' },
    { icon: Calendar, label: 'Events', path: '/login/events' },
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
      {/* Sidebar */}
      <aside
        className="bg-[#073366] border-r border-white/10 text-white flex flex-col justify-between w-64 p-4 md:p-6 flex-shrink-0 h-screen overflow-y-auto fixed left-0 top-0 z-40"
      >
        <div className="flex-1 flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
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
              {navItems.slice(5).map((item) => (
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
      {/* Main content area with header */}
      <div className="flex-1 flex flex-col bg-[#0c2342] ml-64">
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 