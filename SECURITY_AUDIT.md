# Security Audit Report

Date: February 3, 2026

## Overview
This document summarizes the security audit performed on the kushmanmb repository and the vulnerabilities that were identified and addressed.

## Vulnerabilities Found

### 1. NPM Package Vulnerabilities

#### Critical Severity - Next.js (FIXED ✅)
- **Package**: next
- **Affected Versions**: 10.0.0 - 15.6.0-canary.60
- **Installed Version**: 15.3.3 → **Updated to 15.5.11**
- **Issues Fixed**:
  - Next.js Affected by Cache Key Confusion for Image Optimization API Routes (GHSA-g5qg-72qw-gw5v)
  - Next.js Content Injection Vulnerability for Image Optimization (GHSA-xv57-4mr9-wg8v)
  - Next.js Improper Middleware Redirect Handling Leads to SSRF (GHSA-4342-x723-ch2f)
  - Next.js is vulnerable to RCE in React flight protocol (GHSA-9qr9-h5gf-34mp)
  - Next Server Actions Source Code Exposure (GHSA-w37m-7fhw-fmv9)
  - Next Vulnerable to Denial of Service with Server Components (GHSA-mwv6-3258-q52c)
  - Next.js self-hosted applications vulnerable to DoS via Image Optimizer remotePatterns configuration (GHSA-9g9p-9gw9-jx7f)
  - Next.js HTTP request deserialization can lead to DoS when using insecure React Server Components (GHSA-h25m-26qc-wcjf)

#### High Severity - tar Package (FIXED ✅)
- **Package**: tar
- **Affected Versions**: <=7.5.6
- **Issues Fixed**:
  - node-tar is Vulnerable to Arbitrary File Overwrite and Symlink Poisoning via Insufficient Path Sanitization (GHSA-8qq5-rm4j-mr97)
  - Race Condition in node-tar Path Reservations via Unicode Ligature Collisions on macOS APFS (GHSA-r6q2-hw4h-h46w)
  - node-tar Vulnerable to Arbitrary File Creation/Overwrite via Hardlink Path Traversal (GHSA-34x7-hfp2-rc4v)

## Remaining Issues

### Moderate Severity - Next.js PPR Memory Consumption (NOT FIXED ⚠️)
- **Package**: next
- **Affected Versions**: 15.0.0-canary.0 - 15.6.0-canary.60
- **Current Version**: 15.5.11
- **Issue**: Next.js has Unbounded Memory Consumption via PPR Resume Endpoint (GHSA-5f7q-jpqc-wp7h)
- **CVE**: CWE-400, CWE-409, CWE-770
- **CVSS Score**: 5.9 (Moderate)
- **Fix Available**: Upgrade to Next.js 16.1.6 or later
- **Reason Not Fixed**: Upgrading to Next.js 16.x is a major version change that could introduce breaking changes. This should be evaluated separately as it may require code changes throughout the application.

## Actions Taken

1. ✅ Updated Next.js from 15.3.3 to 15.5.11 in `app/package.json`
2. ✅ Fixed tar package vulnerability by running `npm audit fix`
3. ✅ Verified application still compiles with TypeScript after updates
4. ✅ Updated package-lock.json with new dependency versions

## Recommendations

1. **Monitor Next.js 16.x**: When planning the next major update cycle, prioritize upgrading to Next.js 16.x to address the remaining moderate severity vulnerability.

2. **Regular Security Audits**: Continue running `npm audit` regularly (e.g., weekly) to catch new vulnerabilities early.

3. **Automated Dependency Updates**: Consider setting up automated dependency update tools like Dependabot or Renovate to keep dependencies current.

4. **CI/CD Integration**: Add `npm audit --audit-level=high` to the CI/CD pipeline to prevent merging PRs with high or critical vulnerabilities.

## Verification Commands

To verify the current security status:
```bash
cd app
npm audit
```

Expected output: 1 moderate severity vulnerability (Next.js PPR issue)
