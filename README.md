# 🚨 Report IT - Incident Management System 🚨

![Project Status](https://img.shields.io/badge/status-active-brightgreen)
![React](https://img.shields.io/badge/Web-React-61DAFB?logo=react)
![React Native](https://img.shields.io/badge/Mobile-React_Native-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase)

**Report IT** is a comprehensive, full-stack solution designed to streamline the reporting and management of community incidents. Combining a sleek mobile experience for reporters and a powerful web dashboard for administrators, it bridges the gap between citizens and authorities.

---

## 🏗️ Architecture Overview

The project is divided into two primary platforms, both powered by a unified Supabase backend.

### 1. 📱 Mobile Application (`/mobile-app`)
Built with **React Native** and **Expo**, the mobile app allows users to:
- **Instant Reporting**: File incident reports with photos and descriptions on the go.
- **Status Tracking**: Monitor the progress of submitted reports in real-time.
- **Secure Authentication**: Simple signup and login powered by Supabase Auth.
- **User Profiles**: Manage personal information and history.

### 2. 💻 Web Admin Portal (`/Web_Admin`)
Built with **React**, **Vite**, and **Tailwind CSS**, the admin portal provides:
- **Centralized Dashboard**: High-level overview of all active incidents.
- **Advanced Analytics**: Visual data representations to identify trends and hotspots.
- **Departmental Filtering**: Route and manage reports specific to different government or organization departments.
- **Data Export**: Generate and export reports for offline analysis.
- **System Settings**: Configure application-wide parameters.

---

## 🛠️ Tech Stack

### Frontend & Mobile
- **Core Frameworks**: [React 18](https://reactjs.org/), [React Native](https://reactnative.dev/)
- **Build Tools**: [Vite](https://vitejs.dev/), [Expo](https://expo.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [NativeWind](https://www.nativewind.dev/)
- **Routing**: `react-router-dom` (Web), `expo-router` (Mobile)
- **Icons**: [Heroicons](https://heroicons.com/), [Lucide React](https://lucide.dev/)

### Backend (BaaS)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (for incident images)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo Go app (for mobile testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dany1211/report_IT.git
   cd report_IT
   ```

2. **Setup Mobile App**
   ```bash
   cd mobile-app
   npm install
   npx expo start
   ```

3. **Setup Web Admin**
   ```bash
   cd ../Web_Admin
   npm install
   npm run dev
   ```

---

## 🔑 Environment Configuration

Both projects require a Supabase connection. Create a `.env` file in both `Web_Admin` and `mobile-app` directories:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

*(Note: For mobile, use `EXPO_PUBLIC_` prefix if using Expo variables)*

---

## 📸 Screen Previews

| Mobile Reporting | Admin Dashboard |
| :---: | :---: |
| _[Mobile Screenshot Placeholder]_ | _[Admin Screenshot Placeholder]_ |

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

