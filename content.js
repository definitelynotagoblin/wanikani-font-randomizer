// List of fonts to randomly choose from
const fonts = [
    // Existing fonts
    'Noto Sans JP',
    'Meiryo',
    'MS PGothic',
    'Hiragino Kaku Gothic Pro',

    // Additional Google Fonts (Japanese)
    'TakaoExGothic',
    'IPAPGothic',
    'Sazanami Gothic',
    'Yuji Syuku',
    'Zen Maru Gothic',
    'Kaisei Decol',
    'Klee One',
    'Shippori Mincho',
    'Yuji Mai',
    'Zen Kurenaido',
    'Reggae One',
    'Stick',
    'DotGothic16',
    'Hachi Maru Pop',
    'RocknRoll One',
    'New Tegomin',
    'M PLUS 1p',
    'M PLUS Rounded 1c',
    'Sawarabi Mincho',
    'Sawarabi Gothic',
    'Kosugi Maru',
    'Kosugi',
    'Noto Serif JP',
    'BIZ UDPGothic',
    'BIZ UDPMincho',
    'Shippori Antique',
    'Potta One',
    'Dela Gothic One',
    'Rampart One',
    'Yomogi',
    'Kaisei Opti',
    'Kaisei Tokumin',
    'Zen Old Mincho',
    'Zen Antique',
    'Murecho',
    'Yusei Magic'
];

let isEnabled = false;
let selectedFont;

// Function to load a single Google Font
function loadGoogleFont(font) {
    if (['Noto Sans JP', 'Meiryo', 'MS PGothic', 'Hiragino Kaku Gothic Pro'].includes(font)) {
        return Promise.resolve(); // These fonts don't need to be loaded from Google Fonts
    }
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}&display=swap`;
        link.rel = 'stylesheet';
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
    });
}

function getFont() {
    if (!selectedFont) {
        selectedFont = fonts[Math.floor(Math.random() * fonts.length)];
    }

    return loadGoogleFont(selectedFont)
        .then(() => selectedFont)
        .catch(() => {
            console.error(`Failed to load font: ${selectedFont}`);
            selectedFont = null;
            return selectedFont; // Fallback to default font
        });
}

// Modify the changeJapaneseFonts function
function changeJapaneseFonts() {
    const elements = document.querySelectorAll('.character-header__characters');
    if (!isEnabled) {
        elements.forEach(element => {
            element.style.fontFamily = '';
        });
        return;
    }

    getFont().then(font => {
        elements.forEach(element => {
            element.style.fontFamily = font;
        });
    });
}

// New function to retry changing Japanese fonts
function retryChangeJapaneseFonts(retryCount = 0) {
    const elements = document.querySelectorAll('.character-header__characters');
    if (elements.length > 0) {
        changeJapaneseFonts();
    } else if (retryCount < 6) { // Limit retries to avoid infinite loop
        setTimeout(() => retryChangeJapaneseFonts(retryCount + 1), 50 * Math.pow(2, retryCount));
    }
}

function updateIsEnabled(settings) {
    const enabledGlobal = settings.enabledGlobal;
    if (!enabledGlobal) {
        isEnabled = false;
        return;
    }
    const currentUrl = window.location.href;
    if (currentUrl.endsWith('/quiz')) {
        isEnabled = settings.enabledQuiz;
    } else if (currentUrl.endsWith('/review')) {
        isEnabled = settings.enabledReview;
    } else if (currentUrl.includes('/extra_study')) {
        isEnabled = settings.enabledExtraStudy;
    } else {
        isEnabled = false;
    }
}

function loadSettings() {
    return new Promise((resolve) => {
        browser.storage.local.get(['enabledGlobal', 'enabledQuiz', 'enabledReview', 'enabledExtraStudy'], function(result) {
            const defaultSettings = {
                enabledGlobal: true,
                enabledQuiz: true,
                enabledReview: true,
                enabledExtraStudy: true
            };
            const mergedSettings = {...defaultSettings, ...result};
            updateIsEnabled(mergedSettings);
            resolve();
        });
    });
}

function shuffleFont() {
    if (isEnabled) {
        // Reset the font index to force a new random selection
        selectedFont = null;
        retryChangeJapaneseFonts();
    }
}

function setupObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const currentUrl = window.location.href;
                if (currentUrl.endsWith('/quiz') || currentUrl.endsWith('/review') || currentUrl.includes('/extra_study')) {
                    loadSettings().then(() => {
                        retryChangeJapaneseFonts();
                    });
                } else {
                    selectedFont = null;
                }
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function initExtension() {
    loadSettings().then(() => {
        retryChangeJapaneseFonts();
        setupObserver();
    });
}

// Listen for messages from the popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateSettings") {
        loadSettings().then(() => {
            retryChangeJapaneseFonts();
        });
    } else if (request.action === "shuffleFont") {
        shuffleFont();
    }
});

// Call initExtension when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExtension);
} else {
    initExtension();
}
