const CONFIG = {
    BODO: {
        db: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQLtdSVACMT2lwL9zKyOMuhrFiIpzKrZSjR0leijaTbBV5akRBlQCNwa8zVRxqvqA/pub?output=csv",
        api: "https://script.google.com/macros/s/AKfycbxPo_6gATFfSkQv6Juy8eme2AH9Q5SwKYWkeEzS20_7CnHAQen3_I6DsSvw0STRXju9vg/exec"
};

let dictionaryData = [];
let groupedDictionaryData = {};
let lastFilterResults = [];

async function init() {
    const status = document.getElementById('statusMessage');
    if (status) status.textContent = "🔄 Syncing Bodo Dictionary...";
    try {
        const response = await fetch(CONFIG.db + '&t=' + new Date().getTime());
        const csvText = await response.text();
        dictionaryData = parseCSV(csvText);
        
        groupedDictionaryData = {};
        dictionaryData.forEach(item => {
            if (!groupedDictionaryData[item.english]) groupedDictionaryData[item.english] = [];
            groupedDictionaryData[item.english].push(item);
        });
        if (status) status.textContent = `✅ Ready! (${dictionaryData.length} words)`;
    } catch (e) { 
        if (status) status.textContent = "⚠️ Load Error."; 
        console.error("Fetch error:", e);
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const data = [];
    const csvRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/; 

    for (let i = 1; i < lines.length; i++) {
        let row = lines[i].split(csvRegex);
        if (row.length < 2) continue;

        let english = row[0].replace(/"/g, '').trim();
        let explanation = (row[1] || "").replace(/"/g, '').trim();
        let translation = (row[2] || "").replace(/"/g, '').trim();
        let extra = (row[3] || "").replace(/"/g, '').trim();

        if (english) {
            data.push({ english, translation, extra, explanation });
        }
    }
    return data;
}

function filterData(query) {
    const q = query.toLowerCase().trim();
    const container = document.getElementById('bookTableContainer');
    if (!q) { if (container) container.style.display = 'none'; return; }

    const matches = Object.keys(groupedDictionaryData).filter(word => 
        word.toLowerCase().includes(q) || 
        groupedDictionaryData[word].some(item => item.translation.toLowerCase().includes(q))
    ).sort();

    renderTable(matches);
}

function renderTable(matchingKeys) {
    const container = document.getElementById('bookTableContainer');
    const tbody = document.getElementById('bookTableBody');
    if (!tbody) return;

    tbody.innerHTML = ''; 
    lastFilterResults = matchingKeys;
    if (matchingKeys.length === 0) { container.style.display = 'none'; return; }

    container.style.display = 'block';
    matchingKeys.forEach(word => {
        const row = tbody.insertRow();
        row.onclick = () => showDetails(word);
        
        // Bold English and Bodo in the list
        row.insertCell().innerHTML = `<span class="bold-text">${word}</span>`;
        row.insertCell().innerHTML = `<span class="bold-text">${groupedDictionaryData[word][0].translation}</span>`;
    });
}

function showDetails(word) {
    document.getElementById('bookTableContainer').style.display = 'none';
    const entries = groupedDictionaryData[word];
    let html = `<h3>${word}</h3>`;
    
    entries.forEach(e => {
        html += `
            <div class="detail-item">
                <p class="bold-text" style="font-size: 1.25rem; color: var(--primary-color); margin:0;">
                    ${e.translation} 
                    <button onclick="navigator.clipboard.writeText('${e.translation}')" style="background:none;border:none;cursor:pointer;">📋</button>
                </p>
                ${e.extra ? `<p style="font-size: 0.85rem; color: #777; margin: 5px 0;"><em>${e.extra}</em></p>` : ''}
                ${e.explanation ? `<span class="small-explanation"><strong>Explanation:</strong> ${e.explanation}</span>` : ''}
            </div>`;
    });
    document.getElementById('definitionText').innerHTML = html;
    document.getElementById('descriptionArea').style.display = 'block';
}

// ADMIN FUNCTIONS
async function performLogin() {
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;
    try {
        const resp = await fetch(CONFIG.api, { method: "POST", body: JSON.stringify({ action: "login", user, pass }) });
        const res = await resp.json();
        if(res.success) {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('entryForm').style.display = 'block';
        } else { alert("Login Failed"); }
    } catch(e) { alert("Server Error"); }
}

async function saveNewWord() {
    const from = document.getElementById('newEnglish').value;
    const meaning = document.getElementById('newTranslation').value;
    const extra = document.getElementById('newExtra').value;
    const expl = document.getElementById('newExpl').value;
    try {
        await fetch(CONFIG.api, { method: "POST", body: JSON.stringify({ action: "add", from, meaning, extra, expl }) });
        alert("Saved!"); init();
    } catch(e) { alert("Error saving"); }
}

function logout() {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('entryForm').style.display = 'none';
}

// LISTENERS
document.getElementById('searchInput').oninput = (e) => filterData(e.target.value);
document.getElementById('backButton').onclick = () => {
    document.getElementById('descriptionArea').style.display = 'none';
    renderTable(lastFilterResults);
};
document.getElementById('themeToggle').onclick = () => document.body.classList.toggle('dark-theme');
document.getElementById('adminLoginBtn').onclick = () => {
    const p = document.getElementById('adminPanel');
    p.style.display = p.style.display === 'none' ? 'block' : 'none';
};
document.getElementById('contactButton').onclick = () => {
    const c = document.getElementById('contactArea');
    c.style.display = c.style.display === 'none' ? 'block' : 'none';
};

init();
