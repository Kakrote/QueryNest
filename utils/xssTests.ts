/**
 * XSS Testing and Security Validation Utilities
 * This file contains test cases to verify XSS protection is working correctly
 */

// Common XSS attack vectors for testing
export const XSS_TEST_VECTORS = {
  // Basic script injection
  script: '<script>alert("XSS")</script>',
  
  // Event handler injection
  eventHandlers: [
    '<img src="x" onerror="alert(\'XSS\')" />',
    '<div onmouseover="alert(\'XSS\')">hover me</div>',
    '<input type="text" onload="alert(\'XSS\')" />',
    '<body onload="alert(\'XSS\')">content</body>'
  ],
  
  // JavaScript URLs
  javascriptUrls: [
    '<a href="javascript:alert(\'XSS\')">click me</a>',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    '<form action="javascript:alert(\'XSS\')"><input type="submit"></form>'
  ],
  
  // HTML injection
  htmlInjection: [
    '<iframe src="//evil.com"></iframe>',
    '<embed src="//evil.com"></embed>',
    '<object data="//evil.com"></object>',
    '<link rel="stylesheet" href="//evil.com/style.css">',
    '<style>@import url("//evil.com/style.css");</style>'
  ],
  
  // DOM clobbering
  domClobbering: [
    '<form name="document"><input name="cookie"></form>',
    '<img name="createElement" src="x">',
    '<form name="body"><input name="appendChild"></form>'
  ],
  
  // CSS injection
  cssInjection: [
    '<style>body { background: url("javascript:alert(\'XSS\')") }</style>',
    '<div style="background: url(javascript:alert(\'XSS\'))">content</div>',
    '<style>@import "javascript:alert(\'XSS\')";</style>'
  ],
  
  // Encoded payloads
  encoded: [
    '&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;',
    '%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E',
    '&#60;script&#62;alert(&#39;XSS&#39;)&#60;/script&#62;'
  ],
  
  // Bypass attempts
  bypassAttempts: [
    '<SCRIPT>alert("XSS")</SCRIPT>', // Case variation
    '<script>alert`XSS`</script>', // Template literals
    '<script>eval(String.fromCharCode(97,108,101,114,116,40,39,88,83,83,39,41))</script>', // Character codes
    '<<SCRIPT>alert("XSS");//<</SCRIPT>', // Nested tags
    '<script>/**/alert("XSS")/**/</script>', // Comments
    '<script\x20type="text/javascript">alert("XSS")</script>', // Null bytes
    '<img src=x onerror=alert("XSS")>', // No quotes
    '<svg onload=alert("XSS")></svg>', // SVG vectors
    '<math><mtext><mglyph><malignmark><maction onclick=alert("XSS")>', // MathML
    '"><script>alert("XSS")</script>' // Quote breaking
  ]
};

/**
 * Test if content is properly sanitized
 * @param {Function} sanitizeFunction - The sanitization function to test
 * @param {string} content - Content to test
 * @returns {Object} - Test results
 */
export const testSanitization = (sanitizeFunction, content) => {
  try {
    const sanitized = sanitizeFunction(content);
    
    // Check if dangerous patterns are removed
    const dangerousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i,
      /<form[^>]*>/i,
      /<link[^>]*>/i,
      /<style[^>]*>/i,
      /@import/i,
      /expression\s*\(/i,
      /vbscript:/i,
      /data:text\/html/i
    ];
    
    const foundPatterns = dangerousPatterns.filter(pattern => pattern.test(sanitized));
    
    return {
      original: content,
      sanitized: sanitized,
      isSafe: foundPatterns.length === 0,
      foundPatterns: foundPatterns,
      removed: content !== sanitized
    };
  } catch (error) {
    return {
      original: content,
      sanitized: '',
      isSafe: false,
      error: error.message,
      foundPatterns: [],
      removed: true
    };
  }
};

/**
 * Run comprehensive XSS tests
 * @param {Function} sanitizeFunction - The sanitization function to test
 * @returns {Object} - Comprehensive test results
 */
export const runXSSTests = (sanitizeFunction) => {
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    failures: [],
    summary: {}
  };
  
  Object.entries(XSS_TEST_VECTORS).forEach(([category, vectors]) => {
    const categoryResults = {
      passed: 0,
      failed: 0,
      total: 0,
      failures: []
    };
    
    const testVectors = Array.isArray(vectors) ? vectors : [vectors];
    
    testVectors.forEach(vector => {
      const test = testSanitization(sanitizeFunction, vector);
      categoryResults.total++;
      results.total++;
      
      if (test.isSafe) {
        categoryResults.passed++;
        results.passed++;
      } else {
        categoryResults.failed++;
        results.failed++;
        categoryResults.failures.push(test);
        results.failures.push({ category, ...test });
      }
    });
    
    results.summary[category] = categoryResults;
  });
  
  return results;
};

/**
 * Performance test for sanitization function
 * @param {Function} sanitizeFunction - The sanitization function to test
 * @param {number} iterations - Number of iterations to run
 * @returns {Object} - Performance results
 */
export const performanceTest = (sanitizeFunction, iterations = 1000) => {
  const testContent = `
    <div>
      <h1>Test Content</h1>
      <p>This is a <strong>test</strong> with <em>formatting</em>.</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
      <script>alert('XSS')</script>
      <img src="x" onerror="alert('XSS')" />
    </div>
  `;
  
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    sanitizeFunction(testContent);
  }
  
  const end = performance.now();
  const totalTime = end - start;
  
  return {
    iterations,
    totalTime: `${totalTime.toFixed(2)}ms`,
    averageTime: `${(totalTime / iterations).toFixed(4)}ms`,
    operationsPerSecond: Math.round((iterations / totalTime) * 1000)
  };
};

/**
 * Validate that CSP headers are properly set
 * @param {Object} headers - Response headers to check
 * @returns {Object} - CSP validation results
 */
export const validateCSPHeaders = (headers) => {
  const requiredHeaders = [
    'Content-Security-Policy',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Referrer-Policy'
  ];
  
  const results = {
    present: [],
    missing: [],
    valid: true
  };
  
  requiredHeaders.forEach(header => {
    if (headers[header] || headers[header.toLowerCase()]) {
      results.present.push(header);
    } else {
      results.missing.push(header);
      results.valid = false;
    }
  });
  
  return results;
};

/**
 * Generate security report
 * @param {Object} sanitizationResults - Results from XSS tests
 * @param {Object} cspResults - Results from CSP validation
 * @returns {string} - Formatted security report
 */
export const generateSecurityReport = (sanitizationResults, cspResults) => {
  let report = '\n=== XSS SECURITY REPORT ===\n\n';
  
  // Sanitization results
  report += `Sanitization Tests:\n`;
  report += `✅ Passed: ${sanitizationResults.passed}/${sanitizationResults.total}\n`;
  
  if (sanitizationResults.failed > 0) {
    report += `❌ Failed: ${sanitizationResults.failed}\n\n`;
    report += `Failures by category:\n`;
    
    Object.entries(sanitizationResults.summary).forEach(([category, results]) => {
      if (results.failed > 0) {
        report += `  ${category}: ${results.failed}/${results.total} failed\n`;
      }
    });
    
    report += '\nDetailed failures:\n';
    sanitizationResults.failures.forEach((failure, index) => {
      report += `${index + 1}. ${failure.category}: ${failure.original.substring(0, 50)}...\n`;
      report += `   Sanitized: ${failure.sanitized.substring(0, 50)}...\n`;
      report += `   Patterns found: ${failure.foundPatterns.length}\n\n`;
    });
  } else {
    report += `🎉 All sanitization tests passed!\n\n`;
  }
  
  // CSP results
  if (cspResults) {
    report += `Security Headers:\n`;
    if (cspResults.valid) {
      report += `✅ All required security headers are present\n`;
    } else {
      report += `❌ Missing headers: ${cspResults.missing.join(', ')}\n`;
    }
    report += `Present headers: ${cspResults.present.join(', ')}\n\n`;
  }
  
  return report;
};

export default {
  XSS_TEST_VECTORS,
  testSanitization,
  runXSSTests,
  performanceTest,
  validateCSPHeaders,
  generateSecurityReport
};
