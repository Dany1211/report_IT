# 📱 Report IT - Mobile Application

The user-facing mobile application for the **Report IT** platform. Designed for quick, efficient incident reporting and tracking.

## ✨ Key Features

- **Incident Reporting**: Easy-to-use form to report issues with category selection and image uploads.
- **My Reports**: Personal dashboard to track the status and history of your submissions.
- **Real-time Status Updates**: Get instant feedback as authorities process your reports.
- **Secure Authentication**: User signup, login, and profile management using Supabase Auth.
- **Modern UI**: Clean, accessible design built with React Native and NativeWind.

## 🚀 Get Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app

```bash
npx expo start
```

In the output, you'll find options to open the app in a:
- [Expo Go](https://expo.dev/go) (Scan the QR code on your physical device)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) / [React Native](https://reactnative.dev/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Backend**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React Native](https://lucide.dev/)

## 📂 Structure

- `app/(tabs)`: Main application views (Home, Reports, Profile).
- `app/login.tsx` & `Signup.tsx`: Authentication screens.
- `components`: Reusable mobile UI components.
- `hooks`: Custom React hooks for data fetching and state.

---

*Part of the [Report IT](..) project.*

