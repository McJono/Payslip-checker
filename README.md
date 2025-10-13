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
   - Download as JSON file
3. **Tax Rates Editor**:
   - Set financial year
   - Configure tax brackets
   - Download as JSON file
4. **HELP Debt Editor**:
   - Set financial year
   - Configure repayment thresholds
   - Download as JSON file

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
