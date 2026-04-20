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

    document.querySelectorAll('.btn-copy-current').forEach(el => {
        el.textContent = t('popup_btn_copy_current');
    });
    document.querySelectorAll('.btn-copy-url-resolved').forEach(el => {
        el.textContent = t('popup_btn_copy_url_resolved');
    });

    // Clear Cache message
    const clearBtn = document.getElementById('btn_clear_cache');
    if (clearBtn) {
        clearBtn.onclick = function () {
            chrome.storage.local.remove(key, () => {
                lastResultData = {};
                show_info({}, "");
                alert(t('setting_msg_clear_done'));
            });
        };
    }
}

var key = ["ip", "ip_port", "domain", "path", "incomplete_path", "url", "static", "id_card", "mobile", "email", "jwt", "algorithm", "sensitive"];
let lastResultData = null; // Store latest results for search filtering

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

async function show_info(result_data, filter = "") {
    lastResultData = result_data; // Cache for search
    const lowerFilter = filter.toLowerCase();
    const tab = await getCurrentTab();
    const baseUrl = tab ? new URL(tab.url).origin : '';
    const currentFullUrl = tab ? tab.url : '';

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
                    
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'data-item';

                    let a = document.createElement('a');
                    a.target = '_blank';
                    a.textContent = itemText;

                    let cleanText = itemText.trim();
                    let targetUrl = itemText;
                    
                    if (cleanText.startsWith('http')) {
                        targetUrl = cleanText;
                    } else if (cleanText.startsWith('//')) {
                        targetUrl = 'https:' + cleanText;
                    } else if (cleanText.startsWith('/')) {
                        try {
                            targetUrl = new URL(cleanText, currentFullUrl).href;
                        } catch (e) {
                            targetUrl = baseUrl + cleanText;
                        }
                    } else if (cleanText.includes('.')) {
                        if (!cleanText.includes('/') || cleanText.indexOf('.') < cleanText.indexOf('/')) {
                            targetUrl = 'https://' + (cleanText.startsWith('.') ? cleanText.substring(1) : cleanText);
                        } else {
                            try {
                                targetUrl = new URL(cleanText, currentFullUrl).href;
                            } catch (e) {
                                targetUrl = baseUrl + '/' + cleanText;
                            }
                        }
                    }
                    a.href = targetUrl;
                    
                    // Add Copy Button
                    const copyBtn = document.createElement('button');
                    copyBtn.className = 'item-copy-btn';
                    copyBtn.title = 'Copy to clipboard';
                    copyBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>`;
                    
                    copyBtn.onclick = (e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(itemText).then(() => {
                            const originalSvg = copyBtn.innerHTML;
                            // Success state using --accent-active color: #8600c4
                            copyBtn.style.color = '#8600c4';
                            copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                            setTimeout(() => { 
                                copyBtn.innerHTML = originalSvg;
                                copyBtn.style.color = ''; 
                            }, 1000);
                        });
                    };

                    itemDiv.appendChild(copyBtn);

                    // Add Quick Lookups for IP and Domain (Before the link)
                    if (currentKey === 'ip' || currentKey === 'ip_port' || currentKey === 'domain') {
                        const lookupWrapper = document.createElement('div');
                        lookupWrapper.className = 'lookup-wrapper';
                        
                        const rawValue = itemText.split(':')[0].replace(/^https?:\/\//, '').replace(/\/+$/, '');
                        
                        if (currentKey.startsWith('ip')) {
                            // Shodan (Radar Icon)
                            const shodan = document.createElement('a');
                            shodan.className = 'lookup-btn';
                            shodan.href = `https://www.shodan.io/host/${rawValue}`;
                            shodan.target = '_blank';
                            shodan.title = 'Lookup on Shodan';
                            shodan.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`;
                            lookupWrapper.appendChild(shodan);
                            
                            // VirusTotal IP (Shield Icon)
                            const vt = document.createElement('a');
                            vt.className = 'lookup-btn';
                            vt.href = `https://www.virustotal.com/gui/ip-address/${rawValue}`;
                            vt.target = '_blank';
                            vt.title = 'Lookup on VirusTotal';
                            vt.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
                            lookupWrapper.appendChild(vt);
                        } else {
                            // VirusTotal Domain (Shield Icon)
                            const vt = document.createElement('a');
                            vt.className = 'lookup-btn';
                            vt.href = `https://www.virustotal.com/gui/domain/${rawValue}`;
                            vt.target = '_blank';
                            vt.title = 'Lookup on VirusTotal';
                            vt.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
                            lookupWrapper.appendChild(vt);
                            
                            // SecurityTrails (Activity Icon)
                            const st = document.createElement('a');
                            st.className = 'lookup-btn';
                            st.href = `https://securitytrails.com/domain/${rawValue}`;
                            st.target = '_blank';
                            st.title = 'Lookup on SecurityTrails';
                            st.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`;
                            lookupWrapper.appendChild(st);
                        }
                        itemDiv.appendChild(lookupWrapper);
                    }

                    itemDiv.appendChild(a);

                    fragment.appendChild(itemDiv);
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

    // Shared formatting engine
    const formatResults = (data, categories, format, targetUrl = "") => {
        let val = "";
        const repoUrl = "https://github.com/fr0stb1rd/ReconLens";
        const scanDate = new Date().toLocaleString();
        const signatureText = `Generated by ReconLens (${repoUrl})`;
        const contextText = `Target: ${targetUrl || 'Unknown'} — Scanned at: ${scanDate}`;

        if (format === 'md') {
            val = `> [!NOTE]\n> **${signatureText}**\n> ${contextText}\n\n# ReconLens Results\n\n`;
            categories.forEach(cat => {
                if (data[cat]?.length) {
                    val += `## ${t('popup_title_' + cat) || cat}\n`;
                    data[cat].forEach(item => val += `- ${item}\n`);
                    val += "\n";
                }
            });
        } else if (format === 'xml') {
            val = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- ${signatureText} -->\n<!-- ${contextText} -->\n<recon_results target="${targetUrl}">\n`;
            categories.forEach(cat => {
                if (data[cat]?.length) {
                    val += `  <category name="${t('popup_title_' + cat) || cat}">\n`;
                    data[cat].forEach(item => val += `    <item>${item}</item>\n`);
                    val += `  </category>\n`;
                }
            });
            val += '</recon_results>';
        } else if (format === 'html') {
            val = `<!-- ${signatureText} -->\n<!-- ${contextText} -->\n<div class="recon-results">\n  <h1>${contextText}</h1>\n`;
            categories.forEach(cat => {
                if (data[cat]?.length) {
                    val += `  <h2>${t('popup_title_' + cat) || cat}</h2>\n  <ul>\n`;
                    data[cat].forEach(item => val += `    <li>${item}</li>\n`);
                    val += `  </ul>\n`;
                }
            });
            val += '</div>';
        } else {
            val = `${signatureText}\n${contextText}\n${"=".repeat(contextText.length)}\n\n`;
            categories.forEach(cat => {
                if (data[cat]?.length) {
                    val += `${t('popup_title_' + cat) || cat}:\n`;
                    data[cat].forEach(item => val += `${item}\n`);
                    val += "\n";
                }
            });
        }
        return val.trim();
    };

    const setupSplitButton = (mainId, toggleId, menuId, copyFn) => {
        const mainBtn = document.getElementById(mainId);
        const toggleBtn = document.getElementById(toggleId);
        const menu = document.getElementById(menuId);
        if (!mainBtn || !toggleBtn || !menu) return;

        toggleBtn.onclick = (e) => { e.stopPropagation(); menu.classList.toggle('show'); };
        mainBtn.onclick = () => copyFn('text');
        menu.querySelectorAll('button').forEach(btn => {
            btn.onclick = () => copyFn(btn.dataset.format);
        });
    };

    const setupSplitButtonsByClass = (wrapperClass, mainClass, toggleClass, menuClass, copyFn) => {
        document.querySelectorAll('.' + wrapperClass).forEach(wrapper => {
            const mainBtn = wrapper.querySelector('.' + mainClass);
            const toggleBtn = wrapper.querySelector('.' + toggleClass);
            const menu = wrapper.querySelector('.' + menuClass);
            if (!mainBtn || !toggleBtn || !menu) return;

            toggleBtn.onclick = (e) => {
                e.stopPropagation();
                // Close other menus first
                document.querySelectorAll('.ai-menu').forEach(m => { if (m !== menu) m.classList.remove('show'); });
                menu.classList.toggle('show');
            };
            mainBtn.onclick = () => copyFn('text', mainBtn, menu);
            menu.querySelectorAll('button').forEach(btn => {
                btn.onclick = () => copyFn(btn.dataset.format, mainBtn, menu);
            });
        });
    };

    // Copy handlers
    const copyAll = (format, btn, menu) => {
        const val = formatResults(lastResultData, key, format);
        if (val) {
            navigator.clipboard.writeText(val);
            provideFeedback(btn || document.getElementById('btn_copy_ai'), "popup_tip_copied");
        }
        (menu || document.getElementById('ai_menu')).classList.remove('show');
    };

    const copyCurrent = (format, btn, menu) => {
        const activeLink = document.querySelector('.category-item a.active');
        if (!activeLink || !lastResultData) return;
        const cat = activeLink.dataset.category;
        const val = formatResults(lastResultData, [cat], format);
        if (val) {
            navigator.clipboard.writeText(val);
            provideFeedback(btn, "popup_tip_copied");
        }
        menu.classList.remove('show');
    };

    const copyUrlResolved = async (format, btn, menu) => {
        const activeLink = document.querySelector('.category-item a.active');
        if (!activeLink || !lastResultData) return;
        const cat = activeLink.dataset.category;
        const items = lastResultData[cat] || [];

        const tab = await getCurrentTab();
        if (!tab) return;

        const resolvedItems = items.map(item => {
            try {
                return new URL(item.trim(), tab.url).href;
            } catch (e) {
                return item;
            }
        });

        const resolvedData = { [cat]: resolvedItems };
        const val = formatResults(resolvedData, [cat], format);
        if (val) {
            navigator.clipboard.writeText(val);
            provideFeedback(btn, "popup_tip_copied");
        }
        menu.classList.remove('show');
    };

    setupSplitButton('btn_copy_ai', 'ai_dropdown_toggle', 'ai_menu', copyAll);
    setupSplitButtonsByClass('current-copy-wrapper', 'btn-copy-current', 'current-dropdown-toggle', 'current-menu', copyCurrent);
    setupSplitButtonsByClass('url-resolved-copy-wrapper', 'btn-copy-url-resolved', 'url-resolved-dropdown-toggle', 'url-resolved-menu', copyUrlResolved);

    window.addEventListener('click', () => {
        document.querySelectorAll('.ai-menu').forEach(m => m.classList.remove('show'));
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
                url: document.getElementById('webhook_url').value,
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
        document.getElementById('webhook_url').value = '';
        document.getElementById('arg').value = '';
        document.getElementById('headers').value = '{}';
        chrome.storage.local.set({ webhook_setting }, () => {
            provideFeedback(resetBtn);
        });
    };

    chrome.storage.local.get(['webhook_setting'], function (settings) {
        if (!settings || !settings.webhook_setting) return;
        const ws = settings.webhook_setting;
        document.getElementById('webhook_url').value = ws.url || '';
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
