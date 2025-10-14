// Defaults Editor Data Storage
let editorAwards = [];
let editorTaxByYear = {};
let editorHelpByYear = {};
let currentEditorTaxYear = '';
let currentEditorHelpYear = '';

// Initialize the defaults editor
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    renderEditorAwards();
    updateAwardsJson();
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
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Awards Editor Functions
function loadAwardsFromMain() {
    const stored = localStorage.getItem('awards');
    if (stored) {
        editorAwards = JSON.parse(stored);
        renderEditorAwards();
        updateAwardsJson();
        alert('Awards loaded from main application');
    } else {
        alert('No awards found in main application');
    }
}

function addEditorAward() {
    const award = {
        id: Date.now(),
        name: 'New Award',
        normalRate: 1.0,
        overtimeRate: 1.5,
        saturdayRate: 1.5,
        sundayRate: 2.0,
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
    };
    editorAwards.push(award);
    renderEditorAwards();
    updateAwardsJson();
}

function deleteEditorAward(index) {
    editorAwards.splice(index, 1);
    renderEditorAwards();
    updateAwardsJson();
}

function renderEditorAwards() {
    const container = document.getElementById('awardsEditorList');
    if (editorAwards.length === 0) {
        container.innerHTML = '<p class="info-text">No awards configured. Add a new award to start.</p>';
        return;
    }
    
    container.innerHTML = editorAwards.map((award, index) => `
        <div class="award-item" style="margin-bottom: 20px; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <h4>Award ${index + 1}</h4>
            <div class="rate-grid">
                <div>
                    <label>Name:</label>
                    <input type="text" class="form-control" value="${award.name}" onchange="updateEditorAward(${index}, 'name', this.value)">
                </div>
                <div>
                    <label>Normal Rate:</label>
                    <input type="number" class="form-control" step="0.01" value="${award.normalRate}" onchange="updateEditorAward(${index}, 'normalRate', parseFloat(this.value))">
                </div>
                <div>
                    <label>Overtime Rate:</label>
                    <input type="number" class="form-control" step="0.01" value="${award.overtimeRate}" onchange="updateEditorAward(${index}, 'overtimeRate', parseFloat(this.value))">
                </div>
                <div>
                    <label>Saturday Rate:</label>
                    <input type="number" class="form-control" step="0.01" value="${award.saturdayRate || award.weekendRate || 1.5}" onchange="updateEditorAward(${index}, 'saturdayRate', parseFloat(this.value))">
                </div>
                <div>
                    <label>Sunday Rate:</label>
                    <input type="number" class="form-control" step="0.01" value="${award.sundayRate || award.weekendRate || 2.0}" onchange="updateEditorAward(${index}, 'sundayRate', parseFloat(this.value))">
                </div>
                <div>
                    <label>Night Shift Rate:</label>
                    <input type="number" class="form-control" step="0.01" value="${award.nightShiftRate}" onchange="updateEditorAward(${index}, 'nightShiftRate', parseFloat(this.value))">
                </div>
                <div>
                    <label>Max Daily Hours:</label>
                    <input type="number" class="form-control" step="0.25" value="${award.maxDailyHours}" onchange="updateEditorAward(${index}, 'maxDailyHours', parseFloat(this.value))">
                </div>
                <div>
                    <label>Extended Shift Hours:</label>
                    <input type="number" class="form-control" step="0.25" value="${award.extendedShiftHours}" onchange="updateEditorAward(${index}, 'extendedShiftHours', parseFloat(this.value))">
                </div>
                <div>
                    <label>Has Sleepover:</label>
                    <select class="form-control" onchange="updateEditorAward(${index}, 'hasSleepover', this.value === 'true')">
                        <option value="false" ${!award.hasSleepover ? 'selected' : ''}>No</option>
                        <option value="true" ${award.hasSleepover ? 'selected' : ''}>Yes</option>
                    </select>
                </div>
                <div>
                    <label>Sleepover Rate ($):</label>
                    <input type="number" class="form-control" step="0.01" value="${award.sleeperRate}" onchange="updateEditorAward(${index}, 'sleeperRate', parseFloat(this.value))">
                </div>
                <div>
                    <label>Meal Allowance 1 ($):</label>
                    <input type="number" class="form-control" step="0.01" value="${award.mealAllowance1}" onchange="updateEditorAward(${index}, 'mealAllowance1', parseFloat(this.value))">
                </div>
                <div>
                    <label>After Hours (Meal 1):</label>
                    <input type="number" class="form-control" step="0.25" value="${award.mealAllowance1Hours}" onchange="updateEditorAward(${index}, 'mealAllowance1Hours', parseFloat(this.value))">
                </div>
                <div>
                    <label>Meal Allowance 2 ($):</label>
                    <input type="number" class="form-control" step="0.01" value="${award.mealAllowance2}" onchange="updateEditorAward(${index}, 'mealAllowance2', parseFloat(this.value))">
                </div>
                <div>
                    <label>After Hours (Meal 2):</label>
                    <input type="number" class="form-control" step="0.25" value="${award.mealAllowance2Hours}" onchange="updateEditorAward(${index}, 'mealAllowance2Hours', parseFloat(this.value))">
                </div>
                <div>
                    <label>First Aid Allowance ($/week):</label>
                    <input type="number" class="form-control" step="0.01" value="${award.firstAidAllowance}" onchange="updateEditorAward(${index}, 'firstAidAllowance', parseFloat(this.value))">
                </div>
            </div>
            <button onclick="deleteEditorAward(${index})" class="btn btn-danger" style="margin-top: 10px;">Delete Award</button>
        </div>
    `).join('');
}

function updateEditorAward(index, field, value) {
    editorAwards[index][field] = value;
    updateAwardsJson();
}

function updateAwardsJson() {
    document.getElementById('awardsJsonOutput').value = JSON.stringify(editorAwards, null, 2);
}

function downloadAwardsJson() {
    const dataStr = JSON.stringify(editorAwards, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'default-awards.json');
    linkElement.click();
}

function copyAwardsJson() {
    const textarea = document.getElementById('awardsJsonOutput');
    textarea.select();
    document.execCommand('copy');
    alert('JSON copied to clipboard!');
}

// Tax Editor Functions
function loadTaxFromMain() {
    const stored = localStorage.getItem('taxBracketsByYear');
    if (stored) {
        editorTaxByYear = JSON.parse(stored);
        if (currentEditorTaxYear && editorTaxByYear[currentEditorTaxYear]) {
            renderTaxEditor();
            updateTaxJson();
            alert('Tax rates loaded from main application');
        } else {
            alert('Please set a year first');
        }
    } else {
        alert('No tax rates found in main application');
    }
}

function addTaxEditorYear() {
    const year = document.getElementById('taxEditorYear').value.trim();
    if (!year) {
        alert('Please enter a year');
        return;
    }
    currentEditorTaxYear = year;
    if (!editorTaxByYear[year]) {
        editorTaxByYear[year] = [];
    }
    renderTaxEditor();
    updateTaxJson();
}

function addTaxEditorBracket() {
    if (!currentEditorTaxYear) {
        alert('Please set a year first');
        return;
    }
    if (!editorTaxByYear[currentEditorTaxYear]) {
        editorTaxByYear[currentEditorTaxYear] = [];
    }
    editorTaxByYear[currentEditorTaxYear].push({ min: 0, max: 0, rate: 0 });
    renderTaxEditor();
    updateTaxJson();
}

function deleteTaxEditorBracket(index) {
    editorTaxByYear[currentEditorTaxYear].splice(index, 1);
    renderTaxEditor();
    updateTaxJson();
}

function renderTaxEditor() {
    const container = document.getElementById('taxEditorList');
    if (!currentEditorTaxYear || !editorTaxByYear[currentEditorTaxYear] || editorTaxByYear[currentEditorTaxYear].length === 0) {
        container.innerHTML = '<p class="info-text">No tax brackets configured. Add a bracket to start.</p>';
        return;
    }
    
    const brackets = editorTaxByYear[currentEditorTaxYear];
    container.innerHTML = brackets.map((bracket, index) => `
        <div class="tax-bracket">
            <div class="bracket-input">
                <label>Min Income ($)</label>
                <input type="number" value="${bracket.min}" onchange="updateTaxEditorBracket(${index}, 'min', parseFloat(this.value))" class="form-control" min="0">
            </div>
            <div class="bracket-input">
                <label>Max Income ($)</label>
                <input type="number" value="${bracket.max === Infinity ? '' : bracket.max}" onchange="updateTaxEditorBracket(${index}, 'max', this.value === '' ? Infinity : parseFloat(this.value))" class="form-control" placeholder="Leave empty for no limit" min="0">
            </div>
            <div class="bracket-input">
                <label>Tax Rate (%)</label>
                <input type="number" value="${bracket.rate * 100}" onchange="updateTaxEditorBracket(${index}, 'rate', parseFloat(this.value) / 100)" class="form-control" step="0.1" min="0" max="100">
            </div>
            <button onclick="deleteTaxEditorBracket(${index})" class="btn btn-danger">Delete</button>
        </div>
    `).join('');
}

function updateTaxEditorBracket(index, field, value) {
    editorTaxByYear[currentEditorTaxYear][index][field] = value;
    updateTaxJson();
}

function updateTaxJson() {
    document.getElementById('taxJsonOutput').value = JSON.stringify(editorTaxByYear, null, 2);
}

function downloadTaxJson() {
    const dataStr = JSON.stringify(editorTaxByYear, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'default-tax-rates.json');
    linkElement.click();
}

function copyTaxJson() {
    const textarea = document.getElementById('taxJsonOutput');
    textarea.select();
    document.execCommand('copy');
    alert('JSON copied to clipboard!');
}

// HELP Editor Functions
function loadHelpFromMain() {
    const stored = localStorage.getItem('helpThresholdsByYear');
    if (stored) {
        editorHelpByYear = JSON.parse(stored);
        if (currentEditorHelpYear && editorHelpByYear[currentEditorHelpYear]) {
            renderHelpEditor();
            updateHelpJson();
            alert('HELP rates loaded from main application');
        } else {
            alert('Please set a year first');
        }
    } else {
        alert('No HELP rates found in main application');
    }
}

function addHelpEditorYear() {
    const year = document.getElementById('helpEditorYear').value.trim();
    if (!year) {
        alert('Please enter a year');
        return;
    }
    currentEditorHelpYear = year;
    if (!editorHelpByYear[year]) {
        editorHelpByYear[year] = [];
    }
    renderHelpEditor();
    updateHelpJson();
}

function addHelpEditorThreshold() {
    if (!currentEditorHelpYear) {
        alert('Please set a year first');
        return;
    }
    if (!editorHelpByYear[currentEditorHelpYear]) {
        editorHelpByYear[currentEditorHelpYear] = [];
    }
    editorHelpByYear[currentEditorHelpYear].push({ min: 0, max: 0, rate: 0 });
    renderHelpEditor();
    updateHelpJson();
}

function deleteHelpEditorThreshold(index) {
    editorHelpByYear[currentEditorHelpYear].splice(index, 1);
    renderHelpEditor();
    updateHelpJson();
}

function renderHelpEditor() {
    const container = document.getElementById('helpEditorList');
    if (!currentEditorHelpYear || !editorHelpByYear[currentEditorHelpYear] || editorHelpByYear[currentEditorHelpYear].length === 0) {
        container.innerHTML = '<p class="info-text">No HELP thresholds configured. Add a threshold to start.</p>';
        return;
    }
    
    const thresholds = editorHelpByYear[currentEditorHelpYear];
    container.innerHTML = thresholds.map((threshold, index) => `
        <div class="help-threshold">
            <div class="bracket-input">
                <label>Min Income ($)</label>
                <input type="number" value="${threshold.min}" onchange="updateHelpEditorThreshold(${index}, 'min', parseFloat(this.value))" class="form-control" min="0">
            </div>
            <div class="bracket-input">
                <label>Max Income ($)</label>
                <input type="number" value="${threshold.max === Infinity ? '' : threshold.max}" onchange="updateHelpEditorThreshold(${index}, 'max', this.value === '' ? Infinity : parseFloat(this.value))" class="form-control" placeholder="Leave empty for no limit" min="0">
            </div>
            <div class="bracket-input">
                <label>Repayment Rate (%)</label>
                <input type="number" value="${threshold.rate * 100}" onchange="updateHelpEditorThreshold(${index}, 'rate', parseFloat(this.value) / 100)" class="form-control" step="0.1" min="0" max="100">
            </div>
            <button onclick="deleteHelpEditorThreshold(${index})" class="btn btn-danger">Delete</button>
        </div>
    `).join('');
}

function updateHelpEditorThreshold(index, field, value) {
    editorHelpByYear[currentEditorHelpYear][index][field] = value;
    updateHelpJson();
}

function updateHelpJson() {
    document.getElementById('helpJsonOutput').value = JSON.stringify(editorHelpByYear, null, 2);
}

function downloadHelpJson() {
    const dataStr = JSON.stringify(editorHelpByYear, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'default-help-rates.json');
    linkElement.click();
}

function copyHelpJson() {
    const textarea = document.getElementById('helpJsonOutput');
    textarea.select();
    document.execCommand('copy');
    alert('JSON copied to clipboard!');
}
