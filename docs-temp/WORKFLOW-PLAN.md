# Workflow Plan: Fix Dark Mode Across All Projects

**GOAL**: Get dark mode working consistently across all projects, then update Genesis to generate it correctly.

---

## 📋 Step-by-Step Plan

### Step 1: Fix product-requirements-assistant (FIRST)
**Status**: ❌ Dark mode broken
**Action**: User needs to tell Claude instance working on PRD Assistant to:
1. Read `FIX-PRD-ASSISTANT-INSTRUCTIONS.md` from one-pager repo
2. Add Tailwind config AFTER Tailwind script loads
3. Verify JavaScript implementation matches one-pager
4. Test, deploy, push

**Instructions to give Claude**:
```
The dark mode toggle is broken. Please read this file and follow the instructions:
https://raw.githubusercontent.com/bordenet/one-pager/main/FIX-PRD-ASSISTANT-INSTRUCTIONS.md

The key fix is adding this AFTER the Tailwind script in index.html:
<script>
    tailwind.config = {
        darkMode: 'class'
    }
</script>

Reference the working implementation at:
https://github.com/bordenet/one-pager/blob/main/index.html (lines 9-15)
https://github.com/bordenet/one-pager/blob/main/js/app.js (lines 91-115, 599-607)
```

---

### Step 2: Verify one-pager Still Works
**Status**: ✅ Dark mode working
**Action**: No changes needed - this is the reference implementation

---

### Step 3: Update Genesis Template
**Status**: ⏳ Pending (after Step 1 complete)
**Action**: User needs to tell Claude instance working on Genesis to:
1. Update the starter HTML template to include Tailwind config
2. Update the starter JavaScript to include loadTheme() and toggleTheme()
3. Ensure all new projects generated from Genesis have working dark mode

**Files to update in Genesis**:
- `genesis/web/index.html` (or wherever starter template lives)
- `genesis/web/js/app.js` (or wherever starter JS lives)

---

### Step 4: Test Genesis by Creating New Project
**Status**: ⏳ Pending (after Step 3 complete)
**Action**:
1. Use Genesis to create a test project
2. Deploy the test project
3. Verify dark mode works out of the box
4. If working, Genesis is fixed!

---

## 🎯 Success Criteria

- [ ] product-requirements-assistant: Dark mode toggle works
- [ ] one-pager: Dark mode toggle works (already done)
- [ ] Genesis: Generates projects with working dark mode
- [ ] New projects from Genesis: Dark mode works immediately

---

## 📝 Key Learnings

1. **Tailwind Config is Critical**: Must set `tailwind.config = { darkMode: 'class' }` AFTER Tailwind loads
2. **Genesis is the Source of Truth**: Fix the template, not individual projects
3. **Reference Implementation**: one-pager is now the working reference
4. **Test Before Propagating**: Fix PRD Assistant first, verify it works, then update Genesis

---

## 🔄 Current Status

**NEXT ACTION**: User needs to fix product-requirements-assistant first using the instructions in `FIX-PRD-ASSISTANT-INSTRUCTIONS.md`

Once that's working, come back here and we'll update Genesis together.
