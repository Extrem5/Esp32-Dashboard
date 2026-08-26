# 🚀 Full-Stack ESP32 IoT Dashboard

A real-time telemetry monitoring platform built with **Next.js**, **PostgreSQL (Supabase)**, and an **ESP32 microcontroller**. 

Hardware metrics are gathered over Wi-Fi, saved to a cloud database, and visualized dynamically using time-series graphs.

---

## 🛠️ Tech Stack & Architecture

- **Hardware / Embedded:** ESP32 DevKit, C++, Arduino Framework (`HTTPClient.h`, `ArduinoJson.h`)
- **Frontend UI:** Next.js (App Router), React, Tailwind CSS, Recharts
- **Backend API:** Next.js Route Handlers (`/api/telemetry`)
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel

---

## 📊 Monitored Metrics

- **Chip Temperature:** Internal thermal readings (°C)
- **RAM Memory:** Real-time Free Heap RAM & Lowest Recorded Threshold (KB)
- **Wi-Fi Signal:** RSSI Connection Strength (dBm)
- **Capacitive Touch:** Real-time touch event detection (GPIO 4)
- **System Uptime:** Board runtime counter (seconds)

---

## ⚡ Setup & Local Development

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Extrem5/Esp32-Dashboard.git](https://github.com/Extrem5/Esp32-Dashboard.git)
   cd Esp32-Dashboard
2. **Install dependencies:**
npm install
3. **Configure Environment Variables:**
Create a .env.local file in the root directory:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

4. :**Run local server::**
npx next dev -H 0.0.0.0 -p 3000
---

### Step 2: Complete Your Vercel Deployment

Now that your repository is ready and you're logged into Vercel:

1. Click **Add New... > Project** in your Vercel Dashboard.
2. Under **Import Git Repository**, select **`Esp32-Dashboard`** and click **Import**.
3. Expand **Environment Variables** and add your two Supabase keys:
   * Key: `NEXT_PUBLIC_SUPABASE_URL` | Value: *(Your Supabase URL)*
   * Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Value: *(Your Supabase Anon Key)*
4. Click **Deploy**!


