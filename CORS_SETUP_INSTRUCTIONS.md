# Firebase Storage CORS Setup Instructions

## Current Issue
Your Firebase Storage photos can't be loaded in PDFs due to CORS (Cross-Origin Resource Sharing) restrictions.

## Option 1: Quick Setup (Do this on your local machine)

### Step 1: Install Google Cloud SDK
```bash
# On Windows: Download from https://cloud.google.com/sdk/docs/install
# On Mac: brew install google-cloud-sdk
# On Linux: 
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### Step 2: Authenticate and Set Project
```bash
gcloud auth login
gcloud config set project norskk-management
```

### Step 3: Apply CORS Configuration
```bash
# Navigate to your project directory where cors.json exists
gsutil cors set cors.json gs://norskk-management.firebasestorage.app
```

### Step 4: Verify CORS Configuration
```bash
gsutil cors get gs://norskk-management.firebasestorage.app
```

## Option 2: Alternative Firebase Console Method

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `norskk-management` project
3. Go to Storage → Rules
4. The CORS settings need to be applied at the Google Cloud Storage level, not in Firebase rules

## Option 3: Google Cloud Console Method

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project `norskk-management`
3. Go to Cloud Storage → Browser
4. Find bucket `norskk-management.firebasestorage.app`
5. Click on the bucket name
6. Go to "Configuration" tab
7. In the "CORS" section, click "Edit"
8. Add this configuration:
```json
[
  {
    "origin": [
      "http://localhost:3000",
      "https://norskk-management.firebaseapp.com",
      "https://norskk-management.web.app",
      "https://*.app.github.dev",
      "https://*.preview.app.github.dev"
    ],
    "method": ["GET", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
```

## Expected Result
After applying CORS settings:
- Photos will load properly in PDF previews
- No more CORS error messages in browser console
- Images will appear instead of placeholder messages

## Current Workaround (Already Implemented)
The system currently shows informative placeholders when photos can't be loaded due to CORS restrictions. This ensures PDFs can still be generated and downloaded successfully.

## Testing
After applying CORS settings:
1. Refresh your browser
2. Open a daily report with photos
3. Click "Preview PDF"
4. Photos should now display properly in the PDF

## Notes
- CORS changes may take a few minutes to propagate
- The GitHub Codespaces URLs (*.app.github.dev) are included in the CORS configuration
- This only affects PDF generation - photos display fine in the web interface
