# How to Simulate Better Auth for API Testing

Better Auth uses **httpOnly session cookies**, so you can't just pass a Bearer token.
Here are 3 ways to get a valid session cookie for testing:

---

## Option 1: Browser DevTools (Easiest)

1. Start the app: `npm run dev` (backend) + `cd frontend && npm run dev`
2. Open `http://localhost:5173` → sign in via GitHub/Google
3. Open DevTools → Application → Cookies → `http://localhost:3001`
4. Copy the `better-auth.session_token` cookie value
5. Use it in `.rest` files or curl:
   ```
   Cookie: better-auth.session_token=<your_token_here>
   ```

---

## Option 2: curl the OAuth Flow (Manual)

```bash
# 1. Start the OAuth flow — this returns a redirect URL
curl -v http://localhost:3001/api/auth/sign-in/social \
  -H "Content-Type: application/json" \
  -d '{"provider":"github","callbackURL":"http://localhost:5173/vault"}'

# 2. Open the redirect URL in a browser, complete OAuth
# 3. The callback sets a session cookie — grab it from the response headers
```

---

## Option 3: Direct Session Injection (Dev Only)

Create a test script that inserts a session directly into MongoDB:

```bash
node tests/create-test-session.js
```

This creates a test user + session and prints the cookie value to use.

---

## Option 4: Guest Mode (No Auth)

The `POST /api/enrich/github` endpoint works without auth (uses `optionalAuth`).
All other endpoints require auth — they return `401 Unauthorized` without a session cookie.

For the `.rest` files below, replace `{{cookie}}` with your session cookie value.
