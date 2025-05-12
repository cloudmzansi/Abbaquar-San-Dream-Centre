# EmailJS Setup Guide for Contact Form

This guide will help you set up EmailJS to handle your contact form submissions. EmailJS is a client-side service that allows you to send emails directly from JavaScript without requiring a server.

## Step 1: Create an EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/) and sign up for a free account
2. The free plan allows 200 emails per month, which should be sufficient for most small websites

## Step 2: Create an Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps to connect your email account
5. Name your service (e.g., "abbaquar_contact_service")
6. Note the **Service ID** - you'll need this for your code

## Step 3: Create an Email Template

1. In your EmailJS dashboard, go to "Email Templates"
2. Click "Create New Template"
3. Design your email template with the following variables:
   - `{{from_name}}` - The name of the person submitting the form
   - `{{from_email}}` - The email of the person submitting the form
   - `{{subject}}` - The subject of the message
   - `{{message}}` - The message content
4. Set the "To Email" as the email address where you want to receive contact form submissions
5. Name your template (e.g., "contact_form_template")
6. Note the **Template ID** - you'll need this for your code

## Step 4: Update Your Code

1. Open `/src/utils/emailService.ts`
2. Update the following constants with your actual EmailJS IDs:
   ```typescript
   const SERVICE_ID = 'your_service_id'; // Replace with your EmailJS service ID
   const TEMPLATE_ID = 'your_template_id'; // Replace with your EmailJS template ID
   const PUBLIC_KEY = 'your_public_key'; // Replace with your EmailJS public key
   ```
3. You can find your **Public Key** in your EmailJS dashboard under "Account" > "API Keys"

## Step 5: Test the Form

1. Run your website locally
2. Fill out the contact form and submit it
3. Check that you receive the email at your designated address
4. Verify that the form doesn't scroll to the top after submission

## Troubleshooting

If you encounter issues:

1. **Emails not sending**: 
   - Check the browser console for errors
   - Verify your SERVICE_ID, TEMPLATE_ID, and PUBLIC_KEY are correct
   - Make sure your email template variables match those in the code

2. **Form still scrolling to top**:
   - The current implementation includes code to prevent this, but if it persists, you may need to adjust the form's scroll behavior

3. **Rate limiting**:
   - The free plan has limits on emails per month
   - Consider upgrading if you need more capacity

## Benefits of EmailJS

- No server-side code required
- Works directly in the browser
- Simple setup and maintenance
- Reliable email delivery
- Good free tier for small websites

For more information, visit the [EmailJS Documentation](https://www.emailjs.com/docs/).
