import * as CM from "./common"
import fuzzySearch from "./lib/fuzzy"

const atMatchRegex = /@([a-zA-Z0-9\u4e00-\u9fff/\\_-]+)/

function createCardSuggestion(card){
    const div = document.createElement("div");
    div.textContent = card.entry
    div.dataset.id = card.id; 
    return div
}

function showTagHints(cm, option){
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

function linkRender(element, self, cur){
    // const div = createCardSuggestion(card)
    // element.appendChild(div);
    console.log(element, self, cur);
    const span=document.createElement("span")
    span.className = "itemId"
    span.textContent=cur.cardID
    element.appendChild(span);
    element.insertAdjacentHTML('beforeend', cur.entry );
}

function showLinkHints(cm, option){
    return new Promise(function (accept) {
        setTimeout(function () {
            var cursor = cm.getCursor(), line = cm.getLine(cursor.line)
            var start = cursor.ch-1, end = cursor.ch;

            while (start > 0 && line.charAt(start) != '@'){
                --start
            }
            //+1 means exclude @
            var keyword = line.slice(start+1, end).toLowerCase()
            let hints = [];
            db.getCardSearchSuggestions(keyword).then(function (cards) {
                for (let card of cards) {
                    hints.push({
                        text: `@${card.id} `,
                        cardID: card.id,
                        entry: card.entry.trim(),
                        render: linkRender,
                    });
                }
                accept({
                    list: hints,
                    from: CodeMirror.Pos(cursor.line, start),
                    to: CodeMirror.Pos(cursor.line, end),
                });
            });
        }, 100);
    });
}

function autocompleteHints(cm, option) {
    // console.log(option)
    if(option.type == 'tag'){
        return showTagHints(cm, option)
    }else if(option.type == 'link'){
        return showLinkHints(cm, option)
    }
}
  

CodeMirror.defineMode("hashtags", function (config, parserConfig) {
    var hashtagOverlay = {
        token: function (stream, state) {
            // This regex matches a single @ followed by the desired pattern.
            if (stream.match(window.tagRegex)) {
                return "hashtag";
            }

            while (stream.next() != null && !stream.match(window.tagRegex, false)) { }

            return null;
        }
    }
    return CodeMirror.overlayMode(
        CodeMirror.getMode(config, parserConfig.backdrop || "markdown"),
        hashtagOverlay
    );
});

export {
    autocompleteHints,
}