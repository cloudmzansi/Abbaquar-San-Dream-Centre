import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, Heart, Users, CheckCircle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PayFastService } from '@/lib/payfast';


const Donate = () => {
  const [amount, setAmount] = useState("50.00");
  const [selectedAmount, setSelectedAmount] = useState("50.00");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Reset form when user navigates back from PayFast
  useEffect(() => {
    // This will run when the component mounts or when the user navigates back
    const handlePageShow = () => {
      setIsProcessing(false);
      setAmount(selectedAmount);
    };
    
    // pageshow event fires when navigating back
    window.addEventListener('pageshow', handlePageShow);
    
    // Check if we're returning from a donation
    const urlParams = new URLSearchParams(window.location.search);
    const donationStatus = urlParams.get('donation');
    
    if (donationStatus) {
      // Reset processing state
      setIsProcessing(false);
      
      // Show appropriate message based on donation status
      if (donationStatus === 'success') {
        toast({
          title: "Thank you for your donation!",
          description: "Your contribution has been received successfully. We appreciate your support!",
          variant: "default"
        });
      } else if (donationStatus === 'cancelled') {
        toast({
          title: "Donation cancelled",
          description: "Your donation was cancelled. You can try again anytime.",
          variant: "destructive"
        });
      }
      
      // Restore scroll position if available
      const savedScrollPosition = sessionStorage.getItem('lastScrollPosition');
      if (savedScrollPosition) {
        const scrollY = parseInt(savedScrollPosition, 10);
        // Use a small delay to ensure the page has fully loaded
        setTimeout(() => {
          window.scrollTo({ top: scrollY, behavior: 'instant' });
        }, 100);
        // Clean up the stored scroll position
        sessionStorage.removeItem('lastScrollPosition');
      } else {
        // Fallback: scroll to donate section if no saved position
        const donateElement = document.getElementById('donate');
        if (donateElement) {
          donateElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      
      // Clean up the URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
    
    // Clean up event listener
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [selectedAmount, toast]);
  
  const predefinedAmounts = ["50.00", "100.00", "200.00", "500.00"];

  const handleAmountClick = (amt: string) => {
    setSelectedAmount(amt);
    setAmount(amt);
  };
  
  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setAmount(value);
      setSelectedAmount('custom');
    }
  };

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive"
      });
      return;
    }

    // Format amount properly
    const cleanAmount = amount.replace(/[^0-9.]/g, '');
    const numericAmount = parseFloat(cleanAmount);
    const formattedAmount = numericAmount.toFixed(2);
    
    // Set the amount in the hidden field
    const amountInput = document.getElementById('payfast-amount') as HTMLInputElement;
    if (amountInput) {
      amountInput.value = formattedAmount;
    }
    
    // Store the current state and scroll position before redirecting
    sessionStorage.setItem('lastDonationAmount', selectedAmount);
    sessionStorage.setItem('lastScrollPosition', window.scrollY.toString());
    
    setIsProcessing(true);
    
    // Submit the form
    const payfastForm = document.getElementById('payfast-form') as HTMLFormElement;
    if (payfastForm) {
      setTimeout(() => {
        payfastForm.submit();
      }, 1000);
    }
  };

  return (
    <>
      <span id="donate" className="block h-0 w-0 -mt-24" aria-hidden="true"></span>
      <section className="py-16 pt-24 md:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-[#D72660] font-semibold mb-4 block">Make a Difference</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#073366] font-serif">Support Our Cause</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Your donation helps us continue our mission of uplifting and supporting our community. Every contribution makes a difference.
            </p>
            

          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-100">
              <div className="space-y-8">
                <div>
                  <label className="block text-gray-700 text-lg font-semibold mb-4">Select Amount</label>
                  <div className="grid grid-cols-2 gap-4">
                    {predefinedAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className={`py-4 px-6 border-2 rounded-xl transition-all font-semibold transform hover:scale-105 ${
                          selectedAmount === amt 
                            ? 'bg-[#D72660] text-white border-[#D72660] shadow-lg' 
                            : 'border-gray-200 text-gray-700 hover:border-[#D72660] hover:text-[#D72660] hover:shadow-md'
                        }`}
                        onClick={() => handleAmountClick(amt)}
                        disabled={isProcessing}
                      >
                        R{amt}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="amount" className="block text-gray-700 text-lg font-semibold mb-4">Custom Amount</label>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-[#D72660] transition-all">
                    <span className="bg-gray-50 px-6 py-4 text-gray-500 font-semibold border-r-2 border-gray-200">R</span>
                    <input
                      type="text"
                      id="amount"
                      value={amount}
                      onChange={handleCustomAmount}
                      className="flex-1 px-6 py-4 outline-none text-lg bg-white text-gray-700 placeholder-gray-400"
                      placeholder="Enter your amount"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                {/* Trust & Security Badges */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-gray-600">Secure Payment via PayFast</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-gray-600">SSL Encrypted</span>
                    </div>
                  </div>
                </div>

                {/* Donate Button */}
                <button
                  onClick={handleDonate}
                  disabled={isProcessing}
                  className="w-full bg-[#D72660] hover:bg-[#b91c47] text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>Donate Now - Make a Difference</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                {/* Additional Trust Elements */}
                <div className="text-center text-sm text-gray-500">
                  <p>Your donation is tax-deductible • 100% goes to community programs</p>
                  <p className="mt-2">Need help? Contact us at 084 251 5740</p>
                </div>

                {/* Direct PayFast Form */}
                <form 
                  id="payfast-form" 
                  action="https://www.payfast.co.za/eng/process" 
                  method="post"
                  className="hidden"
                >
                  {/* Required PayFast fields */}
                  <input type="hidden" name="merchant_id" value="23570599" />
                  <input type="hidden" name="merchant_key" value="tuhajyhgga7yo" />
                  <input type="hidden" id="payfast-amount" name="amount" value={amount} />
                  <input type="hidden" name="item_name" value="Abbaquar-San Dream Centre" />
                  
                  {/* Return URLs */}
                  <input type="hidden" name="return_url" value={`${window.location.origin}/?donation=success`} />
                  <input type="hidden" name="cancel_url" value={`${window.location.origin}/?donation=cancelled`} />
                  <input type="hidden" name="notify_url" value={`${window.location.origin}/api/payfast-itn`} />
                  
                  {/* Additional fields for better tracking */}
                  <input type="hidden" name="custom_str1" value="homepage_donation" />
                  <input type="hidden" name="custom_str2" value={selectedAmount} />
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Donate;
