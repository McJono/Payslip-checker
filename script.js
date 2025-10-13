// Default data storage
let awards = [];
let taxBrackets = [];
let helpThresholds = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    loadData();
    renderAwardsList();
    renderTaxBrackets();
    renderHelpThresholds();
    updateAwardDropdown();
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

// Load data from localStorage or use defaults
function loadData() {
    // Load awards
    const savedAwards = localStorage.getItem('awards');
    if (savedAwards) {
        awards = JSON.parse(savedAwards);
    } else {
        // Default awards
        awards = [
            {
                id: 1,
                name: 'General Retail Industry Award',
                normalRate: 1.0,
                overtimeRate: 1.5,
                weekendRate: 2.0,
                nightShiftRate: 1.25
            },
            {
                id: 2,
                name: 'Hospitality Industry Award',
                normalRate: 1.0,
                overtimeRate: 1.5,
                weekendRate: 1.75,
                nightShiftRate: 1.15
            },
            {
                id: 3,
                name: 'Manufacturing Award',
                normalRate: 1.0,
                overtimeRate: 1.5,
                weekendRate: 2.0,
                nightShiftRate: 1.3
            }
        ];
        saveAwards();
    }
    
    // Load tax brackets
    const savedTaxBrackets = localStorage.getItem('taxBrackets');
    if (savedTaxBrackets) {
        taxBrackets = JSON.parse(savedTaxBrackets);
    } else {
        // Default Australian tax brackets for 2024-2025
        taxBrackets = [
            { min: 0, max: 18200, rate: 0 },
            { min: 18201, max: 45000, rate: 0.19 },
            { min: 45001, max: 120000, rate: 0.325 },
            { min: 120001, max: 180000, rate: 0.37 },
            { min: 180001, max: Infinity, rate: 0.45 }
        ];
        saveTaxBrackets();
    }
    
    // Load HELP debt thresholds
    const savedHelpThresholds = localStorage.getItem('helpThresholds');
    if (savedHelpThresholds) {
        helpThresholds = JSON.parse(savedHelpThresholds);
    } else {
        // Default Australian HELP debt repayment rates for 2024-2025
        helpThresholds = [
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
        ];
        saveHelpThresholds();
    }
}

// Save functions
function saveAwards() {
    localStorage.setItem('awards', JSON.stringify(awards));
}

function saveTaxBrackets() {
    localStorage.setItem('taxBrackets', JSON.stringify(taxBrackets));
}

function saveHelpThresholds() {
    localStorage.setItem('helpThresholds', JSON.stringify(helpThresholds));
}

// Award Management
function addAward() {
    const name = document.getElementById('awardName').value.trim();
    const normalRate = parseFloat(document.getElementById('normalRate').value);
    const overtimeRate = parseFloat(document.getElementById('overtimeRate').value);
    const weekendRate = parseFloat(document.getElementById('weekendRate').value);
    const nightShiftRate = parseFloat(document.getElementById('nightShiftRate').value);
    
    if (!name) {
        alert('Please enter an award name');
        return;
    }
    
    const newAward = {
        id: Date.now(),
        name: name,
        normalRate: normalRate,
        overtimeRate: overtimeRate,
        weekendRate: weekendRate,
        nightShiftRate: nightShiftRate
    };
    
    awards.push(newAward);
    saveAwards();
    renderAwardsList();
    updateAwardDropdown();
    
    // Clear form
    document.getElementById('awardName').value = '';
    document.getElementById('normalRate').value = '1.0';
    document.getElementById('overtimeRate').value = '1.5';
    document.getElementById('weekendRate').value = '2.0';
    document.getElementById('nightShiftRate').value = '1.25';
    
    alert('Award added successfully!');
}

function deleteAward(id) {
    if (confirm('Are you sure you want to delete this award?')) {
        awards = awards.filter(award => award.id !== id);
        saveAwards();
        renderAwardsList();
        updateAwardDropdown();
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

// Pay Calculation
function calculatePay() {
    // Get input values
    const awardId = parseInt(document.getElementById('award').value);
    const baseRate = parseFloat(document.getElementById('baseRate').value);
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
    
    // Estimate annual income (multiply weekly pay by 52)
    const estimatedAnnualIncome = grossPay * 52;
    
    // Calculate tax
    const tax = calculateTax(estimatedAnnualIncome) / 52; // Weekly tax
    
    // Calculate HELP debt repayment
    const helpRepayment = hasHelpDebt ? calculateHelpDebt(estimatedAnnualIncome) / 52 : 0;
    
    // Calculate net pay
    const netPay = grossPay - tax - helpRepayment;
    
    // Display results
    displayResults(grossPay, normalPay, overtimePay, weekendPay, nightShiftPay, allowances, tax, helpRepayment, netPay);
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

function displayResults(grossPay, normalPay, overtimePay, weekendPay, nightShiftPay, allowances, tax, helpRepayment, netPay) {
    document.getElementById('grossPay').textContent = formatCurrency(grossPay);
    document.getElementById('normalPay').textContent = formatCurrency(normalPay);
    document.getElementById('overtimePay').textContent = formatCurrency(overtimePay);
    document.getElementById('weekendPay').textContent = formatCurrency(weekendPay);
    document.getElementById('nightShiftPay').textContent = formatCurrency(nightShiftPay);
    document.getElementById('allowancesPay').textContent = formatCurrency(allowances);
    document.getElementById('tax').textContent = formatCurrency(tax);
    document.getElementById('helpRepayment').textContent = formatCurrency(helpRepayment);
    document.getElementById('netPay').textContent = formatCurrency(netPay);
    
    document.getElementById('results').style.display = 'block';
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
