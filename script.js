const CONFIG = {
    db: "bodo_dictionary.json", // Ensure this file is in the same folder
    api: "https://script.google.com/macros/s/AKfycbxPo_6gATFfSkQv6Juy8eme2AH9Q5SwKYWkeEzS20_7CnHAQen3_I6DsSvw0STRXju9vg/exec"
};

let dictionaryData = [];
let groupedDictionaryData = {};
let lastFilterResults = [];

// --- INITIALIZATION ---
async function init() {
    const status = document.getElementById('statusMessage');
    try {
        const response = await fetch(CONFIG.db);
        if (!response.ok) throw new Error("JSON file not found");
        
        const data = await response.json();
        
        // Map JSON keys (Supporting both CSV-to-JSON and Manual formats)
        dictionaryData = data.map(item => ({
            english: item["English Word"] || item.english,
            translation: item["Bodo Meaning"] || item.translation,
            explanation: item["Explanation"] || item.explanation,
            extra: item["Transliteration"] || item.extra
        }));

        // Grouping logic for multiple meanings
        groupedDictionaryData = {};
        dictionaryData.forEach(item => {
            const key = item.english;
            if (!groupedDictionaryData[key]) groupedDictionaryData[key] = [];
            groupedDictionaryData[key].push(item);
        });

        status.textContent = `✅ ${dictionaryData.length} Words Loaded`;
    } catch (e) {
        status.textContent = "⚠️ Error loading JSON data.";
        console.error(e);
    }
}

// --- SEARCH LOGIC ---
function filterData(query) {
    const q = query.toLowerCase().trim();
    const container = document.getElementById('bookTableContainer');
    if (!q) { container.style.display = 'none'; return; }

    const allWords = Object.keys(groupedDictionaryData);
    const matches = allWords.filter(word => 
        word.toLowerCase().includes(q) || 
        groupedDictionaryData[word].some(item => item.translation.toLowerCase().includes(q))
    ).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

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
        
        const cellEng = row.insertCell();
        cellEng.innerHTML = `<span class="word-primary">${word}</span>`;
        
        const cellTr = row.insertCell();
        const meanings = groupedDictionaryData[word].map(i => i.translation).join(", ");
        cellTr.innerHTML = `<span class="word-muted">${meanings}</span>`;
    });
}

function showDetails(word) {
    document.getElementById('bookTableContainer').style.display = 'none';
    const entries = groupedDictionaryData[word];
    let html = '';
    entries.forEach(e => {
        html += `
            <div class="meaning-row">
                <div class="meaning-header">
                    <span class="bodo-text">${e.translation}</span>
                    <button onclick="navigator.clipboard.writeText('${e.translation}')" class="copy-btn">📋</button>
                </div>
                ${e.extra ? `<span class="translit-tag">${e.extra}</span>` : ''}
                ${e.explanation ? `<div class="explanation-box">${e.explanation}</div>` : ''}
            </div>`;
    });
    document.getElementById('definitionText').innerHTML = html;
    document.getElementById('descriptionTitle').textContent = word;
    document.getElementById('descriptionArea').style.display = 'block';
}

// --- ADMIN & THEME HANDLERS ---
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

init();
