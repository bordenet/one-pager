# Instructions to Fix Dark Mode in product-requirements-assistant

**CRITICAL**: Dark mode toggle is broken in product-requirements-assistant but WORKING in one-pager.

---

## 🚨 Problem

The dark mode toggle button in product-requirements-assistant doesn't work when clicked. The one-pager implementation DOES work.

---

## ✅ Working Implementation (one-pager)

**Reference**: https://github.com/bordenet/one-pager/blob/main/index.html
**Live (working)**: https://bordenet.github.io/one-pager/

### HTML (index.html lines 9-15):
```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
    tailwind.config = {
        darkMode: 'class'
    }
</script>
```

**CRITICAL**: The `tailwind.config` must be set AFTER the Tailwind script loads.

### JavaScript (js/app.js):

**Lines 91-115** - Theme functions:
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

**Lines 599-607** - Load theme BEFORE init:
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

**Lines 36-41** - Event listener setup:
```javascript
function setupGlobalEventListeners() {
  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // ... other listeners
}
```

---

## 🔧 Required Changes to product-requirements-assistant

### 1. Add Tailwind Config (CRITICAL)

**File**: `docs/index.html` (and root `index.html` if it exists)

**Current** (broken):
```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>
```

**Required** (working):
```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
    tailwind.config = {
        darkMode: 'class'
    }
</script>
```

### 2. Verify JavaScript Implementation

**File**: `docs/js/app.js`

Check that:
- [ ] `loadTheme()` function exists and matches one-pager implementation
- [ ] `toggleTheme()` function exists and matches one-pager implementation
- [ ] `loadTheme()` is called BEFORE `init()` at the bottom of the file
- [ ] Event listener uses `theme-toggle` ID and calls `toggleTheme()`

---

## ✅ Testing Instructions

1. Add the Tailwind config to HTML
2. Deploy: `./scripts/deploy-web.sh` (or equivalent)
3. Commit and push
4. Wait 2-5 minutes for GitHub Pages
5. Open https://bordenet.github.io/product-requirements-assistant/
6. Hard refresh (Cmd+Shift+R)
7. Click the dark mode toggle (moon icon)
8. **VERIFY**: Page immediately switches between light and dark
9. Refresh the page
10. **VERIFY**: Dark mode preference persists

---

## 📋 Success Criteria

- [ ] Tailwind config added AFTER Tailwind script
- [ ] Dark mode toggle works on first click
- [ ] Dark mode persists after page refresh
- [ ] Linting passes
- [ ] Tests pass
- [ ] Deployed and pushed

---

**KEY INSIGHT**: The missing piece is the Tailwind config. Without `tailwind.config = { darkMode: 'class' }`, Tailwind defaults to `media` mode which only responds to system preferences, not the JavaScript toggle.
