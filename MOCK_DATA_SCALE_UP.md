# Mock Data Scale-Up Summary

## Overview
The camp manager mock data has been significantly scaled up to create a more realistic and robust testing environment.

## Changes Made

### 1. **Campers: 36 → 350** (10x increase)
- Expanded first name pools from 30 to 50 names per gender
- Expanded last name pool from 30 to 50 surnames
- Added 2 additional allergy types (Sesame, Gluten)
- Campers are distributed across 24 family groups (~15 campers per group)
- Ages range from 6-15 years old
- ~20% have food allergies

### 2. **Staff Members: 12 → 50** (4x increase)
- **1 Director** (Sarah Connor)
- **4 Supervisors** reporting to director
- **2 Nurses** reporting to director
- **43 Counselors and Instructors** reporting to supervisors
- Staff have varied certification combinations from 10 different certification patterns
- Proper management hierarchy maintained

### 3. **Sleeping Rooms: 6 → 24 cabins** (4x increase)
- Named after animals: Eagles, Hawks, Wolves, Butterflies, Fireflies, Dolphins, Tigers, Bears, Panthers, Foxes, Owls, Ravens, Falcons, Cougars, Lynx, Otters, Beavers, Moose, Elk, Bison, Cardinals, Blue Jays, Sparrows, Swallows
- First 16 cabins: 12 beds each (192 total)
- Last 8 cabins: 10 beds each (80 total)
- **Total capacity: 272 beds** (sufficient for 350 campers with some overflow)
- Distributed across 4 locations (North Wing Floors 1-2, South Wing Floors 1-2)

### 4. **Family Groups: 6 → 24** (4x increase)
- One family group per sleeping room
- Each family group has 1-2 staff counselors assigned
- Groups rotate through 3 different week sessions
- 24 unique color schemes for identification

### 5. **Programs: 3 → 10** (3.3x increase)
New programs added:
1. **Watersports** (existing) - Wakeboarding, Swimming, Kayaking, SUP
2. **Arts & Crafts** (existing) - Pottery, Painting, Jewelry, Tie-Dye
3. **Adventure Sports** (existing) - Rock Climbing, Archery, Ropes Course, Orienteering
4. **Performing Arts** (NEW) - Theater, Music, Dance, Improv
5. **Science & Nature** (NEW) - Nature Hikes, Stargazing, Biology Lab, Gardening
6. **Team Sports** (NEW) - Soccer, Basketball, Volleyball, Ultimate Frisbee
7. **Leadership Development** (NEW) - Team Building, Public Speaking, Conflict Resolution
8. **Cooking & Culinary** (NEW) - Baking, Cooking, Food Science
9. **Technology & Gaming** (NEW) - Coding, Robotics, Board Games
10. **Wellness & Mindfulness** (NEW) - Yoga, Meditation

### 6. **Activities: 9 → 35** (3.9x increase)
- 4 Watersports activities
- 4 Arts & Crafts activities
- 4 Adventure Sports activities
- 4 Performing Arts activities
- 4 Science & Nature activities
- 4 Team Sports activities
- 3 Leadership Development activities
- 3 Cooking & Culinary activities
- 3 Technology & Gaming activities
- 2 Wellness & Mindfulness activities

### 7. **Events: Massively Scaled**
#### Daily Event Structure:
- **Morning Assembly** (9:00-9:30): 120 campers, 3 staff
- **Morning Activities** (10:00-11:30): 4-7 concurrent activities, 60-80 campers total per block
- **Lunch** (12:00-1:00): All 350 campers, 4 staff, capacity 400
- **Afternoon Activities Block 1** (2:00-4:00): Multiple concurrent activities
- **Afternoon Activities Block 2** (4:00-5:30): Multiple concurrent activities
- **Dinner** (6:00-7:00): All 350 campers, 4 staff, capacity 400
- **Evening Activities** (7:30-8:30): 80-130 campers depending on activity
- **Quiet Time** (9:00 PM): 150 campers, 3 staff

#### Event Improvements:
- More concurrent activities to prevent camper schedule conflicts
- Better distribution of campers across time slots
- Variety of activities from all 10 programs scheduled throughout the month
- Staff assignments match required certifications (Lifeguard, Swimming Instructor, Archery Instructor, etc.)
- Events span full month with realistic daily schedules

### 8. **Existing Data (Unchanged)**
- **Certifications**: 10 types (First Aid, CPR, Lifeguard, etc.)
- **Locations**: 12 locations for activities
- **Rooms**: 10 activity rooms
- **Camper Groups**: 5 dynamic groups (age-based, gender-based, allergy-aware)

## Key Benefits

1. **Realistic Scale**: Now reflects an actual mid-to-large sized summer camp
2. **Performance Testing**: Can identify performance bottlenecks with hundreds of records
3. **UI Testing**: Better testing of pagination, filtering, and search features
4. **Scheduling Complexity**: More realistic conflict detection and resource allocation
5. **Data Visualization**: Calendar views and dashboards now show meaningful data density

## Technical Notes

- All IDs use consistent `generateId()` format with zero-padded numbers
- Camper distribution ensures ~10-15 campers per family group
- Staff hierarchy maintains proper reporting structure (Director → Supervisors → Staff)
- Event generation uses modulo arithmetic to cycle through 350 campers without conflicts
- All dates use ISO format for consistency
- Color palette expanded to 24+ unique colors for family groups

## Data Statistics

| Entity | Before | After | Growth |
|--------|--------|-------|--------|
| Campers | 36 | 350 | 972% |
| Staff | 12 | 50 | 417% |
| Sleeping Rooms | 6 | 24 | 400% |
| Family Groups | 6 | 24 | 400% |
| Programs | 3 | 10 | 333% |
| Activities | 9 | 35 | 389% |
| Events/month | ~300 | ~1000+ | 333% |

## Next Steps (Optional)

To further enhance the mock data, consider:
- Adding more variety to medical conditions beyond allergies
- Creating multi-week program enrollment patterns
- Adding staff vacation/availability schedules
- Implementing age-specific activity restrictions
- Adding more location types (e.g., campfire pits, nature trails)
- Creating historical data for previous camp sessions

