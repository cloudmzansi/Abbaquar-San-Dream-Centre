<?php
// Set headers to handle CORS and JSON responses
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Please use POST.'
    ]);
    exit();
}

// Get the raw POST data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate the data
if (!$data || !isset($data['name']) || !isset($data['email']) || !isset($data['subject']) || !isset($data['message'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields.'
    ]);
    exit();
}

// Basic validation
if (empty($data['name']) || empty($data['email']) || empty($data['subject']) || empty($data['message'])) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required.'
    ]);
    exit();
}

// Validate email format
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email format.'
    ]);
    exit();
}

// Log the submission for debugging
$log_file = __DIR__ . '/contact_log.txt';
$log_message = date('[Y-m-d H:i:s]') . " New contact form submission from: {$data['name']} <{$data['email']}>\n";
file_put_contents($log_file, $log_message, FILE_APPEND);

// Simulate sending an email (since this is a demo/development environment)
// In a real production environment, you would use mail() or a library like PHPMailer

// Create a text file with the submission details
$submissions_dir = __DIR__ . '/submissions';
if (!is_dir($submissions_dir)) {
    mkdir($submissions_dir, 0755, true);
}

$submission_file = $submissions_dir . '/' . date('Y-m-d_H-i-s') . '_' . preg_replace('/[^a-z0-9]/i', '_', $data['name']) . '.txt';
$submission_content = "Name: {$data['name']}\n";
$submission_content .= "Email: {$data['email']}\n";
$submission_content .= "Subject: {$data['subject']}\n";
$submission_content .= "Message:\n{$data['message']}\n";
$submission_content .= "Submitted: " . date('Y-m-d H:i:s') . "\n";

file_put_contents($submission_file, $submission_content);

// Log success
$log_message = date('[Y-m-d H:i:s]') . " Submission saved to: {$submission_file}\n";
file_put_contents($log_file, $log_message, FILE_APPEND);

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Thank you for your message. We\'ll get back to you soon.',
    'details' => [
        'name' => $data['name'],
        'email' => $data['email'],
        'subject' => $data['subject'],
        'timestamp' => date('Y-m-d H:i:s')
    ]
]);
