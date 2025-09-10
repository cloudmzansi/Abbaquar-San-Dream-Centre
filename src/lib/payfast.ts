import MD5 from 'crypto-js/md5';
import encHex from 'crypto-js/enc-hex';

/**
 * Simple PayFast payment integration
 * Based on PayFast documentation: https://developers.payfast.co.za/docs
 */
export class PayFastService {
  private readonly LIVE_URL = 'https://www.payfast.co.za/eng/process';
  
  constructor(
    private merchantId: string,
    private merchantKey: string
  ) {
    if (!merchantId || !merchantKey) {
      throw new Error('PayFast merchant ID and merchant key are required');
    }
  }

  /**
   * Generate payment form data for PayFast
   */
  generatePaymentForm(params: {
    amount: number;
    itemName: string;
    returnUrl?: string;
    cancelUrl?: string;
    notifyUrl?: string;
  }): Record<string, string> {
    // Validate amount
    if (isNaN(params.amount) || params.amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Create payment data with required fields
    const paymentData: Record<string, string> = {};
    
    // Add merchant details - these MUST be first in the form
    paymentData.merchant_id = this.merchantId.trim();
    paymentData.merchant_key = this.merchantKey.trim();
    
    // Format amount with exactly 2 decimal places
    paymentData.amount = params.amount.toFixed(2);
    
    // Add item name - ensure it's properly trimmed
    paymentData.item_name = (params.itemName || 'Donation').trim();

    // Add optional URLs if provided - ensure they're properly formatted
    if (params.returnUrl) paymentData.return_url = params.returnUrl.trim();
    if (params.cancelUrl) paymentData.cancel_url = params.cancelUrl.trim();
    
    // Add ITN URL for donation tracking
    const baseUrl = import.meta.env.VITE_BASE_URL || 'https://your-domain.com';
    paymentData.notify_url = `${baseUrl}/api/payfast-itn`;
    
    // Add PayFast required fields
    // These are required according to PayFast documentation
    paymentData.payment_method = 'cc';
    paymentData.email_confirmation = '1';
    paymentData.confirmation_address = 'info@abbaquar-sandreamcentre.co.za';
    
    // Generate signature
    const signature = this.generateSignature(paymentData);
    paymentData.signature = signature;
    
    return paymentData;
  }

  /**
   * Get the PayFast URL
   */
  getPaymentUrl(): string {
    return this.LIVE_URL;
  }

  /**
   * Generate MD5 signature for PayFast
   * Strictly following https://developers.payfast.co.za/docs#generating-signatures
   */
  private generateSignature(data: Record<string, string>): string {
    try {
      // Step 1: Create a new object without signature field
      const dataToSign: Record<string, string> = {};
      
      // Only copy fields that should be included in the signature
      Object.keys(data).forEach(key => {
        // Skip signature and any undefined/null values
        if (key !== 'signature' && data[key] !== undefined && data[key] !== null) {
          // Convert all values to strings and trim whitespace
          dataToSign[key] = String(data[key]).trim();
        }
      });
      
      // Step 2: Sort the object's keys alphabetically
      const sortedKeys = Object.keys(dataToSign).sort();
      
      // Step 3: Create a URL parameter string
      const queryParts: string[] = [];
      sortedKeys.forEach(key => {
        queryParts.push(`${key}=${dataToSign[key]}`);
      });
      
      const signatureString = queryParts.join('&');
      
      // Step 4: Generate MD5 hash of the parameter string
      return MD5(signatureString).toString(encHex);
    } catch (error) {
      throw new Error(`Failed to generate PayFast signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
