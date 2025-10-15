# Duration Display Examples

This document shows how different durations are displayed using the `DurationDisplay` component.

## Common Camp Activity Durations

### Short Format (used in cards and compact views)

| Minutes | Display | Use Case |
|---------|---------|----------|
| 30 | `30 min` | Quick activity |
| 45 | `45 min` | Standard activity |
| 60 | `1 hr` | One hour activity |
| 75 | `1 hr 15 min` | Extended activity |
| 90 | `1 hr 30 min` | Hour and a half |
| 120 | `2 hr` | Two hour activity |
| 180 | `3 hr` | Three hour activity |
| 240 | `4 hr` | Half day |
| 480 | `8 hr` | Full day |
| 720 | `12 hr` | Extended day |
| 1440 | `1 day` | Full 24 hours |
| 1560 | `1 day 2 hr` | Day plus morning |
| 2880 | `2 day` | Two days |
| 4320 | `3 day` | Three days |
| 10080 | `1 wk` | One week |
| 10800 | `1 wk 12 hr` | Week plus half day |
| 20160 | `2 wk` | Two weeks |

### Long Format (used in detail views and modals)

| Minutes | Display | Use Case |
|---------|---------|----------|
| 30 | `30 minutes` | Quick activity |
| 45 | `45 minutes` | Standard activity |
| 60 | `1 hour` | One hour activity |
| 75 | `1 hour 15 minutes` | Extended activity |
| 90 | `1 hour 30 minutes` | Hour and a half |
| 120 | `2 hours` | Two hour activity |
| 180 | `3 hours` | Three hour activity |
| 240 | `4 hours` | Half day |
| 480 | `8 hours` | Full day |
| 720 | `12 hours` | Extended day |
| 1440 | `1 day` | Full 24 hours |
| 1560 | `1 day 2 hours` | Day plus morning |
| 2880 | `2 days` | Two days |
| 4320 | `3 days` | Three days |
| 10080 | `1 week` | One week |
| 10800 | `1 week 12 hours` | Week plus half day |
| 20160 | `2 weeks` | Two weeks |

## Key Benefits

### ✅ Better (New Format)
- `90 min` → **`1 hr 30 min`** - Immediately clear!
- `150 min` → **`2 hr 30 min`** - Easy to understand
- `1560 min` → **`1 day 2 hr`** - Shows compound time

### ❌ Confusing (Old Decimal Format)
- `90 min` → `1.5 hr` - Need to calculate: "What's 0.5 hours in minutes?"
- `150 min` → `2.5 hr` - Mental math required
- `1560 min` → `1.08 day` - Decimals of days are not intuitive!

## Why This Matters

Camp staff and administrators shouldn't need to do mental math to understand activity durations. The compound time format makes it immediately clear:
- "This activity is 1 hour and 30 minutes" ✓
- "This activity is 1.5 hours... wait, how many minutes is that?" ✗

The new format matches how people naturally think and talk about time!

