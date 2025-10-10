# Toast Notifications - Quick Reference

## 🚀 Quick Start

### Import
```ts
import { useToast } from '@/composables/useToast';
// or
import { useToastStore } from '@/stores/toastStore';
```

### Basic Usage
```ts
const toast = useToast();

toast.success('Done!');
toast.error('Failed');
toast.warning('Check this');
toast.info('FYI');
```

## 📋 API

### Method Signature
```ts
toast.TYPE(message: string, details?: string, duration?: number)
```

### Parameters
- **message**: Main message (required)
- **details**: Additional info (optional)
- **duration**: Time in ms, default 5000 (optional)

## 🎨 Types

| Type | Color | Icon | Use For |
|------|-------|------|---------|
| `success` | Green | ✓ | Completed actions |
| `error` | Red | ⚠ | Failed operations |
| `warning` | Orange | ⚠ | Partial success, conflicts |
| `info` | Blue | ℹ | Informational messages |

## 💡 Examples

### Success
```ts
toast.success('Camper enrolled');
toast.success('All done', 'Successfully saved 5 items');
```

### Error
```ts
toast.error('Failed to save');
toast.error('Database error', 'Connection timeout');
```

### Warning
```ts
toast.warning('Some items skipped', '2 of 5 failed');
toast.warning('Conflicts found', 'John: Already enrolled\nJane: Age limit', 7000);
```

### Info
```ts
toast.info('New feature available');
toast.info('Tip', 'Use Ctrl+S to save quickly');
```

## ⚙️ Options

### Custom Duration
```ts
toast.success('Quick message', undefined, 3000); // 3 seconds
toast.warning('Read carefully', details, 10000); // 10 seconds
```

### Persistent (No Auto-dismiss)
```ts
toast.error('Critical', 'Manual dismiss required', 0);
```

### Multi-line Details
```ts
const errors = ['Error 1', 'Error 2', 'Error 3'];
toast.warning('Multiple errors', errors.join('\n'));
```

## 🎯 Common Patterns

### Try-Catch
```ts
try {
  await saveData();
  toast.success('Saved successfully');
} catch (error: any) {
  toast.error('Save failed', error.message);
}
```

### Conditional Toast
```ts
if (result.errors.length > 0) {
  toast.warning('Partial success', result.errors.join('\n'), 7000);
} else {
  toast.success('All items processed');
}
```

### Bulk Operations
```ts
const result = await processBatch(items);
toast.success(`Processed ${result.success} of ${items.length} items`);
```

## ⌨️ In Components

### Options API
```vue
<script lang="ts">
export default defineComponent({
  computed: {
    toast() {
      return useToastStore();
    }
  },
  methods: {
    handleClick() {
      this.toast.success('Clicked!');
    }
  }
});
</script>
```

### Composition API
```vue
<script setup lang="ts">
import { useToast } from '@/composables/useToast';
const toast = useToast();

function handleClick() {
  toast.success('Clicked!');
}
</script>
```

## ✨ Features

- ✅ Auto-dismiss after 5s (default)
- ✅ Click anywhere to dismiss
- ✅ Smooth animations
- ✅ Multiple toasts stack
- ✅ Mobile responsive
- ✅ Scrollable details
- ✅ Type-safe with TypeScript

## 🎨 Visual Guide

```
┌────────────────────────────────────┐
│ ✓ Success message         [×]      │ ← Green border
│   Optional details here            │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ⚠ Error message           [×]      │ ← Red border
│   Error details here               │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ⚠ Warning message         [×]      │ ← Orange border
│   Warning details here             │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ℹ Info message            [×]      │ ← Blue border
│   Info details here                │
└────────────────────────────────────┘
```

## 📱 Behavior

- **Desktop**: Top-right corner, fixed width
- **Mobile**: Full width at top
- **Click**: Dismisses immediately
- **Auto**: Fades out after duration
- **Stack**: Newest at bottom

## ⚡ Pro Tips

1. **Keep messages short**: Use details for longer text
2. **Use appropriate types**: Match toast type to action result
3. **Adjust duration for details**: Longer details = longer duration
4. **Multi-line details**: Use `\n` to separate lines
5. **Don't spam**: Summarize instead of showing many toasts

## 🚫 What NOT to Do

```ts
// ❌ Don't - Too verbose in main message
toast.success('The camper has been successfully enrolled in the event and is now visible in the calendar view');

// ✅ Do - Short message, details optional
toast.success('Camper enrolled', 'Now visible in calendar');

// ❌ Don't - Show toast for each item
items.forEach(item => toast.success(`Saved ${item.name}`));

// ✅ Do - Show summary
toast.success(`Saved ${items.length} items`);

// ❌ Don't - Use wrong type
toast.error('Saved successfully'); // Error for success?

// ✅ Do - Use correct type
toast.success('Saved successfully');
```

## 🔗 See Also

- **TOAST_DOCUMENTATION.md** - Complete documentation
- **TOAST_IMPLEMENTATION_SUMMARY.md** - Technical details
- **src/components/Toast.vue** - Component source
- **src/stores/toastStore.ts** - Store implementation

---

**Ready to use!** Import `useToast()` and start showing beautiful notifications. 🎉

