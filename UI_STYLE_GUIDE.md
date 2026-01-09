# UI Style Guide for One-Pager Tool

**Purpose**: This document captures the visual design patterns and UX conventions established for the One-Pager tool. Use this as a reference when implementing similar tools or achieving design parity across projects.

## 🧬 Project Lineage

**All projects in this ecosystem derive from https://github.com/bordenet/genesis/**

This style guide ensures UI consistency across all sibling projects. When building new tools or features, these patterns are **mandatory** to maintain a cohesive user experience across the ecosystem.

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
📄 Export as Markdown          (green, prominent - Phase 3 complete ONLY)
Delete                         (red, destructive - always visible)
```

**Note:** "Export as Markdown" explicitly tells users the file format. Not all users know what Markdown is, but seeing ".md" in the description helps set expectations.

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

### Phase 3 Complete: Export Call-to-Action (CRITICAL!)

When Phase 3 is completed, users MUST see a prominent export CTA. **This is critical for usability.**

**Screen Position:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Header with Back + Export buttons]                                        │
│  [Phase Tabs: 1 | 2 | 3✓]                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Phase 3 Content Area                                                       │
│  - Copy Prompt section                                                      │
│  - Response textarea (with saved content)                                   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  🎉 Your One-Pager is Complete!              [📄 Export as Markdown]  │  │
│  │  Download your finished one-pager as a                                │  │
│  │  Markdown (.md) file.                                                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                            ↑                                                │
│              BOTTOM of content area, ABOVE navigation footer                │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  [← Previous Phase]                                              [Delete]   │
│                            ↑                                                │
│                    Navigation footer                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Container: `bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6`
- Heading: `text-lg font-semibold text-green-800 dark:text-green-300` with 🎉 emoji
- Description: `text-green-700 dark:text-green-400` — mention "Markdown (.md) file" explicitly
- Button: `px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-lg`
- Button label: `📄 Export as Markdown` (explicitly states file format)

**Rules:**
- Only appears on Phase 3 view when `phaseData.completed === true`
- Positioned at **BOTTOM of the phase content area**, immediately ABOVE the navigation footer
- Must be inside the content card, not floating or in the header
- Button triggers `exportFinalOnePager(project)` function
- Must be impossible to miss - users should never wonder "what's next?"
- Description MUST mention "Markdown (.md)" so users understand the file format

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

## 🔘 Button State Rules (CRITICAL!)

Buttons MUST follow this state diagram strictly. Incorrect states confuse users and break workflows.

### State Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PHASE WORKFLOW STATE DIAGRAM                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐     Copy Prompt     ┌──────────────┐                      │
│  │ INITIAL      │ ─────────────────▶  │ PROMPT       │                      │
│  │              │                     │ COPIED       │                      │
│  └──────────────┘                     └──────────────┘                      │
│        │                                     │                              │
│        │                                     │ Type 3+ chars                │
│        ▼                                     ▼                              │
│  ┌──────────────┐                     ┌──────────────┐                      │
│  │ Buttons:     │                     │ Buttons:     │                      │
│  │ • Copy ✓     │                     │ • Copy ✓     │                      │
│  │ • Open AI ✗  │                     │ • Open AI ✓  │                      │
│  │ • Textarea ✗ │                     │ • Textarea ✓ │                      │
│  │ • Save ✗     │                     │ • Save ✓     │                      │
│  └──────────────┘                     └──────────────┘                      │
│                                              │                              │
│                                              │ Save Response                │
│                                              ▼                              │
│                                       ┌──────────────┐                      │
│                                       │ PHASE        │                      │
│                                       │ COMPLETE     │                      │
│                                       └──────────────┘                      │
│                                              │                              │
│                                              │ Shows:                       │
│                                              │ • Next Phase → (if < 3)      │
│                                              │ • Export CTA (if phase 3)    │
│                                              ▼                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Button States by Condition

| Button | Condition | State |
|--------|-----------|-------|
| **📋 Copy Prompt** | Always | ✅ Enabled |
| **🔗 Open AI** | Before prompt copied | ❌ Disabled (`opacity-50 cursor-not-allowed pointer-events-none aria-disabled="true"`) |
| **🔗 Open AI** | After prompt copied | ✅ Enabled |
| **Response Textarea** | Before prompt copied | ❌ Disabled (`disabled` attribute) |
| **Response Textarea** | After prompt copied | ✅ Enabled (auto-focus) |
| **Save Response** | Response < 3 chars | ❌ Disabled (`disabled` attribute) |
| **Save Response** | Response ≥ 3 chars | ✅ Enabled |
| **Next Phase →** | Phase NOT completed | ❌ Hidden (not rendered) |
| **Next Phase →** | Phase completed AND phase < 3 | ✅ Visible & enabled |
| **← Previous Phase** | Phase 1 | ❌ Hidden (show "← Edit Details" instead if no response) |
| **← Previous Phase** | Phase 2 or 3 | ✅ Visible & enabled |
| **📄 Export One-Pager** | Phase 3 NOT completed | ❌ Hidden |
| **📄 Export One-Pager** | Phase 3 completed | ✅ Visible & enabled |
| **Delete** | Always | ✅ Enabled (always visible) |

### Disabled Button Styling

```css
/* For <button> elements */
.disabled:opacity-50
.disabled:cursor-not-allowed
.disabled:hover:bg-[same-as-base]  /* Prevent hover color change */

/* For <a> elements (links styled as buttons) */
.opacity-50
.cursor-not-allowed
.pointer-events-none
aria-disabled="true"
```

### Enabling Buttons Dynamically

When enabling a previously disabled button:
1. Remove disabled classes: `opacity-50`, `cursor-not-allowed`, `pointer-events-none`
2. Add hover class: `hover:bg-[color]-700`
3. Remove `aria-disabled` attribute
4. For textareas: `element.disabled = false`

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
