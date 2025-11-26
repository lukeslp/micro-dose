/* =====================================================
   MICRO DOSE SYNDICATE - Game Engine
   Crime Dashboard UX Implementation
   ===================================================== */

// Distribution Strategies with icons
const distributionStrategies = [
    {
        id: "solo",
        label: "Solo Corners",
        icon: "🚶",
        description: "Move it yourself. Low footprint, slower reach.",
        cost: 0,
        demandMod: 0.95,
        heatMod: 0,
    },
    {
        id: "runners",
        label: "Bike Runners",
        icon: "🚴",
        description: "Two couriers spray the borough with orders.",
        cost: 60,
        demandMod: 1.15,
        heatMod: 3,
    },
    {
        id: "club",
        label: "Club Residencies",
        icon: "🎪",
        description: "Door staff funnel VIPs straight to you.",
        cost: 140,
        demandMod: 1.3,
        heatMod: 6,
    },
    {
        id: "ghost",
        label: "Ghost Lockers",
        icon: "👻",
        description: "Darknet drops via micro-lockers.",
        cost: 220,
        demandMod: 1.45,
        heatMod: 10,
    },
];

const vibeProfiles = [
    { name: "Calm", description: "Locals only, easy to read.", modifier: 0.9, chip: "neutral" },
    { name: "Buzzing", description: "Artists and tech kids fill the block.", modifier: 1.1, chip: "up" },
    { name: "Frantic", description: "Clubs spill into the street.", modifier: 1.3, chip: "up" },
    { name: "Tense", description: "Cops creeping, folks lie low.", modifier: 0.8, chip: "warning" },
    { name: "Euphoric", description: "Citywide celebration, cash everywhere.", modifier: 1.5, chip: "up" },
];

const flowProfiles = [
    { name: "Sparse", description: "Few faces, mostly regulars.", modifier: 0.7, chip: "down" },
    { name: "Steady", description: "Predictable flow until midnight.", modifier: 1, chip: "neutral" },
    { name: "Flood", description: "Lines of club kids looking for favors.", modifier: 1.25, chip: "up" },
    { name: "Tour Bus", description: "Weekend travelers in droves.", modifier: 1.4, chip: "up" },
];

const streetEvents = [
    {
        name: "Underground Rave",
        description: "Warehouses lit, party kids hungry for micro-doses.",
        demandModifier: 1.6,
        credDelta: 3,
        heatDelta: 4,
        chip: "up",
    },
    {
        name: "Vice Sweep",
        description: "Plainclothes swarm the district with random stops.",
        demandModifier: 0.6,
        credDelta: -2,
        heatDelta: 10,
        crackdown: true,
        chip: "warning",
    },
    {
        name: "Crypto Conference",
        description: "Speculators with loose wallets flood the zone.",
        demandModifier: 1.35,
        credDelta: 2,
        heatDelta: 2,
        chip: "up",
    },
    {
        name: "Supply Drought",
        description: "Upstream labs stall, everyone hoards product.",
        demandModifier: 0.85,
        credDelta: 0,
        heatDelta: -4,
        chip: "down",
    },
    {
        name: "Community Patrols",
        description: "Neighborhood group documents suspicious activity.",
        demandModifier: 0.75,
        credDelta: -1,
        heatDelta: 7,
        chip: "warning",
    },
    {
        name: "Influencer Drop",
        description: "Alt wellness guru shouts you out in a podcast.",
        demandModifier: 1.4,
        credDelta: 4,
        heatDelta: 1,
        chip: "up",
    },
];

const rumors = [
    "Kids are asking for 'that purple batch' again.",
    "Corner boys say the block is quiet tonight.",
    "Someone's cousin got pinched last week—lay low.",
    "New faces scouting the area. Competition?",
    "Heard the clubs are flush with cash tonight.",
    "Weather's perfect for foot traffic.",
    "Word is quality's been slipping citywide.",
    "VIPs asking around for premium connects.",
    "Delivery apps are down—old school moves tonight.",
    "Street says you're building a reputation.",
];

const qualityTiers = [
    { min: 60, max: 64, label: "Trash", description: "Cheap, risky reputation" },
    { min: 65, max: 74, label: "Street", description: "Acceptable, low margins" },
    { min: 75, max: 84, label: "Standard", description: "Balanced choice" },
    { min: 85, max: 94, label: "Premium", description: "High demand, draws eyes" },
    { min: 95, max: 100, label: "Luxury", description: "Max margins, max heat" },
];

const credTiers = [
    { min: 0, max: 19, name: "Nobody" },
    { min: 20, max: 39, name: "Corner Rookie" },
    { min: 40, max: 59, name: "Block Captain" },
    { min: 60, max: 79, name: "District Plug" },
    { min: 80, max: 99, name: "Ghost" },
    { min: 100, max: 120, name: "Urban Legend" },
];

const heatTiers = [
    { min: 0, max: 24, name: "Chill", class: "tier-chill" },
    { min: 25, max: 49, name: "Warm", class: "tier-warm" },
    { min: 50, max: 74, name: "Hot", class: "tier-hot" },
    { min: 75, max: 100, name: "Sirens", class: "tier-sirens" },
];

// =====================================================
// EMPIRE DATA (Territories & Assets)
// =====================================================

const territoriesData = [
    { id: "downtown", name: "Downtown", owned: true, heat: 0, revenue: 1.0, cost: 0, icon: "🏙️" },
    { id: "eastside", name: "East Side", owned: false, heat: 0, revenue: 1.2, cost: 3000, icon: "🌆" },
    { id: "docks", name: "The Docks", owned: false, heat: 0, revenue: 1.35, cost: 5000, icon: "🚢" },
    { id: "heights", name: "The Heights", owned: false, heat: 0, revenue: 1.5, cost: 8000, icon: "🏔️" },
    { id: "industrial", name: "Industrial Zone", owned: false, heat: 0, revenue: 1.4, cost: 6500, icon: "🏭" },
    { id: "suburb", name: "Quiet Suburbs", owned: false, heat: 0, revenue: 1.25, cost: 4500, icon: "🏡" },
];

const assetsData = [
    { id: "safehouse", name: "Safehouse", level: 1, maxLevel: 3, upgradeCost: 2000, icon: "🏠", effect: "capacity", bonus: 100 },
    { id: "lab", name: "Lab Equipment", level: 0, maxLevel: 3, upgradeCost: 3500, icon: "🧪", effect: "quality", bonus: 3 },
    { id: "vehicle", name: "Delivery Vehicle", level: 0, maxLevel: 3, upgradeCost: 2500, icon: "🚐", effect: "reach", bonus: 0.08 },
    { id: "scanner", name: "Police Scanner", level: 0, maxLevel: 2, upgradeCost: 1800, icon: "📻", effect: "heat_warning", bonus: 1 },
];

// =====================================================
// OFFICE DATA (Investments & Upgrades)
// =====================================================

const investmentsData = [
    { id: "launder", name: "Laundromat", cost: 8000, dailyReturn: 150, owned: false, icon: "🧺" },
    { id: "crypto", name: "Crypto Mixer", cost: 12000, dailyReturn: 280, owned: false, icon: "💎" },
    { id: "dispensary", name: "CBD Dispensary", cost: 15000, dailyReturn: 350, owned: false, icon: "🌿" },
    { id: "restaurant", name: "Front Restaurant", cost: 20000, dailyReturn: 450, owned: false, icon: "🍽️" },
];

const upgradesData = [
    { id: "burners", name: "Burner Network", cost: 1500, effect: "heat_reduction", value: 0.1, purchased: false, icon: "📱", desc: "-10% heat gain" },
    { id: "lawyers", name: "Retainer Lawyers", cost: 4000, effect: "bust_protection", value: 0.2, purchased: false, icon: "⚖️", desc: "+20 bust threshold" },
    { id: "scouts", name: "Street Scouts", cost: 2500, effect: "forecast_accuracy", value: 1, purchased: false, icon: "👁️", desc: "Better forecasts" },
    { id: "chemist", name: "Master Chemist", cost: 6000, effect: "quality_boost", value: 5, purchased: false, icon: "🔬", desc: "+5% base quality" },
    { id: "bulk", name: "Bulk Supplier", cost: 3500, effect: "cost_reduction", value: 0.15, purchased: false, icon: "📦", desc: "-15% ingredient cost" },
];

// =====================================================
// PROGRESSION DATA (XP, Achievements, Crew)
// =====================================================

const achievementsData = [
    { id: "first_night", name: "First Night", desc: "Complete your first run", icon: "🌙", unlocked: false, xpReward: 50 },
    { id: "high_roller", name: "High Roller", desc: "Earn $10,000 in one night", icon: "💰", unlocked: false, xpReward: 150 },
    { id: "ghost", name: "Ghost", desc: "Reach 80 Cred with under 30 Heat", icon: "👻", unlocked: false, xpReward: 200 },
    { id: "sellout", name: "Sellout", desc: "Sell all bags 5 nights in a row", icon: "📦", unlocked: false, xpReward: 100 },
    { id: "survivor", name: "Survivor", desc: "Survive 20 nights", icon: "🏆", unlocked: false, xpReward: 300 },
    { id: "empire", name: "Empire Builder", desc: "Own 3 territories", icon: "🏙️", unlocked: false, xpReward: 250 },
    { id: "investor", name: "Investor", desc: "Buy your first investment", icon: "📈", unlocked: false, xpReward: 100 },
    { id: "upgraded", name: "Upgraded", desc: "Max out any asset", icon: "⬆️", unlocked: false, xpReward: 150 },
    { id: "crew_boss", name: "Crew Boss", desc: "Hire 3 crew members", icon: "👥", unlocked: false, xpReward: 200 },
    { id: "legend", name: "Urban Legend", desc: "Reach 100 Cred", icon: "⭐", unlocked: false, xpReward: 500 },
    { id: "clean", name: "Clean Record", desc: "Finish a night with 0 Heat", icon: "❄️", unlocked: false, xpReward: 100 },
    { id: "millionaire", name: "Millionaire", desc: "Accumulate $100,000 total earned", icon: "💎", unlocked: false, xpReward: 400 },
];

const crewData = [
    { id: "runner1", name: "Quick Mike", role: "runner", cost: 500, bonus: { reach: 0.05 }, hired: false, icon: "🏃", desc: "+5% demand reach" },
    { id: "chemist1", name: "Doc", role: "chemist", cost: 1200, bonus: { quality: 5 }, hired: false, icon: "👨‍🔬", desc: "+5% quality bonus" },
    { id: "lookout1", name: "Eagle Eye", role: "lookout", cost: 800, bonus: { heat: -2 }, hired: false, icon: "👀", desc: "-2 heat per night" },
    { id: "dealer1", name: "Smooth Tony", role: "dealer", cost: 1500, bonus: { price: 0.08 }, hired: false, icon: "🎩", desc: "+8% price tolerance" },
    { id: "runner2", name: "Flash", role: "runner", cost: 900, bonus: { reach: 0.07 }, hired: false, icon: "⚡", desc: "+7% demand reach" },
    { id: "fixer1", name: "The Fixer", role: "fixer", cost: 2000, bonus: { cred: 1 }, hired: false, icon: "🔧", desc: "+1 cred per night" },
];

const unlocksData = [
    { id: "club_lane", name: "Club Residencies", requirement: { level: 3 }, unlocked: false, type: "distribution" },
    { id: "ghost_lane", name: "Ghost Lockers", requirement: { level: 5 }, unlocked: false, type: "distribution" },
    { id: "heights_territory", name: "The Heights", requirement: { level: 4 }, unlocked: false, type: "territory" },
    { id: "crypto_investment", name: "Crypto Mixer", requirement: { level: 6 }, unlocked: false, type: "investment" },
];

// =====================================================
// GAME STATE
// =====================================================

const gameState = {
    day: 1,
    cash: 750,
    cred: 55,
    heat: 20,
    status: "playing",
    history: [],
    logs: [],
    cashTimeline: [],
    credTimeline: [],
    heatTimeline: [],
    config: {
        cookCost: 12,
        crewFee: 95,
        baseDemand: 55,
        maxUnits: 600,
    },
    currentForecast: {
        weather: null,
        weatherMod: 1,
        weatherDescription: "",
        traffic: null,
        trafficMod: 1,
        event: null,
    },
    lastNight: null, // For debrief panel
    selectedDistribution: "runners",
    currentScreen: "night",
    selloutStreak: 0, // For achievement tracking
    
    // Empire data
    empire: {
        territories: JSON.parse(JSON.stringify(territoriesData)),
        assets: JSON.parse(JSON.stringify(assetsData)),
    },
    
    // Office data
    office: {
        ledger: [],
        investments: JSON.parse(JSON.stringify(investmentsData)),
        upgrades: JSON.parse(JSON.stringify(upgradesData)),
        stats: {
            totalEarned: 0,
            totalSpent: 0,
            daysActive: 0,
            bestNight: 0,
        },
    },
    
    // Progression data
    progression: {
        level: 1,
        xp: 0,
        xpToNext: 500,
        achievements: JSON.parse(JSON.stringify(achievementsData)),
        unlocks: JSON.parse(JSON.stringify(unlocksData)),
        crew: JSON.parse(JSON.stringify(crewData)),
    },
};

// DOM Elements
const elements = {
    // Stat displays
    dayDisplay: document.getElementById("dayDisplay"),
    actLabel: document.getElementById("actLabel"),
    cashDisplay: document.getElementById("cashDisplay"),
    cashTrend: document.getElementById("cashTrend"),
    
    // Gauges
    credGauge: document.getElementById("credGauge"),
    credArc: document.getElementById("credArc"),
    credNeedle: document.getElementById("credNeedle"),
    credValue: document.getElementById("credValue"),
    credTier: document.getElementById("credTier"),
    heatGauge: document.getElementById("heatGauge"),
    heatArc: document.getElementById("heatArc"),
    heatNeedle: document.getElementById("heatNeedle"),
    heatValue: document.getElementById("heatValue"),
    heatTier: document.getElementById("heatTier"),
    
    // Conditions
    weatherDisplay: document.getElementById("weatherDisplay"),
    weatherDetail: document.getElementById("weatherDetail"),
    trafficDisplay: document.getElementById("trafficDisplay"),
    trafficDetail: document.getElementById("trafficDetail"),
    eventDisplay: document.getElementById("eventDisplay"),
    eventDetail: document.getElementById("eventDetail"),
    eventCard: document.getElementById("eventCard"),
    
    // Form
    priceInput: document.getElementById("priceInput"),
    unitsInput: document.getElementById("unitsInput"),
    purityInput: document.getElementById("purityInput"),
    purityIndicator: document.getElementById("purityIndicator"),
    marketingOptions: document.getElementById("marketingOptions"),
    distributionSummary: document.getElementById("distributionSummary"),
    summaryValue: document.getElementById("summaryValue"),
    profitEstimate: document.getElementById("profitEstimate"),
    estimateValue: document.getElementById("estimateValue"),
    estimateDetail: document.getElementById("estimateDetail"),
    formError: document.getElementById("formError"),
    runDay: document.getElementById("runDay"),
    restartBtn: document.getElementById("restartBtn"),
    form: document.getElementById("dayForm"),
    
    // Intel
    forecastText: document.getElementById("forecastText"),
    forecastChips: document.getElementById("forecastChips"),
    forecastRumor: document.getElementById("forecastRumor"),
    historyBody: document.getElementById("historyBody"),
    logFeed: document.getElementById("logFeed"),
    chart: document.getElementById("cashChart"),
    
    // Onboarding
    onboardingOverlay: document.getElementById("onboardingOverlay"),
    onboardingNext: document.getElementById("onboardingNext"),
    onboardingSkip: document.getElementById("onboardingSkip"),
    
    // Debrief
    debriefPanel: document.getElementById("debriefPanel"),
    debriefDismiss: document.getElementById("debriefDismiss"),
    debriefCash: document.getElementById("debriefCash"),
    debriefCred: document.getElementById("debriefCred"),
    debriefHeat: document.getElementById("debriefHeat"),
    
    // Screens
    nightScreen: document.getElementById("nightScreen"),
    empireScreen: document.getElementById("empireScreen"),
    officeScreen: document.getElementById("officeScreen"),
    
    // Empire elements
    territoriesGrid: document.getElementById("territoriesGrid"),
    territoryIncomeValue: document.getElementById("territoryIncomeValue"),
    assetsGrid: document.getElementById("assetsGrid"),
    crewGrid: document.getElementById("crewGrid"),
    
    // Office elements
    statTotalEarned: document.getElementById("statTotalEarned"),
    statTotalSpent: document.getElementById("statTotalSpent"),
    statDaysActive: document.getElementById("statDaysActive"),
    statBestNight: document.getElementById("statBestNight"),
    ledgerBody: document.getElementById("ledgerBody"),
    investmentsGrid: document.getElementById("investmentsGrid"),
    upgradesGrid: document.getElementById("upgradesGrid"),
    achievementsGrid: document.getElementById("achievementsGrid"),
    achievementCount: document.getElementById("achievementCount"),
    
    // Progression
    xpFill: document.getElementById("xpFill"),
    playerLevel: document.getElementById("playerLevel"),
    
    // Toast
    unlockToast: document.getElementById("unlockToast"),
    toastMessage: document.getElementById("toastMessage"),
};

const chartCtx = elements.chart?.getContext("2d");

// =====================================================
// INITIALIZATION
// =====================================================

function initGame() {
    // Check for first-time visitor
    checkOnboarding();
    
    // Render distribution options
    renderDistributionOptions();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize game
    resetGame();
    
    // Update profit estimate on load
    updateProfitEstimate();
    
    // Initialize XP bar
    updateXPBar();
    
    // Apply initial asset effects
    applyAssetEffects();
}

function setupEventListeners() {
    // Form submission
    elements.form?.addEventListener("submit", handleFormSubmit);
    
    // Restart button
    elements.restartBtn?.addEventListener("click", resetGame);
    
    // Stepper buttons (both old and new selectors)
    document.querySelectorAll(".stepper-btn, .step-btn").forEach(btn => {
        btn.addEventListener("click", handleStepperClick);
    });
    
    // Input changes for profit estimate
    elements.priceInput?.addEventListener("input", updateProfitEstimate);
    elements.unitsInput?.addEventListener("input", updateProfitEstimate);
    elements.purityInput?.addEventListener("input", handlePurityChange);
    
    // Onboarding
    elements.onboardingNext?.addEventListener("click", handleOnboardingNext);
    elements.onboardingSkip?.addEventListener("click", handleOnboardingSkip);
    document.querySelectorAll(".onboarding-dots .dot").forEach(dot => {
        dot.addEventListener("click", () => {
            const step = parseInt(dot.dataset.step);
            showOnboardingStep(step);
        });
    });
    
    // Debrief
    elements.debriefDismiss?.addEventListener("click", hideDebrief);
    
    // Keyboard navigation for sliders
    elements.purityInput?.addEventListener("keydown", handleSliderKeyboard);
    
    // Screen navigation
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            const view = link.dataset.view;
            if (view && !link.classList.contains("disabled")) {
                switchScreen(view);
            }
        });
    });
    
    // Ledger filters
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const filter = btn.dataset.filter;
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderLedger(filter);
        });
    });
}

function handleFormSubmit(event) {
    event.preventDefault();
    if (gameState.status !== "playing") return;
    
    const price = Number(elements.priceInput.value);
    const units = Number(elements.unitsInput.value);
    const purity = Number(elements.purityInput.value);
    const marketingId = gameState.selectedDistribution;
    
    if (!validateInputs(price, units, purity, marketingId)) return;
    
    runDay({ price, units, purity, marketingId });
}

function handleStepperClick(event) {
    const btn = event.currentTarget;
    const targetId = btn.dataset.target;
    const step = parseInt(btn.dataset.step);
    const input = document.getElementById(targetId);
    
    if (!input) return;
    
    const currentValue = parseFloat(input.value) || 0;
    const newValue = currentValue + step;
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || Infinity;
    
    input.value = clamp(min, max, newValue);
    input.dispatchEvent(new Event("input"));
}

function handlePurityChange() {
    const value = parseInt(elements.purityInput.value);
    const tier = qualityTiers.find(t => value >= t.min && value <= t.max) || qualityTiers[2];
    
    // Update indicator (compact badge format)
    const indicator = elements.purityIndicator;
    if (indicator) {
        // Support both old multi-element and new single badge format
        if (indicator.querySelector(".indicator-value")) {
            indicator.querySelector(".indicator-value").textContent = tier.label;
            indicator.querySelector(".indicator-percent").textContent = `${value}%`;
        } else {
            indicator.textContent = `${tier.label} ${value}%`;
        }
    }
    
    // Update slider labels (if they exist)
    document.querySelectorAll(".slider-labels span").forEach(span => {
        const labelValue = parseInt(span.dataset.value);
        span.classList.toggle("active", value >= labelValue && value < labelValue + 10);
    });
    
    updateProfitEstimate();
}

function handleSliderKeyboard(event) {
    const input = event.target;
    const step = parseInt(input.step) || 5;
    
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        input.value = Math.max(parseInt(input.min), parseInt(input.value) - step);
        input.dispatchEvent(new Event("input"));
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        input.value = Math.min(parseInt(input.max), parseInt(input.value) + step);
        input.dispatchEvent(new Event("input"));
    }
}

// =====================================================
// ONBOARDING
// =====================================================

let currentOnboardingStep = 1;

function checkOnboarding() {
    const hasSeenOnboarding = localStorage.getItem("microDose_onboardingSeen");
    if (!hasSeenOnboarding) {
        showOnboarding();
    }
}

function showOnboarding() {
    elements.onboardingOverlay?.classList.remove("hidden");
    showOnboardingStep(1);
}

function hideOnboarding() {
    elements.onboardingOverlay?.classList.add("hidden");
    localStorage.setItem("microDose_onboardingSeen", "true");
}

function showOnboardingStep(step) {
    currentOnboardingStep = step;
    
    // Hide all steps
    document.querySelectorAll(".onboarding-step").forEach(s => {
        s.classList.add("hidden");
    });
    
    // Show current step
    const currentStep = document.querySelector(`.onboarding-step[data-step="${step}"]`);
    currentStep?.classList.remove("hidden");
    
    // Update dots
    document.querySelectorAll(".onboarding-dots .dot").forEach(dot => {
        dot.classList.toggle("active", parseInt(dot.dataset.step) === step);
    });
    
    // Update button text
    if (elements.onboardingNext) {
        elements.onboardingNext.textContent = step === 4 ? "Start Playing" : "Next";
    }
}

function handleOnboardingNext() {
    if (currentOnboardingStep < 4) {
        showOnboardingStep(currentOnboardingStep + 1);
    } else {
        hideOnboarding();
    }
}

function handleOnboardingSkip() {
    hideOnboarding();
}

// =====================================================
// DEBRIEF PANEL
// =====================================================

function showDebrief(lastNight) {
    if (!lastNight) return;
    
    const { cashDelta, credDelta, heatDelta, cashReason, credReason, heatReason } = lastNight;
    
    // Cash
    const cashEl = elements.debriefCash;
    if (cashEl) {
        const cashValue = cashEl.querySelector(".delta-value");
        const cashReasonEl = cashEl.querySelector(".delta-reason");
        cashValue.textContent = formatDelta(cashDelta, true);
        cashValue.className = `delta-value ${cashDelta >= 0 ? "positive" : "negative"}`;
        cashReasonEl.textContent = cashReason;
    }
    
    // Cred
    const credEl = elements.debriefCred;
    if (credEl) {
        const credValue = credEl.querySelector(".delta-value");
        const credReasonEl = credEl.querySelector(".delta-reason");
        credValue.textContent = formatDelta(credDelta);
        credValue.className = `delta-value ${credDelta > 0 ? "positive" : credDelta < 0 ? "negative" : "neutral"}`;
        credReasonEl.textContent = credReason;
    }
    
    // Heat
    const heatEl = elements.debriefHeat;
    if (heatEl) {
        const heatValue = heatEl.querySelector(".delta-value");
        const heatReasonEl = heatEl.querySelector(".delta-reason");
        heatValue.textContent = formatDelta(heatDelta);
        heatValue.className = `delta-value ${heatDelta > 0 ? "negative" : heatDelta < 0 ? "positive" : "neutral"}`;
        heatReasonEl.textContent = heatReason;
    }
    
    elements.debriefPanel?.classList.remove("hidden");
}

function hideDebrief() {
    elements.debriefPanel?.classList.add("hidden");
}

function formatDelta(value, isCurrency = false) {
    const prefix = value >= 0 ? "+" : "";
    if (isCurrency) {
        return prefix + formatCurrency(value);
    }
    return prefix + Math.round(value);
}

// =====================================================
// DISTRIBUTION OPTIONS
// =====================================================

function renderDistributionOptions() {
    if (!elements.marketingOptions) return;
    
    elements.marketingOptions.innerHTML = "";
    
    distributionStrategies.forEach((lane) => {
        const reach = Math.round(lane.demandMod * 100);
        const risk = lane.heatMod;
        
        const card = document.createElement("label");
        card.className = `distribution-card ${lane.id === gameState.selectedDistribution ? "selected" : ""}`;
        card.innerHTML = `
            <input type="radio" name="marketing" value="${lane.id}" 
                   ${lane.id === gameState.selectedDistribution ? "checked" : ""} />
            <div class="distribution-header">
                <span class="distribution-icon">${lane.icon}</span>
                <span class="distribution-name">${lane.label}</span>
            </div>
            <p class="distribution-desc">${lane.description}</p>
            <div class="distribution-stats">
                <span class="dist-stat reach">📈 ${reach}%</span>
                <span class="dist-stat risk">🔥 +${risk}</span>
                <span class="dist-stat cost">💵 $${lane.cost}</span>
            </div>
        `;
        
        card.addEventListener("click", () => selectDistribution(lane.id));
        elements.marketingOptions.appendChild(card);
    });
}

function selectDistribution(id) {
    gameState.selectedDistribution = id;
    
    // Update visual selection
    document.querySelectorAll(".distribution-card").forEach(card => {
        const radio = card.querySelector('input[type="radio"]');
        card.classList.toggle("selected", radio.value === id);
        radio.checked = radio.value === id;
    });
    
    updateProfitEstimate();
}

// =====================================================
// PROFIT ESTIMATE
// =====================================================

function updateProfitEstimate() {
    const price = Number(elements.priceInput?.value) || 45;
    const units = Number(elements.unitsInput?.value) || 80;
    const purity = Number(elements.purityInput?.value) || 85;
    const strategy = distributionStrategies.find(s => s.id === gameState.selectedDistribution) || distributionStrategies[1];
    
    // Calculate costs
    const ingredientCost = units * gameState.config.cookCost * (purity / 80);
    const laneCost = strategy.cost;
    const fixedCost = gameState.config.crewFee;
    const totalCost = ingredientCost + laneCost + fixedCost;
    
    // Max revenue
    const maxRevenue = units * price;
    const maxProfit = maxRevenue - totalCost;
    
    // Update estimate display
    if (elements.estimateValue) {
        elements.estimateValue.textContent = formatCurrency(maxProfit);
        elements.estimateValue.style.color = maxProfit >= 0 ? "var(--color-money)" : "var(--color-danger)";
    }
    
    if (elements.estimateDetail) {
        elements.estimateDetail.textContent = `if all ${units} bags sell at $${price}`;
    }
    
    // Update distribution summary
    if (elements.summaryValue) {
        elements.summaryValue.textContent = formatCurrency(maxProfit);
    }
}

// =====================================================
// GAME LOGIC
// =====================================================

function resetGame() {
    gameState.day = 1;
    gameState.cash = 750;
    gameState.cred = 55;
    gameState.heat = 20;
    gameState.status = "playing";
    gameState.history = [];
    gameState.logs = [];
    gameState.cashTimeline = [gameState.cash];
    gameState.credTimeline = [gameState.cred];
    gameState.heatTimeline = [gameState.heat];
    gameState.lastNight = null;
    gameState.selectedDistribution = "runners";
    gameState.selloutStreak = 0;
    
    // Reset empire data
    gameState.empire.territories = JSON.parse(JSON.stringify(territoriesData));
    gameState.empire.assets = JSON.parse(JSON.stringify(assetsData));
    
    // Reset office data
    gameState.office.ledger = [];
    gameState.office.investments = JSON.parse(JSON.stringify(investmentsData));
    gameState.office.upgrades = JSON.parse(JSON.stringify(upgradesData));
    gameState.office.stats = {
        totalEarned: 0,
        totalSpent: 0,
        daysActive: 0,
        bestNight: 0,
    };
    
    // Reset progression data
    gameState.progression.level = 1;
    gameState.progression.xp = 0;
    gameState.progression.xpToNext = 500;
    gameState.progression.achievements = JSON.parse(JSON.stringify(achievementsData));
    gameState.progression.unlocks = JSON.parse(JSON.stringify(unlocksData));
    gameState.progression.crew = JSON.parse(JSON.stringify(crewData));
    
    elements.runDay.disabled = false;
    elements.restartBtn?.classList.add("hidden");
    
    // Reset form values
    if (elements.priceInput) elements.priceInput.value = 45;
    if (elements.unitsInput) elements.unitsInput.value = 80;
    if (elements.purityInput) elements.purityInput.value = 85;
    
    // Reset config to defaults
    gameState.config.maxUnits = 600;
    
    // Re-render distribution options
    renderDistributionOptions();
    
    addLog("Crew HQ", "Fresh synth stash, burner phones charged, bankroll at $750. Time to rewire the city.", "info");
    
    generateForecast();
    updateUI();
    updateXPBar();
    handlePurityChange();
    updateProfitEstimate();
    
    // Switch to night screen
    switchScreen("night");
}

function validateInputs(price, units, purity, marketingId) {
    const { maxUnits } = gameState.config;
    
    if (Number.isNaN(price) || price < 5) {
        showFormError("Price must be at least $5 per bag.");
        return false;
    }
    if (price > 250) {
        showFormError("Customers balk above $250. Keep it under that.");
        return false;
    }
    if (Number.isNaN(units) || units < 0) {
        showFormError("Units must be zero or higher.");
        return false;
    }
    if (units > maxUnits) {
        showFormError(`Safehouses can't stash more than ${maxUnits} bags at once.`);
        return false;
    }
    if (Number.isNaN(purity) || purity < 60 || purity > 100) {
        showFormError("Keep purity between 60% and 100% to avoid rumors.");
        return false;
    }
    if (!marketingId) {
        showFormError("Pick a distribution lane to continue.");
        return false;
    }
    
    showFormError("");
    return true;
}

function showFormError(message) {
    if (elements.formError) {
        elements.formError.textContent = message;
    }
}

function generateForecast() {
    const weather = vibeProfiles[Math.floor(Math.random() * vibeProfiles.length)];
    const traffic = flowProfiles[Math.floor(Math.random() * flowProfiles.length)];
    let event = null;
    
    if (Math.random() < 0.45) {
        event = streetEvents[Math.floor(Math.random() * streetEvents.length)];
    }
    
    gameState.currentForecast = {
        weather: weather.name,
        weatherDescription: weather.description,
        weatherMod: weather.modifier,
        weatherChip: weather.chip,
        traffic: traffic.name,
        trafficDescription: traffic.description,
        trafficMod: traffic.modifier,
        trafficChip: traffic.chip,
        event,
    };
    
    if (event) {
        addLog("Intel Drop", `${event.name}: ${event.description}`, event.chip === "warning" ? "warning" : "info");
    }
}

function runDay({ price, units, purity, marketingId }) {
    const prevCash = gameState.cash;
    const prevCred = gameState.cred;
    const prevHeat = gameState.heat;
    
    // Get bonuses from crew and upgrades
    const crewBonuses = getCrewBonuses();
    const upgradeEffects = getUpgradeEffects();
    
    const strategy = distributionStrategies.find(lane => lane.id === marketingId) || distributionStrategies[0];
    
    // Apply cost reduction from upgrades
    const costReduction = upgradeEffects.cost_reduction || 0;
    const ingredientCost = units * gameState.config.cookCost * (purity / 80) * (1 - costReduction);
    const laneCost = strategy.cost;
    const fixedCost = gameState.config.crewFee;
    
    // Apply crew bonuses to demand calculation
    const demand = computeDemand({ price, purity, strategy, crewBonuses });
    const unitsSold = Math.min(units, Math.max(0, Math.round(demand)));
    const waste = Math.max(0, units - unitsSold);
    const revenue = unitsSold * price;
    const totalCost = ingredientCost + laneCost + fixedCost;
    const profit = revenue - totalCost;
    
    // Add investment income
    const investmentIncome = getInvestmentIncome();
    if (investmentIncome > 0) {
        gameState.cash += investmentIncome;
        recordTransaction("income", "Investment returns", investmentIncome);
        addLog("Investments", `Passive income: ${formatCurrency(investmentIncome)}`, "positive");
    }
    
    gameState.cash += profit;
    gameState.cashTimeline.push(gameState.cash);
    
    const historyEntry = {
        day: gameState.day,
        price,
        unitsPrepared: units,
        unitsSold,
        profit,
        cred: gameState.cred,
        heat: gameState.heat,
    };
    gameState.history.push(historyEntry);
    
    // Log results
    const sellRate = units > 0 ? Math.round((unitsSold / units) * 100) : 0;
    const logType = profit >= 0 ? "positive" : "negative";
    addLog(`Night ${gameState.day}`, 
        `${strategy.label} moved ${unitsSold}/${units} bags (${sellRate}%). Net: ${formatCurrency(profit)}`, 
        logType);
    
    if (waste > 0) {
        addLog("Inventory", `${waste} bags sealed in cold storage.`, "warning");
    }
    
    if (gameState.currentForecast.event?.crackdown) {
        addLog("Vice Alert", "Task force rolled through doing flashlight checks.", "negative");
    }
    
    // Track reasons for debrief
    let cashReason = `Sold ${unitsSold} bags, costs: $${totalCost.toFixed(0)}`;
    let credReason = "";
    let heatReason = "";
    
    // Adjust cred and heat
    const credResult = adjustCred({ units, unitsSold, price, profit, purity });
    credReason = credResult.reason;
    
    const heatResult = adjustHeat({ strategy, price, purity, units, unitsSold });
    heatReason = heatResult.reason;
    
    // Apply event effects
    if (gameState.currentForecast.event?.credDelta) {
        gameState.cred = clamp(0, 120, gameState.cred + gameState.currentForecast.event.credDelta);
        if (gameState.currentForecast.event.credDelta !== 0) {
            credReason += ` (${gameState.currentForecast.event.name})`;
        }
    }
    if (gameState.currentForecast.event?.heatDelta) {
        gameState.heat = clamp(0, 120, gameState.heat + gameState.currentForecast.event.heatDelta);
        if (gameState.currentForecast.event.heatDelta !== 0) {
            heatReason += ` (${gameState.currentForecast.event.name})`;
        }
    }
    
    gameState.credTimeline.push(gameState.cred);
    gameState.heatTimeline.push(gameState.heat);
    
    // Store for debrief
    gameState.lastNight = {
        cashDelta: gameState.cash - prevCash,
        credDelta: gameState.cred - prevCred,
        heatDelta: gameState.heat - prevHeat,
        cashReason,
        credReason,
        heatReason,
    };
    
    // Apply heat reduction from upgrades
    const heatReduction = upgradeEffects.heat_reduction || 0;
    if (heatReduction > 0) {
        const heatReduced = Math.round(gameState.heat * heatReduction);
        if (heatReduced > 0) {
            gameState.heat = Math.max(0, gameState.heat - heatReduced);
            heatReason += ` (Burner network: -${heatReduced})`;
        }
    }
    
    // Apply crew cred bonus
    if (crewBonuses.cred > 0) {
        gameState.cred = clamp(0, 120, gameState.cred + crewBonuses.cred);
        credReason += ` (+${crewBonuses.cred} from crew)`;
    }
    
    // Apply crew heat reduction
    if (crewBonuses.heat < 0) {
        gameState.heat = clamp(0, 120, gameState.heat + crewBonuses.heat);
        heatReason += ` (${crewBonuses.heat} from lookout)`;
    }
    
    // Record transaction
    if (profit >= 0) {
        recordTransaction("income", `Night ${gameState.day} sales`, revenue);
        recordTransaction("expense", `Night ${gameState.day} costs`, totalCost);
    } else {
        recordTransaction("expense", `Night ${gameState.day} net loss`, Math.abs(profit));
    }
    
    // Update stats
    gameState.office.stats.daysActive = gameState.day;
    if (profit > gameState.office.stats.bestNight) {
        gameState.office.stats.bestNight = profit;
    }
    
    // Apply bust protection from upgrades
    const bustThreshold = 100 + (upgradeEffects.bust_protection ? upgradeEffects.bust_protection * 100 : 0);
    
    // Check end conditions
    if (gameState.cash < 0) {
        triggerBankruptcy();
    } else if (gameState.heat >= bustThreshold) {
        triggerBust();
    } else {
        gameState.day += 1;
        generateForecast();
        
        // Award XP for completing a night
        awardXP(25 + Math.floor(profit / 100));
        
        // Check achievements
        const lastEntry = gameState.history[gameState.history.length - 1];
        checkAchievements(lastEntry);
    }
    
    updateUI();
    updateXPBar();
    
    // Show debrief after a short delay
    if (gameState.status === "playing") {
        setTimeout(() => showEnhancedDebrief(gameState.lastNight), 400);
    }
}

function computeDemand({ price, purity, strategy, crewBonuses = {} }) {
    const forecast = gameState.currentForecast;
    let demand = gameState.config.baseDemand;
    
    demand *= forecast.weatherMod;
    demand *= forecast.trafficMod;
    demand *= strategy.demandMod;
    
    if (forecast.event?.demandModifier) {
        demand *= forecast.event.demandModifier;
    }
    
    // Apply crew reach bonus
    const reachBonus = crewBonuses.reach || 0;
    demand *= (1 + reachBonus);
    
    // Apply crew quality bonus to purity effect
    const qualityBonus = crewBonuses.quality || 0;
    const effectivePurity = purity + qualityBonus;
    const purityImpact = 0.6 + (effectivePurity - 60) * 0.01;
    demand *= purityImpact;
    
    // Apply crew price tolerance bonus
    const priceBonus = crewBonuses.price || 0;
    const priceImpact = Math.max(0.25, 1.4 + priceBonus - price / 120);
    demand *= priceImpact;
    
    const credImpact = 0.65 + gameState.cred / 150;
    demand *= credImpact;
    
    const heatImpact = Math.max(0.35, 1.05 - gameState.heat / 80);
    demand *= heatImpact;
    
    const randomness = 0.8 + Math.random() * 0.45;
    demand *= randomness;
    
    return Math.max(0, demand);
}

function adjustCred({ units, unitsSold, price, profit, purity }) {
    let delta = 0;
    let reasons = [];
    const sellThrough = units === 0 ? 0 : unitsSold / units;
    
    if (units > 0) {
        if (sellThrough > 0.95) {
            delta += 4;
            reasons.push("Sold out");
            addLog("Street Buzz", "Word is you sold out before sunrise.", "positive");
        } else if (sellThrough > 0.75) {
            delta += 2;
            reasons.push("Strong sales");
        } else if (sellThrough < 0.4) {
            delta -= 2;
            reasons.push("Weak sales");
        }
        
        if (units - unitsSold > units * 0.4) {
            delta -= 1;
            reasons.push("Excess inventory");
        }
    }
    
    if (price >= 120 && sellThrough < 0.5) {
        delta -= 2;
        reasons.push("Overpriced");
        addLog("Gossip", "Clients blasted the premium price in their group chats.", "negative");
    }
    
    if (purity >= 90 && sellThrough > 0.6) {
        delta += 2;
        reasons.push("Quality praised");
        addLog("Chemists", "People praised the clean cut. Cred rising.", "positive");
    }
    
    if (profit < 0) {
        delta -= 2;
        reasons.push("Lost money");
    }
    
    gameState.cred = clamp(0, 120, gameState.cred + delta);
    
    return { delta, reason: reasons.join(", ") || "Steady reputation" };
}

function adjustHeat({ strategy, price, purity, units, unitsSold }) {
    let delta = strategy.heatMod;
    let reasons = [strategy.label];
    const sellThrough = units === 0 ? 0 : unitsSold / Math.max(1, units);
    
    if (price > 150) {
        delta += 3;
        reasons.push("High prices draw attention");
    } else if (price < 60) {
        delta -= 1;
        reasons.push("Low profile pricing");
    }
    
    if (purity >= 90) {
        delta += 2;
        reasons.push("Premium quality noticed");
    }
    
    if (sellThrough > 0.9 && unitsSold > 80) {
        delta += 2;
        reasons.push("High volume activity");
    }
    
    if (sellThrough < 0.25) {
        delta -= 2;
        reasons.push("Stayed quiet");
    }
    
    if (unitsSold < 30 && strategy.id === "solo") {
        delta -= 1;
        reasons.push("Low profile moves");
    }
    
    delta = Math.max(-6, Math.min(10, delta));
    gameState.heat = clamp(0, 120, gameState.heat + delta);
    
    if (delta <= -2) {
        addLog("Low Profile", "Heat cooled off while you laid low.", "positive");
    } else if (delta >= 5) {
        addLog("Heat Spike", "Word is task forces are hearing your name.", "negative");
    }
    
    return { delta, reason: reasons.slice(0, 2).join(", ") };
}

function triggerBankruptcy() {
    gameState.status = "bankrupt";
    elements.runDay.disabled = true;
    elements.restartBtn?.classList.remove("hidden");
    addLog("Game Over", `Cash dipped below zero on night ${gameState.day}. Liquidate, regroup, try again.`, "negative");
}

function triggerBust() {
    gameState.status = "busted";
    elements.runDay.disabled = true;
    elements.restartBtn?.classList.remove("hidden");
    addLog("Busted", `Heat maxed out on night ${gameState.day}. Tactical teams raided the lab.`, "negative");
}

// =====================================================
// UI UPDATES
// =====================================================

function updateUI() {
    updateStatDisplays();
    updateGauges();
    updateForecastDisplay();
    renderHistory();
    renderLogs();
    drawChart();
}

function updateStatDisplays() {
    // Day
    if (elements.dayDisplay) {
        elements.dayDisplay.textContent = gameState.day;
    }
    
    // Act label
    if (elements.actLabel) {
        const act = gameState.day <= 7 ? "I" : gameState.day <= 14 ? "II" : gameState.day <= 21 ? "III" : "IV";
        elements.actLabel.textContent = `Act ${act}`;
    }
    
    // Cash
    if (elements.cashDisplay) {
        elements.cashDisplay.textContent = formatCurrency(gameState.cash);
    }
    
    // Cash trend
    if (elements.cashTrend && gameState.cashTimeline.length > 1) {
        const prev = gameState.cashTimeline[gameState.cashTimeline.length - 2];
        const delta = gameState.cash - prev;
        if (delta !== 0) {
            elements.cashTrend.textContent = `${delta >= 0 ? "↑" : "↓"} ${formatCurrency(Math.abs(delta))}`;
            elements.cashTrend.style.color = delta >= 0 ? "var(--color-success)" : "var(--color-danger)";
        }
    }
}

function updateGauges() {
    // Cred gauge
    updateGauge(
        elements.credArc,
        elements.credNeedle,
        elements.credValue,
        elements.credTier,
        elements.credGauge,
        gameState.cred,
        120,
        credTiers
    );
    
    // Heat gauge
    updateGauge(
        elements.heatArc,
        elements.heatNeedle,
        elements.heatValue,
        elements.heatTier,
        elements.heatGauge,
        gameState.heat,
        100,
        heatTiers
    );
}

function updateGauge(arcEl, needleEl, valueEl, tierEl, containerEl, value, max, tiers) {
    if (!arcEl) return;
    
    const percent = Math.min(value / max, 1);
    
    // Arc path length calculation
    // The arc is a semicircle with radius 40, from 10,55 to 90,55
    // Arc length = π * r = π * 40 ≈ 125.66
    const arcLength = Math.PI * 40;
    const dashOffset = arcLength * (1 - percent);
    
    arcEl.style.strokeDasharray = arcLength;
    arcEl.style.strokeDashoffset = dashOffset;
    
    // Needle rotation (-90 to 90 degrees, where -90 is left, 90 is right)
    if (needleEl) {
        const angle = -90 + (180 * percent);
        // Calculate needle position on arc
        const radian = (angle - 90) * (Math.PI / 180);
        const cx = 50 + 40 * Math.cos(radian);
        const cy = 55 + 40 * Math.sin(radian);
        needleEl.setAttribute("cx", cx);
        needleEl.setAttribute("cy", cy);
    }
    
    // Value text
    if (valueEl) {
        valueEl.textContent = Math.round(value);
    }
    
    // Tier label
    if (tierEl) {
        const tier = tiers.find(t => value >= t.min && value <= t.max) || tiers[0];
        tierEl.textContent = tier.name;
        if (tier.class) {
            tierEl.className = `gauge-tier ${tier.class}`;
        }
    }
    
    // Update ARIA
    if (containerEl) {
        containerEl.setAttribute("aria-valuenow", Math.round(value));
    }
}

function updateForecastDisplay() {
    const forecast = gameState.currentForecast;
    
    // Vibe
    if (elements.weatherDisplay) {
        elements.weatherDisplay.textContent = forecast.weather;
    }
    if (elements.weatherDetail) {
        elements.weatherDetail.textContent = forecast.weatherDescription;
    }
    
    // Traffic
    if (elements.trafficDisplay) {
        elements.trafficDisplay.textContent = forecast.traffic;
    }
    if (elements.trafficDetail) {
        elements.trafficDetail.textContent = forecast.trafficDescription;
    }
    
    // Event
    if (elements.eventDisplay) {
        elements.eventDisplay.textContent = forecast.event ? forecast.event.name : "None tonight";
    }
    if (elements.eventDetail) {
        elements.eventDetail.textContent = forecast.event ? forecast.event.description : "Run your plan.";
    }
    if (elements.eventCard) {
        elements.eventCard.classList.toggle("no-event", !forecast.event);
    }
    
    // Forecast text
    if (elements.forecastText) {
        const vibeText = forecast.weatherMod >= 1.2 ? "Energy is high" : 
                        forecast.weatherMod <= 0.85 ? "Block feels quiet" : "Vibe is stable";
        const flowText = forecast.trafficMod >= 1.2 ? "expect heavy foot traffic" :
                        forecast.trafficMod <= 0.8 ? "light crowds tonight" : "normal flow expected";
        const eventText = forecast.event ? ` Watch out: ${forecast.event.name}.` : "";
        
        elements.forecastText.textContent = `${vibeText}, ${flowText}.${eventText}`;
    }
    
    // Forecast chips
    if (elements.forecastChips) {
        elements.forecastChips.innerHTML = "";
        
        // Demand chip
        const demandMod = forecast.weatherMod * forecast.trafficMod * (forecast.event?.demandModifier || 1);
        let demandChip = "neutral";
        let demandText = "Demand ↔";
        if (demandMod >= 1.3) {
            demandChip = "up";
            demandText = "Demand ↑↑";
        } else if (demandMod >= 1.1) {
            demandChip = "up";
            demandText = "Demand ↑";
        } else if (demandMod <= 0.7) {
            demandChip = "down";
            demandText = "Demand ↓↓";
        } else if (demandMod <= 0.9) {
            demandChip = "down";
            demandText = "Demand ↓";
        }
        
        const demandEl = document.createElement("span");
        demandEl.className = `forecast-chip chip-${demandChip}`;
        demandEl.textContent = demandText;
        elements.forecastChips.appendChild(demandEl);
        
        // Risk chip from event
        if (forecast.event) {
            const riskEl = document.createElement("span");
            if (forecast.event.heatDelta >= 5) {
                riskEl.className = "forecast-chip chip-warning";
                riskEl.textContent = "Risk ↑↑";
            } else if (forecast.event.heatDelta > 0) {
                riskEl.className = "forecast-chip chip-warning";
                riskEl.textContent = "Risk ↑";
            } else if (forecast.event.heatDelta < 0) {
                riskEl.className = "forecast-chip chip-up";
                riskEl.textContent = "Risk ↓";
            }
            if (forecast.event.heatDelta !== 0) {
                elements.forecastChips.appendChild(riskEl);
            }
        }
        
        // Heat warning
        if (gameState.heat >= 75) {
            const heatEl = document.createElement("span");
            heatEl.className = "forecast-chip chip-warning";
            heatEl.textContent = "🚨 Critical Heat";
            elements.forecastChips.appendChild(heatEl);
        }
    }
    
    // Rumor - now smarter based on game state
    if (elements.forecastRumor) {
        const rumorText = elements.forecastRumor.querySelector(".rumor-text");
        if (rumorText) {
            rumorText.textContent = getSmartRumor(forecast);
        }
    }
}

function getSmartRumor(forecast) {
    // Priority rumors based on game state
    const smartRumors = [];
    
    // Event-based rumor
    if (forecast.event) {
        return `Intel: ${forecast.event.description}`;
    }
    
    // Market condition rumors
    if (gameState.market?.activeCondition) {
        const cond = gameState.market.activeCondition;
        smartRumors.push(`Market whispers: ${cond.name} continues for ${cond.daysRemaining} more days.`);
    }
    
    // Rival rumors
    if (gameState.rivals?.active?.length > 0) {
        const rival = gameState.rivals.active[0];
        if (rival.threat > 30) {
            smartRumors.push(`Word is ${rival.name} is making moves. Stay sharp.`);
        }
    }
    
    // Challenge hints
    if (gameState.challenges?.daily && !gameState.challenges.daily.completed) {
        smartRumors.push(`Challenge opportunity: ${gameState.challenges.daily.desc}`);
    }
    
    // Territory event hints
    const activeEvents = gameState.empire?.territories
        ?.filter(t => t.owned && t.activeEvents?.length > 0)
        .flatMap(t => t.activeEvents);
    if (activeEvents && activeEvents.length > 0) {
        const event = activeEvents[0];
        smartRumors.push(`${event.icon} ${event.name} affecting your turf.`);
    }
    
    // Heat warnings
    if (gameState.heat > 70) {
        smartRumors.push("Cops are asking questions. Might want to lay low.");
    } else if (gameState.heat > 50) {
        smartRumors.push("Some heat on the block. Watch your step.");
    }
    
    // Cred opportunities
    if (gameState.cred < 30) {
        smartRumors.push("You're unknown out here. Quality product builds reputation.");
    } else if (gameState.cred > 80) {
        smartRumors.push("People asking for you by name. Premium prices possible.");
    }
    
    // Prestige hints
    if (canPrestige && canPrestige()) {
        smartRumors.push("You've made it. Consider starting fresh with permanent bonuses.");
    }
    
    // If we have smart rumors, pick one; otherwise use generic
    if (smartRumors.length > 0) {
        return smartRumors[Math.floor(Math.random() * smartRumors.length)];
    }
    
    // Fall back to generic rumors
    return rumors[Math.floor(Math.random() * rumors.length)];
}

function renderHistory() {
    if (!elements.historyBody) return;
    
    const rows = gameState.history.slice(-6).reverse();
    
    if (rows.length === 0) {
        elements.historyBody.innerHTML = '<tr class="empty-row"><td colspan="5">No runs yet</td></tr>';
        return;
    }
    
    elements.historyBody.innerHTML = rows.map((entry, index) => {
        const profitClass = entry.profit >= 0 ? "trend-up" : "trend-down";
        const trendIcon = entry.profit >= 0 ? "↑" : "↓";
        
        // Mini sparkline using Unicode blocks
        const sparkline = generateSparkline(index, rows);
        
        return `
            <tr>
                <td>${entry.day}</td>
                <td>$${entry.price.toFixed(0)}</td>
                <td>${entry.unitsSold}/${entry.unitsPrepared}</td>
                <td class="${profitClass}">${formatCurrency(entry.profit)}</td>
                <td><span class="sparkline">${sparkline}</span> <span class="${profitClass}">${trendIcon}</span></td>
            </tr>
        `;
    }).join("");
}

function generateSparkline(index, rows) {
    // Simple text-based sparkline
    const recentProfits = rows.slice(0, Math.min(5, rows.length)).map(r => r.profit);
    if (recentProfits.length < 2) return "";
    
    const min = Math.min(...recentProfits);
    const max = Math.max(...recentProfits);
    const range = max - min || 1;
    
    const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    
    return recentProfits.reverse().map(p => {
        const normalized = (p - min) / range;
        const blockIndex = Math.floor(normalized * (blocks.length - 1));
        return blocks[blockIndex];
    }).join("");
}

function renderLogs() {
    if (!elements.logFeed) return;
    
    const logs = gameState.logs.slice(0, 10);
    
    if (logs.length === 0) {
        elements.logFeed.innerHTML = '<div class="log-empty">Run your first night to see results here.</div>';
        return;
    }
    
    elements.logFeed.innerHTML = logs.map(entry => `
        <article class="log-entry log-${entry.type || 'info'}">
            <strong>${entry.title}</strong>
            <span>${entry.message}</span>
        </article>
    `).join("");
}

function drawChart() {
    if (!chartCtx || !elements.chart) return;
    
    const { width, height } = elements.chart;
    chartCtx.clearRect(0, 0, width, height);
    
    // Background
    const bgGradient = chartCtx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, "rgba(8, 6, 18, 0.8)");
    bgGradient.addColorStop(1, "rgba(5, 5, 12, 0.9)");
    chartCtx.fillStyle = bgGradient;
    chartCtx.fillRect(0, 0, width, height);
    
    const data = gameState.cashTimeline;
    if (data.length < 2) {
        // Draw placeholder
        chartCtx.fillStyle = "rgba(148, 163, 184, 0.3)";
        chartCtx.font = "14px Inter, sans-serif";
        chartCtx.textAlign = "center";
        chartCtx.fillText("Chart updates after first run", width / 2, height / 2);
        return;
    }
    
    const padding = 40;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = Math.max(100, max - min);
    
    // Grid lines
    chartCtx.strokeStyle = "rgba(148, 163, 184, 0.1)";
    chartCtx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + (i / 4) * (height - padding * 2);
        chartCtx.beginPath();
        chartCtx.moveTo(padding, y);
        chartCtx.lineTo(width - padding, y);
        chartCtx.stroke();
    }
    
    // Data line with gradient
    const lineGradient = chartCtx.createLinearGradient(0, 0, width, 0);
    lineGradient.addColorStop(0, "#22d3ee");
    lineGradient.addColorStop(1, "#8b5cf6");
    
    chartCtx.strokeStyle = lineGradient;
    chartCtx.lineWidth = 3;
    chartCtx.lineCap = "round";
    chartCtx.lineJoin = "round";
    chartCtx.beginPath();
    
    data.forEach((value, index) => {
        const x = padding + (index / (data.length - 1)) * (width - padding * 2);
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        
        if (index === 0) {
            chartCtx.moveTo(x, y);
        } else {
            chartCtx.lineTo(x, y);
        }
    });
    chartCtx.stroke();
    
    // Fill area under line
    const fillGradient = chartCtx.createLinearGradient(0, padding, 0, height - padding);
    fillGradient.addColorStop(0, "rgba(34, 211, 238, 0.2)");
    fillGradient.addColorStop(1, "rgba(34, 211, 238, 0)");
    
    chartCtx.lineTo(padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2), height - padding);
    chartCtx.lineTo(padding, height - padding);
    chartCtx.closePath();
    chartCtx.fillStyle = fillGradient;
    chartCtx.fill();
    
    // Data points
    data.forEach((value, index) => {
        const x = padding + (index / (data.length - 1)) * (width - padding * 2);
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        
        chartCtx.beginPath();
        chartCtx.arc(x, y, 4, 0, Math.PI * 2);
        chartCtx.fillStyle = index === data.length - 1 ? "#22d3ee" : "rgba(34, 211, 238, 0.6)";
        chartCtx.fill();
    });
    
    // Y-axis labels
    chartCtx.fillStyle = "rgba(148, 163, 184, 0.6)";
    chartCtx.font = "11px Inter, sans-serif";
    chartCtx.textAlign = "right";
    chartCtx.textBaseline = "middle";
    
    const yLabels = [max, (max + min) / 2, min];
    yLabels.forEach((val, i) => {
        const y = padding + (i / 2) * (height - padding * 2);
        chartCtx.fillText(`$${Math.round(val)}`, padding - 8, y);
    });
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function addLog(title, message, type = "info") {
    gameState.logs.unshift({ title, message, type });
    if (gameState.logs.length > 50) {
        gameState.logs.length = 50;
    }
}

function formatCurrency(value) {
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    return formatter.format(value);
}

function clamp(min, max, value) {
    return Math.max(min, Math.min(max, value));
}

// =====================================================
// SCREEN NAVIGATION
// =====================================================

function switchScreen(screenId) {
    gameState.currentScreen = screenId;
    
    // Hide all screens
    document.querySelectorAll(".game-screen").forEach(screen => {
        screen.classList.remove("active");
    });
    
    // Show selected screen
    const targetScreen = document.getElementById(`${screenId}Screen`);
    if (targetScreen) {
        targetScreen.classList.add("active");
    }
    
    // Update nav active state
    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle("active", link.dataset.view === screenId);
    });
    
    // Render screen-specific content
    if (screenId === "empire") {
        renderEmpireView();
    } else if (screenId === "office") {
        renderOfficeView();
    }
}

// =====================================================
// EMPIRE VIEW FUNCTIONS
// =====================================================

function renderEmpireView() {
    renderTerritories();
    renderAssets();
    renderCrew();
    updateTerritoryIncome();
}

function renderTerritories() {
    if (!elements.territoriesGrid) return;
    
    elements.territoriesGrid.innerHTML = gameState.empire.territories.map(territory => {
        const statusClass = territory.owned ? "owned" : "available";
        const statusText = territory.owned ? "Owned" : `$${territory.cost.toLocaleString()}`;
        const canAfford = gameState.cash >= territory.cost;
        
        // Active events on this territory
        const events = territory.activeEvents || [];
        const eventsHtml = events.length > 0 ? `
            <div class="territory-events">
                ${events.map(e => `
                    <span class="territory-event-badge" title="${e.description}">
                        ${e.icon} ${e.daysRemaining}d
                    </span>
                `).join('')}
            </div>
        ` : '';
        
        return `
            <article class="territory-card ${territory.owned ? "owned" : ""} ${!territory.owned && !canAfford ? "locked" : ""}">
                <div class="territory-header">
                    <span class="territory-name">${territory.icon} ${territory.name}</span>
                    <span class="territory-status ${statusClass}">${statusText}</span>
                </div>
                <div class="territory-stats">
                    <span class="territory-stat">
                        <span>Revenue Bonus</span>
                        <span>+${Math.round((territory.revenue - 1) * 100)}%</span>
                    </span>
                    <span class="territory-stat">
                        <span>Local Heat</span>
                        <span>${territory.heat}</span>
                    </span>
                </div>
                ${eventsHtml}
                ${!territory.owned ? `
                    <div class="territory-action">
                        <button class="territory-btn" 
                                onclick="buyTerritory('${territory.id}')"
                                ${!canAfford ? "disabled" : ""}>
                            ${canAfford ? "Expand Here" : "Not Enough Cash"}
                        </button>
                    </div>
                ` : ""}
            </article>
        `;
    }).join("");
}

function buyTerritory(territoryId) {
    const territory = gameState.empire.territories.find(t => t.id === territoryId);
    if (!territory || territory.owned || gameState.cash < territory.cost) return;
    
    gameState.cash -= territory.cost;
    territory.owned = true;
    
    // Record transaction
    recordTransaction("expense", `Acquired ${territory.name}`, territory.cost);
    
    addLog("Empire", `Expanded into ${territory.name}. New revenue stream active.`, "positive");
    
    // Check achievements
    const ownedCount = gameState.empire.territories.filter(t => t.owned).length;
    if (ownedCount >= 3) {
        unlockAchievement("empire");
    }
    
    awardXP(100);
    updateUI();
    renderEmpireView();
}

function updateTerritoryIncome() {
    if (!elements.territoryIncomeValue) return;
    
    const ownedTerritories = gameState.empire.territories.filter(t => t.owned);
    const totalBonus = ownedTerritories.reduce((sum, t) => sum + (t.revenue - 1), 0);
    const passiveIncome = Math.round(totalBonus * 50); // Base passive income per territory bonus
    
    elements.territoryIncomeValue.textContent = `$${passiveIncome}/day`;
}

function renderAssets() {
    if (!elements.assetsGrid) return;
    
    elements.assetsGrid.innerHTML = gameState.empire.assets.map(asset => {
        const levelPercent = (asset.level / asset.maxLevel) * 100;
        const isMaxed = asset.level >= asset.maxLevel;
        const upgradeCost = asset.upgradeCost * (asset.level + 1);
        const canAfford = gameState.cash >= upgradeCost;
        
        return `
            <article class="asset-card">
                <div class="asset-icon">${asset.icon}</div>
                <div class="asset-info">
                    <span class="asset-name">${asset.name}</span>
                    <span class="asset-level">Level ${asset.level}/${asset.maxLevel}</span>
                    <div class="asset-level-bar">
                        <div class="asset-level-fill" style="width: ${levelPercent}%"></div>
                    </div>
                </div>
                <div class="asset-action">
                    <button class="asset-btn" 
                            onclick="upgradeAsset('${asset.id}')"
                            ${isMaxed || !canAfford ? "disabled" : ""}>
                        ${isMaxed ? "Maxed" : `$${upgradeCost.toLocaleString()}`}
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

function upgradeAsset(assetId) {
    const asset = gameState.empire.assets.find(a => a.id === assetId);
    if (!asset || asset.level >= asset.maxLevel) return;
    
    const cost = asset.upgradeCost * (asset.level + 1);
    if (gameState.cash < cost) return;
    
    gameState.cash -= cost;
    asset.level += 1;
    
    recordTransaction("expense", `Upgraded ${asset.name} to Lvl ${asset.level}`, cost);
    
    addLog("Assets", `${asset.name} upgraded to level ${asset.level}.`, "positive");
    
    // Check achievement
    if (asset.level >= asset.maxLevel) {
        unlockAchievement("upgraded");
    }
    
    // Apply effects based on asset type
    applyAssetEffects();
    
    awardXP(75);
    updateUI();
    renderEmpireView();
}

function applyAssetEffects() {
    // Safehouse increases max units
    const safehouse = gameState.empire.assets.find(a => a.id === "safehouse");
    if (safehouse) {
        gameState.config.maxUnits = 600 + (safehouse.level * safehouse.bonus);
    }
}

function renderCrew() {
    if (!elements.crewGrid) return;
    
    elements.crewGrid.innerHTML = gameState.progression.crew.map(member => {
        const canAfford = gameState.cash >= member.cost;
        const loyalty = member.loyalty || 50;
        const isLoyal = member.loyaltyBonus;
        
        // Loyalty bar only for hired crew
        const loyaltyHtml = member.hired ? `
            <div class="crew-loyalty">
                <div class="loyalty-bar">
                    <div class="loyalty-fill" style="width: ${loyalty}%"></div>
                </div>
                <span class="loyalty-label">${isLoyal ? '⭐ Loyal' : `Loyalty: ${loyalty}%`}</span>
            </div>
        ` : '';
        
        // Bonus display with loyalty multiplier
        const bonusText = isLoyal ? `${member.desc} (×1.5)` : member.desc;
        
        return `
            <article class="crew-card ${member.hired ? "hired" : ""} ${isLoyal ? "loyal" : ""}">
                <div class="crew-avatar">${member.icon}</div>
                <span class="crew-name">${member.name}</span>
                <span class="crew-role">${member.role}</span>
                <span class="crew-bonus">${bonusText}</span>
                ${loyaltyHtml}
                <button class="crew-btn ${member.hired ? "hired" : ""}"
                        onclick="hireCrew('${member.id}')"
                        ${member.hired || !canAfford ? "disabled" : ""}>
                    ${member.hired ? "On Payroll" : `Hire $${member.cost}`}
                </button>
            </article>
        `;
    }).join("");
}

function hireCrew(crewId) {
    const member = gameState.progression.crew.find(c => c.id === crewId);
    if (!member || member.hired || gameState.cash < member.cost) return;
    
    gameState.cash -= member.cost;
    member.hired = true;
    
    recordTransaction("expense", `Hired ${member.name}`, member.cost);
    
    addLog("Crew", `${member.name} joined the operation.`, "positive");
    
    // Check achievement
    const hiredCount = gameState.progression.crew.filter(c => c.hired).length;
    if (hiredCount >= 3) {
        unlockAchievement("crew_boss");
    }
    
    awardXP(50);
    updateUI();
    renderCrew();
}

// =====================================================
// OFFICE VIEW FUNCTIONS
// =====================================================

function renderOfficeView() {
    renderOfficeStats();
    renderLedger("all");
    renderInvestments();
    renderUpgrades();
    renderAchievements();
    renderPrestigeUI();
}

function renderOfficeStats() {
    const stats = getDetailedStats();
    
    if (elements.statTotalEarned) {
        elements.statTotalEarned.textContent = formatCurrency(gameState.office.stats.totalEarned);
    }
    if (elements.statTotalSpent) {
        elements.statTotalSpent.textContent = formatCurrency(gameState.office.stats.totalSpent);
    }
    if (elements.statDaysActive) {
        elements.statDaysActive.textContent = gameState.office.stats.daysActive;
    }
    if (elements.statBestNight) {
        elements.statBestNight.textContent = formatCurrency(gameState.office.stats.bestNight);
    }
    
    // New extended stats
    const avgProfitEl = document.getElementById("statAvgProfit");
    if (avgProfitEl) {
        avgProfitEl.textContent = formatCurrency(stats.avgProfit);
        avgProfitEl.style.color = stats.avgProfit >= 0 ? "var(--color-success)" : "var(--color-danger)";
    }
    
    const winRateEl = document.getElementById("statWinRate");
    if (winRateEl) {
        const winRate = stats.totalNights > 0 ? Math.round((stats.profitableNights / stats.totalNights) * 100) : 0;
        winRateEl.textContent = `${winRate}%`;
        winRateEl.style.color = winRate >= 50 ? "var(--color-success)" : "var(--color-danger)";
    }
    
    const bagsSoldEl = document.getElementById("statBagsSold");
    if (bagsSoldEl) {
        bagsSoldEl.textContent = stats.totalSold.toLocaleString();
    }
    
    const netWorthEl = document.getElementById("statNetWorth");
    if (netWorthEl) {
        netWorthEl.textContent = formatCurrency(stats.netWorth);
    }
    
    // Sparklines
    renderSparklines();
    
    // Streak display
    const streakEl = document.getElementById("streakDisplay");
    if (streakEl) {
        const streak = stats.currentStreak;
        streakEl.querySelector(".streak-text").textContent = `${streak} night profit streak`;
        streakEl.style.display = streak > 0 ? "flex" : "none";
    }
}

function renderSparklines() {
    // Profit sparkline
    const profitSparkEl = document.getElementById("profitSparkline");
    if (profitSparkEl && gameState.history.length > 1) {
        const profits = gameState.history.slice(-10).map(h => h.profit);
        profitSparkEl.textContent = generateSparklineFromArray(profits);
    }
    
    // Cred sparkline
    const credSparkEl = document.getElementById("credSparkline");
    if (credSparkEl && gameState.credTimeline.length > 1) {
        const creds = gameState.credTimeline.slice(-10);
        credSparkEl.textContent = generateSparklineFromArray(creds);
    }
    
    // Heat sparkline
    const heatSparkEl = document.getElementById("heatSparkline");
    if (heatSparkEl && gameState.heatTimeline.length > 1) {
        const heats = gameState.heatTimeline.slice(-10);
        heatSparkEl.textContent = generateSparklineFromArray(heats);
    }
}

function generateSparklineFromArray(data) {
    if (data.length < 2) return "▅▅▅▅▅▅▅▅";
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    
    return data.map(value => {
        const normalized = (value - min) / range;
        const blockIndex = Math.floor(normalized * (blocks.length - 1));
        return blocks[blockIndex];
    }).join("");
}

function renderLedger(filter = "all") {
    if (!elements.ledgerBody) return;
    
    let entries = gameState.office.ledger.slice(-20).reverse();
    
    if (filter === "income") {
        entries = entries.filter(e => e.type === "income");
    } else if (filter === "expense") {
        entries = entries.filter(e => e.type === "expense");
    }
    
    if (entries.length === 0) {
        elements.ledgerBody.innerHTML = '<tr class="empty-row"><td colspan="4">No transactions yet</td></tr>';
        return;
    }
    
    elements.ledgerBody.innerHTML = entries.map(entry => `
        <tr class="ledger-entry ${entry.type}">
            <td>${entry.day}</td>
            <td>${entry.type === "income" ? "📈" : "📉"}</td>
            <td>${entry.description}</td>
            <td class="ledger-amount">${entry.type === "income" ? "+" : "-"}${formatCurrency(Math.abs(entry.amount))}</td>
        </tr>
    `).join("");
}

function recordTransaction(type, description, amount) {
    gameState.office.ledger.push({
        day: gameState.day,
        type,
        description,
        amount,
    });
    
    if (type === "income") {
        gameState.office.stats.totalEarned += amount;
        
        // Check millionaire achievement
        if (gameState.office.stats.totalEarned >= 100000) {
            unlockAchievement("millionaire");
        }
    } else {
        gameState.office.stats.totalSpent += amount;
    }
}

function renderInvestments() {
    if (!elements.investmentsGrid) return;
    
    elements.investmentsGrid.innerHTML = gameState.office.investments.map(inv => {
        const canAfford = gameState.cash >= inv.cost;
        
        return `
            <article class="investment-card ${inv.owned ? "owned" : ""}">
                <div class="investment-icon">${inv.icon}</div>
                <div class="investment-info">
                    <span class="investment-name">${inv.name}</span>
                    <span class="investment-return">+${formatCurrency(inv.dailyReturn)}/day</span>
                </div>
                <div class="investment-action">
                    <button class="investment-btn ${inv.owned ? "owned" : ""}"
                            onclick="buyInvestment('${inv.id}')"
                            ${inv.owned || !canAfford ? "disabled" : ""}>
                        ${inv.owned ? "Earning" : formatCurrency(inv.cost)}
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

function buyInvestment(investmentId) {
    const inv = gameState.office.investments.find(i => i.id === investmentId);
    if (!inv || inv.owned || gameState.cash < inv.cost) return;
    
    gameState.cash -= inv.cost;
    inv.owned = true;
    
    recordTransaction("expense", `Purchased ${inv.name}`, inv.cost);
    
    addLog("Investments", `${inv.name} is now generating passive income.`, "positive");
    
    // Check achievement
    unlockAchievement("investor");
    
    awardXP(150);
    updateUI();
    renderInvestments();
}

function renderUpgrades() {
    if (!elements.upgradesGrid) return;
    
    elements.upgradesGrid.innerHTML = gameState.office.upgrades.map(upgrade => {
        const canAfford = gameState.cash >= upgrade.cost;
        
        return `
            <article class="upgrade-card ${upgrade.purchased ? "purchased" : ""}">
                <div class="upgrade-icon">${upgrade.icon}</div>
                <div class="upgrade-info">
                    <span class="upgrade-name">${upgrade.name}</span>
                    <span class="upgrade-effect">${upgrade.desc}</span>
                </div>
                <div class="upgrade-action">
                    <button class="upgrade-btn ${upgrade.purchased ? "purchased" : ""}"
                            onclick="buyUpgrade('${upgrade.id}')"
                            ${upgrade.purchased || !canAfford ? "disabled" : ""}>
                        ${upgrade.purchased ? "Active" : formatCurrency(upgrade.cost)}
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

function buyUpgrade(upgradeId) {
    const upgrade = gameState.office.upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.purchased || gameState.cash < upgrade.cost) return;
    
    gameState.cash -= upgrade.cost;
    upgrade.purchased = true;
    
    recordTransaction("expense", `Purchased ${upgrade.name}`, upgrade.cost);
    
    addLog("Upgrades", `${upgrade.name} is now active.`, "positive");
    
    awardXP(100);
    updateUI();
    renderUpgrades();
}

function renderAchievements() {
    if (!elements.achievementsGrid) return;
    
    const achievements = gameState.progression.achievements;
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    
    if (elements.achievementCount) {
        elements.achievementCount.textContent = `${unlockedCount}/${achievements.length}`;
    }
    
    elements.achievementsGrid.innerHTML = achievements.map(ach => `
        <article class="achievement-tile ${ach.unlocked ? "unlocked" : "locked"}">
            <div class="achievement-icon">${ach.unlocked ? ach.icon : "🔒"}</div>
            <span class="achievement-name">${ach.name}</span>
            <span class="achievement-desc">${ach.desc}</span>
        </article>
    `).join("");
}

// =====================================================
// PROGRESSION SYSTEM
// =====================================================

function awardXP(amount) {
    // Apply prestige XP multiplier
    const xpAmount = Math.floor(amount * getPrestigeXPMultiplier());
    gameState.progression.xp += xpAmount;
    
    // Check for level up
    while (gameState.progression.xp >= gameState.progression.xpToNext) {
        gameState.progression.xp -= gameState.progression.xpToNext;
        gameState.progression.level += 1;
        gameState.progression.xpToNext = Math.floor(gameState.progression.xpToNext * 1.4);
        
        addLog("Level Up!", `You reached level ${gameState.progression.level}!`, "positive");
        showUnlockToast(`Level ${gameState.progression.level} reached!`);
        
        // Spawn level up particles
        spawnLevelUpParticles();
        
        // Check for unlocks
        checkUnlocks();
    }
    
    updateXPBar();
}

function updateXPBar() {
    if (elements.xpFill) {
        const percent = (gameState.progression.xp / gameState.progression.xpToNext) * 100;
        elements.xpFill.style.width = `${percent}%`;
    }
    if (elements.playerLevel) {
        elements.playerLevel.textContent = gameState.progression.level;
    }
}

function checkUnlocks() {
    gameState.progression.unlocks.forEach(unlock => {
        if (unlock.unlocked) return;
        
        if (unlock.requirement.level && gameState.progression.level >= unlock.requirement.level) {
            unlock.unlocked = true;
            showUnlockToast(`Unlocked: ${unlock.name}`);
            addLog("Unlocked", `${unlock.name} is now available!`, "positive");
        }
    });
}

function unlockAchievement(achievementId) {
    const achievement = gameState.progression.achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;
    
    achievement.unlocked = true;
    showUnlockToast(`Achievement: ${achievement.name}`);
    addLog("Achievement", `${achievement.name} - ${achievement.desc}`, "positive");
    
    // Spawn celebration particles
    spawnAchievementParticles();
    
    awardXP(achievement.xpReward);
}

function checkAchievements(nightData) {
    // First Night
    if (gameState.day === 2) {
        unlockAchievement("first_night");
    }
    
    // High Roller
    if (nightData && nightData.profit >= 10000) {
        unlockAchievement("high_roller");
    }
    
    // Ghost
    if (gameState.cred >= 80 && gameState.heat < 30) {
        unlockAchievement("ghost");
    }
    
    // Urban Legend
    if (gameState.cred >= 100) {
        unlockAchievement("legend");
    }
    
    // Clean Record
    if (gameState.heat === 0) {
        unlockAchievement("clean");
    }
    
    // Survivor
    if (gameState.day >= 20) {
        unlockAchievement("survivor");
    }
    
    // Sellout streak
    if (nightData && nightData.unitsSold === nightData.unitsPrepared && nightData.unitsPrepared > 0) {
        gameState.selloutStreak++;
        if (gameState.selloutStreak >= 5) {
            unlockAchievement("sellout");
        }
    } else {
        gameState.selloutStreak = 0;
    }
}

function showUnlockToast(message) {
    if (!elements.unlockToast || !elements.toastMessage) return;
    
    elements.toastMessage.textContent = message;
    elements.unlockToast.classList.remove("hidden");
    elements.unlockToast.classList.add("show");
    
    setTimeout(() => {
        elements.unlockToast.classList.remove("show");
        setTimeout(() => {
            elements.unlockToast.classList.add("hidden");
        }, 400);
    }, 3000);
}

// =====================================================
// APPLY GAME MODIFIERS
// =====================================================

function getCrewBonuses() {
    const bonuses = {
        reach: 0,
        quality: 0,
        heat: 0,
        price: 0,
        cred: 0,
    };
    
    gameState.progression.crew.forEach(member => {
        if (!member.hired) return;
        
        Object.keys(member.bonus).forEach(key => {
            if (bonuses[key] !== undefined) {
                bonuses[key] += member.bonus[key];
            }
        });
    });
    
    return bonuses;
}

function getUpgradeEffects() {
    const effects = {
        heat_reduction: 0,
        bust_protection: 0,
        forecast_accuracy: 0,
        quality_boost: 0,
        cost_reduction: 0,
    };
    
    gameState.office.upgrades.forEach(upgrade => {
        if (upgrade.purchased) {
            effects[upgrade.effect] = upgrade.value;
        }
    });
    
    return effects;
}

function getInvestmentIncome() {
    return gameState.office.investments
        .filter(inv => inv.owned)
        .reduce((sum, inv) => sum + inv.dailyReturn, 0);
}

// =====================================================
// SAVE/LOAD SYSTEM
// =====================================================

const SAVE_KEY = "microDose_saveGame";
const SAVE_VERSION = 2;

function saveGame() {
    const saveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        state: {
            day: gameState.day,
            cash: gameState.cash,
            cred: gameState.cred,
            heat: gameState.heat,
            status: gameState.status,
            history: gameState.history.slice(-20), // Keep last 20
            cashTimeline: gameState.cashTimeline.slice(-50),
            credTimeline: gameState.credTimeline.slice(-50),
            heatTimeline: gameState.heatTimeline.slice(-50),
            selectedDistribution: gameState.selectedDistribution,
            selloutStreak: gameState.selloutStreak,
            empire: gameState.empire,
            office: gameState.office,
            progression: gameState.progression,
            market: gameState.market,
            challenges: gameState.challenges,
            rivals: gameState.rivals,
            prestige: gameState.prestige,
        }
    };
    
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        showSaveIndicator();
        return true;
    } catch (e) {
        console.error("Failed to save game:", e);
        return false;
    }
}

function loadGame() {
    try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (!saved) return false;
        
        const saveData = JSON.parse(saved);
        if (!saveData || saveData.version !== SAVE_VERSION) {
            console.log("Save version mismatch, starting fresh");
            return false;
        }
        
        const s = saveData.state;
        gameState.day = s.day;
        gameState.cash = s.cash;
        gameState.cred = s.cred;
        gameState.heat = s.heat;
        gameState.status = s.status;
        gameState.history = s.history || [];
        gameState.cashTimeline = s.cashTimeline || [s.cash];
        gameState.credTimeline = s.credTimeline || [s.cred];
        gameState.heatTimeline = s.heatTimeline || [s.heat];
        gameState.selectedDistribution = s.selectedDistribution || "runners";
        gameState.selloutStreak = s.selloutStreak || 0;
        
        // Deep merge empire data
        if (s.empire) {
            gameState.empire.territories = s.empire.territories || gameState.empire.territories;
            gameState.empire.assets = s.empire.assets || gameState.empire.assets;
        }
        
        // Deep merge office data
        if (s.office) {
            gameState.office.ledger = s.office.ledger || [];
            gameState.office.investments = s.office.investments || gameState.office.investments;
            gameState.office.upgrades = s.office.upgrades || gameState.office.upgrades;
            gameState.office.stats = s.office.stats || gameState.office.stats;
        }
        
        // Deep merge progression data
        if (s.progression) {
            gameState.progression.level = s.progression.level || 1;
            gameState.progression.xp = s.progression.xp || 0;
            gameState.progression.xpToNext = s.progression.xpToNext || 500;
            gameState.progression.achievements = s.progression.achievements || gameState.progression.achievements;
            gameState.progression.unlocks = s.progression.unlocks || gameState.progression.unlocks;
            gameState.progression.crew = s.progression.crew || gameState.progression.crew;
        }
        
        // Load market data
        if (s.market) {
            gameState.market = s.market;
        }
        
        // Load challenges
        if (s.challenges) {
            gameState.challenges = s.challenges;
        }
        
        // Load rivals
        if (s.rivals) {
            gameState.rivals = s.rivals;
        }
        
        // Load prestige (always load, even if null - important for persistence)
        if (s.prestige) {
            gameState.prestige = s.prestige;
        }
        
        addLog("System", `Game loaded from Day ${gameState.day}.`, "info");
        return true;
        
    } catch (e) {
        console.error("Failed to load game:", e);
        return false;
    }
}

function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
    addLog("System", "Save data deleted.", "warning");
}

function showSaveIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "save-indicator";
    indicator.innerHTML = "💾 Saved";
    document.body.appendChild(indicator);
    
    requestAnimationFrame(() => {
        indicator.classList.add("show");
        setTimeout(() => {
            indicator.classList.remove("show");
            setTimeout(() => indicator.remove(), 300);
        }, 1500);
    });
}

// Auto-save every 30 seconds and on key events
let autoSaveInterval;
function startAutoSave() {
    autoSaveInterval = setInterval(() => {
        if (gameState.status === "playing") {
            saveGame();
        }
    }, 30000);
}

// =====================================================
// MARKET DYNAMICS SYSTEM
// =====================================================

// Initialize market state
if (!gameState.market) {
    gameState.market = {
        basePrice: 45,
        priceMultiplier: 1.0,
        supplyLevel: "normal", // scarce, normal, flooded
        demandTrend: 0, // -2 to +2
        volatility: 0.1,
        lastPriceShift: 0,
        priceHistory: [45],
    };
}

const marketConditions = [
    { name: "Drought", supply: "scarce", priceMultiplier: 1.4, demandMod: 1.2, duration: 3 },
    { name: "Flood", supply: "flooded", priceMultiplier: 0.7, demandMod: 0.85, duration: 2 },
    { name: "Crackdown", supply: "scarce", priceMultiplier: 1.25, demandMod: 0.7, duration: 4 },
    { name: "Festival Season", supply: "normal", priceMultiplier: 1.15, demandMod: 1.5, duration: 3 },
    { name: "Recession", supply: "flooded", priceMultiplier: 0.85, demandMod: 0.9, duration: 5 },
];

function updateMarket() {
    const market = gameState.market;
    
    // Random price fluctuation
    const fluctuation = (Math.random() - 0.5) * market.volatility * 20;
    market.basePrice = clamp(30, 80, market.basePrice + fluctuation);
    market.priceHistory.push(Math.round(market.basePrice));
    if (market.priceHistory.length > 30) market.priceHistory.shift();
    
    // Trend momentum
    if (Math.random() < 0.15) {
        market.demandTrend = clamp(-2, 2, market.demandTrend + (Math.random() > 0.5 ? 1 : -1));
    }
    
    // Random market events (15% chance)
    if (Math.random() < 0.15 && !market.activeCondition) {
        const condition = marketConditions[Math.floor(Math.random() * marketConditions.length)];
        market.activeCondition = { ...condition, daysRemaining: condition.duration };
        market.supplyLevel = condition.supply;
        market.priceMultiplier = condition.priceMultiplier;
        addLog("Market Intel", `${condition.name}: Prices shifting, adjust your strategy.`, "warning");
    }
    
    // Process active condition
    if (market.activeCondition) {
        market.activeCondition.daysRemaining--;
        if (market.activeCondition.daysRemaining <= 0) {
            addLog("Market Intel", `${market.activeCondition.name} has ended. Market normalizing.`, "info");
            market.activeCondition = null;
            market.supplyLevel = "normal";
            market.priceMultiplier = 1.0;
        }
    }
}

function getMarketModifiers() {
    const market = gameState.market;
    return {
        priceMultiplier: market.priceMultiplier,
        demandModifier: 1 + (market.demandTrend * 0.08),
        supplyLevel: market.supplyLevel,
        suggestedPrice: Math.round(market.basePrice * market.priceMultiplier),
    };
}

// =====================================================
// TERRITORY EVENTS SYSTEM
// =====================================================

const territoryEvents = [
    {
        id: "turf_war",
        name: "Turf War",
        description: "Rivals are moving in on your block.",
        effect: { heat: 8, cred: -3 },
        duration: 2,
        icon: "⚔️",
    },
    {
        id: "police_patrol",
        name: "Increased Patrols",
        description: "Cops are watching this area closely.",
        effect: { heat: 5, demandMod: 0.7 },
        duration: 3,
        icon: "🚔",
    },
    {
        id: "block_party",
        name: "Block Party",
        description: "Neighborhood celebration brings good vibes.",
        effect: { cred: 5, demandMod: 1.3 },
        duration: 2,
        icon: "🎉",
    },
    {
        id: "renovation",
        name: "Street Renovation",
        description: "Construction limits access to the area.",
        effect: { demandMod: 0.6 },
        duration: 4,
        icon: "🚧",
    },
    {
        id: "celebrity_sighting",
        name: "Celebrity Sighting",
        description: "Famous faces draw wealthy customers.",
        effect: { demandMod: 1.5, cred: 3, heat: 2 },
        duration: 1,
        icon: "⭐",
    },
    {
        id: "local_connect",
        name: "Local Connect",
        description: "A neighborhood regular vouches for you.",
        effect: { cred: 4, heat: -2 },
        duration: 2,
        icon: "🤝",
    },
];

function processTerritoryEvents() {
    const ownedTerritories = gameState.empire.territories.filter(t => t.owned);
    
    ownedTerritories.forEach(territory => {
        // Initialize events array if needed
        if (!territory.activeEvents) territory.activeEvents = [];
        
        // Process existing events
        territory.activeEvents = territory.activeEvents.filter(event => {
            event.daysRemaining--;
            if (event.daysRemaining <= 0) {
                addLog("Territory", `${event.name} has ended in ${territory.name}.`, "info");
                return false;
            }
            return true;
        });
        
        // 12% chance of new event per territory
        if (Math.random() < 0.12 && territory.activeEvents.length < 2) {
            const event = territoryEvents[Math.floor(Math.random() * territoryEvents.length)];
            territory.activeEvents.push({
                ...event,
                daysRemaining: event.duration,
            });
            addLog("Territory", `${event.icon} ${event.name} in ${territory.name}: ${event.description}`, 
                   event.effect.heat > 0 ? "warning" : "info");
        }
    });
}

function getTerritoryEventModifiers() {
    const modifiers = { demandMod: 1, credDelta: 0, heatDelta: 0 };
    
    gameState.empire.territories.forEach(territory => {
        if (!territory.owned || !territory.activeEvents) return;
        
        territory.activeEvents.forEach(event => {
            if (event.effect.demandMod) modifiers.demandMod *= event.effect.demandMod;
            if (event.effect.cred) modifiers.credDelta += event.effect.cred;
            if (event.effect.heat) modifiers.heatDelta += event.effect.heat;
        });
    });
    
    return modifiers;
}

// =====================================================
// CREW LOYALTY SYSTEM
// =====================================================

function updateCrewLoyalty() {
    gameState.progression.crew.forEach(member => {
        if (!member.hired) return;
        
        // Initialize loyalty if not present
        if (member.loyalty === undefined) member.loyalty = 50;
        if (member.nightsWorked === undefined) member.nightsWorked = 0;
        
        member.nightsWorked++;
        
        // Loyalty increases based on pay and success
        const lastNight = gameState.lastNight;
        if (lastNight && lastNight.cashDelta > 0) {
            member.loyalty = clamp(0, 100, member.loyalty + 2);
        } else if (lastNight && lastNight.cashDelta < -500) {
            member.loyalty = clamp(0, 100, member.loyalty - 3);
        }
        
        // High heat affects loyalty
        if (gameState.heat > 75) {
            member.loyalty = clamp(0, 100, member.loyalty - 2);
        }
        
        // Check for loyalty milestones
        if (member.loyalty >= 80 && !member.loyaltyBonus) {
            member.loyaltyBonus = true;
            Object.keys(member.bonus).forEach(key => {
                member.bonus[key] *= 1.5; // 50% bonus at high loyalty
            });
            showUnlockToast(`${member.name} is now loyal! Bonus increased by 50%`);
            addLog("Crew", `${member.name} has proven their loyalty. Performance enhanced.`, "positive");
        }
        
        // Very low loyalty might cause crew to leave
        if (member.loyalty <= 10 && Math.random() < 0.3) {
            member.hired = false;
            member.loyalty = 50;
            member.loyaltyBonus = false;
            addLog("Crew", `${member.name} has left the operation. Too much heat.`, "negative");
        }
    });
}

// =====================================================
// CHALLENGES SYSTEM
// =====================================================

if (!gameState.challenges) {
    gameState.challenges = {
        daily: null,
        weekly: null,
        dailyProgress: 0,
        weeklyProgress: 0,
        completedChallenges: 0,
        lastDailyReset: 0,
        lastWeeklyReset: 0,
    };
}

const dailyChallenges = [
    { id: "profit_1k", name: "Quick Flip", desc: "Earn $1,000+ profit tonight", target: 1000, type: "profit", reward: { xp: 50, cash: 200 } },
    { id: "sell_50", name: "Mover", desc: "Sell 50+ bags tonight", target: 50, type: "sold", reward: { xp: 40, cash: 150 } },
    { id: "no_heat", name: "Ghost Mode", desc: "End the night with 0 heat gain", target: 0, type: "heat_gain", reward: { xp: 75, cash: 300 } },
    { id: "high_price", name: "Premium Only", desc: "Sell at $80+ per bag", target: 80, type: "price", reward: { xp: 60, cash: 250 } },
    { id: "quality_90", name: "Pure Product", desc: "Maintain 90%+ quality", target: 90, type: "quality", reward: { xp: 45, cash: 175 } },
    { id: "sellout", name: "Clean Sweep", desc: "Sell every bag you cook", target: 100, type: "sellthrough", reward: { xp: 80, cash: 350 } },
];

const weeklyChallenges = [
    { id: "week_profit", name: "Big Week", desc: "Earn $10,000 total this week", target: 10000, type: "total_profit", reward: { xp: 300, cash: 1500 } },
    { id: "week_survive", name: "Survivor", desc: "Complete 7 nights without going bust", target: 7, type: "nights", reward: { xp: 400, cash: 2000 } },
    { id: "week_cred", name: "Rising Star", desc: "Gain 20 total cred this week", target: 20, type: "total_cred", reward: { xp: 350, cash: 1750 } },
    { id: "week_territory", name: "Expansion", desc: "Acquire a new territory", target: 1, type: "territory", reward: { xp: 500, cash: 2500 } },
];

function initializeChallenges() {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;
    
    // Reset daily challenge if new day
    if (!gameState.challenges.lastDailyReset || now - gameState.challenges.lastDailyReset > dayMs) {
        gameState.challenges.daily = dailyChallenges[Math.floor(Math.random() * dailyChallenges.length)];
        gameState.challenges.dailyProgress = 0;
        gameState.challenges.lastDailyReset = now;
    }
    
    // Reset weekly challenge if new week
    if (!gameState.challenges.lastWeeklyReset || now - gameState.challenges.lastWeeklyReset > weekMs) {
        gameState.challenges.weekly = weeklyChallenges[Math.floor(Math.random() * weeklyChallenges.length)];
        gameState.challenges.weeklyProgress = 0;
        gameState.challenges.lastWeeklyReset = now;
    }
}

function updateChallengeProgress(nightData) {
    const challenges = gameState.challenges;
    if (!challenges.daily || !challenges.weekly) return;
    
    // Daily challenge progress
    const daily = challenges.daily;
    switch (daily.type) {
        case "profit":
            if (nightData.profit >= daily.target) completeChallenge("daily");
            break;
        case "sold":
            if (nightData.unitsSold >= daily.target) completeChallenge("daily");
            break;
        case "heat_gain":
            if (gameState.lastNight && gameState.lastNight.heatDelta <= daily.target) completeChallenge("daily");
            break;
        case "price":
            if (nightData.price >= daily.target) completeChallenge("daily");
            break;
        case "quality":
            challenges.dailyProgress = nightData.purity || 0;
            if (challenges.dailyProgress >= daily.target) completeChallenge("daily");
            break;
        case "sellthrough":
            const sellthrough = nightData.unitsPrepared > 0 ? (nightData.unitsSold / nightData.unitsPrepared) * 100 : 0;
            if (sellthrough >= daily.target) completeChallenge("daily");
            break;
    }
    
    // Weekly challenge progress
    const weekly = challenges.weekly;
    switch (weekly.type) {
        case "total_profit":
            challenges.weeklyProgress += Math.max(0, nightData.profit);
            if (challenges.weeklyProgress >= weekly.target) completeChallenge("weekly");
            break;
        case "nights":
            challenges.weeklyProgress++;
            if (challenges.weeklyProgress >= weekly.target) completeChallenge("weekly");
            break;
        case "total_cred":
            if (gameState.lastNight) {
                challenges.weeklyProgress += Math.max(0, gameState.lastNight.credDelta);
            }
            if (challenges.weeklyProgress >= weekly.target) completeChallenge("weekly");
            break;
    }
}

function completeChallenge(type) {
    const challenges = gameState.challenges;
    const challenge = type === "daily" ? challenges.daily : challenges.weekly;
    
    if (!challenge || challenge.completed) return;
    
    challenge.completed = true;
    challenges.completedChallenges++;
    
    // Award rewards
    if (challenge.reward.xp) awardXP(challenge.reward.xp);
    if (challenge.reward.cash) {
        gameState.cash += challenge.reward.cash;
        recordTransaction("income", `Challenge: ${challenge.name}`, challenge.reward.cash);
    }
    
    showUnlockToast(`Challenge Complete: ${challenge.name}!`);
    addLog("Challenge", `Completed "${challenge.name}" - Earned ${challenge.reward.xp} XP and ${formatCurrency(challenge.reward.cash)}!`, "positive");
}

// =====================================================
// RIVALS SYSTEM
// =====================================================

if (!gameState.rivals) {
    gameState.rivals = {
        active: [],
        defeated: 0,
    };
}

const rivalTemplates = [
    { name: "The Pharmacist", style: "quality", strength: 1, icon: "💊", desc: "Competes on product purity" },
    { name: "Ghost Network", style: "stealth", strength: 2, icon: "👻", desc: "Invisible operations, hard to track" },
    { name: "Street Kings", style: "volume", strength: 1, icon: "👑", desc: "Floods the market with cheap product" },
    { name: "The Collective", style: "territory", strength: 3, icon: "🕸️", desc: "Expanding aggressively into new blocks" },
    { name: "Old Guard", style: "influence", strength: 2, icon: "🎩", desc: "Connected, respected, dangerous" },
];

function spawnRival() {
    if (gameState.rivals.active.length >= 2) return;
    if (gameState.day < 5) return; // No rivals early game
    if (Math.random() > 0.08) return; // 8% chance per night
    
    const template = rivalTemplates[Math.floor(Math.random() * rivalTemplates.length)];
    const rival = {
        ...template,
        id: `rival_${Date.now()}`,
        health: template.strength * 30,
        maxHealth: template.strength * 30,
        threat: 0,
        spawnedDay: gameState.day,
    };
    
    gameState.rivals.active.push(rival);
    addLog("Intel", `${rival.icon} New competition: ${rival.name} - ${rival.desc}`, "warning");
}

function processRivals() {
    gameState.rivals.active.forEach(rival => {
        // Rivals grow in threat over time
        rival.threat += rival.strength;
        
        // Apply rival effects based on style
        switch (rival.style) {
            case "quality":
                // Reduces effectiveness of lower quality product
                if (gameState.lastNight && gameState.lastNight.purity < 85) {
                    gameState.cred = clamp(0, 120, gameState.cred - 1);
                }
                break;
            case "volume":
                // Reduces demand slightly
                // Effect applied in computeDemand
                break;
            case "territory":
                // Increases heat in owned territories
                gameState.heat = clamp(0, 120, gameState.heat + 1);
                break;
            case "influence":
                // Reduces cred gains
                // Effect applied in adjustCred
                break;
        }
        
        // High threat rivals cause problems
        if (rival.threat > 50) {
            addLog("Rival Activity", `${rival.icon} ${rival.name} is making moves. Watch your back.`, "warning");
            rival.threat = 30; // Reset after warning
        }
    });
}

function damageRival(rivalId, amount) {
    const rival = gameState.rivals.active.find(r => r.id === rivalId);
    if (!rival) return;
    
    rival.health -= amount;
    
    if (rival.health <= 0) {
        gameState.rivals.active = gameState.rivals.active.filter(r => r.id !== rivalId);
        gameState.rivals.defeated++;
        
        const reward = rival.strength * 1000;
        gameState.cash += reward;
        awardXP(rival.strength * 100);
        recordTransaction("income", `Eliminated ${rival.name}`, reward);
        
        showUnlockToast(`${rival.name} eliminated! +${formatCurrency(reward)}`);
        addLog("Victory", `${rival.icon} ${rival.name} has been pushed out. Territory secured.`, "positive");
    }
}

// Damage rivals through successful operations
function applyRivalDamage(nightData) {
    if (gameState.rivals.active.length === 0) return;
    
    // Success damages rivals
    if (nightData.profit > 500) {
        const damage = Math.floor(nightData.profit / 100);
        gameState.rivals.active.forEach(rival => {
            damageRival(rival.id, damage);
        });
    }
    
    // High cred also damages influence-based rivals
    if (gameState.cred > 70) {
        gameState.rivals.active
            .filter(r => r.style === "influence")
            .forEach(r => damageRival(r.id, 5));
    }
}

// =====================================================
// ENHANCED NIGHT REPLAY SYSTEM
// =====================================================

let nightReplayData = null;

function captureNightReplay(nightData) {
    nightReplayData = {
        day: gameState.day - 1,
        inputs: {
            price: nightData.price,
            units: nightData.unitsPrepared,
            purity: nightData.purity || 85,
            lane: gameState.selectedDistribution,
        },
        conditions: { ...gameState.currentForecast },
        results: {
            sold: nightData.unitsSold,
            profit: nightData.profit,
            cashDelta: gameState.lastNight?.cashDelta || 0,
            credDelta: gameState.lastNight?.credDelta || 0,
            heatDelta: gameState.lastNight?.heatDelta || 0,
        },
        events: gameState.logs.slice(0, 5).map(l => ({ title: l.title, message: l.message, type: l.type })),
    };
}

function renderNightReplay() {
    if (!nightReplayData) return "";
    
    const r = nightReplayData;
    return `
        <div class="replay-summary">
            <h4>Night ${r.day} Replay</h4>
            <div class="replay-inputs">
                <span>$${r.inputs.price} × ${r.inputs.units} bags @ ${r.inputs.purity}%</span>
            </div>
            <div class="replay-results">
                <span class="replay-stat">Sold: ${r.results.sold}/${r.inputs.units}</span>
                <span class="replay-stat ${r.results.profit >= 0 ? 'positive' : 'negative'}">
                    Profit: ${formatCurrency(r.results.profit)}
                </span>
            </div>
        </div>
    `;
}

// =====================================================
// STATISTICS & ANALYTICS
// =====================================================

function getDetailedStats() {
    const stats = gameState.office.stats;
    const history = gameState.history;
    
    if (history.length === 0) {
        return {
            totalNights: 0,
            avgProfit: 0,
            bestNight: 0,
            worstNight: 0,
            totalSold: 0,
            avgSellthrough: 0,
            profitableNights: 0,
            currentStreak: 0,
        };
    }
    
    const profits = history.map(h => h.profit);
    const sellRates = history.map(h => h.unitsPrepared > 0 ? h.unitsSold / h.unitsPrepared : 0);
    
    let currentStreak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].profit > 0) currentStreak++;
        else break;
    }
    
    return {
        totalNights: history.length,
        avgProfit: Math.round(profits.reduce((a, b) => a + b, 0) / profits.length),
        bestNight: Math.max(...profits),
        worstNight: Math.min(...profits),
        totalSold: history.reduce((sum, h) => sum + h.unitsSold, 0),
        avgSellthrough: Math.round(sellRates.reduce((a, b) => a + b, 0) / sellRates.length * 100),
        profitableNights: profits.filter(p => p > 0).length,
        currentStreak,
        totalEarned: stats.totalEarned,
        totalSpent: stats.totalSpent,
        netWorth: gameState.cash + getAssetValue(),
    };
}

function getAssetValue() {
    let value = 0;
    
    // Territory value
    gameState.empire.territories.forEach(t => {
        if (t.owned && t.cost > 0) value += t.cost * 0.8; // 80% resale value
    });
    
    // Investment value
    gameState.office.investments.forEach(inv => {
        if (inv.owned) value += inv.cost * 0.9;
    });
    
    return value;
}

// =====================================================
// ENHANCED UI RENDERING
// =====================================================

function renderChallengesUI() {
    const container = document.getElementById("challengesContainer");
    if (!container) return;
    
    const challenges = gameState.challenges;
    if (!challenges.daily && !challenges.weekly) {
        container.innerHTML = '<p class="no-challenges">No active challenges</p>';
        return;
    }
    
    let html = '';
    
    if (challenges.daily && !challenges.daily.completed) {
        const progress = Math.min(100, (challenges.dailyProgress / challenges.daily.target) * 100);
        html += `
            <div class="challenge-card daily">
                <div class="challenge-header">
                    <span class="challenge-type">Daily</span>
                    <span class="challenge-name">${challenges.daily.name}</span>
                </div>
                <p class="challenge-desc">${challenges.daily.desc}</p>
                <div class="challenge-progress">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="challenge-reward">
                    <span>🎁 ${challenges.daily.reward.xp} XP + ${formatCurrency(challenges.daily.reward.cash)}</span>
                </div>
            </div>
        `;
    }
    
    if (challenges.weekly && !challenges.weekly.completed) {
        const progress = Math.min(100, (challenges.weeklyProgress / challenges.weekly.target) * 100);
        html += `
            <div class="challenge-card weekly">
                <div class="challenge-header">
                    <span class="challenge-type">Weekly</span>
                    <span class="challenge-name">${challenges.weekly.name}</span>
                </div>
                <p class="challenge-desc">${challenges.weekly.desc}</p>
                <div class="challenge-progress">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="challenge-reward">
                    <span>🎁 ${challenges.weekly.reward.xp} XP + ${formatCurrency(challenges.weekly.reward.cash)}</span>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html || '<p class="challenges-complete">All challenges complete! 🎉</p>';
}

function renderRivalsUI() {
    const container = document.getElementById("rivalsContainer");
    if (!container) return;
    
    const rivals = gameState.rivals.active;
    
    if (rivals.length === 0) {
        container.innerHTML = '<p class="no-rivals">No active rivals</p>';
        return;
    }
    
    container.innerHTML = rivals.map(rival => `
        <div class="rival-card">
            <div class="rival-header">
                <span class="rival-icon">${rival.icon}</span>
                <span class="rival-name">${rival.name}</span>
            </div>
            <p class="rival-desc">${rival.desc}</p>
            <div class="rival-health">
                <div class="health-fill" style="width: ${(rival.health / rival.maxHealth) * 100}%"></div>
            </div>
            <span class="rival-threat">Threat: ${rival.threat}</span>
        </div>
    `).join('');
}

function renderMarketUI() {
    const container = document.getElementById("marketContainer");
    if (!container) return;
    
    const market = gameState.market;
    const mods = getMarketModifiers();
    
    let conditionHtml = '';
    if (market.activeCondition) {
        conditionHtml = `
            <div class="market-condition">
                <span class="condition-name">${market.activeCondition.name}</span>
                <span class="condition-days">${market.activeCondition.daysRemaining} days left</span>
            </div>
        `;
    }
    
    // Mini sparkline for price history
    const sparkline = market.priceHistory.slice(-10).map((p, i, arr) => {
        const min = Math.min(...arr);
        const max = Math.max(...arr);
        const range = max - min || 1;
        const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
        const normalized = (p - min) / range;
        return blocks[Math.floor(normalized * (blocks.length - 1))];
    }).join('');
    
    container.innerHTML = `
        <div class="market-info">
            <div class="market-price">
                <span class="label">Street Price</span>
                <span class="value">$${mods.suggestedPrice}</span>
                <span class="sparkline">${sparkline}</span>
            </div>
            <div class="market-supply">
                <span class="label">Supply</span>
                <span class="value supply-${market.supplyLevel}">${market.supplyLevel}</span>
            </div>
            <div class="market-trend">
                <span class="label">Demand</span>
                <span class="value trend-${market.demandTrend > 0 ? 'up' : market.demandTrend < 0 ? 'down' : 'flat'}">
                    ${market.demandTrend > 0 ? '↑' : market.demandTrend < 0 ? '↓' : '→'}
                </span>
            </div>
        </div>
        ${conditionHtml}
    `;
}

// =====================================================
// PARTICLE SYSTEM
// =====================================================

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById("particleCanvas");
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext("2d");
        this.particles = [];
        this.resize();
        
        window.addEventListener("resize", () => this.resize());
    }
    
    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    spawnCashBurst(x, y, amount) {
        const count = Math.min(30, Math.max(10, Math.floor(amount / 100)));
        const color = amount >= 0 ? "#22d3ee" : "#ef4444";
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 2 + Math.random() * 4;
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: 3 + Math.random() * 4,
                color,
                alpha: 1,
                decay: 0.015 + Math.random() * 0.01,
                type: "cash",
            });
        }
        
        // Floating text
        this.particles.push({
            x,
            y: y - 20,
            vx: 0,
            vy: -1.5,
            text: (amount >= 0 ? "+" : "") + formatCurrency(amount),
            color,
            alpha: 1,
            decay: 0.02,
            size: 16,
            type: "text",
        });
    }
    
    spawnAchievementBurst(x, y) {
        const colors = ["#fbbf24", "#f97316", "#ef4444", "#8b5cf6", "#22c55e"];
        
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 6;
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3,
                size: 4 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: 0.01 + Math.random() * 0.01,
                type: "confetti",
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
            });
        }
    }
    
    spawnLevelUpBurst() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        
        // Ring of particles
        for (let i = 0; i < 60; i++) {
            const angle = (Math.PI * 2 * i) / 60;
            const speed = 8 + Math.random() * 4;
            
            this.particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 6 + Math.random() * 4,
                color: "#8b5cf6",
                alpha: 1,
                decay: 0.008,
                type: "ring",
            });
        }
    }
    
    update() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Physics
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Gravity
            p.alpha -= p.decay;
            
            if (p.rotation !== undefined) {
                p.rotation += p.rotationSpeed;
            }
            
            // Remove dead particles
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Draw
            this.ctx.globalAlpha = p.alpha;
            
            if (p.type === "text") {
                this.ctx.font = `bold ${p.size}px Inter, sans-serif`;
                this.ctx.fillStyle = p.color;
                this.ctx.textAlign = "center";
                this.ctx.fillText(p.text, p.x, p.y);
            } else if (p.type === "confetti") {
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation);
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                this.ctx.restore();
            } else {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
            }
        }
        
        this.ctx.globalAlpha = 1;
        
        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.update());
        }
    }
    
    trigger() {
        if (this.particles.length > 0 && !this.animating) {
            this.animating = true;
            this.update();
        }
        this.animating = false;
    }
}

let particleSystem;

function initParticles() {
    particleSystem = new ParticleSystem();
}

function spawnCashParticles(amount) {
    if (!particleSystem) return;
    
    const cashEl = document.getElementById("cashDisplay");
    if (cashEl) {
        const rect = cashEl.getBoundingClientRect();
        particleSystem.spawnCashBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, amount);
        particleSystem.trigger();
    }
}

function spawnAchievementParticles() {
    if (!particleSystem) return;
    
    particleSystem.spawnAchievementBurst(window.innerWidth / 2, window.innerHeight / 2);
    particleSystem.trigger();
}

function spawnLevelUpParticles() {
    if (!particleSystem) return;
    
    particleSystem.spawnLevelUpBurst();
    particleSystem.trigger();
}

// =====================================================
// ENHANCED DEBRIEF WITH REPLAY ANIMATION
// =====================================================

function showEnhancedDebrief(lastNight) {
    if (!lastNight) return;
    
    const stepsContainer = document.getElementById("replaySteps");
    const steps = stepsContainer?.querySelectorAll(".replay-step");
    
    if (!steps || steps.length === 0) {
        showDebrief(lastNight);
        return;
    }
    
    // Reset all steps
    steps.forEach(step => {
        step.classList.remove("active", "complete");
    });
    
    // Update step text with actual data
    const lastEntry = gameState.history[gameState.history.length - 1];
    if (lastEntry) {
        const cookEl = document.getElementById("replayCook");
        if (cookEl) cookEl.textContent = `Cooked ${lastEntry.unitsPrepared} bags at ${lastNight.purity || 85}% quality`;
        
        const distroEl = document.getElementById("replayDistro");
        const lane = distributionStrategies.find(s => s.id === gameState.selectedDistribution);
        if (distroEl) distroEl.textContent = `Distributed via ${lane?.label || "street corners"}`;
        
        const salesEl = document.getElementById("replaySales");
        if (salesEl) salesEl.textContent = `Sold ${lastEntry.unitsSold}/${lastEntry.unitsPrepared} for ${formatCurrency(lastEntry.profit)}`;
    }
    
    // Animate steps
    let currentStep = 0;
    const animateStep = () => {
        if (currentStep > 0) {
            steps[currentStep - 1].classList.remove("active");
            steps[currentStep - 1].classList.add("complete");
        }
        
        if (currentStep < steps.length) {
            steps[currentStep].classList.add("active");
            currentStep++;
            setTimeout(animateStep, 600);
        } else {
            // All steps complete, show deltas
            setTimeout(() => {
                showDebrief(lastNight);
                
                // Spawn particles based on result
                if (lastNight.cashDelta > 0) {
                    setTimeout(() => spawnCashParticles(lastNight.cashDelta), 300);
                }
            }, 400);
        }
    };
    
    // Show the debrief panel first, then animate
    elements.debriefPanel?.classList.remove("hidden");
    setTimeout(animateStep, 200);
}

// =====================================================
// INTEGRATE NEW SYSTEMS INTO GAME LOOP
// =====================================================

// Patch runDay to include new systems
const originalRunDay = runDay;
runDay = function(params) {
    // Store purity for challenge tracking
    params.purity = Number(elements.purityInput?.value) || 85;
    
    // Call original
    originalRunDay(params);
    
    // If game is still playing, run new systems
    if (gameState.status === "playing") {
        // Update market
        updateMarket();
        
        // Process territory events
        processTerritoryEvents();
        
        // Update crew loyalty
        updateCrewLoyalty();
        
        // Process rivals
        spawnRival();
        processRivals();
        
        // Get last history entry for systems that need it
        const lastEntry = gameState.history[gameState.history.length - 1];
        if (lastEntry) {
            lastEntry.purity = params.purity;
            
            // Update challenge progress
            updateChallengeProgress(lastEntry);
            
            // Apply rival damage
            applyRivalDamage(lastEntry);
            
            // Capture replay data
            captureNightReplay(lastEntry);
        }
        
        // Render new UI elements
        renderChallengesUI();
        renderRivalsUI();
        renderMarketUI();
        
        // Auto-save
        saveGame();
    }
};

// Patch computeDemand to include market and rival effects
const originalComputeDemand = computeDemand;
computeDemand = function(params) {
    let demand = originalComputeDemand(params);
    
    // Apply market modifiers
    const marketMods = getMarketModifiers();
    demand *= marketMods.demandModifier;
    
    // Apply territory event modifiers
    const territoryMods = getTerritoryEventModifiers();
    demand *= territoryMods.demandMod;
    
    // Apply rival effects
    const volumeRivals = gameState.rivals.active.filter(r => r.style === "volume");
    if (volumeRivals.length > 0) {
        demand *= 0.92; // 8% reduction per volume rival
    }
    
    // Apply prestige demand bonus
    demand *= getPrestigeDemandBonus();
    
    return demand;
};

// Patch adjustCred to include rival effects
const originalAdjustCred = adjustCred;
adjustCred = function(params) {
    const result = originalAdjustCred(params);
    
    // Influence rivals reduce cred gains
    const influenceRivals = gameState.rivals.active.filter(r => r.style === "influence");
    if (influenceRivals.length > 0 && result.delta > 0) {
        const reduction = Math.floor(result.delta * 0.3);
        gameState.cred = clamp(0, 120, gameState.cred - reduction);
        result.reason += " (rival influence)";
    }
    
    // Apply territory event cred changes
    const territoryMods = getTerritoryEventModifiers();
    if (territoryMods.credDelta !== 0) {
        gameState.cred = clamp(0, 120, gameState.cred + territoryMods.credDelta);
    }
    
    return result;
};

// Patch adjustHeat to include territory events
const originalAdjustHeat = adjustHeat;
adjustHeat = function(params) {
    const result = originalAdjustHeat(params);
    
    // Apply territory event heat changes
    const territoryMods = getTerritoryEventModifiers();
    if (territoryMods.heatDelta !== 0) {
        gameState.heat = clamp(0, 120, gameState.heat + territoryMods.heatDelta);
        result.reason += ` (territory: ${territoryMods.heatDelta > 0 ? '+' : ''}${territoryMods.heatDelta})`;
    }
    
    return result;
};

// Patch initGame to load saves and initialize new systems
const originalInitGame = initGame;
initGame = function() {
    // Try to load saved game first
    const loaded = loadGame();
    
    if (!loaded) {
        // Initialize market state for new game
        gameState.market = {
            basePrice: 45,
            priceMultiplier: 1.0,
            supplyLevel: "normal",
            demandTrend: 0,
            volatility: 0.1,
            lastPriceShift: 0,
            priceHistory: [45],
        };
        
        // Initialize rivals
        gameState.rivals = {
            active: [],
            defeated: 0,
        };
        
        // Initialize challenges
        gameState.challenges = {
            daily: null,
            weekly: null,
            dailyProgress: 0,
            weeklyProgress: 0,
            completedChallenges: 0,
            lastDailyReset: 0,
            lastWeeklyReset: 0,
        };
    }
    
    // Initialize challenges
    initializeChallenges();
    
    // Initialize particle system
    initParticles();
    
    // Start auto-save
    startAutoSave();
    
    // Call original init (will check onboarding, render UI, etc.)
    originalInitGame();
    
    // Render new UI elements
    renderChallengesUI();
    renderRivalsUI();
    renderMarketUI();
    
    // Update UI if loaded
    if (loaded) {
        updateUI();
        updateXPBar();
        renderDistributionOptions();
        
        // Update form values
        if (elements.priceInput) elements.priceInput.value = gameState.market?.basePrice || 45;
    }
};

// Patch resetGame to clear save
const originalResetGame = resetGame;
resetGame = function() {
    deleteSave();
    
    // Reset new systems
    gameState.market = {
        basePrice: 45,
        priceMultiplier: 1.0,
        supplyLevel: "normal",
        demandTrend: 0,
        volatility: 0.1,
        lastPriceShift: 0,
        priceHistory: [45],
    };
    
    gameState.rivals = {
        active: [],
        defeated: 0,
    };
    
    gameState.challenges = {
        daily: null,
        weekly: null,
        dailyProgress: 0,
        weeklyProgress: 0,
        completedChallenges: 0,
        lastDailyReset: 0,
        lastWeeklyReset: 0,
    };
    
    // Reinitialize challenges
    initializeChallenges();
    
    originalResetGame();
    
    // Render new UI
    renderChallengesUI();
    renderRivalsUI();
    renderMarketUI();
};

// =====================================================
// KEYBOARD SHORTCUTS
// =====================================================

function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        
        switch (e.key.toLowerCase()) {
            case "1":
                switchScreen("night");
                break;
            case "2":
                switchScreen("empire");
                break;
            case "3":
                switchScreen("office");
                break;
            case "enter":
            case " ":
                if (gameState.currentScreen === "night" && gameState.status === "playing") {
                    if (!elements.debriefPanel?.classList.contains("hidden")) {
                        hideDebrief();
                    } else {
                        elements.form?.dispatchEvent(new Event("submit", { cancelable: true }));
                    }
                }
                break;
            case "escape":
                hideDebrief();
                break;
            case "r":
                if (e.ctrlKey || e.metaKey) return; // Don't override browser refresh
                if (gameState.status !== "playing") {
                    resetGame();
                }
                break;
            case "s":
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    saveGame();
                }
                break;
        }
    });
}

// =====================================================
// PRESTIGE SYSTEM
// =====================================================

if (!gameState.prestige) {
    gameState.prestige = {
        level: 0,
        totalPrestigePoints: 0,
        permanentBonuses: {
            startingCash: 0,      // +$100 per point
            demandBoost: 0,       // +2% per point
            heatReduction: 0,     // -2% per point
            xpMultiplier: 0,      // +5% per point
        },
        lifetimeStats: {
            totalRuns: 0,
            bestCashEver: 0,
            totalDaysPlayed: 0,
            achievementsEarned: 0,
        }
    };
}

function canPrestige() {
    // Can prestige after day 30+ with $50k+
    return gameState.day >= 30 && gameState.cash >= 50000;
}

function calculatePrestigePoints() {
    // Points based on achievements, days survived, and wealth
    let points = 0;
    points += Math.floor(gameState.day / 10);
    points += Math.floor(gameState.cash / 25000);
    points += gameState.progression.achievements.filter(a => a.unlocked).length;
    points += gameState.empire.territories.filter(t => t.owned).length;
    return points;
}

function prestige() {
    if (!canPrestige()) return;
    
    const points = calculatePrestigePoints();
    
    // Update lifetime stats
    gameState.prestige.lifetimeStats.totalRuns++;
    gameState.prestige.lifetimeStats.totalDaysPlayed += gameState.day;
    if (gameState.cash > gameState.prestige.lifetimeStats.bestCashEver) {
        gameState.prestige.lifetimeStats.bestCashEver = gameState.cash;
    }
    gameState.prestige.lifetimeStats.achievementsEarned += 
        gameState.progression.achievements.filter(a => a.unlocked).length;
    
    // Award prestige points
    gameState.prestige.totalPrestigePoints += points;
    gameState.prestige.level++;
    
    // Save prestige data before reset
    const prestigeData = JSON.parse(JSON.stringify(gameState.prestige));
    
    // Reset game
    resetGame();
    
    // Restore prestige data
    gameState.prestige = prestigeData;
    
    // Apply prestige bonuses
    applyPrestigeBonuses();
    
    showUnlockToast(`Prestige ${gameState.prestige.level}! +${points} Prestige Points`);
    addLog("Prestige", `Started fresh with permanent bonuses. Total points: ${gameState.prestige.totalPrestigePoints}`, "positive");
    
    // Spawn celebration
    spawnLevelUpParticles();
    
    saveGame();
}

function applyPrestigeBonuses() {
    const bonuses = gameState.prestige.permanentBonuses;
    
    // Apply starting cash bonus
    if (bonuses.startingCash > 0) {
        gameState.cash += bonuses.startingCash * 100;
    }
}

function upgradePrestigeBonus(bonusType) {
    const cost = getPrestigeBonusCost(bonusType);
    if (gameState.prestige.totalPrestigePoints < cost) return;
    
    gameState.prestige.totalPrestigePoints -= cost;
    gameState.prestige.permanentBonuses[bonusType]++;
    
    saveGame();
    showUnlockToast(`Upgraded ${bonusType}!`);
}

function getPrestigeBonusCost(bonusType) {
    const currentLevel = gameState.prestige.permanentBonuses[bonusType] || 0;
    return Math.floor(5 * Math.pow(1.5, currentLevel));
}

function getPrestigeDemandBonus() {
    return 1 + (gameState.prestige?.permanentBonuses?.demandBoost || 0) * 0.02;
}

function getPrestigeHeatReduction() {
    return (gameState.prestige?.permanentBonuses?.heatReduction || 0) * 0.02;
}

function getPrestigeXPMultiplier() {
    return 1 + (gameState.prestige?.permanentBonuses?.xpMultiplier || 0) * 0.05;
}

function renderPrestigeUI() {
    const prestige = gameState.prestige;
    if (!prestige) return;
    
    // Update prestige level
    const levelEl = document.getElementById("prestigeLevel");
    if (levelEl) levelEl.textContent = `Lvl ${prestige.level}`;
    
    // Update points
    const pointsEl = document.getElementById("prestigePoints");
    if (pointsEl) pointsEl.textContent = prestige.totalPrestigePoints;
    
    // Update preview
    const previewEl = document.getElementById("prestigePreview");
    if (previewEl) previewEl.textContent = `+${calculatePrestigePoints()}`;
    
    // Update prestige button
    const prestigeBtn = document.getElementById("prestigeBtn");
    if (prestigeBtn) {
        prestigeBtn.disabled = !canPrestige();
    }
    
    // Update bonus values
    const bonuses = prestige.permanentBonuses;
    
    const startCashEl = document.getElementById("bonusStartCash");
    if (startCashEl) startCashEl.textContent = `+${formatCurrency(bonuses.startingCash * 100)}`;
    
    const demandEl = document.getElementById("bonusDemand");
    if (demandEl) demandEl.textContent = `+${bonuses.demandBoost * 2}%`;
    
    const heatEl = document.getElementById("bonusHeat");
    if (heatEl) heatEl.textContent = `-${bonuses.heatReduction * 2}%`;
    
    const xpEl = document.getElementById("bonusXP");
    if (xpEl) xpEl.textContent = `×${(1 + bonuses.xpMultiplier * 0.05).toFixed(2)}`;
}

// =====================================================
// SOUND SYSTEM HOOKS (for future audio)
// =====================================================

const SoundEffects = {
    // Sound effect placeholders - integrate with Howler.js or Web Audio API
    play(soundName) {
        // console.log(`[Sound] ${soundName}`);
        // Future: howl.play(soundName);
    },
    
    // Sound events
    NIGHT_START: "night_start",
    NIGHT_END: "night_end",
    CASH_GAIN: "cash_gain",
    CASH_LOSS: "cash_loss",
    LEVEL_UP: "level_up",
    ACHIEVEMENT: "achievement",
    PURCHASE: "purchase",
    WARNING: "warning",
    BUTTON_CLICK: "button_click",
};

// =====================================================
// START GAME
// =====================================================

// Setup keyboard shortcuts
setupKeyboardShortcuts();

// Initialize game
initGame();
