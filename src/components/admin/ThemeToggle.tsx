import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-colors duration-200 flex items-center justify-center
        ${theme === 'dark' 
          ? 'bg-white/10 hover:bg-white/20 text-white' 
          : 'bg-white/10 hover:bg-white/20 text-white'
        }
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'dark' ? (
        <Sun size={18} className="text-white" />
      ) : (
        <Moon size={18} className="text-white" />
      )}
    </button>
  );
};

export default ThemeToggle;
