import * as marked from "marked";
import Alpine from 'alpinejs'
import { list } from "postcss";

function unixTimeFormat(unixTime) {
    const d = new Date(unixTime * 1000);
    let minute = d.getMinutes();
    minute = minute < 10 ? '0'+minute:minute; 
    let second = d.getSeconds()
    second = second < 10 ? '0'+second:second;
    return `${d.getFullYear()}-${
      d.getMonth() + 1
    }-${d.getUTCDate()} ${d.getHours()}:${minute}:${second}`;
}

function clickHandle(selector, handle) {
    document.addEventListener("click", function(event) {
        if (!event.target.closest(selector)) {
            return;
        }
        handle(event);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    window.Alpine = Alpine
    Alpine.start()

    marked.use({
        mangle: false,
        headerIds: false
    });

    const listView = document.getElementById("listView");
    const editorView = document.getElementById("editor-view");
    const cardDetailContainer = document.getElementById("card-detail-container");
    const listInsertFirst = 1;
    const listInsertLast = 2;
    const limitItems = 20;
    const updatingCardsContainer = new Map();

    setInterval(() => {
        updatingCardsContainer.forEach(function(entry, cardID, map){
            db.editCardByID(cardID, entry).then(function(cardID){
                db.getCardByID(cardID).then(function(card){
                    const editingID = cardDetailContainer.getAttribute("card-id");
                    if(editingID == cardID){
                        displayUpdatedAtTime(card.updated_at);
                    }
                    const listItem = document.getElementById(`list-item-${cardID}`);
                    listItem.querySelector(".content").innerHTML = marked.parse(card.entry);
                    updatingCardsContainer.delete(cardID);
                })
            })
        })
    }, 5000);//saving cards for 5s

    function insertCard(card, order) {
        const template = document.getElementById("listItemTemplate");
        const listItem = template.content.cloneNode(true);
        const content = listItem.querySelector(".content");
        content.innerHTML = marked.parse(card.entry);

        const topRow = listItem.querySelector(".top-row");
        const idSpan = listItem.querySelector(".card-id");
        idSpan.textContent = card.id;
        //没法直接设置属性
        listItem.querySelector(".list-item").setAttribute("x-data", `{cardID: ${card.id}}`);
        listItem
            .querySelector(".list-item")
            .setAttribute("id", `list-item-${card.id}`);

        let cardCreatedAt = topRow.querySelector("span.card-created-at");
        cardCreatedAt.textContent =
            "Created At: " + unixTimeFormat(card.created_at);
        let cardUpdatedAt = topRow.querySelector("span.card-updated-at");
        cardUpdatedAt.textContent =
            "Updated At: " + unixTimeFormat(card.updated_at);

        if (order == listInsertLast) {
            listView.insertBefore(listItem, null);
        } else if (order == listInsertFirst) {
            listView.insertBefore(listItem, listView.firstChild);
        }
    }

    //load cards
    (async () => {
        db.getCards(0, limitItems).then(function(cards) {
            for (let card of cards) {
                insertCard(card, listInsertLast);
            }
        });
    })();

    clickHandle("div.CodeMirror span.cm-link", function(event){
        let linkContent = event.target.textContent;
        const cardID = linkContent.replace(/\[|\]/gm, "");
        db.cardIsExisted(cardID).then(function(r){
            if (r != undefined) {
                highlightListItem(cardID);
                // showCardInEditor(r.id);
            }
        });
    });

    //list-item event listener
    let lastHighLightItem = 0;
    function highlightListItem(cardID){
        if(lastHighLightItem != 0){
            document.getElementById(`list-item-${lastHighLightItem}`).classList.remove('hl-list-item');
        }
        document.getElementById(`list-item-${cardID}`).classList.add('hl-list-item');
        lastHighLightItem = cardID;
    }

    // clickHandle(".list-item", function(event) {
    //     const listItem = event.target.closest(".list-item");
    //     const cardID = listItem.getAttribute("card-id");
    //     console.log(cardID);
    //     highlightListItem(cardID);
    //     // showCardInEditor(cardID);
    // });

    function displayCreatedAtTime(createAt){
        let cardCreatedAt = editorView.querySelector("span.card-created-at");
        cardCreatedAt.textContent =
            "Created At: " + unixTimeFormat(createAt);
    }

    function displayUpdatedAtTime(updateAt){
        let cardUpdatedAt = editorView.querySelector("span.card-updated-at");
        cardUpdatedAt.textContent =
            "Updated At: " + unixTimeFormat(updateAt);
    }

    function synonyms(cm, option) {
      return new Promise(function (accept) {
        console.log(accept);
        setTimeout(function () {
          var cursor = cm.getCursor(),
            line = cm.getLine(cursor.line);
          var start = cursor.ch,
            end = cursor.ch;
          while (start && /\w/.test(line.charAt(start - 1))) --start;
          while (end < line.length && /\w/.test(line.charAt(end))) ++end;
          var word = line.slice(start, end).toLowerCase();
          for (var i = 0; i < comp.length; i++)
            if (comp[i].indexOf(word) != -1)
              return accept({
                list: comp[i],
                from: CodeMirror.Pos(cursor.line, start),
                to: CodeMirror.Pos(cursor.line, end),
              });
          return accept(null);
        }, 100);
      });
    }
    window.editCard=function(e){
        const itemThis = this
        itemThis.close();
        const listItem = e.target.closest(".list-item");
        const mdContent = listItem.querySelector(".markdown-body");
        mdContent.innerHTML="";
        let editor = CodeMirror(mdContent, {
          theme: "default",
          mode: "markdown",
          keyMap: "emacs",
          pollInterval: 1000,
          hintOptions: { hint: synonyms },
          lineWrapping: false,
        });
        db.getCardByID(itemThis.cardID).then(function(card){
            editor.setValue(card.entry);
        });
    }

    window.deleteCard=function(e){
        const itemThis = this
        db.deleteCardByID(itemThis.cardID).then(function(){
            const listItem = e.target.closest(".list-item");
            listItem.remove();
        })
    }
    window.tagClick=function(e){
        e.preventDefault();
        const href = e.target.getAttribute("href");
        if (href == "/all"){
            utils.reloadAll();
        }else if (href == "/trash"){
            db.getTrashCards(0, limitItems).then(function(cards){
                listView.innerHTML = "";
                for (let card of cards) {
                    insertCard(card, listInsertLast);
                }
            })
        }else if ( href == "/notag"){
            db.getNoTagCards(0, limitItems).then(function(cards){
                listView.innerHTML = "";
                for (let card of cards) {
                    insertCard(card, listInsertLast);
                }
            })
        } else{
            const tag = e.target.getAttribute("tag")
            db.getCardsByTag(tag, 0, limitItems).then(function(cards) {
                listView.innerHTML = "";
                for (let card of cards) {
                    insertCard(card, listInsertLast);
                }
            });
        }
    }

    const searchBox = document.getElementById('searchBox');
    const suggestionBox = document.getElementById('suggestionBox');
    const suggestionResults = document.getElementById('suggestionResults');
    const noResults = document.getElementById('noResults');
    const highlightUp = 1;
    const highlightDown = 2;

    searchBox.addEventListener('keydown', function(event){
        if (event.key === 'ArrowDown') {
            highlightNote(event, highlightDown);
        } else if (event.key === 'ArrowUp') {
            highlightNote(event, highlightUp);
        } else if (event.key === 'Enter') {
            if (event.ctrlKey){
                const searchTerm = searchBox.value;
                db.createNewCard(searchTerm).then((newCardID) => {
                    db.getCardByID(newCardID).then((card) => {
                        insertCard(card, listInsertFirst);
                        clearSearch(event);
                    });
                });
                event.stopPropagation();
                return
            }

            const highlightedSuggestion = document.querySelector('#suggestionResults .highlighted');
            if (highlightedSuggestion) {
                handleOptionSelect(highlightedSuggestion.dataset.id);
                clearSearch(event);
                event.stopPropagation();
            }
        }  else if (event.key == "Escape"){
            clearSearch(event);
        }
    });

    function highlightNote(event, arrowDirection) {
        if(suggestionBox.classList.contains('hidden')){
            return
        }
        //处理没有搜索结果的情况
        if(!noResults.classList.contains('hidden')){
            return
        }
        const highlightedNote = document.querySelector('#suggestionResults .highlighted');

        let highlightNextNote = null;
        if (arrowDirection === highlightUp){
            highlightNextNote = highlightedNote.previousElementSibling || suggestionResults.lastChild;
        }else if (arrowDirection === highlightDown){
            highlightNextNote = highlightedNote.nextElementSibling || suggestionResults.firstChild;
        }
        if(highlightNextNote !== null){
            highlightedNote.classList.remove('highlighted');
            highlightNextNote.classList.add('highlighted');
            highlightNextNote.scrollIntoView({block: 'nearest'});
        }
        event.preventDefault();
    }

    let isComposing = false;
    searchBox.addEventListener('compositionstart', function(event) {
        isComposing = true;
    });

    searchBox.addEventListener('compositionend', function(event) {
        isComposing = false;
        performSearch(event.target.value);
    });

    searchBox.addEventListener('input', function(event) {
        if (!isComposing) {
            performSearch(event.target.value);
        }
    });

    function performSearch(searchTerm) {
        // If the search term is empty, hide the suggestion box and exit the function
        if (searchTerm === '') {
            suggestionBox.classList.add("hidden")
            return;
        }

        db.searchCards(searchTerm, 0, limitItems).then(function(cards) {
            updateSuggestionBox(cards);
        });
    }

    function updateSuggestionBox(cards) {
        // Show the suggestion box
        suggestionBox.classList.remove("hidden")

        // Clear suggestion results
        suggestionResults.innerHTML = '';

        if (cards.length === 0) {
            // If there are no matching notes, show the "No matched notes" message
            noResults.classList.remove("hidden");
        } else {
            // If there are matching notes, hide the "No matched notes" message
            noResults.classList.add("hidden");

            // Create a div for each matching note and add it to the suggestion box
            for (let card of cards) {
                const div = document.createElement("div")
                div.textContent = card.entry.trim();
                div.dataset.id = card.id;  // Attach the note's ID
                div.onclick = searchOptionClick;

                // Mouseover event for highlighting
                div.addEventListener('mouseover', function() {
                    const currentlyHighlighted = document.querySelector('#suggestionResults .highlighted');
                    if (currentlyHighlighted) {
                        currentlyHighlighted.classList.remove('highlighted');
                    }
                    div.classList.add('highlighted');
                });

                suggestionResults.appendChild(div);

                // Auto-highlight the first note
                if (div === suggestionResults.firstChild) {
                    div.classList.add('highlighted');
                }
            }
            // Show suggestion reuslts
            suggestionResults.classList.remove('hidden');
        }
    }

    function searchOptionClick(event){
        const cardID = event.target.dataset.id
        handleOptionSelect(cardID);
        clearSearch(event);
    }

    function handleOptionSelect(cardID){
        db.getCardsByMiddleID(Number(cardID), 0, 0, limitItems).then(function(cards){
            listView.innerHTML = "";
            for (let card of cards) {
                insertCard(card, listInsertFirst);
            }
        });
    }

    function clearSearch(event) {
        // Defocus the search box
        searchBox.blur();

        // Clear the search term
        searchBox.value = '';

        // Clear the suggested notes
        suggestionResults.innerHTML = '';

        // Hide the noResults message
        noResults.classList.add("hidden");

        // Hide the suggestionResults
        suggestionResults.classList.add("hidden");

        // Hide the entire suggestion box
        suggestionBox.classList.add("hidden")
    }

    //全局快捷键盘
    document.addEventListener('keydown', function(event) {
        if (event.key == "k" &&event.ctrlKey){
            searchBox.focus();
        }
    });


    let listHasGetLastItemDown = 0;
    let listHasGetLastItemUp = 0;
    document.querySelector(".list-container").onscroll = function(ev) {
        const listContainer = ev.target;
        const totalHeight = listContainer.scrollHeight - listContainer.offsetHeight;
        if (totalHeight - listContainer.scrollTop < 2) {
            let lastCallList = JSON.parse(localStorage.getItem("list_call"));
            let fn = db[lastCallList.funcName];
            let args = lastCallList.args;
            const offsetArgsIndex = args.length - 2;
            if (args[offsetArgsIndex] == 0){
                listHasGetLastItemDown = 0
            }
            if (listHasGetLastItemDown == 1){
                return
            }
            if (Number(args[offsetArgsIndex]) > this.maxID){
                return
            } 
            args[offsetArgsIndex] += limitItems;
            args[args.length-1] = limitItems;
            fn(...args).then(function(cards) {
                for (let card of cards) {
                    insertCard(card, listInsertLast);
                }
                if (cards.length < limitItems) {
                listHasGetLastItemDown = 1;
                }
            });
            listHasGetLastItemDown = 1
        }else if(listContainer.scrollTop == 0){
            let lastCallList = JSON.parse(localStorage.getItem("list_call"));
            if(lastCallList.funcName !== "getCardsByMiddleID"){
                //其他list操作不需要向上滚动
                return
            }
            let fn = db[lastCallList.funcName];
            let args = lastCallList.args;
            const offsetArgsIndex = args.length - 3;
            if (args[offsetArgsIndex] == 0){
                listHasGetLastItemUp = 0
            }
            if (listHasGetLastItemUp == 1){
                return
            }
            args[offsetArgsIndex] += limitItems;
            args[args.length-1] = -limitItems;
            fn(...args).then(function(cards) {
                for (let card of cards) {
                    insertCard(card, listInsertFirst);
                }
                if(cards.length<limitItems){
                    listHasGetLastItemUp = 1;
                }
            });
        }
    };
});