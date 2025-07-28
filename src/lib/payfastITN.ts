import MD5 from 'crypto-js/md5';
import encHex from 'crypto-js/enc-hex';
import { supabase } from './supabase';


export interface PayFastITNData {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: string;
  item_name: string;
  item_description?: string;
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
  name_first: string;
  name_last: string;
  email_address: string;
  merchant_id: string;
  merchant_key: string;
  signature: string;
  [key: string]: string; // Allow for additional fields
}

export class PayFastITNService {
  private readonly merchantId: string;
  private readonly merchantKey: string;
  private readonly passphrase: string;

  constructor(merchantId: string, merchantKey: string, passphrase: string) {
    this.merchantId = merchantId;
    this.merchantKey = merchantKey;
    this.passphrase = passphrase;
  }

  /**
   * Verify the ITN signature from PayFast
   */
  verifySignature(data: PayFastITNData): boolean {
    try {
      // Get the signature from the data
      const receivedSignature = data.signature;
      
      // Create a copy of data without the signature
      const dataToVerify: Record<string, string> = {};
      Object.keys(data).forEach(key => {
        if (key !== 'signature') {
          dataToVerify[key] = data[key];
        }
      });

      // Generate our own signature
      const calculatedSignature = this.generateSignature(dataToVerify);
      
      // Compare signatures
      return receivedSignature === calculatedSignature;
    } catch (error) {
      console.error('Error verifying PayFast signature:', error);
      return false;
    }
  }

  /**
   * Generate MD5 signature for verification
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

  /**
   * Process ITN data and store donation record
   */
  async processITN(data: PayFastITNData): Promise<{ success: boolean; message: string }> {
    try {
      // Verify the signature first
      if (!this.verifySignature(data)) {
        console.error('PayFast ITN signature verification failed');
        return { success: false, message: 'Invalid signature' };
      }

      // Remove all code that queries or inserts into the donations table. If this breaks the flow, add a comment or placeholder for future payment handling.


      console.log(`Successfully processed donation: ${data.pf_payment_id}`);
      return { success: true, message: 'Payment processed successfully' };

    } catch (error) {
      console.error('Error processing PayFast ITN:', error);
      return { success: false, message: 'Internal server error' };
    }
  }
}

// Export a singleton instance
export const payfastITN = new PayFastITNService(
  import.meta.env.VITE_PAYFAST_MERCHANT_ID || '',
  import.meta.env.VITE_PAYFAST_MERCHANT_KEY || '',
  import.meta.env.VITE_PAYFAST_PASSPHRASE || ''
); 