const CONFIG = {
    db: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQLtdSVACMT2lwL9zKyOMuhrFiIpzKrZSjR0leijaTbBV5akRBlQCNwa8zVRxqvqA/pub?output=csv",
    api: "https://script.google.com/macros/s/AKfycbxPo_6gATFfSkQv6Juy8eme2AH9Q5SwKYWkeEzS20_7CnHAQen3_I6DsSvw0STRXju9vg/exec"
};

let dictionaryData = [];
let groupedDictionaryData = {};
let lastFilterResults = [];

// --- INITIALIZATION ---
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
        if (status) status.textContent = "✅ Ready!";
    } catch (e) { 
        if (status) status.textContent = "⚠️ Load Error."; 
        console.error("Fetch error:", e);
    }
}

// --- BODO DATA PARSER ---
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const data = [];
    const csvRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/; 

    for (let i = 1; i < lines.length; i++) {
        let row = lines[i].split(csvRegex);
        if (row.length < 2) continue;

        let english = row[0].replace(/"/g, '').trim();
        // Bodo Order: 0:English, 1:Explanation, 2:Meaning, 3:Transliteration
        let explanation = (row[1] || "").replace(/"/g, '').trim();
        let translation = (row[2] || "").replace(/"/g, '').trim();
        let extra = (row[3] || "").replace(/"/g, '').trim();

        if (english) {
            data.push({ english, translation, extra, explanation });
        }
    }
    return data;
}

// --- SEARCH LOGIC ---
function filterData(query) {
    const q = query.toLowerCase().trim();
    const container = document.getElementById('bookTableContainer');
    if (!q) { 
        if (container) container.style.display = 'none'; 
        return; 
    }

    const allEnglishWords = Object.keys(groupedDictionaryData);
    let matches = allEnglishWords.filter(word => 
        word.toLowerCase().includes(q) || 
        groupedDictionaryData[word].some(item => item.translation.toLowerCase().includes(q))
    );

    matches.sort((a, b) => {
        const aLow = a.toLowerCase();
        const bLow = b.toLowerCase();
        if (aLow === q && bLow !== q) return -1;
        if (bLow === q && aLow !== q) return 1;
        if (aLow.startsWith(q) && !bLow.startsWith(q)) return -1;
        return aLow.localeCompare(bLow);
    });

    renderTable(matches);
}

// --- TABLE RENDERING ---
function renderTable(matchingKeys) {
    const container = document.getElementById('bookTableContainer');
    const tbody = document.getElementById('bookTableBody');
    if (!tbody) return;

    tbody.innerHTML = ''; 
    lastFilterResults = matchingKeys;

    if (matchingKeys.length === 0) { 
        container.style.display = 'none'; 
        return; 
    }

    container.style.display = 'block';
    
    matchingKeys.forEach(word => {
        const row = tbody.insertRow();
        row.onclick = () => showDetails(word);
        
        const cellEng = row.insertCell();
        cellEng.textContent = word;
        cellEng.style.fontWeight = "bold";

        const cellTr = row.insertCell();
        const allMeanings = groupedDictionaryData[word].map(item => item.translation);
        cellTr.textContent = allMeanings.join(", ");
    });
}

// --- DETAIL VIEW ---
function showDetails(word) {
    document.getElementById('bookTableContainer').style.display = 'none';
    const entries = groupedDictionaryData[word];
    let html = '';
    entries.forEach(e => {
        html += `
            <div class="detail-item">
                <p style="font-size: 1.25rem; margin:0; font-weight: 600; color: var(--primary-color);">
                    ${e.translation} 
                    <button onclick="navigator.clipboard.writeText('${e.translation}')" class="copy-btn-mini">📋</button>
                </p>
                ${e.extra ? `<p style="font-size: 0.85rem; color: #777; margin: 4px 0;"><em>Transliteration: ${e.extra}</em></p>` : ''}
                ${e.explanation ? `<p class="explanation-box"><strong>Explanation:</strong> ${e.explanation}</p>` : ''}
            </div>
        `;
    });
    document.getElementById('definitionText').innerHTML = html;
    document.getElementById('descriptionTitle').textContent = word;
    document.getElementById('descriptionArea').style.display = 'block';
}

// --- ADMIN PANEL ---
async function performLogin() {
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;
    try {
        const resp = await fetch(CONFIG.api, { 
            method: "POST", 
            body: JSON.stringify({ action: "login", user, pass }) 
        });
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
        const resp = await fetch(CONFIG.api, { 
            method: "POST", 
            body: JSON.stringify({ action: "add", from, meaning, extra, expl }) 
        });
        alert("Saved successfully!");
        init(); 
    } catch(e) { alert("Save failed"); }
}

function logout() {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('entryForm').style.display = 'none';
}

// --- LISTENERS ---
document.getElementById('searchInput').oninput = (e) => filterData(e.target.value);
document.getElementById('backButton').onclick = () => { 
    document.getElementById('descriptionArea').style.display='none'; 
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
