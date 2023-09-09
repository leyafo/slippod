import * as CM from "./common"
import fuzzySearch from "./lib/fuzzy"
import * as marked from "marked";

const atMatchRegex = /@([a-zA-Z0-9\u4e00-\u9fff/\\_-]+)/

function createCardSuggestion(card){
    const div = document.createElement("div");
    div.innerHTML = marked.parse(card.entry.trim());
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
        editor.on("keydown", completeAtKeyHandler(editor, menu, cm));
    });
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
  let allTags = [];
  db.getAllTags().then(function (tags) {
    for (let t of tags) {
        allTags.push(t)
    }
  });
  return new Promise(function (accept) {
    let cursor = cm.getCursor(),
      lineContent = cm.getLine(cursor.line),
      token = cm.getTokenAt(cursor);
    let lastCharacter = lineContent[cursor.ch - 1];
    const inputText = token.string.slice(1);
    if ((inputText.length > 0 && lastCharacter== '#') || lastCharacter == '@'){
        return accept()
    }
    
    db.getAllTags().then(function (tags) {
    let hints = [];
    for (let t of allTags) {
        if(inputText.length > 0){
            if (fuzzySearch(t.tag, inputText, {})){
                hints.push({
                    text: `#${t.tag} `,
                    displayText: t.tag,
                });
            }
        }else{
            hints.push({
                text: `#${t.tag} `,
                displayText: t.tag,
            });
        }
    }
    return accept({
        list: hints,
        from: { line: cursor.line, ch: cursor.ch - (inputText.length+2)},
        to: cursor,
    });
    });
  });
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

db.searchCardsWithStyle("sdf", 0, 10).then((cards)=>{
    console.log(cards);
})