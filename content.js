(function () {
    'use strict';
    const appscriptSecret = "M-QjBWlrHgLXJ_3ClAKQETfQq_tZ4bSk_" // apps script project key
    const keyMaps = {
        'F3': "Condense",
        'F4': "Pocket",
        'F5': "Hat",
        'F6': "Block",
        'F7': "Tag",
        'F8': "Cite",
        'F9': "Underline",
        'F10': "Emphasis",
        'F11': "Highlight",
        'F12': "Clear" // works with e.preventDefault on macos, need to test on other platforms
    }
    
    // after the title bar buttons are loaded, add a text box describing the hotkey loading status
    var observer = new MutationObserver(function (_) {
        var node = document.createElement('div');
        var hotkeyNode = document.createTextNode('Hotkeys loading...');
        node.setAttribute('id', 'DebateTemplateHotkeysStatus')
        node.appendChild(hotkeyNode)
        document.getElementById("docs-titlebar-container").querySelector("div.docs-titlebar-buttons").prepend(node)
        observer.disconnect()
    });
    observer.observe(document.getElementById("docs-titlebar-container").querySelector("div.docs-titlebar-buttons"), { childList: true })
    
    var loadHotkeys = function () {
        // execute a click in the middle of the given element
        var execClick = (element) => {
            var box = element.getBoundingClientRect()
            var coordX = (box.left + box.right) / 2
            var coordY = (box.bottom + box.top) / 2
            element.dispatchEvent(new MouseEvent("mousedown", {
                bubbles: true,
                cancelable: true,
                clientX: coordX,
                clientY: coordY
            }));
            element.dispatchEvent(new MouseEvent("mouseup", {
                bubbles: true,
                cancelable: true,
                clientX: coordX,
                clientY: coordY
            }));
            element.dispatchEvent(new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                clientX: coordX,
                clientY: coordY
            }));
        }

        var promise = new Promise(resolve => {
            if (document.getElementById(appscriptSecret)) {
                return resolve(document.getElementById(appscriptSecret));
            }
            const observer = new MutationObserver(mutations => {
                if (document.getElementById(appscriptSecret)) {
                    resolve(document.getElementById(appscriptSecret));
                    observer.disconnect();
                }
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
        promise.then(appscriptElement => {
            execClick(document.getElementById("docs-extensions-menu")) // click open menu to propagate the divs of the extension
            execClick(appscriptElement)
            execClick(document.getElementById("docs-extensions-menu")) // close the menu that was just opened
            
            // all possible divs in body that may contain the extension function custom menu
            var funcMap = {}
            for (var func of Array.from(document.querySelectorAll(`body > div > [id^="${appscriptSecret}"]`))) {
                try {
                    funcMap[func.textContent] = func
                } catch (e) {
                    console.warn(e)
                }
            }

            document.getElementById('DebateTemplateHotkeysStatus').innerHTML = "Hotkeys loaded!"
            // remove the status after ten seconds
            this.setTimeout(function() {
                var status = document.getElementById('DebateTemplateHotkeysStatus')
                status.parentNode.removeChild(status)
            }, 10000)

            // actual keypress handling, add key listeners to the textevent target iframe
            var targets = document.getElementsByClassName("docs-texteventtarget-iframe");
            targets[0].contentDocument.childNodes[0].addEventListener('keydown', function (event) {
                var eventCode = event.code
                if (event.ctrlKey && event.altKey && event.keyCode.isDigit()) {
                    eventCode = "F" + event.keyCode
                    console.info("Treating " + event + " as " + eventCode)
                }
                if (eventCode.includes('F') && keyMaps[eventCode]) {
                    event.preventDefault()
                    // click on the function element
                    execClick(document.getElementById("docs-extensions-menu"))
                    execClick(document.getElementById(appscriptSecret))
                    if (!funcMap[keyMaps[eventCode]]) console.error(keyMaps[eventCode] + " does not have an associated element")
                    execClick(funcMap[keyMaps[eventCode]])
                }
            })
        })
    }
    // add hotkeys after window loads
    window.addEventListener('load', loadHotkeys, false);
})();