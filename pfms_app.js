// PFMS Application JavaScript
let appData = {
    transactions: [],
    subscriptions: [],
    wastefulExpenses: [],
    investments: [],
    rewards: [],
    userPoints: 0,
    userTier: 'Bronze'
};

let charts = {};

// Load sample data
async function loadSampleData() {
    const sampleData = {
        "transactions": [
            {"date": "2024-01-01", "merchant": "Salary Deposit", "category": "Income", "amount": 50000, "type": "income", "paymentMethod": "Bank Transfer", "source": "Manual"},
            {"date": "2024-01-05", "merchant": "Netflix", "category": "Entertainment", "amount": 599, "type": "expense", "paymentMethod": "Credit Card", "source": "Gmail", "isRecurring": true},
            {"date": "2024-01-05", "merchant": "Spotify", "category": "Entertainment", "amount": 119, "type": "expense", "paymentMethod": "UPI", "source": "Gmail", "isRecurring": true},
            {"date": "2024-01-06", "merchant": "Swiggy", "category": "Food", "amount": 450, "type": "expense", "paymentMethod": "UPI", "source": "Gmail"},
            {"date": "2024-01-07", "merchant": "Amazon", "category": "Shopping", "amount": 2499, "type": "expense", "paymentMethod": "Credit Card", "source": "Gmail"},
            {"date": "2024-01-08", "merchant": "Uber", "category": "Transport", "amount": 180, "type": "expense", "paymentMethod": "UPI", "source": "Gmail"},
            {"date": "2024-01-09", "merchant": "Starbucks", "category": "Food", "amount": 350, "type": "expense", "paymentMethod": "Credit Card", "source": "Manual"},
            {"date": "2024-01-10", "merchant": "Gym Membership", "category": "Bills", "amount": 1500, "type": "expense", "paymentMethod": "Debit Card", "source": "Gmail", "isRecurring": true, "isUnused": true},
            {"date": "2024-01-10", "merchant": "Hotstar", "category": "Entertainment", "amount": 299, "type": "expense", "paymentMethod": "Credit Card", "source": "Gmail", "isRecurring": true, "isUnused": true},
            {"date": "2024-01-11", "merchant": "Zomato", "category": "Food", "amount": 520, "type": "expense", "paymentMethod": "UPI", "source": "Gmail"},
            {"date": "2024-01-12", "merchant": "Flipkart", "category": "Shopping", "amount": 1899, "type": "expense", "paymentMethod": "Credit Card", "source": "Gmail"},
            {"date": "2024-01-13", "merchant": "Ola", "category": "Transport", "amount": 220, "type": "expense", "paymentMethod": "UPI", "source": "Gmail"},
            {"date": "2024-01-14", "merchant": "McDonald's", "category": "Food", "amount": 280, "type": "expense", "paymentMethod": "UPI", "source": "Manual"},
            {"date": "2024-01-15", "merchant": "Airtel Recharge", "category": "Bills", "amount": 599, "type": "expense", "paymentMethod": "UPI", "source": "Gmail"},
            {"date": "2024-01-16", "merchant": "BookMyShow", "category": "Entertainment", "amount": 450, "type": "expense", "paymentMethod": "Credit Card", "source": "Gmail"},
            {"date": "2024-01-17", "merchant": "Swiggy", "category": "Food", "amount": 380, "type": "expense", "paymentMethod": "UPI", "source": "Gmail"},
            {"date": "2024-01-18", "merchant": "Myntra", "category": "Shopping", "amount": 3200, "type": "expense", "paymentMethod": "Credit Card", "source": "Gmail"},
            {"date": "2024-01-19", "merchant": "Rapido", "category": "Transport", "amount": 85, "type": "expense", "paymentMethod": "UPI", "source": "Gmail"},
            {"date": "2024-01-20", "merchant": "Dominos", "category": "Food", "amount": 650, "type": "expense", "paymentMethod": "Credit Card", "source": "Manual"},
            {"date": "2024-01-21", "merchant": "Amazon Prime", "category": "Entertainment", "amount": 1499, "type": "expense", "paymentMethod": "Credit Card", "source": "Gmail", "isRecurring": true},
            {"date": "2024-01-22", "merchant": "BigBasket", "category": "Shopping", "amount": 2100, "type": "expense", "paymentMethod": "UPI", "source": "Gmail"},
            {"date": "2024-01-23", "merchant": "Uber", "category": "Transport", "amount": 195, "type": "expense", "paymentMethod": "UPI", "source": "Gmail"},
            {"date": "2024-01-24", "merchant": "KFC", "category": "Food", "amount": 420, "type": "expense", "paymentMethod": "UPI", "source": "Manual"},
            {"date": "2024-01-25", "merchant": "Electricity Bill", "category": "Bills", "amount": 1850, "type": "expense", "paymentMethod": "Net Banking", "source": "Gmail"},
            {"date": "2024-01-26", "merchant": "Zomato", "category": "Food", "amount": 490, "type": "expense", "paymentMethod": "UPI", "source": "Gmail"},
            {"date": "2024-01-27", "merchant": "Ajio", "category": "Shopping", "amount": 2750, "type": "expense", "paymentMethod": "Credit Card", "source": "Gmail"},
            {"date": "2024-01-28", "merchant": "Ola", "category": "Transport", "amount": 165, "type": "expense", "paymentMethod": "UPI", "source": "Gmail"},
            {"date": "2024-01-29", "merchant": "Starbucks", "category": "Food", "amount": 320, "type": "expense", "paymentMethod": "Credit Card", "source": "Manual"},
            {"date": "2024-01-30", "merchant": "Jio Fiber", "category": "Bills", "amount": 999, "type": "expense", "paymentMethod": "UPI", "source": "Gmail", "isRecurring": true}
        ],
        "subscriptions": [
            {"service": "Netflix", "amount": 599, "frequency": "monthly", "status": "active", "isUnused": false},
            {"service": "Spotify", "amount": 119, "frequency": "monthly", "status": "active", "isUnused": false},
            {"service": "Gym Membership", "amount": 1500, "frequency": "monthly", "status": "active", "isUnused": true},
            {"service": "Hotstar", "amount": 299, "frequency": "monthly", "status": "active", "isUnused": true},
            {"service": "Amazon Prime", "amount": 1499, "frequency": "yearly", "status": "active", "isUnused": false},
            {"service": "Jio Fiber", "amount": 999, "frequency": "monthly", "status": "active", "isUnused": false}
        ],
        "wastefulExpenses": [
            {"type": "unused_subscription", "service": "Gym Membership", "amount": 1500, "reason": "No gym visits in last 30 days", "monthlySavings": 1500},
            {"type": "unused_subscription", "service": "Hotstar", "amount": 299, "reason": "No streaming activity detected", "monthlySavings": 299},
            {"type": "small_repeated_expenses", "service": "Coffee/Snacks", "amount": 1720, "reason": "9 small food purchases", "monthlySavings": 516}
        ]
    };
    
    appData.transactions = sampleData.transactions;
    appData.subscriptions = sampleData.subscriptions;
    appData.wastefulExpenses = sampleData.wastefulExpenses;
    
    // Calculate potential savings
    const potentialSavings = appData.wastefulExpenses.reduce((sum, w) => sum + w.monthlySavings, 0);
    
    // Generate investment recommendations
    appData.investments = [
        {
            option: "Index Fund SIP",
            risk: "Medium",
            monthly: potentialSavings,
            projected_6m: potentialSavings * 6 * 1.06,
            projected_12m: potentialSavings * 12 * 1.107,
            return_6m: 6.0,
            return_12m: 10.7,
            points: Math.floor(potentialSavings * 1.44)
        },
        {
            option: "Digital Gold",
            risk: "Low",
            monthly: potentialSavings,
            projected_6m: potentialSavings * 6 * 1.04,
            projected_12m: potentialSavings * 12 * 1.057,
            return_6m: 4.0,
            return_12m: 5.7,
            points: Math.floor(potentialSavings * 1.2)
        },
        {
            option: "High-Yield Savings",
            risk: "No Risk",
            monthly: potentialSavings,
            projected_6m: potentialSavings * 6 * 1.02,
            projected_12m: potentialSavings * 12 * 1.04,
            return_6m: 2.0,
            return_12m: 4.0,
            points: Math.floor(potentialSavings * 1.0)
        }
    ];
    
    // Initialize rewards
    appData.rewards = [
        {action: "cancel_subscription", description: "Canceled Hotstar subscription", points: 80, timestamp: "2024-01-15T10:30:00Z"},
        {action: "meet_savings_target", description: "Saved 12% of monthly budget", points: 120, timestamp: "2024-01-20T14:00:00Z"}
    ];
    appData.userPoints = 200;
    appData.userTier = 'Bronze';
}

// Login functions
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    showApp();
}

function gmailLogin() {
    document.getElementById('syncStatus').classList.add('syncing');
    document.getElementById('syncText').textContent = 'Syncing Gmail...';
    
    setTimeout(() => {
        showApp();
        document.getElementById('syncStatus').classList.remove('syncing');
        document.getElementById('syncText').textContent = 'Gmail Synced ✓';
    }, 2000);
}

async function showApp() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('appPage').classList.remove('hidden');
    
    await loadSampleData();
    updateDashboard();
    initCharts();
    renderSubscriptions();
    renderWastefulExpenses();
    renderInvestments();
    renderRewards();
    initChatbot();
}

function logout() {
    document.getElementById('appPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
}

// Update dashboard
function updateDashboard() {
    const income = appData.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = appData.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const gmailCount = appData.transactions.filter(t => t.source === 'Gmail').length;
    
    document.getElementById('income').textContent = '₹' + income.toLocaleString();
    document.getElementById('expenses').textContent = '₹' + expenses.toLocaleString();
    document.getElementById('balance').textContent = '₹' + (income - expenses).toLocaleString();
    document.getElementById('gmailCount').textContent = gmailCount;
    document.getElementById('rewardPoints').textContent = appData.userPoints;
    document.getElementById('userTier').textContent = appData.userTier;
    document.getElementById('txnCount').textContent = appData.transactions.length;
    
    const tbody = document.getElementById('transactions');
    tbody.innerHTML = '';
    appData.transactions.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.date}</td>
            <td>${t.merchant}</td>
            <td>${t.category}</td>
            <td style="color: #666;">${t.paymentMethod}</td>
            <td><span class="badge ${t.source === 'Gmail' ? 'badge-gmail' : 'badge-manual'}">${t.source}</span></td>
            <td style="text-align: right; font-weight: bold; color: ${t.type === 'income' ? '#10b981' : '#ef4444'};">
                ${t.type === 'income' ? '+' : '-'}₹${t.amount.toLocaleString()}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Initialize charts
function initCharts() {
    const catMap = {};
    appData.transactions.forEach(t => {
        if (t.type === 'expense') catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    
    // Category Chart
    charts.category = new Chart(document.getElementById('categoryChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(catMap),
            datasets: [{
                data: Object.values(catMap),
                backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
    
    // Trend Chart
    const last7Days = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days[dateStr] = 0;
    }
    appData.transactions.forEach(t => {
        if (t.type === 'expense' && last7Days.hasOwnProperty(t.date)) {
            last7Days[t.date] += t.amount;
        }
    });
    
    charts.trend = new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: {
            labels: Object.keys(last7Days).map(d => new Date(d).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})),
            datasets: [{
                label: 'Daily Spending',
                data: Object.values(last7Days),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
    
    // Monthly Chart
    charts.monthly = new Chart(document.getElementById('monthlyChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(catMap),
            datasets: [{
                label: 'This Month',
                data: Object.values(catMap),
                backgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Render subscriptions
function renderSubscriptions() {
    const container = document.getElementById('subscriptionsList');
    container.innerHTML = '';
    
    appData.subscriptions.forEach(sub => {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 20px; background: #f9fafb; border-radius: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;';
        div.innerHTML = `
            <div>
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">${sub.service}</div>
                <div style="color: #666; font-size: 14px;">₹${sub.amount} / ${sub.frequency}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 20px; font-weight: bold; color: #667eea;">₹${sub.amount}</div>
                <div style="font-size: 12px; color: ${sub.isUnused ? '#ef4444' : '#10b981'};">
                    ${sub.isUnused ? '⚠️ Unused' : '✓ Active'}
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Render wasteful expenses
function renderWastefulExpenses() {
    const container = document.getElementById('wastefulList');
    container.innerHTML = '';
    
    appData.wastefulExpenses.forEach(waste => {
        const div = document.createElement('div');
        div.className = 'wasteful-item';
        div.innerHTML = `
            <div class="wasteful-header">
                <div class="wasteful-service">${waste.service}</div>
                <div class="wasteful-amount">₹${waste.amount}</div>
            </div>
            <div class="wasteful-reason">⚠️ ${waste.reason}</div>
            <div class="wasteful-savings">💰 Potential monthly savings: ₹${waste.monthlySavings}</div>
            <button class="btn-cancel" onclick="cancelExpense('${waste.service}', ${waste.monthlySavings})">
                Cancel & Earn ${Math.floor(50 + waste.monthlySavings / 10)} Points
            </button>
        `;
        container.appendChild(div);
    });
}

// Render investments
function renderInvestments() {
    const potentialSavings = appData.wastefulExpenses.reduce((sum, w) => sum + w.monthlySavings, 0);
    document.getElementById('potentialSavings').textContent = '₹' + potentialSavings.toLocaleString();
    
    const container = document.getElementById('investmentGrid');
    container.innerHTML = '';
    
    appData.investments.forEach(inv => {
        const div = document.createElement('div');
        div.className = 'investment-card';
        div.innerHTML = `
            <div class="investment-header">
                <div class="investment-name">${inv.option}</div>
                <div class="risk-badge risk-${inv.risk.toLowerCase().replace(' ', '')}">${inv.risk} Risk</div>
            </div>
            <div style="color: #666; margin-bottom: 15px;">Monthly: ₹${inv.monthly.toLocaleString()}</div>
            <div class="projection">
                <div class="projection-label">6 Months</div>
                <div class="projection-value">₹${inv.projected_6m.toFixed(0).toLocaleString()}</div>
                <div style="font-size: 12px; color: #10b981;">+${inv.return_6m}% return</div>
            </div>
            <div class="projection">
                <div class="projection-label">12 Months</div>
                <div class="projection-value">₹${inv.projected_12m.toFixed(0).toLocaleString()}</div>
                <div style="font-size: 12px; color: #10b981;">+${inv.return_12m}% return</div>
            </div>
            <div class="points-reward">🏆 Earn ${inv.points} Reward Points</div>
        `;
        container.appendChild(div);
    });
}

// Render rewards
function renderRewards() {
    document.getElementById('tierBadge').textContent = appData.userTier;
    document.getElementById('tierBadge').className = `tier-badge ${appData.userTier.toLowerCase()}`;
    
    const badgesContainer = document.getElementById('badgesList');
    badgesContainer.innerHTML = `
        <div class="badge-item">🎯 Subscription Slayer</div>
        <div class="badge-item">💰 Smart Saver</div>
    `;
    
    const historyContainer = document.getElementById('rewardHistory');
    historyContainer.innerHTML = '';
    
    appData.rewards.forEach(reward => {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 15px; background: #f9fafb; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;';
        div.innerHTML = `
            <div>
                <div style="font-weight: 600; margin-bottom: 5px;">${reward.description}</div>
                <div style="font-size: 12px; color: #666;">${new Date(reward.timestamp).toLocaleDateString()}</div>
            </div>
            <div style="font-size: 20px; font-weight: bold; color: #f59e0b;">+${reward.points}</div>
        `;
        historyContainer.appendChild(div);
    });
}

// Cancel expense and award points
function cancelExpense(service, savings) {
    const points = Math.floor(50 + savings / 10);
    appData.userPoints += points;
    
    // Update UI
    document.getElementById('rewardPoints').textContent = appData.userPoints;
    
    // Add reward
    appData.rewards.unshift({
        action: 'cancel_subscription',
        description: `Canceled ${service}`,
        points: points,
        timestamp: new Date().toISOString()
    });
    
    // Remove from wasteful
    appData.wastefulExpenses = appData.wastefulExpenses.filter(w => w.service !== service);
    
    // Show notification
    alert(`🎉 Congratulations! You earned ${points} points by canceling ${service}!\n\nYour total points: ${appData.userPoints}`);
    
    renderWastefulExpenses();
    renderRewards();
}

// Tab switching
function showTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('dashboardContent').classList.toggle('hidden', tab !== 'dashboard');
    document.getElementById('analyticsContent').classList.toggle('hidden', tab !== 'analytics');
    document.getElementById('subscriptionsContent').classList.toggle('hidden', tab !== 'subscriptions');
    document.getElementById('investmentsContent').classList.toggle('hidden', tab !== 'investments');
    document.getElementById('rewardsContent').classList.toggle('hidden', tab !== 'rewards');
    document.getElementById('chatbotContent').classList.toggle('hidden', tab !== 'chatbot');
}

// Chatbot
function initChatbot() {
    addMessage('bot', `Hi! I'm your AI financial assistant. I can help you with spending analysis, subscription management, investment advice, and reward tracking. Ask me anything!`);
}

function addMessage(type, text) {
    const messagesDiv = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerHTML = `<div class="message-bubble">${text}</div>`;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function processQuery(query) {
    const q = query.toLowerCase();
    
    if (q.includes('yesterday') || q.includes('spent yesterday')) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const txns = appData.transactions.filter(t => t.date === yesterdayStr && t.type === 'expense');
        const total = txns.reduce((s, t) => s + t.amount, 0);
        return txns.length > 0 ? `Yesterday you spent ₹${total} across ${txns.length} transactions.` : 'You had no transactions yesterday.';
    }
    
    if (q.includes('subscription') && q.includes('cancel')) {
        const unused = appData.subscriptions.filter(s => s.isUnused);
        if (unused.length > 0) {
            const services = unused.map(s => s.service).join(', ');
            const savings = unused.reduce((sum, s) => sum + s.amount, 0);
            return `You can cancel these unused subscriptions: ${services}. This will save you ₹${savings} per month and earn you reward points!`;
        }
        return 'Great! You don\'t have any unused subscriptions.';
    }
    
    if (q.includes('invest') || q.includes('investment')) {
        const savings = appData.wastefulExpenses.reduce((sum, w) => sum + w.monthlySavings, 0);
        const best = appData.investments[0];
        return `Based on your potential savings of ₹${savings}/month, I recommend ${best.option}. In 12 months, you could have ₹${best.projected_12m.toFixed(0)} (${best.return_12m}% return) and earn ${best.points} reward points!`;
    }
    
    if (q.includes('reward') || q.includes('points')) {
        return `You have ${appData.userPoints} reward points and you're in the ${appData.userTier} tier! Cancel unused subscriptions or invest your savings to earn more points.`;
    }
    
    if (q.includes('balance')) {
        const income = appData.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expenses = appData.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return `Your balance is ₹${(income - expenses).toLocaleString()}. Income: ₹${income.toLocaleString()}, Expenses: ₹${expenses.toLocaleString()}`;
    }
    
    return 'I can help you with: spending analysis, subscription management, investment recommendations, and reward tracking. What would you like to know?';
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const query = input.value.trim();
    if (!query) return;
    
    addMessage('user', query);
    input.value = '';
    
    setTimeout(() => {
        const reply = processQuery(query);
        addMessage('bot', reply);
    }, 500);
}

function askQuestion(q) {
    document.getElementById('chatInput').value = q;
}
