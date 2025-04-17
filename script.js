{\rtf1\ansi\ansicpg1252\cocoartf2821
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww15040\viewh9000\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs26 \cf0 // --- Import Firebase Modules ---\
// Using the URLs provided by Firebase setup for direct browser import\
import \{ initializeApp \} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";\
import \{\
    getAuth,\
    onAuthStateChanged,\
    GoogleAuthProvider,\
    signInWithPopup,\
    signOut\
\} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";\
import \{\
    getFirestore,\
    collection,\
    doc,\
    getDoc,\
    setDoc,\
    deleteDoc\
\} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";\
\
\
// --- Firebase Configuration ---\
// \uc0\u1492 -Config \u1513 \u1500 \u1498  \u1502 -Firebase \u1492 \u1493 \u1499 \u1504 \u1505  \u1499 \u1488 \u1503 :\
const firebaseConfig = \{\
  apiKey: "AIzaSyA2JO3N9evEeaKU2vuW5T2oV9uEXLrOrEM",\
  authDomain: "pill-tracker-a94fd.firebaseapp.com",\
  projectId: "pill-tracker-a94fd",\
  storageBucket: "pill-tracker-a94fd.firebasestorage.app",\
  messagingSenderId: "1032904632163",\
  appId: "1:1032904632163:web:c02180c9e32180a3545556",\
  measurementId: "G-TRE85BD46K" // Not currently used, but included\
\};\
\
// --- App Configuration ---\
const CONFIG = \{\
    ESTIMATED_DAILY_DOSAGE: 2, // Fallback/Default for estimation if needed\
    DEFAULT_WEEKDAY_DOSAGE: 2, // Default plan for weekdays\
    DEFAULT_SATURDAY_DOSAGE: 1, // Default plan for Saturdays\
    PLAN_HORIZON_DAYS: 30, // How many days to show in the plan\
    WAITING_PERIOD_DAYS: 30,\
    FIRESTORE_COLLECTION: 'userPillData' // Collection name in Firestore\
\};\
\
// --- Global Variables ---\
let firebaseApp;\
let auth; // Firebase Auth instance\
let db; // Firestore instance\
let currentUser = null; // To store the logged-in user object\
let userData = null; // To store the loaded data for the current user\
\
// --- DOM Elements ---\
// (Declare variables - will be assigned in initializeDOMElements)\
let pages, modals, dashboardPage, historyPage, planPage,\
    initialSetup, dashboardView, setupNowBtn, currentPillsEl, adjustCountBtn,\
    nextPurchaseDateEl, daysUntilPurchaseEl, daysRemainingEl, estimatedEndDateEl,\
    lastPurchaseInfoEl, recordPurchaseBtn, resetDataBtn, lastLogTimeEl, logButtons,\
    logOtherBtn, gotoHistoryBtn, gotoPlanBtn, backToDashboardFromHistory,\
    backToDashboardFromPlan, historyTableBody, historyContent, planContent,\
    purchaseModal, purchaseModalTitle, purchaseDateInput, pillsAddedInput,\
    initialCountSection, initialPillsCountInput, savePurchaseBtn, cancelPurchaseBtn,\
    adjustModal, adjustPillsCountInput, saveAdjustBtn, cancelAdjustBtn,\
    logOtherModal, logOtherAmountInput, saveLogOtherBtn, cancelLogOtherBtn,\
    authContainer, loginView, userInfo, loginBtn, logoutBtn, userNameEl,\
    appContainer, loadingIndicator;\
\
\
// Function to initialize DOM element variables\
function initializeDOMElements() \{\
    // Assign all element variables (same as previous version)\
    pages = document.querySelectorAll('.page');\
    modals = document.querySelectorAll('.modal');\
    dashboardPage = document.getElementById('page-dashboard');\
    historyPage = document.getElementById('page-history');\
    planPage = document.getElementById('page-plan');\
    initialSetup = document.getElementById('initial-setup');\
    dashboardView = document.getElementById('dashboard-view');\
    setupNowBtn = document.getElementById('setup-now-btn');\
    currentPillsEl = document.getElementById('current-pills');\
    adjustCountBtn = document.getElementById('adjust-count-btn');\
    nextPurchaseDateEl = document.getElementById('next-purchase-date');\
    daysUntilPurchaseEl = document.getElementById('days-until-purchase');\
    daysRemainingEl = document.getElementById('days-remaining');\
    estimatedEndDateEl = document.getElementById('estimated-end-date');\
    lastPurchaseInfoEl = document.getElementById('last-purchase-info');\
    recordPurchaseBtn = document.getElementById('record-purchase-btn');\
    resetDataBtn = document.getElementById('reset-data-btn');\
    lastLogTimeEl = document.getElementById('last-log-time');\
    logButtons = document.querySelectorAll('.log-button');\
    logOtherBtn = document.getElementById('log-other-btn');\
    gotoHistoryBtn = document.getElementById('goto-history-btn');\
    gotoPlanBtn = document.getElementById('goto-plan-btn');\
    backToDashboardFromHistory = document.getElementById('back-to-dashboard-from-history');\
    backToDashboardFromPlan = document.getElementById('back-to-dashboard-from-plan');\
    historyTableBody = document.getElementById('history-table-body');\
    historyContent = document.getElementById('history-content');\
    planContent = document.getElementById('plan-content');\
    purchaseModal = document.getElementById('purchase-modal');\
    purchaseModalTitle = document.getElementById('purchase-modal-title');\
    purchaseDateInput = document.getElementById('purchase-date');\
    pillsAddedInput = document.getElementById('pills-added');\
    initialCountSection = document.getElementById('initial-count-section');\
    initialPillsCountInput = document.getElementById('initial-pills-count');\
    savePurchaseBtn = document.getElementById('save-purchase-btn');\
    cancelPurchaseBtn = document.getElementById('cancel-purchase-btn');\
    adjustModal = document.getElementById('adjust-modal');\
    adjustPillsCountInput = document.getElementById('adjust-pills-count');\
    saveAdjustBtn = document.getElementById('save-adjust-btn');\
    cancelAdjustBtn = document.getElementById('cancel-adjust-btn');\
    logOtherModal = document.getElementById('log-other-modal');\
    logOtherAmountInput = document.getElementById('log-other-amount');\
    saveLogOtherBtn = document.getElementById('save-log-other-btn');\
    cancelLogOtherBtn = document.getElementById('cancel-log-other-btn');\
    // Auth elements\
    authContainer = document.getElementById('auth-container');\
    loginView = document.getElementById('login-view');\
    userInfo = document.getElementById('user-info');\
    loginBtn = document.getElementById('login-btn');\
    logoutBtn = document.getElementById('logout-btn');\
    userNameEl = document.getElementById('user-name');\
    appContainer = document.getElementById('app-container');\
    loadingIndicator = document.getElementById('loading-indicator');\
\
\}\
\
\
// --- Utility Functions ---\
// (Unchanged from previous version)\
function getTodayDateString() \{ const today = new Date(); const offset = today.getTimezoneOffset(); const localToday = new Date(today.getTime() - (offset*60*1000)); return localToday.toISOString().split('T')[0]; \}\
function parseDateString(dateString) \{ if (!dateString) return null; const [year, month, day] = dateString.split('-').map(Number); return new Date(year, month - 1, day); \}\
function formatDate(date) \{ if (!date) return '-'; const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `$\{day\}/$\{month\}/$\{year\}`; \}\
function formatDayOfWeek(date) \{ if (!date) return ''; return date.toLocaleDateString('he-IL', \{ weekday: 'short' \}); \}\
function formatTime(date) \{ if (!date) return ''; return date.toLocaleTimeString('he-IL', \{ hour: '2-digit', minute: '2-digit' \}); \}\
function formatDateTime(date) \{ if (!date) return '-'; return `$\{formatDate(date)\} $\{formatTime(date)\}`; \}\
function addDays(date, days) \{ const result = new Date(date); result.setDate(result.getDate() + days); return result; \}\
function diffInDays(date1, date2) \{ if (!date1 || !date2) return 0; const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()); const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()); const diffTime = d2 - d1; return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); \}\
function generateUniqueId() \{ return `id_$\{Date.now()\}_$\{Math.random().toString(36).substr(2, 5)\}`; \}\
function dateToYYYYMMDD(date) \{ if (!date) return null; const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); return `$\{year\}-$\{month\}-$\{day\}`; \}\
\
// --- Firebase Initialization and Auth (Modular Syntax) ---\
function initializeFirebase() \{\
    try \{\
        // ** Initialize Firebase using the config object **\
        firebaseApp = initializeApp(firebaseConfig);\
        console.log("Firebase Initialized (Modular)");\
\
        // ** Get Auth and Firestore services (Modular syntax) **\
        auth = getAuth(firebaseApp);\
        db = getFirestore(firebaseApp);\
\
        // ** Listen for authentication state changes **\
        onAuthStateChanged(auth, handleAuthStateChange);\
\
    \} catch (error) \{\
        console.error("Error initializing Firebase:", error);\
        if (firebaseConfig.apiKey === "YOUR_API_KEY") \{ // Basic check if config wasn't replaced\
             alert("\uc0\u1513 \u1490 \u1497 \u1488 \u1492 : \u1508 \u1512 \u1496 \u1497  \u1492 \u1514 \u1510 \u1493 \u1512 \u1492  \u1513 \u1500  Firebase \u1495 \u1505 \u1512 \u1497 \u1501  \u1488 \u1493  \u1500 \u1488  \u1492 \u1493 \u1495 \u1500 \u1508 \u1493  \u1489 \u1511 \u1493 \u1489 \u1509  script.js!");\
        \} else \{\
             alert("\uc0\u1513 \u1490 \u1497 \u1488 \u1492  \u1489 \u1488 \u1514 \u1495 \u1493 \u1500  \u1492 \u1495 \u1497 \u1489 \u1493 \u1512  \u1500 \u1513 \u1497 \u1512 \u1493 \u1514  \u1492 \u1506 \u1504 \u1503 . \u1489 \u1491 \u1493 \u1511  \u1488 \u1514  \u1508 \u1512 \u1496 \u1497  \u1492 \u1514 \u1510 \u1493 \u1512 \u1492  \u1489 \u1511 \u1493 \u1491  \u1493 \u1488 \u1514  \u1492 \u1495 \u1497 \u1489 \u1493 \u1512  \u1500 \u1488 \u1497 \u1504 \u1496 \u1512 \u1504 \u1496 .");\
        \}\
        if (appContainer) appContainer.style.display = 'none';\
        if (authContainer) authContainer.style.display = 'none';\
    \}\
\}\
\
// Handle user login/logout and trigger data loading\
async function handleAuthStateChange(user) \{\
    currentUser = user; // Store globally\
    if (user) \{\
        // User is signed in\
        console.log("User signed in:", user.uid, user.displayName);\
        if (userNameEl) userNameEl.textContent = `\uc0\u1513 \u1500 \u1493 \u1501 , $\{user.displayName || '\u1502 \u1513 \u1514 \u1502 \u1513 '\}`;\
        if (loginView) loginView.style.display = 'none';\
        if (userInfo) userInfo.style.display = 'flex';\
        if (appContainer) appContainer.style.display = 'block'; // Show the main app container\
        if (loadingIndicator) loadingIndicator.style.display = 'block'; // Show loading indicator\
        if (dashboardView) dashboardView.style.display = 'none'; // Hide parts until data loads\
        if (initialSetup) initialSetup.style.display = 'none';\
\
        await loadUserData(); // Load data for the logged-in user\
        updateDisplay(); // Render UI based on loaded data\
        if (loadingIndicator) loadingIndicator.style.display = 'none'; // Hide loading indicator\
\
    \} else \{\
        // User is signed out\
        console.log("User signed out");\
        userData = null; // Clear data\
        if (userNameEl) userNameEl.textContent = '';\
        if (loginView) loginView.style.display = 'block'; // Show login button\
        if (userInfo) userInfo.style.display = 'none';\
        if (appContainer) appContainer.style.display = 'none'; // Hide the main app container\
        if (loadingIndicator) loadingIndicator.style.display = 'none';\
        showPage('page-dashboard'); // Reset view\
    \}\
\}\
\
// Sign in with Google Popup (Modular Syntax)\
async function signInWithGoogle() \{\
    const provider = new GoogleAuthProvider(); // Use imported provider\
    try \{\
        console.log("Attempting Google Sign-in...");\
        await signInWithPopup(auth, provider); // Use imported function and auth instance\
        console.log("Sign-in popup closed.");\
    \} catch (error) \{\
        console.error("Error signing in with Google:", error);\
        alert(`\uc0\u1513 \u1490 \u1497 \u1488 \u1492  \u1489 \u1492 \u1514 \u1495 \u1489 \u1512 \u1493 \u1514 : $\{error.message\} (\u1511 \u1493 \u1491 : $\{error.code\})`);\
    \}\
\}\
\
// Sign out (Modular Syntax)\
async function signOutUser() \{\
    try \{\
        await signOut(auth); // Use imported function and auth instance\
        console.log("Sign out successful.");\
    \} catch (error) \{\
        console.error("Error signing out:", error);\
        alert(`\uc0\u1513 \u1490 \u1497 \u1488 \u1492  \u1489 \u1492 \u1514 \u1504 \u1514 \u1511 \u1493 \u1514 : $\{error.message\}`);\
    \}\
\}\
\
// --- Firestore Data Functions (Modular Syntax) ---\
\
// Get user data document reference (Modular syntax)\
function getUserDocRef() \{\
    if (!currentUser) return null;\
    // Use doc(db, collectionName, documentId)\
    return doc(db, CONFIG.FIRESTORE_COLLECTION, currentUser.uid);\
\}\
\
// Load data from Firestore for the current user (Modular syntax)\
async function loadUserData() \{\
    const docRef = getUserDocRef();\
    if (!docRef) \{ userData = null; return; \}\
    console.log("Loading data for user:", currentUser.uid);\
    try \{\
        // Use getDoc(docRef)\
        const docSnap = await getDoc(docRef);\
        if (docSnap.exists()) \{\
            userData = docSnap.data();\
            userData.consumptionLog = userData.consumptionLog || [];\
            userData.planOverrides = userData.planOverrides || \{\};\
            console.log("Data loaded successfully:", userData);\
        \} else \{\
            console.log("No data found for user, needs initial setup.");\
            userData = null;\
        \}\
    \} catch (error) \{\
        console.error("Error loading user data:", error);\
        alert("\uc0\u1513 \u1490 \u1497 \u1488 \u1492  \u1489 \u1496 \u1506 \u1497 \u1504 \u1514  \u1492 \u1504 \u1514 \u1493 \u1504 \u1497 \u1501  \u1502 \u1492 \u1506 \u1504 \u1503 .");\
        userData = null;\
    \}\
\}\
\
// Save the current global `userData` object to Firestore (Modular syntax)\
async function saveUserData() \{\
    const docRef = getUserDocRef();\
    if (!docRef || !userData) \{\
         console.error("Cannot save data: User not logged in or no local data.");\
         if (!userData && currentUser) \{ console.log("Save prevented: Initial setup likely not completed."); \}\
         return;\
    \}\
     const dataToSave = \{ /* ... create dataToSave object (same as before) ... */\
        lastPurchaseDate: userData.lastPurchaseDate || null,\
        currentPillCount: typeof userData.currentPillCount === 'number' ? userData.currentPillCount : 0,\
        waitingPeriod: userData.waitingPeriod || CONFIG.WAITING_PERIOD_DAYS,\
        consumptionLog: userData.consumptionLog || [],\
        planOverrides: userData.planOverrides || \{\},\
        lastLogTimestamp: userData.lastLogTimestamp || new Date().toISOString()\
     \};\
     if (dataToSave.currentPillCount < 0) \{ dataToSave.currentPillCount = 0; \}\
     dataToSave.consumptionLog.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));\
\
    console.log("Saving data for user:", currentUser.uid, dataToSave);\
    try \{\
        // Use setDoc(docRef, data) - overwrites the document\
        await setDoc(docRef, dataToSave);\
        console.log("Data saved successfully.");\
    \} catch (error) \{\
        console.error("Error saving user data:", error);\
        alert("\uc0\u1513 \u1490 \u1497 \u1488 \u1492  \u1489 \u1513 \u1502 \u1497 \u1512 \u1514  \u1492 \u1504 \u1514 \u1493 \u1504 \u1497 \u1501  \u1500 \u1506 \u1504 \u1503 .");\
    \}\
\}\
\
// Delete user data document from Firestore (Modular syntax)\
async function deleteUserData() \{\
     const docRef = getUserDocRef();\
     if (!docRef) \{ return false; \}\
     console.log("Deleting data for user:", currentUser.uid);\
     try \{\
         // Use deleteDoc(docRef)\
         await deleteDoc(docRef);\
         console.log("User data deleted successfully.");\
         userData = null; // Clear local cache\
         return true;\
     \} catch (error) \{\
         console.error("Error deleting user data:", error);\
         alert("\uc0\u1513 \u1490 \u1497 \u1488 \u1492  \u1489 \u1502 \u1495 \u1497 \u1511 \u1514  \u1492 \u1504 \u1514 \u1493 \u1504 \u1497 \u1501  \u1502 \u1492 \u1506 \u1504 \u1503 .");\
         return false;\
     \}\
\}\
\
\
// --- Core Logic Functions (Calculations - Unchanged) ---\
function calculateEstimatedDaysRemainingFromPlan(currentPills, planOverrides) \{ if (currentPills <= 0) return \{ days: 0, endDate: null \}; let pillsLeft = currentPills; let daysCount = 0; let currentDate = new Date(); while (pillsLeft > 0) \{ const currentDateStr = dateToYYYYMMDD(currentDate); const plannedAmount = getPlannedAmountForDate(currentDateStr, planOverrides); if (plannedAmount <= 0 && daysCount > CONFIG.PLAN_HORIZON_DAYS * 2) \{ if (pillsLeft >= currentPills) return \{ days: Infinity, endDate: null \}; \} if (pillsLeft >= plannedAmount) \{ pillsLeft -= plannedAmount; daysCount++; currentDate = addDays(currentDate, 1); \} else \{ if (pillsLeft > 0) \{ daysCount++; \} pillsLeft = 0; \} if (daysCount > 365 * 5) \{ console.error("Calculation stopped: Exceeded 5 years forecast."); return \{ days: -1, endDate: null \}; \} \} const estimatedEndDate = addDays(currentDate, -1); return \{ days: daysCount, endDate: estimatedEndDate \}; \}\
function calculateNextPurchaseDate(lastPurchaseDateStr) \{ const lastPurchaseDate = parseDateString(lastPurchaseDateStr); if (!lastPurchaseDate) return null; return addDays(lastPurchaseDate, CONFIG.WAITING_PERIOD_DAYS); \}\
function getDefaultPlannedAmount(date) \{ const dayOfWeek = date.getDay(); return (dayOfWeek === 6) ? CONFIG.DEFAULT_SATURDAY_DOSAGE : CONFIG.DEFAULT_WEEKDAY_DOSAGE; \}\
function getPlannedAmountForDate(dateStr, planOverrides) \{ const date = parseDateString(dateStr); const defaultAmount = getDefaultPlannedAmount(date); return (planOverrides && typeof planOverrides[dateStr] === 'number') ? planOverrides[dateStr] : defaultAmount; \}\
\
\
// --- Logging, Adjustment, Deletion (Modify global `userData` and save) ---\
function addLogEntry(amount) \{\
    if (!currentUser || !userData) \{ alert("\uc0\u1497 \u1513  \u1500 \u1492 \u1514 \u1495 \u1489 \u1512  \u1493 \u1500 \u1492 \u1490 \u1491 \u1497 \u1512  \u1504 \u1514 \u1493 \u1504 \u1497 \u1501  \u1514 \u1495 \u1497 \u1500 \u1492 ."); return; \}\
    const countTaken = parseInt(amount, 10);\
    if (isNaN(countTaken) || countTaken < 0) \{ alert("\uc0\u1499 \u1502 \u1493 \u1514  \u1500 \u1488  \u1495 \u1493 \u1511 \u1497 \u1514 ."); return; \}\
    const newLogEntry = \{ id: generateUniqueId(), timestamp: new Date().toISOString(), amount: countTaken \};\
    userData.consumptionLog = userData.consumptionLog || [];\
    userData.consumptionLog.push(newLogEntry);\
    userData.currentPillCount = Math.max(0, userData.currentPillCount - countTaken);\
    userData.lastLogTimestamp = newLogEntry.timestamp;\
    saveUserData(); // Save to Firestore\
    updateDisplay();\
    if (lastLogTimeEl) \{ /* ... feedback ... */ lastLogTimeEl.textContent = `\uc0\u1514 \u1493 \u1506 \u1491  $\{countTaken\} \u1499 \u1491 \u1493 \u1512 (\u1497 \u1501 ) \u1489 -$\{formatTime(new Date(newLogEntry.timestamp))\}`; lastLogTimeEl.classList.add('!text-green-600'); setTimeout(() => \{ if(lastLogTimeEl) lastLogTimeEl.classList.remove('!text-green-600'); \}, 3000); \}\
\}\
\
function deleteLogEntry(logId) \{\
     if (!currentUser || !userData || !userData.consumptionLog) return;\
     const entryIndex = userData.consumptionLog.findIndex(entry => entry.id === logId);\
     if (entryIndex === -1) \{ console.warn("Log entry not found:", logId); return; \}\
     const entryToDelete = userData.consumptionLog[entryIndex];\
     const amountToRestore = entryToDelete.amount;\
     userData.consumptionLog.splice(entryIndex, 1);\
     userData.currentPillCount += amountToRestore;\
     saveUserData(); // Save to Firestore\
     updateDisplay();\
     renderHistoryPage();\
\}\
\
function adjustCount(newCount) \{\
     if (!currentUser || !userData) \{ alert("\uc0\u1497 \u1513  \u1500 \u1492 \u1514 \u1495 \u1489 \u1512  \u1493 \u1500 \u1492 \u1490 \u1491 \u1497 \u1512  \u1504 \u1514 \u1493 \u1504 \u1497 \u1501  \u1514 \u1495 \u1497 \u1500 \u1492 ."); return; \}\
     const count = parseInt(newCount, 10);\
     if (isNaN(count) || count < 0) \{ alert("\uc0\u1499 \u1502 \u1493 \u1514  \u1500 \u1488  \u1495 \u1493 \u1511 \u1497 \u1514 ."); return; \}\
     userData.currentPillCount = count;\
     userData.lastLogTimestamp = new Date().toISOString();\
     saveUserData(); // Save to Firestore\
     updateDisplay();\
\}\
\
// --- Page Rendering (Use global `userData`) ---\
function renderDashboard() \{\
     console.log("Rendering dashboard. Current user data:", userData);\
     if (!currentUser) \{ if(dashboardView) dashboardView.style.display = 'none'; if(initialSetup) initialSetup.style.display = 'none'; return; \}\
     if (!userData) \{ if(dashboardView) dashboardView.style.display = 'none'; if(initialSetup) initialSetup.style.display = 'block'; return; \}\
     if(initialSetup) initialSetup.style.display = 'none';\
     if(dashboardView) dashboardView.style.display = 'block';\
     if (!currentPillsEl /* ... etc ... */) \{ console.error("Dashboard elements missing!"); return; \}\
     const currentPills = userData.currentPillCount;\
     const lastPurchaseDate = parseDateString(userData.lastPurchaseDate);\
     const nextPurchaseDate = calculateNextPurchaseDate(userData.lastPurchaseDate);\
     const today = new Date(); const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());\
     currentPillsEl.textContent = currentPills;\
     nextPurchaseDateEl.textContent = formatDate(nextPurchaseDate);\
     if (nextPurchaseDate) \{ const daysToPurchase = diffInDays(todayStart, nextPurchaseDate); if (daysToPurchase <= 0) \{ daysUntilPurchaseEl.textContent = '(\uc0\u1492 \u1490 \u1497 \u1506  \u1492 \u1494 \u1502 \u1503  \u1500 \u1512 \u1499 \u1493 \u1513 !)'; nextPurchaseDateEl.parentElement.classList.add('!bg-yellow-100', 'border', 'border-yellow-300'); nextPurchaseDateEl.classList.add('!text-orange-600'); \} else \{ daysUntilPurchaseEl.textContent = `(\u1489 \u1506 \u1493 \u1491  $\{daysToPurchase\} \u1497 \u1502 \u1497 \u1501 )`; nextPurchaseDateEl.parentElement.classList.remove('!bg-yellow-100', 'border', 'border-yellow-300'); nextPurchaseDateEl.classList.remove('!text-orange-600'); \} \} else \{ daysUntilPurchaseEl.textContent = ''; \}\
     const remainingEstimate = calculateEstimatedDaysRemainingFromPlan(currentPills, userData.planOverrides);\
     daysRemainingEl.textContent = `$\{remainingEstimate.days === Infinity ? '\uc0\u8734 ' : remainingEstimate.days\} \u1497 \u1502 \u1497 \u1501 `;\
     estimatedEndDateEl.textContent = remainingEstimate.endDate ? `(\uc0\u1506 \u1491  $\{formatDate(remainingEstimate.endDate)\})` : '(\u1499 \u1489 \u1512  \u1488 \u1494 \u1500 )';\
     lastPurchaseInfoEl.textContent = `\uc0\u1514 \u1488 \u1512 \u1497 \u1498 : $\{formatDate(lastPurchaseDate)\}`;\
     if (userData.lastLogTimestamp) \{ const logDate = new Date(userData.lastLogTimestamp); lastLogTimeEl.textContent = `\uc0\u1506 \u1493 \u1491 \u1499 \u1503  \u1500 \u1488 \u1495 \u1512 \u1493 \u1504 \u1492 : $\{formatDateTime(logDate)\}`; \} else \{ lastLogTimeEl.textContent = ''; \}\
     if (remainingEstimate.days <= 3 && remainingEstimate.days !== Infinity) \{ currentPillsEl.parentElement.classList.add('!bg-red-100', 'border', 'border-red-300'); currentPillsEl.classList.add('!text-red-600'); \} else \{ currentPillsEl.parentElement.classList.remove('!bg-red-100', 'border', 'border-red-300'); currentPillsEl.classList.remove('!text-red-600'); \}\
\}\
\
function renderHistoryPage() \{\
    // ... (renderHistoryPage logic - uses global userData) ...\
    if (!historyContent) \{ console.error("History page content area not found!"); return; \}\
    let historyTableBody = document.getElementById('history-table-body');\
    if (!historyTableBody) \{ historyContent.innerHTML = `<table id="history-table" class="w-full border-collapse mt-4"><thead><tr><th class="border p-2 text-right bg-gray-100 font-semibold">\uc0\u1514 \u1488 \u1512 \u1497 \u1498  \u1493 \u1513 \u1506 \u1492 </th><th class="border p-2 text-right bg-gray-100 font-semibold">\u1499 \u1502 \u1493 \u1514  \u1513 \u1504 \u1500 \u1511 \u1495 \u1492 </th><th class="border p-2 text-center bg-gray-100 font-semibold">\u1508 \u1506 \u1493 \u1500 \u1492 </th></tr></thead><tbody id="history-table-body"></tbody></table>`; historyTableBody = document.getElementById('history-table-body'); \} else \{ historyTableBody.innerHTML = ''; \}\
    if (!currentUser || !userData || !userData.consumptionLog || userData.consumptionLog.length === 0) \{ const messageRow = historyTableBody.insertRow(); const cell = messageRow.insertCell(); cell.colSpan = 3; cell.textContent = '\uc0\u1488 \u1497 \u1503  \u1492 \u1497 \u1505 \u1496 \u1493 \u1512 \u1497 \u1497 \u1514  \u1510 \u1512 \u1497 \u1499 \u1492  \u1500 \u1514 \u1510 \u1493 \u1490 \u1492 .'; cell.classList.add('text-center', 'text-gray-500', 'p-4'); return; \}\
    const sortedLog = [...userData.consumptionLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));\
    sortedLog.forEach(entry => \{ const row = historyTableBody.insertRow(); const timestamp = new Date(entry.timestamp); row.insertCell().textContent = formatDateTime(timestamp); row.insertCell().textContent = entry.amount; const actionCell = row.insertCell(); const deleteBtn = document.createElement('button'); deleteBtn.textContent = '\uc0\u1502 \u1495 \u1511 '; deleteBtn.classList.add('delete-log-btn', 'bg-red-100', 'text-red-700', 'hover:bg-red-200', 'px-2', 'py-1', 'rounded', 'text-xs', 'border', 'border-red-200'); deleteBtn.dataset.logId = entry.id; deleteBtn.addEventListener('click', (event) => \{ const idToDelete = event.target.dataset.logId; if (confirm(`\u1492 \u1488 \u1501  \u1500 \u1502 \u1495 \u1493 \u1511  \u1488 \u1514  \u1492 \u1514 \u1497 \u1506 \u1493 \u1491  \u1492 \u1494 \u1492  ($\{entry.amount\} \u1499 \u1491 \u1493 \u1512 \u1497 \u1501 )? \u1492 \u1508 \u1506 \u1493 \u1500 \u1492  \u1514 \u1493 \u1505 \u1497 \u1507  \u1488 \u1514  \u1492 \u1499 \u1502 \u1493 \u1514  \u1489 \u1495 \u1494 \u1512 \u1492  \u1500 \u1502 \u1500 \u1488 \u1497 .`)) \{ deleteLogEntry(idToDelete); \} \}); actionCell.appendChild(deleteBtn); \});\
\}\
\
function renderPlanPage() \{\
    // ... (renderPlanPage logic - uses global userData) ...\
     if (!planContent) \{ console.error("Plan page content area not found!"); return; \}\
    planContent.innerHTML = '';\
    if (!currentUser || !userData) \{ planContent.innerHTML = '<p class="text-center text-gray-500">\uc0\u1497 \u1513  \u1500 \u1492 \u1514 \u1495 \u1489 \u1512  \u1493 \u1500 \u1492 \u1490 \u1491 \u1497 \u1512  \u1504 \u1514 \u1493 \u1504 \u1497 \u1501  \u1514 \u1495 \u1497 \u1500 \u1492 .</p>'; return; \}\
    const planOverrides = userData.planOverrides || \{\};\
    const today = new Date(); const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());\
    const table = document.createElement('table'); table.id = 'plan-table'; table.classList.add('w-full', 'border-collapse'); const thead = table.createTHead(); const headerRow = thead.insertRow(); headerRow.innerHTML = `<th class="border p-2 text-right bg-gray-100 font-semibold">\uc0\u1514 \u1488 \u1512 \u1497 \u1498 </th><th class="border p-2 text-right bg-gray-100 font-semibold">\u1497 \u1493 \u1501 </th><th class="border p-2 text-center bg-gray-100 font-semibold">\u1499 \u1502 \u1493 \u1514  \u1502 \u1514 \u1493 \u1499 \u1504 \u1504 \u1514 </th>`; const tbody = table.createTBody();\
    for (let i = 0; i < CONFIG.PLAN_HORIZON_DAYS; i++) \{ const date = addDays(todayStart, i); const dateStr = dateToYYYYMMDD(date); const dayOfWeek = date.getDay(); const plannedAmount = getPlannedAmountForDate(dateStr, planOverrides); const row = tbody.insertRow(); if (dayOfWeek === 6) \{ row.classList.add('saturday-row'); \} row.insertCell().textContent = formatDate(date); row.insertCell().textContent = formatDayOfWeek(date); const buttonCell = row.insertCell(); buttonCell.classList.add('text-center'); [0, 1, 2, 3].forEach(amount => \{ const btn = document.createElement('button'); btn.textContent = amount; btn.classList.add('plan-amount-btn'); btn.dataset.date = dateStr; btn.dataset.amount = amount; if (amount === plannedAmount) \{ btn.classList.add('selected'); \} btn.addEventListener('click', handlePlanChange); buttonCell.appendChild(btn); \}); \}\
    planContent.appendChild(table);\
\}\
\
// --- Handle Plan Change (Modify global `userData` and save) ---\
function handlePlanChange(event) \{\
    if (!currentUser || !userData) return;\
    const button = event.target;\
    const dateStr = button.dataset.date;\
    const newAmount = parseInt(button.dataset.amount, 10);\
    const defaultAmount = getDefaultPlannedAmount(parseDateString(dateStr));\
    userData.planOverrides = userData.planOverrides || \{\};\
    if (newAmount === defaultAmount) \{ delete userData.planOverrides[dateStr]; \} else \{ userData.planOverrides[dateStr] = newAmount; \}\
    saveUserData(); // Save changes to Firestore\
    renderPlanPage();\
    updateDisplay();\
\}\
\
\
// --- Navigation ---\
function showPage(pageId) \{\
    if (!pages) \{ console.error("Pages not initialized"); return; \}\
    pages.forEach(page => \{ if (page) page.classList.toggle('active', page.id === pageId); \});\
    if (pageId === 'page-history') \{ renderHistoryPage(); \}\
    if (pageId === 'page-plan') \{ renderPlanPage(); \}\
    window.scrollTo(0, 0);\
\}\
\
// --- Global function to update display ---\
function updateDisplay() \{\
     renderDashboard();\
\}\
\
// --- Event Listeners Setup ---\
function setupEventListeners() \{\
    // Add checks to ensure elements exist before adding listeners\
    if (!loginBtn || !logoutBtn || !setupNowBtn || !recordPurchaseBtn || !savePurchaseBtn || !cancelPurchaseBtn || !adjustCountBtn || !saveAdjustBtn || !cancelAdjustBtn || !logOtherBtn || !saveLogOtherBtn || !cancelLogOtherBtn || !resetDataBtn || !gotoHistoryBtn || !gotoPlanBtn || !backToDashboardFromHistory || !backToDashboardFromPlan || !logButtons) \{\
         console.error("One or more essential buttons/elements not found. Listeners not fully set up.");\
         // Retry after a short delay if DOM isn't ready yet? Or just log error.\
         // setTimeout(setupEventListeners, 100); // Be careful with retries\
         return;\
    \}\
    console.log("Setting up event listeners...");\
    // Authentication\
    loginBtn.addEventListener('click', signInWithGoogle);\
    logoutBtn.addEventListener('click', signOutUser); // Use renamed function\
    // Navigation\
    gotoHistoryBtn.addEventListener('click', () => showPage('page-history'));\
    gotoPlanBtn.addEventListener('click', () => showPage('page-plan'));\
    backToDashboardFromHistory.addEventListener('click', () => showPage('page-dashboard'));\
    backToDashboardFromPlan.addEventListener('click', () => showPage('page-dashboard'));\
    // Initial Setup\
    setupNowBtn.addEventListener('click', () => \{ purchaseModalTitle.textContent = "\uc0\u1492 \u1490 \u1491 \u1512 \u1492  \u1512 \u1488 \u1513 \u1493 \u1504 \u1497 \u1514 "; purchaseDateInput.value = getTodayDateString(); pillsAddedInput.value = ''; initialPillsCountInput.value = ''; initialCountSection.style.display = 'block'; purchaseModal.classList.add('active'); savePurchaseBtn.dataset.initialSetup = "true"; \});\
    // Record Purchase\
    recordPurchaseBtn.addEventListener('click', () => \{ purchaseModalTitle.textContent = "\uc0\u1514 \u1497 \u1506 \u1493 \u1491  \u1512 \u1499 \u1497 \u1513 \u1492  \u1495 \u1491 \u1513 \u1492 "; purchaseDateInput.value = getTodayDateString(); pillsAddedInput.value = ''; initialCountSection.style.display = 'none'; purchaseModal.classList.add('active'); delete savePurchaseBtn.dataset.initialSetup; \});\
    cancelPurchaseBtn.addEventListener('click', () => \{ purchaseModal.classList.remove('active'); delete savePurchaseBtn.dataset.initialSetup; \});\
    savePurchaseBtn.addEventListener('click', async () => \{ // Save Purchase Logic (Initial or Regular)\
        if (!currentUser) \{ alert("\uc0\u1497 \u1513  \u1500 \u1492 \u1514 \u1495 \u1489 \u1512  \u1514 \u1495 \u1497 \u1500 \u1492 ."); return; \}\
        const purchaseDateStr = purchaseDateInput.value;\
        const pillsAdded = parseInt(pillsAddedInput.value, 10);\
        const isInitialSetup = savePurchaseBtn.dataset.initialSetup === "true";\
        if (!purchaseDateStr || isNaN(pillsAdded) || pillsAdded <= 0) \{ alert('\uc0\u1488 \u1504 \u1488  \u1492 \u1494 \u1503  \u1514 \u1488 \u1512 \u1497 \u1498  \u1493 \u1499 \u1502 \u1493 \u1514  \u1499 \u1491 \u1493 \u1512 \u1497 \u1501  \u1495 \u1497 \u1493 \u1489 \u1497 \u1514  \u1513 \u1504 \u1493 \u1505 \u1508 \u1493 .'); return; \}\
        if (isInitialSetup) \{\
            const initialCount = parseInt(initialPillsCountInput.value, 10);\
            if (isNaN(initialCount) || initialCount < 0) \{ alert('\uc0\u1488 \u1504 \u1488  \u1492 \u1494 \u1503  \u1488 \u1514  \u1492 \u1499 \u1502 \u1493 \u1514  \u1492 \u1504 \u1493 \u1499 \u1495 \u1497 \u1514  \u1492 \u1499 \u1493 \u1500 \u1500 \u1514  \u1500 \u1488 \u1495 \u1512  \u1492 \u1512 \u1499 \u1497 \u1513 \u1492 .'); return; \}\
            // Create the initial data structure directly in the global variable\
            userData = \{ lastPurchaseDate: purchaseDateStr, currentPillCount: initialCount, waitingPeriod: CONFIG.WAITING_PERIOD_DAYS, consumptionLog: [], planOverrides: \{\}, lastLogTimestamp: null \};\
        \} else \{\
             if (!userData) \{ console.error("Cannot record purchase: User data not loaded."); alert('\uc0\u1513 \u1490 \u1497 \u1488 \u1492 : \u1504 \u1514 \u1493 \u1504 \u1497  \u1502 \u1513 \u1514 \u1502 \u1513  \u1500 \u1488  \u1504 \u1496 \u1506 \u1504 \u1493 . \u1504 \u1505 \u1492  \u1500 \u1512 \u1506 \u1504 \u1503 .'); purchaseModal.classList.remove('active'); return; \}\
            userData.currentPillCount += pillsAdded; userData.lastPurchaseDate = purchaseDateStr; userData.consumptionLog = userData.consumptionLog || []; userData.planOverrides = userData.planOverrides || \{\};\
        \}\
        console.log("Attempting to save data via saveUserData:", userData);\
        await saveUserData(); // Save the global userData\
        await loadUserData(); // Reload data to verify save and update local state\
        console.log("Data after save & reload:", userData);\
        if (userData && userData.lastPurchaseDate === purchaseDateStr) \{ purchaseModal.classList.remove('active'); delete savePurchaseBtn.dataset.initialSetup; updateDisplay(); \}\
        else \{ console.error("Save verification failed."); alert("\uc0\u1513 \u1490 \u1497 \u1488 \u1492  \u1489 \u1513 \u1502 \u1497 \u1512 \u1514  \u1492 \u1504 \u1514 \u1493 \u1504 \u1497 \u1501  \u1488 \u1493  \u1488 \u1497 \u1502 \u1493 \u1514  \u1492 \u1513 \u1502 \u1497 \u1512 \u1492 ."); \}\
    \});\
     // Log Consumption\
     logButtons.forEach(button => \{ button.addEventListener('click', () => \{ addLogEntry(button.dataset.amount); \}); \});\
     logOtherBtn.addEventListener('click', () => \{ logOtherAmountInput.value = ''; logOtherModal.classList.add('active'); \});\
     cancelLogOtherBtn.addEventListener('click', () => logOtherModal.classList.remove('active'));\
     saveLogOtherBtn.addEventListener('click', () => \{ addLogEntry(logOtherAmountInput.value); logOtherModal.classList.remove('active'); \});\
     // Adjust Count\
     adjustCountBtn.addEventListener('click', () => \{ adjustPillsCountInput.value = userData ? userData.currentPillCount : 0; adjustModal.classList.add('active'); \});\
     cancelAdjustBtn.addEventListener('click', () => adjustModal.classList.remove('active'));\
     saveAdjustBtn.addEventListener('click', () => \{ adjustCount(adjustPillsCountInput.value); adjustModal.classList.remove('active'); \});\
    // Reset Data\
     resetDataBtn.addEventListener('click', async () => \{ if (!currentUser) \{ alert("\uc0\u1497 \u1513  \u1500 \u1492 \u1514 \u1495 \u1489 \u1512  \u1514 \u1495 \u1497 \u1500 \u1492 ."); return; \} if (confirm('\u1492 \u1488 \u1501  \u1488 \u1514 \u1492  \u1489 \u1496 \u1493 \u1495  \u1513 \u1489 \u1512 \u1510 \u1493 \u1504 \u1498  \u1500 \u1502 \u1495 \u1493 \u1511  \u1488 \u1514  \u1499 \u1500  \u1504 \u1514 \u1493 \u1504 \u1497  \u1492 \u1502 \u1506 \u1511 \u1489  \u1506 \u1489 \u1493 \u1512  \u1502 \u1513 \u1514 \u1502 \u1513  \u1494 \u1492  \u1502 \u1492 \u1506 \u1504 \u1503 ? \u1492 \u1508 \u1506 \u1493 \u1500 \u1492  \u1505 \u1493 \u1508 \u1497 \u1514 !')) \{ const success = await deleteUserData(); if (success) \{ updateDisplay(); \} \} \});\
\}\
\
// --- Initial Load ---\
// Wait for the DOM to be fully loaded before initializing elements and setting up listeners\
document.addEventListener('DOMContentLoaded', () => \{\
    console.log("DOM fully loaded.");\
    initializeDOMElements();\
    initializeFirebase(); // This will trigger onAuthStateChanged which calls loadUserData and updateDisplay\
    setupEventListeners();\
    showPage('page-dashboard'); // Show dashboard structure initially\
\});\
}