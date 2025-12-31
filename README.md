# BeeGrub (Mobile App)

BeeGrub is a campus food pre‑order and pickup app for the BINUS Anggrek ecosystem. Students, vendors, and admins access the same mobile app with different views based on their role.

This README is only for the **Expo / React Native app** inside the `BeeGrubApp` folder.

---

## 1. Features (Current State)

### Roles
- **Student** – browse canteens, add items to cart, place orders, track order status, view history.
- **Vendor** – manage menu, receive orders from students, update order status.
- **Admin** – approve/reject vendors, manage users, view high‑level statistics.

### Core Flows
- Email/password authentication with Supabase Auth.
- Email confirmation after registration.
- Password reset via email link (deep‑link into the app).
- Student ordering flow: select vendor → browse menu → cart → checkout → order history.
- Vendor and admin dashboards with basic management tools.

For detailed functional requirements, see `SRS_UPDATED.md` and `STUDENT_SCREENS_GUIDE.md`.

---

## 2. Tech Stack

- **Runtime**: React Native + Expo
- **Backend**: Supabase (PostgreSQL + Auth)
- **Navigation**: React Navigation
- **State Management**: React Hooks + Context (e.g., `CartContext`)
- **Payments**: Midtrans (via separate Node API in `../beegrub-payments-api`)

---

## 3. Project Structure

```bash
BeeGrubApp/
├── App.js                 # Root component, deep‑link handling
├── app.json               # Expo config (scheme, extra values)
├── assets/                # Images, fonts, icons
├── src/
│   ├── components/
│   │   ├── common/        # Reusable UI components (Button, Card, Input,...)
│   │   └── specific/      # Feature‑specific components (e.g., VendorCard)
│   ├── constants/
│   │   ├── colors.js      # Color palette
│   │   └── theme.js       # Typography, spacing, radius
│   ├── context/
│   │   └── CartContext.js # Student cart state
│   ├── navigation/
│   │   ├── AppNavigator.js    # Role‑based root navigator
│   │   ├── AuthNavigator.js   # Login / register / reset password
│   │   ├── StudentNavigator.js
│   │   ├── VendorNavigator.js
│   │   └── AdminNavigator.js
│   ├── screens/
│   │   ├── auth/          # Login, Register, Confirm Email, Forgot/Reset Password
│   │   ├── student/       # Student home, menu, cart, orders, etc.
│   │   ├── vendor/        # Vendor dashboard and order management
│   │   └── admin/         # Admin dashboard, user & vendor management
│   ├── services/
│   │   ├── api.js         # High‑level data access (users, vendors, orders, stats)
│   │   └── supabase.js    # Supabase client + auth/user helpers
│   └── utils/
│       └── helpers.js     # Generic helpers
└── package.json
```

Database schema, RLS policies, and triggers are described in:

- `database_schema.sql`
- `BeeGrub_ERD_Visualization.md`
- `EMAIL_CONFIRMATION_SETUP.md`
- `PAYMENT_INTEGRATION_GUIDE.md`

---

## 4. Prerequisites

- Node.js **16+**
- npm or yarn
- Expo CLI (`npm install -g expo-cli`) – optional but convenient
- Android device/emulator or iOS device/simulator
- A Supabase project (URL + anon key)

---

## 5. Setup & Running Locally

1. **Install dependencies**

  From the `BeeGrubApp` folder:

  ```bash
  npm install
  # or
  yarn
  ```

2. **Configure Supabase**

  In `src/services/supabase.js`, set your project credentials:

  ```js
  const supabaseUrl = 'https://YOUR-PROJECT.supabase.co';
  const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
  ```

  Make sure the **Site URL** and **Redirect URLs** in the Supabase dashboard match the app’s deep‑link scheme (see section 6).

3. **Run the app in development**

  ```bash
  npm start
  # or
  npx expo start
  ```

  Then:
  - Scan the QR code with the Expo Go app, **or**
  - Press `a` to open Android emulator, `i` for iOS simulator.

> Note: Deep links from email (reset password, confirm email) are fully reliable on a **built app**. In Expo Go they may be limited.

---

## 6. Auth & Deep Linking (Supabase)

The app uses a custom scheme (configured in `app.json`) to handle email links:

- Example scheme: `beegrub://`
- Example redirect URIs:
  - `beegrub://reset-password`
  - `beegrub://confirm-email`

In Supabase **Authentication → URL Configuration**:

- **Site URL**: `beegrub://auth-callback` (or similar placeholder using the same scheme)
- **Redirect URLs**: include at least the two URIs above.

The app:

- Listens for password‑recovery links.
- Extracts the Supabase access/refresh tokens from the URL.
- Calls `supabase.auth.setSession(...)`.
- Navigates to the **Reset Password** screen so the user can set a new password.

---

## 7. Environment & Configuration Summary

Minimum configuration to run BeeGrub:

- Supabase project with tables and policies from `database_schema.sql`.
- `supabaseUrl` and `supabaseAnonKey` set in `src/services/supabase.js`.
- Deep‑link URLs registered in Supabase as described above.
- (Optional) Midtrans credentials configured in the separate payments API (`../beegrub-payments-api`).

---

## 8. Building a Release APK (Android)

BeeGrub uses **EAS Build** (Expo Application Services) for production builds.

### One‑time setup

1. **Install EAS CLI**

  ```bash
  npm install -g eas-cli
  ```

2. **Log in to Expo**

  ```bash
  eas login
  ```

3. **Configure EAS for this app** (run once in `BeeGrubApp`):

  ```bash
  eas build:configure
  ```

  This creates `eas.json` with default build profiles.

### Build an Android APK for testers / submission

From the `BeeGrubApp` folder:

```bash
eas build --platform android --profile preview
```

- `preview` profile typically produces an **APK** that you can install directly on devices for your project submission.
- EAS will guide you through creating or reusing a keystore the first time.

Once the build finishes, open the build page URL printed in the terminal and download the APK.

If you later want a Play Store–ready bundle, you can run:

```bash
eas build --platform android --profile production
```

---

## 9. Suggested "Release" Checklist

Before you hand in or publish the app:

1. **Freeze features** – avoid adding new features during release.
2. **Smoke‑test core flows** for all roles:
  - Student: register → confirm email → login → order → see history.
  - Vendor: login → view orders → update status.
  - Admin: approve/reject vendor → manage users.
3. **Verify auth links** – test email confirmation and password reset on a **built APK**.
4. **Build a fresh APK** using the EAS commands above.
5. **Label the version** (e.g., `1.0.0`) in `app.json` and/or `eas.json`.
6. **Attach short notes** for evaluators: known limitations, test account credentials, and which features are implemented.

---

## 10. After Release – Handling Bugs

Recommended workflow when someone reports a bug:

1. **Record the issue** – what they did, what they expected, what happened.
2. **Reproduce locally** – run the app with the same role and steps.
3. **Fix in code** on a new git branch (e.g., `fix/reset-password-bug`).
4. **Re‑test affected flows** (especially auth and ordering).
5. **Bump the version** (e.g., `1.0.1`) and build a new APK with EAS.
6. **Distribute the new build** and update your documentation / changelog.

---

## 11. Useful References

- React Native: https://reactnative.dev/
- Expo: https://docs.expo.dev/
- Supabase: https://supabase.com/docs
- React Navigation: https://reactnavigation.org/

