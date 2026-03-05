const CONFIG = {
    // PASTE YOUR GOOGLE APPS SCRIPT URL HERE
    api: "https://script.google.com/macros/s/AKfycbxPo_6gATFfSkQv6Juy8eme2AH9Q5SwKYWkeEzS20_7CnHAQen3_I6DsSvw0STRXju9vg/exec"
};

let dictionaryData = [];
let groupedDictionaryData = {};
let lastFilterResults = [];

// --- INITIALIZATION ---
async function init() {
    const status = document.getElementById('statusMessage');
    status.textContent = "🔄 Syncing with Google Sheets...";

    try {
        const response = await fetch(CONFIG.api);
        const csvText = await response.text();
        
        // Parse CSV and handle columns: English, Bodo, Explanation
        dictionaryData = parseCSV(csvText);

        groupedDictionaryData = {};
        dictionaryData.forEach(item => {
            if (!groupedDictionaryData[item.english]) {
                groupedDictionaryData[item.english] = [];
            }
            groupedDictionaryData[item.english].push(item);
        });

        status.textContent = `✅ ${dictionaryData.length} Words Loaded`;
    } catch (e) {
        status.textContent = "⚠️ Sync Error. Check Internet/API.";
        console.error(e);
    }
}

function parseCSV(text) {
    const lines = text.split('\n');
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Split by comma, respecting quotes
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        
        result.push({
            english: (parts[0] || "").replace(/"/g, '').trim(),
            translation: (parts[1] || "").replace(/"/g, '').trim(),
            explanation: (parts[2] || "").replace(/"/g, '').trim()
        });
    }
    return result;
}

// --- SEARCH & DISPLAY ---
function filterData(query) {
    const q = query.toLowerCase().trim();
    const container = document.getElementById('bookTableContainer');
    if (!q) { container.style.display = 'none'; return; }

    const matches = Object.keys(groupedDictionaryData).filter(word => 
        word.toLowerCase().includes(q) || 
        groupedDictionaryData[word].some(item => item.translation.toLowerCase().includes(q))
    ).sort();

    renderTable(matches);
}

function renderTable(matchingKeys) {
    const container = document.getElementById('bookTableContainer');
    const tbody = document.getElementById('bookTableBody');
    tbody.innerHTML = ''; 
    lastFilterResults = matchingKeys;

    if (matchingKeys.length === 0) { container.style.display = 'none'; return; }
    container.style.display = 'block';

    matchingKeys.forEach(word => {
        const row = tbody.insertRow();
        row.onclick = () => showDetails(word);
        
        // Display English and Bodo in Bold as requested
        row.insertCell().innerHTML = `<strong>${word}</strong>`;
        row.insertCell().innerHTML = `<strong>${groupedDictionaryData[word][0].translation}</strong>`;
    });
}

function showDetails(word) {
    document.getElementById('bookTableContainer').style.display = 'none';
    const entries = groupedDictionaryData[word];
    let html = '';
    
    entries.forEach(e => {
        html += `
            <div class="meaning-card">
                <p><strong>${word}</strong></p>
                <p><strong>${e.translation}</strong></p>
                <p class="small-explanation">${e.explanation}</p>
            </div>`;
    });
    
    document.getElementById('definitionText').innerHTML = html;
    document.getElementById('descriptionTitle').textContent = "Word Details";
    document.getElementById('descriptionArea').style.display = 'block';
}

// --- LISTENERS ---
document.getElementById('searchInput').oninput = (e) => filterData(e.target.value);
document.getElementById('backButton').onclick = () => {
    document.getElementById('descriptionArea').style.display = 'none';
    renderTable(lastFilterResults);
};
document.getElementById('themeToggle').onclick = () => document.body.classList.toggle('dark-theme');

init();
