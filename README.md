# Payslip Checker

A comprehensive web-based payslip calculator for Australian workers that helps you calculate your pay including tax withholding and HELP debt repayments.

## Features

- **Pay Calculator**: Input your hours worked, pay rate, and allowances to calculate your net pay
- **Multiple Award Support**: Select from different awards with pre-configured rate multipliers
- **Rate Types**: Support for:
  - Normal hours
  - Overtime (configurable multiplier)
  - Saturday rates (configurable multiplier)
  - Sunday rates (configurable multiplier)
  - Night shift rates (configurable multiplier)
  - Afternoon shift rates (configurable multiplier)
- **Award Allowances**: Configure awards with:
  - Meal allowances (up to 2) triggered after specified hours
  - Sleepover shift support with custom rates
  - First aid allowances
  - Custom allowances (unlimited)
  - Extended shift hours before overtime kicks in
- **Smart Allowance Questions**: Automatically displays relevant allowance questions based on selected award (only shows allowances configured in the award with values > $0)
- **Australian Tax Calculation**: Uses configurable tax brackets with multi-year support
- **HELP Debt Repayment**: Calculates HELP debt repayments with multi-year thresholds
- **Admin Interface**: Configure awards, tax rates, and HELP debt thresholds
- **Import/Export**: Download and upload award configurations as JSON files
- **Defaults Configuration Export**: Download defaults configuration for awards, tax rates, and HELP debt thresholds as a single JSON file
- **Custom Default Configurations**: Load default settings from JSON files (optional)
- **Persistent Storage**: Settings saved in browser local storage
- **Clear Data Options**: Individual clear buttons for each data category

## Usage

### For Users

1. Open `index.html` in your web browser
2. Select an award from the dropdown
3. Enter your base pay rate ($/hour)
4. Enter hours worked:
   - Normal hours
   - Overtime hours
   - Saturday hours (separate from Sunday)
   - Sunday hours (separate from Saturday)
   - Night shift hours
5. Answer allowance questions that appear based on your selected award:
   - Meal allowances (if applicable to your award and configured with amount > $0)
   - First aid certificate (if applicable to your award and configured with amount > $0)
   - Custom allowances (if configured in your award)
   - Note: Only allowances configured in your selected award will appear
6. Enter any additional manual allowances not covered by the questions
7. Select if you have a HELP debt
8. Click "Calculate Pay" to see your breakdown

#### Using the Hours Calculator

The Hours Calculator helps you track actual hours worked across multiple shifts and automatically categorizes them based on shift type, timing, and breaks.

1. Click the "Hours Calculator" tab
2. Select an award from the dropdown
3. For each shift, enter:
   - **Shift Start Date and Time**: When the shift begins
   - **Shift End Date and Time**: When the shift ends
   - **Is this a sleepover shift?**: Select "Yes" if applicable
     - **Sleepover Start Time (optional)**: When the sleepover period begins within the shift
     - **Sleepover End Time (optional)**: When the sleepover period ends within the shift
     - Leave sleepover times empty if the sleepover is a standard 8-hour period after the work shift
   - **Sleepover Agreement**: Check if you have a signed agreement for 8-hour breaks after sleepovers
4. Click "Add Another Shift" to add more shifts
5. Click "Calculate Hours" to see the breakdown

**Hours Breakdown:**
- **Total Hours Worked**: Sum of all working hours (excluding sleepover periods)
- **Normal Hours**: Regular hours within standard daily limits
- **Overtime1/Overtime2 Hours**: Hours beyond daily maximums
- **Broken Shift Hours**: Shifts with insufficient break time from previous shift
- **Saturday/Sunday Hours**: Weekend shifts (classified separately)
- **Afternoon/Night Shift Hours**: Based on shift end time
- **Meal Allowances**: Automatically calculated for consecutive shifts

**Important Notes:**
- **Sleepover Shifts with Work Before and After**: You can now specify sleepover periods within a shift. For example, a shift from 17:00 to 09:00 with sleepover from 22:00 to 06:00 will calculate working hours as: pre-sleepover work (17:00-22:00 = 5 hours) + post-sleepover work (06:00-09:00 = 3 hours) = 8 total working hours.
- **Broken Shifts**: Previously, weekend and night shifts maintained their classification even with insufficient break times. Now, shifts with less than the minimum break time (10 hours normally, or 8 hours with sleepover agreement) are classified as broken shifts, **regardless of whether they are weekend or night shifts**.
- **Break Time Tolerance**: An exact 8-hour break (when allowed with agreement) is acceptable and won't be flagged as insufficient.
- **Night Shift Classification**: For sleepover shifts with work after the sleepover, the end of the entire shift (including post-sleepover work) is used to determine if it qualifies as a night shift.

6. Click "Push Hours to Pay Calculator" to transfer the calculated hours to the Pay Calculator tab

### For Administrators

#### Award Management

1. Click the "Admin Settings" tab
2. **Creating an Award**:
   - Enter award name (e.g., "Retail Award")
   - **Rate Multipliers**:
     - Normal Rate: Usually 1.0 (base multiplier)
     - Overtime Rate: Typically 1.5 (time-and-a-half)
     - Saturday Rate: Weekend penalty rate for Saturdays (e.g., 1.5)
     - Sunday Rate: Weekend penalty rate for Sundays (e.g., 2.0)
     - Night Shift Rate: Penalty for night work (e.g., 1.25)
     - Afternoon Shift Rate: Penalty for afternoon shift work (e.g., 1.15)
   - **Overtime Rules**:
     - Max Daily Hours: Hours before daily overtime kicks in (default: 8)
     - Min Break Between Shifts: Minimum rest period in hours (default: 10)
     - Max Weekly Hours: Hours before weekly overtime kicks in (default: 38)
     - Night Shift Start Time: When night shift rates begin (default: 22:00)
     - Night Shift End Time: When night shift rates end (default: 06:00)
     - Afternoon Shift Start Time: When afternoon shift rates begin (default: 14:00)
     - Afternoon Shift End Time: When afternoon shift rates end (default: 22:00)
     - Extended Shift Hours: Hours before extended shift overtime applies (default: 10)
   - **Award Features** (Check boxes to enable and configure):
     - ☑ **Sleepovers Included**: Enable if award includes sleepover shifts
       - Sleepover Rate: Fixed amount per sleepover shift
     - ☑ **Meal Allowances**: Enable if award includes meal allowances
       - Meal Allowance 1: Amount paid after specified hours
       - After how many hours: Trigger point for first meal allowance
       - Meal Allowance 2: Amount for second meal allowance
       - After how many hours: Trigger point for second meal allowance
     - ☑ **First Aid Allowance**: Enable if award includes first aid pay
       - First Aid Allowance: Weekly amount for holding first aid certificate
     - ☑ **Custom Allowances**: Enable to add unlimited custom allowances
       - Add custom allowance entries with name and amount
   - Click "Add Award" to save
   
3. **Managing Existing Awards**:
   - View all configured awards in the "Existing Awards" section
   - Each award shows: Name and rate multipliers
   - Click "Delete" to remove an award
   - **Clear Awards Data** button: Removes all awards and reloads defaults

4. **Import/Export Configuration**:
   - **Download Defaults Configuration**:
     - Downloads a single JSON file containing awards, tax rates, and HELP debt thresholds
     - Can be used as default configuration files for the application
   - **Complete Configuration**:
     - Download: Saves awards, tax rates, HELP rates, calculator data, shifts, and settings
     - Upload: Restores complete configuration from JSON file
   - **Awards Only** (Legacy):
     - Download: Saves only awards configuration
     - Upload: Restores only awards from JSON file

#### Tax Rate Configuration

1. Navigate to "Tax Rate Configuration" section
2. **Financial Year Selection**:
   - Select year from dropdown (e.g., "2024-2025")
   - Click "Add New Year" to create configuration for new financial year
3. **Managing Tax Brackets**:
   - Each bracket requires:
     - Min Income ($): Starting threshold for this tax rate
     - Max Income ($): Ending threshold (leave empty for no upper limit)
     - Tax Rate (%): Percentage of income taxed in this bracket
   - Click "Add Tax Bracket" to add new bracket
   - Click "Delete" on a bracket to remove it
   - Click "Save Tax Rates" to save all changes
4. **Clear Tax Data** button: Removes all tax configuration and reloads defaults

**Example Tax Brackets for 2024-2025**:
- $0 - $18,200: 0%
- $18,201 - $45,000: 19%
- $45,001 - $120,000: 32.5%
- $120,001 - $180,000: 37%
- $180,001+: 45%

#### HELP Debt Configuration

1. Navigate to "HELP Debt Configuration" section
2. **Financial Year Selection**:
   - Select year from dropdown
   - Click "Add New Year" to create new year configuration
3. **Managing HELP Thresholds**:
   - Each threshold requires:
     - Min Income ($): Starting threshold for this repayment rate
     - Max Income ($): Ending threshold (leave empty for no upper limit)
     - Repayment Rate (%): Percentage of income for HELP repayment
   - Click "Add HELP Threshold" to add new threshold
   - Click "Delete" on a threshold to remove it
   - Click "Save HELP Rates" to save all changes
4. **Clear HELP Data** button: Removes all HELP configuration and reloads defaults

**Example HELP Thresholds for 2024-2025**:
- Below $51,550: 0%
- $51,550 - $59,518: 1%
- $59,519 - $63,089: 2%
- (continues with gradual increases)
- Above $151,200: 10%

### Using Default Configuration Files

The main application can load default configurations from JSON files if they exist in the same directory as `index.html`. This allows you to customize the default values without modifying the code.

**Loading Priority:**
1. **LocalStorage** (highest priority) - Settings saved by users take precedence
2. **JSON Files** (medium priority) - If localStorage is empty, loads from:
   - `default-awards.json` for award configurations
   - `default-tax-rates.json` for tax brackets
   - `default-help-rates.json` for HELP debt thresholds
3. **Hardcoded Defaults** (lowest priority) - Built-in fallback values

**To use custom defaults:**
1. Configure your awards, tax rates, and HELP debt thresholds in the Admin Settings tab
2. Click "Download Defaults Configuration" to save the configuration
3. Place the downloaded JSON file in the same directory as `index.html`
4. Rename it to match the expected default file names (see below)
5. Clear your browser's localStorage (or use a new browser/incognito mode)
6. Reload the page - your custom defaults will be loaded

**Example files are provided:**
- `default-awards.json.example`
- `default-tax-rates.json.example`
- `default-help-rates.json.example`

You can rename these files (remove the `.example` extension) to use them as starting templates.

**Note:** If the JSON files are not present or fail to load, the application will automatically fall back to the built-in hardcoded defaults.

## Clear Data Functionality

Each major section has a "Clear Data" button in the header that allows you to reset that specific data category:

- **Clear Calculator Data**: Removes saved pay calculator inputs
- **Clear Shift Data**: Removes saved hours calculator shift information
- **Clear Awards Data**: Removes all custom awards (reloads defaults)
- **Clear Tax Data**: Removes all tax bracket configurations (reloads defaults)
- **Clear HELP Data**: Removes all HELP debt configurations (reloads defaults)

All clear operations require confirmation and will reload the page after clearing data.

## Default Awards

The application comes with three pre-configured awards:
- General Retail Industry Award
- Hospitality Industry Award
- Manufacturing Award

## Default Tax Brackets (2024-2025 Financial Year)

- $0 - $18,200: 0%
- $18,201 - $45,000: 19%
- $45,001 - $120,000: 32.5%
- $120,001 - $180,000: 37%
- $180,001+: 45%

## Default HELP Debt Thresholds (2024-2025 Financial Year)

Repayment rates range from 0% (income below $51,550) to 10% (income above $151,200) with gradual increases based on income thresholds.

## Installation

No installation required! Simply:
1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Start calculating your pay

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage API for data persistence

## Browser Compatibility

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Notes

- All calculations are estimates based on weekly pay extrapolated to annual income
- Tax and HELP debt calculations use simplified methods
- For accurate tax calculations, please consult with a tax professional or use official ATO resources
- Data is stored locally in your browser and is not sent to any server
- Saturday and Sunday rates are now separate to accommodate different penalty rates for each day
- **Sleepover Shifts**: Now supports sleepover shifts with work time before and after the sleepover period (e.g., 17:00-22:00 work, 22:00-06:00 sleepover, 06:00-09:00 work)
- **Broken Shifts**: Weekend and night shifts with insufficient break times are now correctly classified as broken shifts (previously they maintained their original classification)
- **Break Times**: The minimum break time is 10 hours normally, or 8 hours if a sleepover agreement is in place. An exact 8-hour break is acceptable and won't be flagged as insufficient.

## License

This project is open source and available for anyone to use and modify.
