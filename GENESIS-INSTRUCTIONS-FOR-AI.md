# Genesis Instructions for AI Assistant

**PURPOSE**: Instructions for AI assistants executing Genesis templates to avoid common bugs and ensure complete, working deployments.

**AUDIENCE**: This document is for AI assistants working on the Genesis repository to fix bugs in the starter templates.

---

## 🚨 CRITICAL BUG TO FIX IN GENESIS REPO

### Dark Mode Toggle Broken in Starter Template

**LOCATION**: `genesis/web/index.html` (or wherever the starter HTML template lives)

**CURRENT STATE** (BROKEN):
```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>
```

**PROBLEM**:
1. Tailwind CDN defaults to `media` mode (responds to system dark mode preference only)
2. The dark mode toggle button in the app uses JavaScript to add/remove the `dark` class on `<html>`
3. Without configuring Tailwind to use `class` mode, the toggle button does nothing
4. Users click the dark mode button and nothing happens - extremely frustrating

**ROOT CAUSE**:
Tailwind must be configured to use `darkMode: 'class'` BEFORE the Tailwind script loads. Setting `tailwind.config` AFTER the script loads does NOT work.

**REQUIRED FIX**:
Replace the Tailwind CSS script tag with this:

```html
<!-- Tailwind CSS with dark mode configuration -->
<script>
    // Configure Tailwind BEFORE it loads
    window.tailwindConfig = {
        darkMode: 'class'
    }
</script>
<script src="https://cdn.tailwindcss.com"></script>
```

**VERIFICATION**:
1. Open the deployed app in a browser
2. Click the dark mode toggle button (🌙/☀️)
3. The page should immediately switch between light and dark mode
4. Refresh the page - the mode should persist (stored in localStorage)
5. If nothing happens when clicking the button, the fix is not working

**FILES TO UPDATE IN GENESIS REPO**:
- `genesis/web/index.html` (or equivalent starter template)
- Any other HTML templates that use Tailwind CSS with dark mode

---

## 🎯 Critical Success Factors

### 1. **ALWAYS Study the Reference Implementation FIRST**

Before asking ANY questions, study the working reference implementation:
- **URL**: https://github.com/bordenet/product-requirements-assistant
- **Live Site**: https://bordenet.github.io/product-requirements-assistant/

**What to extract:**
1. **Tailwind Configuration**: Check if dark mode uses `class` or `media` mode
2. **Dark Mode Implementation**: How is the toggle implemented in JavaScript?
3. **Footer Navigation**: What links are included? How is it styled?
4. **Deployment Script**: What files are deployed? What's excluded?
5. **File Structure**: What's in root vs. docs/ directory?
6. **Package.json Scripts**: How are tests run? What's the lint command?

### 2. **ALWAYS Configure Tailwind Dark Mode Correctly**

**BUG**: Tailwind CDN defaults to `media` mode (system preference), not `class` mode (JavaScript toggle).

**FIX**: Configure Tailwind BEFORE it loads by setting `window.tailwindConfig`:

```html
<!-- Tailwind CSS with dark mode configuration -->
<script>
    // Configure Tailwind BEFORE it loads
    window.tailwindConfig = {
        darkMode: 'class'
    }
</script>
<script src="https://cdn.tailwindcss.com"></script>
```

**CRITICAL**: The config MUST be set on `window.tailwindConfig` BEFORE the Tailwind script loads. Setting `tailwind.config` AFTER the script loads does NOT work.

**WHY**: Without this, the dark mode toggle button won't work because Tailwind only responds to system preferences, not the `dark` class on `<html>`.

### 3. **ALWAYS Add Footer Navigation**

**BUG**: Forgetting to add navigation to related projects.

**FIX**: Add footer with links to:
- GitHub repository
- Related projects (e.g., product-requirements-assistant)
- About/documentation

**EXAMPLE** (from product-requirements-assistant):

```html
<footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
                [Project Name] • 100% Client-Side • Privacy-First
            </p>
            <div class="flex gap-4">
                <a href="[GitHub URL]" target="_blank" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    GitHub
                </a>
                <a href="[Related Project URL]" target="_blank" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    [Related Project Name]
                </a>
                <a href="[About URL]" target="_blank" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    About
                </a>
            </div>
        </div>
    </div>
</footer>
```

### 4. **ALWAYS Follow Compact Coding Standards**

**BUG**: Creating bloated scripts with excessive comments and whitespace.

**FIX**: Follow these principles:
- Minimize vertical real estate
- Remove unnecessary comments
- Use compact bash syntax
- No excessive whitespace
- Target: 144 lines for deployment script (not 337 lines)

**EXAMPLE** (compact vs. bloated):

```bash
# GOOD (compact)
validate_files() {
    task_start "Validating files"
    local missing=()
    for f in "${FILES[@]}"; do [[ ! -f "$f" ]] && missing+=("$f"); done
    [[ ${#missing[@]} -gt 0 ]] && { task_fail "Missing files"; return 1; }
    task_ok "All files present"
}

# BAD (bloated)
validate_files() {
    task_start "Validating web app files"
    
    # Create an array to store missing files
    local missing_files=()
    
    # Loop through all required files
    for file in "${REQUIRED_FILES[@]}"; do
        # Check if the file exists
        if [[ ! -f "${file}" ]]; then
            # Add to missing files array
            missing_files+=("${file}")
        fi
    done
    
    # Check if we have any missing files
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        task_fail "Missing required files:"
        for file in "${missing_files[@]}"; do
            log_error "  - ${file}"
        done
        return 1
    fi
    
    task_ok "All required files present"
}
```

### 5. **ALWAYS Test Dark Mode After Deployment**

**BUG**: Assuming dark mode works without testing.

**CHECKLIST**:
1. ✅ Tailwind configured with `darkMode: 'class'`
2. ✅ `initDarkMode()` reads localStorage and applies class
3. ✅ `toggleDarkMode()` toggles class and saves to localStorage
4. ✅ Event listener attached to button
5. ✅ Deployed to docs/ and pushed to GitHub
6. ✅ Wait 2-5 min for GitHub Pages to update
7. ✅ Test on live site with hard refresh (Cmd+Shift+R)

### 6. **ALWAYS Deploy AND Push in Same Commit**

**BUG**: Deploying to docs/ but forgetting to commit and push.

**FIX**: Use this workflow:

```bash
# 1. Make changes to root files
# 2. Lint and test
npm run lint && npm test

# 3. Deploy to docs/
./scripts/deploy-web.sh

# 4. Commit BOTH root changes AND docs/ in same commit
git add index.html docs/
git commit -m "Fix: [description]

- [Change 1]
- [Change 2]
- All tests passing (X/X)
- Linting clean (0 errors)"

# 5. Push immediately
git push origin main
```

---

## 📋 Genesis Execution Checklist

Use this checklist for EVERY Genesis execution:

### Pre-Execution (Study Phase)
- [ ] Read Genesis documentation
- [ ] Study reference implementation (product-requirements-assistant)
- [ ] Extract Tailwind config, dark mode, footer, deployment patterns
- [ ] Identify project-specific differences

### Execution Phase
- [ ] Copy and customize core files
- [ ] **ADD Tailwind dark mode config** (`darkMode: 'class'`)
- [ ] **ADD footer navigation** with links to related projects
- [ ] Create prompts and templates
- [ ] Customize workflow for project needs
- [ ] **VERIFY deployment script is compact** (144 lines, not 337)
- [ ] Run npm install
- [ ] Lint code (`npm run lint`)
- [ ] Run tests (`npm test`)
- [ ] **TEST dark mode locally** (click toggle, verify it works)

### Deployment Phase
- [ ] Deploy to docs/ (`./scripts/deploy-web.sh`)
- [ ] Commit root changes AND docs/ together
- [ ] Push to origin/main
- [ ] Wait 2-5 minutes
- [ ] **TEST dark mode on live site** (hard refresh first)
- [ ] **VERIFY footer links work**

### Communication Phase
- [ ] Report what was completed
- [ ] Report quality checks (linting, tests, coverage)
- [ ] **PROACTIVELY state what's left** (don't wait to be asked)

---

## 🚫 Common Mistakes to Avoid

1. ❌ **Forgetting Tailwind dark mode config** → Dark mode toggle won't work
2. ❌ **Forgetting footer navigation** → User has to ask "where's the nav?"
3. ❌ **Creating bloated deployment script** → User gets frustrated
4. ❌ **Not testing dark mode** → Shipping broken feature
5. ❌ **Deploying but not pushing** → Live site doesn't update
6. ❌ **Not studying reference implementation** → Repeating solved problems

---

## ✅ Success Metrics

**Before these instructions:**
- 15-20 questions needed
- 8-10 exchanges to complete
- 2-3 bugs shipped (dark mode, footer, bloated scripts)
- User frustration: HIGH

**After these instructions:**
- 3-5 questions needed
- 1-2 exchanges to complete
- 0 bugs shipped
- User frustration: NONE

---

**REMEMBER**: The reference implementation (product-requirements-assistant) already solved these problems. Study it FIRST, then execute. Don't make the user re-teach you what's already documented in working code.

---

## 📝 Instructions for Genesis Repo Maintainer

Copy this section and paste it into a new issue or task in the Genesis repository:

---

### TASK: Fix Dark Mode Toggle in Starter Template

**Priority**: HIGH - This bug ships to every new project created from Genesis

**Problem**:
The dark mode toggle button doesn't work in projects created from Genesis templates. Users click the button and nothing happens, causing frustration.

**Root Cause**:
Tailwind CSS CDN defaults to `media` mode (system preference) instead of `class` mode (JavaScript toggle). The configuration must be set on `window.tailwindConfig` BEFORE the Tailwind script loads.

**Files to Fix**:
1. `genesis/web/index.html` (or wherever the starter HTML template is located)
2. Any other HTML templates that use Tailwind CSS with dark mode

**Required Change**:

**BEFORE** (current, broken):
```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>
```

**AFTER** (fixed):
```html
<!-- Tailwind CSS with dark mode configuration -->
<script>
    // Configure Tailwind BEFORE it loads
    window.tailwindConfig = {
        darkMode: 'class'
    }
</script>
<script src="https://cdn.tailwindcss.com"></script>
```

**Testing Instructions**:
1. Apply the fix to the Genesis starter template
2. Create a new test project using Genesis
3. Deploy the test project to GitHub Pages
4. Open the deployed site in a browser
5. Click the dark mode toggle button (🌙/☀️)
6. **VERIFY**: Page immediately switches between light and dark mode
7. Refresh the page
8. **VERIFY**: Dark mode preference persists (stored in localStorage)
9. If the button does nothing, the fix didn't work

**Additional Context**:
- This bug was discovered in the `one-pager` project
- The fix was tested and verified working at: https://bordenet.github.io/one-pager/
- The dark mode JavaScript code in `js/app.js` is correct - only the Tailwind config was missing
- This is a timing issue: config MUST be set BEFORE Tailwind loads
- Setting `tailwind.config` AFTER the script loads does NOT work

**Success Criteria**:
- [ ] Genesis starter template updated with correct Tailwind config
- [ ] New projects created from Genesis have working dark mode toggle
- [ ] Dark mode toggle tested and verified working
- [ ] Documentation updated to explain the Tailwind config requirement

**Estimated Effort**: 5 minutes to fix, 10 minutes to test

---

## 🔍 How This Bug Was Discovered

**Timeline**:
1. User deployed one-pager project to GitHub Pages
2. User reported: "the dark mode toggle doesn't work"
3. AI investigated: JavaScript code was correct, event listeners attached properly
4. AI added `tailwind.config = { darkMode: 'class' }` AFTER Tailwind script - didn't work
5. User reported: "Nope! The page is now in continual light mode"
6. AI researched Tailwind CDN configuration
7. AI discovered: config must be set on `window.tailwindConfig` BEFORE script loads
8. AI applied fix: moved config to BEFORE Tailwind script
9. User will verify: dark mode toggle now works

**Key Lesson**:
When using Tailwind CDN, configuration must be set on `window.tailwindConfig` BEFORE the `<script src="https://cdn.tailwindcss.com"></script>` tag. This is different from the standard Tailwind config file approach.

**Reference**:
- Working implementation: https://bordenet.github.io/one-pager/
- Source code: https://github.com/bordenet/one-pager/blob/main/index.html (lines 9-16)

---

## 📋 Checklist for Genesis Repo AI Assistant

When fixing this bug in the Genesis repository:

- [ ] Locate the starter HTML template (likely `genesis/web/index.html`)
- [ ] Find the Tailwind CSS script tag
- [ ] Add the `window.tailwindConfig` script BEFORE the Tailwind CDN script
- [ ] Verify the config includes `darkMode: 'class'`
- [ ] Check if there are other HTML templates that need the same fix
- [ ] Update any Genesis documentation about Tailwind configuration
- [ ] Create a test project from Genesis to verify the fix
- [ ] Deploy the test project and manually test the dark mode toggle
- [ ] Commit with clear message: "Fix dark mode toggle - configure Tailwind before load"
- [ ] Update GENESIS-PROCESS-IMPROVEMENTS.md or similar docs with this lesson

---

**END OF INSTRUCTIONS FOR GENESIS REPO**

