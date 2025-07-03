# Norskk Management System

A comprehensive construction management application built with React for project management, crew scheduling, equipment tracking, and daily reporting.

## 🏗️ Features

### Core Management
- **Project Dashboard** - Create, track, and manage construction projects with status updates
- **Estimate Dashboard** - Generate detailed project estimates with scope breakdown and PDF exports
- **Item Database** - Centralized database of construction materials and equipment
- **Crew Management** - Track crew members, roles, and availability
- **Equipment Management** - Monitor equipment status, maintenance, and assignments

### Scheduling & Reporting
- **Dispatch Calendar** - Advanced scheduling system with weekly calendar view and multi-select crew/equipment
- **Daily Reports** - Comprehensive daily progress reports with weather integration and photo uploads
- **Time Tracking** - Employee time tracking with project-based logging
- **FLHA & Toolbox Forms** - Safety documentation and form management

### Tools & Calculators
- **Construction Calculator** - Specialized calculations for construction projects
- **Import/Export Calculator** - Material import/export cost calculations
- **Form Builder** - Custom form creation tool for project-specific needs

### System Features
- **Role-Based Access Control** - Admin, Manager, Foreman, Worker, and Viewer roles
- **Modern UI** - Windows Classic inspired design with professional theming
- **PDF Generation** - Export reports, estimates, and documentation
- **Weather Integration** - Automatic weather data for project locations
- **Toast Notifications** - Professional user feedback system

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd norskk-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore Database and Authentication
   - Copy your Firebase config to `src/Firebase/firebaseConfig.js`:
   ```javascript
   export const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Default Login Credentials

The application includes sample users for testing:

- **Admin**: admin@norskk.com / admin123
- **Manager**: manager@norskk.com / manager123  
- **Foreman**: foreman@norskk.com / foreman123
- **Worker**: worker@norskk.com / worker123

## 🛠️ Development

### Available Scripts

- **`npm start`** - Runs the app in development mode
- **`npm build`** - Builds the app for production
- **`npm test`** - Launches the test runner
- **`npm run eject`** - Ejects from Create React App (not recommended)

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── shared/         # Shared components (modals, forms, etc.)
│   ├── ui/            # Basic UI elements (buttons, modals)
│   └── Table/         # Advanced table components
├── contexts/           # React contexts (Auth, Theme)
├── hooks/             # Custom React hooks
│   └── pages/         # Page-specific hooks
├── lib/               # Utilities and helpers
│   ├── constants/     # Application constants
│   ├── utils/         # Utility functions
│   └── validators/    # Form validation
├── pages/             # Application pages/routes
├── styles/            # Global CSS styles
├── themes/            # Theme configurations
└── Firebase/          # Firebase configuration
```

### Key Technologies

- **React 18** - Frontend framework
- **React Router** - Client-side routing
- **Firebase** - Backend services (Firestore, Auth)
- **Bootstrap 5** - UI framework
- **FontAwesome** - Icons
- **jsPDF & html2canvas** - PDF generation
- **@dnd-kit** - Drag and drop functionality

## 🎨 Theming

The application features a Windows Classic inspired design with:
- Professional color schemes
- Consistent button styling
- Responsive layouts
- Custom CSS variables for easy theming

Themes are managed through `src/contexts/ThemeContext.js` and `src/themes/improvedThemes.js`.

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_WEATHER_API_KEY=your-weather-api-key
```

### Weather Integration

The Daily Reports feature supports automatic weather loading. Configure your weather API:

1. Sign up for [OpenWeatherMap](https://openweathermap.org/api) or [WeatherAPI](https://www.weatherapi.com/)
2. Add your API key to the environment variables
3. Update the `getWeatherForLocation` function in `src/pages/Reports/DailyReports.js`

See `WEATHER_API_INTEGRATION.md` for detailed integration instructions.

## 📚 Documentation

- **IMPLEMENTATION_GUIDE.md** - Feature implementation details
- **WEATHER_API_INTEGRATION.md** - Weather API setup guide

## 🔒 Security & Permissions

The application includes a comprehensive role-based access control system:

- **Admin** - Full system access
- **Manager** - Project and crew management
- **Foreman** - Field operations and reporting
- **Worker** - Basic access and form submission
- **Viewer** - Read-only access

Permissions are defined in `src/contexts/AuthContext.js`.

## 🚀 Deployment

### Production Build

```bash
npm run build
```

The build folder contains the production-ready application.

### Firebase Hosting (Recommended)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

### Other Hosting Options

The built application can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3
- GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is proprietary software developed for Norskk Management.

## 📞 Support

For technical support or questions:
- Review the documentation files
- Check the implementation guides
- Contact the development team

---

**Norskk Management System** - Professional construction management made simple.
