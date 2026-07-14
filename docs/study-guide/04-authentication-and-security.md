# 04 — Authentication and security

[Guide index](README.md) · Next: [Frontend and React](05-frontend-and-react.md)

## Identity versus permission

**Authentication** checks who is calling. **Authorization** checks whether that caller may perform an operation. In this version, firmware upload requires an admin JWT and update checking requires a device key. Device listing, firmware listing, registration and download are public. There is no configurable multi-role permission system.

Hiding a button in React is not authorization. Requests can be sent with curl or another program, so the backend must enforce access.

## Password handling

[`Admin.js`](../../backend/models/Admin.js) hashes new or changed passwords in a pre-save hook using bcrypt with a salt and work factor 10. A salt makes identical passwords produce different hashes. Hashing is one-way verification, not reversible encryption.

At login, the controller finds the administrator and calls `bcrypt.compare()` through `matchPassword()`. It returns the same error for an unknown username and incorrect password. The registration endpoint currently permits new administrator accounts without a setup guard; this is a security limitation. There is no password-change screen.

## How the JWT works in this project

1. Login succeeds after password verification.
2. The backend signs a token containing the admin's `id` using `JWT_SECRET`, with a one-day expiry.
3. React stores the token in state and `localStorage`.
4. Protected requests send `Authorization: Bearer <token>`.
5. [`authMiddleware.js`](../../backend/middleware/authMiddleware.js) verifies the signature and expiry, then **queries the Admin collection** to confirm the account exists.

JWT therefore does not eliminate database lookups in this implementation. The token has a header, payload and signature; the first two are encoded, not encrypted. Never put passwords or database secrets in the payload.

Expiry is measured from issuance, not inactivity. Refreshing the page restores the stored token but does not extend its expiry. Logout clears browser storage; it does not revoke a copied token on the server. There is no refresh-token or token-revocation mechanism.

Generate a strong secret locally with `openssl rand -hex 32`, and put it only in backend environment configuration. Changing it invalidates tokens signed with the previous secret. Human-readable example phrases from a tutorial should not become production secrets.

A server-side session is a valid alternative: the client carries a session identifier and the server retrieves session state. JWT was chosen here for a simple bearer-token API, not because sessions cannot scale.

## Device API keys

A new device receives 32 random bytes encoded as hex. It keeps this key and supplies it in `x-api-key`. Middleware finds the corresponding device and attaches `req.device`; the controller trusts this authenticated identity rather than a device name supplied in the body.

The key is hidden from ordinary queries using `select: false`, but is stored as a raw value in MongoDB. Hiding a field is not hashing or encryption. The current API has no key rotation or revocation endpoint, although deleting or changing the stored record can invalidate a key.

## Security boundaries and remaining work

CORS concerns browser access across origins (scheme, host and port). Vite's local proxy lets React call `/api` without a separate cross-origin browser request. CORS cannot replace authentication; scripts can omit or forge an Origin header.

`localStorage` is simple but readable by JavaScript running on the page, so XSS could steal a token. HttpOnly cookies offer a different tradeoff and require suitable CSRF handling. HTTPS protects credentials in transit.

Nexus has basic required-field checks, but no version-format validation, file-size limit, rate limiting, private firmware downloads, signed firmware verification or restricted enrollment. Public admin registration is the most serious limitation. These are honest improvement points for a viva, not completed features.

**Self-check:** Does knowing a firmware download URL require a JWT? No: downloads are currently public. Does possession of a device key permit firmware upload? No: upload requires an administrator token.
