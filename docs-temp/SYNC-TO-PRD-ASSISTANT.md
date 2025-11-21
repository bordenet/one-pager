# Instructions for Syncing Changes to product-requirements-assistant

**AUDIENCE**: This document is for the AI assistant working on the `product-requirements-assistant` repository.

**PURPOSE**: Document that one-pager has been synced TO MATCH product-requirements-assistant.

---

## 🎯 What Was Synced

The `one-pager` project has been updated to MATCH `product-requirements-assistant`:
1. ✅ Sophisticated header with icon, tagline, and dropdown navigation
2. ✅ Dark mode toggle (SVG icon) using `theme-toggle` ID
3. ✅ Footer with links to related projects
4. ✅ Dark mode implementation using `loadTheme()` before init
5. ✅ Tailwind config set AFTER loading (like PRD Assistant)

**NO CHANGES NEEDED** to product-requirements-assistant - it's the reference implementation!

---

## ✅ Dark Mode Already Works in PRD Assistant

**GOOD NEWS**: The dark mode implementation in PRD Assistant is correct and doesn't need changes.

**How it works**:
- Uses `loadTheme()` function that runs BEFORE app initialization
- Uses `theme-toggle` as the button ID
- Stores preference in localStorage as 'theme' (not 'darkMode')
- Tailwind config is set AFTER loading: `tailwind.config = { darkMode: 'class' }`

**No changes needed** - this is the reference implementation that one-pager now matches.

---

## 📝 Update Related Projects Dropdown

**CURRENT STATE**:
The dropdown in `product-requirements-assistant` has:
- One-Pager Generator (already there!)
- Genesis Templates

**REQUIRED CHANGE**:
Update the link text to match:

```html
<a href="https://bordenet.github.io/one-pager/" target="_blank" rel="noopener" class="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
    <div class="font-medium text-gray-900 dark:text-white">One-Pager Assistant</div>
    <div class="text-xs text-gray-500 dark:text-gray-400">Create concise one-page documents</div>
</a>
```

**NOTE**: The link is already there, just verify the text says "One-Pager Assistant" (not "One-Pager Generator").

---

## 📋 Footer Links

**CURRENT STATE**:
The footer in `product-requirements-assistant` has:
- GitHub
- One-Pager (already there!)
- Genesis
- About

**REQUIRED CHANGE**:
Verify the One-Pager link points to: `https://bordenet.github.io/one-pager/`

---

## ✅ Verification Checklist

After making changes:

- [ ] Tailwind config added BEFORE Tailwind script loads
- [ ] Dark mode toggle works (click the moon/sun icon)
- [ ] Dark mode persists after page refresh
- [ ] Related Projects dropdown opens when clicking lightning bolt
- [ ] Dropdown closes when clicking outside
- [ ] All links in dropdown work
- [ ] All footer links work
- [ ] Linting passes: `npm run lint`
- [ ] Tests pass: `npm test`
- [ ] Deployed to docs/
- [ ] Committed and pushed to origin/main

---

## 🔧 Testing Instructions

1. Apply the Tailwind config fix
2. Deploy to docs/: `./scripts/deploy-web.sh` (or equivalent)
3. Commit and push
4. Wait 2-5 minutes for GitHub Pages to update
5. Open https://bordenet.github.io/product-requirements-assistant/
6. Hard refresh (Cmd+Shift+R)
7. Click the dark mode toggle - page should immediately switch
8. Refresh - dark mode preference should persist
9. Click the lightning bolt - dropdown should appear
10. Click outside - dropdown should close

---

## 📚 Reference Implementation

**Source**: https://github.com/bordenet/one-pager/blob/main/index.html

**Key sections to review**:
- Lines 9-16: Tailwind dark mode configuration
- Lines 22-67: Header with icon, tagline, dropdown, dark mode toggle
- Lines 136-156: Footer with related project links
- `js/app.js` lines 36-89: Dropdown menu JavaScript

---

## 🎯 Success Criteria

- [ ] Dark mode toggle works on deployed site
- [ ] Both projects have consistent navigation
- [ ] Both projects link to each other
- [ ] No linting errors
- [ ] All tests passing
- [ ] Changes deployed and pushed

---

**REMEMBER**: The Tailwind config MUST be set on `window.tailwindConfig` BEFORE the Tailwind CDN script loads. This is the most critical fix.
