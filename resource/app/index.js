import * as marked from "marked";
import Alpine from 'alpinejs'

//all existed elements
const ES = {
    sideNav: document.getElementById('sideNav'),
    sideNavButton: document.getElementById('sideNavButton'),
    overlay: document.getElementById('overlay'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    cardsHeader: document.getElementById('cardsHeader'),
    cardsList: document.getElementById('cardsList'),
    creationTip: document.getElementById('creationTip'),
    cardItemTemplate: document.getElementById("cardItemTemplate"),
    searchBox: document.getElementById("searchBox"),
    suggestionBox: document.getElementById("suggestionBox"),
    suggestionResults: document.getElementById("suggestionResults"),
    noResults: document.getElementById("noResults"),
    omniSearch: document.getElementById('omniSearch')
};

const CONSTANTS = {
    limitItems: 20,
    listInsertBeforeFirst: 1,
    listInsertAfterLast: 2,
    highlightUp : 1,
    highlightDown : 2,
};

function toggleElementShown(element) {
    element.classList.remove('hidden');
}
function toggleElementHidden(element){
    element.classList.add('hidden')
}

function deselectCurrentCard() {
    const selectedLi = ES.cardsList.querySelector(".selected");
    if (selectedLi) {
        selectedLi.classList.remove("selected");
    }
}

function addCardEventListeners(li) {
    li.addEventListener('dblclick', function() {
        if (li.dataset.editing === 'false') {
            editCard(li);
        }
    });

    li.addEventListener('click', function() {
        if (li.dataset.editing === 'false') {
            selectCard(li);
        }
    });
}

function autocompleteHints(cm, option) {
  cm.on("shown", function () {
    console.log("hhhhkdjfls");
  });
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
            text: `[${t.tag}](/tag/${t.tag})`,
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

function handleUpdateCardButton(ev){
    const li = ev.target.closest("li");
    const content = li.querySelector(".content");
    const cardID = li.dataset.id;
    const entry = content.firstChild.CodeMirror.getValue();

    db.updateCardEntryByID(cardID, entry).then(() => {
        content.innerHTML = marked.parse(entry);
        const updateButton = li.querySelector(".updateCardButton");
        toggleElementHidden(updateButton);
    });
    li.dataset.editing = 'false';
}

function editCard(li) {
    let getEditingCardPromise = db.getCardByID(li.dataset.id);

    getEditingCardPromise.then(function(card) {
        const cardEntry = card.entry;
        const content = li.querySelector(".content") 
        content.innerHTML = '';
        const updateButton = li.querySelector(".updateCardButton");
        toggleElementShown(updateButton)
        updateButton.onclick=handleUpdateCardButton;
        li.dataset.editing = 'true';
        let editor = CodeMirror(content, {
          theme: "default",
          mode: "hashtags",
          keyMap: "emacs",
          pollInterval: 1000,
          hintOptions: { hint: autocompleteHints, shown: function(){console.log(hello)} },
          lineWrapping: false,
        });

        editor.on("change", function (cm, change) {
            if ( change.text[0] === "@" || change.text[0] == "#") {
                cm.showHint(); 
            }
        });
        editor.setValue(cardEntry);
        editor.on("endCompletion", function () {
          console.log("Autocomplete menu is being closed programmatically");
        });

        deselectCurrentCard();
    });
}

function selectCard(li) {
    deselectCurrentCard()
    li.classList.add('selected');
}

window.tagClick = function(e) {
    e.preventDefault();
    const href = e.target.getAttribute("href");
    const tag = e.target.getAttribute("tag");

    switch (href) {
        case "/tag_all":
            utils.reloadAll();
            break;
        case "/tag_trash":
            db.getTrashCards(0, CONSTANTS.limitItems).then(cards => reloadCardList(cards, "Trash"));
            break;
        case "/tag_no":
            db.getNoTagCards(0, CONSTANTS.limitItems).then(cards => reloadCardList(cards, "No Tag"));
            break;
        default:
            db.getCardsByTag(tag, 0, CONSTANTS.limitItems).then(cards => reloadCardList(cards, tag));
    }
};

function reloadCardList(cards, headerTitle = 'All Cards', order=CONSTANTS.listInsertBeforeFirst) {
    toggleElementShown(ES.loadingIndicator)// Show the loading indicator
    ES.cardsHeader.textContent = headerTitle; // Update the cards header

    document.documentElement.scrollTop = 0; // Reset the scroll position to the top

    // Display the cards
    ES.cardsList.innerHTML = '';  // Clear the current cards
    cards.forEach(card => {
        console.log(card.id);
        insertCardToList(card, order)
    });

    if (ES.cardsList.children.length > 0) {
        toggleElementHidden(ES.creationTip);
    } else {
        toggleElementShown(ES.creationTip);
    }
}

function insertCardToList(card, order){
    const fragment = document.createDocumentFragment();
    const li = createCardElementFromObject(card);
    fragment.appendChild(li);
    if (order == CONSTANTS.listInsertAfterLast) {
        ES.cardsList.insertBefore(fragment, null);
    } else if (order == CONSTANTS.listInsertBeforeFirst) {
        ES.cardsList.insertBefore(fragment, ES.cardsList.firstChild);
    }
    return li
}

function createCardElementFromObject(card) {
    const li = document.createElement('li');
    const listItem = ES.cardItemTemplate.content.cloneNode(true);
    const content = listItem.querySelector(".content");
    content.innerHTML = marked.parse(card.entry);

    const createTimeSapn = listItem.querySelector("span.createTime")
    const createdTate = unixTimeFormat(card.created_at);
    createTimeSapn.textContent = createdTate;

    li.appendChild(listItem);

    li.dataset.id = card.id;
    li.dataset.editing = 'false';

    addCardEventListeners(li);

    return li;
}

function highlightNote(event, arrowDirection) {
  if (ES.suggestionBox.classList.contains("hidden")) {
    return;
  }
  //处理没有搜索结果的情况
  if (!ES.noResults.classList.contains("hidden")) {
    return;
  }
  const highlightedNote = document.querySelector(
    "#suggestionResults .highlighted"
  );

  let highlightNextNote = null;
  if (arrowDirection === CONSTANTS.highlightUp) {
    highlightNextNote =
      highlightedNote.previousElementSibling || ES.suggestionResults.lastChild;
  } else if (arrowDirection === CONSTANTS.highlightDown) {
    highlightNextNote =
      highlightedNote.nextElementSibling || ES.suggestionResults.firstChild;
  }
  if (highlightNextNote !== null) {
    highlightedNote.classList.remove("highlighted");
    highlightNextNote.classList.add("highlighted");
    highlightNextNote.scrollIntoView({ block: "nearest" });
  }
  event.preventDefault();
}

let isComposing = false;
ES.searchBox.addEventListener("compositionstart", function (event) {
  isComposing = true;
});

ES.searchBox.addEventListener("compositionend", function (event) {
  isComposing = false;
  performSearch(event.target.value);
});

ES.searchBox.addEventListener("input", function (event) {
  if (!isComposing) {
    performSearch(event.target.value);
  }
});

function performSearch(searchTerm) {
  // If the search term is empty, hide the suggestion box and exit the function
  if (searchTerm === "") {
    ES.suggestionBox.classList.add("hidden");
    return;
  }

  db.searchCards(searchTerm, 0, CONSTANTS.limitItems).then(function (cards) {
    updateSuggestionBox(cards);
  });
}

function updateSuggestionBox(cards) {
  // Show the suggestion box
  ES.suggestionBox.classList.remove("hidden");

  // Clear suggestion results
  ES.suggestionResults.innerHTML = "";

  if (cards.length === 0) {
    // If there are no matching notes, show the "No matched notes" message
    toggleElementShown(ES.noResults)
  } else {
    // If there are matching notes, hide the "No matched notes" message
    toggleElementHidden(ES.noResults)

    // Create a div for each matching note and add it to the suggestion box
    for (let card of cards) {
      const div = document.createElement("div");
      div.textContent = card.entry.trim();
      div.dataset.id = card.id; // Attach the note's ID
      div.onclick = searchOptionClick;

      // Mouseover event for highlighting
      div.addEventListener("mouseover", function () {
        const currentlyHighlighted = document.querySelector(
          "#suggestionResults .highlighted"
        );
        if (currentlyHighlighted) {
          currentlyHighlighted.classList.remove("highlighted");
        }
        div.classList.add("highlighted");
      });

      ES.suggestionResults.appendChild(div);

      // Auto-highlight the first note
      if (div === ES.suggestionResults.firstChild) {
        div.classList.add("highlighted");
      }
    }
    // Show suggestion reuslts
    ES.suggestionResults.classList.remove("hidden");
  }
}

function searchOptionClick(event) {
  const cardID = event.target.dataset.id;
  handleOptionSelect(cardID);
  clearSearch(event);
}

function handleOptionSelect(cardID) {
  db.getCardsByMiddleID(Number(cardID), 0, 0, CONSTANTS.limitItems).then(function (cards) {
    reloadCardList(cards, "All Cards");
    hideOmniSearchAndUnfocus()
  });
}

function clearSearch(event) {
  // Defocus the search box
  ES.searchBox.blur();

  // Clear the search term
  ES.searchBox.value = "";

  // Clear the suggested notes
  ES.suggestionResults.innerHTML = "";

  // Hide the noResults message
  ES.noResults.classList.add("hidden");

  // Hide the suggestionResults
  ES.suggestionResults.classList.add("hidden");

  // Hide the entire suggestion box
  ES.suggestionBox.classList.add("hidden");

  hideOmniSearchAndUnfocus()
}

const omniSearchButton = document.getElementById('omniSearchButton');

function hideOmniSearchAndUnfocus() {
    toggleElementHidden(ES.omniSearch)
    ES.searchBox.blur();
    document.body.classList.remove('overflow-hidden');
}

function showOmniSearchAndFocus() {
    toggleElementShown(ES.omniSearch)
    ES.searchBox.focus();
    document.body.classList.add('overflow-hidden');
}

omniSearchButton.addEventListener('click', function(event) {
    if (ES.omniSearch.classList.contains('hidden')) {
        showOmniSearchAndFocus()
    }

    event.preventDefault();
    event.stopPropagation();
});

ES.omniSearch.addEventListener('click', function(event) {
    if (event.target !== ES.searchBox) {
        clearSearch();
        event.stopPropagation();
    }
});

ES.sideNavButton.addEventListener('click', function() {
    if (ES.sideNav.classList.contains('hidden')) {
        openSideNav();
    } else {
        closeSideNav();
    }
});

ES.sideNav.addEventListener('click', function(event) {
    // Check if the clicked element is a child of the sideNav
    if (ES.sideNav.contains(event.target)) {
        closeSideNav();
    }
});

// Hide sideNav and overlay when the overlay is clicked
ES.overlay.addEventListener('click', function() {
    closeSideNav();
});

let isSideNavOpen = false;
function openSideNav() {
    ES.sideNav.classList.remove('hidden');
    ES.overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    isSideNavOpen = true;
}

function closeSideNav() {
    ES.sideNav.classList.add('hidden');
    ES.overlay.classList.add('hidden');
    ES.sideNavButton.blur();
    document.body.classList.remove('overflow-hidden');
    isSideNavOpen = false;
}

function unixTimeFormat(unixTime) {
    const d = new Date(unixTime * 1000);
    let minute = d.getMinutes();
    minute = minute < 10 ? '0'+ minute : minute; 
    let second = d.getSeconds()
    second = second < 10 ? '0'+second : second;
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getUTCDate()} ${d.getHours()}:${minute}:${second}`;
}

function handleScroll() {
    let listHasGetLastItemDown = 0;
    let listHasGetLastItemUp = 0;

    function loadCardsFromStorage(scrollDirection) {
        const lastCallList = JSON.parse(localStorage.getItem("list_call"));
        const fn = db[lastCallList.funcName];
        const args = lastCallList.args;
        const offsetArgsIndex = scrollDirection === 'down' ? args.length - 2 : args.length - 3;
        const limitIndex = args.length - 1;

        if (args[offsetArgsIndex] === 0) {
            scrollDirection === 'down' ? listHasGetLastItemDown = 0 : listHasGetLastItemUp = 0;
        }

        if ((scrollDirection === 'down' && listHasGetLastItemDown === 1) || 
            (scrollDirection === 'up' && listHasGetLastItemUp === 1)) {
            return Promise.resolve([]); 
        }

        args[offsetArgsIndex] += CONSTANTS.limitItems;
        args[limitIndex] = scrollDirection === 'down' ? CONSTANTS.limitItems : -CONSTANTS.limitItems;

        return fn(...args);
    }

    function handleCards(cards, order, directionFlag) {
        for (let card of cards) {
            insertCardToList(card, order);
        }
        if (cards.length < CONSTANTS.limitItems) {
            directionFlag === 'down' ? listHasGetLastItemDown = 1 : listHasGetLastItemUp = 1;
        }
    }

    return function(event) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const nearBottom = scrollTop + clientHeight >= scrollHeight - 20;

        if (nearBottom) {
            loadCardsFromStorage('down').then(cards => {
                handleCards(cards, CONSTANTS.listInsertAfterLast, 'down');
            });
        } else if (scrollTop === 0) {
            const lastCallList = JSON.parse(localStorage.getItem("list_call"));
            
            if (lastCallList.funcName !== "getCardsByMiddleID") {
                // If not this specific function, then no need to handle upward scrolling.
                return;
            }

            loadCardsFromStorage('up').then(cards => {
                handleCards(cards, CONSTANTS.listInsertBeforeFirst, 'up');
            });
        }
    }
}

const onScroll = handleScroll()
document.addEventListener('scroll', onScroll);

window.addEventListener('DOMContentLoaded', function() {
    marked.use({
        mangle: false,
        headerIds: false
    });

    window.Alpine = Alpine
    Alpine.start()

    //load cards
    db.getCards(0, CONSTANTS.limitItems).then(function(cards) {
        reloadCardList(cards, "All Cards", CONSTANTS.listInsertAfterLast)
    });
});


//全局快捷键盘
document.addEventListener('keydown', function(event) {
    if (event.key == "k" &&event.ctrlKey){
        showOmniSearchAndFocus();
        ES.searchBox.focus();
        event.preventDefault();
    }
});

//搜索框快捷键
ES.searchBox.addEventListener("keydown", function (event) {
  if (event.key === "ArrowDown") {
    highlightNote(event, CONSTANTS.highlightDown);
  } else if (event.key === "ArrowUp") {
    highlightNote(event, CONSTANTS.highlightUp);
  } else if (event.key === "Enter") {
    if (event.ctrlKey) {
      event.stopPropagation();
      return;
    }

    const highlightedSuggestion = document.querySelector(
      "#suggestionResults .highlighted"
    );
    if (highlightedSuggestion) {
        console.log(highlightedSuggestion.dataset.id);
        handleOptionSelect(highlightedSuggestion.dataset.id);
        clearSearch(event);
        event.stopPropagation();
    }
  }else if (event.key == "n" && event.ctrlKey){
        const searchTerm = ES.searchBox.value;
        db.createNewCard(searchTerm).then((newCardID) => {
            db.getCardByID(newCardID).then((card) => {
                const li = insertCardToList(card, CONSTANTS.listInsertBeforeFirst);
                editCard(li);
                clearSearch(event);
            });
        });
        clearSearch(event);
        event.stopPropagation();
  } else if (event.key == "Escape") {
        clearSearch(event);
  }
});