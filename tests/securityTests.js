/**
 * Security Test Suite
 * Run these tests to verify XSS protection is working properly
 */

import { sanitizeHtml, sanitizeUserInput, stripHtml, escapeHtml, sanitizeUrl } from '../utils/sanitize';

// Test cases for XSS attacks
const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src="x" onerror="alert(\'XSS\')" />',
  '<svg onload="alert(\'XSS\')" />',
  '<iframe src="javascript:alert(\'XSS\')"></iframe>',
  '<a href="javascript:alert(\'XSS\')">Click me</a>',
  '<div onclick="alert(\'XSS\')">Click me</div>',
  '<input onfocus="alert(\'XSS\')" value="test" />',
  '"><script>alert("XSS")</script>',
  "';alert('XSS');//",
  '<style>body{background-image:url("javascript:alert(\'XSS\')")}</style>',
  '<object data="javascript:alert(\'XSS\')"></object>',
  '<embed src="javascript:alert(\'XSS\')"></embed>',
  '<link rel="stylesheet" href="javascript:alert(\'XSS\')">',
  '<meta http-equiv="refresh" content="0;url=javascript:alert(\'XSS\')">'
];

// Test malicious URLs
const maliciousUrls = [
  'javascript:alert("XSS")',
  'vbscript:alert("XSS")',
  'data:text/html,<script>alert("XSS")</script>',
  'http://example.com/<script>alert("XSS")</script>',
  'https://example.com?redirect=javascript:alert("XSS")'
];

/**
 * Test sanitizeHtml function
 */
export function testSanitizeHtml() {
  const results = [];
  
  console.log('🧪 Testing sanitizeHtml function...');
  
  xssPayloads.forEach((payload, index) => {
    const sanitized = sanitizeHtml(payload);
    const containsScript = sanitized.toLowerCase().includes('<script') || 
                          sanitized.toLowerCase().includes('javascript:') ||
                          sanitized.toLowerCase().includes('onerror') ||
                          sanitized.toLowerCase().includes('onload');
    
    results.push({
      test: `XSS Payload ${index + 1}`,
      input: payload,
      output: sanitized,
      passed: !containsScript,
      dangerous: containsScript
    });
  });
  
  return results;
}

/**
 * Test sanitizeUserInput function
 */
export function testSanitizeUserInput() {
  const results = [];
  
  console.log('🧪 Testing sanitizeUserInput function...');
  
  xssPayloads.forEach((payload, index) => {
    const sanitized = sanitizeUserInput(payload);
    const containsDangerous = sanitized.includes('<') || 
                             sanitized.includes('>') ||
                             sanitized.includes('javascript:') ||
                             sanitized.includes('script');
    
    results.push({
      test: `User Input ${index + 1}`,
      input: payload,
      output: sanitized,
      passed: !containsDangerous,
      dangerous: containsDangerous
    });
  });
  
  return results;
}

/**
 * Test sanitizeUrl function
 */
export function testSanitizeUrl() {
  const results = [];
  
  console.log('🧪 Testing sanitizeUrl function...');
  
  maliciousUrls.forEach((url, index) => {
    const sanitized = sanitizeUrl(url);
    const isBlocked = sanitized === '';
    
    results.push({
      test: `Malicious URL ${index + 1}`,
      input: url,
      output: sanitized,
      passed: isBlocked,
      dangerous: !isBlocked
    });
  });
  
  // Test valid URLs
  const validUrls = [
    'https://example.com',
    'http://localhost:3000',
    '/relative/path',
    '#anchor',
    'mailto:test@example.com'
  ];
  
  validUrls.forEach((url, index) => {
    const sanitized = sanitizeUrl(url);
    const isAllowed = sanitized !== '';
    
    results.push({
      test: `Valid URL ${index + 1}`,
      input: url,
      output: sanitized,
      passed: isAllowed,
      dangerous: false
    });
  });
  
  return results;
}

/**
 * Run all security tests
 */
export function runSecurityTests() {
  console.log('🔒 Running QueryNest Security Tests...\n');
  
  const htmlTests = testSanitizeHtml();
  const inputTests = testSanitizeUserInput();
  const urlTests = testSanitizeUrl();
  
  const allTests = [...htmlTests, ...inputTests, ...urlTests];
  const passed = allTests.filter(test => test.passed).length;
  const failed = allTests.filter(test => !test.passed).length;
  const dangerous = allTests.filter(test => test.dangerous).length;
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Potentially Dangerous: ${dangerous}`);
  
  if (dangerous > 0) {
    console.log('\n🚨 DANGEROUS OUTPUTS DETECTED:');
    allTests.filter(test => test.dangerous).forEach(test => {
      console.log(`- ${test.test}: "${test.output}"`);
    });
  }
  
  if (failed === 0 && dangerous === 0) {
    console.log('\n🎉 All security tests passed! Your application is protected against XSS attacks.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the sanitization functions.');
  }
  
  return {
    total: allTests.length,
    passed,
    failed,
    dangerous,
    details: allTests
  };
}

// Example of how to use in browser console or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  window.runQueryNestSecurityTests = runSecurityTests;
  console.log('🔒 QueryNest Security Tests loaded. Run window.runQueryNestSecurityTests() to test.');
} else {
  // Node.js environment
  module.exports = {
    runSecurityTests,
    testSanitizeHtml,
    testSanitizeUserInput,
    testSanitizeUrl
  };
}
