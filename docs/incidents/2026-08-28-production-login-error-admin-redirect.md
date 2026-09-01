# Production login error and unexpected admin redirect

- **Status:** Open — investigation required
- **Reported:** 2026-08-28
- **Environment:** Production
- **Area:** Authentication and post-login routing
- **Severity:** Not yet assessed

## Summary

When a user attempts to log in to the production application, the application displays an error message and redirects the user to the admin dashboard. The exact error message, affected account role, and frequency are not yet known.

The unexpected redirect is a routing concern. It is **not yet evidence that the user received admin permissions or could access admin data**; authorization must be verified separately during investigation.

## User impact

- The user cannot complete the expected login flow reliably.
- The user lands in the admin application instead of the intended destination.
- The error creates uncertainty about whether authentication succeeded.
- If a non-organization user can access protected admin content, this may represent an authorization issue and should be escalated immediately.

## Steps to reproduce

1. Open the production web application's login page in a signed-out browser session.
2. Enter credentials for an affected user.
3. Submit the login form.
4. Observe the error message.
5. Observe that the browser is redirected to the admin dashboard.

## Expected behavior

- Valid credentials create a session without showing an error.
- The user is routed according to the role stored in the authenticated session:
  - users without a role go to onboarding;
  - student users remain in the web application;
  - organization users go to the admin dashboard.
- Invalid credentials leave the user on the login page and show a generic authentication error.

## Actual behavior

- An error message is shown during login.
- The user is redirected to the admin dashboard.
- It is unknown whether a valid session is created or whether admin API/page access succeeds after the redirect.

## Investigation notes

Current routing behavior relies on the authenticated session's `user.role` value and the configured cross-application URLs. Production triage should verify:

- the exact error text, HTTP response status, request URL, and timestamp;
- the affected user's expected role and the role returned in the server-side session;
- whether the issue affects student, organization, unassigned-role, or all users;
- whether the redirect originates from the web proxy, dashboard proxy, or client login flow;
- production values for `BETTER_AUTH_URL`, `NEXT_PUBLIC_WEB_URL`, and `NEXT_PUBLIC_DASHBOARD_URL` (record whether each is present and correct; do not copy secrets into this document);
- the production database schema/search path and whether the expected user, account, and session records are being read;
- cookie domain, `Secure`, `SameSite`, and cross-subdomain behavior between the web and dashboard applications;
- server logs for the authentication request and subsequent session lookup, correlated by timestamp/request ID;
- whether protected admin endpoints independently reject a user whose role is not `org`.

## Evidence to capture

- Screenshot or verbatim text of the displayed error.
- A sanitized browser network trace covering login and redirects.
- The full redirect chain, including status codes and `Location` headers.
- A sanitized server log excerpt for the same request.
- A test account identifier and expected role (do not include credentials or session cookies).
- Browser, device, and whether the result reproduces in a private window.

## Acceptance criteria

- A valid login shows no error and lands each account type at its intended destination.
- An invalid login remains on the login page and does not redirect to either application.
- Student and unassigned-role users cannot access protected admin pages or APIs.
- Organization users can access the dashboard normally.
- The behavior is verified in production, or in a production-equivalent environment, with sanitized evidence attached.

## Open questions

- What is the exact error message?
- Which login page was used: the web application or the admin dashboard?
- What role should the affected user have?
- Does the user see admin content, or only the admin login/error page?
- Is the issue consistent or intermittent, and when was it first observed?

