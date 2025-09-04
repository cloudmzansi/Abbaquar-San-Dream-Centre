import { ContactFormData } from '@/types';

// Web3Forms endpoint
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

// Web3Forms access key
const WEB3FORMS_ACCESS_KEY = 'b61aef1b-4125-420c-8ec9-1509fe524e61';

/**
 * Send contact form data using Web3Forms
 * @param formData The form data from the contact form
 * @returns Promise resolving to success or error
 */
export const sendContactEmail = async (formData: ContactFormData): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> => {
  try {
    // Prepare data for Web3Forms
    const formPayload = {
      ...formData,
      access_key: WEB3FORMS_ACCESS_KEY,
      from_name: formData.name,
      subject: formData.subject || 'New contact form submission from Abbaquar-San Dream Centre',
      // Add any additional fields needed
      website: 'Abbaquar-San Dream Centre Website',
      botcheck: '', // Important for spam prevention
    };

    // Send the form data to Web3Forms
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formPayload)
    });
    
    // Parse the response
    const data = await response.json();
    
    // Check if the submission was successful
    if (data.success) {
      return {
        success: true,
        message: 'Thank you for your message. We will get back to you soon!'
      };
    } else {
      throw new Error(data.message || 'Failed to send email');
    }
  } catch (error) {
    // Provide more detailed error information
    let errorMessage = 'Unknown error occurred';
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack
      };
      
      // Check for network errors
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
    }
    
    console.error('Web3Forms submission error:', error);
    
    return {
      success: false,
      message: errorMessage,
      details: errorDetails
    };
  }
}
