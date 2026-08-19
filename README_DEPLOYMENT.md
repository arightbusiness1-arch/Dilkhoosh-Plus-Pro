# 🚀 Dilkhoosh Plus - GitHub & Netlify Deployment Guide

এই অ্যাপ্লিকেশনটি **Google Firebase (Firestore, Auth & Storage)** এর সাথে সম্পূর্ণ ইন্টিগ্রেটেড এবং **Netlify** তে ডিপ্লয় করার জন্য শতভাগ প্রস্তুত।

---

## 📋 ধাপ ১: গিটহাবে পুশ করার নিয়ম (Push to GitHub)

১. টার্মিনাল বা কমান্ড প্রম্পটে প্রজেক্ট ফোল্ডারে যান:
```bash
git init
git add .
git commit -m "Initial commit - Dilkhoosh Plus Ready for Netlify"
```

২. আপনার গিটহাব অ্যাকাউন্টে একটি নতুন রিপোজিটরি (New Repository) তৈরি করুন (যেমন: `dilkhoosh-plus`)।

৩. রিপোজিটরির সাথে যুক্ত করে কোড পুশ করুন:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dilkhoosh-plus.git
git push -u origin main
```

---

## 🌐 ধাপ ২: নেটলিফাইতে ডিপ্লয় করার নিয়ম (Deploy to Netlify)

১. [Netlify](https://app.netlify.com) এ লগইন করুন।
2. **"Add new site"** > **"Import an existing project"** এ ক্লিক করুন।
৩. **"GitHub"** সিলেক্ট করে আপনার `dilkhoosh-plus` রিপোজিটরিটি বেছে নিন।
৪. **Build Settings** অটোমেটিক কনফিগার করা আছে:
   - **Base directory:** (খালি রাখুন)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
৫. **Deploy Site** বাটনে ক্লিক করুন!

---

## 🔒 ধাপ ৩: ফায়ারবেস অথেন্টিকেশন ও ডোমেইন সেটিংস (Firebase Authorized Domains)

নেটলিফাইতে ডিপ্লয় হওয়ার পর যে ডোমেইন লিংকটি পাবেন (যেমন: `dilkhoosh-plus.netlify.app`):

১. [Firebase Console](https://console.firebase.google.com) এ যান।
২. আপনার প্রোজেক্ট সিলেক্ট করুন: **`dilkhoosh-plus`**।
৩. **Authentication** > **Settings** > **Authorized Domains** ট্যাবে যান।
৪. **"Add Domain"** বাটনে ক্লিক করে আপনার নেটলিফাই সাইটের ডোমেইনটি যোগ করুন (যেমন: `dilkhoosh-plus.netlify.app` বা আপনার কাস্টম ডোমেইন)।

---

## ⚙️ এনভায়রনমেন্ট ভেরিয়েবল (ঐচ্ছিক / Optional)

প্রজেক্টটিতে স্বয়ংক্রিয়ভাবে `firebase-applet-config.json` ফাইল অন্তর্ভুক্ত রয়েছে। এছাড়া আপনি চাইলে Netlify **Site configuration** > **Environment variables** এ নিচের ভেরিয়েবলগুলো সেট করতে পারেন:

| Variable Name | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID (`dilkhoosh-plus`) |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket URL |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Web App ID |
| `VITE_FIREBASE_DATABASE_ID` | Firestore Database ID (`ai-studio-dilkhooshplus-297a33f5-b620-496a-bfd1-8471bf6173ef`) |
