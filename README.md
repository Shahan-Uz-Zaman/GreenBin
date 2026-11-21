# GreenBin – Smart Waste Management Assistant

GreenBin is an environmental awareness and waste management web application built with **Next.js 14 (App Router)**, **React 18**, **TypeScript**, and **Tailwind CSS**. It is crafted according to the **Google Stitch Design System** to help individuals and communities accurately identify waste categories, track household segregation by weight (kg), and practice responsible eco-friendly disposal habits.

---

## 🌟 Key Features

### 1. Unified Home Hub (`/`)
- **Direct Interactive Layout**:
  - **Left Side**: Fast Waste Classifier with text search, instant category badge, designated bin color, step-by-step prep instructions, and quantity selector (approx kg).
  - **Right Side**: Real-time **Weekly Segregation Activity** (7-day bar chart showing kg by category) and **Eco Awareness Quiz Achievement** badge.
  - Logging an item on the left immediately updates the right-side chart in real-time.
- Three core waste category cards (Biodegradable, Recyclable, Hazardous) with common examples.
- 3-step *"How It Works"* workflow guide.

### 2. Waste Classifier (`/classifier`)
- Search any household item with instant AI API verification (OpenAI with Gemini fallback) + local database matching.
- Popular waste item quick suggestions (*Plastic Bottle*, *Banana Peel*, *Battery*, *Newspaper*, *Cardboard Box*, etc.).
- **Quantity & Weight Selector (kg)**: Choose presets (0.1 kg, 0.25 kg, 0.5 kg, 1.0 kg, 2.0 kg, 5.0 kg) or enter custom weight.
- *"Log [X] kg to Dashboard"* button with instant feedback.
- Detailed bin recommendations and proper disposal instructions.

### 3. Firebase Authentication (`/login` & `/signup`)
- Secure Email/Password registration and login.
- 1-click Google Sign-In.
- Profile management with dynamic display names and avatars in the Navbar.
- **Automatic Guest-to-User Migration**: Any waste logged or quizzes taken while browsing as a guest are automatically migrated to your user account upon signing in.
- Complete per-user data isolation: Each user has their own activities, segregated weights, and quiz scores.

### 4. Interactive Personalized Dashboard (`/dashboard`)
- Real calculated metrics:
  - Total Waste Segregated (kg)
  - Recyclables Diverted (kg)
  - Biodegradable Composted (kg)
  - Hazardous Safely Deposited (kg)
  - Estimated Carbon Offset (~0.8 kg CO₂ per kg recyclable + ~0.5 kg per kg composted)
- Interactive **Recharts** Pie Chart displaying weight distribution by category.
- Interactive **Recharts** 7-Day Bar Chart tracking daily segregated kg.
- Recent Waste Activity table with item name, category, quantity in kg, designated bin, and timestamp.
- **Quick Log Waste Modal**: Log waste items and weights directly from the dashboard.
- **Eco Awareness Achievement Card**: Displays latest quiz score, percentage, and badge.

### 5. Eco Awareness Quiz (`/quiz`)
- 30+ verified environmental segregation questions.
- **Customizable Quiz Options**:
  - Select question count: **5**, **10**, **15**, or **20** questions.
  - Select difficulty: **All (Mixed)**, **Easy**, **Medium**, or **Hard**.
- Real-time instant answer feedback with detailed educational explanations.
- Master Recycler / Eco Environmentalist achievement badges automatically saved to user profile.

### 6. Waste Segregation Guide (`/guide`)
- Comprehensive guide for Biodegradable (Green), Recyclable (Blue), and Hazardous (Red) waste.
- Best practices, Do's and Don'ts, and local disposal tips.

---

## 🎨 Google Stitch Design System

- **Primary Color:** Forest Green (`#228B52`, hover `#1A6E40`)
- **Secondary Background:** Soft Mint (`#E8F5E9`)
- **Clean Background:** Pure white (`#FFFFFF`) with subtle soft gray (`#F9FAFB`)
- **Category Accents:**
  - Biodegradable: Forest Green (`#228B52`)
  - Recyclable: Crisp Blue (`#1E88E5`)
  - Hazardous: Warning Red (`#E53935`)
- **Typography:** Dark, crisp, highly legible (`#111827`, `#374151`)
- **Components:** Soft rounded corners (`rounded-2xl`), subtle borders (`border-gray-200`), minimal drop shadows (`shadow-sm`).

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Shahan-Uz-Zaman/GreenBin.git
cd GreenBin
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory:
```env
# OpenAI API Key (Vision & text waste classification)
OPENAI_API_KEY=your_openai_api_key_here

# Gemini API Key (Secondary fallback)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production
```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Lucide React Icons
- **Charts:** Recharts
- **Authentication & Database:** Firebase Authentication & Cloud Firestore
- **AI Classification:** OpenAI API (`gpt-4o-mini`) with Google Gemini fallback

---

## 📄 License
MIT License. Built for cleaner, smarter, and greener communities.
