// Default data storage
let awards = [];
let taxBracketsByYear = {};
let helpThresholdsByYear = {};
let currentTaxYear = '2024-2025';
let currentHelpYear = '2024-2025';
let taxBrackets = []; // For backward compatibility
let helpThresholds = []; // For backward compatibility
let customAllowanceCount = 0;

// User settings/preferences
let userSettings = {
    defaultAwardId: null,
    defaultBaseRate: null,
    defaultPayPeriod: 'fortnightly',
    defaultHelpDebt: false,
    defaultShiftStartTime: null,
    defaultShiftEndTime: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    initializeTabs();
    await loadData();
    renderAwardsList();
    renderTaxYearDropdown();
    renderHelpYearDropdown();
    renderTaxBrackets();
    renderHelpThresholds();
    updateAwardDropdown();
    updateHoursAwardDropdown();
    applyUserSettings();
    loadCalculatorData();
    loadShiftData();
    setupAutoSave();
});

// Tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Helper function to load JSON file with fallback
async function loadJsonFile(filename) {
    try {
        const response = await fetch(filename);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        // File doesn't exist or can't be loaded, return null
    }
    return null;
}

// Load data from localStorage or use defaults
async function loadData() {
    // Load awards
    const savedAwards = localStorage.getItem('awards');
    if (savedAwards) {
        awards = JSON.parse(savedAwards);
    } else {
        // Try to load from default JSON file
        const jsonAwards = await loadJsonFile('default-awards.json');
        if (jsonAwards) {
            awards = jsonAwards;
        } else {
            // Default awards with new fields
            awards = [
                {
                    id: 1,
                    name: 'General Retail Industry Award',
                    normalRate: 1.0,
                    overtimeRate: 1.5,
                    overtime2Hours: 10,
                    overtime2Rate: 2.0,
                    saturdayRate: 1.5,
                    sundayRate: 2.0,
                    nightShiftRate: 1.25,
                    afternoonShiftRate: 1.15,
                    maxDailyHours: 8,
                    minBreakHours: 10,
                    maxWeeklyHours: 38,
                    nightShiftStart: '22:00',
                    nightShiftEnd: '06:00',
                    afternoonShiftStart: '14:00',
                    afternoonShiftEnd: '22:00',
                    hasSleepover: false,
                    sleeperRate: 0,
                    minBreakHoursSleepover: 8,
                    mealAllowance1: 0,
                    mealAllowance1Hours: 5,
                    mealAllowance2Hours: 10,
                    firstAidAllowance: 0,
                    firstAidMaxAmount: 0,
                    customAllowances: []
                },
                {
                    id: 2,
                    name: 'Hospitality Industry Award',
                    normalRate: 1.0,
                    overtimeRate: 1.5,
                    overtime2Hours: 10,
                    overtime2Rate: 2.0,
                    saturdayRate: 1.5,
                    sundayRate: 1.75,
                    nightShiftRate: 1.15,
                    afternoonShiftRate: 1.15,
                    maxDailyHours: 8,
                    minBreakHours: 10,
                    maxWeeklyHours: 38,
                    nightShiftStart: '22:00',
                    nightShiftEnd: '06:00',
                    afternoonShiftStart: '14:00',
                    afternoonShiftEnd: '22:00',
                    hasSleepover: false,
                    sleeperRate: 0,
                    minBreakHoursSleepover: 8,
                    mealAllowance1: 0,
                    mealAllowance1Hours: 5,
                    mealAllowance2Hours: 10,
                    firstAidAllowance: 0,
                    firstAidMaxAmount: 0,
                    customAllowances: []
                },
                {
                    id: 3,
                    name: 'Manufacturing Award',
                    normalRate: 1.0,
                    overtimeRate: 1.5,
                    overtime2Hours: 10,
                    overtime2Rate: 2.0,
                    saturdayRate: 1.5,
                    sundayRate: 2.0,
                    nightShiftRate: 1.3,
                    afternoonShiftRate: 1.15,
                    maxDailyHours: 8,
                    minBreakHours: 10,
                    maxWeeklyHours: 38,
                    nightShiftStart: '22:00',
                    nightShiftEnd: '06:00',
                    afternoonShiftStart: '14:00',
                    afternoonShiftEnd: '22:00',
                    hasSleepover: false,
                    sleeperRate: 0,
                    minBreakHoursSleepover: 8,
                    mealAllowance1: 0,
                    mealAllowance1Hours: 5,
                    mealAllowance2Hours: 10,
                    firstAidAllowance: 0,
                    firstAidMaxAmount: 0,
                    customAllowances: []
                }
            ];
        }
        saveAwards();
    }
    
    // Load tax brackets by year
    const savedTaxBrackets = localStorage.getItem('taxBracketsByYear');
    if (savedTaxBrackets) {
        taxBracketsByYear = JSON.parse(savedTaxBrackets);
    } else {
        // Try to load from old storage format
        const oldTaxBrackets = localStorage.getItem('taxBrackets');
        if (oldTaxBrackets) {
            const parsed = JSON.parse(oldTaxBrackets);
            taxBracketsByYear = { '2024-2025': parsed };
        } else {
            // Try to load from default JSON file
            const jsonTaxBrackets = await loadJsonFile('default-tax-rates.json');
            if (jsonTaxBrackets) {
                taxBracketsByYear = jsonTaxBrackets;
            } else {
                // Default Australian tax brackets for 2024-2025
                taxBracketsByYear = {
                    '2024-2025': [
                        { min: 0, max: 18200, rate: 0 },
                        { min: 18201, max: 45000, rate: 0.19 },
                        { min: 45001, max: 120000, rate: 0.325 },
                        { min: 120001, max: 180000, rate: 0.37 },
                        { min: 180001, max: Infinity, rate: 0.45 }
                    ]
                };
            }
        }
    }
    
    // Set current tax brackets
    taxBrackets = taxBracketsByYear[currentTaxYear] || [];
    
    // Save if we loaded defaults
    if (!savedTaxBrackets) {
        saveTaxBrackets();
    }
    
    // Load HELP debt thresholds by year
    const savedHelpThresholds = localStorage.getItem('helpThresholdsByYear');
    if (savedHelpThresholds) {
        helpThresholdsByYear = JSON.parse(savedHelpThresholds);
    } else {
        // Try to load from old storage format
        const oldHelpThresholds = localStorage.getItem('helpThresholds');
        if (oldHelpThresholds) {
            const parsed = JSON.parse(oldHelpThresholds);
            helpThresholdsByYear = { '2024-2025': parsed };
        } else {
            // Try to load from default JSON file
            const jsonHelpThresholds = await loadJsonFile('default-help-rates.json');
            if (jsonHelpThresholds) {
                helpThresholdsByYear = jsonHelpThresholds;
            } else {
                // Default Australian HELP debt repayment rates for 2024-2025
                helpThresholdsByYear = {
                    '2024-2025': [
                        { min: 0, max: 51550, rate: 0 },
                        { min: 51551, max: 59518, rate: 0.01 },
                        { min: 59519, max: 63089, rate: 0.02 },
                        { min: 63090, max: 66875, rate: 0.025 },
                        { min: 66876, max: 70888, rate: 0.03 },
                        { min: 70889, max: 75140, rate: 0.035 },
                        { min: 75141, max: 79649, rate: 0.04 },
                        { min: 79650, max: 84429, rate: 0.045 },
                        { min: 84430, max: 89494, rate: 0.05 },
                        { min: 89495, max: 94865, rate: 0.055 },
                        { min: 94866, max: 100557, rate: 0.06 },
                        { min: 100558, max: 106590, rate: 0.065 },
                        { min: 106591, max: 112985, rate: 0.07 },
                        { min: 112986, max: 119764, rate: 0.075 },
                        { min: 119765, max: 126950, rate: 0.08 },
                        { min: 126951, max: 134568, rate: 0.085 },
                        { min: 134569, max: 142642, rate: 0.09 },
                        { min: 142643, max: 151200, rate: 0.095 },
                        { min: 151201, max: Infinity, rate: 0.10 }
                    ]
                };
            }
        }
    }
    
    // Set current help thresholds
    helpThresholds = helpThresholdsByYear[currentHelpYear] || [];
    
    // Save if we loaded defaults
    if (!savedHelpThresholds) {
        saveHelpThresholds();
    }
    
    // Load user settings
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
        userSettings = { ...userSettings, ...JSON.parse(savedSettings) };
    }
}

// Save functions
function saveAwards() {
    localStorage.setItem('awards', JSON.stringify(awards));
}

function saveUserSettings() {
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
}

function saveTaxBrackets() {
    taxBracketsByYear[currentTaxYear] = taxBrackets;
    localStorage.setItem('taxBracketsByYear', JSON.stringify(taxBracketsByYear));
}

function saveHelpThresholds() {
    helpThresholdsByYear[currentHelpYear] = helpThresholds;
    localStorage.setItem('helpThresholdsByYear', JSON.stringify(helpThresholdsByYear));
}

// Save and load calculator data
function saveCalculatorData() {
    const calculatorData = {
        award: document.getElementById('award')?.value || '',
        baseRate: document.getElementById('baseRate')?.value || '',
        payPeriod: document.getElementById('payPeriod')?.value || 'fortnightly',
        normalHours: document.getElementById('normalHours')?.value || '0',
        overtimeHours: document.getElementById('overtimeHours')?.value || '0',
        saturdayHours: document.getElementById('saturdayHours')?.value || '0',
        sundayHours: document.getElementById('sundayHours')?.value || '0',
        afternoonHours: document.getElementById('afternoonHours')?.value || '0',
        nightShiftHours: document.getElementById('nightShiftHours')?.value || '0',
        manualAllowances: document.getElementById('manualAllowances')?.value || '0',
        helpDebt: document.getElementById('helpDebt')?.value || 'false',
        sleeperRateInput: document.getElementById('sleeperRateInput')?.value || '0'
    };
    localStorage.setItem('calculatorData', JSON.stringify(calculatorData));
}

function loadCalculatorData() {
    const saved = localStorage.getItem('calculatorData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (document.getElementById('award')) document.getElementById('award').value = data.award || '';
            if (document.getElementById('baseRate')) document.getElementById('baseRate').value = data.baseRate || '';
            if (document.getElementById('payPeriod')) document.getElementById('payPeriod').value = data.payPeriod || 'fortnightly';
            if (document.getElementById('normalHours')) document.getElementById('normalHours').value = data.normalHours || '0';
            if (document.getElementById('overtimeHours')) document.getElementById('overtimeHours').value = data.overtimeHours || '0';
            // Handle backward compatibility with old weekendHours
            if (data.weekendHours !== undefined && !data.saturdayHours && !data.sundayHours) {
                if (document.getElementById('saturdayHours')) document.getElementById('saturdayHours').value = data.weekendHours || '0';
                if (document.getElementById('sundayHours')) document.getElementById('sundayHours').value = '0';
            } else {
                if (document.getElementById('saturdayHours')) document.getElementById('saturdayHours').value = data.saturdayHours || '0';
                if (document.getElementById('sundayHours')) document.getElementById('sundayHours').value = data.sundayHours || '0';
            }
            if (document.getElementById('afternoonHours')) document.getElementById('afternoonHours').value = data.afternoonHours || '0';
            if (document.getElementById('nightShiftHours')) document.getElementById('nightShiftHours').value = data.nightShiftHours || '0';
            // Handle backward compatibility with old allowances field
            if (data.allowances !== undefined && !data.manualAllowances) {
                if (document.getElementById('manualAllowances')) document.getElementById('manualAllowances').value = data.allowances || '0';
            } else {
                if (document.getElementById('manualAllowances')) document.getElementById('manualAllowances').value = data.manualAllowances || '0';
            }
            if (document.getElementById('helpDebt')) document.getElementById('helpDebt').value = data.helpDebt || 'false';
            if (document.getElementById('sleeperRateInput')) document.getElementById('sleeperRateInput').value = data.sleeperRateInput || '0';
            
            // Update allowances questions after loading award
            updateAllowancesQuestions();
        } catch (error) {
            console.error('Error loading calculator data:', error);
        }
    }
}

// Save and load shift data
function saveShiftData() {
    const shiftEntries = document.querySelectorAll('.shift-entry');
    const shifts = [];
    
    shiftEntries.forEach((entry, index) => {
        const shiftIndex = entry.getAttribute('data-shift-index');
        const shift = {
            startDate: document.getElementById(`shiftStartDate-${shiftIndex}`)?.value || '',
            startTime: document.getElementById(`shiftStartTime-${shiftIndex}`)?.value || '',
            endDate: document.getElementById(`shiftEndDate-${shiftIndex}`)?.value || '',
            endTime: document.getElementById(`shiftEndTime-${shiftIndex}`)?.value || '',
            isSleepover: document.getElementById(`isSleepover-${shiftIndex}`)?.value || 'false'
        };
        shifts.push(shift);
    });
    
    const shiftData = {
        hoursAward: document.getElementById('hoursAward')?.value || '',
        shifts: shifts,
        shiftCount: shiftCount
    };
    localStorage.setItem('shiftData', JSON.stringify(shiftData));
}

function loadShiftData() {
    const saved = localStorage.getItem('shiftData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (document.getElementById('hoursAward')) {
                document.getElementById('hoursAward').value = data.hoursAward || '';
            }
            
            // Load shifts if they exist
            if (data.shifts && data.shifts.length > 0) {
                // Clear existing shifts except the first one
                const container = document.getElementById('shiftsContainer');
                if (container) {
                    const firstShift = container.querySelector('.shift-entry[data-shift-index="0"]');
                    container.innerHTML = '';
                    if (firstShift) container.appendChild(firstShift);
                    
                    shiftCount = data.shiftCount || data.shifts.length;
                    
                    // Load first shift data
                    if (data.shifts[0]) {
                        const shift = data.shifts[0];
                        if (document.getElementById('shiftStartDate-0')) document.getElementById('shiftStartDate-0').value = shift.startDate || '';
                        if (document.getElementById('shiftStartTime-0')) document.getElementById('shiftStartTime-0').value = shift.startTime || '';
                        if (document.getElementById('shiftEndDate-0')) document.getElementById('shiftEndDate-0').value = shift.endDate || '';
                        if (document.getElementById('shiftEndTime-0')) document.getElementById('shiftEndTime-0').value = shift.endTime || '';
                        if (document.getElementById('isSleepover-0')) document.getElementById('isSleepover-0').value = shift.isSleepover || 'false';
                    }
                    
                    // Add additional shifts
                    for (let i = 1; i < data.shifts.length; i++) {
                        addShift();
                        const shift = data.shifts[i];
                        const idx = i;
                        setTimeout(() => {
                            if (document.getElementById(`shiftStartDate-${idx}`)) document.getElementById(`shiftStartDate-${idx}`).value = shift.startDate || '';
                            if (document.getElementById(`shiftStartTime-${idx}`)) document.getElementById(`shiftStartTime-${idx}`).value = shift.startTime || '';
                            if (document.getElementById(`shiftEndDate-${idx}`)) document.getElementById(`shiftEndDate-${idx}`).value = shift.endDate || '';
                            if (document.getElementById(`shiftEndTime-${idx}`)) document.getElementById(`shiftEndTime-${idx}`).value = shift.endTime || '';
                            if (document.getElementById(`isSleepover-${idx}`)) document.getElementById(`isSleepover-${idx}`).value = shift.isSleepover || 'false';
                        }, 100);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading shift data:', error);
        }
    }
}

// Apply user settings to form defaults
function applyUserSettings() {
    if (userSettings.defaultAwardId && document.getElementById('award')) {
        document.getElementById('award').value = userSettings.defaultAwardId;
    }
    if (userSettings.defaultAwardId && document.getElementById('hoursAward')) {
        document.getElementById('hoursAward').value = userSettings.defaultAwardId;
    }
    if (userSettings.defaultBaseRate && document.getElementById('baseRate')) {
        document.getElementById('baseRate').value = userSettings.defaultBaseRate;
    }
    if (userSettings.defaultPayPeriod && document.getElementById('payPeriod')) {
        document.getElementById('payPeriod').value = userSettings.defaultPayPeriod;
    }
    if (userSettings.defaultHelpDebt !== undefined && document.getElementById('helpDebt')) {
        document.getElementById('helpDebt').value = userSettings.defaultHelpDebt ? 'true' : 'false';
    }
}

// Setup auto-save for calculator and shift data
function setupAutoSave() {
    // Auto-save calculator data on input changes
    const calculatorFields = ['award', 'baseRate', 'payPeriod', 'normalHours', 'overtimeHours', 
                              'saturdayHours', 'sundayHours', 'afternoonHours', 'nightShiftHours', 'manualAllowances', 'helpDebt', 'sleeperRateInput'];
    
    calculatorFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('change', () => {
                saveCalculatorData();
            });
        }
    });
    
    // Auto-save shift data when switching tabs (to capture any changes)
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            saveCalculatorData();
            saveShiftData();
        });
    });
}

// Award Management
function addAward() {
    const name = document.getElementById('awardName').value.trim();
    const normalRate = parseFloat(document.getElementById('normalRate').value);
    const overtimeRate = parseFloat(document.getElementById('overtimeRate').value);
    const overtime2Hours = parseFloat(document.getElementById('overtime2Hours').value);
    const overtime2Rate = parseFloat(document.getElementById('overtime2Rate').value);
    const saturdayRate = parseFloat(document.getElementById('saturdayRate').value);
    const sundayRate = parseFloat(document.getElementById('sundayRate').value);
    const nightShiftRate = parseFloat(document.getElementById('nightShiftRate').value);
    const afternoonShiftRate = parseFloat(document.getElementById('afternoonShiftRate').value);
    const maxDailyHours = parseFloat(document.getElementById('maxDailyHours').value);
    const minBreakHours = parseFloat(document.getElementById('minBreakHours').value);
    const maxWeeklyHours = parseFloat(document.getElementById('maxWeeklyHours').value);
    const nightShiftStart = document.getElementById('nightShiftStart').value;
    const nightShiftEnd = document.getElementById('nightShiftEnd').value;
    const afternoonShiftStart = document.getElementById('afternoonShiftStart').value;
    const afternoonShiftEnd = document.getElementById('afternoonShiftEnd').value;
    const hasSleepover = document.getElementById('hasSleepover').checked;
    const sleeperRate = parseFloat(document.getElementById('sleeperRate').value);
    const minBreakHoursSleepover = parseFloat(document.getElementById('minBreakHoursSleepover').value);
    const mealAllowance1 = parseFloat(document.getElementById('mealAllowance1').value);
    const mealAllowance1Hours = parseFloat(document.getElementById('mealAllowance1Hours').value);
    const mealAllowance2Hours = parseFloat(document.getElementById('mealAllowance2Hours').value);
    const firstAidAllowance = parseFloat(document.getElementById('firstAidAllowance').value);
    const firstAidMaxAmount = parseFloat(document.getElementById('firstAidMaxAmount').value);
    
    if (!name) {
        alert('Please enter an award name');
        return;
    }
    
    // Collect custom allowances
    const customAllowances = [];
    const customAllowanceInputs = document.querySelectorAll('.custom-allowance-item');
    customAllowanceInputs.forEach(item => {
        const nameInput = item.querySelector('.custom-allowance-name');
        const amountInput = item.querySelector('.custom-allowance-amount');
        if (nameInput && amountInput && nameInput.value.trim()) {
            customAllowances.push({
                name: nameInput.value.trim(),
                amount: parseFloat(amountInput.value) || 0
            });
        }
    });
    
    const newAward = {
        id: Date.now(),
        name: name,
        normalRate: normalRate,
        overtimeRate: overtimeRate,
        overtime2Hours: overtime2Hours || 10,
        overtime2Rate: overtime2Rate || 2.0,
        saturdayRate: saturdayRate,
        sundayRate: sundayRate,
        nightShiftRate: nightShiftRate,
        afternoonShiftRate: afternoonShiftRate || 1.15,
        maxDailyHours: maxDailyHours || 8,
        minBreakHours: minBreakHours || 10,
        maxWeeklyHours: maxWeeklyHours || 38,
        nightShiftStart: nightShiftStart || '22:00',
        nightShiftEnd: nightShiftEnd || '06:00',
        afternoonShiftStart: afternoonShiftStart || '14:00',
        afternoonShiftEnd: afternoonShiftEnd || '22:00',
        hasSleepover: hasSleepover,
        sleeperRate: sleeperRate || 0,
        minBreakHoursSleepover: minBreakHoursSleepover || 8,
        mealAllowance1: mealAllowance1 || 0,
        mealAllowance1Hours: mealAllowance1Hours || 5,
        mealAllowance2Hours: mealAllowance2Hours || 10,
        firstAidAllowance: firstAidAllowance || 0,
        firstAidMaxAmount: firstAidMaxAmount || 0,
        customAllowances: customAllowances
    };
    
    awards.push(newAward);
    saveAwards();
    renderAwardsList();
    updateAwardDropdown();
    updateHoursAwardDropdown();
    
    // Clear form
    document.getElementById('awardName').value = '';
    document.getElementById('normalRate').value = '1.0';
    document.getElementById('overtimeRate').value = '1.5';
    document.getElementById('overtime2Hours').value = '10';
    document.getElementById('overtime2Rate').value = '2.0';
    document.getElementById('saturdayRate').value = '1.5';
    document.getElementById('sundayRate').value = '2.0';
    document.getElementById('nightShiftRate').value = '1.25';
    document.getElementById('afternoonShiftRate').value = '1.15';
    document.getElementById('maxDailyHours').value = '8';
    document.getElementById('minBreakHours').value = '10';
    document.getElementById('maxWeeklyHours').value = '38';
    document.getElementById('nightShiftStart').value = '22:00';
    document.getElementById('nightShiftEnd').value = '06:00';
    document.getElementById('afternoonShiftStart').value = '14:00';
    document.getElementById('afternoonShiftEnd').value = '22:00';
    document.getElementById('hasSleepover').checked = false;
    document.getElementById('sleeperRate').value = '0';
    document.getElementById('minBreakHoursSleepover').value = '8';
    document.getElementById('mealAllowance1').value = '0';
    document.getElementById('mealAllowance1Hours').value = '5';
    document.getElementById('mealAllowance2Hours').value = '10';
    document.getElementById('firstAidAllowance').value = '0';
    document.getElementById('firstAidMaxAmount').value = '0';
    document.getElementById('customAllowancesContainer').innerHTML = '';
    customAllowanceCount = 0;
    
    // Reset checkboxes and hide sections
    document.getElementById('hasMealAllowances').checked = false;
    document.getElementById('hasFirstAid').checked = false;
    document.getElementById('hasCustomAllowances').checked = false;
    toggleSleeperSection();
    toggleMealAllowancesSection();
    toggleFirstAidSection();
    toggleCustomAllowancesSection();
    
    alert('Award added successfully!');
}

// Toggle functions for award feature sections
function toggleSleeperSection() {
    const checkbox = document.getElementById('hasSleepover');
    const section = document.getElementById('sleeperSection');
    section.style.display = checkbox.checked ? 'block' : 'none';
}

function toggleMealAllowancesSection() {
    const checkbox = document.getElementById('hasMealAllowances');
    const section = document.getElementById('mealAllowancesSection');
    section.style.display = checkbox.checked ? 'block' : 'none';
}

function toggleFirstAidSection() {
    const checkbox = document.getElementById('hasFirstAid');
    const section = document.getElementById('firstAidSection');
    section.style.display = checkbox.checked ? 'block' : 'none';
}

function toggleCustomAllowancesSection() {
    const checkbox = document.getElementById('hasCustomAllowances');
    const section = document.getElementById('customAllowancesSection');
    section.style.display = checkbox.checked ? 'block' : 'none';
}

// Clear localStorage function
function clearLocalStorage(category) {
    const confirmMsg = `Are you sure you want to clear all ${category} data? This action cannot be undone.`;
    if (confirm(confirmMsg)) {
        if (category === 'all') {
            localStorage.clear();
            alert('All data has been cleared. The page will now reload.');
            location.reload();
        } else if (category === 'calculator') {
            localStorage.removeItem('calculatorData');
            alert('Calculator data has been cleared. The page will now reload.');
            location.reload();
        } else if (category === 'shifts') {
            localStorage.removeItem('shiftData');
            alert('Shift data has been cleared. The page will now reload.');
            location.reload();
        } else if (category === 'awards') {
            localStorage.removeItem('awards');
            alert('Awards data has been cleared. The page will now reload.');
            location.reload();
        } else if (category === 'tax') {
            localStorage.removeItem('taxBracketsByYear');
            localStorage.removeItem('taxBrackets');
            alert('Tax data has been cleared. The page will now reload.');
            location.reload();
        } else if (category === 'help') {
            localStorage.removeItem('helpThresholdsByYear');
            localStorage.removeItem('helpThresholds');
            alert('HELP debt data has been cleared. The page will now reload.');
            location.reload();
        }
    }
}

function addCustomAllowanceField() {
    const container = document.getElementById('customAllowancesContainer');
    const index = customAllowanceCount++;
    
    const div = document.createElement('div');
    div.className = 'custom-allowance-item';
    div.style.display = 'grid';
    div.style.gridTemplateColumns = '1fr 1fr auto';
    div.style.gap = '10px';
    div.style.marginBottom = '10px';
    div.innerHTML = `
        <input type="text" class="form-control custom-allowance-name" placeholder="Allowance name">
        <input type="number" class="form-control custom-allowance-amount" step="0.01" min="0" placeholder="Amount ($)">
        <button onclick="this.parentElement.remove()" class="btn btn-danger">Remove</button>
    `;
    container.appendChild(div);
}

function downloadAwards() {
    const dataStr = JSON.stringify(awards, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'payslip-awards.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Download complete configuration
function downloadConfiguration() {
    // Save current form data before exporting
    saveCalculatorData();
    saveShiftData();
    
    const configuration = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        awards: awards,
        taxBracketsByYear: taxBracketsByYear,
        helpThresholdsByYear: helpThresholdsByYear,
        currentTaxYear: currentTaxYear,
        currentHelpYear: currentHelpYear,
        userSettings: userSettings,
        calculatorData: JSON.parse(localStorage.getItem('calculatorData') || '{}'),
        shiftData: JSON.parse(localStorage.getItem('shiftData') || '{}')
    };
    
    const dataStr = JSON.stringify(configuration, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'payslip-configuration.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Download defaults configuration (awards, tax rates, HELP rates only)
function downloadDefaultsConfiguration() {
    const defaultsConfig = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        awards: awards,
        taxBracketsByYear: taxBracketsByYear,
        helpThresholdsByYear: helpThresholdsByYear
    };
    
    const dataStr = JSON.stringify(defaultsConfig, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'payslip-defaults.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function uploadAwards(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const uploadedAwards = JSON.parse(e.target.result);
            if (!Array.isArray(uploadedAwards)) {
                alert('Invalid awards file format');
                return;
            }
            
            awards = uploadedAwards;
            saveAwards();
            renderAwardsList();
            updateAwardDropdown();
            updateHoursAwardDropdown();
            alert('Awards imported successfully!');
        } catch (error) {
            alert('Error parsing awards file: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Upload and merge configuration
function uploadConfiguration(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);
            
            // Check if this is a configuration file (has version field) or just awards
            if (Array.isArray(config)) {
                // Legacy awards-only format
                awards = config;
                saveAwards();
                renderAwardsList();
                updateAwardDropdown();
                updateHoursAwardDropdown();
                alert('Awards imported successfully!');
                return;
            }
            
            // Full configuration format
            if (!config.version) {
                alert('Invalid configuration file format');
                return;
            }
            
            // Merge awards (keep existing custom awards not in uploaded config)
            if (config.awards && Array.isArray(config.awards)) {
                // Keep track of uploaded award IDs
                const uploadedAwardIds = config.awards.map(a => a.id);
                
                // Keep local custom awards that aren't in the uploaded config
                const localCustomAwards = awards.filter(a => !uploadedAwardIds.includes(a.id));
                
                // Merge: uploaded awards + remaining local custom awards
                awards = [...config.awards, ...localCustomAwards];
                saveAwards();
            }
            
            // Merge tax brackets by year
            if (config.taxBracketsByYear) {
                taxBracketsByYear = { ...taxBracketsByYear, ...config.taxBracketsByYear };
                saveTaxBrackets();
            }
            
            // Merge HELP thresholds by year
            if (config.helpThresholdsByYear) {
                helpThresholdsByYear = { ...helpThresholdsByYear, ...config.helpThresholdsByYear };
                saveHelpThresholds();
            }
            
            // Update current years if provided
            if (config.currentTaxYear) {
                currentTaxYear = config.currentTaxYear;
                taxBrackets = taxBracketsByYear[currentTaxYear] || [];
            }
            
            if (config.currentHelpYear) {
                currentHelpYear = config.currentHelpYear;
                helpThresholds = helpThresholdsByYear[currentHelpYear] || [];
            }
            
            // Merge user settings (preserve local settings not in uploaded config)
            if (config.userSettings) {
                userSettings = { ...userSettings, ...config.userSettings };
                saveUserSettings();
            }
            
            // Load calculator data if provided (but don't overwrite if not present in config)
            if (config.calculatorData && Object.keys(config.calculatorData).length > 0) {
                localStorage.setItem('calculatorData', JSON.stringify(config.calculatorData));
            }
            
            // Load shift data if provided (but don't overwrite if not present in config)
            if (config.shiftData && Object.keys(config.shiftData).length > 0) {
                localStorage.setItem('shiftData', JSON.stringify(config.shiftData));
            }
            
            // Refresh all UI components
            renderAwardsList();
            renderTaxYearDropdown();
            renderHelpYearDropdown();
            renderTaxBrackets();
            renderHelpThresholds();
            updateAwardDropdown();
            updateHoursAwardDropdown();
            applyUserSettings();
            loadCalculatorData();
            loadShiftData();
            
            alert('Configuration imported and merged successfully!');
        } catch (error) {
            alert('Error parsing configuration file: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

function deleteAward(id) {
    if (confirm('Are you sure you want to delete this award?')) {
        awards = awards.filter(award => award.id !== id);
        saveAwards();
        renderAwardsList();
        updateAwardDropdown();
        updateHoursAwardDropdown();
    }
}

function renderAwardsList() {
    const container = document.getElementById('awardsList');
    
    if (awards.length === 0) {
        container.innerHTML = '<p class="info-text">No awards configured yet. Add your first award above.</p>';
        return;
    }
    
    container.innerHTML = awards.map(award => {
        // Handle backward compatibility
        const saturdayRate = award.saturdayRate !== undefined ? award.saturdayRate : award.weekendRate || 1.5;
        const sundayRate = award.sundayRate !== undefined ? award.sundayRate : award.weekendRate || 2.0;
        
        return `
        <div class="award-item">
            <div class="award-info">
                <h4>${award.name}</h4>
                <p>Normal: x${award.normalRate} | Overtime: x${award.overtimeRate} (after ${award.maxDailyHours}h) | Overtime 2: x${award.overtime2Rate || 2.0} (after ${award.overtime2Hours || 10}h) | Saturday: x${saturdayRate} | Sunday: x${sundayRate} | Night: x${award.nightShiftRate}</p>
            </div>
            <button onclick="deleteAward(${award.id})" class="btn btn-danger">Delete</button>
        </div>
        `;
    }).join('');
}

function updateAwardDropdown() {
    const select = document.getElementById('award');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">-- Select Award --</option>' + 
        awards.map(award => `<option value="${award.id}">${award.name}</option>`).join('');
    
    if (currentValue) {
        select.value = currentValue;
    }
    
    // Update allowances questions when award changes
    select.addEventListener('change', updateAllowancesQuestions);
}

// Update allowances questions based on selected award
function updateAllowancesQuestions() {
    const awardId = parseInt(document.getElementById('award').value);
    const container = document.getElementById('allowancesQuestions');
    const sleeperSection = document.getElementById('sleeperRateInputSection');
    const sleeperWarning = document.getElementById('sleeperRateWarning');
    
    if (!awardId) {
        container.innerHTML = '';
        if (sleeperSection) sleeperSection.style.display = 'none';
        if (sleeperWarning) sleeperWarning.style.display = 'none';
        return;
    }
    
    const award = awards.find(a => a.id === awardId);
    if (!award) {
        container.innerHTML = '';
        if (sleeperSection) sleeperSection.style.display = 'none';
        if (sleeperWarning) sleeperWarning.style.display = 'none';
        return;
    }
    
    // Show/hide sleepover rate input based on award
    if (sleeperSection) {
        if (award.hasSleepover) {
            sleeperSection.style.display = 'block';
            // Update placeholder with minimum rate
            const sleeperInput = document.getElementById('sleeperRateInput');
            if (sleeperInput && award.sleeperRate > 0) {
                sleeperInput.placeholder = `Min: ${award.sleeperRate.toFixed(2)}`;
            }
        } else {
            sleeperSection.style.display = 'none';
        }
    }
    if (sleeperWarning) sleeperWarning.style.display = 'none';
    
    let html = '<div class="hours-grid">';
    
    // Meal allowances
    if (award.mealAllowance1 && award.mealAllowance1 > 0) {
        html += `
            <div class="hour-input">
                <label for="mealAllowance1Count">Meal Allowance (after ${award.mealAllowance1Hours} hours @ $${award.mealAllowance1.toFixed(2)}):</label>
                <input type="number" id="mealAllowance1Count" class="form-control" min="0" value="0" placeholder="Number of times">
            </div>
        `;
        
        // Second meal allowance (same payment, different trigger time)
        if (award.mealAllowance2Hours && award.mealAllowance2Hours > 0) {
            html += `
                <div class="hour-input">
                    <label for="mealAllowance2Count">2nd Meal Allowance (after ${award.mealAllowance2Hours} hours @ $${award.mealAllowance1.toFixed(2)}):</label>
                    <input type="number" id="mealAllowance2Count" class="form-control" min="0" value="0" placeholder="Number of times">
                </div>
            `;
        }
    }
    
    // First aid allowance
    if (award.firstAidAllowance && award.firstAidAllowance > 0) {
        html += `
            <div class="hour-input">
                <label for="firstAidHours">First Aid Hours Worked:</label>
                <input type="number" id="firstAidHours" class="form-control" min="0" step="0.25" value="0" placeholder="Hours with first aid certificate">
                <small class="info-text">Rate: $${award.firstAidAllowance.toFixed(2)}/hour${award.firstAidMaxAmount > 0 ? ` (max $${award.firstAidMaxAmount.toFixed(2)} per period)` : ''}</small>
            </div>
        `;
    }
    
    // Custom allowances
    if (award.customAllowances && award.customAllowances.length > 0) {
        award.customAllowances.forEach((allowance, index) => {
            html += `
                <div class="hour-input">
                    <label for="customAllowance${index}">
                        <input type="checkbox" id="customAllowance${index}"> ${allowance.name} ($${allowance.amount.toFixed(2)})
                    </label>
                </div>
            `;
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Tax Bracket Management
function addTaxBracket() {
    taxBrackets.push({ min: 0, max: 0, rate: 0 });
    renderTaxBrackets();
}

function deleteTaxBracket(index) {
    taxBrackets.splice(index, 1);
    renderTaxBrackets();
}

function renderTaxBrackets() {
    const container = document.getElementById('taxBrackets');
    
    container.innerHTML = taxBrackets.map((bracket, index) => `
        <div class="tax-bracket">
            <div class="bracket-input">
                <label>Min Income ($)</label>
                <input type="number" value="${bracket.min}" onchange="updateTaxBracket(${index}, 'min', this.value)" class="form-control" min="0">
            </div>
            <div class="bracket-input">
                <label>Max Income ($)</label>
                <input type="number" value="${bracket.max === Infinity ? '' : bracket.max}" onchange="updateTaxBracket(${index}, 'max', this.value)" class="form-control" placeholder="Leave empty for no limit" min="0">
            </div>
            <div class="bracket-input">
                <label>Tax Rate (%)</label>
                <input type="number" value="${bracket.rate * 100}" onchange="updateTaxBracket(${index}, 'rate', this.value / 100)" class="form-control" step="0.1" min="0" max="100">
            </div>
            <button onclick="deleteTaxBracket(${index})" class="btn btn-danger">Delete</button>
        </div>
    `).join('');
}

function updateTaxBracket(index, field, value) {
    if (field === 'max' && value === '') {
        taxBrackets[index][field] = Infinity;
    } else {
        taxBrackets[index][field] = parseFloat(value) || 0;
    }
}

function saveTaxRates() {
    // Sort brackets by min value
    taxBrackets.sort((a, b) => a.min - b.min);
    saveTaxBrackets();
    alert('Tax rates saved successfully!');
}

// Tax Year Management
function renderTaxYearDropdown() {
    const select = document.getElementById('taxYear');
    if (!select) return;
    
    const years = Object.keys(taxBracketsByYear).sort().reverse();
    select.innerHTML = years.map(year => 
        `<option value="${year}" ${year === currentTaxYear ? 'selected' : ''}>${year}</option>`
    ).join('');
}

function switchTaxYear(year) {
    currentTaxYear = year;
    taxBrackets = taxBracketsByYear[year] || [];
    renderTaxBrackets();
}

function addNewTaxYear() {
    const year = prompt('Enter new financial year (e.g., 2025-2026):');
    if (!year) return;
    
    if (taxBracketsByYear[year]) {
        alert('This year already exists');
        return;
    }
    
    // Create empty tax brackets for new year
    taxBracketsByYear[year] = [];
    currentTaxYear = year;
    taxBrackets = [];
    saveTaxBrackets();
    renderTaxYearDropdown();
    renderTaxBrackets();
    alert('New tax year added successfully!');
}

// HELP Debt Management
function addHelpThreshold() {
    helpThresholds.push({ min: 0, max: 0, rate: 0 });
    renderHelpThresholds();
}

function deleteHelpThreshold(index) {
    helpThresholds.splice(index, 1);
    renderHelpThresholds();
}

function renderHelpThresholds() {
    const container = document.getElementById('helpThresholds');
    
    container.innerHTML = helpThresholds.map((threshold, index) => `
        <div class="help-threshold">
            <div class="bracket-input">
                <label>Min Income ($)</label>
                <input type="number" value="${threshold.min}" onchange="updateHelpThreshold(${index}, 'min', this.value)" class="form-control" min="0">
            </div>
            <div class="bracket-input">
                <label>Max Income ($)</label>
                <input type="number" value="${threshold.max === Infinity ? '' : threshold.max}" onchange="updateHelpThreshold(${index}, 'max', this.value)" class="form-control" placeholder="Leave empty for no limit" min="0">
            </div>
            <div class="bracket-input">
                <label>Repayment Rate (%)</label>
                <input type="number" value="${threshold.rate * 100}" onchange="updateHelpThreshold(${index}, 'rate', this.value / 100)" class="form-control" step="0.1" min="0" max="100">
            </div>
            <button onclick="deleteHelpThreshold(${index})" class="btn btn-danger">Delete</button>
        </div>
    `).join('');
}

function updateHelpThreshold(index, field, value) {
    if (field === 'max' && value === '') {
        helpThresholds[index][field] = Infinity;
    } else {
        helpThresholds[index][field] = parseFloat(value) || 0;
    }
}

function saveHelpRates() {
    // Sort thresholds by min value
    helpThresholds.sort((a, b) => a.min - b.min);
    saveHelpThresholds();
    alert('HELP debt rates saved successfully!');
}

// HELP Year Management
function renderHelpYearDropdown() {
    const select = document.getElementById('helpYear');
    if (!select) return;
    
    const years = Object.keys(helpThresholdsByYear).sort().reverse();
    select.innerHTML = years.map(year => 
        `<option value="${year}" ${year === currentHelpYear ? 'selected' : ''}>${year}</option>`
    ).join('');
}

function switchHelpYear(year) {
    currentHelpYear = year;
    helpThresholds = helpThresholdsByYear[year] || [];
    renderHelpThresholds();
}

function addNewHelpYear() {
    const year = prompt('Enter new financial year (e.g., 2025-2026):');
    if (!year) return;
    
    if (helpThresholdsByYear[year]) {
        alert('This year already exists');
        return;
    }
    
    // Create empty help thresholds for new year
    helpThresholdsByYear[year] = [];
    currentHelpYear = year;
    helpThresholds = [];
    saveHelpThresholds();
    renderHelpYearDropdown();
    renderHelpThresholds();
    alert('New HELP year added successfully!');
}

// Pay Calculation
function calculatePay() {
    // Get input values
    const awardId = parseInt(document.getElementById('award').value);
    const baseRate = parseFloat(document.getElementById('baseRate').value);
    const payPeriod = document.getElementById('payPeriod').value;
    const normalHours = parseFloat(document.getElementById('normalHours').value) || 0;
    const overtimeHours = parseFloat(document.getElementById('overtimeHours').value) || 0;
    const saturdayHours = parseFloat(document.getElementById('saturdayHours').value) || 0;
    const sundayHours = parseFloat(document.getElementById('sundayHours').value) || 0;
    const afternoonHours = parseFloat(document.getElementById('afternoonHours').value) || 0;
    const nightShiftHours = parseFloat(document.getElementById('nightShiftHours').value) || 0;
    const manualAllowances = parseFloat(document.getElementById('manualAllowances').value) || 0;
    const hasHelpDebt = document.getElementById('helpDebt').value === 'true';
    
    // Validation
    if (!awardId) {
        alert('Please select an award');
        return;
    }
    
    if (!baseRate || baseRate <= 0) {
        alert('Please enter a valid base pay rate');
        return;
    }
    
    // Find award
    const award = awards.find(a => a.id === awardId);
    if (!award) {
        alert('Selected award not found');
        return;
    }
    
    // Calculate allowances from questions
    let calculatedAllowances = manualAllowances;
    
    // Meal allowances
    const mealAllowance1Count = parseFloat(document.getElementById('mealAllowance1Count')?.value) || 0;
    calculatedAllowances += (award.mealAllowance1 || 0) * mealAllowance1Count;
    
    // Second meal allowance (same payment as first)
    const mealAllowance2Count = parseFloat(document.getElementById('mealAllowance2Count')?.value) || 0;
    calculatedAllowances += (award.mealAllowance1 || 0) * mealAllowance2Count;
    
    // First aid allowance (per hour with maximum cap)
    const firstAidHours = parseFloat(document.getElementById('firstAidHours')?.value) || 0;
    if (firstAidHours > 0 && award.firstAidAllowance) {
        let firstAidAmount = firstAidHours * award.firstAidAllowance;
        // Apply maximum cap if set
        if (award.firstAidMaxAmount && award.firstAidMaxAmount > 0) {
            firstAidAmount = Math.min(firstAidAmount, award.firstAidMaxAmount);
        }
        calculatedAllowances += firstAidAmount;
    }
    
    // Sleepover allowance (user input with minimum validation)
    const sleeperRateInput = parseFloat(document.getElementById('sleeperRateInput')?.value) || 0;
    if (sleeperRateInput > 0) {
        // Check if below minimum and show warning
        const minSleeperRate = award.sleeperRate || 0;
        const sleeperWarning = document.getElementById('sleeperRateWarning');
        if (sleeperRateInput < minSleeperRate && minSleeperRate > 0) {
            if (sleeperWarning) sleeperWarning.style.display = 'block';
        } else {
            if (sleeperWarning) sleeperWarning.style.display = 'none';
        }
        calculatedAllowances += sleeperRateInput;
    }
    
    // Custom allowances
    if (award.customAllowances && award.customAllowances.length > 0) {
        award.customAllowances.forEach((allowance, index) => {
            const isChecked = document.getElementById(`customAllowance${index}`)?.checked || false;
            if (isChecked) {
                calculatedAllowances += allowance.amount;
            }
        });
    }
    
    // Handle backward compatibility with old weekendRate
    const saturdayRate = award.saturdayRate !== undefined ? award.saturdayRate : award.weekendRate || 1.5;
    const sundayRate = award.sundayRate !== undefined ? award.sundayRate : award.weekendRate || 2.0;
    const afternoonShiftRate = award.afternoonShiftRate || 1.15;
    
    // Calculate pay components
    const normalPay = normalHours * baseRate * award.normalRate;
    const overtimePay = overtimeHours * baseRate * award.overtimeRate;
    const saturdayPay = saturdayHours * baseRate * saturdayRate;
    const sundayPay = sundayHours * baseRate * sundayRate;
    const afternoonPay = afternoonHours * baseRate * afternoonShiftRate;
    const nightShiftPay = nightShiftHours * baseRate * award.nightShiftRate;
    
    // Calculate gross pay
    const grossPay = normalPay + overtimePay + saturdayPay + sundayPay + afternoonPay + nightShiftPay + calculatedAllowances;
    
    // Estimate annual income based on pay period
    const periodsPerYear = payPeriod === 'fortnightly' ? 26 : 52;
    const estimatedAnnualIncome = grossPay * periodsPerYear;
    
    // Calculate tax
    const tax = calculateTax(estimatedAnnualIncome) / periodsPerYear;
    
    // Calculate HELP debt repayment
    const helpRepayment = hasHelpDebt ? calculateHelpDebt(estimatedAnnualIncome) / periodsPerYear : 0;
    
    // Calculate net pay
    const netPay = grossPay - tax - helpRepayment;
    
    // Display results
    displayResults(grossPay, normalPay, overtimePay, saturdayPay, sundayPay, afternoonPay, nightShiftPay, calculatedAllowances, tax, helpRepayment, netPay, payPeriod);
}

function calculateTax(annualIncome) {
    let totalTax = 0;
    
    for (const bracket of taxBrackets) {
        if (annualIncome > bracket.min) {
            const taxableInBracket = Math.min(annualIncome, bracket.max) - bracket.min;
            totalTax += taxableInBracket * bracket.rate;
        }
    }
    
    return totalTax;
}

function calculateHelpDebt(annualIncome) {
    for (const threshold of helpThresholds) {
        if (annualIncome >= threshold.min && annualIncome <= threshold.max) {
            return annualIncome * threshold.rate;
        }
    }
    return 0;
}

function displayResults(grossPay, normalPay, overtimePay, saturdayPay, sundayPay, afternoonPay, nightShiftPay, allowances, tax, helpRepayment, netPay, payPeriod) {
    document.getElementById('grossPay').textContent = formatCurrency(grossPay);
    document.getElementById('normalPay').textContent = formatCurrency(normalPay);
    document.getElementById('overtimePay').textContent = formatCurrency(overtimePay);
    document.getElementById('saturdayPay').textContent = formatCurrency(saturdayPay);
    document.getElementById('sundayPay').textContent = formatCurrency(sundayPay);
    document.getElementById('afternoonPay').textContent = formatCurrency(afternoonPay);
    document.getElementById('nightShiftPay').textContent = formatCurrency(nightShiftPay);
    document.getElementById('allowancesPay').textContent = formatCurrency(allowances);
    document.getElementById('tax').textContent = formatCurrency(tax);
    document.getElementById('helpRepayment').textContent = formatCurrency(helpRepayment);
    document.getElementById('netPay').textContent = formatCurrency(netPay);
    
    // Update pay period label
    const periodLabel = payPeriod === 'fortnightly' ? 'Fortnightly' : 'Weekly';
    document.getElementById('payPeriodLabel').textContent = periodLabel;
    
    document.getElementById('results').style.display = 'block';
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Update hours award dropdown
function updateHoursAwardDropdown() {
    const select = document.getElementById('hoursAward');
    if (!select) return;
    
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">-- Select Award --</option>' + 
        awards.map(award => `<option value="${award.id}">${award.name}</option>`).join('');
    
    if (currentValue) {
        select.value = currentValue;
    }
    
    // Remove and add event listener to avoid duplicates
    select.removeEventListener('change', updateSleeperAgreementVisibility);
    select.addEventListener('change', updateSleeperAgreementVisibility);
}

// Update visibility of sleepover agreement checkboxes based on award and shift type
function updateSleeperAgreementVisibility() {
    const awardId = parseInt(document.getElementById('hoursAward').value);
    if (!awardId) return;
    
    const award = awards.find(a => a.id === awardId);
    if (!award) return;
    
    // Only show sleepover agreement option if award has different min breaks for sleepovers
    const showSleeperAgreement = award.hasSleepover && 
                                  award.minBreakHoursSleepover && 
                                  award.minBreakHoursSleepover !== 8;
    
    // Update all shift entries
    document.querySelectorAll('.shift-entry').forEach(shiftEntry => {
        const shiftIndex = shiftEntry.getAttribute('data-shift-index');
        const sleeperSelect = document.getElementById(`isSleepover-${shiftIndex}`);
        const agreementSection = document.getElementById(`sleeperAgreement-${shiftIndex}`);
        
        if (!sleeperSelect || !agreementSection) return;
        
        // Show/hide based on sleepover selection and award config
        const isSleepover = sleeperSelect.value === 'true';
        agreementSection.style.display = (showSleeperAgreement && isSleepover) ? 'block' : 'none';
        
        // Remove and add event listener to avoid duplicates
        sleeperSelect.removeEventListener('change', updateSleeperAgreementVisibility);
        sleeperSelect.addEventListener('change', updateSleeperAgreementVisibility);
    });
}

// Shift management
let shiftCount = 1;

function addShift() {
    const container = document.getElementById('shiftsContainer');
    const shiftIndex = shiftCount;
    
    const shiftDiv = document.createElement('div');
    shiftDiv.className = 'shift-entry';
    shiftDiv.setAttribute('data-shift-index', shiftIndex);
    
    shiftDiv.innerHTML = `
        <h3>Shift ${shiftIndex + 1}</h3>
        <button onclick="removeShift(${shiftIndex})" class="btn btn-danger shift-remove-btn">Remove</button>
        
        <div class="form-group">
            <label for="shiftStartDate-${shiftIndex}">Shift Start Date:</label>
            <input type="date" id="shiftStartDate-${shiftIndex}" class="form-control shift-start-date">
        </div>

        <div class="form-group">
            <label for="shiftStartTime-${shiftIndex}">Shift Start Time:</label>
            <input type="time" id="shiftStartTime-${shiftIndex}" class="form-control shift-start-time">
        </div>

        <div class="form-group">
            <label for="isSleepover-${shiftIndex}">Is this a sleepover shift?</label>
            <select id="isSleepover-${shiftIndex}" class="form-control shift-sleepover">
                <option value="false">No</option>
                <option value="true">Yes</option>
            </select>
        </div>

        <div class="form-group sleepover-agreement-section" id="sleeperAgreement-${shiftIndex}" style="display: none;">
            <label>
                <input type="checkbox" id="sleeperAgreement-${shiftIndex}-checkbox" class="sleepover-agreement-checkbox">
                Signed agreement for 8-hour break after sleepover (instead of standard sleepover break time)
            </label>
        </div>

        <div class="form-group">
            <label for="shiftEndDate-${shiftIndex}">Shift End Date:</label>
            <input type="date" id="shiftEndDate-${shiftIndex}" class="form-control shift-end-date">
        </div>

        <div class="form-group">
            <label for="shiftEndTime-${shiftIndex}">Shift End Time:</label>
            <input type="time" id="shiftEndTime-${shiftIndex}" class="form-control shift-end-time">
        </div>
    `;
    
    container.appendChild(shiftDiv);
    shiftCount++;
    
    // Update sleepover agreement visibility for new shift
    updateSleeperAgreementVisibility();
}

function removeShift(shiftIndex) {
    const shiftDiv = document.querySelector(`[data-shift-index="${shiftIndex}"]`);
    if (shiftDiv) {
        shiftDiv.remove();
        renumberShifts();
    }
}

function renumberShifts() {
    const shifts = document.querySelectorAll('.shift-entry');
    shifts.forEach((shift, index) => {
        const h3 = shift.querySelector('h3');
        if (h3) {
            h3.textContent = `Shift ${index + 1}`;
        }
    });
}

// Hours calculation function
function calculateHours() {
    // Get input values
    const awardId = parseInt(document.getElementById('hoursAward').value);
    
    // Validation
    if (!awardId) {
        alert('Please select an award');
        return;
    }
    
    // Find award
    const award = awards.find(a => a.id === awardId);
    if (!award) {
        alert('Selected award not found');
        return;
    }
    
    // Get all shift entries
    const shiftEntries = document.querySelectorAll('.shift-entry');
    
    if (shiftEntries.length === 0) {
        alert('Please add at least one shift');
        return;
    }
    
    // Calculate totals across all shifts
    let totalHours = 0;
    let totalNormalHours = 0;
    let totalOvertimeHours = 0;
    let totalBrokenShiftHours = 0;
    let totalSaturdayHours = 0;
    let totalSundayHours = 0;
    let totalAfternoonHours = 0;
    let totalNightShiftHours = 0;
    const allWarnings = [];
    
    // Store shift times for break checking
    const shifts = [];
    
    // Process each shift
    for (let i = 0; i < shiftEntries.length; i++) {
        const shiftIndex = shiftEntries[i].getAttribute('data-shift-index');
        
        const startDate = document.getElementById(`shiftStartDate-${shiftIndex}`).value;
        const startTime = document.getElementById(`shiftStartTime-${shiftIndex}`).value;
        const endDate = document.getElementById(`shiftEndDate-${shiftIndex}`).value;
        const endTime = document.getElementById(`shiftEndTime-${shiftIndex}`).value;
        const isSleepover = document.getElementById(`isSleepover-${shiftIndex}`).value === 'true';
        const hasSleeperAgreement = document.getElementById(`sleeperAgreement-${shiftIndex}-checkbox`)?.checked || false;
        
        // Validation for this shift
        if (!startDate || !startTime) {
            alert(`Please enter shift start date and time for Shift ${i + 1}`);
            return;
        }
        
        if (!endDate || !endTime) {
            alert(`Please enter shift end date and time for Shift ${i + 1}`);
            return;
        }
        
        // Parse dates
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);
        
        if (end <= start) {
            alert(`End time must be after start time for Shift ${i + 1}`);
            return;
        }
        
        // Calculate hours for this shift
        const totalMilliseconds = end - start;
        const shiftHours = totalMilliseconds / (1000 * 60 * 60);
        
        // Calculate hours breakdown for this shift
        let normalHours = 0;
        let overtimeHours = 0;
        let saturdayHours = 0;
        let sundayHours = 0;
        let afternoonHours = 0;
        let nightShiftHours = 0;
        
        // Calculate weekend hours - separate Saturday and Sunday
        const startDay = start.getDay(); // 0 = Sunday, 6 = Saturday
        const endDay = end.getDay();
        
        // Determine if this is a weekend shift (takes precedence)
        const isWeekendShift = (startDay === 6 || endDay === 6 || startDay === 0 || endDay === 0);
        
        if (startDay === 6 || endDay === 6) {
            // Saturday shift
            saturdayHours = shiftHours;
        } else if (startDay === 0 || endDay === 0) {
            // Sunday shift
            sundayHours = shiftHours;
        } else {
            // Weekday shift - check for afternoon/night shift rates
            // Issue #3: If shift ends within afternoon or night shift timeframe, entire shift is paid at that rate
            const endHour = end.getHours();
            const endMinute = end.getMinutes();
            
            // Parse shift timeframes
            const afternoonStart = award.afternoonShiftStart || '14:00';
            const afternoonEnd = award.afternoonShiftEnd || '22:00';
            const nightStart = award.nightShiftStart || '22:00';
            const nightEnd = award.nightShiftEnd || '06:00';
            
            const [afternoonStartHour, afternoonStartMin] = afternoonStart.split(':').map(Number);
            const [afternoonEndHour, afternoonEndMin] = afternoonEnd.split(':').map(Number);
            const [nightStartHour, nightStartMin] = nightStart.split(':').map(Number);
            const [nightEndHour, nightEndMin] = nightEnd.split(':').map(Number);
            
            // Check if shift ends within night shift timeframe
            let endsInNightShift = false;
            if (nightStartHour > nightEndHour) {
                // Night shift wraps around midnight
                endsInNightShift = (endHour > nightStartHour || endHour < nightEndHour || 
                              (endHour === nightStartHour && endMinute >= nightStartMin) ||
                              (endHour === nightEndHour && endMinute <= nightEndMin));
            } else {
                // Night shift doesn't wrap
                endsInNightShift = ((endHour > nightStartHour || (endHour === nightStartHour && endMinute >= nightStartMin)) &&
                              (endHour < nightEndHour || (endHour === nightEndHour && endMinute <= nightEndMin)));
            }
            
            // Check if shift ends within afternoon shift timeframe
            let endsInAfternoonShift = false;
            if (afternoonStartHour > afternoonEndHour) {
                // Afternoon shift wraps around midnight
                endsInAfternoonShift = (endHour > afternoonStartHour || endHour < afternoonEndHour || 
                              (endHour === afternoonStartHour && endMinute >= afternoonStartMin) ||
                              (endHour === afternoonEndHour && endMinute <= afternoonEndMin));
            } else {
                // Afternoon shift doesn't wrap
                endsInAfternoonShift = ((endHour > afternoonStartHour || (endHour === afternoonStartHour && endMinute >= afternoonStartMin)) &&
                              (endHour < afternoonEndHour || (endHour === afternoonEndHour && endMinute <= afternoonEndMin)));
            }
            
            // Determine shift rate based on end time
            if (endsInNightShift) {
                // Entire shift is paid at night shift rate
                nightShiftHours = shiftHours;
            } else if (endsInAfternoonShift) {
                // Entire shift is paid at afternoon shift rate
                afternoonHours = shiftHours;
            } else {
                // Normal shift - check for daily overtime
                const maxDailyHours = award.maxDailyHours || 8;
                if (shiftHours > maxDailyHours) {
                    overtimeHours = shiftHours - maxDailyHours;
                    normalHours = maxDailyHours;
                    allWarnings.push({
                        title: `Daily Overtime Detected - Shift ${i + 1}`,
                        message: `Shift duration (${shiftHours.toFixed(2)} hours) exceeds the maximum daily hours (${maxDailyHours} hours).`
                    });
                } else {
                    normalHours = shiftHours;
                }
            }
        }
        
        // Adjust for sleepover (deduct 8 hours from the calculated hours)
        if (isSleepover) {
            const sleeperDeduction = 8;
            // Deduct from whichever category has hours, prioritizing in order
            if (saturdayHours > 0) {
                saturdayHours = Math.max(0, saturdayHours - sleeperDeduction);
            } else if (sundayHours > 0) {
                sundayHours = Math.max(0, sundayHours - sleeperDeduction);
            } else if (nightShiftHours > 0) {
                nightShiftHours = Math.max(0, nightShiftHours - sleeperDeduction);
            } else if (afternoonHours > 0) {
                afternoonHours = Math.max(0, afternoonHours - sleeperDeduction);
            } else if (overtimeHours > 0) {
                const remainingAfterOvertime = Math.max(0, overtimeHours - sleeperDeduction);
                const deductedFromOvertime = overtimeHours - remainingAfterOvertime;
                overtimeHours = remainingAfterOvertime;
                if (sleeperDeduction - deductedFromOvertime > 0) {
                    normalHours = Math.max(0, normalHours - (sleeperDeduction - deductedFromOvertime));
                }
            } else {
                normalHours = Math.max(0, normalHours - sleeperDeduction);
            }
        }
        
        // Calculate adjusted total for this shift
        const adjustedShiftHours = normalHours + overtimeHours + saturdayHours + sundayHours + afternoonHours + nightShiftHours;
        totalHours += adjustedShiftHours;
        
        // Store shift data for break checking
        shifts.push({
            index: i,
            start: start,
            end: end,
            isSleepover: isSleepover,
            hasSleeperAgreement: hasSleeperAgreement,
            hours: shiftHours,
            normalHours: normalHours,
            overtimeHours: overtimeHours,
            saturdayHours: saturdayHours,
            sundayHours: sundayHours,
            afternoonHours: afternoonHours,
            nightShiftHours: nightShiftHours
        });
        
        // Add to totals
        totalNormalHours += normalHours;
        totalOvertimeHours += overtimeHours;
        totalSaturdayHours += saturdayHours;
        totalSundayHours += sundayHours;
        totalAfternoonHours += afternoonHours;
        totalNightShiftHours += nightShiftHours;
    }
    
    // Check for broken shifts (shifts that don't have adequate break between them)
    if (shifts.length > 1) {
        // Sort shifts by start time
        shifts.sort((a, b) => a.start - b.start);
        
        for (let i = 1; i < shifts.length; i++) {
            const prevShift = shifts[i - 1];
            const currentShift = shifts[i];
            
            // Calculate break between shifts (in hours)
            const breakTime = (currentShift.start - prevShift.end) / (1000 * 60 * 60);
            
            // Determine minimum break required
            let minBreak = award.minBreakHours || 10;
            if (prevShift.isSleepover && award.hasSleepover) {
                // Check if they have a sleepover agreement for 8-hour break
                if (prevShift.hasSleeperAgreement) {
                    minBreak = 8;
                } else if (award.minBreakHoursSleepover) {
                    minBreak = award.minBreakHoursSleepover;
                }
            }
            
            // Check if break is insufficient
            if (breakTime < minBreak && breakTime >= 0) {
                // This is a broken shift - mark current shift hours as broken shift hours
                allWarnings.push({
                    title: `Broken Shift Detected - Shift ${currentShift.index + 1}`,
                    message: `Only ${breakTime.toFixed(2)} hours break after previous shift (minimum: ${minBreak} hours). This shift may qualify for broken shift penalties.`
                });
                
                // Track broken shift hours (informational only - not added to total since hours are already counted in other categories)
                // This tracks which shifts violate the minimum break requirement
                totalBrokenShiftHours += currentShift.hours;
            }
        }
    }
    
    // Check for meal allowances (based on consecutive shifts)
    // Meal allowance is based on having a shift and then a second shift straight after
    if (shifts.length > 1 && award.mealAllowance1 && award.mealAllowance1 > 0) {
        // Shifts are already sorted by start time from broken shift check
        for (let i = 1; i < shifts.length; i++) {
            const prevShift = shifts[i - 1];
            const currentShift = shifts[i];
            
            // Calculate break between shifts (in hours)
            const breakTime = (currentShift.start - prevShift.end) / (1000 * 60 * 60);
            
            // Define what "straight after" means - using a small threshold (e.g., 1 hour or less)
            // This ensures shifts that are truly consecutive qualify for meal allowance
            const consecutiveThreshold = 1; // hours
            
            // Check if this is a consecutive shift (straight after the previous one)
            if (breakTime >= 0 && breakTime <= consecutiveThreshold) {
                // Check for meal allowance based on the second shift's duration
                if (currentShift.hours >= (award.mealAllowance1Hours || 5)) {
                    allWarnings.push({
                        title: `Meal Allowance Eligible - Shift ${currentShift.index + 1}`,
                        message: `Consecutive shifts detected (${breakTime.toFixed(2)} hours break). Second shift duration (${currentShift.hours.toFixed(2)} hours) qualifies for meal allowance ($${award.mealAllowance1.toFixed(2)}).`
                    });
                }
                
                // Check for second meal allowance based on the second shift's duration
                if (award.mealAllowance2Hours && award.mealAllowance2Hours > 0 && currentShift.hours >= award.mealAllowance2Hours) {
                    allWarnings.push({
                        title: `2nd Meal Allowance Eligible - Shift ${currentShift.index + 1}`,
                        message: `Consecutive shifts detected (${breakTime.toFixed(2)} hours break). Second shift duration (${currentShift.hours.toFixed(2)} hours) qualifies for 2nd meal allowance ($${award.mealAllowance1.toFixed(2)}).`
                    });
                }
            }
        }
    }
    
    // Display results
    displayHoursResults(totalHours, totalNormalHours, totalOvertimeHours, totalBrokenShiftHours, totalSaturdayHours, totalSundayHours, totalAfternoonHours, totalNightShiftHours, allWarnings);
}

// Helper function to calculate night shift hours
function calculateNightShiftHours(start, end, nightStart, nightEnd) {
    // Parse night shift times
    const [nightStartHour, nightStartMin] = nightStart.split(':').map(Number);
    const [nightEndHour, nightEndMin] = nightEnd.split(':').map(Number);
    
    let nightHours = 0;
    let current = new Date(start);
    
    // Iterate through each hour of the shift
    while (current < end) {
        const hour = current.getHours();
        const minute = current.getMinutes();
        
        // Check if current time is within night shift hours
        // Night shift can wrap around midnight (e.g., 22:00 to 06:00)
        let isNightShift = false;
        if (nightStartHour > nightEndHour) {
            // Wraps around midnight
            isNightShift = (hour > nightStartHour || hour < nightEndHour || 
                          (hour === nightStartHour && minute >= nightStartMin) ||
                          (hour === nightEndHour && minute <= nightEndMin));
        } else {
            // Doesn't wrap around midnight
            isNightShift = ((hour > nightStartHour || (hour === nightStartHour && minute >= nightStartMin)) &&
                          (hour < nightEndHour || (hour === nightEndHour && minute <= nightEndMin)));
        }
        
        if (isNightShift) {
            // Calculate the fraction of hour that's in night shift
            const nextHour = new Date(current.getTime() + 60 * 60 * 1000);
            const increment = Math.min(nextHour, end) - current;
            nightHours += increment / (1000 * 60 * 60);
        }
        
        // Move to next hour
        current = new Date(current.getTime() + 60 * 60 * 1000);
    }
    
    return nightHours;
}

// Helper function to calculate afternoon shift hours
function calculateAfternoonShiftHours(start, end, afternoonStart, afternoonEnd) {
    // Parse afternoon shift times
    const [afternoonStartHour, afternoonStartMin] = afternoonStart.split(':').map(Number);
    const [afternoonEndHour, afternoonEndMin] = afternoonEnd.split(':').map(Number);
    
    let afternoonHours = 0;
    let current = new Date(start);
    
    // Iterate through each hour of the shift
    while (current < end) {
        const hour = current.getHours();
        const minute = current.getMinutes();
        
        // Check if current time is within afternoon shift hours
        // Afternoon shift typically doesn't wrap around midnight, but handle it anyway
        let isAfternoonShift = false;
        if (afternoonStartHour > afternoonEndHour) {
            // Wraps around midnight (unlikely for afternoon, but handle it)
            isAfternoonShift = (hour > afternoonStartHour || hour < afternoonEndHour || 
                          (hour === afternoonStartHour && minute >= afternoonStartMin) ||
                          (hour === afternoonEndHour && minute <= afternoonEndMin));
        } else {
            // Doesn't wrap around midnight (typical case)
            isAfternoonShift = ((hour > afternoonStartHour || (hour === afternoonStartHour && minute >= afternoonStartMin)) &&
                          (hour < afternoonEndHour || (hour === afternoonEndHour && minute <= afternoonEndMin)));
        }
        
        if (isAfternoonShift) {
            // Calculate the fraction of hour that's in afternoon shift
            const nextHour = new Date(current.getTime() + 60 * 60 * 1000);
            const increment = Math.min(nextHour, end) - current;
            afternoonHours += increment / (1000 * 60 * 60);
        }
        
        // Move to next hour
        current = new Date(current.getTime() + 60 * 60 * 1000);
    }
    
    return afternoonHours;
}

// Display hours calculation results
function displayHoursResults(total, normal, overtime, brokenShift, saturday, sunday, afternoon, nightShift, warnings) {
    document.getElementById('totalHours').textContent = total.toFixed(2) + ' hours';
    document.getElementById('calculatedNormalHours').textContent = normal.toFixed(2) + ' hours';
    document.getElementById('calculatedOvertimeHours').textContent = overtime.toFixed(2) + ' hours';
    document.getElementById('calculatedBrokenShiftHours').textContent = brokenShift.toFixed(2) + ' hours';
    document.getElementById('calculatedSaturdayHours').textContent = saturday.toFixed(2) + ' hours';
    document.getElementById('calculatedSundayHours').textContent = sunday.toFixed(2) + ' hours';
    document.getElementById('calculatedAfternoonHours').textContent = afternoon.toFixed(2) + ' hours';
    document.getElementById('calculatedNightShiftHours').textContent = nightShift.toFixed(2) + ' hours';
    
    // Display warnings
    const warningsContainer = document.getElementById('overtimeWarnings');
    if (warnings.length > 0) {
        warningsContainer.innerHTML = warnings.map(warning => `
            <div class="warning-item">
                <strong>${warning.title}</strong>
                ${warning.message}
            </div>
        `).join('');
    } else {
        warningsContainer.innerHTML = '';
    }
    
    document.getElementById('hoursResults').style.display = 'block';
    
    // Scroll to results
    document.getElementById('hoursResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Push calculated hours to Pay Calculator
function pushHoursToCalculator() {
    // Get the calculated hours from the display
    const normalHours = parseFloat(document.getElementById('calculatedNormalHours').textContent) || 0;
    const overtimeHours = parseFloat(document.getElementById('calculatedOvertimeHours').textContent) || 0;
    const saturdayHours = parseFloat(document.getElementById('calculatedSaturdayHours').textContent) || 0;
    const sundayHours = parseFloat(document.getElementById('calculatedSundayHours').textContent) || 0;
    const afternoonHours = parseFloat(document.getElementById('calculatedAfternoonHours').textContent) || 0;
    const nightShiftHours = parseFloat(document.getElementById('calculatedNightShiftHours').textContent) || 0;
    
    // Get the award from Hours Calculator
    const hoursAwardId = document.getElementById('hoursAward').value;
    
    // Set values in Pay Calculator
    if (document.getElementById('normalHours')) document.getElementById('normalHours').value = normalHours.toFixed(2);
    if (document.getElementById('overtimeHours')) document.getElementById('overtimeHours').value = overtimeHours.toFixed(2);
    if (document.getElementById('saturdayHours')) document.getElementById('saturdayHours').value = saturdayHours.toFixed(2);
    if (document.getElementById('sundayHours')) document.getElementById('sundayHours').value = sundayHours.toFixed(2);
    if (document.getElementById('afternoonHours')) document.getElementById('afternoonHours').value = afternoonHours.toFixed(2);
    if (document.getElementById('nightShiftHours')) document.getElementById('nightShiftHours').value = nightShiftHours.toFixed(2);
    
    // Set the same award in Pay Calculator
    if (hoursAwardId && document.getElementById('award')) {
        document.getElementById('award').value = hoursAwardId;
        updateAllowancesQuestions();
    }
    
    // Save the calculator data
    saveCalculatorData();
    
    // Switch to Pay Calculator tab
    switchTab('calculator');
    
    // Show a success message
    alert('Hours have been pushed to the Pay Calculator!');
}
