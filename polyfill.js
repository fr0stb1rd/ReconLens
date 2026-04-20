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
 * ReconLens — Global i18n Override
 * Allows manual language selection by fetching locale files manually.
 */
window.reconI18n = {
    _data: null,
    _lang: 'auto',

    /** Load manual language setting and fetch data if needed. */
    async init() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['user_language'], async (settings) => {
                this._lang = settings.user_language || 'auto';
                if (this._lang !== 'auto') {
                    try {
                        const url = chrome.runtime.getURL(`_locales/${this._lang}/messages.json`);
                        const res = await fetch(url);
                        this._data = await res.json();
                    } catch (e) {
                        console.error("Manual i18n load failed:", e);
                    }
                }
                resolve();
            });
        });
    },

    /** Mimics chrome.i18n.getMessage but checks manual override first. */
    getMessage(key, subs) {
        if (this._data && this._data[key]) {
            let msg = this._data[key].message;
            // Basic placeholder support ($DONE$, $TOTAL$, or $1, $2...)
            if (subs) {
                const subArray = Array.isArray(subs) ? subs : [subs];
                subArray.forEach((val, idx) => {
                    // Try numeric $1, $2
                    msg = msg.replace(new RegExp(`\\$${idx + 1}`, 'g'), val);
                });
                // Handle named placeholders specifically used in ReconLens messages.json ($DONE$, $TOTAL$)
                // This is a bit manual but ensures compatibility with the existing schema.
                if (key.includes('status')) {
                    msg = msg.replace('$DONE$', subArray[0] || '');
                    msg = msg.replace('$TOTAL$', subArray[1] || '');
                }
            }
            return msg;
        }
        return chrome.i18n.getMessage(key, subs);
    }
};
