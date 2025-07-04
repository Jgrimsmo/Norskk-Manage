# 🚀 Norskk Management System - Setup Instructions

## Quick Start Options

### Option 1: GitHub Codespaces (Easiest)
1. Go to your GitHub repository
2. Click **Code** → **Codespaces** → **Create codespace**
3. Wait for environment to load (2-3 minutes)
4. Your project will be ready to use!

### Option 2: Local Development

#### Prerequisites
- **Node.js 16+** - Download from [nodejs.org](https://nodejs.org)
- **Git** - Download from [git-scm.com](https://git-scm.com)
- **VS Code** (recommended) - Download from [code.visualstudio.com](https://code.visualstudio.com)

#### Setup Steps
```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/Norskk-Manage.git
cd Norskk-Manage

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# 4. Start development server
npm start
```

## 🔥 Firebase Setup Required

### Get Your Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create new one)
3. Go to **Project Settings** → **General** tab
4. Scroll to **Your apps** section
5. Copy the config values to your `.env` file

### Environment Variables (.env file)
```bash
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
REACT_APP_FIREBASE_PROJECT_ID=your_project_id_here
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
REACT_APP_FIREBASE_APP_ID=your_app_id_here
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

## 🛠️ Available Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Build and preview production
npm run build && npx serve -s build
```

## 🌐 Access URLs

- **Development**: http://localhost:3000
- **Codespaces**: Your codespace will show the URL in the terminal

## 📋 Features Available

✅ **Project Management** - Create and manage construction projects  
✅ **Estimate Dashboard** - Build detailed project estimates  
✅ **Daily Reports** - Submit daily progress reports with photos  
✅ **Equipment Management** - Track construction equipment  
✅ **Crew Management** - Manage workforce and assignments  
✅ **Time Tracking** - Log work hours  
✅ **PDF Generation** - Export reports to PDF  
✅ **Photo Upload** - Attach site photos to reports  

## 🆘 Troubleshooting

### Common Issues

**"Module not found" errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Firebase connection issues:**
- Check your `.env` file has correct Firebase credentials
- Ensure Firebase project is active and billing enabled

**Port already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
npm start
```

**Photos not loading in PDF:**
- See `CORS_SETUP_INSTRUCTIONS.md` for Firebase Storage CORS setup

## 📚 Documentation

- **CORS Setup**: See `CORS_SETUP_INSTRUCTIONS.md`
- **Component Structure**: See `src/components/`
- **Styling**: See `src/styles/`
- **Firebase Utils**: See `src/lib/utils/firebaseHelpers.js`

## 🔐 Security Notes

- Never commit your `.env` file with real credentials
- Use `.env.example` as a template
- Set up Firebase Security Rules for production
- Enable Firebase Authentication for user management

---

**Need Help?** Check the console for error messages or create an issue in the repository.
