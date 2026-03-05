const CONFIG = {
    // UPDATED: Points directly to your GitHub data
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
        // Fetch using the GitHub Raw URL with a timestamp to prevent caching
        const response = await fetch(CONFIG.db + '?t=' + new Date().getTime());
        
        if (!response.ok) throw new Error("GitHub file not accessible");

        const data = await response.json();
        
        // Map the specific JSON keys from your 'Book2' conversion
        dictionaryData = data.map(item => ({
            english: item["English Word"] || item.english,
            translation: item["Bodo Meaning"] || item.translation,
            explanation: item["Explanation"] || item.explanation,
            extra: item["Transliteration"] || item.extra
        }));

        // Grouping logic for words with multiple meanings
        groupedDictionaryData = {};
        dictionaryData.forEach(item => {
            const key = item.english;
            if (!groupedDictionaryData[key]) groupedDictionaryData[key] = [];
            groupedDictionaryData[key].push(item);
        });

        status.textContent = `✅ Loaded ${dictionaryData.length} Bodo words!`;
    } catch (e) {
        status.textContent = "⚠️ Sync Error. Check your internet or GitHub link.";
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
    // Hide search results to show full meaning card
    document.getElementById('bookTableContainer').style.display = 'none';
    const entries = groupedDictionaryData[word];
    let html = '';
    
    entries.forEach(e => {
        html += `
            <div class="meaning-row" style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <p style="font-size: 1.4rem; color: #2563eb; font-weight: 800; margin: 0;">
                    ${e.translation}
                    <button onclick="navigator.clipboard.writeText('${e.translation}')" style="cursor:pointer; background:none; border:none;">📋</button>
                </p>
                ${e.extra ? `<p style="color: #64748b; font-size: 0.9rem; margin: 5px 0;"><em>${e.extra}</em></p>` : ''}
                ${e.explanation ? `<div style="background: #f1f5f9; padding: 10px; border-radius: 8px; border-left: 4px solid #2563eb; margin-top: 10px;">${e.explanation}</div>` : ''}
            </div>`;
    });
    
    document.getElementById('definitionText').innerHTML = html;
    document.getElementById('descriptionTitle').textContent = word;
    document.getElementById('descriptionArea').style.display = 'block';
}

// --- EVENT LISTENERS ---
document.getElementById('searchInput').oninput = (e) => filterData(e.target.value);
document.getElementById('backButton').onclick = () => {
    document.getElementById('descriptionArea').style.display = 'none';
    renderTable(lastFilterResults);
};

// Start the app
init();
