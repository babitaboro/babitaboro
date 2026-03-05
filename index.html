const CONFIG = {
    // UPDATED: Points directly to your raw JSON data on GitHub
    db: "https://raw.githubusercontent.com/babitaboro/babitaboro/main/bodo_dictionary.json"
};

let dictionaryData = [];
let groupedDictionaryData = {};
let lastFilterResults = [];

// --- INITIALIZATION ---
async function init() {
    const status = document.getElementById('statusMessage');
    status.textContent = "🔄 Syncing Bodo Dictionary from GitHub...";

    try {
        // We add '?t=' + time to force the browser to get the newest version of your file
        const response = await fetch(CONFIG.db + '?t=' + new Date().getTime());
        
        if (!response.ok) throw new Error("GitHub file not found");

        const data = await response.json();
        
        // Map the JSON keys (handles both 'English Word' from Excel and 'english' from JSON)
        dictionaryData = data.map(item => ({
            english: item["English Word"] || item.english,
            translation: item["Bodo Meaning"] || item.translation,
            explanation: item["Explanation"] || item.explanation,
            extra: item["Transliteration"] || item.extra
        }));

        // Grouping logic (handles multiple meanings for one word)
        groupedDictionaryData = {};
        dictionaryData.forEach(item => {
            const key = item.english;
            if (!groupedDictionaryData[key]) groupedDictionaryData[key] = [];
            groupedDictionaryData[key].push(item);
        });

        status.textContent = `✅ Loaded ${dictionaryData.length} Bodo words!`;
    } catch (e) {
        status.textContent = "⚠️ Sync Error. Please check your connection.";
        console.error("Fetch error:", e);
    }
}

// --- SEARCH & RENDER LOGIC ---
function filterData(query) {
    const q = query.toLowerCase().trim();
    const container = document.getElementById('bookTableContainer');
    
    if (!q) { 
        if (container) container.style.display = 'none'; 
        return; 
    }

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
        cellEng.innerHTML = `<strong>${word}</strong>`;
        
        const cellTr = row.insertCell();
        const meanings = groupedDictionaryData[word].map(i => i.translation).join(", ");
        cellTr.textContent = meanings;
    });
}

function showDetails(word) {
    document.getElementById('bookTableContainer').style.display = 'none';
    const entries = groupedDictionaryData[word];
    let html = '';
    
    entries.forEach(e => {
        html += `
            <div class="meaning-row" style="margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
                <p style="font-size: 1.4rem; color: var(--primary-color); font-weight: 800; margin: 0;">
                    ${e.translation}
                    <button onclick="navigator.clipboard.writeText('${e.translation}')" class="copy-btn-mini">📋</button>
                </p>
                ${e.extra ? `<p style="color: #64748b; font-size: 0.9rem; margin: 5px 0;"><em>${e.extra}</em></p>` : ''}
                ${e.explanation ? `<div class="explanation-box" style="background: rgba(0,0,0,0.03); padding: 12px; border-radius: 8px; border-left: 4px solid var(--primary-color); margin-top: 10px;">${e.explanation}</div>` : ''}
            </div>`;
    });
    
    document.getElementById('definitionText').innerHTML = html;
    document.getElementById('descriptionTitle').textContent = word;
    document.getElementById('descriptionArea').style.display = 'block';
}

// --- EVENT LISTENERS ---
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.oninput = (e) => filterData(e.target.value);
}

const backButton = document.getElementById('backButton');
if (backButton) {
    backButton.onclick = () => {
        document.getElementById('descriptionArea').style.display = 'none';
        renderTable(lastFilterResults);
    };
}

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.onclick = () => document.body.classList.toggle('dark-theme');
}

// Start the app
init();
