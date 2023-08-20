import * as marked from "marked";
import Alpine from 'alpinejs'

let currentInput = null;
let currentLi = null;
let selectedCard = null;
const sideNav = document.getElementById('sideNav');
const sideNavButton = document.getElementById('sideNavButton');
const overlay = document.getElementById('overlay');
const limitItems = 20;
const listInsertBeforeFirst = 1;
const listInsertAfterLast = 2;
const loadingIndicator = document.getElementById('loadingIndicator');
const cardsHeader = document.getElementById('cardsHeader');
const cardsList = document.getElementById('cardsList');
const creationTip = document.getElementById('creationTip');


function createCardElement() {
    const li = document.createElement('li');
    return li;
}

function hideSuggestion() {
    creationTip.classList.add('hidden');
}

function showSuggestion() {
    creationTip.classList.remove('hidden');
}

function deselectCurrentCard() {
    const selectedLi = cardsList.querySelector(".selected")
    selectedLi.classList.remove("selected");
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
    const li = ev.target.closest("li")
    li.dataset.editing = false
    const content = li.querySelector(".content")
    const cardID = li.dataset.id;
    const entry = content.firstChild.CodeMirror.getValue();
    db.updateCardEntryByID(cardID, entry).then(function(){
        content.innerHTML = marked.parse(entry);
        const updateButton = li.querySelector(".updateCardButton");
        updateButton.classList.add("hidden");
    })
}

function editCard(li) {
    let getEditingCardPromise = db.getCardByID(li.dataset.id);

    getEditingCardPromise.then(function(card) {
        const cardEntry = card.entry;
        const content = li.querySelector(".content") 
        content.innerHTML = '';
        const updateButton = li.querySelector(".updateCardButton");
        updateButton.classList.remove("hidden");
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
    if (selectedCard) {
        selectedCard.classList.remove('selected');
    }

    li.classList.add('selected');
    selectedCard = li;
}

document.addEventListener('keydown', function(event) {
    // handleDocumentKeydown(event);
});

window.tagClick = function(e){
    e.preventDefault();
    const href = e.target.getAttribute("href");
    if (href == "/tag_all"){
        utils.reloadAll();
    }else if (href == "/tag_trash"){
        db.getTrashCards(0, limitItems).then(function(cards){
            reloadCardList(cards, "Trash")
        })
    }else if ( href == "/tag_no"){
        db.getNoTagCards(0, limitItems).then(function(cards){
            reloadCardList(cards, "No Tag")
        })
    } else{
        const tag = e.target.getAttribute("tag")
        db.getCardsByTag(tag, 0, limitItems).then(function(cards) {
            reloadCardList(cards, tag)
        });
    }
}

function reloadCardList(cards, headerTitle = 'All Cards', order=listInsertBeforeFirst) {
    loadingIndicator.classList.remove('hidden'); // Show the loading indicator
    cardsHeader.textContent = headerTitle; // Update the cards header

    document.documentElement.scrollTop = 0; // Reset the scroll position to the top
    // endTip.classList.add('hidden'); // Ensure the end tip is hidden by default

    // Display the cards
    cardsList.innerHTML = '';  // Clear the current cards
    cards.forEach(card => {
        console.log(card.id);
        insertCardToList(card, order)
    });

    if (cardsList.children.length > 0) {
        hideSuggestion();
    } else {
        showSuggestion();
    }
}

function insertCardToList(card, order){
    const fragment = document.createDocumentFragment();
    const li = createCardElementFromObject(card);
    fragment.appendChild(li);
    if (order == listInsertAfterLast) {
        cardsList.insertBefore(fragment, null);
    } else if (order == listInsertBeforeFirst) {
        cardsList.insertBefore(fragment, cardsList.firstChild);
    }
    return li
}

function createCardElementFromObject(card) {
    const li = createCardElement();
    const cardItemTemplate = document.getElementById("cardItemTemplate")
    const listItem = cardItemTemplate.content.cloneNode(true);
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

// function handleDocumentKeydown(event) {
//     const cards = Array.from(cardsList.children);
//     const selectedCardIndex = cards.indexOf(selectedCard);

//     if (isSideNavOpen) {
//         // If the side navigation is open, prevent certain shortcuts
//         if ((event.ctrlKey || event.metaKey) && (event.key === 'n' || event.key === 'k')) {
//             event.preventDefault();
//             return;
//         }
//         if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
//             event.preventDefault();
//             return;
//         }
//         if (event.key === 'Escape') {
//             closeSideNav();
//             event.preventDefault();
//             return;
//         }
//     }

//     if (event.key === 'ArrowDown') {
//         if (!suggestionBox.classList.contains('hidden')) {
//             highlightNextCard(event);
//         } else {
//             selectNextCard(event, cards, selectedCardIndex);
//         }
//     } else if (event.key === 'ArrowUp') {
//         if (!suggestionBox.classList.contains('hidden')) {
//             highlightPreviousCard(event);
//         } else {
//             selectPreviousCard(event, cards, selectedCardIndex);
//         }
//     } else if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
//         createCardInput();
//         event.preventDefault();
//     } else if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
//         showOmniSearchAndFocus();
//         event.preventDefault();
//     } else if (event.key === 'Enter') {
//         initiateCardEditing(event);
//     } else if (event.key === 'Escape') {
//         if (searchBox === document.activeElement) {
//             clearSearch(event);
//         } else {
//             deselectActiveCard(event);
//         }
//     }
// }

// Get the search box and suggestion box elements
const searchBox = document.getElementById("searchBox");
const suggestionBox = document.getElementById("suggestionBox");
const suggestionResults = document.getElementById("suggestionResults");
const noResults = document.getElementById("noResults");
const omniSearch = document.getElementById('omniSearch');
const highlightUp = 1;
const highlightDown = 2;

//全局快捷键盘
document.addEventListener('keydown', function(event) {
    if (event.key == "k" &&event.ctrlKey){
        showOmniSearchAndFocus();
        searchBox.focus();
        event.preventDefault();
    }
});

searchBox.addEventListener("keydown", function (event) {
  if (event.key === "ArrowDown") {
    highlightNote(event, highlightDown);
  } else if (event.key === "ArrowUp") {
    highlightNote(event, highlightUp);
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
        const searchTerm = searchBox.value;
        db.createNewCard(searchTerm).then((newCardID) => {
            db.getCardByID(newCardID).then((card) => {
                const li = insertCardToList(card, listInsertBeforeFirst);
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

function highlightNote(event, arrowDirection) {
  if (suggestionBox.classList.contains("hidden")) {
    return;
  }
  //处理没有搜索结果的情况
  if (!noResults.classList.contains("hidden")) {
    return;
  }
  const highlightedNote = document.querySelector(
    "#suggestionResults .highlighted"
  );

  let highlightNextNote = null;
  if (arrowDirection === highlightUp) {
    highlightNextNote =
      highlightedNote.previousElementSibling || suggestionResults.lastChild;
  } else if (arrowDirection === highlightDown) {
    highlightNextNote =
      highlightedNote.nextElementSibling || suggestionResults.firstChild;
  }
  if (highlightNextNote !== null) {
    highlightedNote.classList.remove("highlighted");
    highlightNextNote.classList.add("highlighted");
    highlightNextNote.scrollIntoView({ block: "nearest" });
  }
  event.preventDefault();
}

let isComposing = false;
searchBox.addEventListener("compositionstart", function (event) {
  isComposing = true;
});

searchBox.addEventListener("compositionend", function (event) {
  isComposing = false;
  performSearch(event.target.value);
});

searchBox.addEventListener("input", function (event) {
  if (!isComposing) {
    performSearch(event.target.value);
  }
});

function performSearch(searchTerm) {
  // If the search term is empty, hide the suggestion box and exit the function
  if (searchTerm === "") {
    suggestionBox.classList.add("hidden");
    return;
  }

  db.searchCards(searchTerm, 0, limitItems).then(function (cards) {
    updateSuggestionBox(cards);
  });
}

function updateSuggestionBox(cards) {
  // Show the suggestion box
  suggestionBox.classList.remove("hidden");

  // Clear suggestion results
  suggestionResults.innerHTML = "";

  if (cards.length === 0) {
    // If there are no matching notes, show the "No matched notes" message
    noResults.classList.remove("hidden");
  } else {
    // If there are matching notes, hide the "No matched notes" message
    noResults.classList.add("hidden");

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

      suggestionResults.appendChild(div);

      // Auto-highlight the first note
      if (div === suggestionResults.firstChild) {
        div.classList.add("highlighted");
      }
    }
    // Show suggestion reuslts
    suggestionResults.classList.remove("hidden");
  }
}

function searchOptionClick(event) {
  const cardID = event.target.dataset.id;
  handleOptionSelect(cardID);
  clearSearch(event);
}

function handleOptionSelect(cardID) {
  db.getCardsByMiddleID(Number(cardID), 0, 0, limitItems).then(function (cards) {
    reloadCardList(cards, "All Cards");
    hideOmniSearchAndUnfocus()
  });
}

function clearSearch(event) {
  // Defocus the search box
  searchBox.blur();

  // Clear the search term
  searchBox.value = "";

  // Clear the suggested notes
  suggestionResults.innerHTML = "";

  // Hide the noResults message
  noResults.classList.add("hidden");

  // Hide the suggestionResults
  suggestionResults.classList.add("hidden");

  // Hide the entire suggestion box
  suggestionBox.classList.add("hidden");
}

const omniSearchButton = document.getElementById('omniSearchButton');

function hideOmniSearchAndUnfocus() {
    omniSearch.classList.add('hidden'); 
    searchBox.blur();
    document.body.classList.remove('overflow-hidden');
}

function showOmniSearchAndFocus() {
    omniSearch.classList.remove('hidden'); 
    searchBox.focus();
    document.body.classList.add('overflow-hidden');
}

omniSearchButton.addEventListener('click', function(event) {
    if (omniSearch.classList.contains('hidden')) {
        showOmniSearchAndFocus()
    }

    event.preventDefault();
    event.stopPropagation();
});

omniSearch.addEventListener('click', function(event) {
    if (event.target !== searchBox) {
        clearSearch();
        event.stopPropagation();
    }
});



sideNavButton.addEventListener('click', function() {
    if (sideNav.classList.contains('hidden')) {
        openSideNav();
    } else {
        closeSideNav();
    }
});

sideNav.addEventListener('click', function(event) {
    // Check if the clicked element is a child of the sideNav
    if (sideNav.contains(event.target)) {
        closeSideNav();
    }
});

// Hide sideNav and overlay when the overlay is clicked
overlay.addEventListener('click', function() {
    closeSideNav();
});

let isSideNavOpen = false;
function openSideNav() {
    sideNav.classList.remove('hidden');
    overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    isSideNavOpen = true;
}

function closeSideNav() {
    sideNav.classList.add('hidden');
    overlay.classList.add('hidden');
    sideNavButton.blur();
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

let listHasGetLastItemDown = 0;
let listHasGetLastItemUp = 0;
function handleScroll(event) {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 20) { // 20 is a buffer
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
        args[offsetArgsIndex] += limitItems;
        args[args.length-1] = limitItems;
        fn(...args).then(function(cards) {
            for (let card of cards) {
                insertCardToList(card, listInsertAfterLast);
            }
            if (cards.length < limitItems) {
                listHasGetLastItemDown = 1;
            }
        });
    //向上滚动
    }else if(scrollTop == 0){
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
                insertCardToList(card, listInsertBeforeFirst);
            }
            if(cards.length<limitItems){
                listHasGetLastItemUp = 1;
            }
        });
    }
}
document.addEventListener('scroll', function(event){
    handleScroll(event);
});


// Call loadCards when the page loads
window.addEventListener('DOMContentLoaded', function() {
    marked.use({
        mangle: false,
        headerIds: false
    });

    window.Alpine = Alpine
    Alpine.start()

    //load cards
    db.getCards(0, limitItems).then(function(cards) {
        reloadCardList(cards, "All Cards", listInsertAfterLast)
    });
});