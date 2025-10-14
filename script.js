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
                    weekendRate: 2.0,
                    nightShiftRate: 1.25,
                    maxDailyHours: 8,
                    minBreakHours: 10,
                    maxWeeklyHours: 38,
                    nightShiftStart: '22:00',
                    nightShiftEnd: '06:00',
                    extendedShiftHours: 10,
                    hasSleepover: false,
                    sleeperRate: 0,
                    mealAllowance1: 0,
                    mealAllowance1Hours: 5,
                    mealAllowance2: 0,
                    mealAllowance2Hours: 10,
                    firstAidAllowance: 0,
                    customAllowances: []
                },
                {
                    id: 2,
                    name: 'Hospitality Industry Award',
                    normalRate: 1.0,
                    overtimeRate: 1.5,
                    weekendRate: 1.75,
                    nightShiftRate: 1.15,
                    maxDailyHours: 8,
                    minBreakHours: 10,
                    maxWeeklyHours: 38,
                    nightShiftStart: '22:00',
                    nightShiftEnd: '06:00',
                    extendedShiftHours: 10,
                    hasSleepover: false,
                    sleeperRate: 0,
                    mealAllowance1: 0,
                    mealAllowance1Hours: 5,
                    mealAllowance2: 0,
                    mealAllowance2Hours: 10,
                    firstAidAllowance: 0,
                    customAllowances: []
                },
                {
                    id: 3,
                    name: 'Manufacturing Award',
                    normalRate: 1.0,
                    overtimeRate: 1.5,
                    weekendRate: 2.0,
                    nightShiftRate: 1.3,
                    maxDailyHours: 8,
                    minBreakHours: 10,
                    maxWeeklyHours: 38,
                    nightShiftStart: '22:00',
                    nightShiftEnd: '06:00',
                    extendedShiftHours: 10,
                    hasSleepover: false,
                    sleeperRate: 0,
                    mealAllowance1: 0,
                    mealAllowance1Hours: 5,
                    mealAllowance2: 0,
                    mealAllowance2Hours: 10,
                    firstAidAllowance: 0,
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
        weekendHours: document.getElementById('weekendHours')?.value || '0',
        nightShiftHours: document.getElementById('nightShiftHours')?.value || '0',
        allowances: document.getElementById('allowances')?.value || '0',
        helpDebt: document.getElementById('helpDebt')?.value || 'false'
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
            if (document.getElementById('weekendHours')) document.getElementById('weekendHours').value = data.weekendHours || '0';
            if (document.getElementById('nightShiftHours')) document.getElementById('nightShiftHours').value = data.nightShiftHours || '0';
            if (document.getElementById('allowances')) document.getElementById('allowances').value = data.allowances || '0';
            if (document.getElementById('helpDebt')) document.getElementById('helpDebt').value = data.helpDebt || 'false';
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
                              'weekendHours', 'nightShiftHours', 'allowances', 'helpDebt'];
    
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
    const weekendRate = parseFloat(document.getElementById('weekendRate').value);
    const nightShiftRate = parseFloat(document.getElementById('nightShiftRate').value);
    const maxDailyHours = parseFloat(document.getElementById('maxDailyHours').value);
    const minBreakHours = parseFloat(document.getElementById('minBreakHours').value);
    const maxWeeklyHours = parseFloat(document.getElementById('maxWeeklyHours').value);
    const nightShiftStart = document.getElementById('nightShiftStart').value;
    const nightShiftEnd = document.getElementById('nightShiftEnd').value;
    const extendedShiftHours = parseFloat(document.getElementById('extendedShiftHours').value);
    const hasSleepover = document.getElementById('hasSleepover').value === 'true';
    const sleeperRate = parseFloat(document.getElementById('sleeperRate').value);
    const mealAllowance1 = parseFloat(document.getElementById('mealAllowance1').value);
    const mealAllowance1Hours = parseFloat(document.getElementById('mealAllowance1Hours').value);
    const mealAllowance2 = parseFloat(document.getElementById('mealAllowance2').value);
    const mealAllowance2Hours = parseFloat(document.getElementById('mealAllowance2Hours').value);
    const firstAidAllowance = parseFloat(document.getElementById('firstAidAllowance').value);
    
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
        weekendRate: weekendRate,
        nightShiftRate: nightShiftRate,
        maxDailyHours: maxDailyHours || 8,
        minBreakHours: minBreakHours || 10,
        maxWeeklyHours: maxWeeklyHours || 38,
        nightShiftStart: nightShiftStart || '22:00',
        nightShiftEnd: nightShiftEnd || '06:00',
        extendedShiftHours: extendedShiftHours || 10,
        hasSleepover: hasSleepover,
        sleeperRate: sleeperRate || 0,
        mealAllowance1: mealAllowance1 || 0,
        mealAllowance1Hours: mealAllowance1Hours || 5,
        mealAllowance2: mealAllowance2 || 0,
        mealAllowance2Hours: mealAllowance2Hours || 10,
        firstAidAllowance: firstAidAllowance || 0,
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
    document.getElementById('weekendRate').value = '2.0';
    document.getElementById('nightShiftRate').value = '1.25';
    document.getElementById('maxDailyHours').value = '8';
    document.getElementById('minBreakHours').value = '10';
    document.getElementById('maxWeeklyHours').value = '38';
    document.getElementById('nightShiftStart').value = '22:00';
    document.getElementById('nightShiftEnd').value = '06:00';
    document.getElementById('extendedShiftHours').value = '10';
    document.getElementById('hasSleepover').value = 'false';
    document.getElementById('sleeperRate').value = '0';
    document.getElementById('mealAllowance1').value = '0';
    document.getElementById('mealAllowance1Hours').value = '5';
    document.getElementById('mealAllowance2').value = '0';
    document.getElementById('mealAllowance2Hours').value = '10';
    document.getElementById('firstAidAllowance').value = '0';
    document.getElementById('customAllowancesContainer').innerHTML = '';
    customAllowanceCount = 0;
    
    alert('Award added successfully!');
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
    
    container.innerHTML = awards.map(award => `
        <div class="award-item">
            <div class="award-info">
                <h4>${award.name}</h4>
                <p>Normal: x${award.normalRate} | Overtime: x${award.overtimeRate} | Weekend: x${award.weekendRate} | Night: x${award.nightShiftRate}</p>
            </div>
            <button onclick="deleteAward(${award.id})" class="btn btn-danger">Delete</button>
        </div>
    `).join('');
}

function updateAwardDropdown() {
    const select = document.getElementById('award');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">-- Select Award --</option>' + 
        awards.map(award => `<option value="${award.id}">${award.name}</option>`).join('');
    
    if (currentValue) {
        select.value = currentValue;
    }
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
    const weekendHours = parseFloat(document.getElementById('weekendHours').value) || 0;
    const nightShiftHours = parseFloat(document.getElementById('nightShiftHours').value) || 0;
    const allowances = parseFloat(document.getElementById('allowances').value) || 0;
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
    
    // Calculate pay components
    const normalPay = normalHours * baseRate * award.normalRate;
    const overtimePay = overtimeHours * baseRate * award.overtimeRate;
    const weekendPay = weekendHours * baseRate * award.weekendRate;
    const nightShiftPay = nightShiftHours * baseRate * award.nightShiftRate;
    
    // Calculate gross pay
    const grossPay = normalPay + overtimePay + weekendPay + nightShiftPay + allowances;
    
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
    displayResults(grossPay, normalPay, overtimePay, weekendPay, nightShiftPay, allowances, tax, helpRepayment, netPay, payPeriod);
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

function displayResults(grossPay, normalPay, overtimePay, weekendPay, nightShiftPay, allowances, tax, helpRepayment, netPay, payPeriod) {
    document.getElementById('grossPay').textContent = formatCurrency(grossPay);
    document.getElementById('normalPay').textContent = formatCurrency(normalPay);
    document.getElementById('overtimePay').textContent = formatCurrency(overtimePay);
    document.getElementById('weekendPay').textContent = formatCurrency(weekendPay);
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
    let totalWeekendHours = 0;
    let totalNightShiftHours = 0;
    const allWarnings = [];
    
    // Process each shift
    for (let i = 0; i < shiftEntries.length; i++) {
        const shiftIndex = shiftEntries[i].getAttribute('data-shift-index');
        
        const startDate = document.getElementById(`shiftStartDate-${shiftIndex}`).value;
        const startTime = document.getElementById(`shiftStartTime-${shiftIndex}`).value;
        const endDate = document.getElementById(`shiftEndDate-${shiftIndex}`).value;
        const endTime = document.getElementById(`shiftEndTime-${shiftIndex}`).value;
        const isSleepover = document.getElementById(`isSleepover-${shiftIndex}`).value === 'true';
        
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
        
        // Adjust for sleepover
        const adjustedShiftHours = isSleepover ? Math.max(0, shiftHours - 8) : shiftHours;
        totalHours += adjustedShiftHours;
        
        // Calculate hours breakdown for this shift
        let normalHours = 0;
        let overtimeHours = 0;
        let weekendHours = 0;
        let nightShiftHours = 0;
        
        // Check if shift exceeds daily maximum
        const maxDailyHours = award.maxDailyHours || 8;
        if (adjustedShiftHours > maxDailyHours) {
            overtimeHours = adjustedShiftHours - maxDailyHours;
            normalHours = maxDailyHours;
            allWarnings.push({
                title: `Daily Overtime Detected - Shift ${i + 1}`,
                message: `Shift duration (${adjustedShiftHours.toFixed(2)} hours) exceeds the maximum daily hours (${maxDailyHours} hours).`
            });
        } else {
            normalHours = adjustedShiftHours;
        }
        
        // Calculate weekend hours
        const startDay = start.getDay(); // 0 = Sunday, 6 = Saturday
        const endDay = end.getDay();
        
        if (startDay === 0 || startDay === 6 || endDay === 0 || endDay === 6) {
            // For simplicity, if any part of the shift is on weekend, count all hours as weekend
            weekendHours = adjustedShiftHours;
            normalHours = 0;
            overtimeHours = 0;
        }
        
        // Calculate night shift hours
        const nightStart = award.nightShiftStart || '22:00';
        const nightEnd = award.nightShiftEnd || '06:00';
        nightShiftHours = calculateNightShiftHours(start, end, nightStart, nightEnd);
        
        // Add to totals
        totalNormalHours += normalHours;
        totalOvertimeHours += overtimeHours;
        totalWeekendHours += weekendHours;
        totalNightShiftHours += nightShiftHours;
    }
    
    // Display results
    displayHoursResults(totalHours, totalNormalHours, totalOvertimeHours, totalWeekendHours, totalNightShiftHours, allWarnings);
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
                          (hour === nightEndHour && minute < nightEndMin));
        } else {
            // Doesn't wrap around midnight
            isNightShift = ((hour > nightStartHour || (hour === nightStartHour && minute >= nightStartMin)) &&
                          (hour < nightEndHour || (hour === nightEndHour && minute < nightEndMin)));
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

// Display hours calculation results
function displayHoursResults(total, normal, overtime, weekend, nightShift, warnings) {
    document.getElementById('totalHours').textContent = total.toFixed(2) + ' hours';
    document.getElementById('calculatedNormalHours').textContent = normal.toFixed(2) + ' hours';
    document.getElementById('calculatedOvertimeHours').textContent = overtime.toFixed(2) + ' hours';
    document.getElementById('calculatedWeekendHours').textContent = weekend.toFixed(2) + ' hours';
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
