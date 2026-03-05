const CONFIG = {
    // Your specific Google Apps Script Deployment URL
    api: "https://script.google.com/macros/s/AKfycbqty3-JEhkJwLxQmGhykF1I7j7kDgVZzE4f-Rr2ynGPS9ZJY6M_CpjRqvcw1ukkCHkAw/exec"
};

let dictionaryData = [];
let groupedDictionaryData = {};
let lastFilterResults = [];

// --- INITIALIZATION ---
async function init() {
    const status = document.getElementById('statusMessage');
    if (status) status.textContent = "🔄 Syncing Bodo Dictionary...";

    try {
        const response = await fetch(CONFIG.api);
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

// --- CSV PARSER (Matches: English, Bodo Meaning, Explanation) ---
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const data = [];
    const csvRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/; 

    for (let i = 1; i < lines.length; i++) {
        let row = lines[i].split(csvRegex);
        if (row.length < 2) continue;

        let english = row[0].replace(/"/g, '').trim();
        let translation = (row[1] || "").replace(/"/g, '').trim();
        let explanation = (row[2] || "").replace(/"/g, '').trim();

        if (english) {
            data.push({ english, translation, explanation });
        }
    }
    return data;
}

// --- SEARCH LOGIC ---
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

// --- TABLE RENDERING (Bold English and Bodo) ---
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
        
        // English Word and Bodo Meaning in BOLD
        row.insertCell().innerHTML = `<strong>${word}</strong>`;
        row.insertCell().innerHTML = `<strong>${groupedDictionaryData[word][0].translation}</strong>`;
    });
}

// --- DETAIL VIEW (Bold and Small Font) ---
function showDetails(word) {
    document.getElementById('bookTableContainer').style.display = 'none';
    const entries = groupedDictionaryData[word];
    let html = '';
    
    entries.forEach(e => {
        html += `
            <div class="meaning-row">
                <p><strong>${word}</strong></p>
                
                <p><strong>${e.translation}</strong> 
                    <button onclick="navigator.clipboard.writeText('${e.translation}')" class="copy-btn-mini">📋</button>
                </p>
                
                ${e.explanation ? `<div class="small-explanation">${e.explanation}</div>` : ''}
            </div>`;
    });
    
    document.getElementById('definitionText').innerHTML = html;
    document.getElementById('descriptionArea').style.display = 'block';
}

document.getElementById('searchInput').oninput = (e) => filterData(e.target.value);
document.getElementById('backButton').onclick = () => {
    document.getElementById('descriptionArea').style.display = 'none';
    renderTable(lastFilterResults);
};
document.getElementById('themeToggle').onclick = () => document.body.classList.toggle('dark-theme');

init();
