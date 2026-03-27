# Restiqa - Premium Travel Marketplace 🇧🇩 🚀

Restiqa is a high-end, world-class travel platform designed for the unique tourism landscape of Bangladesh. Built with **Next.js 15**, **Supabase**, and a custom **Neomorphic-Glassmorphism** design system, it offers a seamless booking experience for guests and powerful management tools for hosts.

![Restiqa Hero](public/og-image.png)

## ✨ Elite Features

### 📱 Full Progressive Web App (PWA)
Restiqa is a "Native-Grade" web app. Users on iOS and Android can install it directly to their home screen with a dedicated icon, splash screen, and standalone window experience.

### 🗺️ Specialized Search & Discovery
- **Airbnb-Style Map Sync**: Experience ultra-fast discovery with our **Map-Search Synchronization**. Moving the interactive map instantly filters the properties listing to show only what's in your current view.
- **Tour-Specific Logic**: The platform dynamically adapts to the selected category. Selecting **Tours** swaps standard stay inputs for a specialized **Travel Date** and **Duration** selector—perfect for booking experiences.

### 🖼️ Dynamic SEO & Social Sharing
Every listing is optimized for viral growth. When shared on social media, Restiqa automatically generates a custom OpenGraph image overlaying the price, city, and branding directly onto the property photo.

### 📊 Host Analytics & Dashboard
A dedicated suite for property owners.
- **Real-time View Tracking**: See exactly how many people have viewed your listings.
- **Earnings Insights**: 6-month visual history of revenue.
- **Payout Management**: Integrated BKash, Rocket, and Bank Transfer tracking.

### 🛡️ Hardened Security
- **Strict RLS Policies**: Enterprise-grade data isolation between users.
- **Admin Console**: Master-level control over all listings, bookings, and users.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: Tailwind CSS + Custom Neomorphic Glassmorphism
- **Maps**: Google Maps JavaScript API
- **Analytics**: Vercel Analytics & Speed Insights
- **Emails**: Resend API

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/AGUNTUK/restiqa.git
cd restiqa
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

RESEND_API_KEY=your_resend_key
```

### 3. Database Setup
1. Create a new project on [Supabase](https://supabase.com/).
2. Run the SQL migrations found in the `supabase/migrations/` folder in order.

### 4. Run Locally
```bash
npm run dev
```

---

## 📖 Deployment
The project is optimized for deployment on **Vercel**. Simply connect your repository and ensure all environment variables are correctly configured.

## 📄 License
Internal use only. © 2026 Restiqa Team.
