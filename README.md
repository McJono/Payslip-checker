# Payslip Checker

A comprehensive web-based payslip calculator for Australian workers that helps you calculate your pay including tax withholding and HELP debt repayments.

## Features

- **Pay Calculator**: Input your hours worked, pay rate, and allowances to calculate your net pay
- **Multiple Award Support**: Select from different awards with pre-configured rate multipliers
- **Rate Types**: Support for:
  - Normal hours
  - Overtime (configurable multiplier)
  - Weekend rates (configurable multiplier)
  - Night shift rates (configurable multiplier)
- **Award Allowances**: Configure awards with:
  - Meal allowances (up to 2) triggered after specified hours
  - Sleepover shift support with custom rates
  - First aid allowances
  - Custom allowances (unlimited)
  - Extended shift hours before overtime kicks in
- **Australian Tax Calculation**: Uses configurable tax brackets with multi-year support
- **HELP Debt Repayment**: Calculates HELP debt repayments with multi-year thresholds
- **Admin Interface**: Configure awards, tax rates, and HELP debt thresholds
- **Import/Export**: Download and upload award configurations as JSON files
- **Defaults Editor**: Separate tool (defaults-editor.html) for designing JSON configuration files
- **Custom Default Configurations**: Load default settings from JSON files (optional)
- **Persistent Storage**: Settings saved in browser local storage

## Usage

### For Users

1. Open `index.html` in your web browser
2. Select an award from the dropdown
3. Enter your base pay rate ($/hour)
4. Enter hours worked:
   - Normal hours
   - Overtime hours
   - Weekend hours
   - Night shift hours
5. Enter any allowances
6. Select if you have a HELP debt
7. Click "Calculate Pay" to see your breakdown

### For Administrators

1. Click the "Admin Settings" tab
2. **Award Management**:
   - Enter award name
   - Set rate multipliers for different work types
   - Configure overtime rules (max daily/weekly hours, extended shift hours)
   - Set sleepover support and rates
   - Configure meal allowances (up to 2, with hours triggers)
   - Add first aid allowance
   - Add custom allowances as needed
   - Click "Add Award" to save
   - Delete awards as needed
3. **Import/Export Awards**:
   - Download your awards as JSON files
   - Upload previously saved award configurations
4. **Tax Rate Configuration**:
   - Select financial year from dropdown or add new year
   - Add/edit tax brackets with min/max income and tax rate
   - Click "Save Tax Rates" when done
5. **HELP Debt Configuration**:
   - Select financial year from dropdown or add new year
   - Add/edit income thresholds with repayment rates
   - Click "Save HELP Rates" when done

### Using the Defaults Editor

1. Open `defaults-editor.html` in your web browser
2. **Awards Editor**:
   - Load current awards from main app or create new ones
   - Edit all award properties including allowances
   - Download as JSON file (`default-awards.json`)
3. **Tax Rates Editor**:
   - Set financial year
   - Configure tax brackets
   - Download as JSON file (`default-tax-rates.json`)
4. **HELP Debt Editor**:
   - Set financial year
   - Configure repayment thresholds
   - Download as JSON file (`default-help-rates.json`)

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
1. Use the Defaults Editor to create your configuration
2. Download the JSON files
3. Place them in the same directory as `index.html`
4. Clear your browser's localStorage (or use a new browser/incognito mode)
5. Reload the page - your custom defaults will be loaded

**Note:** If the JSON files are not present or fail to load, the application will automatically fall back to the built-in hardcoded defaults.

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

## License

This project is open source and available for anyone to use and modify.
