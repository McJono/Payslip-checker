# Sample Data Validation

This document validates that the payslip calculator correctly handles the sample data from the problem statement.

## Sample Input Data

The following shifts were provided as test data:

| Date       | Start | End           | Sleepover | Hours |
|------------|-------|---------------|-----------|-------|
| 10/10/2025 | 13.5  | 22+8(sleepover) | 1       | 8.5   |
| 11/10/2025 | 14    | 22+8(sleepover) | 1       | 8     |
| 12/10/2025 | 14    | 22+8(sleepover) | 1       | 8     |
| 13/10/2025 | 6     | 6.5           | 0       | 0.5   |
| 13/10/2025 | 15    | 22            | 0       | 7     |
| 14/10/2025 | 6     | 17            | 0       | 11    |
| 15/10/2025 | 13.5  | 22+8(sleepover) | 1       | 8.5   |
| 17/10/2025 | 6     | 15            | 0       | 9     |
| 18/10/2025 | 14    | 22+8(sleepover) | 1       | 8     |
| 19/10/2025 | 14    | 22+8(sleepover) | 1       | 8     |

**Note:** Start/End times use decimal format (e.g., 13.5 = 13:30, 22 = 22:00)

## Expected Breakdown

- **Total Hours:** 76.5
- **Normal:** 9
- **Night:** 24.5
- **Saturday:** 16
- **Sunday:** 16
- **Broken Shift:** 11
- **Sleepover:** 6

## Classification Logic

The calculator uses the following priority order for classifying shifts:

1. **Weekend (Saturday/Sunday)** - Highest priority
2. **Night Shift** - Ends at/after 22:00 OR ends before 7:00
3. **Broken Shift** - Weekday shift with <10 hours break from previous shift
4. **Normal** - Default category

### Important Notes

#### Sleepover Shifts
- The notation "22+8(sleepover)" means the shift ends at 22:00, followed by an 8-hour sleepover period
- The sleepover is a **non-paid rest period** that occurs AFTER the work shift
- Working hours are **NOT reduced** by the sleepover duration
- Sleepover only affects break time calculations for subsequent shifts

#### Weekend Priority
- Weekend shifts (Saturday/Sunday) maintain their classification even if they have insufficient breaks from previous shifts
- A Saturday shift following a Friday sleepover shift with only 8 hours break remains a Saturday shift, not a broken shift

#### Night Shift Detection
- A shift ending at or after 22:00 is classified as a night shift
- A shift ending before 7:00 AM is also classified as a night shift
- This captures both late evening shifts (ending at 22:00+) and early morning shifts (ending before 7:00)

## Detailed Shift Analysis

| Shift | Date       | Day       | Time         | Category      | Hours | Reasoning |
|-------|------------|-----------|--------------|---------------|-------|-----------|
| 1     | 10/10/2025 | Friday    | 13:30-22:00+8h | Night       | 8.5   | Ends at 22:00 (night boundary) |
| 2     | 11/10/2025 | Saturday  | 14:00-22:00+8h | Saturday    | 8.0   | Weekend takes priority |
| 3     | 12/10/2025 | Sunday    | 14:00-22:00+8h | Sunday      | 8.0   | Weekend takes priority |
| 4     | 13/10/2025 | Monday    | 06:00-06:30    | Night       | 0.5   | Ends before 7:00 AM |
| 5     | 13/10/2025 | Monday    | 15:00-22:00    | Night       | 7.0   | Ends at 22:00 (night boundary) |
| 6     | 14/10/2025 | Tuesday   | 06:00-17:00    | Broken      | 11.0  | <10h break from previous shift |
| 7     | 15/10/2025 | Wednesday | 13:30-22:00+8h | Night       | 8.5   | Ends at 22:00 (night boundary) |
| 8     | 17/10/2025 | Friday    | 06:00-15:00    | Normal      | 9.0   | Ends at 15:00 (not night hours) |
| 9     | 18/10/2025 | Saturday  | 14:00-22:00+8h | Saturday    | 8.0   | Weekend takes priority |
| 10    | 19/10/2025 | Sunday    | 14:00-22:00+8h | Sunday      | 8.0   | Weekend takes priority |

### Break Time Analysis

| Shift | Previous Shift End | Break Hours | Classification |
|-------|-------------------|-------------|----------------|
| 2     | 06:00 (Shift 1 + 8h sleepover) | 8.0 | Weekend (not broken) |
| 3     | 06:00 (Shift 2 + 8h sleepover) | 8.0 | Weekend (not broken) |
| 4     | 06:00 (Shift 3 + 8h sleepover) | 0.0 | Night (priority over broken) |
| 5     | 06:30 | 8.5 | Night (priority over broken) |
| 6     | 22:00 | 8.0 | Broken shift (normal weekday) |
| 7     | 17:00 | 20.5 | Normal break |
| 8     | 06:00 (Shift 7 + 8h sleepover) | 24.0 | Normal break |
| 9     | 15:00 | 23.0 | Normal break |
| 10    | 06:00 (Shift 9 + 8h sleepover) | 8.0 | Weekend (not broken) |

## Validation Results

✅ **Total Hours:** 76.5 (matches expected)
✅ **Normal Hours:** 9.0 (Only Shift 8: 9.0, as Shift 6's 11.0 hours were reclassified as broken)
✅ **Night Hours:** 24.5 (Shifts 1, 4, 5, 7 = 8.5 + 0.5 + 7.0 + 8.5)
✅ **Saturday Hours:** 16.0 (Shifts 2, 9 = 8.0 + 8.0)
✅ **Sunday Hours:** 16.0 (Shifts 3, 10 = 8.0 + 8.0)
✅ **Broken Shift Hours:** 11.0 (Shift 6: 11.0, reclassified from normal due to insufficient break)
✅ **Sleepover Count:** 6 (Shifts 1, 2, 3, 7, 9, 10)

All calculations match the expected breakdown! ✅
