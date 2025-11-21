# Genesis Dark Mode Implementation Guide

**AUDIENCE**: AI assistant working on the Genesis repository

**PURPOSE**: Ensure all projects generated from Genesis have working dark mode toggle out of the box

**REFERENCE**: https://github.com/bordenet/product-requirements-assistant (WORKING implementation)

---

## 🚨 Critical Issue

Projects generated from Genesis have broken dark mode toggles. Users click the button and nothing happens. This causes significant frustration and wastes time debugging the same issue in every new project.

**Root Cause**: The Genesis starter template is missing the Tailwind dark mode configuration.

---

## ✅ Working Implementation (product-requirements-assistant)

### 1. HTML Configuration

**File**: `genesis/web/index.html` (or wherever your starter template lives)

**Required in `<head>` section**:

```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
    tailwind.config = {
        darkMode: 'class'
    }
</script>
```

**CRITICAL**: 
- The `tailwind.config` MUST be set AFTER the Tailwind script loads
- Must use `darkMode: 'class'` (not `media`)
- Without this, Tailwind defaults to `media` mode which only responds to system preferences, not JavaScript toggles

### 2. HTML Button

**Required in header**:

```html
<button type="button" id="theme-toggle" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Toggle Dark Mode">
    <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
    </svg>
</button>
```

**Key details**:
- ID must be `theme-toggle` (matches JavaScript)
- SVG moon icon (professional, matches PRD Assistant)
- Hover states for both light and dark modes

### 3. JavaScript Implementation

**File**: `genesis/web/js/app.js` (or wherever your starter JS lives)

**Required functions**:

```javascript
/**
 * Load saved theme
 */
function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
}

/**
 * Toggle dark/light theme
 */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  
  if (isDark) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}
```

**Required event listener** (in setupEventListeners or equivalent):

```javascript
// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}
```

**Required initialization** (at the BOTTOM of the file, BEFORE init):

```javascript
// Load theme before init
loadTheme();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

**CRITICAL**: `loadTheme()` MUST be called BEFORE the app initializes to prevent flash of wrong theme.

---

## 📋 Complete Checklist for Genesis

Update these files in the Genesis starter template:

### HTML (`genesis/web/index.html`)
- [ ] Add Tailwind script tag
- [ ] Add `tailwind.config = { darkMode: 'class' }` AFTER Tailwind loads
- [ ] Add `theme-toggle` button in header with SVG icon
- [ ] Ensure `<html>` tag has no hardcoded `class="dark"`
- [ ] Add dark mode classes to body: `class="bg-gray-50 dark:bg-gray-900"`

### JavaScript (`genesis/web/js/app.js`)
- [ ] Add `loadTheme()` function
- [ ] Add `toggleTheme()` function
- [ ] Add event listener for `theme-toggle` button
- [ ] Call `loadTheme()` BEFORE app initialization
- [ ] Remove any old `initDarkMode()` or `toggleDarkMode()` functions

### CSS (if applicable)
- [ ] Ensure all components have dark mode variants using `dark:` prefix
- [ ] Test that all text is readable in both modes
- [ ] Test that all buttons/links are visible in both modes

---

## 🧪 Testing Instructions

After updating Genesis, create a test project:

1. Run Genesis to create a new project
2. Deploy the project: `./scripts/deploy-web.sh`
3. Open the deployed site
4. **TEST 1**: Click dark mode toggle - page should immediately switch
5. **TEST 2**: Refresh page - dark mode preference should persist
6. **TEST 3**: Open in new incognito window - should default to system preference
7. **TEST 4**: Toggle in incognito - should work and persist

**Success Criteria**: All 4 tests pass without any code changes to the generated project.

---

## 🎯 Why This Matters

**Before** (current Genesis):
- Generate new project
- Deploy
- User clicks dark mode toggle
- Nothing happens
- User reports bug
- AI spends 30+ minutes debugging
- Multiple deploy cycles
- Frustration

**After** (fixed Genesis):
- Generate new project
- Deploy
- Dark mode works immediately
- Zero debugging needed
- User is happy

---

## 📚 Reference Implementations

**Working (copy from these)**:
- https://github.com/bordenet/product-requirements-assistant/blob/main/docs/index.html
- https://github.com/bordenet/product-requirements-assistant/blob/main/docs/js/app.js
- https://github.com/bordenet/one-pager/blob/main/index.html
- https://github.com/bordenet/one-pager/blob/main/js/app.js

**Key insight**: Both working implementations are IDENTICAL in their dark mode approach. Genesis should generate this exact pattern.

---

## 🔑 Key Takeaways

1. **Tailwind config is mandatory**: `tailwind.config = { darkMode: 'class' }` after script loads
2. **Load theme early**: Call `loadTheme()` before app init to prevent flash
3. **Use standard IDs**: `theme-toggle` (not `darkModeToggle` or other variants)
4. **Use localStorage key 'theme'**: Store as 'light' or 'dark' (not boolean)
5. **Test before shipping**: Create a test project and verify dark mode works

---

**BOTTOM LINE**: Copy the exact implementation from product-requirements-assistant. It works perfectly. Don't reinvent it.

