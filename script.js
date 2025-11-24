// Grade conversion table (VLOOKUP equivalent)
// Maps grade points to rounded grade points (1.00, 1.25, 1.50, etc.)
// This table is used to round grade points to the nearest valid grade
// Structure: [threshold, rounded_grade]
// For values >= threshold, returns the rounded_grade
// Values are rounded to nearest 0.25 increment
const GRADE_LOOKUP_TABLE = [
    [4.875, 5.00],  // >= 4.875 → 5.00
    [4.625, 4.75],  // >= 4.625 → 4.75
    [4.375, 4.50],  // >= 4.375 → 4.50
    [4.125, 4.25],  // >= 4.125 → 4.25
    [3.875, 4.00],  // >= 3.875 → 4.00
    [3.625, 3.75],  // >= 3.625 → 3.75
    [3.375, 3.50],  // >= 3.375 → 3.50
    [3.125, 3.25],  // >= 3.125 → 3.25
    [2.875, 3.00],  // >= 2.875 → 3.00
    [2.625, 2.75],  // >= 2.625 → 2.75
    [2.375, 2.50],  // >= 2.375 → 2.50
    [2.125, 2.25],  // >= 2.125 → 2.25
    [1.875, 2.00],  // >= 1.875 → 2.00 (this fixes 1.88 → 2.00)
    [1.625, 1.75],  // >= 1.625 → 1.75
    [1.375, 1.50],  // >= 1.375 → 1.50
    [1.125, 1.25],  // >= 1.125 → 1.25
    [0.875, 1.00],  // >= 0.875 → 1.00
    [0.0, 1.00]     // < 0.875 → 1.00 (default)
];

// Description lookup table
const GRADE_DESCRIPTIONS = {
    1.00: 'Excellent',
    1.25: 'Very Good',
    1.50: 'Very Good',
    1.75: 'Good',
    2.00: 'Above Average',
    2.25: 'Above Average',
    2.50: 'Average',
    2.75: 'Average',
    3.00: 'Passing',
    3.25: 'Conditional',
    3.50: 'Conditional',
    3.75: 'Failed',
    4.00: 'Failed',
    5.00: 'Failed'
};

// Maximum values
const MAX_VALUES = {
    'midterm-grade': 5.0,
    'assignment-total': 40,
    'activity-recitation': 50,
    'attendance': 10,
    'quiz-total': 50,
    'prefinals-exam': 50,
    'finals-project': 100,
    'final-exam': 100,
    'pt1': 50,
    'pt2': 50
};

// Get all input elements
const inputs = {
    midtermGrade: document.getElementById('midterm-grade'),
    assignmentTotal: document.getElementById('assignment-total'),
    activityRecitation: document.getElementById('activity-recitation'),
    attendance: document.getElementById('attendance'),
    quizTotal: document.getElementById('quiz-total'),
    prefinalsExam: document.getElementById('prefinals-exam'),
    finalsProject: document.getElementById('finals-project'),
    finalExam: document.getElementById('final-exam'),
    pt1: document.getElementById('pt1'),
    pt2: document.getElementById('pt2')
};

// Get all result display elements
const displays = {
    srcTotal: document.getElementById('src-total'),
    cpaPercent: document.getElementById('cpa-percent'),
    srqTotal: document.getElementById('srq-total'),
    qaPercent: document.getElementById('qa-percent'),
    fPercent: document.getElementById('f-percent'),
    pitTotal: document.getElementById('pit-total'),
    pitPercent: document.getElementById('pit-percent'),
    fgaPercent: document.getElementById('fga-percent'),
    finLecGradePoint: document.getElementById('fin-lec-grade-point'),
    finalGradePoint: document.getElementById('final-grade-point'),
    finalPeriodGrade: document.getElementById('final-period-grade'),
    computedFinalGrade: document.getElementById('computed-final-grade'),
    computedFinalAfterRemoval: document.getElementById('computed-final-after-removal'),
    finalDescription: document.getElementById('final-description')
};

// Get the final period grade cell element for color coding
const finalPeriodGradeCell = document.querySelector('.final-period-grade-highlight');
const computedFinalCell = document.querySelector('.computed-final-highlight');

// Validate input against maximum
function validateInput(inputName, value) {
    const maxValue = MAX_VALUES[inputName];
    const inputElement = inputs[inputName];
    
    if (!inputElement) return value;
    
    if (value > maxValue) {
        inputElement.classList.add('error');
        inputElement.value = maxValue;
        return maxValue;
    } else if (value < 0) {
        inputElement.classList.add('error');
        inputElement.value = 0;
        return 0;
    } else {
        inputElement.classList.remove('error');
        return value;
    }
}

// VLOOKUP equivalent - finds the rounded grade point
function lookupGradePoint(gradePoint) {
    // Sort table by grade point descending for lookup
    for (let i = 0; i < GRADE_LOOKUP_TABLE.length; i++) {
        if (gradePoint >= GRADE_LOOKUP_TABLE[i][0]) {
            return GRADE_LOOKUP_TABLE[i][1];
        }
    }
    return 1.00; // Default to 1.00 if below all thresholds
}

// Round to nearest 0.25 increment
function roundToNearestQuarter(grade) {
    const rounded = Math.round(grade * 4) / 4;
    
    // Clamp to valid grade range (1.0 to 5.0)
    if (rounded < 1.0) return 1.0;
    if (rounded > 5.0) return 5.0;
    
    // Special case: if between 3.0 and 3.25, round to 3.0 (passing)
    if (rounded > 3.0 && rounded < 3.25) return 3.0;
    
    return rounded;
}

// Get description for a grade
function getGradeDescription(grade) {
    const rounded = roundToNearestQuarter(grade);
    return GRADE_DESCRIPTIONS[rounded] || 'Unknown';
}

// Calculate Class Standing Performance Items (10%)
// L = SUM(I:K) where I=Assignment Total (40), J=Activity and Recitation (50), K=Attendance (10)
// M = L / L_max * 100% = CPA
function calculateClassStanding() {
    const assignmentTotal = parseFloat(inputs.assignmentTotal.value) || 0;
    const activityRecitation = parseFloat(inputs.activityRecitation.value) || 0;
    const attendance = parseFloat(inputs.attendance.value) || 0;
    
    const validatedAssignment = validateInput('assignment-total', assignmentTotal);
    const validatedActivity = validateInput('activity-recitation', activityRecitation);
    const validatedAttendance = validateInput('attendance', attendance);
    
    const l = validatedAssignment + validatedActivity + validatedAttendance; // Total Score (SRC), max = 100
    const m = (l / 100) * 100; // CPA percentage
    
    displays.srcTotal.textContent = l.toFixed(2);
    displays.cpaPercent.textContent = m.toFixed(2) + '%';
    
    return m / 100; // Return as decimal (0-1)
}

// Calculate Quiz/Pre-final Performance Item (40%)
// P = SUM(N:O) where N=Quiz Total (50), O=Pre-Finals Exam (50)
// Q = P / P_max * 100% = QA
function calculateQuizPrefinal() {
    const quizTotal = parseFloat(inputs.quizTotal.value) || 0;
    const prefinalsExam = parseFloat(inputs.prefinalsExam.value) || 0;
    
    const validatedQuiz = validateInput('quiz-total', quizTotal);
    const validatedPrefinals = validateInput('prefinals-exam', prefinalsExam);
    
    const p = validatedQuiz + validatedPrefinals; // Total Score (SRQ), max = 100
    const q = (p / 100) * 100; // QA percentage
    
    displays.srqTotal.textContent = p.toFixed(2);
    displays.qaPercent.textContent = q.toFixed(2) + '%';
    
    return q / 100; // Return as decimal (0-1)
}

// Get FINALS: Project Implementation (R)
function getFinalsProject() {
    const finalsProject = parseFloat(inputs.finalsProject.value) || 0;
    const validated = validateInput('finals-project', finalsProject);
    return validated / 100; // Return as decimal (0-1)
}

// Calculate Final Exam (30%)
// S = Final Exam (max 100)
// T = S / S_max * 100% = F
function calculateFinalExam() {
    const finalExam = parseFloat(inputs.finalExam.value) || 0;
    const validated = validateInput('final-exam', finalExam);
    
    const t = (validated / 100) * 100; // F percentage
    
    displays.fPercent.textContent = t.toFixed(2) + '%';
    
    return t / 100; // Return as decimal (0-1)
}

// Calculate Per Inno Task (20%)
// V = SUM(U:T) where U=PT1 (50), T=PT2 (50)
// W = V / V_max * 100% = PIT %
function calculatePIT() {
    const pt1 = parseFloat(inputs.pt1.value) || 0;
    const pt2 = parseFloat(inputs.pt2.value) || 0;
    
    const validatedPT1 = validateInput('pt1', pt1);
    const validatedPT2 = validateInput('pt2', pt2);
    
    const v = validatedPT1 + validatedPT2; // Total Score (PIT), max = 100
    const w = (v / 100) * 100; // PIT percentage
    
    displays.pitTotal.textContent = v.toFixed(2);
    displays.pitPercent.textContent = w.toFixed(2) + '%';
    
    return w / 100; // Return as decimal (0-1)
}

// Calculate FGA (X)
// X = (M*0.1) + (Q*0.4) + (S*0.3) + (W*0.2)
// Where M=CPA, Q=QA, S=Final Exam (F), W=PIT %
function calculateFGA(m, q, s, w) {
    const x = (m * 0.1) + (q * 0.4) + (s * 0.3) + (w * 0.2);
    return x; // Returns as decimal (0-1)
}

// Calculate Fin Lec Grade Point (Y)
// Y = IF(X >= 0.7, 23/3 - (20/3)*(X/100%), 5 - (20/7)*(X/100%))
// Note: X is already a decimal (0-1), so X/100% = X
function calculateFinLecGradePoint(x) {
    let y;
    if (x >= 0.7) {
        y = (23/3) - ((20/3) * x);
    } else {
        y = 5 - ((20/7) * x);
    }
    return y;
}

// Main calculation function
function calculateGrade() {
    // Get midterm grade
    const midtermGrade = parseFloat(inputs.midtermGrade.value) || 0;
    validateInput('midterm-grade', midtermGrade);
    
    // Calculate each component
    const m = calculateClassStanding(); // CPA (decimal)
    const q = calculateQuizPrefinal(); // QA (decimal)
    const s = calculateFinalExam(); // Final Exam F (decimal)
    const w = calculatePIT(); // PIT % (decimal)
    
    // Calculate FGA (X)
    // X = (M*0.1) + (Q*0.4) + (S*0.3) + (W*0.2)
    const x = calculateFGA(m, q, s, w);
    displays.fgaPercent.textContent = (x * 100).toFixed(2) + '%';
    
    // Calculate Fin Lec Grade Point (Y)
    const y = calculateFinLecGradePoint(x);
    displays.finLecGradePoint.textContent = y.toFixed(3);
    
    // Final Grade Point (Z) = Y
    const z = y;
    displays.finalGradePoint.textContent = z.toFixed(3);
    
    // Final Period Grade (AA) = VLOOKUP(Z, grade_table)
    const aa = lookupGradePoint(z);
    displays.finalPeriodGrade.textContent = aa.toFixed(2);
    
    // No color coding for Final Period Grade - keep it gray/white
    
    // Computed Final Grade (AJ/BB) = (AA * 0.5) + (F * 0.5)
    // Where F is the midterm grade
    const aj = (aa * 0.5) + (midtermGrade * 0.5);
    
    // "1/2 MTG + 1/2 FTG" shows the raw calculated value (AJ/BB) before lookup
    displays.computedFinalGrade.textContent = aj.toFixed(2);
    
    // "1/2 MTG + 1/2 FTG (Final Grade)" = IF(VLOOKUP(AJ) > 3.5, 5, VLOOKUP(AJ))
    const ajLookup = lookupGradePoint(aj);
    const bc = ajLookup > 3.5 ? 5.0 : ajLookup;
    displays.computedFinalAfterRemoval.textContent = bc.toFixed(2);
    
    // Description - use the looked-up value (BC) for description
    const description = getGradeDescription(bc);
    displays.finalDescription.textContent = description;
    
    // Color code the computed final grade - use the looked-up value (BC) for color coding
    if (computedFinalCell) {
        computedFinalCell.classList.remove('grade-green', 'grade-red');
        if (bc >= 1.0 && bc <= 3.0) {
            computedFinalCell.classList.add('grade-green');
        } else if (bc >= 3.25 && bc <= 5.0) {
            computedFinalCell.classList.add('grade-red');
        }
    }
    
    // Highlight the corresponding grade item in the grading scale reference - use looked-up value (BC)
    const roundedFinal = roundToNearestQuarter(bc);
    const gradeItems = document.querySelectorAll('.grade-item');
    gradeItems.forEach(item => {
        item.classList.remove('active');
        const itemGrade = parseFloat(item.getAttribute('data-grade'));
        if (itemGrade === roundedFinal) {
            item.classList.add('active');
        }
    });
}

// Get the compute button, reset button, and results sections
const computeButton = document.getElementById('compute-button');
const resetButton = document.getElementById('reset-button');
const resultsSection = document.getElementById('results-section');
const computedFinalSection = document.getElementById('computed-final-section');

// Function to reset results
function resetResults() {
    // Reset all input fields to 0
    if (inputs.midtermGrade) inputs.midtermGrade.value = '0';
    if (inputs.assignmentTotal) inputs.assignmentTotal.value = '0';
    if (inputs.activityRecitation) inputs.activityRecitation.value = '0';
    if (inputs.attendance) inputs.attendance.value = '0';
    if (inputs.quizTotal) inputs.quizTotal.value = '0';
    if (inputs.prefinalsExam) inputs.prefinalsExam.value = '0';
    if (inputs.finalsProject) inputs.finalsProject.value = '0';
    if (inputs.finalExam) inputs.finalExam.value = '0';
    if (inputs.pt1) inputs.pt1.value = '0';
    if (inputs.pt2) inputs.pt2.value = '0';
    
    // Reset all intermediate calculation displays
    displays.srcTotal.textContent = '0';
    displays.cpaPercent.textContent = '0%';
    displays.srqTotal.textContent = '0';
    displays.qaPercent.textContent = '0%';
    displays.fPercent.textContent = '0%';
    displays.pitTotal.textContent = '0';
    displays.pitPercent.textContent = '0%';
    
    // Hide results sections
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }
    if (computedFinalSection) {
        computedFinalSection.style.display = 'none';
    }
    // Hide reset button
    if (resetButton) {
        resetButton.style.display = 'none';
    }
    // Reset display values
    displays.fgaPercent.textContent = '-';
    displays.finLecGradePoint.textContent = '-';
    displays.finalGradePoint.textContent = '-';
    displays.finalPeriodGrade.textContent = '-';
    displays.computedFinalGrade.textContent = '-';
    displays.computedFinalAfterRemoval.textContent = '-';
    displays.finalDescription.textContent = '-';
    // Remove color coding (only for computed final grade)
    if (computedFinalCell) {
        computedFinalCell.classList.remove('grade-green', 'grade-red');
    }
    // Remove active highlight from grading scale
    const gradeItems = document.querySelectorAll('.grade-item');
    gradeItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Remove error classes from inputs
    Object.values(inputs).forEach(input => {
        if (input) {
            input.classList.remove('error');
        }
    });
}

// Add event listeners to all inputs for validation only (no calculation)
Object.values(inputs).forEach(input => {
    if (input) {
        input.addEventListener('blur', function() {
            const value = parseFloat(this.value) || 0;
            const inputName = this.id;
            validateInput(inputName, value);
        });
    }
});

// Add click event listener to compute button
if (computeButton) {
    computeButton.addEventListener('click', function() {
        // Show results sections
        if (resultsSection) {
            resultsSection.style.display = 'block';
        }
        if (computedFinalSection) {
            computedFinalSection.style.display = 'block';
        }
        // Show reset button
        if (resetButton) {
            resetButton.style.display = 'inline-block';
        }
        // Calculate and display grades
        calculateGrade();
    });
}

// Add click event listener to reset button
if (resetButton) {
    resetButton.addEventListener('click', function() {
        resetResults();
    });
}
