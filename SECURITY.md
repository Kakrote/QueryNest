# Security Guidelines for QueryNest

## XSS Protection Implementation

This document outlines the security measures implemented to protect against Cross-Site Scripting (XSS) attacks and other security vulnerabilities.

## 1. Input Sanitization

### Client-Side Sanitization
- **DOMPurify**: Used for client-side HTML sanitization in `utils/sanitize.js`
- **Server-Side Sanitization**: Implemented using `isomorphic-dompurify` and `jsdom` for SSR compatibility
- **User Input Sanitization**: All user-generated content is sanitized before display

### Sanitization Functions
- `sanitizeHtml()`: Sanitizes HTML content while preserving safe formatting
- `stripHtml()`: Removes all HTML tags and returns plain text
- `escapeHtml()`: Escapes HTML special characters
- `sanitizeUserInput()`: Combines stripping and escaping for user text content
- `sanitizeUrl()`: Validates and sanitizes URLs to prevent malicious protocols

## 2. Content Security Policy (CSP)

Implemented in `next.config.mjs` with the following directives:
- `default-src 'self'`: Only allow content from same origin
- `script-src`: Controlled script execution
- `style-src`: Allow styles from self and Google Fonts
- `img-src`: Allow images from self, data URLs, and HTTPS
- `frame-src 'none'`: Prevent iframe embedding
- `object-src 'none'`: Prevent object/embed tags

## 3. Security Headers

The following security headers are automatically added:
- `X-Content-Type-Options: nosniff`: Prevent MIME type sniffing
- `X-Frame-Options: DENY`: Prevent clickjacking
- `X-XSS-Protection: 1; mode=block`: Enable XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin`: Control referrer information
- `Permissions-Policy`: Restrict access to sensitive APIs

## 4. Component-Level Security

### TiptapEditor
- Sanitizes content on input and output
- Prevents malicious paste operations
- Restricts allowed HTML tags and attributes

### Data Display Components
All components displaying user content use `sanitizeUserInput()`:
- `QuestionCard`: Sanitizes title, content, tags, and author names
- `AnswerCard`: Sanitizes answer content and metadata
- `Answer`: Sanitizes rich text content using `sanitizeHtml()`
- Question detail pages: Sanitizes all displayed content

## 5. Form Validation

### Validation System (`utils/validation.js`)
- Input validation rules for different field types
- Automatic sanitization during validation
- Rate limiting to prevent abuse
- Schema-based form validation

### Validation Rules
- **Email**: RFC-compliant email validation
- **Username**: Alphanumeric with hyphens/underscores, 3-20 characters
- **Password**: Minimum 8 characters with complexity requirements
- **Title**: 5-200 characters
- **Content**: 10-10,000 characters
- **Tags**: Letters, numbers, commas, and spaces only

## 6. Rate Limiting

Implemented basic rate limiting for:
- Login attempts: 5 per 15 minutes
- Question creation: 10 per 15 minutes
- Answer creation: 20 per 15 minutes
- Voting: 100 per 15 minutes

## 7. Best Practices for Developers

### When Adding New Features:

1. **Always sanitize user input**:
   ```javascript
   import { sanitizeUserInput } from '@/utils/sanitize';
   const safeContent = sanitizeUserInput(userInput);
   ```

2. **Use proper display methods**:
   - For plain text: `{sanitizeUserInput(content)}`
   - For rich HTML: `dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}`

3. **Validate URLs**:
   ```javascript
   import { sanitizeUrl } from '@/utils/sanitize';
   const safeUrl = sanitizeUrl(userProvidedUrl);
   ```

4. **Use form validation**:
   ```javascript
   import { validateAndSanitizeForm, formSchemas } from '@/utils/validation';
   const result = validateAndSanitizeForm(formData, formSchemas.question);
   ```

### Never Do:
- ❌ Direct insertion of user content: `{userContent}`
- ❌ Using `dangerouslySetInnerHTML` without sanitization
- ❌ Trusting user-provided URLs without validation
- ❌ Accepting unlimited input lengths
- ❌ Allowing arbitrary HTML tags and attributes

### Always Do:
- ✅ Sanitize all user input before display
- ✅ Validate input on both client and server
- ✅ Use Content Security Policy headers
- ✅ Implement rate limiting for sensitive operations
- ✅ Log security events for monitoring

## 8. Dependencies

Security-related packages installed:
- `dompurify`: Client-side HTML sanitization
- `isomorphic-dompurify`: Server-side HTML sanitization
- `jsdom`: DOM implementation for server-side sanitization

## 9. Testing Security

### Manual Testing Checklist:
- [ ] Try inserting `<script>alert('XSS')</script>` in all input fields
- [ ] Test with malicious URLs like `javascript:alert('XSS')`
- [ ] Verify CSP headers are properly set
- [ ] Test rate limiting functionality
- [ ] Verify sanitization in all user content display areas

### Common XSS Payloads to Test:
```html
<script>alert('XSS')</script>
<img src="x" onerror="alert('XSS')">
<svg onload="alert('XSS')">
<iframe src="javascript:alert('XSS')"></iframe>
<a href="javascript:alert('XSS')">Click me</a>
```

## 10. Monitoring and Logging

Consider implementing:
- Security event logging
- Failed validation attempt tracking
- Rate limit violation alerts
- Content Security Policy violation reporting

## 11. Regular Security Updates

- Keep all dependencies updated
- Regularly audit packages with `npm audit`
- Review and update CSP policies as needed
- Monitor for new security vulnerabilities
- Update sanitization rules as threats evolve

## 12. Emergency Response

If an XSS vulnerability is discovered:
1. Immediately patch the vulnerable code
2. Review all similar code patterns
3. Update sanitization rules if needed
4. Consider notifying users if data may have been compromised
5. Review logs for potential exploitation attempts

---

**Remember**: Security is an ongoing process, not a one-time implementation. Regularly review and update these measures as the application evolves.
