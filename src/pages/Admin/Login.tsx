import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '@/lib/authService';

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
        <div className="bg-[#102a4c]/80 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-white/20">
          {/* Logo Section */}
          <div className="flex flex-col items-center pt-10 pb-6 px-8">
            <div className="mb-4">
              <img src="/assets/abbaquar-logo.webp" alt="Abbaquar Logo" className="h-24 w-auto" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Welcome back!
            </h2>
            <p className="mt-1 text-center text-sm text-[#E0E9FF]/80">
              Sign in to your account
            </p>
          </div>
          
          {/* Form Section */}
          <form className="px-8 pb-8 space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email-address" className="flex items-center text-sm font-medium text-[#E0E9FF]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#E0E9FF]/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
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
                  className="appearance-none block w-full px-4 py-3 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#4f7df9] focus:border-transparent transition-all duration-200 bg-white/10 backdrop-blur-sm"
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
              <label htmlFor="password" className="flex items-center text-sm font-medium text-[#E0E9FF]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#E0E9FF]/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
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
                  className="appearance-none block w-full px-4 py-3 pr-12 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#4f7df9] focus:border-transparent transition-all duration-200 bg-white/10 backdrop-blur-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#E0E9FF]/80 hover:text-[#E0E9FF] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium text-[#E0E9FF] hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-900/50 p-3 border border-red-700">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#4f7df9] hover:bg-[#3a66e0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4f7df9] disabled:opacity-50 transition-all duration-200 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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
            <div className="bg-[#102a4c]/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Reset Password</h3>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                    setForgotPasswordMessage(null);
                  }}
                  className="text-[#E0E9FF]/80 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-[#E0E9FF] mb-2">
                    Email address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#4f7df9] focus:border-transparent transition-all duration-200 bg-white/10 backdrop-blur-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                {forgotPasswordMessage && (
                  <div className={`rounded-xl p-3 border ${
                    forgotPasswordMessage.includes('sent') 
                      ? 'bg-green-900/50 border-green-700 text-green-200' 
                      : 'bg-red-900/50 border-red-700 text-red-200'
                  }`}>
                    <p className="text-sm font-medium">{forgotPasswordMessage}</p>
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
                    className="flex-1 py-3 px-4 border border-white/30 text-sm font-medium rounded-xl text-[#E0E9FF] hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="flex-1 py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#4f7df9] hover:bg-[#3a66e0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4f7df9] disabled:opacity-50 transition-all duration-200"
                  >
                    {forgotPasswordLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
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