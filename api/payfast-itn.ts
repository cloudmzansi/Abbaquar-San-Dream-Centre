import { NextApiRequest, NextApiResponse } from 'next';
import { payfastITN } from '../src/lib/payfastITN';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the ITN data from the request body
    const itnData = req.body;

    // Validate required fields
    if (!itnData.pf_payment_id || !itnData.payment_status || !itnData.signature) {
      console.error('Missing required ITN fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Process the ITN data
    const result = await payfastITN.processITN(itnData);

    if (result.success) {
      // Return success response to PayFast
      return res.status(200).json({ status: 'OK' });
    } else {
      console.error('ITN processing failed:', result.message);
      return res.status(400).json({ error: result.message });
    }

  } catch (error) {
    console.error('Error processing PayFast ITN:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 