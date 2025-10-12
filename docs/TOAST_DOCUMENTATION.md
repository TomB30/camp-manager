# Toast Notification System

## Overview

A beautiful, animated toast notification system has been implemented to replace all native `alert()` calls. The toast system provides better UX with styled notifications that automatically dismiss.

## Components

### Toast Component (`src/components/Toast.vue`)
The main toast display component that renders notifications in the top-right corner of the screen.

**Features:**
- 4 types: success, error, warning, info
- Auto-dismiss after configurable duration
- Click to dismiss
- Smooth animations (slide in from right)
- Mobile responsive
- Supports detailed messages
- Icon for each type
- Color-coded borders

### Toast Store (`src/stores/toastStore.ts`)
Pinia store that manages the toast state and provides methods to add/remove toasts.

### Toast Composable (`src/composables/useToast.ts`)
Helper composable for easy toast usage in components.

## Usage

### Option 1: Using the Composable (Recommended for Composition API)

```vue
<script setup lang="ts">
import { useToast } from '@/composables/useToast';

const toast = useToast();

function handleSuccess() {
  toast.success('Operation completed successfully!');
}

function handleError() {
  toast.error('Failed to save', 'Please check your connection');
}

function handleWarning() {
  toast.warning(
    'Some items could not be processed',
    'Item 1: Already exists\nItem 2: Invalid data',
    7000 // Show for 7 seconds
  );
}
</script>
```

### Option 2: Using the Store (Options API)

```vue
<script lang="ts">
import { defineComponent } from 'vue';
import { useToastStore } from '@/stores/toastStore';

export default defineComponent({
  computed: {
    toast() {
      return useToastStore();
    }
  },
  methods: {
    async saveData() {
      try {
        // ... save logic
        this.toast.success('Data saved successfully');
      } catch (error: any) {
        this.toast.error('Failed to save', error.message);
      }
    }
  }
});
</script>
```

## Toast Types

### Success Toast
Green border, checkmark icon
```ts
toast.success('Operation completed');
toast.success('5 campers enrolled', 'All campers added successfully');
```

### Error Toast
Red border, alert circle icon
```ts
toast.error('Operation failed');
toast.error('Failed to delete', 'Item is still referenced');
```

### Warning Toast
Orange border, warning triangle icon
```ts
toast.warning('Partial success', '2 of 5 items processed');
toast.warning('Review required', 'Some items need attention');
```

### Info Toast
Blue border, info icon
```ts
toast.info('New feature available');
toast.info('System update', 'Check the changelog for details');
```

## API Reference

### Method Signature
```ts
toast.success(message: string, details?: string, duration?: number)
toast.error(message: string, details?: string, duration?: number)
toast.warning(message: string, details?: string, duration?: number)
toast.info(message: string, details?: string, duration?: number)
```

### Parameters

- **message** (required): Main message to display
- **details** (optional): Additional details shown below the main message
  - Supports multi-line text with `\n`
  - Automatically wraps long text
  - Scrollable if too long
- **duration** (optional): Time in milliseconds before auto-dismiss
  - Default: 5000ms (5 seconds)
  - Use 0 for persistent toast (must manually dismiss)
  - Warning toasts in Calendar use 7000ms for better readability

## Examples from Calendar.vue

### Success Message
```ts
this.toast.success('Event created successfully');
```

### Success with Confirmation
```ts
this.toast.success(result.message);
// Shows: "Successfully enrolled all 15 campers from group 'Junior Campers'."
```

### Warning with Details
```ts
this.toast.warning(
  'Event created with some enrollment issues',
  messages.join('\n')
);
```

### Error with Details
```ts
this.toast.error('Error assigning group', error.message);
```

### Long Warning with Extended Duration
```ts
this.toast.warning(
  result.message,
  'Conflicts:\n' + result.errors.join('\n'),
  7000 // 7 seconds for detailed conflict list
);
```

## Styling

Toasts are styled with:
- White background with shadow
- Color-coded left border (4px)
- Rounded corners
- Hover effect (slides left slightly)
- Click anywhere to dismiss
- Smooth slide-in/slide-out animations
- Mobile responsive (full width on small screens)

## Best Practices

### 1. Use Appropriate Types
- **Success**: Completed actions (saved, created, deleted, enrolled)
- **Error**: Failed operations, exceptions
- **Warning**: Partial success, conflicts detected, items skipped
- **Info**: Informational messages, tips, feature announcements

### 2. Keep Messages Concise
```ts
// Good
toast.success('Camper enrolled');

// Too verbose
toast.success('The camper has been successfully enrolled in the event');
```

### 3. Use Details for Additional Information
```ts
// Good - main message + details
toast.warning(
  'Enrolled 8 of 10 campers',
  '2 conflicts:\n- John: Already enrolled\n- Jane: Time conflict'
);

// Bad - all in main message
toast.warning('Enrolled 8 of 10 campers. 2 conflicts: John: Already enrolled, Jane: Time conflict');
```

### 4. Adjust Duration for Readability
```ts
// Short message - default 5s is fine
toast.success('Saved');

// Long conflict list - give users time to read
toast.warning(
  'Some items had conflicts',
  detailedList,
  7000
);
```

### 5. Don't Show Redundant Toasts
```ts
// Bad - too many toasts
for (const item of items) {
  toast.success(`Processed ${item.name}`);
}

// Good - summary toast
toast.success(`Processed ${items.length} items`);
```

## Migration from alert()

All `alert()` calls have been replaced with appropriate toast notifications:

| Old Alert | New Toast |
|-----------|-----------|
| `alert('Success message')` | `toast.success('Success message')` |
| `alert('Error: ' + error.message)` | `toast.error('Error', error.message)` |
| `alert('Warning\nDetails')` | `toast.warning('Warning', 'Details')` |
| Multi-line alerts | Use details parameter with `\n` |

## Advanced Usage

### Persistent Toast (Manual Dismiss)
```ts
toast.error('Critical error', 'Server unreachable', 0); // duration: 0
```

### Multi-line Details
```ts
const errors = [
  'Camper 1: Already enrolled',
  'Camper 2: Age restriction',
  'Camper 3: Capacity reached'
];
toast.warning('Some conflicts occurred', errors.join('\n'));
```

### Conditional Toast Type
```ts
async function processItems(items) {
  const result = await store.processBatch(items);
  
  if (result.errors.length > 0) {
    toast.warning(
      `Processed ${result.success} of ${items.length}`,
      `Failures:\n${result.errors.join('\n')}`,
      7000
    );
  } else {
    toast.success(`All ${items.length} items processed`);
  }
}
```

## Accessibility

- Toasts are announced to screen readers
- Can be dismissed with click/tap
- Auto-dismiss ensures they don't block content
- High contrast colors for visibility
- Clear icons for quick recognition

## Browser Support

Works in all modern browsers that support:
- CSS Grid
- CSS Transitions
- Vue 3 Teleport
- ES6+

## Future Enhancements

Potential improvements:
- Toast position options (top-left, bottom-right, etc.)
- Action buttons in toasts
- Progress bars for long operations
- Toast grouping/stacking
- Custom icons
- Sound notifications
- Keyboard shortcuts (dismiss all, etc.)

