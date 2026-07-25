<?php
/**
 * Coronado's Painting — Live Yelp Rating Proxy
 *
 * Browser JavaScript cannot call Yelp's Business API directly — Yelp blocks
 * cross-origin (CORS) requests from browsers so API keys can't be exposed in
 * page source. This script runs server-side, calls Yelp on the website's
 * behalf, and caches the result so we're not hitting Yelp's API on every
 * single page load (and so the page keeps working if Yelp is briefly down).
 *
 * app.js fetches this file (same-origin, so no CORS issue) and fills the
 * live rating into the Yelp card on the page.
 *
 * SETUP:
 *   1. Get a Yelp Places API key at https://business.yelp.com/data
 *      (requires choosing a plan / starting a trial — see the website review
 *      notes for context on this).
 *   2. Paste that key below in place of YOUR_YELP_API_KEY_HERE.
 *   3. Confirm YELP_BUSINESS_ALIAS matches your Yelp business page slug
 *      (the part after /biz/ in your Yelp URL — currently set to match
 *      https://www.yelp.com/biz/coronados-painting-roseville).
 *   4. Upload this file to the same folder as index.html on your live host.
 *      It must be a PHP-enabled host (the same one the quote form uses).
 *
 * Until step 2 is done, this script responds with an error and index.html's
 * static "5.0 Rating" fallback stays on screen — nothing breaks.
 */

header('Content-Type: application/json');

// ── Configuration ────────────────────────────────────────────────────────
const YELP_API_KEY          = 'YOUR_YELP_API_KEY_HERE'; // <-- paste your key here
const YELP_BUSINESS_ALIAS   = 'coronados-painting-roseville'; // yelp.com/biz/<this>
const CACHE_FILE            = __DIR__ . '/yelp-cache.json';
const CACHE_LIFETIME_SECONDS = 86400; // 24 hours — keeps us well under Yelp's rate limits

// ── Serve cached data if it's still fresh ──────────────────────────────────
if (file_exists(CACHE_FILE)) {
    $cached = json_decode(file_get_contents(CACHE_FILE), true);
    if ($cached && isset($cached['fetched_at']) && (time() - $cached['fetched_at']) < CACHE_LIFETIME_SECONDS) {
        echo json_encode($cached);
        exit;
    }
}

// ── Not configured yet: fail quietly so the page's static fallback shows ──
if (YELP_API_KEY === 'YOUR_YELP_API_KEY_HERE') {
    http_response_code(503);
    echo json_encode(['error' => 'Yelp API key not configured yet']);
    exit;
}

// ── Fetch fresh data from Yelp's Business Details endpoint ────────────────
$ch = curl_init('https://api.yelp.com/v3/businesses/' . rawurlencode(YELP_BUSINESS_ALIAS));
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . YELP_API_KEY,
        'Accept: application/json',
    ],
    CURLOPT_TIMEOUT => 8,
]);
$response = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $httpCode !== 200) {
    // Yelp call failed — serve stale cache if we have one rather than showing nothing
    if (file_exists(CACHE_FILE)) {
        echo file_get_contents(CACHE_FILE);
    } else {
        http_response_code(502);
        echo json_encode([
            'error' => 'Unable to reach Yelp API',
            'detail' => $curlError ?: ('HTTP ' . $httpCode),
        ]);
    }
    exit;
}

$data = json_decode($response, true);

$result = [
    'rating'       => $data['rating'] ?? null,
    'review_count' => $data['review_count'] ?? null,
    'url'          => $data['url'] ?? ('https://www.yelp.com/biz/' . YELP_BUSINESS_ALIAS),
    'fetched_at'   => time(),
];

file_put_contents(CACHE_FILE, json_encode($result));
echo json_encode($result);
