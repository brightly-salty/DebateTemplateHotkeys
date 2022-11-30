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
        document.querySelector("#docs-titlebar-container > div.docs-titlebar-buttons").prepend(node)
        observer.disconnect()
    });
    observer.observe(document.querySelector("#docs-titlebar-container > div.docs-titlebar-buttons"), { childList: true })
    
    // add hotkeys after window loads
    window.addEventListener('load', function () {
        // execute a click in the middle of the given element
        var execClick = (element) => {
            var box = element.getBoundingClientRect()
            var coordX = box.left + (box.right - box.left) / 2
            var coordY = box.top + (box.bottom - box.top) / 2
            // ^ get coords of middle of element
            element.dispatchEvent(new MouseEvent("mousedown", {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: coordX,
                clientY: coordY,
                button: 0
            }));
            element.dispatchEvent(new MouseEvent("mouseup", {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: coordX,
                clientY: coordY,
                button: 0
            }));
            element.dispatchEvent(new MouseEvent("click", {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: coordX,
                clientY: coordY,
                button: 0
            }));
        }

        execClick(document.getElementById("docs-extensions-menu")) // click open menu to propagate the divs of the extension
        execClick(document.getElementById(appscriptSecret))
        execClick(document.getElementById("docs-extensions-menu")) // close the menu that was just opened

        // find the verbatim function divs: 
        let functionDivs = document.querySelectorAll(`body > div > [id^=${appscriptSecret}]`);

        // create a map of function labels to the function element to click on
        var functionMap = {}
        for (var functionElement of functionDivs) {
            try {
                var functionLabel = functionElement.children[0].textContent
                functionMap[functionLabel] = functionElement
            } catch (e) { }
        }

        document.getElementById('DebateTemplateHotkeysStatus').innerHTML = "Hotkeys loaded!"
        this.setTimeout(function() {
            var status = document.getElementById('DebateTemplateHotkeysStatus')
            status.parentNode.removeChild(status)
        }, 3000)

        // actual keypress handling, add key listeners to the textevent target iframe
        var targets = document.getElementsByClassName("docs-texteventtarget-iframe");
        targets[0].contentDocument.childNodes[0].addEventListener('keydown', function (event) {

            if (event.code.includes('F') && keyMaps[event.code] != undefined) {
                event.preventDefault()
                // click on the function element
                execClick(document.getElementById("docs-extensions-menu"))
                execClick(document.getElementById(appscriptSecret))
                execClick(functionMap[keyMaps[event.code]])
            }
        })

    }, false);
})();