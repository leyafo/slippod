import * as CM from "./common"
import fuzzySearch from "./lib/fuzzy"

const atMatchRegex = /@([a-zA-Z0-9\u4e00-\u9fff/\\_-]+)/

function createCardSuggestion(card){
    const div = document.createElement("div");
    utils.markdownRender(card.entry).then(function(html){
        div.innerHTML = html
    });
    div.dataset.id = card.id; 
    div.onclick = function(event){
        // let cursor = cm.getCursor(), token = cm.getTokenAt(cursor);
    };
    div.addEventListener("mouseover", function () {
    });
    return div
}

function showAtLinkMenu(cm, editor) {
    const coordsPos = cm.cursorCoords(true, "page");

    let menu = document.createElement("div");
    menu.style.position = "absolute"; // Make sure the position is set to 'absolute'
    menu.style.left = `${coordsPos.left}px`;
    menu.style.top = `${coordsPos.bottom}px`;
    menu.classList.add("completeAtMenu")

    db.getCards(0, CM.limitItems).then(function (cards) {
        for (let card of cards) {
            const div = createCardSuggestion(card);
            menu.appendChild(div);
        }
        menu.firstChild.classList.add("highlighted");
        document.body.appendChild(menu);
    });
    editor.on("keydown", completeAtKeyHandler(editor, menu, cm));
    editor.on("blur", function(event){
        console.log('editor blur');
        closeAtMenu(menu)
    })
}

function getLastMatch(str, pattern) {
    let lastMatch;
    let match;

    // Create a RegExp object to ensure it maintains its lastIndex property
    const regex = new RegExp(pattern, 'g');

    // Continue searching until no more matches
    while ((match = regex.exec(str)) !== null) {
        lastMatch = match;
    }
    if(lastMatch){
        return lastMatch[0];
    }
    return null
}
function completeAtKeyHandler(editor, menu, cm){
    let inputText = "";
    let handler = function(cm, event){
        switch (event.key) {
            case "ArrowUp": // Arrow Up
            case "ArrowDown": // Arrow Down
            case "Tab":
                event.preventDefault();
                navigateMenu(event, menu);
                break;
            case "Enter"://Enter key
                event.preventDefault();
                const item = menu.querySelector('.highlighted'); // Assume you've highlighted the selected item
                if (item) {
                    const cursor = editor.getCursor(); // Get the current cursor position
                    const line = editor.getLine(cursor.line); // Get the content of the current line

                    // Find the starting position of the string to be replaced
                    let startCh = cursor.ch - 1; // start one character before the cursor
                    while (startCh > 0 && line[startCh] !== '@') {
                        startCh--;
                    }

                    editor.replaceRange(`@${item.dataset.id} `, { line: cursor.line, ch: startCh }, cursor); // Replace with new text
                }
                closeAtMenu(menu);
                editor.off('keydown', handler);
            case " "://space
            case "Escape":
            case "#":
            case "@":
                {
                    closeAtMenu(menu);
                    editor.off('keydown', handler);
                }
            default: //refresh the sugestion list
                setTimeout(()=>{
                    const token = cm.getTokenAt(editor.getCursor());
                    const currentInput = getLastMatch(token.string, atMatchRegex)
                    console.log(token, "current input: ", currentInput, "last input: ", inputText)
                    if(currentInput != null){
                        const searchText = currentInput.slice(1)
                        if (inputText == "" || inputText != searchText){
                            inputText = searchText
                            db.searchCardsWithStyle(searchText, 0, CM.limitItems).then(function(cards){
                                menu.innerHTML = "";
                                if(cards.length > 0){
                                    for(let card of cards){
                                        console.log(card);
                                        const div=createCardSuggestion(card);
                                        menu.appendChild(div);
                                    }
                                }
                            })
                        }
                    }
                }, 0);
        }
    }

    return handler
}

function closeAtMenu(menu){
    if(menu != null && menu.parentNode != null){
        menu.parentNode.removeChild(menu)
        menu = null;
    }
}

// Navigation function
function navigateMenu(event, menu) {
    // Up Arrow
    if (event.key === 'ArrowUp') {
        CM.highlightUpOrDownItem(CM.highlightUp, "highlighted", menu)
    } else if (event.key === 'ArrowDown' || event.key === "Tab") {
        CM.highlightUpOrDownItem(CM.highlightDown, "highlighted", menu)
    }else{
        return;
    }
}

function autocompleteHints(cm, option) {
    console.log(option)
    let allTags = [];
    let allHints = [];
    db.getAllTags().then(function (tags) {
        for (let t of tags) {
            allTags.push(t)
            allHints.push({
                text: `#${t.tag} `,
                displayText: t.tag,
            });
        }
    });
    return new Promise(function (accept) {
        setTimeout(function () {
            var cursor = cm.getCursor(), line = cm.getLine(cursor.line)
            var start = cursor.ch-1, end = cursor.ch;

            console.log(cursor.ch, line, line.charAt(cursor.ch-1))
            while (start > 0 && line.charAt(start) != '#'){
                --start
            }

            //+1 means remove '#'
            var nakedTag = line.slice(start+1, end).toLowerCase()
            console.log(nakedTag);
            if (nakedTag === "") {
                return accept({
                    list: allHints,
                    from: CodeMirror.Pos(cursor.line, start),
                    to: CodeMirror.Pos(cursor.line, end)
                })
            }

            console.log(!window.tagRegex.test(nakedTag))
            if (!window.tagRegex.test(`#${nakedTag}`)){
                return accept(null);
            }
            let hints = [];
            for (let t of allTags) {
                if (fuzzySearch(t.tag, nakedTag, {})) {
                    hints.push({
                        text: `#${t.tag} `,
                        displayText: t.tag,
                    });
                }
            }
            return accept({
                list: hints,
                from: CodeMirror.Pos(cursor.line, start),
                to: CodeMirror.Pos(cursor.line, end)
            })
        }, 100);
    })
}
  

// CodeMirror.defineMode("hashtags", function (config, parserConfig) {
//     var hashtagOverlay = {
//         token: function (stream, state) {
//             // This regex matches a single @ followed by the desired pattern.
//             if (stream.match(window.tagRegex)) {
//                 return "hashtag";
//             }

//             while (stream.next() != null && !stream.match(window.tagRegex, false)) { }

//             return null;
//         },
//     return CodeMirror.overlayMode(
//         CodeMirror.getMode(config, parserConfig.backdrop || "markdown"),
//         hashtagOverlay
//     );
// });

export {
    autocompleteHints,
    showAtLinkMenu,
}