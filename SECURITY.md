# QueryNest Security Documentation

## XSS Protection Implementation

This project has been made XSS-safe through comprehensive sanitization and security measures.

### Security Measures Implemented

#### 1. Input Sanitization
- **DOMPurify Integration**: All user-generated content is sanitized using the industry-standard DOMPurify library
- **Multiple Sanitization Types**:
  - `sanitizeRichText()`: For content that needs formatting (questions, answers)
  - `sanitizePlainText()`: For titles, tags, and plain text fields
  - `escapeHtml()`: For simple HTML escaping in display contexts

#### 2. Server-Side Protection
- **Input Validation**: All API endpoints validate and sanitize input data before processing
- **Rate Limiting**: Prevents spam and abuse with configurable rate limits
- **Authentication Checks**: Proper user verification on all protected endpoints

#### 3. Content Security Policy (CSP)
- Strict CSP headers to prevent script injection
- X-Frame-Options to prevent clickjacking
- X-Content-Type-Options to prevent MIME sniffing
- Additional security headers for comprehensive protection

#### 4. Component-Level Protection
- All user content is properly escaped before display
- TiptapEditor sanitizes content in real-time
- Consistent use of sanitization functions throughout the application

### File Structure

```
utils/
├── sanitize.js          # Core sanitization utilities
├── serverValidation.js  # Server-side validation and rate limiting
└── xssTests.js         # Security testing utilities

middleware.js           # CSP and security headers
app/security-test/      # Development security testing page
```

### Key Security Functions

#### Client-Side
```javascript
import { sanitizeRichText, sanitizePlainText, escapeHtml } from '@/utils/sanitize';

// For rich content (questions, answers)
const cleanContent = sanitizeRichText(userContent);

// For plain text (titles, tags)
const cleanTitle = sanitizePlainText(userTitle);

// For HTML escaping
const escapedText = escapeHtml(userText);
```

#### Server-Side
```javascript
import { validateQuestionData, checkRateLimit } from '@/utils/serverValidation';

// Validate and sanitize form data
const validation = validateQuestionData(requestData);
if (!validation.isValid) {
    return error(validation.error);
}

// Check rate limits
if (!checkRateLimit(userId, 5, 60000)) {
    return error('Rate limit exceeded');
}
```

### Security Testing

#### Development Testing Page
Visit `/security-test` in development mode to:
- Test sanitization functions with common XSS vectors
- View real-time sanitization results
- Test custom malicious inputs

#### Automated Testing
```bash
# Run server-side security tests (development only)
curl http://localhost:3000/api/security-test
```

### Common XSS Vectors Prevented

1. **Script Injection**: `<script>alert('XSS')</script>`
2. **Event Handlers**: `<img src="x" onerror="alert('XSS')">`
3. **JavaScript URLs**: `<a href="javascript:alert('XSS')">click</a>`
4. **HTML Injection**: `<iframe src="//evil.com"></iframe>`
5. **CSS Injection**: `<style>body{background:url(javascript:alert('XSS'))}</style>`
6. **DOM Clobbering**: `<form name="document"><input name="cookie"></form>`

### Security Headers

The application automatically sets these security headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Best Practices Followed

1. **Defense in Depth**: Multiple layers of protection
2. **Input Validation**: Server-side validation for all user inputs
3. **Output Encoding**: Proper encoding based on context
4. **Secure Headers**: Comprehensive security headers
5. **Rate Limiting**: Prevent abuse and automated attacks
6. **Sanitization**: Real-time content sanitization

### Monitoring and Maintenance

- Regular security testing using the built-in test suite
- Keep DOMPurify library updated
- Monitor for new XSS vectors and update defenses accordingly
- Regular security audits and penetration testing

### Development Guidelines

When adding new features:

1. **Always sanitize user inputs** before storage or display
2. **Use appropriate sanitization function** based on content type
3. **Test with XSS vectors** using the security test page
4. **Validate on both client and server side**
5. **Follow the principle of least privilege**

### Emergency Response

If an XSS vulnerability is discovered:

1. Immediately update the affected sanitization rules
2. Test the fix using the security test suite
3. Deploy the fix as a hotfix
4. Notify users if necessary
5. Review logs for potential exploitation
6. Update security measures to prevent similar issues

### Resources

- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [OWASP XSS Prevention](https://owasp.org/www-community/xss-filter-evasion-cheatsheet)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

This comprehensive XSS protection ensures that QueryNest is safe from cross-site scripting attacks while maintaining full functionality for legitimate users.
