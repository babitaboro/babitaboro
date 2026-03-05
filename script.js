const CONFIG = {
    // Relative path to your JSON file in the GitHub repo
    db: "bodo_dictionary.json"
};

let dictionaryData = [];
let groupedDictionaryData = {};
let lastFilterResults = [];

// --- INITIALIZATION ---
async function init() {
    const status = document.getElementById('statusMessage');
    status.textContent = "🔄 Loading Bodo Dictionary from GitHub...";

    try {
        // Fetch the local JSON file
        const response = await fetch(CONFIG.db);
        if (!response.ok) throw new Error("File not found");
        
        const data = await response.json();
        
        // Map the JSON keys to internal variables
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

        status.textContent = `✅ Loaded ${dictionaryData.length} words!`;
    } catch (e) {
        status.textContent = "⚠️ Load Error. Check if JSON file exists.";
        console.error("Fetch error:", e);
    }
}

// --- SEARCH & RENDER LOGIC ---
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
        row.insertCell().textContent = word;
        row.insertCell().textContent = groupedDictionaryData[word].map(i => i.translation).join(", ");
    });
}

function showDetails(word) {
    document.getElementById('bookTableContainer').style.display = 'none';
    const entries = groupedDictionaryData[word];
    let html = '';
    entries.forEach(e => {
        html += `
            <div class="detail-item">
                <p class="meaning-text">${e.translation} 
                    <button onclick="navigator.clipboard.writeText('${e.translation}')" class="copy-btn-mini">📋</button>
                </p>
                ${e.extra ? `<p class="extra-text"><em>${e.extra}</em></p>` : ''}
                ${e.explanation ? `<p class="explanation-box">${e.explanation}</p>` : ''}
            </div>`;
    });
    document.getElementById('definitionText').innerHTML = html;
    document.getElementById('descriptionTitle').textContent = word;
    document.getElementById('descriptionArea').style.display = 'block';
}

// --- LISTENERS ---
document.getElementById('searchInput').oninput = (e) => filterData(e.target.value);
document.getElementById('backButton').onclick = () => {
    document.getElementById('descriptionArea').style.display = 'none';
    renderTable(lastFilterResults);
};

init();
