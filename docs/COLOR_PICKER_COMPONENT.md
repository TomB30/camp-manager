# ColorPicker Component

## Overview

A reusable Vue component that provides a consistent color selection interface across the application. Replaces free-form HTML color inputs with a predefined palette of 8 professional colors.

## Component Location

```
src/components/ColorPicker.vue
```

## Usage

### Basic Implementation

```vue
<template>
  <ColorPicker v-model="myColor" />
</template>

<script>
import ColorPicker from '@/components/ColorPicker.vue';

export default {
  components: {
    ColorPicker
  },
  data() {
    return {
      myColor: '#6366F1' // Default blue
    };
  }
};
</script>
```

### With Form Label

```vue
<div class="form-group">
  <label class="form-label">Color</label>
  <ColorPicker v-model="formData.color" />
</div>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | String | `'#6366F1'` | The currently selected color (hex format) |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | String | Emitted when a color is selected |

## Color Palette

The component provides 8 predefined colors:

| Color | Name | Hex Value | Usage |
|-------|------|-----------|-------|
| 🔵 | Blue | `#6366F1` | Default, calm, professional |
| 🟢 | Green | `#10B981` | Success, nature, growth |
| 🟠 | Orange | `#F59E0B` | Energy, enthusiasm, attention |
| 🟣 | Purple | `#8B5CF6` | Creativity, luxury, unique |
| 💗 | Pink | `#EC4899` | Playful, friendly, warm |
| 🔴 | Red | `#EF4444` | Important, urgent, bold |
| 🔵 | Teal | `#14B8A6` | Fresh, modern, balanced |
| 🟣 | Indigo | `#4F46E5` | Deep, stable, trustworthy |

## Features

- ✅ **8 Predefined Colors**: Professional palette for consistency
- ✅ **Visual Selection**: Large, clickable color circles
- ✅ **Hover Effects**: Scale and shadow animations
- ✅ **Selection Indicator**: Border highlight on selected color
- ✅ **Tooltips**: Color names on hover
- ✅ **Keyboard Accessible**: Native radio button navigation
- ✅ **Responsive**: Works on all screen sizes
- ✅ **v-model Support**: Two-way binding

## Visual Design

### Size
- **Circle Diameter**: 32px (adjustable via CSS)
- **Border**: 3px (transparent by default, visible when selected)
- **Gap**: 0.75rem between circles

### States

**Default:**
- Subtle shadow
- Transparent border
- No scale

**Hover:**
- Scales to 110%
- Enhanced shadow

**Selected:**
- Border color matches text color
- Double ring effect (white + colored border)
- Slight scale (105%)

### Layout

```
┌────────────────────────────────────────┐
│  ⭕  ⭕  ⭕  ⭕  ⭕  ⭕  ⭕  ⭕        │
│ Blue Green Orange Purple...            │
└────────────────────────────────────────┘
```

Circles wrap to multiple rows on smaller screens.

## Implementation Details

### Component Structure

```vue
<template>
  <div class="color-picker">
    <div class="color-options">
      <label v-for="color in colorOptions" class="color-option">
        <input type="radio" class="color-radio" />
        <div class="color-circle" :style="{ background: color.value }"></div>
      </label>
    </div>
  </div>
</template>
```

### Data Structure

```typescript
colorOptions: [
  { name: 'Blue', value: '#6366F1' },
  { name: 'Green', value: '#10B981' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Indigo', value: '#4F46E5' },
]
```

### Two-Way Binding

Uses Vue 3's `v-model` with `modelValue` prop and `update:modelValue` event:

```typescript
props: {
  modelValue: {
    type: String,
    default: '#6366F1'
  }
},
emits: ['update:modelValue']
```

## Where It's Used

The ColorPicker component is currently integrated in:

### 1. Family Groups (`/family-groups`)
**Purpose**: Assign colors to family groups for visual identification

**Context**: 
```vue
<div class="form-group">
  <label class="form-label">Group Color</label>
  <ColorPicker v-model="formData.color" />
</div>
```

### 2. Camper Groups (`/groups`)
**Purpose**: Color-code dynamic camper groups

**Context**:
```vue
<div class="form-group">
  <label class="form-label">Color</label>
  <ColorPicker v-model="formData.color" />
</div>
```

### 3. Events (`/calendar`)
**Purpose**: Assign colors to calendar events

**Context**:
```vue
<div class="form-group">
  <label class="form-label">Color</label>
  <ColorPicker v-model="newEvent.color" />
</div>
```

## Benefits

### Consistency
- All colors across the app come from the same palette
- No random or hard-to-read colors
- Professional appearance

### User Experience
- Easy to select (click, not type)
- Visual feedback (hover effects)
- Clear selection state
- No need to remember hex codes

### Maintainability
- Single source of truth for colors
- Easy to update palette globally
- Reusable across multiple features

### Accessibility
- Keyboard navigation support
- Tooltips for screen readers
- High contrast selection indicator

## Customization

### Changing Circle Size

Update the CSS in `ColorPicker.vue`:

```css
.color-circle {
  width: 40px;  /* Change from 32px */
  height: 40px;
}
```

### Adding More Colors

Add to the `colorOptions` array:

```typescript
colorOptions: [
  // ... existing colors
  { name: 'Yellow', value: '#FBBF24' },
  { name: 'Cyan', value: '#06B6D4' },
]
```

### Changing Default Color

Update the prop default:

```typescript
props: {
  modelValue: {
    type: String,
    default: '#10B981'  // Green instead of Blue
  }
}
```

## Migration from Old Color Inputs

### Before (HTML Color Input)

```vue
<input v-model="formData.color" type="color" class="form-input" />
```

### After (ColorPicker Component)

```vue
<ColorPicker v-model="formData.color" />
```

### Migration Steps

1. Import the component
2. Register in components
3. Replace `<input type="color">` with `<ColorPicker>`
4. Remove old CSS for color inputs
5. Test v-model binding

## CSS Variables

The component uses CSS variables for consistency:

- `--text-primary`: Selection border color
- `--radius`: Border radius for circles
- Standard box-shadow values

## Browser Support

- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ⚠️ IE11: Not supported (uses modern CSS features)

## Performance

- **Lightweight**: < 2KB gzipped
- **No Dependencies**: Pure Vue component
- **Fast Rendering**: Static color list
- **Efficient Updates**: Only emits on change

## Testing

### Unit Test Example

```typescript
import { mount } from '@vue/test-utils';
import ColorPicker from '@/components/ColorPicker.vue';

test('emits color on selection', async () => {
  const wrapper = mount(ColorPicker);
  await wrapper.find('input[value="#10B981"]').trigger('change');
  expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  expect(wrapper.emitted('update:modelValue')[0]).toEqual(['#10B981']);
});
```

### Visual Testing

1. Check hover effects on each color
2. Verify selection indicator appears
3. Test keyboard navigation (Tab + Space)
4. Confirm v-model updates parent

## Best Practices

### Do's ✅
- Use ColorPicker for all user color selections
- Provide a label for accessibility
- Set a sensible default color
- Keep the palette consistent

### Don'ts ❌
- Don't use HTML color inputs alongside ColorPicker
- Don't modify colors without updating the palette
- Don't add too many color options (max 12)
- Don't remove the selection indicator

## Future Enhancements

Potential improvements:

1. **Color Names**: Show color name next to circles
2. **Recently Used**: Track and highlight recent colors
3. **Custom Colors**: Allow admin to define palette
4. **Color Categories**: Group colors (warm, cool, neutral)
5. **Theme Support**: Light/dark mode optimized colors
6. **Preset Themes**: Quick color schemes for groups
7. **Accessibility Mode**: High contrast option

## Related Components

- `FilterBar.vue`: Uses color badges to display filtered items
- `DataTable.vue`: May display color indicators
- `Toast.vue`: Uses color for status indicators

## Documentation

- Component code: `src/components/ColorPicker.vue`
- Usage examples: See `FamilyGroups.vue`, `Groups.vue`, `Calendar.vue`
- Migration guide: This document

---

**Version**: 1.0.0  
**Created**: 2025-10-10  
**Last Updated**: 2025-10-10  
**Maintainer**: Camp Manager Team

