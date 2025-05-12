<?php
// Set CORS headers to allow requests from your domain
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// If it's a preflight OPTIONS request, just return with OK status
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['name']) || !isset($data['email']) || !isset($data['subject']) || !isset($data['message'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

// Basic validation
if (empty($data['name']) || empty($data['email']) || empty($data['subject']) || empty($data['message'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit();
}

// Validate email
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

// Set up the email
$to = 'info@abbaquar-sandream.org'; // Replace with your email address
$subject = 'Contact Form: ' . htmlspecialchars($data['subject']);

// Create email body with HTML formatting
$message = '<html><body>';
$message .= '<h2>Contact Form Submission</h2>';
$message .= '<p><strong>Name:</strong> ' . htmlspecialchars($data['name']) . '</p>';
$message .= '<p><strong>Email:</strong> ' . htmlspecialchars($data['email']) . '</p>';
$message .= '<p><strong>Subject:</strong> ' . htmlspecialchars($data['subject']) . '</p>';
$message .= '<p><strong>Message:</strong></p>';
$message .= '<p>' . nl2br(htmlspecialchars($data['message'])) . '</p>';
$message .= '<p><em>This message was sent from the contact form on your website.</em></p>';
$message .= '</body></html>';

// Email headers
$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: ' . htmlspecialchars($data['name']) . ' <' . htmlspecialchars($data['email']) . '>',
    'Reply-To: ' . htmlspecialchars($data['email']),
    'X-Mailer: PHP/' . phpversion()
];

// Debug logging
$logFile = __DIR__ . '/email-log.txt';
$logMessage = date('[Y-m-d H:i:s]') . " Attempting to send email from {$data['email']} to {$to}\n";
file_put_contents($logFile, $logMessage, FILE_APPEND);

// Send the email
$success = mail($to, $subject, $message, implode("\r\n", $headers));

if ($success) {
    // Log success
    $logMessage = date('[Y-m-d H:i:s]') . " Email sent successfully\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Your message has been sent successfully!'
    ]);
} else {
    // Log error
    $error = error_get_last();
    $logMessage = date('[Y-m-d H:i:s]') . " Failed to send email. Error: " . ($error ? json_encode($error) : 'Unknown error') . "\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send the message. Please try again later.'
    ]);
}
