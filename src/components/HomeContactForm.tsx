import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ContactFormData } from '@/types';
import { LoadingSpinner } from './ui/loading-spinner';
import { useFormTracking } from '@/hooks/use-analytics';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  terms?: string;
}

interface HomeContactFormProps {
  showContainer?: boolean;
}

const HomeContactForm: React.FC<HomeContactFormProps> = ({ showContainer = true }) => {
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const { toast } = useToast();
  const { handleSubmit: trackFormSubmit } = useFormTracking('contact', 'home_contact_form');
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Reset errors when form data changes
  useEffect(() => {
    setErrors({});
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Validate form
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (!agreeToTerms) newErrors.terms = 'You must agree to the terms';
    
    setErrors(newErrors);
    
    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    // Track form submission
    trackFormSubmit();

    try {
      // Prepare data for Web3Forms
      const formPayload = {
        access_key: 'b61aef1b-4125-420c-8ec9-1509fe524e61', // Your Web3Forms access key
        subject: formData.subject || 'New contact form submission from Abbaquar-San Dream Centre',
        from_name: formData.name,
        email: formData.email,
        message: formData.message,
        website: 'Abbaquar-San Dream Centre Website',
        botcheck: '', // Important for spam prevention
      };

      // Send the form data to Web3Forms
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formPayload)
      });

      const result = await response.json();
      
      // Also save to database for admin management
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data, error } = await supabase.from('contact_messages').insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'New contact form submission',
          message: formData.message,
          status: 'new'
        });
        
        if (error) {
          console.error('Database insert error:', error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint
          });
        } else {
          console.log('Message saved to database successfully:', data);
        }
      } catch (dbError) {
        console.error('Failed to save message to database:', dbError);
        // Don't fail the form submission if database save fails
      }
      
      if (result.success) {
        // Reset form on success
        setSubmitStatus({ success: true, message: 'Your message has been sent successfully!' });
        setFormData({ name: '', email: '', subject: '', message: '' });
        setAgreeToTerms(false);
        
        // Update screen reader announcement
        const successElement = document.getElementById('form-success-message');
        if (successElement) {
          successElement.textContent = 'Your message has been sent successfully!';
        }
      } else {
        // Handle error from Web3Forms
        setSubmitStatus({ success: false, message: result.message || 'Failed to send message. Please try again.' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({ success: false, message: 'An error occurred. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <>
      {/* Hidden element for screen reader announcements */}
      <div 
        id="form-success-message" 
        className="sr-only" 
        role="status" 
        aria-live="polite"
      ></div>
      
      <form 
        onSubmit={handleSubmit} 
        className={`space-y-5 ${!showContainer ? 'p-0' : ''}`}
        aria-labelledby="contact-form"
        noValidate
      >
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label htmlFor="name" className="block text-white mb-1.5 text-sm font-medium">
              Name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input 
              type="text" 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-white/10 border rounded-xl placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4A017] text-white ${
                errors.name ? 'border-red-500' : 'border-white/30'
              }`}
              required
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              disabled={isSubmitting}
              placeholder=""
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-500" role="alert">
                {errors.name}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-white mb-1.5 text-sm font-medium">
              Email <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input 
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-white/10 border rounded-xl placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4A017] text-white ${
                errors.email ? 'border-red-500' : 'border-white/30'
              }`}
              required
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={isSubmitting}
              placeholder=""
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-500" role="alert">
                {errors.email}
              </p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-white mb-1.5 text-sm font-medium">
            Subject <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input 
            type="text" 
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-white/10 border rounded-xl placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4A017] text-white ${
              errors.subject ? 'border-red-500' : 'border-white/30'
            }`}
            required
            aria-required="true"
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? 'subject-error' : undefined}
            disabled={isSubmitting}
          />
          {errors.subject && (
            <p id="subject-error" className="mt-1 text-sm text-red-500" role="alert">
              {errors.subject}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="message" className="block text-white mb-1.5 text-sm font-medium">
            Message <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea 
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4} 
            className={`w-full px-4 py-2 bg-white/10 border rounded-xl placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4A017] text-white ${
              errors.message ? 'border-red-500' : 'border-white/30'
            }`}
            required
            aria-required="true"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
            disabled={isSubmitting}
          />
          {errors.message && (
            <p id="message-error" className="mt-1 text-sm text-red-500" role="alert">
              {errors.message}
            </p>
          )}
        </div>
        
        <div className="flex items-start mt-2">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={() => setAgreeToTerms(!agreeToTerms)}
              className="h-4 w-4 rounded bg-[#083060] border-white/30 text-[#D4A017] focus:ring-[#D4A017] focus:ring-offset-[#083060]"
              disabled={isSubmitting}
              aria-required="true"
            />
          </div>
          <label htmlFor="terms" className="ml-2 text-sm text-white">
            By submitting this form, you consent to the storage and processing of your data by this website.
            <span className="text-red-500" aria-hidden="true"> *</span>
          </label>
          {errors.terms && (
            <p className="mt-1 text-sm text-red-500" role="alert">
              {errors.terms}
            </p>
          )}
        </div>
        
        <button 
          type="submit" 
          className="px-6 py-2.5 rounded-xl font-semibold bg-[#D4A017] text-white hover:bg-opacity-90 transition-all shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:translate-y-[-1px] active:translate-y-[1px] text-sm"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" aria-hidden="true" />
              <span>Sending...</span>
            </>
          ) : (
            'Send Message'
          )}
        </button>
        
        {submitStatus && (
          <p className={`mt-2 text-sm ${submitStatus.success ? 'text-green-500' : 'text-red-500'}`} role="alert">
            {submitStatus.message}
          </p>
        )}
      </form>
    </>
  );

  return showContainer ? (
    <div className="bg-[#083060]/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-white/20">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[#F5F5F0]" id="contact-form">Send us a message</h2>
      {formContent}
    </div>
  ) : formContent;
};

export default HomeContactForm;
