#!/usr/bin/env node

/**
 * PayFast ITN Donation Tracking Setup
 * 
 * This script provides instructions for setting up the donation tracking system.
 */

console.log(`
🚀 PayFast ITN Donation Tracking Setup
=====================================

To enable donation tracking with PayFast ITN (Instant Transaction Notification):

1. RUN THE MIGRATION:
   Go to your Supabase dashboard > SQL Editor and run:
   
   -- Copy and paste the contents of:
   -- supabase/migrations/20250512_create_donations_table.sql
   
   This creates the donations table for storing completed payments.

2. CONFIGURE PAYFAST ITN:
   In your PayFast merchant account:
   - Go to Settings > Integration
   - Set ITN URL to: https://your-domain.com/api/payfast-itn
   - Enable ITN notifications
   - Save settings

3. UPDATE ENVIRONMENT VARIABLES:
   Add to your .env file:
   VITE_BASE_URL=https://your-domain.com
   VITE_PAYFAST_PASSPHRASE=your-payfast-passphrase

4. DEPLOY THE API ENDPOINT:
   The api/payfast-itn.ts file will be deployed as a serverless function
   when you deploy to Vercel/Netlify.

5. TEST THE SYSTEM:
   - Make a test donation
   - Check the donations table in Supabase
   - Verify analytics show completed donations

📊 What this enables:
- Real donation completion tracking
- Accurate conversion rates
- Actual donation amounts in analytics
- Payment method tracking
- Donor information (if provided)

The system will now track:
✅ Donation attempts (when users click donate)
✅ Completed donations (when payments succeed)
✅ Conversion rates
✅ Actual donation amounts
✅ Payment methods used

Need help? Check the PayFast ITN documentation:
https://developers.payfast.co.za/docs#instant_transaction_notification_itn
`); 