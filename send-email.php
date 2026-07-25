<?php
/**
 * Coronado's Painting - Form Mailer Script
 *
 * NOTE: As of this update, the quote form on index.html submits directly to
 * Web3Forms (https://web3forms.com) via JavaScript instead of posting here.
 * This file is no longer wired up and is kept only as a reference/fallback —
 * it can be safely deleted once Web3Forms delivery is confirmed working.
 */

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 1. Spam honeypot protection
    if (!empty($_POST['honeypot'])) {
        // Silent redirect for spambots
        header("Location: index.html");
        exit;
    }

    // 2. Extract & Sanitize inputs
    $firstName   = filter_input(INPUT_POST, 'first_name', FILTER_DEFAULT);
    $lastName    = filter_input(INPUT_POST, 'last_name', FILTER_DEFAULT);
    $address     = filter_input(INPUT_POST, 'address', FILTER_DEFAULT);
    $email       = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $phone       = filter_input(INPUT_POST, 'phone', FILTER_DEFAULT);
    $serviceType = filter_input(INPUT_POST, 'service_type', FILTER_DEFAULT);
    $details     = filter_input(INPUT_POST, 'details', FILTER_DEFAULT);

    // Clean formatting
    $firstName   = strip_tags(trim($firstName));
    $lastName    = strip_tags(trim($lastName));
    $address     = strip_tags(trim($address));
    $phone       = strip_tags(trim($phone));
    $serviceType = strip_tags(trim($serviceType));
    $details     = strip_tags(trim($details));

    $name = $firstName . ' ' . $lastName;

    // 3. Email Configurations
    $to = "coronadoli_ramon@hotmail.com";
    $subject = "New Estimate Request: " . $name . " [" . ucfirst($serviceType) . "]";

    // Build Email Body text
    $body = "Coronado's Painting - New Website Lead\r\n";
    $body .= "==================================================\r\n\r\n";
    $body .= "CLIENT CONTACT INFO:\r\n";
    $body .= "--------------------------------------------------\r\n";
    $body .= "Name:    " . $name . "\r\n";
    $body .= "Address: " . $address . "\r\n";
    $body .= "Email:   " . ($email ? $email : "Not Provided/Invalid") . "\r\n";
    $body .= "Phone:   " . $phone . "\r\n\r\n";
    $body .= "PROJECT INTEREST:\r\n";
    $body .= "--------------------------------------------------\r\n";
    $body .= "Service: " . str_replace('-', ' ', ucfirst($serviceType)) . "\r\n\r\n";
    $body .= "PROJECT DETAILS & DESCRIPTION:\r\n";
    $body .= "--------------------------------------------------\r\n";
    $body .= $details . "\r\n\r\n";
    $body .= "==================================================\r\n";
    $body .= "Sent from coronado-painting.com on " . date('Y-m-d H:i:s') . "\r\n";

    // Build secure email headers
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/plain; charset=UTF-8\r\n";
    $headers .= "From: Coronado Website Form <no-reply@coronado-painting.com>\r\n";
    if ($email) {
        $headers .= "Reply-To: " . $email . "\r\n";
    }

    // 4. Send Email & Redirect
    if (mail($to, $subject, $body, $headers)) {
        // Redirect back passing success and custom display parameters
        $redirectUrl = "index.html?status=success&name=" . urlencode($firstName) . "&contact=" . urlencode($phone);
        header("Location: " . $redirectUrl);
        exit;
    } else {
        // Fail-safe redirect if PHP mailer environment fails
        header("Location: index.html?status=error");
        exit;
    }
} else {
    // If accessed directly without POST, redirect back home
    header("Location: index.html");
    exit;
}
?>
