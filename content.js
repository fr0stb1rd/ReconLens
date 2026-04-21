// @Author  : fr0stb1rd & residuallaugh & M1r0ku
// @license : GPL-3.0
// @source : https://github.com/fr0stb1rd/ReconLens

(function () {
    var protocol = window.location.protocol;
    var host = window.location.host;
    var domain_host = host.split(':')[0];
    var href = window.location.href;
    // var source = document.getElementsByTagName('html')[0].innerHTML;
    var source = document.documentElement.outerHTML;
    var settingSafeMode = true;
    init_source(source);

    // 获取页面中所有的 iframe 元素，执行同样的逻辑
    var iframes = document.querySelectorAll('iframe');
    iframes.forEach(function (iframe) {
        iframe.addEventListener('load', function () {
            var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            source = iframeDocument.documentElement.outerHTML
            // console.log(iframeDocument.documentElement.outerHTML);
            init_source(source);
        });
    });

    function init_source(source) {
        var hostPath;
        var urlPath;
        var urlWhiteList = ['.google.com', '.amazon.com', 'portswigger.net'];
        var target_list = [];
        // console.log(source)
        var source_href = source.match(/href=['"].*?['"]/g);
        var source_src = source.match(/src=['"].*?['"]/g);
        var script_src = source.match(/<script [^><]*?src=['"].*?['"]/g);
        chrome.storage.local.get(["settingSafeMode", "allowlist", "extension_enabled"], function (settings) {
            // Master Switch Check
            if (settings && settings["extension_enabled"] === false) {
                console.log('ReconLens: Global scanning is disabled via Master Switch.');
                return;
            }

            settingSafeMode = settings["settingSafeMode"] == false ? false : true;
            if (settings && settings['allowlist']) {
                urlWhiteList = settings['allowlist'];
            }
            for (var i = 0; i < urlWhiteList.length; i++) {
                if (host.endsWith(urlWhiteList[i]) || domain_host.endsWith(urlWhiteList[i])) {
                    console.log('ReconLens: Domain in allowlist, skipping scan.');
                    return;
                }
            }
            // target_list.push(window.location.href);

            // console.log(source_href,source_src,script_src)
            if (source_href) {
                for (var i = 0; i < source_href.length; i++) {
                    var u = deal_url(source_href[i].substring(6, source_href[i].length - 1));
                    if (u) {
                        target_list.push(u);
                    }
                }
            }
            if (source_src) {
                for (var i = 0; i < source_src.length; i++) {
                    var u = deal_url(source_src[i].substring(5, source_src[i].length - 1));
                    if (u) {
                        target_list.push(u);
                    }
                }
            }

            const tmp_target_list = [];
            for (var i = 0; i < target_list.length; i++) {
                if (tmp_target_list.indexOf(target_list[i]) === -1) {
                    tmp_target_list.push(target_list[i])
                }
            }
            tmp_target_list.pop(href)
            chrome.runtime.sendMessage({ greeting: "find", data: target_list, current: href, source: source });
        });

        function is_script(u) {
            if (script_src) {
                for (var i = 0; i < script_src.length; i++) {
                    if (script_src[i].indexOf(u) > 0) {
                        return true
                    }
                }
            }
            return false
        }
        function isJavaScriptFile(url) {
            try {
                // 使用URL构造函数解析URL
                const parsedUrl = new URL(url);

                // 获取URL的pathname部分
                const pathname = parsedUrl.pathname;

                // 检查pathname是否以.js结尾
                return pathname.endsWith('.js');
            } catch (error) {
                // 如果URL无效，则捕获错误
                return false;
            }
        }

        function deal_url(u) {
            let url;
            if (u.substring(0, 4) == "http") {
                url = u;
            }
            else if (u.substring(0, 2) == "//") {
                url = protocol + u;
            }
            else if (u.substring(0, 1) == '/') {
                url = protocol + '//' + host + u;
            }
            else if (u.substring(0, 2) == './') {
                if (href.indexOf('#') > 0) {
                    tmp_href = href.substring(0, href.indexOf('#'))
                } else {
                    tmp_href = href;
                }
                url = tmp_href.substring(0, tmp_href.lastIndexOf('/') + 1) + u;
            } else {
                // console.log("not match prefix:"+u+",like http // / ./")
                if (href.indexOf('#') > 0) {
                    tmp_href = href.substring(0, href.indexOf('#'))
                } else {
                    tmp_href = href;
                }
                url = tmp_href.substring(0, tmp_href.lastIndexOf('/') + 1) + u;
            }
            // console.log(settingSafeMode)
            if (settingSafeMode && !isJavaScriptFile(url) && !is_script(u)) {
                // console.log('非js:'+u);
                // if(u.indexOf('.js')>-1){
                //     console.log('有js关键字:'+u);
                // }
                return;
            }
            // console.log(url)
            return url;
        }
    }

})()


/*   全局悬浮窗样式   */

chrome.storage.local.get(["global_float"], function (settings) {
    if (settings["global_float"] != true) {
        return
    }

    const body = document.getElementsByTagName('html')[0];
    const div = document.createElement('div');
    const floatHtml = `
    <findsomething-div id="findsomething_neko" style="
        width:410px;
        max-height:500px;
        font-size:14px;
        color:#343a40; /* Darker text for readability */
        box-shadow: 0 8px 30px rgba(0,0,0,0.2); /* Deeper, softer shadow */
        background-color: #ffffff; /* Clean white background */
        border-radius: 12px; /* Nicer rounded corners */
        border: 1px solid #e0e0e0; /* Subtle light gray border */
        left:20px;
        top:20px;
        position: fixed;
        font-family: 'Roboto', sans-serif; /* Consistent font */
        padding-bottom: 10px; /* Add some padding at the bottom */
    ">
        <findsomething-div id="findsomething_neko-title" style="
            display: flex;
            justify-content: space-between;
            align-items: center; /* Vertically align items */
            padding: 10px 15px; /* Padding for the header */
            background-color: #f8f9fa; /* Light grey background for header */
            border-bottom: 1px solid #e9ecef; /* Subtle separator line */
            border-top-left-radius: 11px; /* Match main border-radius - 1px */
            border-top-right-radius: 11px; /* Match main border-radius - 1px */
            flex-shrink: 0; /* Prevent header from shrinking */
        ">
            <findsomething-div id="findsomething_taskstatus" style="
                height: 34px;
                line-height: 34px;
                margin-left: 0px; /* Remove redundant margin-left if padding handles it */
                font-weight: 500; /* Medium bold for status */
                color: #555; /* Softer color for status text */
                font-size: 15px;
            "></findsomething-div>
            <findsomething-div id="findsomething-hide-btn" style="
                margin-top: 0px; /* Adjust top margin for better alignment */
                margin-right: 0px; /* Adjust right margin for better alignment */
                font-size: 14px;
                color: #6c757d; /* Muted gray for elegance */
                padding: 5px 10px; /* Padding for click area */
                border-radius: 5px; /* Slightly rounded button */
                transition: background-color 0.2s ease, color 0.2s ease;
            "></findsomething-div>
        </findsomething-div>

        <findsomething-div style="
            width: auto; /* Let content fill available width */
            margin-top: 15px; /* More space from header */
            padding: 0 15px; /* Padding on sides for content */
            flex-grow: 1; /* Allow content area to grow */
            overflow-y: auto; /* Enable scroll if content is too long */
            box-sizing: border-box; /* Include padding in width */
        ">
            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title"><button class="findsomething_copy" name="path"></button></findsomething-div>
                <findsomething-p id="findsomething_path"></findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title"><button type="button" class="findsomething_copy" name="ip"></button></findsomething-div>
                <findsomething-p id="findsomething_ip"></findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title"><button class="findsomething_copy" name="ip_port"></button></findsomething-div>
                <findsomething-p id="findsomething_ip_port"></findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title"><button class="findsomething_copy" name="domain"></button></findsomething-div>
                <findsomething-p id="findsomething_domain"></findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title"><button class="findsomething_copy" name="id_card"></button></findsomething-div>
                <findsomething-p id="findsomething_id_card"></findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title"><button class="findsomething_copy" name="mobile"></button></findsomething-div>
                <findsomething-p id="findsomething_mobile"></findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title"><button class="findsomething_copy" name="email"></button></findsomething-div>
                <findsomething-p id="findsomething_email"></findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title"><button class="findsomething_copy" name="jwt"></button></findsomething-div>
                <findsomething-p id="findsomething_jwt"></findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title"><button class="findsomething_copy" name="algorithm"></button></findsomething-div>
                <findsomething-p id="findsomething_algorithm"></findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title"><button class="findsomething_copy" name="sensitive"></button></findsomething-div>
                <findsomething-p id="findsomething_sensitive"></findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title"><button class="findsomething_copy" name="incomplete_path"></button></findsomething-div>
                <findsomething-p id="findsomething_incomplete_path"></findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title"><button class="findsomething_copy" name="url"></button></findsomething-div>
                <findsomething-p id="findsomething_url"></findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title"><button class="findsomething_copy" name="static"></button></findsomething-div>
                <findsomething-p id="findsomething_static"></findsomething-p>
            </findsomething-div>
        </findsomething-div>
    </findsomething-div>
    <style type="text/css">
        /* Custom tags need to be block-level */
        findsomething-div {
            display: block;
        }
        
        #findsomething_neko {
            backdrop-filter: blur(12px);
            background-color: rgba(255, 255, 255, 0.95) !important;
            border: 1px solid rgba(196, 7, 255, 0.4) !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
            transition: all 0.3s ease !important;
        }

        #findsomething_neko-title {
            background: linear-gradient(135deg, #c407ff 0%, #8600c4 100%) !important;
            padding: 14px 18px !important;
            border-bottom: none !important;
            box-shadow: 0 2px 10px rgba(134, 0, 196, 0.2) !important;
        }

        #findsomething_taskstatus {
            color: white !important;
            font-size: 12px !important;
            font-weight: 600 !important;
            letter-spacing: 0.8px !important;
            text-transform: uppercase !important;
            opacity: 0.95 !important;
        }

        #findsomething-hide-btn {
            background: rgba(255, 255, 255, 0.15) !important;
            color: white !important;
            border: 1px solid rgba(255, 255, 255, 0.4) !important;
            padding: 5px 12px !important;
            font-size: 10px !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            font-weight: 700 !important;
            border-radius: 6px !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            cursor: pointer !important;
        }

        #findsomething-hide-btn:hover {
            background: rgba(255, 255, 255, 0.25) !important;
            border-color: white !important;
            transform: translateY(-1px);
        }

        .findsomething-item-group {
            margin-bottom: 15px !important;
            background: #ffffff !important;
            border-radius: 10px !important;
            border: 1px solid #f0f0f0 !important;
            overflow: hidden !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.02) !important;
            transition: all 0.2s ease !important;
        }

        .findsomething-item-group:hover {
            border-color: rgba(196, 7, 255, 0.4) !important;
            box-shadow: 0 4px 12px rgba(196, 7, 255, 0.08) !important;
            transform: translateY(-1px);
        }

        .findsomething-title {
            background: #fafafa !important;
            padding: 10px 14px !important;
            font-size: 11px !important;
            font-weight: 800 !important;
            color: #8600c4 !important;
            border-bottom: 1px solid #f5f5f5 !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            text-transform: uppercase !important;
            letter-spacing: 0.8px !important;
        }

        .findsomething_copy {
            background: #fdf4ff !important;
            border: 1px solid #c407ff !important;
            color: #c407ff !important;
            padding: 3px 10px !important;
            font-size: 10px !important;
            border-radius: 6px !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
        }

        .findsomething_copy:hover {
            background: #c407ff !important;
            color: white !important;
            box-shadow: 0 0 10px rgba(196, 7, 255, 0.3) !important;
        }

        findsomething-p {
            display: block !important;
            padding: 12px 14px !important;
            margin: 0 !important;
            font-size: 13px !important;
            line-height: 1.6 !important;
            color: #333 !important;
            word-break: break-all !important;
            max-height: 160px !important;
            overflow-y: auto !important;
            font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', monospace !important;
            background: white !important;
        }

        /* Scrollbar styling */
        findsomething-p::-webkit-scrollbar,
        #findsomething_neko::-webkit-scrollbar {
            width: 4px;
        }

        findsomething-p::-webkit-scrollbar-thumb,
        #findsomething_neko::-webkit-scrollbar-thumb {
            background: #e0e0e0;
            border-radius: 10px;
        }

        findsomething-p::-webkit-scrollbar-thumb:hover,
        #findsomething_neko::-webkit-scrollbar-thumb:hover {
            background: #c407ff;
        }
    </style>
    `;
    div.appendChild(document.createRange().createContextualFragment(floatHtml));
    body.appendChild(div);

    // Safely set i18n text after injection (AMO compliance)
    const hBtn = document.getElementById('findsomething-hide-btn');
    if (hBtn) hBtn.textContent = chrome.i18n.getMessage("float_btn_hide");
    
    // Set titles and empty messages for all categories
    const categories = ['path', 'ip', 'ip_port', 'domain', 'id_card', 'mobile', 'email', 'jwt', 'algorithm', 'sensitive', 'incomplete_path', 'url', 'static'];
    categories.forEach(cat => {
        const p = document.getElementById('findsomething_' + cat);
        if (p) p.textContent = chrome.i18n.getMessage("popup_category_empty");
        // Update button and title text
        const titleDiv = p?.previousElementSibling;
        if (titleDiv) {
            const btn = titleDiv.querySelector('button');
            if (btn) btn.textContent = chrome.i18n.getMessage("float_btn_copy");
            const titleText = chrome.i18n.getMessage("popup_title_" + cat);
            // Prepend the title text to the title div (before the button)
            titleDiv.prepend(document.createTextNode(titleText));
        }
    });

    const hideBtn = document.getElementById('findsomething-hide-btn');
    if (hideBtn) {
        hideBtn.addEventListener('click', function () {
            const floatDiv = document.getElementById('findsomething-float-div');
            if (floatDiv) {
                floatDiv.style.display = 'none';   // 或 floatDiv.remove(); 根据你原来的 onclick 逻辑调整
            }
        });
    }
    var neko = document.querySelector('#findsomething_neko');
    var nekoW = neko.offsetWidth;
    var nekoH = neko.offsetHeight;
    var cuntW = 0;
    var cuntH = 0;
    neko.style.left = parseInt(document.body.offsetWidth - nekoW) + 1 + 'px';
    neko.style.top = '50px';
    move(neko, 0, 0);
    function move(obj, w, h) {
        if (obj.direction === 'left') {
            obj.style.left = 0 - w + 'px';
        } else if (obj.direction === 'right') {

            obj.style.left = document.body.offsetWidth - nekoW + w + 'px';
        }
        if (obj.direction === 'top') {
            obj.style.top = 0 - h + 'px';
        } else if (obj.direction === 'bottom') {
            obj.style.top = document.body.offsetHeight - nekoH + h + 'px';
        }
    }

    function rate(obj, a) {
        //  console.log(a);
        obj.style.transform = ' rotate(' + a + ')'
    }

    var nekotitle = document.querySelector('#findsomething_neko-title');
    nekotitle.onmousedown = function (e) {
        var nekoL = e.clientX - neko.offsetLeft;
        var nekoT = e.clientY - neko.offsetTop;
        document.onmousemove = function (e) {
            cuntW = 0;
            cuntH = 0;
            neko.direction = '';
            neko.style.transition = '';
            neko.style.left = (e.clientX - nekoL) + 'px';
            neko.style.top = (e.clientY - nekoT) + 'px';
            if (e.clientX - nekoL < 5) {
                neko.direction = 'left';
            }
            if (e.clientY - nekoT < 5) {
                neko.direction = 'top';
            }
            if (e.clientX - nekoL > document.body.offsetWidth - nekoW - 5) {
                neko.direction = 'right';
            }
            if (e.clientY - nekoT > document.body.offsetHeight - nekoH - 5) {
                neko.direction = 'bottom';
            }

            move(neko, 0, 0);


        }
    }
    neko.onmouseover = function () {
        move(this, 0, 0);
        rate(this, 0)
    }

    neko.onmouseout = function () {
        // move(this, nekoW / 2, nekoH / 2);
        move(this, nekoW / 2, 0);
        // move(this, 0, 0);
    }

    neko.onmouseup = function () {
        document.onmousemove = null;
        this.style.transition = '.5s';
        // move(this, nekoW / 2, nekoH / 2);
        move(this, nekoW / 2, 0);
    }

    window.onresize = function () {
        var bodyH = document.body.offsetHeight;
        var nekoT = neko.offsetTop;
        var bodyW = document.body.offsetWidth;
        var nekoL = neko.offsetLeft;

        if (nekoT + nekoH > bodyH) {
            neko.style.top = bodyH - nekoH + 'px';
            cuntH++;
        }
        if (bodyH > nekoT && cuntH > 0) {
            neko.style.top = bodyH - nekoH + 'px';
        }
        if (nekoL + nekoW > bodyW) {
            neko.style.left = bodyW - nekoW + 'px';
            cuntW++;
        }
        if (bodyW > nekoL && cuntW > 0) {
            neko.style.left = bodyW - nekoW + 'px';
        }

        // move(neko, nekoW / 2, nekoH / 2);
        move(this, nekoW / 2, 0);
        // move(this, 0, 0);
    }

    // Start polling only after UI is injected and confirmed visible
    get_info();
});

function init_copy() {
    const elements = document.getElementsByClassName("findsomething_copy");
    if (elements) {
        for (let i = 0; i < elements.length; i++) {
            let ele_name = elements[i].name;
            elements[i].onclick = function () {
                const inp = document.createElement('textarea');
                document.body.appendChild(inp);
                inp.value = document.getElementById(ele_name).textContent;
                inp.select();
                document.execCommand('copy', false);
                inp.remove();
            }
        }
    }
}
setTimeout(() => {
    init_copy();
}, 500);

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

const key_list = ["ip", "ip_port", "domain", "path", "incomplete_path", "url", "static", "id_card", "mobile", "email", "jwt", "algorithm", "sensitive"]

function show_info(result_data) {
    if (result_data) {
        for (const k of key_list) {
            const element = document.getElementById("findsomething_" + k);
            if (!element) continue;

            if (result_data[k] && result_data[k].length > 0) {
                element.style.whiteSpace = "pre";
                element.textContent = result_data[k].join('\n') + '\n';
            } else {
                element.style.whiteSpace = "normal";
                const emptyText = chrome.i18n.getMessage("popup_category_empty");
                element.textContent = (emptyText && emptyText !== '') ? emptyText : 'No data found';
            }
        }
    }
}

async function get_info() {
    // Stop polling if the UI was removed or hidden to save resources
    const floatDiv = document.getElementById('findsomething-float-div');
    if (!floatDiv || floatDiv.style.display === 'none') {
        return;
    }

    chrome.runtime.sendMessage({ greeting: "get", current: window.location.href }, async function (result_data) {
        const taskstatus = document.getElementById('findsomething_taskstatus');
        if (!taskstatus) return;

        if (!result_data || result_data['done'] != 'done') {
            if (result_data) {
                show_info(result_data);
                taskstatus.textContent = chrome.i18n.getMessage("popup_status_scanning", [
                    String(result_data["donetasklist"]?.length || 0),
                    String(result_data["tasklist"]?.length || 0)
                ]);
            } else {
                taskstatus.textContent = chrome.i18n.getMessage("popup_status_scanning", ["0", "?"]);
            }
            await sleep(100);
            get_info();
            return;
        }

        taskstatus.textContent = chrome.i18n.getMessage("popup_status_complete", [
            String(result_data["donetasklist"]?.length || 0),
            String(result_data["tasklist"]?.length || 0)
        ]);
        show_info(result_data);

        if (result_data['donetasklist']?.length != result_data['tasklist']?.length) {
            await sleep(100);
            get_info();
        }
    });
}
