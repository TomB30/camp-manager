# Mock Data Conflicts Reduction

## Overview
Reduced the number of scheduling conflicts in the mock data from 66 (mostly missing staff certifications) down to exactly 5 intentional conflicts for demonstration purposes.

## Changes Made

### 1. Updated Certification Combinations
Modified the `certificationCombos` array to provide better coverage of required certifications:

**Before:**
- Limited Lifeguard/Swimming Instructor coverage
- Limited Archery Instructor coverage  
- Limited Climbing Instructor coverage
- Food Handler certification that wasn't needed

**After:**
- More staff with Lifeguard + Swimming Instructor (indices 3, 7)
- More staff with Archery Instructor (indices 2, 9)
- More staff with Climbing Instructor (indices 0, 8)
- Better distribution of specialized certifications (Boat Driver, Ropes Course)

### 2. Fixed Staff Assignments for Events

Updated events with certification requirements to use staff who actually have those certifications:

#### Swimming Lessons
- **Requires:** Lifeguard, Swimming Instructor
- **Now uses:** Staff 11, 15 (both have required certifications)
- **Conflict on:** Oct 4 only (intentional, uses Staff 8, 10 who lack certifications)

#### Rock Climbing
- **Requires:** Climbing Instructor, First Aid
- **Now uses:** Staff 8, 14 (both have required certifications)
- **Conflict on:** Oct 1 only (intentional, uses Staff 9, 11 who lack Climbing Instructor)

#### Archery
- **Requires:** Archery Instructor
- **Now uses:** Staff 10, 17, 20, 27 (all have Archery Instructor)
- **Conflict on:** Oct 2 only (intentional, uses Staff 15, 19 who lack certification)

#### Kayaking
- **Requires:** Lifeguard
- **Now uses:** Staff 12, 13 (both have Lifeguard)
- **No conflicts**

#### Wakeboarding
- **Requires:** Lifeguard, Boat Driver
- **Now uses:** Staff 12, 13 (both have both certifications)
- **Conflicts on:** Oct 1 & 2 (intentional, uses Staff 5, 6 who lack certifications)

## Intentional Conflicts (5 Total)

The mock data now contains exactly 5 conflicts for demonstration purposes:

1. **Rock Climbing - Oct 1, 2025**
   - Missing: Climbing Instructor certification
   - Staff: 9, 11 (have Ropes Course and Archery instead)

2. **Archery - Oct 2, 2025**
   - Missing: Archery Instructor certification
   - Staff: 15, 19 (have Lifeguard/Swimming and Ropes Course instead)

3. **Wakeboarding - Oct 1, 2025**
   - Missing: Lifeguard, Boat Driver certifications
   - Staff: 5, 6 (Supervisor and Nurse with different certifications)

4. **Wakeboarding - Oct 2, 2025**
   - Missing: Lifeguard, Boat Driver certifications
   - Staff: 5, 6 (same as above)

5. **Swimming Lessons - Oct 4, 2025**
   - Missing: Lifeguard, Swimming Instructor certifications
   - Staff: 8, 10 (have Climbing and Archery instead)

## Staff Certification Distribution

### Staff with Key Certifications:

**Lifeguard + Swimming Instructor:**
- Staff 11, 12, 15, 23, 30, 37, 44 (index % 10 = 3 or 7)

**Climbing Instructor + First Aid:**
- Staff 8, 14, 16, 18, 24, 26, 32, 34, 40, 42, 48, 50 (index % 10 = 0, 6, or 8)

**Archery Instructor + First Aid:**
- Staff 10, 17, 20, 27, 34, 37, 44 (index % 10 = 2 or 9)

**Lifeguard + Boat Driver:**
- Staff 12, 13, 22, 23, 32, 33, 42, 43 (index % 10 = 4 or 5)

## Benefits

1. **Realistic Demo Data** - Shows conflict detection working without overwhelming the user
2. **Better User Experience** - Users can see the conflict navigation feature with real examples
3. **Manageable Conflicts** - 5 conflicts are easy to fix and understand
4. **Well-Distributed** - Conflicts occur on different days (Oct 1, 2, 4)
5. **Different Conflict Types** - Shows various missing certification scenarios

## Testing the Conflicts

To see the conflicts:
1. Navigate to the Dashboard
2. Scroll to "Scheduling Conflicts" section
3. Should see exactly 5 "Missing Certification" conflicts
4. Click any conflict to navigate to the calendar and view the event
5. Events on Oct 1, 2, and 4 will show the certification issues

## Future Improvements

If more conflicts are needed for testing:
- Adjust the day conditions (e.g., `day === (startDay + N)`)
- Add conflicts to other activity types (Ropes Course, etc.)
- Introduce other conflict types (overcapacity, double-booking)

