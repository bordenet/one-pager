# UI Style Guide for One-Pager Tool

**Purpose**: This document captures the visual design patterns and UX conventions established for the One-Pager tool. Use this as a reference when implementing similar tools or achieving design parity across projects.

---

## 🎨 Button Styles & Colors

### Primary Action Buttons

| Button Type | Color Class | Use Case |
|-------------|-------------|----------|
| **Copy/Primary** | `bg-blue-600 hover:bg-blue-700` | Main workflow actions (Copy Prompt, Next Phase) |
| **Save/Success** | `bg-green-600 hover:bg-green-700` | Save operations, external links (Open AI) |
| **Delete/Danger** | `bg-red-600 hover:bg-red-700` | Destructive actions (always requires confirmation) |
| **Secondary/Navigation** | `bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600` | Back, Previous Phase, Edit Details |
| **Tertiary/View** | `bg-gray-600 hover:bg-gray-700` | View Prompt, informational actions |

### Button Copy (IMPORTANT!)

Use these exact labels for consistency:

```
📋 Copy Prompt to Clipboard    (blue, primary action)
🔗 Open Claude                 (green, external link - Phase 1 & 3)
🔗 Open Gemini                 (green, external link - Phase 2)
👁️ View Prompt                 (gray, secondary action)
Save Response                  (green, after pasting AI response)
Next Phase →                   (blue, advances workflow)
← Previous Phase               (gray, goes back)
← Edit Details                 (gray, returns to form - Phase 1 only, before response saved)
Delete                         (red, destructive - always visible)
```

---

## 📐 Button Layout Patterns

### Data Entry Form (Initial Form)

```
[Next Phase →]                                              [Delete]
     ↑                                                          ↑
  Left side (blue)                                    Right side (red)
```

- **No Save button** - Next Phase saves automatically
- Footer is **outside** the card (below it)
- Required field asterisks displayed in **red** (`<span class="text-red-500">*</span>`)

### Phase Views (1, 2, 3)

```
[← Edit Details] or [← Previous Phase]  [Next Phase →]      [Delete]
         ↑                                    ↑                 ↑
   Left side (gray)                    Left side (blue)   Right side (red)
```

- Phase 1 before response: Shows "← Edit Details" (returns to form)
- Phase 1 after response: No back button
- Phases 2-3: Shows "← Previous Phase"
- "Next Phase →" only appears when current phase is completed
- Delete button **always visible** on the right

### Step A (Copy Prompt Section)

```
[📋 Copy Prompt to Clipboard]  [🔗 Open Claude/Gemini]     [👁️ View Prompt]
          ↑                            ↑                         ↑
    Left (blue)              Left (green, disabled       Right side (gray)
                             until prompt copied)
```

- "Open AI" link is **disabled** until prompt is copied (opacity-50, pointer-events-none)
- After copying, link becomes active and opens in named tab `target="ai-assistant-tab"`

---

## 🪟 Modal Dialogs

### View Prompt Modal

- **Background**: `bg-black bg-opacity-50` (semi-transparent overlay)
- **Modal container**: `bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh]`
- **Header**: Title + close button (×) in top-right
- **Content area**: Scrollable, monospace font, `bg-gray-50 dark:bg-gray-900` background
- **Footer**: Single "Close" button (gray)
- **Dismissal**: Click ×, click Close button, click backdrop, or press Escape

### Confirmation Dialog

- Same modal structure as View Prompt
- Two buttons: "Cancel" (gray, left) and action button (red for delete, blue for others)
- Title clearly states the action
- Body explains consequences

---

## 🧭 Navigation Patterns

### Footer Button Placement

- **Left side**: Navigation/back actions, then forward actions
- **Right side**: Destructive actions (Delete)
- **Spacing**: `flex justify-between items-center`
- **Button groups**: `flex space-x-3` for multiple buttons on same side

### Phase Tab Navigation

- Three tabs (Phase 1, Phase 2, Phase 3) at top of project view
- Active tab: `bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300`
- Completed phases show checkmark icon
- Clicking tab switches view without navigation

---

## ✅ Form Field Patterns

### Required Fields

```html
<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Field Name <span class="text-red-500">*</span>
</label>
```

### Input/Textarea Classes

```
w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
focus:ring-2 focus:ring-blue-500 focus:border-transparent
dark:bg-gray-700 dark:text-white
```

---

## 🧪 Test Coverage for UI Workflows

Ensure these test cases exist:

1. **Button rendering**: Verify correct buttons appear on each view
2. **Button state**: Test disabled/enabled states (e.g., Open AI disabled until copy)
3. **Modal behavior**: Test open, close (all methods), escape key
4. **Navigation flow**: Test phase transitions, back navigation
5. **Form validation**: Test required fields, error messages
6. **Confirmation dialogs**: Test cancel vs. confirm behavior

---

**Reference**: See `js/ui.js`, `js/views.js`, and `js/project-view.js` for implementation details.
