/**
 * ReconLens Polyfill
 * Provides a consistent 'browser' object and bridges some MV3 differences.
 */

// @Author  : fr0stb1rd & residuallaugh & M1r0ku
// @license : GPL-3.0
// @source : https://github.com/fr0stb1rd/ReconLens

if (typeof browser === "undefined") {
    globalThis.browser = chrome;
}

/**
 * ReconLens — Global i18n Engine
 * Handles multi-language loading and fallback mechanisms.
 */
window.reconI18n = {
    locales: {},
    currentLang: 'en',
    async init() {
        const settings = await new Promise(r => chrome.storage.local.get(['user_language'], r));
        const uiLang = chrome.i18n.getUILanguage().replace('-', '_');
        this.currentLang = settings.user_language || uiLang || 'en';
        
        // Canonicalize language codes
        if (this.currentLang.startsWith('zh')) this.currentLang = 'zh_CN';
        if (this.currentLang.startsWith('tr')) this.currentLang = 'tr';
        if (this.currentLang.startsWith('ar')) this.currentLang = 'ar';
        
        const languages = ['en', 'zh_CN', 'tr', 'ar'];
        const promises = languages.map(lang =>
            fetch(chrome.runtime.getURL(`_locales/${lang}/messages.json`))
                .then(res => res.json())
                .then(data => this.locales[lang] = data)
                .catch(err => console.error(`Failed to load ${lang}:`, err))
        );
        return Promise.all(promises);
    },
    getMessage(key, subs) {
        let entry = (this.locales[this.currentLang] && this.locales[this.currentLang][key]) 
                  ? this.locales[this.currentLang][key] 
                  : (this.locales['en'] && this.locales['en'][key])
                    ? this.locales['en'][key]
                    : null;
        
        if (!entry) return chrome.i18n.getMessage(key, subs) || key;
        let msg = entry.message;
        
        if (subs) {
            const subArray = Array.isArray(subs) ? subs : [subs];
            subArray.forEach((s, i) => {
                // Handle $1, $2...
                msg = msg.replace(new RegExp(`\\$${i + 1}`, 'g'), s);
            });
            // Legacy support for $DONE$ and $TOTAL$ placeholders
            if (key.includes('status')) {
                msg = msg.replace('$DONE$', subArray[0] || '');
                msg = msg.replace('$TOTAL$', subArray[1] || '');
            }
        }
        return msg;
    }
};
