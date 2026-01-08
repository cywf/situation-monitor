# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of SA-DASH seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories** (Preferred)
   - Go to the [Security tab](https://github.com/cywf/sa-dash/security/advisories)
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Direct Contact**
   - Email: (Add appropriate contact email)
   - Include "SA-DASH Security" in the subject line

### What to Include

Please include the following information:

- **Type of vulnerability** (XSS, injection, etc.)
- **Location** (file path, function name, line number)
- **Steps to reproduce** the vulnerability
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up

### What to Expect

- **Acknowledgment:** Within 48 hours
- **Initial assessment:** Within 5 business days
- **Status updates:** Weekly until resolved
- **Credit:** Security researchers will be credited (if desired)

## Security Measures

### Current Security Practices

1. **XSS Prevention**
   - All user input is sanitized using `escapeHtml()`
   - No use of `eval()` or `Function()` constructors
   - HTML injection prevention in all renderers

2. **Content Security**
   - External scripts only from trusted CDNs
   - No inline event handlers (except onclick pointing to window functions)
   - LocalStorage used only for user preferences

3. **Data Security**
   - No authentication required (client-side only app)
   - No sensitive data collected or stored
   - CORS proxies used for public data only

4. **Dependency Security**
   - Minimal external dependencies
   - Dependencies loaded from trusted CDNs (D3.js, TopoJSON)
   - Regular dependency updates

### Known Limitations

1. **CORS Proxies**
   - Public CORS proxies are used for fetching external data
   - Consider running your own proxy for production use
   - Data sent through proxies should be considered public

2. **LocalStorage**
   - User settings stored in browser localStorage
   - Accessible to any script on the same origin
   - No encryption (not needed for current use case)

3. **Client-Side Only**
   - No server-side validation
   - All code visible to users
   - API keys should NOT be embedded in code

## Security Best Practices for Users

### For Developers

1. **Never commit sensitive data:**
   ```bash
   # DO NOT commit:
   - API keys
   - Passwords
   - Access tokens
   - Personal information
   ```

2. **Review external data sources:**
   - Verify RSS feeds are from trusted sources
   - Check CORS proxy reliability
   - Monitor for unexpected data

3. **Keep dependencies updated:**
   ```bash
   npm audit
   npm update
   ```

4. **Use Content Security Policy headers:**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self' https://d3js.org https://cdn.jsdelivr.net;">
   ```

### For Deployments

1. **Use HTTPS** for production deployments
2. **Set security headers** in web server config:
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin

3. **Run your own CORS proxy** for production use
4. **Monitor access logs** for unusual activity
5. **Keep web server software updated**

## Security Checklist for Pull Requests

Before submitting a PR, ensure:

- [ ] No sensitive data (keys, tokens, passwords) committed
- [ ] All user input is properly sanitized
- [ ] No new inline JavaScript or eval() usage
- [ ] External dependencies are from trusted sources
- [ ] No SQL/NoSQL injection vectors (if backend added)
- [ ] XSS prevention measures maintained
- [ ] Error messages don't leak sensitive information
- [ ] Proper error handling without exposing internals

## Vulnerability Disclosure Policy

### Timeline

- **Day 0:** Vulnerability reported
- **Day 2:** Acknowledgment sent to reporter
- **Day 5:** Initial assessment completed
- **Day 30:** Fix developed and tested (target)
- **Day 35:** Security advisory published
- **Day 37:** Fix released

### Severity Levels

**Critical:**
- Remote code execution
- Authentication bypass
- Data breach potential
- Fix target: 7 days

**High:**
- XSS attacks
- Privilege escalation
- Sensitive data exposure
- Fix target: 14 days

**Medium:**
- CSRF vulnerabilities
- Information disclosure
- Weak encryption
- Fix target: 30 days

**Low:**
- Minor information leaks
- Cosmetic security issues
- Fix target: 90 days

## Security Updates

Security updates will be released as:
- **Patch versions** (1.0.x) for minor security fixes
- **Minor versions** (1.x.0) for significant security improvements
- **Major versions** (x.0.0) for breaking security changes

Subscribe to:
- [GitHub Security Advisories](https://github.com/cywf/sa-dash/security/advisories)
- [GitHub Releases](https://github.com/cywf/sa-dash/releases)

## Acknowledgments

We appreciate responsible disclosure and will credit security researchers who:
- Report vulnerabilities privately
- Give us time to fix before public disclosure
- Provide clear reproduction steps
- Suggest or provide fixes

Thank you for helping keep SA-DASH secure! 🔒
