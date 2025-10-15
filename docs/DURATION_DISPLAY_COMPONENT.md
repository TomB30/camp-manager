# DurationDisplay Component

## Overview
The `DurationDisplay` component provides a reusable way to display durations in a human-friendly format throughout the application.

## Features
- Automatically converts minutes to the most appropriate unit (minutes, hours, days, or weeks)
- Supports both short and long formats
- Uses compound time display for better readability (e.g., "1 hour 30 minutes" instead of "1.5 hours")
- Omits zero values for cleaner display (e.g., "2 hours" instead of "2 hours 0 minutes")

## Usage

### Basic Usage (Short Format)
```vue
<DurationDisplay :minutes="90" />
<!-- Output: "1 hr 30 min" -->

<DurationDisplay :minutes="120" />
<!-- Output: "2 hr" -->

<DurationDisplay :minutes="45" />
<!-- Output: "45 min" -->
```

### Long Format
```vue
<DurationDisplay :minutes="90" format="long" />
<!-- Output: "1 hour 30 minutes" -->

<DurationDisplay :minutes="60" format="long" />
<!-- Output: "1 hour" -->

<DurationDisplay :minutes="150" format="long" />
<!-- Output: "2 hours 30 minutes" -->
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `minutes` | Number | Yes | - | The duration in minutes to display |
| `format` | String | No | `'short'` | Display format: `'short'` or `'long'` |

## Conversion Rules

The component automatically chooses the most appropriate unit based on the duration and displays compound time formats for better readability:

| Duration | Format | Example (short) | Example (long) |
|----------|--------|-----------------|----------------|
| < 60 minutes | Minutes only | "45 min" | "45 minutes" |
| 60 - 1,439 minutes | Hours + Minutes | "1 hr 30 min" | "1 hour 30 minutes" |
| 1,440 - 10,079 minutes | Days + Hours | "2 day 5 hr" | "2 days 5 hours" |
| ≥ 10,080 minutes | Weeks + Days | "1 wk 2 day" | "1 week 2 days" |

**Note:** If the secondary unit is zero, it's omitted (e.g., "2 hours" instead of "2 hours 0 minutes").

## Examples in the Codebase

### Programs View
```vue
<span class="meta-item">
  <Clock :size="14" />
  <DurationDisplay :minutes="activity.durationMinutes" />
</span>
```

### Activity Detail Modal
```vue
<div class="detail-item">
  <span class="detail-label">Duration</span>
  <span class="detail-value">
    <DurationDisplay :minutes="activity.durationMinutes" format="long" />
  </span>
</div>
```

### Activity Selector Modal
```vue
<span class="activity-duration">
  <DurationDisplay :minutes="activity.durationMinutes" />
</span>
```

## Implementation Details

The component uses computed properties to automatically format the duration based on the input value. The formatting logic uses compound time display:

1. **Minutes** (< 60 min): Displays minutes only
2. **Hours** (60 - 1,439 min): Displays hours + remaining minutes (e.g., "1 hour 30 minutes")
3. **Days** (1,440 - 10,079 min): Displays days + remaining hours (e.g., "2 days 5 hours")
4. **Weeks** (≥ 10,080 min): Displays weeks + remaining days (e.g., "1 week 2 days")

Compound time benefits:
- More intuitive than decimals (e.g., "1 hour 30 minutes" vs "1.5 hours")
- Easier to understand at a glance
- No mental math required to convert decimal time
- Secondary unit is omitted when zero (e.g., "2 hours" instead of "2 hours 0 minutes")

## Benefits

1. **Consistency**: Duration formatting is centralized in one component
2. **Maintainability**: Changes to duration display logic only need to be made in one place
3. **Readability**: Compound time format is more intuitive than decimals (e.g., "1 hour 30 minutes" vs "1.5 hours")
4. **No Mental Math**: Users don't need to convert decimal time to minutes (e.g., what's 0.3 hours?)
5. **Flexibility**: Supports both short and long formats for different contexts
6. **Smart Formatting**: Automatically omits zero values for cleaner display

