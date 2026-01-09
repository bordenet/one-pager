---
description: UI Style Guide for One-Pager Generator and sibling projects
applyTo: '**/*.html,**/*.js,**/*.css,**/*.jsx,**/*.tsx,**/*.vue,**/*.svelte'
---

# UI Style Guide Reference

This project maintains a comprehensive UI Style Guide at `UI_STYLE_GUIDE.md` in the repository root.

## For Sibling Projects

If you are working on a sibling project that should follow the same UI conventions:

1. **Reference the canonical style guide**: https://github.com/bordenet/one-pager/blob/main/UI_STYLE_GUIDE.md
2. **Key conventions to follow**:

### Button Colors
- **Blue** (`bg-blue-600`): Primary actions (Copy, Next Phase)
- **Green** (`bg-green-600`): Success/save actions (Save Response, Export, external links)
- **Red** (`bg-red-600`): Destructive actions (Delete) - always on the right
- **Gray** (`bg-gray-200 dark:bg-gray-700`): Secondary/navigation (Previous, Edit)

### Button Labels (Use Exact Copy)
```
📋 Copy Prompt to Clipboard
🔗 Open Claude
🔗 Open Gemini
👁️ View Prompt
Save Response
Next Phase →
← Previous Phase
← Edit Details
📄 Export One-Pager
Delete
```

### Layout Rules
- Delete button: **Always on the right side**
- Navigation buttons: **Always on the left side**
- Required field asterisks: Use red (`<span class="text-red-500">*</span>`)

### Completion States (CRITICAL!)
When a workflow/phase is complete, ALWAYS show a prominent call-to-action:

```html
<div class="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
  <div class="flex items-center justify-between flex-wrap gap-4">
    <div>
      <h4 class="text-lg font-semibold text-green-800 dark:text-green-300">
        🎉 [Completion Message]
      </h4>
      <p class="text-green-700 dark:text-green-400 mt-1">
        [Next step instruction]
      </p>
    </div>
    <button class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-lg">
      [Primary Action Button]
    </button>
  </div>
</div>
```

**Users must NEVER wonder "what's next?" after completing a workflow.**

### Modal Dismissal
Modals must be dismissible via:
- × close button
- "Close" button in footer
- Clicking backdrop
- Pressing Escape key

## Quick Reference

For full details including ASCII diagrams and all patterns, see:
- Local: `UI_STYLE_GUIDE.md`
- Remote: https://github.com/bordenet/one-pager/blob/main/UI_STYLE_GUIDE.md
