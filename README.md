# HB+ Auth: Google Sign-In with Domain Restriction

A cross-platform app (Web, Android, iOS) built with **React Native + Expo** and **React Native for Web**. Users sign in with Google, and access is granted **only to `@hbplus.fit` email addresses**. Every other domain is rejected.

**Live demo:** https://hbplus-auth-tarun.netlify.app
**Repository:** https://github.com/TarunSaiNath/hbplus-auth

## Features

- Google Sign-In (OAuth 2.0) through Firebase Authentication
- Email domain validation (exact match, verified email required)
- Protected routes: `/dashboard` cannot be opened without logging in
- Dashboard with profile (avatar, name, email, role badge) and Logout
- Loading states while checking the session and while signing in
- Error handling with the required message for wrong domains
- **Bonus:** role-based access (Admin / User), users stored in Firestore, Admin panel listing all users
- Responsive layout (card is full-width on phones, max 420px centered on desktop)

## Tech stack

| Area | Choice |
|---|---|
| Framework | React Native (Expo SDK) + Expo Router |
| Web | React Native for Web (`expo export -p web`) |
| Auth | Firebase Authentication (Google provider) |
| Database | Cloud Firestore |
| State | React Context (`AuthContext`) |
| Hosting | Netlify |
| Language | TypeScript |

## Project structure

```
app/
  _layout.tsx              Root layout: AuthProvider + loading gate
  index.tsx                Redirects "/" to /dashboard
  login.tsx                Login page
  (protected)/
    _layout.tsx            Route guard: redirects to /login if no user
    dashboard.tsx          Dashboard (login required)
src/
  config/firebase.ts       Firebase initialization
  context/AuthContext.tsx  Global auth state (user, role, loading, error)
  services/
    authService.ts         Google sign-in, domain check, logout
    userService.ts         Create/update user profile, load role, list users
  utils/domainValidator.ts Pure domain-validation function
  components/              GoogleButton, Loader, ErrorBanner
public/_redirects          Netlify SPA fallback
netlify.toml               Netlify build settings
.env.example               Required environment variables
```

## Setup instructions

### 1. Prerequisites
Node.js 20+, npm, Git, and a Google account for Firebase.

### 2. Clone and install
```bash
git clone https://github.com/TarunSaiNath/hbplus-auth.git
cd hbplus-auth
npm install
```

### 3. Firebase setup
1. Create a project at https://console.firebase.google.com
2. **Authentication → Sign-in method → Google → Enable**
3. **Firestore Database → Create database**
4. **Project settings → Your apps → Web (`</>`)** and copy the config values
5. **Authentication → Settings → Authorized domains:** make sure `localhost` and your deployed domain are listed
6. **Firestore → Rules:** paste the rules from the section below and publish

### 4. Environment variables
Copy `.env.example` to `.env` and fill in the values:
```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_ALLOWED_DOMAIN=hbplus.fit
```
`.env` is git-ignored and never committed.

### 5. Run
```bash
npx expo start --web     # browser
npx expo start           # then press "a" (Android) or "i" (iOS) for an emulator
```

### 6. Build and deploy (Netlify)
```bash
npx expo export -p web   # outputs to /dist
```
Netlify reads `netlify.toml` (build command `npx expo export -p web`, publish directory `dist`). Add the same environment variables in **Netlify → Site configuration → Environment variables**, then add the Netlify domain to Firebase **Authorized domains**.

## Authentication flow

```
User clicks "Login with Google"
        |
        v
[loading state on button]
        |
        v
Google popup -> user picks account -> Google verifies identity
        |
        v
Firebase signs the user in and returns a user object
        |
        v
isAllowedEmail(email, emailVerified)?
   |                          |
  YES                         NO
   |                          |
Create/update              signOut() immediately
users/{uid} in Firestore   Show: "Access restricted. Please login
Load role                  using your official domain email."
   |
   v
Redirect to /dashboard
```

1. `signInWithGoogle()` opens Google sign-in.
2. Firebase returns the signed-in user.
3. The domain validator checks the email.
4. If it fails, the user is signed out at once and the error is shown.
5. If it passes, the profile is saved or updated in Firestore, the role is loaded, and the user lands on the dashboard.
6. `onAuthStateChanged` keeps the session across refreshes and runs the domain check again as a second guard.

## How domain restriction works

Restriction is enforced in **layers**, because anything running in the browser can be modified.

| Layer | Where | Purpose |
|---|---|---|
| `isAllowedEmail()` | Client | Immediate, friendly error message |
| `onAuthStateChanged` guard | Client | Signs out any wrong-domain user who reaches app state |
| Protected route layout | Client | Redirects unauthenticated users to `/login` |
| **Firestore security rules** | **Server** | **Real enforcement: data is inaccessible to other domains** |

### Domain validator rules (`src/utils/domainValidator.ts`)
- Email must exist and `emailVerified` must be `true`
- Email is trimmed and lower-cased
- The part after the **last `@`** must **exactly equal** `hbplus.fit`
- This rejects look-alikes such as `user@hbplus.fit.evil.com` and `user@sub.hbplus.fit`

### Google `hd` parameter
The sign-in request sets `hd=hbplus.fit`, which makes Google's account picker prefer work accounts. It is **only a UI hint** and can be altered by the user, so it is **not** relied on for security.

### Firestore security rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isCompanyUser() {
      return request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email.matches('.*@hbplus[.]fit');
    }

    function isAdmin() {
      return isCompanyUser()
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /users/{uid} {
      allow read: if isCompanyUser() && (request.auth.uid == uid || isAdmin());

      allow create: if isCompanyUser()
        && request.auth.uid == uid
        && request.resource.data.role == 'user'
        && request.resource.data.email == request.auth.token.email;

      allow update: if isCompanyUser()
        && request.auth.uid == uid
        && request.resource.data.role == resource.data.role;
    }
  }
}
```
These rules run on Google's servers and read the `email` and `email_verified` claims from the signed token, so they cannot be faked from the client.

## Roles (Admin / User)

- On first login, `users/{uid}` is created with `email`, `name`, `photo`, `role: "user"`, `createdAt`, `lastLogin`.
- Users **cannot** change their own role: the rules require `role` to be unchanged on update and `"user"` on create.
- Admins are promoted manually by editing the `role` field to `admin` in the Firebase console. There is deliberately no in-app "become admin" action.
- The dashboard shows an Admin panel (all users) only for admins. The UI hides it, and the Firestore rules refuse the query for everyone else.
- If the profile lookup fails, the app falls back to the lowest privilege (`user`).

## Security notes

- **Token handling:** the Firebase SDK manages short-lived ID tokens and refresh tokens. The app never reads, copies, or stores tokens manually.
- **Secrets:** `.env` is git-ignored. `.env.example` documents the required variables. Firebase web config values are identifiers, not secrets. Security comes from the rules.
- **Protected routes:** every screen in `app/(protected)/` passes through one guard layout. Direct URL access without login redirects to `/login`.
- **No flash of wrong screen:** a loading gate waits for Firebase to restore the session before any redirect decision.

## Testing checklist

| Test | Expected |
|---|---|
| Open `/dashboard` while logged out | Redirected to `/login` |
| Login with `@gmail.com` | Error: "Access restricted. Please login using your official domain email." and not logged in |
| Login with `@hbplus.fit` | Dashboard with profile and role badge |
| Refresh on dashboard | Stays logged in |
| Logout, then open `/dashboard` | Redirected to `/login` |
| Rules Playground: non-admin updates own `role` | Denied |
| Rules Playground: wrong-domain or unverified email reads data | Denied |

## Limitations and future improvements

- Domain enforcement is applied in the client and in Firestore security rules. A wrong-domain user can briefly authenticate with Firebase (an entry appears in Authentication → Users) but **cannot read or write any data**. A Firebase **blocking function** (`beforeUserCreated` / `beforeSignIn`, requires Blaze plan and Identity Platform) would reject them before an account is created and is the recommended next step.
- Roles are managed manually in the console. A production system would use **custom claims** set by an admin-only backend function.
- Mobile (Android/iOS) Google sign-in uses `expo-auth-session` with a platform-specific Firebase file (`firebase.native.ts`) for session persistence. See the mobile section below.

## Mobile (Android / iOS)

Mobile uses the same codebase. Platform differences are isolated in files such as `src/config/firebase.native.ts` (AsyncStorage persistence), which Expo picks automatically on devices, while the web build uses `firebase.ts`. Google OAuth client IDs for Android and iOS are required for device sign-in.

## Database note

Replace this line with the one that matches your setup before submitting:
- *Uses the standard `(default)` Firestore database.*
- *Uses a named Firestore database `default`, passed as the third argument of `initializeFirestore` in `src/config/firebase.ts`.*

## Author

Tarun Sai Nath
