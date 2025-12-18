document.addEventListener('DOMContentLoaded', () => {
    const LANG_KEY = 'selected_language';
    let currentLang = localStorage.getItem(LANG_KEY) || 'es';

    function updateContent() {
        // Update all elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            let content = translations[currentLang][key];

            if (content) {
                // Handle placeholders like {brand}
                const brand = el.getAttribute('data-brand') || '';
                content = content.replace('{brand}', brand);

                // Keep icon if it's a back link
                if (el.classList.contains('back-link')) {
                    el.innerHTML = content;
                } else {
                    el.textContent = content;
                }
            }
        });

        // Update document title if data-i18n-title is present
        const titleEl = document.querySelector('title[data-i18n]');
        if (titleEl) {
            const key = titleEl.getAttribute('data-i18n');
            if (translations[currentLang][key]) {
                document.title = translations[currentLang][key];
            }
        }

        // Update button text for add to cart if exists
        const addToCartBtn = document.getElementById('add-to-cart');
        if (addToCartBtn && typeof updateDisplay === 'function') {
            updateDisplay(); // Trigger the page-specific update
        }

        // Update toggle UI
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });
    }

    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem(LANG_KEY, lang);
        updateContent();
        document.documentElement.lang = lang;
    }

    // Inject toggle UI
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'language-toggle';
    toggleContainer.innerHTML = `
        <button class="lang-btn ${currentLang === 'es' ? 'active' : ''}" data-lang="es">ES</button>
        <span class="lang-divider">|</span>
        <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
    `;
    document.body.appendChild(toggleContainer);

    toggleContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('lang-btn')) {
            setLanguage(e.target.getAttribute('data-lang'));
        }
    });

    // Initial update
    updateContent();
    document.documentElement.lang = currentLang;
});

// Helper for dynamic strings in scripts
function t(key, replacements = {}) {
    const LANG_KEY = 'selected_language';
    const currentLang = localStorage.getItem(LANG_KEY) || 'es';
    let content = translations[currentLang][key] || key;

    for (const [k, v] of Object.entries(replacements)) {
        content = content.replace(`{${k}}`, v);
    }
    return content;
}
