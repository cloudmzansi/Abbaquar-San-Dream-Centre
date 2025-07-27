import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Image, FileImage, Calendar, Home, LogOut, Menu, X, Mail, Database, BarChart3 } from 'lucide-react';
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
    { icon: Calendar, label: 'Events', path: '/login/events' },
    { icon: Mail, label: 'Messages', path: '/login/messages' },
    { icon: BarChart3, label: 'Analytics', path: '/login/analytics' },
    { icon: Database, label: 'Backup', path: '/login/backup' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-poppins bg-[#073366] bg-opacity-90">
      {/* Mobile menu button */}
      <div className="md:hidden p-3 flex justify-between items-center sticky top-0 z-50 border-b bg-[#073366] backdrop-blur-sm text-white border-white/10 shadow-md">
        <div className="flex items-center">
          <img src="/assets/abbaquar-logo.webp" alt="Logo" className="h-8 w-auto mr-3" />
          <span className="font-semibold text-sm">Abbaquar-San Dream Centre</span>
        </div>
        <button
          aria-label="Toggle menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? 'block fixed inset-0 z-40 pt-16' : 'hidden'
        } md:block md:static md:pt-0 md:z-auto w-full md:w-64 p-4 md:p-6 flex-shrink-0 border-r transition-all duration-300 bg-[#073366] backdrop-blur-sm text-white border-white/10 md:min-h-screen overflow-y-auto`}
      >
        <div className="hidden md:block mb-8 pl-2 pt-4">
          <div className="flex justify-start">
            <img src="/assets/abbaquar-logo.webp" alt="Logo" className="h-16 w-auto" />
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-[#4f7df9]/50 text-white border border-white/20 shadow-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon size={16} className="flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}

          <div className="pt-3 mt-4 border-t border-white/10">
            <button
              aria-label="Sign out"
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              <LogOut size={16} className="flex-shrink-0" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-[#0c2342] backdrop-blur-sm">
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          <div className="rounded-xl shadow-lg p-3 sm:p-4 md:p-6 bg-[#102a4c]/80 backdrop-blur-sm border border-white/10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 