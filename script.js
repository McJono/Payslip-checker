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
            isSleepover: document.getElementById(`isSleepover-${shiftIndex}`)?.value || 'false',
            hasSleeperAgreement: document.getElementById(`sleeperAgreement-${shiftIndex}-checkbox`)?.checked || false,
            sleeperStartTime: document.getElementById(`sleeperStartTime-${shiftIndex}`)?.value || '',
            sleeperEndTime: document.getElementById(`sleeperEndTime-${shiftIndex}`)?.value || ''
        };
        shifts.push(shift);
    });
    
    const shiftData = {
        hoursAward: document.getElementById('hoursAward')?.value || '',
        employmentType: document.getElementById('employmentType')?.value || 'full-time',
        shifts: shifts,
        shiftCount: shiftCount
    };
    localStorage.setItem('shiftData', JSON.stringify(shiftData));
}

function loadShiftData() {
    const saved = localStorage.getItem('shiftData');
    if (saved) {
        try {
            isLoadingShiftData = true; // Disable auto-save during load
            
            const data = JSON.parse(saved);
            if (document.getElementById('hoursAward')) {
                document.getElementById('hoursAward').value = data.hoursAward || '';
            }
            if (document.getElementById('employmentType')) {
                document.getElementById('employmentType').value = data.employmentType || 'full-time';
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
                        if (document.getElementById('sleeperAgreement-0-checkbox')) document.getElementById('sleeperAgreement-0-checkbox').checked = shift.hasSleeperAgreement || false;
                        if (document.getElementById('sleeperStartTime-0')) document.getElementById('sleeperStartTime-0').value = shift.sleeperStartTime || '';
                        if (document.getElementById('sleeperEndTime-0')) document.getElementById('sleeperEndTime-0').value = shift.sleeperEndTime || '';
                        // Trigger sleepover details visibility
                        toggleSleeperDetails(0);
                    }
                    
                    // Add additional shifts (skip auto-save during loading)
                    for (let i = 1; i < data.shifts.length; i++) {
                        const createdShiftIndex = addShift(true); // skipAutoSave = true
                        const shift = data.shifts[i];
                        
                        // Set values immediately since addShift returns synchronously
                        if (document.getElementById(`shiftStartDate-${createdShiftIndex}`)) document.getElementById(`shiftStartDate-${createdShiftIndex}`).value = shift.startDate || '';
                        if (document.getElementById(`shiftStartTime-${createdShiftIndex}`)) document.getElementById(`shiftStartTime-${createdShiftIndex}`).value = shift.startTime || '';
                        if (document.getElementById(`shiftEndDate-${createdShiftIndex}`)) document.getElementById(`shiftEndDate-${createdShiftIndex}`).value = shift.endDate || '';
                        if (document.getElementById(`shiftEndTime-${createdShiftIndex}`)) document.getElementById(`shiftEndTime-${createdShiftIndex}`).value = shift.endTime || '';
                        if (document.getElementById(`isSleepover-${createdShiftIndex}`)) document.getElementById(`isSleepover-${createdShiftIndex}`).value = shift.isSleepover || 'false';
                        if (document.getElementById(`sleeperAgreement-${createdShiftIndex}-checkbox`)) document.getElementById(`sleeperAgreement-${createdShiftIndex}-checkbox`).checked = shift.hasSleeperAgreement || false;
                        if (document.getElementById(`sleeperStartTime-${createdShiftIndex}`)) document.getElementById(`sleeperStartTime-${createdShiftIndex}`).value = shift.sleeperStartTime || '';
                        if (document.getElementById(`sleeperEndTime-${createdShiftIndex}`)) document.getElementById(`sleeperEndTime-${createdShiftIndex}`).value = shift.sleeperEndTime || '';
                        // Trigger sleepover details visibility
                        toggleSleeperDetails(createdShiftIndex);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading shift data:', error);
        } finally {
            isLoadingShiftData = false; // Always re-enable auto-save
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
    
    // Auto-save shift data when hours award selection changes
    const hoursAward = document.getElementById('hoursAward');
    if (hoursAward) {
        hoursAward.addEventListener('change', () => {
            saveShiftData();
        });
    }
    
    // Auto-save shift data when employment type changes
    const employmentType = document.getElementById('employmentType');
    if (employmentType) {
        employmentType.addEventListener('change', () => {
            saveShiftData();
        });
    }
    
    // Auto-save shift data when any shift field changes
    setupShiftAutoSave();
}

// Setup auto-save listeners for all shift input fields
function setupShiftAutoSave() {
    const shiftsContainer = document.getElementById('shiftsContainer');
    if (!shiftsContainer) return;
    
    // Use event delegation for all shift inputs (handles dynamically added shifts)
    shiftsContainer.addEventListener('change', (event) => {
        // Don't auto-save if we're currently loading data
        if (isLoadingShiftData) return;
        
        if (event.target.classList.contains('shift-start-date') ||
            event.target.classList.contains('shift-start-time') ||
            event.target.classList.contains('shift-end-date') ||
            event.target.classList.contains('shift-end-time') ||
            event.target.classList.contains('shift-sleepover') ||
            event.target.classList.contains('sleepover-agreement-checkbox') ||
            event.target.classList.contains('sleepover-start-time') ||
            event.target.classList.contains('sleepover-end-time')) {
            saveShiftData();
        }
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

// Award editing functions
let editCustomAllowanceCount = 0;

function editAward(id) {
    const award = awards.find(a => a.id === id);
    if (!award) {
        alert('Award not found');
        return;
    }
    
    // Populate modal fields
    document.getElementById('editAwardId').value = award.id;
    document.getElementById('editAwardName').value = award.name;
    document.getElementById('editNormalRate').value = award.normalRate;
    document.getElementById('editOvertimeRate').value = award.overtimeRate;
    document.getElementById('editOvertime2Hours').value = award.overtime2Hours || 10;
    document.getElementById('editOvertime2Rate').value = award.overtime2Rate || 2.0;
    document.getElementById('editSaturdayRate').value = award.saturdayRate !== undefined ? award.saturdayRate : award.weekendRate || 1.5;
    document.getElementById('editSundayRate').value = award.sundayRate !== undefined ? award.sundayRate : award.weekendRate || 2.0;
    document.getElementById('editNightShiftRate').value = award.nightShiftRate;
    document.getElementById('editAfternoonShiftRate').value = award.afternoonShiftRate || 1.15;
    document.getElementById('editMaxDailyHours').value = award.maxDailyHours || 8;
    document.getElementById('editMinBreakHours').value = award.minBreakHours || 10;
    document.getElementById('editMaxWeeklyHours').value = award.maxWeeklyHours || 38;
    document.getElementById('editNightShiftStart').value = award.nightShiftStart || '22:00';
    document.getElementById('editNightShiftEnd').value = award.nightShiftEnd || '06:00';
    document.getElementById('editAfternoonShiftStart').value = award.afternoonShiftStart || '14:00';
    document.getElementById('editAfternoonShiftEnd').value = award.afternoonShiftEnd || '22:00';
    
    // Set checkboxes and show/hide sections
    document.getElementById('editHasSleepover').checked = award.hasSleepover || false;
    document.getElementById('editHasMealAllowances').checked = (award.mealAllowance1 && award.mealAllowance1 > 0) || false;
    document.getElementById('editHasFirstAid').checked = (award.firstAidAllowance && award.firstAidAllowance > 0) || false;
    document.getElementById('editHasCustomAllowances').checked = (award.customAllowances && award.customAllowances.length > 0) || false;
    
    toggleEditSleeperSection();
    toggleEditMealAllowancesSection();
    toggleEditFirstAidSection();
    toggleEditCustomAllowancesSection();
    
    // Populate sleepover settings
    document.getElementById('editSleeperRate').value = award.sleeperRate || 0;
    document.getElementById('editMinBreakHoursSleepover').value = award.minBreakHoursSleepover || 8;
    
    // Populate meal allowances
    document.getElementById('editMealAllowance1').value = award.mealAllowance1 || 0;
    document.getElementById('editMealAllowance1Hours').value = award.mealAllowance1Hours || 5;
    document.getElementById('editMealAllowance2Hours').value = award.mealAllowance2Hours || 10;
    
    // Populate first aid
    document.getElementById('editFirstAidAllowance').value = award.firstAidAllowance || 0;
    document.getElementById('editFirstAidMaxAmount').value = award.firstAidMaxAmount || 0;
    
    // Populate custom allowances
    const container = document.getElementById('editCustomAllowancesContainer');
    container.innerHTML = '';
    editCustomAllowanceCount = 0;
    if (award.customAllowances && award.customAllowances.length > 0) {
        award.customAllowances.forEach(allowance => {
            const div = document.createElement('div');
            div.className = 'custom-allowance-item';
            div.style.display = 'grid';
            div.style.gridTemplateColumns = '1fr 1fr auto';
            div.style.gap = '10px';
            div.style.marginBottom = '10px';
            div.innerHTML = `
                <input type="text" class="form-control custom-allowance-name" placeholder="Allowance name" value="${allowance.name}">
                <input type="number" class="form-control custom-allowance-amount" step="0.01" min="0" placeholder="Amount ($)" value="${allowance.amount}">
                <button onclick="this.parentElement.remove()" class="btn btn-danger">Remove</button>
            `;
            container.appendChild(div);
            editCustomAllowanceCount++;
        });
    }
    
    // Show modal
    document.getElementById('awardEditModal').style.display = 'block';
}

function closeAwardModal() {
    document.getElementById('awardEditModal').style.display = 'none';
}

function saveEditedAward() {
    const id = parseInt(document.getElementById('editAwardId').value);
    const name = document.getElementById('editAwardName').value.trim();
    
    if (!name) {
        alert('Please enter an award name');
        return;
    }
    
    // Collect custom allowances
    const customAllowances = [];
    const customAllowanceInputs = document.querySelectorAll('#editCustomAllowancesContainer .custom-allowance-item');
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
    
    // Update award object
    const updatedAward = {
        id: id,
        name: name,
        normalRate: parseFloat(document.getElementById('editNormalRate').value),
        overtimeRate: parseFloat(document.getElementById('editOvertimeRate').value),
        overtime2Hours: parseFloat(document.getElementById('editOvertime2Hours').value) || 10,
        overtime2Rate: parseFloat(document.getElementById('editOvertime2Rate').value) || 2.0,
        saturdayRate: parseFloat(document.getElementById('editSaturdayRate').value),
        sundayRate: parseFloat(document.getElementById('editSundayRate').value),
        nightShiftRate: parseFloat(document.getElementById('editNightShiftRate').value),
        afternoonShiftRate: parseFloat(document.getElementById('editAfternoonShiftRate').value) || 1.15,
        maxDailyHours: parseFloat(document.getElementById('editMaxDailyHours').value) || 8,
        minBreakHours: parseFloat(document.getElementById('editMinBreakHours').value) || 10,
        maxWeeklyHours: parseFloat(document.getElementById('editMaxWeeklyHours').value) || 38,
        nightShiftStart: document.getElementById('editNightShiftStart').value || '22:00',
        nightShiftEnd: document.getElementById('editNightShiftEnd').value || '06:00',
        afternoonShiftStart: document.getElementById('editAfternoonShiftStart').value || '14:00',
        afternoonShiftEnd: document.getElementById('editAfternoonShiftEnd').value || '22:00',
        hasSleepover: document.getElementById('editHasSleepover').checked,
        sleeperRate: parseFloat(document.getElementById('editSleeperRate').value) || 0,
        minBreakHoursSleepover: parseFloat(document.getElementById('editMinBreakHoursSleepover').value) || 8,
        mealAllowance1: parseFloat(document.getElementById('editMealAllowance1').value) || 0,
        mealAllowance1Hours: parseFloat(document.getElementById('editMealAllowance1Hours').value) || 5,
        mealAllowance2Hours: parseFloat(document.getElementById('editMealAllowance2Hours').value) || 10,
        firstAidAllowance: parseFloat(document.getElementById('editFirstAidAllowance').value) || 0,
        firstAidMaxAmount: parseFloat(document.getElementById('editFirstAidMaxAmount').value) || 0,
        customAllowances: customAllowances
    };
    
    // Find and update award in the array
    const index = awards.findIndex(a => a.id === id);
    if (index !== -1) {
        awards[index] = updatedAward;
        saveAwards();
        renderAwardsList();
        updateAwardDropdown();
        updateHoursAwardDropdown();
        closeAwardModal();
        alert('Award updated successfully!');
    } else {
        alert('Error: Award not found');
    }
}

function toggleEditSleeperSection() {
    const checkbox = document.getElementById('editHasSleepover');
    const section = document.getElementById('editSleeperSection');
    section.style.display = checkbox.checked ? 'block' : 'none';
}

function toggleEditMealAllowancesSection() {
    const checkbox = document.getElementById('editHasMealAllowances');
    const section = document.getElementById('editMealAllowancesSection');
    section.style.display = checkbox.checked ? 'block' : 'none';
}

function toggleEditFirstAidSection() {
    const checkbox = document.getElementById('editHasFirstAid');
    const section = document.getElementById('editFirstAidSection');
    section.style.display = checkbox.checked ? 'block' : 'none';
}

function toggleEditCustomAllowancesSection() {
    const checkbox = document.getElementById('editHasCustomAllowances');
    const section = document.getElementById('editCustomAllowancesSection');
    section.style.display = checkbox.checked ? 'block' : 'none';
}

function addEditCustomAllowanceField() {
    const container = document.getElementById('editCustomAllowancesContainer');
    const index = editCustomAllowanceCount++;
    
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

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('awardEditModal');
    if (event.target == modal) {
        closeAwardModal();
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
        const afternoonShiftRate = award.afternoonShiftRate || 1.15;
        
        return `
        <div class="award-item">
            <div class="award-info">
                <h4>${award.name}</h4>
                <p>Normal: x${award.normalRate} | Overtime: x${award.overtimeRate} (after ${award.maxDailyHours}h) | Overtime 2: x${award.overtime2Rate || 2.0} (after ${award.overtime2Hours || 10}h) | Saturday: x${saturdayRate} | Sunday: x${sundayRate} | Afternoon: x${afternoonShiftRate} | Night: x${award.nightShiftRate}</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="editAward(${award.id})" class="btn btn-secondary">Edit</button>
                <button onclick="deleteAward(${award.id})" class="btn btn-danger">Delete</button>
            </div>
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

// Toggle sleepover details visibility
function toggleSleeperDetails(shiftIndex) {
    const sleeperSelect = document.getElementById(`isSleepover-${shiftIndex}`);
    const detailsSection = document.getElementById(`sleeperDetails-${shiftIndex}`);
    
    if (sleeperSelect && detailsSection) {
        const isSleepover = sleeperSelect.value === 'true';
        detailsSection.style.display = isSleepover ? 'block' : 'none';
    }
    
    // Also update agreement visibility
    updateSleeperAgreementVisibility();
}

// Shift management
let shiftCount = 1;
let isLoadingShiftData = false; // Flag to prevent auto-save during data loading

function addShift(skipAutoSave = false) {
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
            <select id="isSleepover-${shiftIndex}" class="form-control shift-sleepover" onchange="toggleSleeperDetails(${shiftIndex})">
                <option value="false">No</option>
                <option value="true">Yes</option>
            </select>
        </div>

        <div class="form-group sleepover-details-section" id="sleeperDetails-${shiftIndex}" style="display: none;">
            <label for="sleeperStartTime-${shiftIndex}">Sleepover Start Time (optional):</label>
            <input type="time" id="sleeperStartTime-${shiftIndex}" class="form-control sleepover-start-time">
            <small class="info-text">Leave empty to use default sleepover hours (22:00-06:00)</small>
            
            <label for="sleeperEndTime-${shiftIndex}" style="margin-top: 10px;">Sleepover End Time (optional):</label>
            <input type="time" id="sleeperEndTime-${shiftIndex}" class="form-control sleepover-end-time">
            <small class="info-text">Leave empty to use default sleepover hours (22:00-06:00)</small>
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
    
    // Save shift data after adding new shift (unless we're loading data)
    if (!skipAutoSave && !isLoadingShiftData) {
        saveShiftData();
    }
    
    return shiftIndex; // Return the shift index for setting values
}

function removeShift(shiftIndex) {
    const shiftDiv = document.querySelector(`[data-shift-index="${shiftIndex}"]`);
    if (shiftDiv) {
        shiftDiv.remove();
        renumberShifts();
        // Save shift data after removing shift (unless we're loading data)
        if (!isLoadingShiftData) {
            saveShiftData();
        }
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
    let totalOvertime1Hours = 0;
    let totalOvertime2Hours = 0;
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
        const sleeperStartTime = document.getElementById(`sleeperStartTime-${shiftIndex}`)?.value || '';
        const sleeperEndTime = document.getElementById(`sleeperEndTime-${shiftIndex}`)?.value || '';
        
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
        
        // NOTE: Sleepover shifts may have work time before and after the sleepover period
        // If sleepover start/end times are specified, calculate working hours accordingly
        // Working hours = (sleepover start - shift start) + (shift end - sleepover end)
        // If sleepover is selected but no times specified, presume 22:00-06:00 (default sleepover hours)
        let actualWorkHours = shiftHours;
        let sleeperPeriodHours = 0;
        
        if (isSleepover) {
            // Use default sleepover hours (22:00-06:00) if not specified
            // Note: If only one time is specified, that value is used with the default for the other
            const defaultSleeperStart = '22:00';
            const defaultSleeperEnd = '06:00';
            const effectiveSleeperStartTime = sleeperStartTime || defaultSleeperStart;
            const effectiveSleeperEndTime = sleeperEndTime || defaultSleeperEnd;
            
            // Parse sleepover times
            const [sleeperStartHour, sleeperStartMin] = effectiveSleeperStartTime.split(':').map(Number);
            const [sleeperEndHour, sleeperEndMin] = effectiveSleeperEndTime.split(':').map(Number);
            
            // Create date objects for sleepover period
            const sleeperStart = new Date(start);
            sleeperStart.setHours(sleeperStartHour, sleeperStartMin, 0, 0);
            
            // If sleepover start is before shift start, it's likely meant to be later in the shift
            if (sleeperStart < start) {
                sleeperStart.setDate(sleeperStart.getDate() + 1);
            }
            
            const sleeperEnd = new Date(sleeperStart);
            sleeperEnd.setHours(sleeperEndHour, sleeperEndMin, 0, 0);
            
            // If sleepover end is before sleepover start, it wraps to next day
            if (sleeperEnd <= sleeperStart) {
                sleeperEnd.setDate(sleeperEnd.getDate() + 1);
            }
            
            // Calculate working hours before and after sleepover
            const hoursBeforeSleepover = (sleeperStart - start) / (1000 * 60 * 60);
            const hoursAfterSleepover = (end - sleeperEnd) / (1000 * 60 * 60);
            actualWorkHours = hoursBeforeSleepover + hoursAfterSleepover;
            sleeperPeriodHours = (sleeperEnd - sleeperStart) / (1000 * 60 * 60);
            
            // Validate that sleepover period is within shift bounds
            if (sleeperStart < start || sleeperEnd > end) {
                // Consider it "using defaults" only if both times are empty (as per requirement)
                const usingDefaults = !sleeperStartTime && !sleeperEndTime;
                const warningMessage = usingDefaults 
                    ? `Default sleepover period (${effectiveSleeperStartTime} - ${effectiveSleeperEndTime}) extends outside shift bounds. Consider specifying custom sleepover times.`
                    : `Sleepover period (${effectiveSleeperStartTime} - ${effectiveSleeperEndTime}) extends outside shift bounds. Please check your times.`;
                
                allWarnings.push({
                    title: `Sleepover Period Warning - Shift ${i + 1}`,
                    message: warningMessage
                });
                // Reset to standard calculation
                actualWorkHours = shiftHours;
                sleeperPeriodHours = 0;
            }
        }
        
        // Calculate hours breakdown for this shift
        // Use actualWorkHours (which accounts for sleepover periods) instead of shiftHours
        let normalHours = 0;
        let overtime1Hours = 0;
        let overtime2Hours = 0;
        let saturdayHours = 0;
        let sundayHours = 0;
        let afternoonHours = 0;
        let nightShiftHours = 0;
        
        // Store the shift's initial category (to be potentially overridden by broken shift logic later)
        let shiftCategory = 'normal';
        
        // Calculate weekend hours - separate Saturday and Sunday
        const startDay = start.getDay(); // 0 = Sunday, 6 = Saturday
        const endDay = end.getDay();
        
        // Determine if this is a weekend shift
        const isWeekendShift = (startDay === 6 || endDay === 6 || startDay === 0 || endDay === 0);
        const isSaturday = (startDay === 6 || endDay === 6);
        const isSunday = (startDay === 0 || endDay === 0);
        
        // For sleepover shifts, use shift end time for classification
        // For sleepover shifts with specified sleepover end time, the entire shift is night shift
        let classificationEndTime = end;
        let classificationEndHour = end.getHours();
        let classificationEndMinute = end.getMinutes();
        
        // Parse shift timeframes for afternoon and night
        const afternoonStart = award.afternoonShiftStart || '14:00';
        const afternoonEnd = award.afternoonShiftEnd || '22:00';
        const nightStart = award.nightShiftStart || '22:00';
        const nightEnd = award.nightShiftEnd || '06:00';
        
        const [afternoonStartHour, afternoonStartMin] = afternoonStart.split(':').map(Number);
        const [afternoonEndHour, afternoonEndMin] = afternoonEnd.split(':').map(Number);
        const [nightStartHour, nightStartMin] = nightStart.split(':').map(Number);
        const [nightEndHour, nightEndMin] = nightEnd.split(':').map(Number);
        
        // Check if shift ends within afternoon shift timeframe
        let endsInAfternoonShift = false;
        if (afternoonStartHour > afternoonEndHour) {
            // Afternoon shift wraps around midnight
            endsInAfternoonShift = (classificationEndHour > afternoonStartHour || classificationEndHour < afternoonEndHour || 
                          (classificationEndHour === afternoonStartHour && classificationEndMinute >= afternoonStartMin) ||
                          (classificationEndHour === afternoonEndHour && classificationEndMinute < afternoonEndMin));
        } else {
            // Afternoon shift doesn't wrap
            endsInAfternoonShift = ((classificationEndHour > afternoonStartHour || (classificationEndHour === afternoonStartHour && classificationEndMinute >= afternoonStartMin)) &&
                          (classificationEndHour < afternoonEndHour || (classificationEndHour === afternoonEndHour && classificationEndMinute < afternoonEndMin)));
        }
        
        // Check if shift ends within night shift timeframe
        // For sleepover shifts, if it's part of a sleepover shift then the entire shift should be night shift
        let endsInNightShift = false;
        if (isSleepover) {
            // For sleepover shifts, entire shift is night shift
            endsInNightShift = true;
        } else {
            // Night shift check based on end time
            if (nightStartHour > nightEndHour) {
                // Night shift wraps around midnight (e.g., 22:00 to 06:00)
                endsInNightShift = (classificationEndHour >= nightStartHour || classificationEndHour < nightEndHour || 
                              (classificationEndHour === nightStartHour && classificationEndMinute >= nightStartMin) ||
                              (classificationEndHour === nightEndHour && classificationEndMinute < nightEndMin));
            } else {
                // Night shift doesn't wrap
                endsInNightShift = ((classificationEndHour >= nightStartHour || (classificationEndHour === nightStartHour && classificationEndMinute >= nightStartMin)) &&
                              (classificationEndHour < nightEndHour || (classificationEndHour === nightEndHour && classificationEndMinute < nightEndMin)));
            }
        }
        
        // Apply NEW priority order (broken shift check will be done later):
        // 1. Weekend (Saturday/Sunday)
        // 2. Afternoon Shift
        // 3. Night Shift
        // 4. Normal
        
        if (isSaturday) {
            // Saturday shift
            saturdayHours = actualWorkHours;
            shiftCategory = 'saturday';
        } else if (isSunday) {
            // Sunday shift
            sundayHours = actualWorkHours;
            shiftCategory = 'sunday';
        } else if (endsInAfternoonShift) {
            // Entire shift is paid at afternoon shift rate
            afternoonHours = actualWorkHours;
            shiftCategory = 'afternoon';
        } else if (endsInNightShift) {
            // Entire shift is paid at night shift rate
            nightShiftHours = actualWorkHours;
            shiftCategory = 'night';
        } else {
            // Normal shift - check for daily overtime
            const maxDailyHours = award.maxDailyHours || 8;
            const overtime2Threshold = award.overtime2Hours || 10;
            
            // Validate that overtime2Threshold is greater than maxDailyHours
            // If not, treat all overtime as overtime1
            if (overtime2Threshold <= maxDailyHours) {
                // Invalid configuration - treat all overtime at overtime1 rate
                if (actualWorkHours > maxDailyHours) {
                    overtime1Hours = actualWorkHours - maxDailyHours;
                    normalHours = maxDailyHours;
                    allWarnings.push({
                        title: `Daily Overtime Detected - Shift ${i + 1}`,
                        message: `Shift duration (${actualWorkHours.toFixed(2)} hours) exceeds the maximum daily hours (${maxDailyHours} hours).`
                    });
                } else {
                    normalHours = actualWorkHours;
                }
            } else if (actualWorkHours > overtime2Threshold) {
                // Shift exceeds overtime2 threshold - split into normal, overtime1, and overtime2
                overtime2Hours = actualWorkHours - overtime2Threshold;
                overtime1Hours = overtime2Threshold - maxDailyHours;
                normalHours = maxDailyHours;
                allWarnings.push({
                    title: `Daily Overtime 2 Detected - Shift ${i + 1}`,
                    message: `Shift duration (${actualWorkHours.toFixed(2)} hours) exceeds the overtime 2 threshold (${overtime2Threshold} hours).`
                });
            } else if (actualWorkHours > maxDailyHours) {
                // Shift exceeds maxDailyHours but not overtime2 threshold
                overtime1Hours = actualWorkHours - maxDailyHours;
                normalHours = maxDailyHours;
                allWarnings.push({
                    title: `Daily Overtime Detected - Shift ${i + 1}`,
                    message: `Shift duration (${actualWorkHours.toFixed(2)} hours) exceeds the maximum daily hours (${maxDailyHours} hours).`
                });
            } else {
                normalHours = actualWorkHours;
            }
            shiftCategory = 'normal';
        }
        
        // Calculate adjusted total for this shift
        const adjustedShiftHours = normalHours + overtime1Hours + overtime2Hours + saturdayHours + sundayHours + afternoonHours + nightShiftHours;
        totalHours += adjustedShiftHours;
        
        // Store shift data for break checking
        shifts.push({
            index: i,
            start: start,
            end: end,
            isSleepover: isSleepover,
            hasSleeperAgreement: hasSleeperAgreement,
            hours: actualWorkHours,  // Use actual work hours, not total shift duration
            sleeperPeriodHours: sleeperPeriodHours,
            normalHours: normalHours,
            overtime1Hours: overtime1Hours,
            overtime2Hours: overtime2Hours,
            saturdayHours: saturdayHours,
            sundayHours: sundayHours,
            afternoonHours: afternoonHours,
            nightShiftHours: nightShiftHours,
            category: shiftCategory  // Store the initial category
        });
        
        // Add to totals
        totalNormalHours += normalHours;
        totalOvertime1Hours += overtime1Hours;
        totalOvertime2Hours += overtime2Hours;
        totalSaturdayHours += saturdayHours;
        totalSundayHours += sundayHours;
        totalAfternoonHours += afternoonHours;
        totalNightShiftHours += nightShiftHours;
    }
    
    // Sort shifts by start time for processing consecutive shifts
    shifts.sort((a, b) => a.start - b.start);
    
    // Get employment type
    const employmentType = document.getElementById('employmentType')?.value || 'full-time';
    const isCasual = employmentType === 'casual';
    
    // Track which shifts are broken shifts and which are consecutive
    const brokenShiftIndices = new Set();
    const consecutiveShiftGroups = [];
    
    // Add tolerance for floating point precision and minor time differences
    // This prevents shifts that are meant to be at threshold from being incorrectly classified
    const BREAK_TIME_TOLERANCE = 0.05; // 3 minutes tolerance
    
    // Check for broken shifts and consecutive shifts
    if (shifts.length > 1) {
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
            
            // Define what "directly after" means - very small break (e.g., 0.5 hour or less)
            const consecutiveThreshold = 0.5; // hours
            
            // Check if shifts are directly consecutive (directly after each other)
            // Use tolerance to account for minor timing differences
            if (breakTime >= 0 && breakTime <= consecutiveThreshold + BREAK_TIME_TOLERANCE) {
                // These are consecutive shifts - group them together
                // Find if previous shift is already in a group
                let groupFound = false;
                for (const group of consecutiveShiftGroups) {
                    if (group.includes(i - 1)) {
                        group.push(i);
                        groupFound = true;
                        break;
                    }
                }
                if (!groupFound) {
                    // Create new group with previous and current shift
                    consecutiveShiftGroups.push([i - 1, i]);
                }
            } else if (breakTime < minBreak - BREAK_TIME_TOLERANCE && breakTime >= 0) {
                // This is a broken shift (insufficient break but not consecutive)
                // Use tolerance to avoid flagging shifts that are at or very close to minimum break
                // Only mark current shift as broken if previous shift is not already marked as broken
                // This ensures that only the 2nd shift in a chain of broken shifts is treated as broken
                // NEW: Only apply broken shift penalty if NOT casual
                if (!brokenShiftIndices.has(i - 1) && !isCasual) {
                    brokenShiftIndices.add(i);
                    allWarnings.push({
                        title: `Broken Shift Detected - Shift ${currentShift.index + 1}`,
                        message: `Only ${breakTime.toFixed(2)} hours break after previous shift (minimum: ${minBreak} hours). This shift may qualify for broken shift penalties.`
                    });
                } else if (isCasual) {
                    // For casual employees, note the insufficient break but don't apply broken shift penalty
                    allWarnings.push({
                        title: `Insufficient Break - Shift ${currentShift.index + 1}`,
                        message: `Only ${breakTime.toFixed(2)} hours break after previous shift (minimum: ${minBreak} hours). Broken shift penalties do not apply to casual employees.`
                    });
                }
            }
        }
    }
    
    // Reclassify broken shifts (highest priority unless casual)
    // NEW PRIORITY ORDER: Broken Shift > Weekend > Afternoon > Night > Normal
    brokenShiftIndices.forEach(idx => {
        const shift = shifts[idx];
        // Reclassify all broken shifts regardless of their original category
        // This includes weekend, afternoon, and night shifts with insufficient break times
        totalNormalHours -= shift.normalHours;
        totalOvertime1Hours -= shift.overtime1Hours;
        totalOvertime2Hours -= shift.overtime2Hours;
        totalSaturdayHours -= shift.saturdayHours;
        totalSundayHours -= shift.sundayHours;
        totalAfternoonHours -= shift.afternoonHours;
        totalNightShiftHours -= shift.nightShiftHours;
        totalBrokenShiftHours += shift.hours;
        totalHours -= (shift.normalHours + shift.overtime1Hours + shift.overtime2Hours + 
                      shift.saturdayHours + shift.sundayHours + shift.afternoonHours + shift.nightShiftHours);
        totalHours += shift.hours; // Add back the full shift hours to broken shift
    });
    
    // Issue #3: Process consecutive shift groups for combined overtime calculation
    for (const group of consecutiveShiftGroups) {
        // Calculate combined hours for the group
        let combinedNormalHours = 0;
        let combinedOvertime1Hours = 0;
        let combinedOvertime2Hours = 0;
        let combinedHours = 0;
        let canCombine = true;
        
        for (const idx of group) {
            const shift = shifts[idx];
            combinedHours += shift.hours;
            // Only combine shifts that don't have special rates (weekend, afternoon, night)
            // If any shift has special rates, don't recalculate overtime
            if (shift.saturdayHours > 0 || shift.sundayHours > 0 || 
                shift.afternoonHours > 0 || shift.nightShiftHours > 0) {
                canCombine = false;
            }
        }
        
        // Only recalculate overtime for normal weekday consecutive shifts without special rates
        if (canCombine) {
            const maxDailyHours = award.maxDailyHours || 8;
            const overtime2Threshold = award.overtime2Hours || 10;
            
            // Validate that overtime2Threshold is greater than maxDailyHours
            // If not, treat all overtime as overtime1
            if (overtime2Threshold <= maxDailyHours) {
                // Invalid configuration - treat all overtime at overtime1 rate
                if (combinedHours > maxDailyHours) {
                    combinedOvertime1Hours = combinedHours - maxDailyHours;
                    combinedNormalHours = maxDailyHours;
                    
                    allWarnings.push({
                        title: `Continuing Shift Overtime - Shifts ${group.map(idx => shifts[idx].index + 1).join(', ')}`,
                        message: `Consecutive shifts treated as continuing shift. Combined duration (${combinedHours.toFixed(2)} hours) exceeds maximum daily hours (${maxDailyHours} hours).`
                    });
                } else {
                    combinedNormalHours = combinedHours;
                }
            } else if (combinedHours > overtime2Threshold) {
                // Combined hours exceed overtime2 threshold
                combinedOvertime2Hours = combinedHours - overtime2Threshold;
                combinedOvertime1Hours = overtime2Threshold - maxDailyHours;
                combinedNormalHours = maxDailyHours;
                
                allWarnings.push({
                    title: `Continuing Shift Overtime 2 - Shifts ${group.map(idx => shifts[idx].index + 1).join(', ')}`,
                    message: `Consecutive shifts treated as continuing shift. Combined duration (${combinedHours.toFixed(2)} hours) exceeds overtime 2 threshold (${overtime2Threshold} hours).`
                });
            } else if (combinedHours > maxDailyHours) {
                combinedOvertime1Hours = combinedHours - maxDailyHours;
                combinedNormalHours = maxDailyHours;
                
                allWarnings.push({
                    title: `Continuing Shift Overtime - Shifts ${group.map(idx => shifts[idx].index + 1).join(', ')}`,
                    message: `Consecutive shifts treated as continuing shift. Combined duration (${combinedHours.toFixed(2)} hours) exceeds maximum daily hours (${maxDailyHours} hours).`
                });
            } else {
                combinedNormalHours = combinedHours;
            }
            
            // Adjust totals by removing individual shift calculations and adding combined
            let originalNormalFromGroup = 0;
            let originalOvertime1FromGroup = 0;
            let originalOvertime2FromGroup = 0;
            
            for (const idx of group) {
                const shift = shifts[idx];
                originalNormalFromGroup += shift.normalHours;
                originalOvertime1FromGroup += shift.overtime1Hours;
                originalOvertime2FromGroup += shift.overtime2Hours;
            }
            
            // Update totals with the difference
            totalNormalHours = totalNormalHours - originalNormalFromGroup + combinedNormalHours;
            totalOvertime1Hours = totalOvertime1Hours - originalOvertime1FromGroup + combinedOvertime1Hours;
            totalOvertime2Hours = totalOvertime2Hours - originalOvertime2FromGroup + combinedOvertime2Hours;
        }
    }
    
    // Issue #4: Calculate meal allowances automatically for consecutive shifts
    let totalMealAllowance1Count = 0;
    let totalMealAllowance2Count = 0;
    
    if (shifts.length > 1 && award.mealAllowance1 && award.mealAllowance1 > 0) {
        // Process each consecutive shift group
        for (const group of consecutiveShiftGroups) {
            // Calculate combined hours for meal allowance eligibility
            // For sleepover shifts, deduct 8 hours before checking eligibility
            let combinedHours = 0;
            for (const idx of group) {
                let shiftHours = shifts[idx].hours;
                // If this is a sleepover shift, deduct 8 hours for meal allowance calculation
                if (shifts[idx].isSleepover) {
                    shiftHours = Math.max(0, shiftHours - 8);
                }
                combinedHours += shiftHours;
            }
            
            // Check for meal allowance based on combined duration
            if (combinedHours >= (award.mealAllowance1Hours || 5)) {
                totalMealAllowance1Count++;
                allWarnings.push({
                    title: `Meal Allowance Eligible - Shifts ${group.map(idx => shifts[idx].index + 1).join(', ')}`,
                    message: `Consecutive shifts treated as continuing shift. Combined duration (${combinedHours.toFixed(2)} hours) qualifies for meal allowance ($${award.mealAllowance1.toFixed(2)}).`
                });
            }
            
            // Check for second meal allowance
            if (award.mealAllowance2Hours && award.mealAllowance2Hours > 0 && combinedHours >= award.mealAllowance2Hours) {
                totalMealAllowance2Count++;
                allWarnings.push({
                    title: `2nd Meal Allowance Eligible - Shifts ${group.map(idx => shifts[idx].index + 1).join(', ')}`,
                    message: `Consecutive shifts treated as continuing shift. Combined duration (${combinedHours.toFixed(2)} hours) qualifies for 2nd meal allowance ($${award.mealAllowance1.toFixed(2)}).`
                });
            }
        }
    }
    
    // Calculate total meal allowances
    const totalMealAllowances = (totalMealAllowance1Count * (award.mealAllowance1 || 0)) + 
                                 (totalMealAllowance2Count * (award.mealAllowance1 || 0));
    
    // Display results with allowances
    displayHoursResults(totalHours, totalNormalHours, totalOvertime1Hours, totalOvertime2Hours, totalBrokenShiftHours, 
                        totalSaturdayHours, totalSundayHours, totalAfternoonHours, totalNightShiftHours, 
                        totalMealAllowances, allWarnings);
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
function displayHoursResults(total, normal, overtime1, overtime2, brokenShift, saturday, sunday, afternoon, nightShift, mealAllowances, warnings) {
    document.getElementById('totalHours').textContent = total.toFixed(2) + ' hours';
    document.getElementById('calculatedNormalHours').textContent = normal.toFixed(2) + ' hours';
    document.getElementById('calculatedOvertime1Hours').textContent = overtime1.toFixed(2) + ' hours';
    document.getElementById('calculatedOvertime2Hours').textContent = overtime2.toFixed(2) + ' hours';
    document.getElementById('calculatedBrokenShiftHours').textContent = brokenShift.toFixed(2) + ' hours';
    document.getElementById('calculatedSaturdayHours').textContent = saturday.toFixed(2) + ' hours';
    document.getElementById('calculatedSundayHours').textContent = sunday.toFixed(2) + ' hours';
    document.getElementById('calculatedAfternoonHours').textContent = afternoon.toFixed(2) + ' hours';
    document.getElementById('calculatedNightShiftHours').textContent = nightShift.toFixed(2) + ' hours';
    
    // Display meal allowances if present
    const mealAllowanceElement = document.getElementById('calculatedMealAllowances');
    if (mealAllowanceElement) {
        mealAllowanceElement.textContent = formatCurrency(mealAllowances || 0);
    }
    
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
    const overtime1Hours = parseFloat(document.getElementById('calculatedOvertime1Hours').textContent) || 0;
    const overtime2Hours = parseFloat(document.getElementById('calculatedOvertime2Hours').textContent) || 0;
    const brokenShiftHours = parseFloat(document.getElementById('calculatedBrokenShiftHours').textContent) || 0;
    const saturdayHours = parseFloat(document.getElementById('calculatedSaturdayHours').textContent) || 0;
    const sundayHours = parseFloat(document.getElementById('calculatedSundayHours').textContent) || 0;
    const afternoonHours = parseFloat(document.getElementById('calculatedAfternoonHours').textContent) || 0;
    const nightShiftHours = parseFloat(document.getElementById('calculatedNightShiftHours').textContent) || 0;
    
    // Get meal allowances from display (extract number from currency format)
    const mealAllowanceText = document.getElementById('calculatedMealAllowances')?.textContent || '$0.00';
    const mealAllowances = parseFloat(mealAllowanceText.replace(/[$,]/g, '')) || 0;
    
    // Get the award from Hours Calculator
    const hoursAwardId = document.getElementById('hoursAward').value;
    
    // Set values in Pay Calculator
    // Combine both overtime hours into single overtime field for now (Pay Calculator doesn't support split overtime yet)
    const totalOvertimeHours = overtime1Hours + overtime2Hours;
    if (document.getElementById('normalHours')) document.getElementById('normalHours').value = normalHours.toFixed(2);
    if (document.getElementById('overtimeHours')) document.getElementById('overtimeHours').value = totalOvertimeHours.toFixed(2);
    if (document.getElementById('saturdayHours')) document.getElementById('saturdayHours').value = saturdayHours.toFixed(2);
    if (document.getElementById('sundayHours')) document.getElementById('sundayHours').value = sundayHours.toFixed(2);
    if (document.getElementById('afternoonHours')) document.getElementById('afternoonHours').value = afternoonHours.toFixed(2);
    if (document.getElementById('nightShiftHours')) document.getElementById('nightShiftHours').value = nightShiftHours.toFixed(2);
    
    // Add meal allowances to manual allowances field
    if (document.getElementById('manualAllowances')) {
        const currentAllowances = parseFloat(document.getElementById('manualAllowances').value) || 0;
        document.getElementById('manualAllowances').value = (currentAllowances + mealAllowances).toFixed(2);
    }
    
    // Add note about broken shifts to manual allowances field if any broken shifts detected
    let allowanceNote = '';
    if (brokenShiftHours > 0) {
        allowanceNote += `Broken shift detected: ${brokenShiftHours.toFixed(2)} hours qualify for broken shift allowances. `;
    }
    
    if (mealAllowances > 0) {
        allowanceNote += `Meal allowances of $${mealAllowances.toFixed(2)} have been added to manual allowances. `;
    }
    
    // Add note about any warnings to user
    const warningsDiv = document.getElementById('overtimeWarnings');
    if (warningsDiv && warningsDiv.innerHTML.trim()) {
        // There are warnings - user should review them
        allowanceNote += 'Please review warnings in Hours Calculator for additional allowances that may apply.';
    }
    
    // Show alert with allowance information if applicable
    if (allowanceNote) {
        alert('Hours pushed to Pay Calculator.\n\nNote: ' + allowanceNote);
    } else {
        // Show a success message if no allowance notes
        alert('Hours have been pushed to the Pay Calculator!');
    }
    
    // Set the same award in Pay Calculator
    if (hoursAwardId && document.getElementById('award')) {
        document.getElementById('award').value = hoursAwardId;
        updateAllowancesQuestions();
    }
    
    // Save the calculator data
    saveCalculatorData();
    
    // Switch to Pay Calculator tab
    switchTab('calculator');
}
