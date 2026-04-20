// @Author  : fr0stb1rd & residuallaugh & M1r0ku
// @license : GPL-3.0
// @source : https://github.com/fr0stb1rd/ReconLens

// ── i18n Utilities ────────────────────────────────────────────────────────────

/** Translate a key with optional placeholder args. */
const t = (key, ...subs) => reconI18n.getMessage(key, subs.length ? subs : undefined);

/** Set element textContent via i18n key (element ID decoupled from key). */
const setI18n = (elementId, key, ...subs) => {
    const el = document.getElementById(elementId);
    if (el) el.textContent = t(key, ...subs);
};

// ── Localization Init ─────────────────────────────────────────────────────────

function init_locales() {
    // Map: HTML element ID → i18n key  (element ID no longer equals i18n key)
    const labelMap = {
        // Sidebar nav
        'nav_settings': 'nav_settings',
        'nav_about': 'nav_about',
        // Settings labels
        'settings_header': 'setting_page_header',
        'lbl_clear_cache': 'setting_lbl_clear_cache',
        'btn_clear_cache': 'setting_btn_clear',
        'lbl_float_window': 'setting_lbl_float_window',
        'lbl_auto_timeout': 'setting_lbl_auto_timeout',
        'lbl_webhook': 'setting_lbl_webhook',
        'lbl_webhook_url': 'setting_lbl_webhook_url',
        'lbl_webhook_method': 'setting_lbl_webhook_method',
        'lbl_webhook_params': 'setting_lbl_webhook_params',
        'lbl_webhook_headers': 'setting_lbl_webhook_headers',
        'lbl_allowlist': 'setting_lbl_allowlist',
        'lbl_safe_mode': 'setting_lbl_safe_mode',
        'lbl_language': 'setting_lbl_language',
        'opt_auto': 'setting_opt_auto',
        'lbl_theme': 'setting_lbl_theme',
        'opt_theme_auto': 'setting_opt_theme_auto',
        'opt_theme_light': 'setting_opt_theme_light',
        'opt_theme_dark': 'setting_opt_theme_dark',
        // Info-card titles (main content area)
        'popup_title_ip': 'popup_title_ip',
        'popup_title_ip_port': 'popup_title_ip_port',
        'popup_title_domain': 'popup_title_domain',
        'popup_title_id_card': 'popup_title_id_card',
        'popup_title_mobile': 'popup_title_mobile',
        'popup_title_email': 'popup_title_email',
        'popup_title_jwt': 'popup_title_jwt',
        'popup_title_algorithm': 'popup_title_algorithm',
        'popup_title_sensitive': 'popup_title_sensitive',
        'popup_title_path': 'popup_title_path',
        'popup_title_incomplete_path': 'popup_title_incomplete_path',
        'popup_title_url': 'popup_title_url',
        'popup_title_static': 'popup_title_static',
        'btn_copy_ai': 'popup_btn_copy_all',
        // Left sidebar category labels
        'popup_sidebar_path': 'popup_sidebar_path',
        'popup_sidebar_domain': 'popup_sidebar_domain',
        'popup_sidebar_url': 'popup_sidebar_url',
        'popup_sidebar_ip': 'popup_sidebar_ip',
        'popup_sidebar_ip_port': 'popup_sidebar_ip_port',
        'popup_sidebar_incomplete_path': 'popup_sidebar_incomplete_path',
        'popup_sidebar_static': 'popup_sidebar_static',
        'popup_sidebar_id_card': 'popup_sidebar_id_card',
        'popup_sidebar_mobile': 'popup_sidebar_mobile',
        'popup_sidebar_email': 'popup_sidebar_email',
        'popup_sidebar_jwt': 'popup_sidebar_jwt',
        'popup_sidebar_algorithm': 'popup_sidebar_algorithm',
        'popup_sidebar_sensitive': 'popup_sidebar_sensitive',
        // About Section
        'about_header': 'about_header',
        'about_lbl_description': 'about_lbl_description',
        'about_val_description': 'ext_description',
        'about_lbl_credits': 'about_lbl_credits',
        'about_lbl_links': 'about_lbl_links',
    };

    for (const [elemId, key] of Object.entries(labelMap)) {
        setI18n(elemId, key);
    }

    // Class-based elements (multiple reset/save buttons)
    document.querySelectorAll('.js-btn-reset-save').forEach(el => {
        el.textContent = t('setting_btn_reset_save');
    });
    document.querySelectorAll('.js-btn-save').forEach(el => {
        el.textContent = t('setting_btn_save');
    });

    // Clear Cache message
    const clearBtn = document.getElementById('btn_clear_cache');
    if (clearBtn) {
        clearBtn.onclick = function () {
            chrome.storage.local.clear();
            alert(t('setting_msg_clear_done'));
        };
    }
}

// Removed premature init_locales() call


var key = ["ip", "ip_port", "domain", "path", "incomplete_path", "url", "static", "id_card", "mobile", "email", "jwt", "algorithm", "sensitive"];
let lastResultData = null; // Store latest results for search filtering

function init_copy() {
    var elements = document.getElementsByClassName("copy-button");
    if (elements) {
        for (var i = 0, len = elements.length | 0; i < len; i = i + 1 | 0) {
            elements[i].textContent = t("popup_btn_copy");
            let ele_name = elements[i].name;
            let ele_id = elements[i].id;
            if (ele_id == "popup_btn_copy_url") {
                elements[i].textContent = t("popup_btn_copy_url");
            }
            elements[i].onclick = async function (e) {
                if (e) e.preventDefault();
                const btn = this;
                const originalText = btn.textContent;
                
                let copytext = document.getElementById(ele_name).textContent;
                if (copytext === 'No data' || copytext === '-') return;

                if (ele_id == "popup_btn_copy_url") {
                    const tab = await getCurrentTab();
                    if (!tab) {
                        alert(t("popup_tip_copy_first"));
                        return;
                    }
                    const url = new URL(tab.url);
                    const path_list = copytext.split('\n').filter(line => line.trim() !== 'No data' && line.trim() !== '' && line.trim() !== '-');
                    copytext = "";
                    for (let item of path_list) {
                        item = item.trim();
                        if (!item) continue;
                        try {
                            const resolvedUrl = new URL(item, tab.url);
                            copytext += resolvedUrl.href + '\n';
                        } catch (e) {
                            if (item.startsWith('/')) {
                                copytext += url.origin + item + '\n';
                            } else {
                                const basePath = url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1) || '/';
                                copytext += url.origin + basePath + item + '\n';
                            }
                        }
                    }
                    copytext = copytext.trim();
                }

                if (copytext) {
                    try {
                        await navigator.clipboard.writeText(copytext);
                        // Visual Feedback
                        btn.textContent = t("popup_tip_copied") || "Copied!";
                        btn.classList.add('copy-success');
                        setTimeout(() => {
                            btn.textContent = originalText;
                            btn.classList.remove('copy-success');
                        }, 1000);
                    } catch (err) {
                        console.error('Copy failed:', err);
                    }
                }
            }
        }
    }
}


/** Provide visual feedback on a button after an action. */
function provideFeedback(btn, feedbackTextKey = "popup_tip_saved") {
    const originalText = btn.textContent;
    btn.textContent = t(feedbackTextKey) || "Done!";
    btn.classList.add('copy-success');
    setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('copy-success');
    }, 1000);
}

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

function show_info(result_data, filter = "") {
    lastResultData = result_data; // Cache for search
    const lowerFilter = filter.toLowerCase();

    for (var k in key) {
        let currentKey = key[k];
        let container = document.getElementById(currentKey);
        if (!container) continue;

        // Optimized clear: Much faster than while loop
        container.textContent = '';
        
        if (result_data && result_data[currentKey] && result_data[currentKey].length > 0) {
            let filteredItems = result_data[currentKey];
            if (lowerFilter) {
                filteredItems = filteredItems.filter(item => item.toLowerCase().includes(lowerFilter));
            }

            if (filteredItems.length > 0) {
                container.classList.remove('no-data');
                // Use DocumentFragment to batch DOM updates (avoids multiple reflows)
                const fragment = document.createDocumentFragment();
                
                for (var i in filteredItems) {
                    let itemText = filteredItems[i];
                    let source = result_data['source'] ? result_data['source'][itemText] : null;
                    
                    if (source) {
                        let a = document.createElement('a');
                        a.href = source;
                        a.target = '_blank';
                        a.textContent = itemText;
                        fragment.appendChild(a);
                    } else {
                        let span = document.createElement('span');
                        span.textContent = itemText;
                        fragment.appendChild(span);
                    }
                }
                container.appendChild(fragment);
            } else {
                container.textContent = t('popup_category_empty') || 'No matches found';
                container.classList.add('no-data');
            }
        } else {
            const emptyText = t('popup_category_empty');
            container.textContent = (emptyText && emptyText !== '') ? emptyText : 'No data found';
            container.classList.add('no-data');
        }
    }
}

function handleCategoryClick(event) {
    event.preventDefault(); // Prevent default link behavior

    // Remove active class from all category items
    document.querySelectorAll('.category-item a').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to the clicked item
    event.currentTarget.classList.add('active');

    const selectedCategory = event.currentTarget.dataset.category;
    const infoCardsContainer = document.getElementById('info-cards-container');
    const statusBar = document.getElementById('status-bar-wrapper');
    const searchWrapper = document.getElementById('search-wrapper');

    // Hide status bar and search if on settings/about tab
    const isSpecialTab = (selectedCategory === 'settings' || selectedCategory === 'about');
    if (statusBar) statusBar.style.display = isSpecialTab ? 'none' : 'flex';
    if (searchWrapper) searchWrapper.style.display = isSpecialTab ? 'none' : 'block';

    // Clear search when switching categories
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    if (lastResultData) show_info(lastResultData, "");

    // Show selected category card, hide others
    document.querySelectorAll('.info-card').forEach(card => {
        if (card.id === `card-${selectedCategory}`) {
            card.style.display = 'flex'; // Changed from 'block' to 'flex'
        } else {
            card.style.display = 'none';
        }
    });
}

function init_category_navigation() {
    const categoryLinks = document.querySelectorAll('.category-item a');
    categoryLinks.forEach(link => {
        link.addEventListener('click', handleCategoryClick);
    });

    // Check for category in URL (tab-like navigation from settings)
    const urlParams = new URLSearchParams(window.location.search);
    const targetCategory = urlParams.get('category') || 'path';

    const initialCategoryLink = document.querySelector(`.category-item a[data-category="${targetCategory}"]`);
    if (initialCategoryLink) {
        initialCategoryLink.classList.add('active');
        const selectedCategory = initialCategoryLink.dataset.category;

        const isSpecialTab = (selectedCategory === 'settings' || selectedCategory === 'about');
        const statusBar = document.getElementById('status-bar-wrapper');
        const searchWrapper = document.getElementById('search-wrapper');
        
        if (statusBar) statusBar.style.display = isSpecialTab ? 'none' : 'flex';
        if (searchWrapper) searchWrapper.style.display = isSpecialTab ? 'none' : 'block';

        document.querySelectorAll('.info-card').forEach(card => {
            if (card.id === `card-${selectedCategory}`) {
                card.style.display = 'flex'; // Changed from 'block' to 'flex'
            } else {
                card.style.display = 'none';
            }
        });
    }
}

function init_search_logic() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (lastResultData) {
                show_info(lastResultData, e.target.value);
            }
        });
    }
}

reconI18n.init().then(() => {
    init_locales();
    init_copy();
    init_category_navigation();
    init_search_logic(); // Initialize Search
    init_ai_copy_logic(); // Initialize AI Copy
    init_settings_logic(); // Initialize merged settings logic
    init_theme_engine();    // Initialize Theme Engine
    
    // Set version dynamically from manifest for all version labels
    document.querySelectorAll('.ext-version-display').forEach(el => {
        el.textContent = chrome.runtime.getManifest().version;
    });
    
    start_monitoring();
});

// ── Merged Settings Logic ───────────────────────────────────────────────────

function init_settings_logic() {
    init_language_selector();
    init_theme_selector(); // Theme selector handler
    loadToggleStates();
    init_toggle_handlers();
    init_webhook_logic();
    init_allowlist_logic();
}

function init_ai_copy_logic() {
    const mainBtn = document.getElementById('btn_copy_ai');
    const toggleBtn = document.getElementById('ai_dropdown_toggle');
    const menu = document.getElementById('ai_menu');
    if (!mainBtn || !toggleBtn || !menu) return;

    let selectedFormat = 'md';

    // Toggle menu
    toggleBtn.onclick = (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    };

    // Close menu on outside click
    window.addEventListener('click', () => {
        menu.classList.remove('show');
    });

    // Copy action
    const doAiCopy = async (format) => {
        if (!lastResultData) return;

        let val = "";
        const data = lastResultData;
        const categories = key;

        if (format === 'md') {
            val = "# ReconLens Scan Results\n\n";
            for (const cat of categories) {
                if (data[cat] && data[cat].length) {
                    val += `## ${t('popup_title_' + cat) || cat}\n`;
                    data[cat].forEach(item => val += `- ${item}\n`);
                    val += "\n";
                }
            }
        } else if (format === 'xml') {
            val = '<?xml version="1.0" encoding="UTF-8"?>\n<recon_results>\n';
            for (const cat of categories) {
                if (data[cat] && data[cat].length) {
                    val += `  <category name="${t('popup_title_' + cat) || cat}">\n`;
                    data[cat].forEach(item => val += `    <item>${item}</item>\n`);
                    val += `  </category>\n`;
                }
            }
            val += '</recon_results>';
        } else if (format === 'html') {
            val = '<div class="recon-results">\n';
            for (const cat of categories) {
                if (data[cat] && data[cat].length) {
                    val += `  <h2>${t('popup_title_' + cat) || cat}</h2>\n  <ul>\n`;
                    data[cat].forEach(item => val += `    <li>${item}</li>\n`);
                    val += `  </ul>\n`;
                }
            }
            val += '</div>';
        } else {
            // Plain Text
            for (const cat of categories) {
                if (data[cat] && data[cat].length) {
                    val += `${t('popup_title_' + cat) || cat}:\n`;
                    data[cat].forEach(item => val += `${item}\n`);
                    val += "\n";
                }
            }
        }

        if (!val.trim()) return;

        try {
            await navigator.clipboard.writeText(val.trim());
            provideFeedback(mainBtn, "popup_tip_copied");
        } catch (err) {
            console.error('AI Copy failed:', err);
        }
        menu.classList.remove('show');
    };

    mainBtn.onclick = () => doAiCopy(selectedFormat);

    menu.querySelectorAll('button').forEach(btn => {
        btn.onclick = () => {
            selectedFormat = btn.dataset.format;
            doAiCopy(selectedFormat);
        };
    });
}

// ── Theme Engine ────────────────────────────────────────────────────────────

function applyTheme(theme) {
    const isDark = (theme === 'dark') ||
        (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function init_theme_engine() {
    chrome.storage.local.get(['user_theme'], (settings) => {
        const theme = settings.user_theme || 'auto';
        applyTheme(theme);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        chrome.storage.local.get(['user_theme'], (settings) => {
            if (!settings.user_theme || settings.user_theme === 'auto') {
                applyTheme('auto');
            }
        });
    });
}

function init_theme_selector() {
    const select = document.getElementById('user_theme');
    if (!select) return;
    chrome.storage.local.get(['user_theme'], (settings) => {
        if (settings.user_theme) select.value = settings.user_theme;
    });
    select.onchange = () => {
        const newTheme = select.value;
        chrome.storage.local.set({ user_theme: newTheme }, () => {
            applyTheme(newTheme);
        });
    };
}

function init_language_selector() {
    const select = document.getElementById('user_language');
    if (!select) return;
    chrome.storage.local.get(['user_language'], (settings) => {
        if (settings.user_language) select.value = settings.user_language;
    });
    select.onchange = () => {
        chrome.storage.local.set({ user_language: select.value }, () => {
            window.location.reload();
        });
    };
}

function renderToggleLabel(elementId, isOn) {
    const el = document.getElementById(elementId);
    if (el) {
        setI18n(elementId, isOn ? 'setting_btn_state_on' : 'setting_btn_state_off');
        if (isOn) {
            el.classList.add('state-on');
            el.classList.remove('state-off');
        } else {
            el.classList.add('state-off');
            el.classList.remove('state-on');
        }
    }
}

function makeToggleHandler(storageKey, elementId, defaultVal = false) {
    return function () {
        chrome.storage.local.get([storageKey], function (settings) {
            const currentVal = settings[storageKey] != null ? settings[storageKey] : defaultVal;
            const newVal = !currentVal;
            chrome.storage.local.set({ [storageKey]: newVal });
            renderToggleLabel(elementId, newVal);
        });
    };
}

function loadToggleStates() {
    const toggles = [
        { key: 'global_float', elemId: 'global_float', def: false },
        { key: 'fetch_timeout', elemId: 'fetch_timeout', def: false },
        { key: 'settingSafeMode', elemId: 'settingSafeMode', def: true },
    ];
    chrome.storage.local.get(toggles.map(t => t.key), function (settings) {
        for (const { key, elemId, def } of toggles) {
            let val = settings[key] != null ? settings[key] : def;
            renderToggleLabel(elemId, val);
        }
    });
}

function init_toggle_handlers() {
    document.getElementById('global_float').onclick = makeToggleHandler('global_float', 'global_float', false);
    document.getElementById('fetch_timeout').onclick = makeToggleHandler('fetch_timeout', 'fetch_timeout', false);
    document.getElementById('settingSafeMode').onclick = makeToggleHandler('settingSafeMode', 'settingSafeMode', true);
}

function init_webhook_logic() {
    const saveBtn = document.getElementById('save');
    const resetBtn = document.getElementById('reset');
    if (!saveBtn || !resetBtn) return;

    saveBtn.onclick = function () {
        try {
            const webhook_setting = {
                url: document.getElementById('url').value,
                method: document.getElementById('method').value,
                arg: document.getElementById('arg').value,
                headers: JSON.parse(document.getElementById('headers').value || '{}'),
            };
            chrome.storage.local.set({ webhook_setting }, () => {
                provideFeedback(saveBtn);
            });
        } catch (e) {
            console.error('Webhook save failed:', e);
            alert("Invalid JSON in headers");
        }
    };

    resetBtn.onclick = function () {
        const webhook_setting = { url: '', arg: '', headers: {} };
        document.getElementById('url').value = '';
        document.getElementById('arg').value = '';
        document.getElementById('headers').value = '{}';
        chrome.storage.local.set({ webhook_setting }, () => {
            provideFeedback(resetBtn);
        });
    };

    chrome.storage.local.get(['webhook_setting'], function (settings) {
        if (!settings || !settings.webhook_setting) return;
        const ws = settings.webhook_setting;
        document.getElementById('url').value = ws.url || '';
        document.getElementById('method').value = ws.method || 'POST';
        document.getElementById('arg').value = ws.arg || '';
        document.getElementById('headers').value = JSON.stringify(ws.headers || {});
    });
}

function init_allowlist_logic() {
    const saveBtn = document.getElementById('save_allowlist');
    const resetBtn = document.getElementById('reset_allowlist');
    const allowlistInput = document.getElementById('allowlist');
    if (!saveBtn || !resetBtn || !allowlistInput) return;

    saveBtn.onclick = function () {
        const snsArr = allowlistInput.value.split(/[\r\n]+/).map(s => s.trim()).filter(Boolean);
        chrome.storage.local.set({ allowlist: snsArr }, () => {
            provideFeedback(saveBtn);
        });
    };

    resetBtn.onclick = function () {
        allowlistInput.value = '';
        chrome.storage.local.set({ allowlist: [] }, () => {
            provideFeedback(resetBtn);
        });
    };

    chrome.storage.local.get(['allowlist'], function (data) {
        if (data && data.allowlist && data.allowlist.length) {
            allowlistInput.value = data.allowlist.join('\n');
        }
    });
}

function start_monitoring() {
    getCurrentTab().then(function get_info(tab) {
        if (!tab || !tab.url) {
            setI18n('taskstatus', 'popup_status_no_data');
            return;
        }
        chrome.storage.local.get(["findsomething_result_" + tab.url], function (result) {
            if (!result || !result["findsomething_result_" + tab.url]) {
                setI18n('taskstatus', 'popup_status_no_data');
                return;
            }
            const result_data = result["findsomething_result_" + tab.url];
            show_info(result_data);
            if (result_data.donetasklist) {
                const done = String(result_data.donetasklist.length);
                const total = String(result_data.tasklist.length);
                if (result_data['done'] !== 'done') {
                    setI18n('taskstatus', 'popup_status_scanning', done, total);
                } else {
                    setI18n('taskstatus', 'popup_status_complete', done, total);
                }
            } else {
                setI18n('taskstatus', 'popup_status_scanning', '0', '?');
            }
        });
    });

    chrome.storage.onChanged.addListener(function (changes, namespace) {
        getCurrentTab().then(function get_info(tab) {
            if (!tab || !tab.url) {
                return;
            }
            for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
                if (key == "findsomething_result_" + tab.url) {
                    const result_data = newValue;
                    show_info(result_data);
                    if (result_data.donetasklist) {
                        const done = String(result_data.donetasklist.length);
                        const total = String(result_data.tasklist.length);
                        if (result_data['done'] !== 'done') {
                            setI18n('taskstatus', 'popup_status_scanning', done, total);
                        } else {
                            setI18n('taskstatus', 'popup_status_complete', done, total);
                        }
                    } else {
                        setI18n('taskstatus', 'popup_status_scanning', '0', '?');
                    }
                }
            }
        });
    });
}
