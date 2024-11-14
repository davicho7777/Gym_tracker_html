<?php
header('Content-Type: application/json');

// Allow requests only from your domain
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get POST data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['users'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
    exit;
}

// Path to your users.json file
$file = 'users.json';

// Save the updated users data
$success = file_put_contents($file, json_encode(['users' => $data['users']], JSON_PRETTY_PRINT));

if ($success === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save users']);
    exit;
}

echo json_encode(['success' => true]);
?>
