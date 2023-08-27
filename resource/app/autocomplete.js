import * as CM from "./common"
const menuTemplate = document.getElementById("completeReferenceMenu")

function createCardSuggestion(card){
    const div = document.createElement("div");
    div.textContent = card.entry.trim();
    div.dataset.id = card.id; 
    div.onclick = function(event){
        // let cursor = cm.getCursor(), token = cm.getTokenAt(cursor);
    };
    div.addEventListener("mouseover", function () {
    });
    return div
}

function showCustomMenu(cm, editor) {
    const coordsPos = cm.cursorCoords(true, "page");

    var menu = document.createElement("div");
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
        editor.on("keydown", completeAtKeyHandler(editor, menu, cm))
    });
}
function completeAtKeyHandler(editor, menu, cm){
    let inputText = "";
    let handler = function(cm, event){
        switch (event.keyCode) {
            case 38: // Arrow Up
                navigateMenu(event, menu);
                event.preventDefault(); // Prevent scrolling
                break;
            case 40: // Arrow Down
                navigateMenu(event, menu);
                event.preventDefault(); // Prevent scrolling
                break;
            case 13://Enter key
                event.preventDefault(); // Prevent default action
                const item = menu.querySelector('.highlighted'); // Assume you've highlighted the selected item
                if (item) {
                    const cursor = editor.getCursor(); // Get the current cursor position
                    const line = editor.getLine(cursor.line); // Get the content of the current line
                    const token = cm.getTokenAt(cursor);
                    inputText = token.string.slice(1)
                    console.log(token, cursor.line, cursor.ch);
                    editor.replaceRange("", { line: cursor.line, ch: 0 }, { line: cursor.line, ch: cursor.ch }); // Replace line content
                    editor.replaceRange(`[${token.string}](/links/${item.dataset.id})\n`, cursor); // Insert new text
                    closeAtMenu(menu);
                    editor.off('keydown', handler);
                }
            case 32:
            case 27:
            case 51:
                {
                    closeAtMenu(menu);
                    editor.off('keydown', handler);
                }
            default: //refresh the sugestion list
                {
                    const cursor = editor.getCursor(); // Get the current cursor position
                    const token = cm.getTokenAt(cursor);
                    if(inputText != token.string.slice(1)){
                        inputText = token.string.slice(1);
                        if (inputText.length > 0){
                            db.searchCards(inputText, 0, 100).then(function(cards){
                                menu.innerHTML = ""
                                for (let card of cards) {
                                    const div = createCardSuggestion(card);
                                    menu.appendChild(div);
                                }
                                if (cards.length == 0){
                                    closeAtMenu(menu);
                                    editor.off('keydown', handler);
                                }
                            });
                        }
                    }
                }
        }
    }

    return handler
}

function closeAtMenu(menu){
    if(menu != null && menu.parentNode != null){
        menu.parentNode.removeChild(menu)
    }
}

// Navigation function
function navigateMenu(event, menu) {
    console.log('test');
    const items = Array.from(menu.querySelectorAll('div'));  // Replace 'div' with the actual item selector if different
    const highlighted = menu.querySelector('.highlighted');
    let index = items.indexOf(highlighted);

    // Up Arrow
    if (event.key === 'ArrowUp') {
        event.preventDefault();  // Prevent default to stop any side behavior (like scrolling)
        if (index > 0) {
            index--;
        } else {
            index = items.length - 1;  // Cycle to the bottom
        }
    }
    // Down Arrow
    else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (index < items.length - 1) {
            index++;
        } else {
            index = 0;  // Cycle to the top
        }
    }
    // Not an arrow key
    else {
        return;
    }

    // Remove old highlight
    if (highlighted) {
        highlighted.classList.remove('highlighted');
    }

    // Add new highlight
    items[index].classList.add('highlighted');
}

function autocompleteHints(cm, option) {
  return new Promise(function (accept) {
    let cursor = cm.getCursor(),
      lineContent = cm.getLine(cursor.line),
      token = cm.getTokenAt(cursor);
    let signalCh = lineContent[cursor.ch - 1];
    console.log(token, signalCh);
    if (signalCh == "#") {
      db.getAllTags().then(function (tags) {
        let hints = [];
        for (let t of tags) {
          hints.push({
            text: `[${t.tag}](/tag/${t.tag}) `,
            displayText: t.tag,
          });
        }
        return accept({
          list: hints,
          from: { line: cursor.line, ch: cursor.ch - 1 },
          to: cursor,
        });
      });
    } else if (signalCh == "@") {
    }
  });
}

CodeMirror.defineMode("hashtags", function (config, parserConfig) {
    var hashtagOverlay = {
    token: function (stream, state) {
        if (stream.match(/#[a-zA-Z0-9_]+/)) {
        return "hashtag";
        }
        while (
        stream.next() != null &&
        !stream.match(/#[a-zA-Z0-9_]+/, false)
        ) {}
        return null;
    },
    };
    return CodeMirror.overlayMode(
    CodeMirror.getMode(config, parserConfig.backdrop || "markdown"),
    hashtagOverlay
    );
});

export {
    autocompleteHints,
    showCustomMenu,
}