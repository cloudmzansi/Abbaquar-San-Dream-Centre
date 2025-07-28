import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '@/lib/authService';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formFocused, setFormFocused] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);
  
  // Check for saved email in localStorage if user previously checked 'remember me'
  useEffect(() => {
    const savedEmail = localStorage.getItem('adminEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    if (!/^[\w-\. +%]+@([\w-]+\.)+[A-Za-z]{2,4}$/.test(email)) {
      setError('Invalid email format');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await signIn(email, password);
      
      // Save email to localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('adminEmail', email);
      } else {
        localStorage.removeItem('adminEmail');
      }
      
      navigate('/login/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('Please enter your email address');
      return;
    }
    
    if (!/^[\w-\. +%]+@([\w-]+\.)+[A-Za-z]{2,4}$/.test(forgotPasswordEmail)) {
      setForgotPasswordMessage('Invalid email format');
      return;
    }
    
    setForgotPasswordLoading(true);
    setForgotPasswordMessage(null);
    
    try {
      // Here you would typically call your auth service to send a password reset email
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setForgotPasswordMessage('Password reset email sent! Please check your inbox.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
        setForgotPasswordMessage(null);
      }, 3000);
    } catch (err: any) {
      setForgotPasswordMessage('Failed to send reset email. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };
  
  const handleFocus = () => setFormFocused(true);
  const handleBlur = () => setFormFocused(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#073366] bg-opacity-90 py-12 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="max-w-md w-full">
        {/* Main Login Card */}
        <div className="bg-[#1a365d]/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 overflow-hidden transition-all duration-300 hover:shadow-xl">
          {/* Logo Section */}
          <div className="flex flex-col items-center pt-10 pb-6 px-8">
            <div className="mb-4">
              <img src="/assets/abbaquar-logo.webp" alt="Abbaquar Logo" className="h-24 w-auto" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Welcome back!
            </h2>
            <p className="mt-1 text-center text-sm text-white/70">
              Sign in to your account
            </p>
          </div>
          
          {/* Form Section */}
          <form className="px-8 pb-8 space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email-address" className="flex items-center text-sm font-medium text-white">
                <Mail className="h-4 w-4 mr-2 text-white/70" />
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-label="Email address input"
                  className="appearance-none block w-full px-3 py-2 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 focus:border-transparent transition-all duration-200 bg-white/10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="flex items-center text-sm font-medium text-white">
                <Lock className="h-4 w-4 mr-2 text-white/70" />
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  aria-label="Password input"
                  className="appearance-none block w-full px-3 py-2 pr-12 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 focus:border-transparent transition-all duration-200 bg-white/10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 border border-red-500/20">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#4f7df9] hover:bg-[#4f7df9]/80 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 disabled:opacity-50 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a365d]/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Reset Password</h3>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                    setForgotPasswordMessage(null);
                  }}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-white mb-2">
                    Email address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 focus:border-transparent transition-all duration-200 bg-white/10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                {forgotPasswordMessage && (
                  <div className={`rounded-lg p-3 border ${
                    forgotPasswordMessage.includes('sent') 
                      ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    <div className="flex items-center">
                      {forgotPasswordMessage.includes('sent') ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-2" />
                      )}
                      <p className="text-sm font-medium">{forgotPasswordMessage}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail('');
                      setForgotPasswordMessage(null);
                    }}
                    className="flex-1 py-3 px-4 border border-white/20 text-sm font-medium rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="flex-1 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#4f7df9] hover:bg-[#4f7df9]/80 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 disabled:opacity-50 transition-all duration-200"
                  >
                    {forgotPasswordLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2 inline"></div>
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin; 