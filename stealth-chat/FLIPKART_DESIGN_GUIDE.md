# 🎨 Flipkart Design System & Asset Guide

## 📊 Official Flipkart Colors

### Primary Colors
```css
/* Primary Blue */
--flipkart-blue: #2874F0;
--flipkart-blue-dark: #1B5BC6;
--flipkart-blue-light: #4F8EF7;

/* Secondary Colors */
--flipkart-yellow: #FFE11B;
--flipkart-yellow-dark: #F2C200;

/* Success/Green */
--flipkart-green: #26A541;
--flipkart-green-dark: #1F8B3C;

/* Background Colors */
--flipkart-grey: #F1F2F6;
--flipkart-grey-dark: #E4E4E4;
--flipkart-grey-light: #FAFAFA;

/* Text Colors */
--flipkart-text: #212121;
--flipkart-text-secondary: #878787;
--flipkart-text-light: #B8B8B8;
```

### Color Usage Guidelines
- **Primary Blue**: Headers, buttons, links, primary actions
- **Yellow**: Search button, highlights, CTAs
- **Green**: Success states, "Add to Cart", positive actions
- **Grey**: Backgrounds, cards, neutral elements

## 🖼️ Getting Official Flipkart Assets

### Method 1: Browser Inspector
1. Visit https://www.flipkart.com
2. Right-click → "Inspect Element"
3. Go to Network tab → Filter by "Images"
4. Refresh page to see all image requests
5. Find and download:
   - Logo: `fkheaderlogo_exploreplus-44005d.svg`
   - Icons: Various category and UI icons
   - Banners: Marketing banners

### Method 2: CDN Direct Links
```html
<!-- Flipkart Logo -->
<img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg" alt="Flipkart">

<!-- Category Icons -->
<img src="https://rukminim1.flixcart.com/flap/128/128/image/29327f40e9c4d26b.png" alt="Grocery">
<img src="https://rukminim1.flixcart.com/flap/128/128/image/22fddf3c7da4c4f4.png" alt="Mobiles">
```

### Method 3: Using Browser DevTools
1. Press F12 on Flipkart website
2. Select Elements tab
3. Find image elements
4. Right-click on src URLs → "Open in new tab"
5. Save images directly

## 🔧 Fixing Header Visibility Issues

### Common White-on-White Problems

#### Issue 1: Search Bar Visibility
```css
/* Bad - White text on white background */
.search-input {
  background: white;
  color: white; /* ❌ Not visible */
}

/* Good - Dark text on white background */
.search-input {
  background: white;
  color: #212121; /* ✅ Visible */
  border: 1px solid #E4E4E4;
}
```

#### Issue 2: Button Contrast
```css
/* Bad - Poor contrast */
.login-btn {
  background: white;
  color: #f0f0f0; /* ❌ Poor contrast */
}

/* Good - High contrast */
.login-btn {
  background: white;
  color: #2874F0; /* ✅ High contrast */
  border: 1px solid #E4E4E4;
}
```

#### Issue 3: Header Elements
```css
/* Ensure proper contrast in header */
.header-blue {
  background: #2874F0;
  color: white; /* ✅ Good contrast */
}

.header-white {
  background: white;
  color: #212121; /* ✅ Good contrast */
  border-bottom: 1px solid #E4E4E4;
}
```

## 🎯 Environment Variables Guide

### Current Variables in .env.local
```bash
# Authentication
NEXT_PUBLIC_MAIN_PASSWORD=flipkart123    # Main access password
NEXT_PUBLIC_ADMIN_PASSWORD=admin123      # Admin panel access

# Database
MONGODB_URI=mongodb://localhost:27017/stealth-chat

# External Services
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### How to Get Missing Variables

#### Cloudinary (for image uploads)
1. Visit https://cloudinary.com
2. Sign up for free account
3. Go to Dashboard
4. Copy:
   - Cloud Name
   - API Key
   - API Secret

#### MongoDB (for production database)
1. Visit https://mongodb.com/atlas
2. Create free cluster
3. Get connection string
4. Replace in MONGODB_URI

#### JWT Secret (for security)
```bash
# Generate secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🔍 Debugging Header Issues

### Step 1: Check CSS Classes
```javascript
// In browser console, check computed styles
const element = document.querySelector('.your-header-element');
const styles = window.getComputedStyle(element);
console.log('Color:', styles.color);
console.log('Background:', styles.backgroundColor);
```

### Step 2: Inspect Element Structure
1. Right-click on invisible element
2. Select "Inspect"
3. Check CSS properties in Styles panel
4. Look for conflicting styles

### Step 3: Test Contrast
```javascript
// Check color contrast ratio
function getContrast(foreground, background) {
  // Implementation to calculate contrast ratio
  // Should be at least 4.5:1 for normal text
}
```

## 🎨 Recommended Color Combinations

### Header Combinations
```css
/* Blue header with white text */
.header-blue {
  background: #2874F0;
  color: white;
}

/* White header with dark text */
.header-white {
  background: white;
  color: #212121;
  border-bottom: 1px solid #E4E4E4;
}
```

### Button Combinations
```css
/* Primary button */
.btn-primary {
  background: #2874F0;
  color: white;
  border: none;
}

/* Secondary button */
.btn-secondary {
  background: white;
  color: #2874F0;
  border: 1px solid #2874F0;
}
```

## 🚀 Quick Fixes for Current Issues

### Update Tailwind Config
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'flipkart-blue': '#2874F0',
      'flipkart-blue-dark': '#1B5BC6',
      'flipkart-yellow': '#FFE11B',
      'flipkart-green': '#26A541',
      'flipkart-grey': '#F1F2F6',
    }
  }
}
```

### CSS Custom Properties
```css
/* globals.css */
:root {
  --flipkart-blue: #2874F0;
  --flipkart-yellow: #FFE11B;
  --flipkart-green: #26A541;
  --flipkart-grey: #F1F2F6;
  --text-primary: #212121;
  --text-secondary: #878787;
}
```

## 📱 Mobile Optimization
- Ensure touch targets are at least 44px
- Use proper viewport meta tag
- Test on various screen sizes
- Optimize image loading for mobile

This guide should help you get authentic Flipkart styling and fix any visibility issues!
