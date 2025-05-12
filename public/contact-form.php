<?php
// CORS headers to allow requests from your specific domain
header('Access-Control-Allow-Origin: *'); // In production, replace * with your domain
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}

// Get the raw POST data for JSON requests
$input = json_decode(file_get_contents('php://input'), true);

// Handle both form data and JSON data
$name = isset($input['name']) ? strip_tags($input['name']) : (isset($_POST['name']) ? strip_tags($_POST['name']) : '');
$email = isset($input['email']) ? filter_var($input['email'], FILTER_SANITIZE_EMAIL) : (isset($_POST['email']) ? filter_var($_POST['email'], FILTER_SANITIZE_EMAIL) : '');
$subject = isset($input['subject']) ? strip_tags($input['subject']) : (isset($_POST['subject']) ? strip_tags($_POST['subject']) : 'Contact Form Submission');
$message = isset($input['message']) ? strip_tags($input['message']) : (isset($_POST['message']) ? strip_tags($_POST['message']) : '');

// Validate required fields
if (!$name || !$email || !$message) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields.']);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Invalid email format.']);
    exit;
}

// Spam prevention: Check for common spam patterns
$spamKeywords = ['viagra', 'casino', 'lottery', 'prize', 'winner', 'buy now', 'free money'];
foreach ($spamKeywords as $keyword) {
    if (stripos($message, $keyword) !== false || stripos($subject, $keyword) !== false) {
        echo json_encode(['success' => false, 'error' => 'Message contains prohibited content.']);
        exit;
    }
}

// Log the submission for debugging
$log_file = __DIR__ . '/contact_log.txt';
$log_message = date('[Y-m-d H:i:s]') . " New contact form submission from: {$name} <{$email}>\n";
file_put_contents($log_file, $log_message, FILE_APPEND);

// Recipient email address
$to = 'andrewmichaelsrsa@gmail.com';

// Set the sender email with proper domain to avoid spam filters
$senderEmail = 'noreply@abbaquar-sandreamcentre.co.za';
$senderName = 'Abbaquar-san Dream Centre';

// Create HTML email template
$htmlMessage = '
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>New Contact Form Message</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="background-color: #073366; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Message from Abbaquar-san Dream Centre</h1>
    </div>
    
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #073366; margin-top: 0; border-bottom: 2px solid #8A4BA3; padding-bottom: 10px;">Contact Details</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <td style="padding: 10px 0; color: #666; width: 100px;">Name:</td>
                    <td style="padding: 10px 0; color: #073366; font-weight: bold;">' . htmlspecialchars($name) . '</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; color: #666;">Email:</td>
                    <td style="padding: 10px 0; color: #073366;">
                        <a href="mailto:' . htmlspecialchars($email) . '" style="color: #8A4BA3; text-decoration: none;">' . htmlspecialchars($email) . '</a>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; color: #666;">Subject:</td>
                    <td style="padding: 10px 0; color: #073366;">' . htmlspecialchars($subject) . '</td>
                </tr>
            </table>
            
            <h2 style="color: #073366; border-bottom: 2px solid #8A4BA3; padding-bottom: 10px;">Message</h2>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
                <p style="margin: 0; white-space: pre-wrap;">' . nl2br(htmlspecialchars($message)) . '</p>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 14px;">
            <p>This email was sent from the contact form on Abbaquar-san Dream Centre website.</p>
            <p>Please reply directly to the sender\'s email: ' . htmlspecialchars($email) . '</p>
        </div>
    </div>
</body>
</html>';

// Create plain text version for email clients that don't support HTML
$plainMessage = "New message from Abbaquar-san Dream Centre website\n\n" .
               "Name: $name\n" .
               "Email: $email\n" .
               "Subject: $subject\n\n" .
               "Message:\n$message\n\n" .
               "Please reply directly to the sender's email: $email";

// Email headers with proper sender address to reduce spam likelihood
$boundary = md5(time());
$headers = "From: $senderName <$senderEmail>\r\n" .
           "Reply-To: $name <$email>\r\n" .
           "X-Sender: $senderEmail\r\n" .
           "Return-Path: $senderEmail\r\n" .
           "Organization: Abbaquar-san Dream Centre\r\n" .
           "X-Priority: 3\r\n" .
           "X-Mailer: PHP/" . phpversion() . "\r\n" .
           "MIME-Version: 1.0\r\n" .
           "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";

// Email body
$body = "--$boundary\r\n" .
        "Content-Type: text/plain; charset=UTF-8\r\n" .
        "Content-Transfer-Encoding: base64\r\n\r\n" .
        chunk_split(base64_encode($plainMessage)) . "\r\n" .
        "--$boundary\r\n" .
        "Content-Type: text/html; charset=UTF-8\r\n" .
        "Content-Transfer-Encoding: base64\r\n\r\n" .
        chunk_split(base64_encode($htmlMessage)) . "\r\n" .
        "--$boundary--";

// Add a unique message ID to further reduce spam likelihood
$messageId = '<' . time() . '.' . md5($email . $subject) . '@abbaquar-sandreamcentre.co.za>';
$headers .= "Message-ID: $messageId\r\n";

// Try to send the email
$success = mail($to, $subject, $body, $headers);

// Log the result
$log_message = date('[Y-m-d H:i:s]') . " Email " . ($success ? "sent successfully" : "failed to send") . "\n";
file_put_contents($log_file, $log_message, FILE_APPEND);

// Return JSON response
if ($success) {
    echo json_encode(['success' => true, 'message' => 'Your message has been sent successfully.']);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to send email. Please try again later.']);
}
