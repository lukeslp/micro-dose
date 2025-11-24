const marketingLevels = [
    {
        id: "none",
        label: "No Extras",
        description: "Just the bare table.",
        cost: 0,
        demandMod: 1,
    },
    {
        id: "basic",
        label: "Chalkboard Sign",
        description: "Handwritten menu that pops.",
        cost: 6,
        demandMod: 1.12,
    },
    {
        id: "fancy",
        label: "Music & Samples",
        description: "Invite people with a vibe.",
        cost: 14,
        demandMod: 1.28,
    },
];

const weatherProfiles = [
    { name: "Sunny", description: "Blue skies, comfortable breeze.", modifier: 1.1 },
    { name: "Cloudy", description: "Overcast but dry.", modifier: 0.95 },
    { name: "Rainy", description: "Showers will scare folks off.", modifier: 0.6 },
    { name: "Heat Wave", description: "Scorching heat, everyone wants a cold drink.", modifier: 1.35 },
    { name: "Chilly", description: "Bundle up weather.", modifier: 0.75 },
];

const trafficProfiles = [
    { name: "Slow", description: "Sparse lunch crowd.", modifier: 0.75 },
    { name: "Normal", description: "Average midday flow.", modifier: 1 },
    { name: "Busy", description: "Office rush and tourists.", modifier: 1.2 },
    { name: "Surge", description: "Blocks are packed.", modifier: 1.4 },
];

const randomEvents = [
    {
        name: "Street Festival",
        description: "Vendors invited, music all day.",
        demandModifier: 1.5,
        reputationDelta: 2,
    },
    {
        name: "Sports Championship Night",
        description: "Fans will flood downtown after the game.",
        demandModifier: 1.3,
        reputationDelta: 1,
    },
    {
        name: "Sidewalk Construction",
        description: "Barriers block part of your corner.",
        demandModifier: 0.7,
        reputationDelta: 0,
    },
    {
        name: "Pop-up Inspection",
        description: "Health inspector rumored to be nearby. Keep it spotless!",
        demandModifier: 0.85,
        reputationDelta: -3,
        inspection: true,
    },
    {
        name: "Viral Mention",
        description: "Local foodie account posted about you.",
        demandModifier: 1.4,
        reputationDelta: 3,
    },
    {
        name: "Permit Mix-up",
        description: "City paperwork snafu slows foot traffic.",
        demandModifier: 0.8,
        reputationDelta: -1,
    },
];

const gameState = {
    day: 1,
    cash: 120,
    reputation: 50,
    status: "playing",
    history: [],
    logs: [],
    cashTimeline: [],
    config: {
        unitCost: 0.75,
        permitCost: 8,
        baseDemand: 55,
        maxUnits: 400,
    },
    currentForecast: {
        weather: null,
        weatherMod: 1,
        weatherDescription: "",
        traffic: null,
        trafficMod: 1,
        event: null,
    },
};

const elements = {
    dayDisplay: document.getElementById("dayDisplay"),
    cashDisplay: document.getElementById("cashDisplay"),
    repDisplay: document.getElementById("repDisplay"),
    weatherDisplay: document.getElementById("weatherDisplay"),
    trafficDisplay: document.getElementById("trafficDisplay"),
    eventDisplay: document.getElementById("eventDisplay"),
    forecastText: document.getElementById("forecastText"),
    priceInput: document.getElementById("priceInput"),
    unitsInput: document.getElementById("unitsInput"),
    marketingOptions: document.getElementById("marketingOptions"),
    formError: document.getElementById("formError"),
    runDay: document.getElementById("runDay"),
    restartBtn: document.getElementById("restartBtn"),
    historyBody: document.getElementById("historyBody"),
    logFeed: document.getElementById("logFeed"),
    form: document.getElementById("dayForm"),
    chart: document.getElementById("cashChart"),
};

const chartCtx = elements.chart.getContext("2d");

function initGame() {
    renderMarketingOptions();
    elements.form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (gameState.status !== "playing") {
            return;
        }
        const price = Number(elements.priceInput.value);
        const units = Number(elements.unitsInput.value);
        const marketingId = elements.form.querySelector('input[name="marketing"]:checked')?.value;
        if (!validateInputs(price, units, marketingId)) {
            return;
        }
        runDay({ price, units, marketingId });
    });
    elements.restartBtn.addEventListener("click", resetGame);
    resetGame();
}

function renderMarketingOptions() {
    elements.marketingOptions.innerHTML = "";
    marketingLevels.forEach((level, index) => {
        const id = `marketing-${level.id}`;
        const wrapper = document.createElement("label");
        wrapper.className = "marketing-option";
        wrapper.htmlFor = id;
        wrapper.innerHTML = `
            <input type="radio" name="marketing" id="${id}" value="${level.id}" ${index === 1 ? "checked" : ""} />
            <div>
                <h4>${level.label}</h4>
                <span>Cost $${level.cost.toFixed(0)} · Boost ${Math.round(level.demandMod * 100)}%</span>
                <span>${level.description}</span>
            </div>
        `;
        elements.marketingOptions.appendChild(wrapper);
    });
}

function resetGame() {
    gameState.day = 1;
    gameState.cash = 120;
    gameState.reputation = 50;
    gameState.status = "playing";
    gameState.history = [];
    gameState.logs = [];
    gameState.cashTimeline = [gameState.cash];
    elements.runDay.disabled = false;
    elements.restartBtn.classList.add("hidden");
    addLog("City Desk", "Fresh permit, $120 cash, and an empty block. Let's hustle.");
    generateForecast();
    updateUI();
}

function validateInputs(price, units, marketingId) {
    const { maxUnits } = gameState.config;
    if (Number.isNaN(price) || price < 0) {
        showFormError("Price must be zero or higher.");
        return false;
    }
    if (price > 25) {
        showFormError("That's a bit steep. Keep price at $25 or below.");
        return false;
    }
    if (Number.isNaN(units) || units < 0) {
        showFormError("Units must be zero or higher.");
        return false;
    }
    if (units > maxUnits) {
        showFormError(`Cap inventory at ${maxUnits} units for storage reasons.`);
        return false;
    }
    if (!marketingId) {
        showFormError("Pick a marketing level to continue.");
        return false;
    }
    showFormError("");
    return true;
}

function showFormError(message) {
    elements.formError.textContent = message;
}

function generateForecast() {
    const weather = weatherProfiles[Math.floor(Math.random() * weatherProfiles.length)];
    const traffic = trafficProfiles[Math.floor(Math.random() * trafficProfiles.length)];
    let event = null;
    if (Math.random() < 0.35) {
        event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    }
    gameState.currentForecast = {
        weather: weather.name,
        weatherDescription: weather.description,
        weatherMod: weather.modifier,
        traffic: traffic.name,
        trafficDescription: traffic.description,
        trafficMod: traffic.modifier,
        event,
    };
    if (event) {
        addLog("Forecast", `${event.name}: ${event.description}`);
    } else {
        addLog("Forecast", "No major events expected today.");
    }
}

function runDay({ price, units, marketingId }) {
    const marketing = marketingLevels.find((level) => level.id === marketingId) ?? marketingLevels[0];
    const ingredientCost = units * gameState.config.unitCost;
    const marketingCost = marketing.cost;
    const fixedCost = gameState.config.permitCost;
    const demand = computeDemand(price, marketing.demandMod);
    const unitsSold = Math.min(units, Math.max(0, Math.round(demand)));
    const waste = Math.max(0, units - unitsSold);
    const revenue = unitsSold * price;
    const totalCost = ingredientCost + marketingCost + fixedCost;
    const profit = revenue - totalCost;

    gameState.cash += profit;
    gameState.cashTimeline.push(gameState.cash);

    const historyEntry = {
        day: gameState.day,
        price,
        unitsPrepared: units,
        unitsSold,
        profit,
    };
    gameState.history.push(historyEntry);

    const summary = `Sold ${unitsSold}/${units} units for $${revenue.toFixed(
        2
    )}. Costs ate $${totalCost.toFixed(2)}, net ${formatCurrency(profit)}.`;
    addLog(`Day ${gameState.day}`, summary);
    if (waste > 0) {
        addLog("Waste", `${waste} units tossed at closing.`);
    }
    if (gameState.currentForecast.event?.inspection) {
        addLog("City Inspectors", "They hovered nearby but left after a quick glance.");
    }

    adjustReputation({ units, unitsSold, price, profit });
    if (gameState.currentForecast.event?.reputationDelta) {
        gameState.reputation = clamp(
            0,
            100,
            gameState.reputation + gameState.currentForecast.event.reputationDelta
        );
    }

    if (gameState.cash < 0) {
        triggerBankruptcy();
    } else {
        gameState.day += 1;
        generateForecast();
    }
    updateUI();
}

function computeDemand(price, marketingMod) {
    const forecast = gameState.currentForecast;
    // Start with the base demand, scale by conditions, marketing, price, and reputation.
    let demand = gameState.config.baseDemand;
    demand *= forecast.weatherMod;
    demand *= forecast.trafficMod;
    demand *= marketingMod;
    if (forecast.event?.demandModifier) {
        demand *= forecast.event.demandModifier;
    }
    const priceImpact = Math.max(0.2, 1 - (price - 3) / 8);
    demand *= priceImpact;
    const reputationImpact = 0.6 + gameState.reputation / 100;
    demand *= reputationImpact;
    const randomness = 0.9 + Math.random() * 0.3;
    demand *= randomness;
    return Math.max(0, demand);
}

function adjustReputation({ units, unitsSold, price, profit }) {
    let delta = 0;
    const sellThrough = units === 0 ? 0 : unitsSold / units;
    if (units > 0) {
        if (sellThrough > 0.95) {
            delta += 3;
            addLog("Buzz", "You basically sold out — the line loved it.");
        } else if (sellThrough > 0.75) {
            delta += 2;
        } else if (sellThrough < 0.4 && units > 0) {
            delta -= 2;
        }
        if (units - unitsSold > units * 0.4) {
            delta -= 1;
        }
    }
    if (price >= 6 && sellThrough < 0.4) {
        delta -= 2;
        addLog("Gossip", "People said your prices felt high for the neighborhood.");
    }
    if (profit < 0) {
        delta -= 1;
    }
    gameState.reputation = clamp(0, 100, gameState.reputation + delta);
}

function triggerBankruptcy() {
    gameState.status = "bankrupt";
    elements.runDay.disabled = true;
    elements.restartBtn.classList.remove("hidden");
    addLog(
        "Game Over",
        `You went bankrupt on day ${gameState.day}. Keep hustling — try a new run!`
    );
}

function updateUI() {
    elements.dayDisplay.textContent = gameState.day;
    elements.cashDisplay.textContent = formatCurrency(gameState.cash);
    elements.repDisplay.textContent = `${Math.round(gameState.reputation)} · ${describeRep(
        gameState.reputation
    )}`;
    const forecast = gameState.currentForecast;
    elements.weatherDisplay.textContent = `${forecast.weather} (${forecast.weatherDescription})`;
    elements.trafficDisplay.textContent = `${forecast.traffic} (${forecast.trafficDescription})`;
    elements.eventDisplay.textContent = forecast.event
        ? `${forecast.event.name}`
        : "None today";
    elements.forecastText.textContent = `Expect ${forecast.weather.toLowerCase()} skies and ${forecast.traffic.toLowerCase()} crowds.`;
    renderHistory();
    renderLogs();
    drawChart();
}

function renderHistory() {
    const rows = gameState.history.slice(-8).reverse();
    elements.historyBody.innerHTML = rows
        .map(
            (entry) => `
        <tr>
            <td>${entry.day}</td>
            <td>$${entry.price.toFixed(2)}</td>
            <td>${entry.unitsPrepared}</td>
            <td>${entry.unitsSold}</td>
            <td>${formatCurrency(entry.profit)}</td>
        </tr>
    `
        )
        .join("");
}

function renderLogs() {
    const logs = gameState.logs.slice(0, 12);
    elements.logFeed.innerHTML = logs
        .map(
            (entry) => `
        <article class="log-entry">
            <strong>${entry.title}</strong>
            <span>${entry.message}</span>
        </article>
    `
        )
        .join("");
}

function drawChart() {
    const ctx = chartCtx;
    const { width, height } = elements.chart;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);
    const data = gameState.cashTimeline;
    if (data.length < 2) {
        return;
    }
    const padding = 30;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = Math.max(10, max - min);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((value, index) => {
        const x = padding + (index / (data.length - 1)) * (width - padding * 2);
        const y =
            height -
            padding -
            ((value - min) / range) * (height - padding * 2);
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
}

function addLog(title, message) {
    gameState.logs.unshift({ title, message });
    if (gameState.logs.length > 60) {
        gameState.logs.length = 60;
    }
}

function describeRep(score) {
    if (score < 30) return "Unknown";
    if (score < 50) return "Local Newcomer";
    if (score < 70) return "Lunch Spot";
    if (score < 85) return "Neighborhood Favorite";
    return "Street Legend";
}

function formatCurrency(value) {
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    });
    return formatter.format(value);
}

function clamp(min, max, value) {
    return Math.max(min, Math.min(max, value));
}

initGame();
