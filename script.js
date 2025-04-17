// --- Import Firebase Modules ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    deleteDoc
    // No need for `collection` import if only using doc refs by path
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";


// --- Firebase Configuration ---
// ה-Config שלך מ-Firebase הוכנס כאן:
const firebaseConfig = {
  apiKey: "AIzaSyA2JO3N9evEeaKU2vuW5T2oV9uEXLrOrEM",
  authDomain: "pill-tracker-a94fd.firebaseapp.com",
  projectId: "pill-tracker-a94fd",
  storageBucket: "pill-tracker-a94fd.firebasestorage.app",
  messagingSenderId: "1032904632163",
  appId: "1:1032904632163:web:c02180c9e32180a3545556",
  measurementId: "G-TRE85BD46K"
};

// --- App Configuration ---
const CONFIG = {
    ESTIMATED_DAILY_DOSAGE: 2,
    DEFAULT_WEEKDAY_DOSAGE: 2,
    DEFAULT_SATURDAY_DOSAGE: 1,
    PLAN_HORIZON_DAYS: 30,
    WAITING_PERIOD_DAYS: 30,
    FIRESTORE_COLLECTION: 'userPillData'
};

// --- Global Variables ---
let firebaseApp;
let auth;
let db;
let currentUser = null;
let userData = null;

// --- DOM Elements ---
let pages, modals, dashboardPage, historyPage, planPage,
    initialSetup, dashboardView, setupNowBtn, currentPillsEl, adjustCountBtn,
    nextPurchaseDateEl, daysUntilPurchaseEl, daysRemainingEl, estimatedEndDateEl,
    lastPurchaseInfoEl, recordPurchaseBtn, resetDataBtn, lastLogTimeEl, logButtons,
    logOtherBtn, gotoHistoryBtn, gotoPlanBtn, backToDashboardFromHistory,
    backToDashboardFromPlan, historyTableBody, historyContent, planContent,
    purchaseModal, purchaseModalTitle, purchaseDateInput, pillsAddedInput,
    initialCountSection, initialPillsCountInput, savePurchaseBtn, cancelPurchaseBtn,
    adjustModal, adjustPillsCountInput, saveAdjustBtn, cancelAdjustBtn,
    logOtherModal, logOtherAmountInput, saveLogOtherBtn, cancelLogOtherBtn,
    authContainer, loginView, userInfo, loginBtn, logoutBtn, userNameEl,
    appContainer, loadingIndicator,
    // New elements for Edit Log Modal
    editLogModal, editLogIdInput, editLogOriginalAmountInput, editLogTimestampInput,
    editLogAmountInput, saveEditLogBtn, cancelEditLogBtn;


// Function to initialize DOM element variables
function initializeDOMElements() {
    pages = document.querySelectorAll('.page');
    modals = document.querySelectorAll('.modal');
    dashboardPage = document.getElementById('page-dashboard');
    historyPage = document.getElementById('page-history');
    planPage = document.getElementById('page-plan');
    initialSetup = document.getElementById('initial-setup');
    dashboardView = document.getElementById('dashboard-view');
    setupNowBtn = document.getElementById('setup-now-btn');
    currentPillsEl = document.getElementById('current-pills');
    adjustCountBtn = document.getElementById('adjust-count-btn');
    nextPurchaseDateEl = document.getElementById('next-purchase-date');
    daysUntilPurchaseEl = document.getElementById('days-until-purchase');
    daysRemainingEl = document.getElementById('days-remaining');
    estimatedEndDateEl = document.getElementById('estimated-end-date');
    lastPurchaseInfoEl = document.getElementById('last-purchase-info');
    recordPurchaseBtn = document.getElementById('record-purchase-btn');
    resetDataBtn = document.getElementById('reset-data-btn');
    lastLogTimeEl = document.getElementById('last-log-time');
    logButtons = document.querySelectorAll('.log-button');
    logOtherBtn = document.getElementById('log-other-btn');
    gotoHistoryBtn = document.getElementById('goto-history-btn');
    gotoPlanBtn = document.getElementById('goto-plan-btn');
    backToDashboardFromHistory = document.getElementById('back-to-dashboard-from-history');
    backToDashboardFromPlan = document.getElementById('back-to-dashboard-from-plan');
    historyTableBody = document.getElementById('history-table-body');
    historyContent = document.getElementById('history-content');
    planContent = document.getElementById('plan-content');
    // Modals
    purchaseModal = document.getElementById('purchase-modal');
    purchaseModalTitle = document.getElementById('purchase-modal-title');
    purchaseDateInput = document.getElementById('purchase-date');
    pillsAddedInput = document.getElementById('pills-added');
    initialCountSection = document.getElementById('initial-count-section');
    initialPillsCountInput = document.getElementById('initial-pills-count');
    savePurchaseBtn = document.getElementById('save-purchase-btn');
    cancelPurchaseBtn = document.getElementById('cancel-purchase-btn');
    adjustModal = document.getElementById('adjust-modal');
    adjustPillsCountInput = document.getElementById('adjust-pills-count');
    saveAdjustBtn = document.getElementById('save-adjust-btn');
    cancelAdjustBtn = document.getElementById('cancel-adjust-btn');
    logOtherModal = document.getElementById('log-other-modal');
    logOtherAmountInput = document.getElementById('log-other-amount');
    saveLogOtherBtn = document.getElementById('save-log-other-btn');
    cancelLogOtherBtn = document.getElementById('cancel-log-other-btn');
    // Edit Log Modal Elements
    editLogModal = document.getElementById('edit-log-modal');
    editLogIdInput = document.getElementById('edit-log-id');
    editLogOriginalAmountInput = document.getElementById('edit-log-original-amount');
    editLogTimestampInput = document.getElementById('edit-log-timestamp');
    editLogAmountInput = document.getElementById('edit-log-amount');
    saveEditLogBtn = document.getElementById('save-edit-log-btn');
    cancelEditLogBtn = document.getElementById('cancel-edit-log-btn');
    // Auth elements
    authContainer = document.getElementById('auth-container');
    loginView = document.getElementById('login-view');
    userInfo = document.getElementById('user-info');
    loginBtn = document.getElementById('login-btn');
    logoutBtn = document.getElementById('logout-btn');
    userNameEl = document.getElementById('user-name');
    appContainer = document.getElementById('app-container');
    loadingIndicator = document.getElementById('loading-indicator');
}


// --- Utility Functions ---
function getTodayDateString() { const today = new Date(); const offset = today.getTimezoneOffset(); const localToday = new Date(today.getTime() - (offset*60*1000)); return localToday.toISOString().split('T')[0]; }
function parseDateString(dateString) { if (!dateString) return null; const [year, month, day] = dateString.split('-').map(Number); return new Date(year, month - 1, day); }
function formatDate(date) { if (!date) return '-'; const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${day}/${month}/${year}`; }
function formatDayOfWeek(date) { if (!date) return ''; return date.toLocaleDateString('he-IL', { weekday: 'short' }); }
function formatTime(date) { if (!date) return ''; return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }); }
function formatDateTime(date) { if (!date) return '-'; return `${formatDate(date)} ${formatTime(date)}`; }
// Format Date object to datetime-local input string format (YYYY-MM-DDTHH:mm)
function formatToDateTimeLocal(date) {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }
function diffInDays(date1, date2) { if (!date1 || !date2) return 0; const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()); const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()); const diffTime = d2 - d1; return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); }
function generateUniqueId() { return `id_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`; }
function dateToYYYYMMDD(date) { if (!date) return null; const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); return `${year}-${month}-${day}`; }

// --- Firebase Initialization and Auth (Modular Syntax) ---
function initializeFirebase() {
    try {
        firebaseApp = initializeApp(firebaseConfig);
        console.log("Firebase Initialized (Modular)");
        auth = getAuth(firebaseApp);
        db = getFirestore(firebaseApp);
        onAuthStateChanged(auth, handleAuthStateChange);
    } catch (error) { /* ... error handling ... */ console.error("Error initializing Firebase:", error); if (firebaseConfig.apiKey === "YOUR_API_KEY") { alert("שגיאה: יש להחליף את פרטי התצורה של Firebase בקובץ script.js!"); } else { alert("שגיאה באתחול החיבור לשירות הענן. בדוק את פרטי התצורה בקוד ואת החיבור לאינטרנט."); } if (appContainer) appContainer.style.display = 'none'; if (authContainer) authContainer.style.display = 'none'; }
}

async function handleAuthStateChange(user) { /* ... same as before ... */ currentUser = user; if (user) { console.log("User signed in:", user.uid, user.displayName); if (userNameEl) userNameEl.textContent = `שלום, ${user.displayName || 'משתמש'}`; if (loginView) loginView.style.display = 'none'; if (userInfo) userInfo.style.display = 'flex'; if (appContainer) appContainer.style.display = 'block'; if (loadingIndicator) loadingIndicator.style.display = 'block'; if (dashboardView) dashboardView.style.display = 'none'; if (initialSetup) initialSetup.style.display = 'none'; await loadUserData(); updateDisplay(); if (loadingIndicator) loadingIndicator.style.display = 'none'; } else { console.log("User signed out"); userData = null; if (userNameEl) userNameEl.textContent = ''; if (loginView) loginView.style.display = 'block'; if (userInfo) userInfo.style.display = 'none'; if (appContainer) appContainer.style.display = 'none'; if (loadingIndicator) loadingIndicator.style.display = 'none'; showPage('page-dashboard'); } }
async function signInWithGoogle() { /* ... same as before ... */ const provider = new GoogleAuthProvider(); try { console.log("Attempting Google Sign-in..."); await signInWithPopup(auth, provider); console.log("Sign-in popup closed."); } catch (error) { console.error("Error signing in with Google:", error); alert(`שגיאה בהתחברות: ${error.message} (קוד: ${error.code})`); } }
async function signOutUser() { /* ... same as before ... */ try { await signOut(auth); console.log("Sign out successful."); } catch (error) { console.error("Error signing out:", error); alert(`שגיאה בהתנתקות: ${error.message}`); } }

// --- Firestore Data Functions (Modular Syntax) ---
function getUserDocRef() { if (!currentUser) return null; return doc(db, CONFIG.FIRESTORE_COLLECTION, currentUser.uid); }
async function loadUserData() { /* ... same as before ... */ const docRef = getUserDocRef(); if (!docRef) { userData = null; return; } console.log("Loading data for user:", currentUser.uid); try { const docSnap = await getDoc(docRef); if (docSnap.exists()) { userData = docSnap.data(); userData.consumptionLog = userData.consumptionLog || []; userData.planOverrides = userData.planOverrides || {}; console.log("Data loaded successfully:", userData); } else { console.log("No data found for user, needs initial setup."); userData = null; } } catch (error) { console.error("Error loading user data:", error); alert("שגיאה בטעינת הנתונים מהענן."); userData = null; } }
async function saveUserData() { /* ... same as before ... */ const docRef = getUserDocRef(); if (!docRef || !userData) { console.error("Cannot save data: User not logged in or no local data."); if (!userData && currentUser) { console.log("Save prevented: Initial setup likely not completed."); } return; } const dataToSave = { lastPurchaseDate: userData.lastPurchaseDate || null, currentPillCount: typeof userData.currentPillCount === 'number' ? userData.currentPillCount : 0, waitingPeriod: userData.waitingPeriod || CONFIG.WAITING_PERIOD_DAYS, consumptionLog: userData.consumptionLog || [], planOverrides: userData.planOverrides || {}, lastLogTimestamp: userData.lastLogTimestamp || new Date().toISOString() }; if (dataToSave.currentPillCount < 0) { dataToSave.currentPillCount = 0; } dataToSave.consumptionLog.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); console.log("Saving data for user:", currentUser.uid, dataToSave); try { await setDoc(docRef, dataToSave); console.log("Data saved successfully."); } catch (error) { console.error("Error saving user data:", error); alert("שגיאה בשמירת הנתונים לענן."); } }
async function deleteUserData() { /* ... same as before ... */ const docRef = getUserDocRef(); if (!docRef) { return false; } console.log("Deleting data for user:", currentUser.uid); try { await deleteDoc(docRef); console.log("User data deleted successfully."); userData = null; return true; } catch (error) { console.error("Error deleting user data:", error); alert("שגיאה במחיקת הנתונים מהענן."); return false; } }

// --- Core Logic Functions (Calculations - Unchanged) ---
function calculateEstimatedDaysRemainingFromPlan(currentPills, planOverrides) { if (currentPills <= 0) return { days: 0, endDate: null }; let pillsLeft = currentPills; let daysCount = 0; let currentDate = new Date(); while (pillsLeft > 0) { const currentDateStr = dateToYYYYMMDD(currentDate); const plannedAmount = getPlannedAmountForDate(currentDateStr, planOverrides); if (plannedAmount <= 0 && daysCount > CONFIG.PLAN_HORIZON_DAYS * 2) { if (pillsLeft >= currentPills) return { days: Infinity, endDate: null }; } if (pillsLeft >= plannedAmount) { pillsLeft -= plannedAmount; daysCount++; currentDate = addDays(currentDate, 1); } else { if (pillsLeft > 0) { daysCount++; } pillsLeft = 0; } if (daysCount > 365 * 5) { console.error("Calculation stopped: Exceeded 5 years forecast."); return { days: -1, endDate: null }; } } const estimatedEndDate = addDays(currentDate, -1); return { days: daysCount, endDate: estimatedEndDate }; }
function calculateNextPurchaseDate(lastPurchaseDateStr) { const lastPurchaseDate = parseDateString(lastPurchaseDateStr); if (!lastPurchaseDate) return null; return addDays(lastPurchaseDate, CONFIG.WAITING_PERIOD_DAYS); }
function getDefaultPlannedAmount(date) { const dayOfWeek = date.getDay(); return (dayOfWeek === 6) ? CONFIG.DEFAULT_SATURDAY_DOSAGE : CONFIG.DEFAULT_WEEKDAY_DOSAGE; }
function getPlannedAmountForDate(dateStr, planOverrides) { const date = parseDateString(dateStr); const defaultAmount = getDefaultPlannedAmount(date); return (planOverrides && typeof planOverrides[dateStr] === 'number') ? planOverrides[dateStr] : defaultAmount; }


// --- Logging, Adjustment, Deletion, EDITING ---
function addLogEntry(amount) {
    if (!currentUser || !userData) { alert("יש להתחבר ולהגדיר נתונים תחילה."); return; }
    const countTaken = parseInt(amount, 10);
    if (isNaN(countTaken) || countTaken < 0) { alert("כמות לא חוקית."); return; }
    const newLogEntry = { id: generateUniqueId(), timestamp: new Date().toISOString(), amount: countTaken };
    userData.consumptionLog = userData.consumptionLog || [];
    userData.consumptionLog.push(newLogEntry);
    userData.currentPillCount = Math.max(0, userData.currentPillCount - countTaken);
    userData.lastLogTimestamp = newLogEntry.timestamp;
    saveUserData(); // Save to Firestore
    updateDisplay();
    if (lastLogTimeEl) { /* ... feedback ... */ }
}

function deleteLogEntry(logId) {
     if (!currentUser || !userData || !userData.consumptionLog) return;
     const entryIndex = userData.consumptionLog.findIndex(entry => entry.id === logId);
     if (entryIndex === -1) { console.warn("Log entry not found:", logId); return; }
     const entryToDelete = userData.consumptionLog[entryIndex];
     const amountToRestore = entryToDelete.amount;
     userData.consumptionLog.splice(entryIndex, 1);
     userData.currentPillCount += amountToRestore; // Add back the amount
     saveUserData(); // Save to Firestore
     updateDisplay();
     renderHistoryPage(); // Re-render history page
}

function adjustCount(newCount) {
     if (!currentUser || !userData) { alert("יש להתחבר ולהגדיר נתונים תחילה."); return; }
     const count = parseInt(newCount, 10);
     if (isNaN(count) || count < 0) { alert("כמות לא חוקית."); return; }
     userData.currentPillCount = count;
     userData.lastLogTimestamp = new Date().toISOString();
     saveUserData(); // Save to Firestore
     updateDisplay();
}

// --- NEW: Edit Log Entry Functions ---
function openEditLogModal(logId) {
    if (!currentUser || !userData || !userData.consumptionLog) return;
    const logEntry = userData.consumptionLog.find(entry => entry.id === logId);
    if (!logEntry) {
        alert("שגיאה: לא נמצאה רשומת היסטוריה לעריכה.");
        return;
    }

    // Populate the modal
    editLogIdInput.value = logEntry.id;
    editLogOriginalAmountInput.value = logEntry.amount; // Store original amount
    // Convert ISO timestamp string to Date object, then format for input
    const entryDate = new Date(logEntry.timestamp);
    editLogTimestampInput.value = formatToDateTimeLocal(entryDate);
    editLogAmountInput.value = logEntry.amount;

    // Show the modal
    if (editLogModal) editLogModal.classList.add('active');
}

async function handleSaveEditLog() {
    if (!currentUser || !userData || !userData.consumptionLog) return;

    const logId = editLogIdInput.value;
    const originalAmount = parseInt(editLogOriginalAmountInput.value, 10);
    const newTimestampStr = editLogTimestampInput.value; // YYYY-MM-DDTHH:mm
    const newAmount = parseInt(editLogAmountInput.value, 10);

    // Validation
    if (!logId || isNaN(originalAmount)) { alert("שגיאה: חסר מידע מקורי לעריכה."); return; }
    if (!newTimestampStr) { alert("אנא בחר תאריך ושעה."); return; }
    if (isNaN(newAmount) || newAmount < 0) { alert("אנא הזן כמות חוקית (0 או יותר)."); return; }

    const entryIndex = userData.consumptionLog.findIndex(entry => entry.id === logId);
    if (entryIndex === -1) { alert("שגיאה: לא נמצאה רשומת היסטוריה לעדכון."); return; }

    // Calculate the difference in amount to adjust the current pill count
    const amountDifference = originalAmount - newAmount;
    userData.currentPillCount += amountDifference; // Add back the difference
    // Ensure count doesn't go below zero (though adding back shouldn't cause this)
    if (userData.currentPillCount < 0) userData.currentPillCount = 0;


    // Update the log entry in the array
    userData.consumptionLog[entryIndex].timestamp = new Date(newTimestampStr).toISOString(); // Convert local time back to ISO string
    userData.consumptionLog[entryIndex].amount = newAmount;
    userData.lastLogTimestamp = new Date().toISOString(); // Mark activity

    // Save the entire updated userData object to Firestore
    await saveUserData();

    // Close modal and refresh UI
    if (editLogModal) editLogModal.classList.remove('active');
    updateDisplay();
    renderHistoryPage(); // Re-render history to show changes
}


// --- Page Rendering (Use global `userData`) ---
function renderDashboard() { /* ... same as before ... */ console.log("Rendering dashboard. Current user data:", userData); if (!currentUser) { if(dashboardView) dashboardView.style.display = 'none'; if(initialSetup) initialSetup.style.display = 'none'; return; } if (!userData) { if(dashboardView) dashboardView.style.display = 'none'; if(initialSetup) initialSetup.style.display = 'block'; return; } if(initialSetup) initialSetup.style.display = 'none'; if(dashboardView) dashboardView.style.display = 'block'; if (!currentPillsEl /* ... etc ... */) { console.error("Dashboard elements missing!"); return; } const currentPills = userData.currentPillCount; const lastPurchaseDate = parseDateString(userData.lastPurchaseDate); const nextPurchaseDate = calculateNextPurchaseDate(userData.lastPurchaseDate); const today = new Date(); const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()); currentPillsEl.textContent = currentPills; nextPurchaseDateEl.textContent = formatDate(nextPurchaseDate); if (nextPurchaseDate) { const daysToPurchase = diffInDays(todayStart, nextPurchaseDate); if (daysToPurchase <= 0) { daysUntilPurchaseEl.textContent = '(הגיע הזמן לרכוש!)'; nextPurchaseDateEl.parentElement.classList.add('!bg-yellow-100', 'border', 'border-yellow-300'); nextPurchaseDateEl.classList.add('!text-orange-600'); } else { daysUntilPurchaseEl.textContent = `(בעוד ${daysToPurchase} ימים)`; nextPurchaseDateEl.parentElement.classList.remove('!bg-yellow-100', 'border', 'border-yellow-300'); nextPurchaseDateEl.classList.remove('!text-orange-600'); } } else { daysUntilPurchaseEl.textContent = ''; } const remainingEstimate = calculateEstimatedDaysRemainingFromPlan(currentPills, userData.planOverrides); daysRemainingEl.textContent = `${remainingEstimate.days === Infinity ? '∞' : remainingEstimate.days} ימים`; estimatedEndDateEl.textContent = remainingEstimate.endDate ? `(עד ${formatDate(remainingEstimate.endDate)})` : '(כבר אזל)'; lastPurchaseInfoEl.textContent = `תאריך: ${formatDate(lastPurchaseDate)}`; if (userData.lastLogTimestamp) { const logDate = new Date(userData.lastLogTimestamp); lastLogTimeEl.textContent = `עודכן לאחרונה: ${formatDateTime(logDate)}`; } else { lastLogTimeEl.textContent = ''; } if (remainingEstimate.days <= 3 && remainingEstimate.days !== Infinity) { currentPillsEl.parentElement.classList.add('!bg-red-100', 'border', 'border-red-300'); currentPillsEl.classList.add('!text-red-600'); } else { currentPillsEl.parentElement.classList.remove('!bg-red-100', 'border', 'border-red-300'); currentPillsEl.classList.remove('!text-red-600'); } }

function renderHistoryPage() {
    if (!historyContent) { console.error("History page content area not found!"); return; }
    let historyTableBody = document.getElementById('history-table-body');
    if (!historyTableBody) { historyContent.innerHTML = `<table id="history-table" class="w-full border-collapse mt-4"><thead><tr><th class="border p-2 text-right bg-slate-100 font-semibold">תאריך ושעה</th><th class="border p-2 text-right bg-slate-100 font-semibold">כמות שנלקחה</th><th class="border p-2 text-center bg-slate-100 font-semibold">פעולות</th></tr></thead><tbody id="history-table-body"></tbody></table>`; historyTableBody = document.getElementById('history-table-body'); } else { historyTableBody.innerHTML = ''; }
    if (!currentUser || !userData || !userData.consumptionLog || userData.consumptionLog.length === 0) { const messageRow = historyTableBody.insertRow(); const cell = messageRow.insertCell(); cell.colSpan = 3; cell.textContent = 'אין היסטוריית צריכה לתצוגה.'; cell.classList.add('text-center', 'text-gray-500', 'p-4'); return; }

    const sortedLog = [...userData.consumptionLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    sortedLog.forEach(entry => {
        const row = historyTableBody.insertRow();
        const timestamp = new Date(entry.timestamp);
        row.insertCell().textContent = formatDateTime(timestamp);
        row.insertCell().textContent = entry.amount;
        const actionCell = row.insertCell();
        actionCell.classList.add('history-actions'); // Add class for styling container

        // Edit Button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'ערוך';
        editBtn.classList.add('edit-log-btn'); // Add class for styling
        editBtn.dataset.logId = entry.id;
        editBtn.addEventListener('click', () => openEditLogModal(entry.id)); // Use arrow function
        actionCell.appendChild(editBtn);

        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'מחק';
        deleteBtn.classList.add('delete-log-btn'); // Add class for styling
        deleteBtn.dataset.logId = entry.id;
        deleteBtn.addEventListener('click', () => { // Use arrow function
            if (confirm(`האם למחוק את התיעוד הזה (${entry.amount} כדורים)? הפעולה תוסיף את הכמות בחזרה למלאי.`)) {
                deleteLogEntry(entry.id);
            }
        });
        actionCell.appendChild(deleteBtn);
     });
}

function renderPlanPage() { /* ... same as before ... */ if (!planContent) { console.error("Plan page content area not found!"); return; } planContent.innerHTML = ''; if (!currentUser || !userData) { planContent.innerHTML = '<p class="text-center text-gray-500">יש להתחבר ולהגדיר נתונים תחילה.</p>'; return; } const planOverrides = userData.planOverrides || {}; const today = new Date(); const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()); const table = document.createElement('table'); table.id = 'plan-table'; table.classList.add('w-full', 'border-collapse'); const thead = table.createTHead(); const headerRow = thead.insertRow(); headerRow.innerHTML = `<th class="border p-2 text-right bg-slate-100 font-semibold">תאריך</th><th class="border p-2 text-right bg-slate-100 font-semibold">יום</th><th class="border p-2 text-center bg-slate-100 font-semibold">כמות מתוכננת</th>`; const tbody = table.createTBody(); for (let i = 0; i < CONFIG.PLAN_HORIZON_DAYS; i++) { const date = addDays(todayStart, i); const dateStr = dateToYYYYMMDD(date); const dayOfWeek = date.getDay(); const plannedAmount = getPlannedAmountForDate(dateStr, planOverrides); const row = tbody.insertRow(); if (dayOfWeek === 6) { row.classList.add('saturday-row'); } row.insertCell().textContent = formatDate(date); row.insertCell().textContent = formatDayOfWeek(date); const buttonCell = row.insertCell(); buttonCell.classList.add('text-center'); [0, 1, 2, 3].forEach(amount => { const btn = document.createElement('button'); btn.textContent = amount; btn.classList.add('plan-amount-btn'); btn.dataset.date = dateStr; btn.dataset.amount = amount; if (amount === plannedAmount) { btn.classList.add('selected'); } btn.addEventListener('click', handlePlanChange); buttonCell.appendChild(btn); }); } planContent.appendChild(table); }

// --- Handle Plan Change (Modify global `userData` and save) ---
function handlePlanChange(event) { /* ... same as before ... */ if (!currentUser || !userData) return; const button = event.target; const dateStr = button.dataset.date; const newAmount = parseInt(button.dataset.amount, 10); const defaultAmount = getDefaultPlannedAmount(parseDateString(dateStr)); userData.planOverrides = userData.planOverrides || {}; if (newAmount === defaultAmount) { delete userData.planOverrides[dateStr]; } else { userData.planOverrides[dateStr] = newAmount; } saveUserData(); renderPlanPage(); updateDisplay(); }

// --- Navigation ---
function showPage(pageId) { /* ... same as before ... */ if (!pages) { console.error("Pages not initialized"); return; } pages.forEach(page => { if (page) page.classList.toggle('active', page.id === pageId); }); if (pageId === 'page-history') { renderHistoryPage(); } if (pageId === 'page-plan') { renderPlanPage(); } window.scrollTo(0, 0); }

// --- Global function to update display ---
function updateDisplay() { renderDashboard(); }

// --- Event Listeners Setup ---
function setupEventListeners() {
    if (!loginBtn) { console.error("DOM elements not ready for event listeners. Retrying..."); setTimeout(setupEventListeners, 100); return; }
    console.log("Setting up event listeners...");
    // Authentication
    loginBtn.addEventListener('click', signInWithGoogle);
    logoutBtn.addEventListener('click', signOutUser);
    // Navigation
    gotoHistoryBtn.addEventListener('click', () => showPage('page-history'));
    gotoPlanBtn.addEventListener('click', () => showPage('page-plan'));
    backToDashboardFromHistory.addEventListener('click', () => showPage('page-dashboard'));
    backToDashboardFromPlan.addEventListener('click', () => showPage('page-dashboard'));
    // Initial Setup
    setupNowBtn.addEventListener('click', () => { /* ... */ purchaseModal.classList.add('active'); savePurchaseBtn.dataset.initialSetup = "true"; });
    // Record Purchase
    recordPurchaseBtn.addEventListener('click', () => { /* ... */ purchaseModal.classList.add('active'); delete savePurchaseBtn.dataset.initialSetup; });
    cancelPurchaseBtn.addEventListener('click', () => { purchaseModal.classList.remove('active'); delete savePurchaseBtn.dataset.initialSetup; });
    savePurchaseBtn.addEventListener('click', async () => { /* ... save purchase logic ... */ });
     // Log Consumption
     logButtons.forEach(button => { button.addEventListener('click', () => { addLogEntry(button.dataset.amount); }); });
     logOtherBtn.addEventListener('click', () => { logOtherAmountInput.value = ''; logOtherModal.classList.add('active'); });
     cancelLogOtherBtn.addEventListener('click', () => logOtherModal.classList.remove('active'));
     saveLogOtherBtn.addEventListener('click', () => { addLogEntry(logOtherAmountInput.value); logOtherModal.classList.remove('active'); });
     // Adjust Count
     adjustCountBtn.addEventListener('click', () => { adjustPillsCountInput.value = userData ? userData.currentPillCount : 0; adjustModal.classList.add('active'); });
     cancelAdjustBtn.addEventListener('click', () => adjustModal.classList.remove('active'));
     saveAdjustBtn.addEventListener('click', () => { adjustCount(adjustPillsCountInput.value); adjustModal.classList.remove('active'); });
     // Edit Log Modal Buttons
     saveEditLogBtn.addEventListener('click', handleSaveEditLog);
     cancelEditLogBtn.addEventListener('click', () => { if (editLogModal) editLogModal.classList.remove('active'); });
    // Reset Data
     resetDataBtn.addEventListener('click', async () => { /* ... reset logic ... */ });
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded.");
    initializeDOMElements();
    initializeFirebase(); // Triggers auth check and initial data load/display
    setupEventListeners();
    showPage('page-dashboard'); // Ensure dashboard is the default view structure
});
