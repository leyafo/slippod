import * as CM from './common.js';
import * as marked from "marked";
import * as autoComplete from "./autocomplete.js"

function deselectCurrentCard() {
    const selectedLi = CM.cardsList.querySelector(".selected");
    if (selectedLi) {
        selectedLi.classList.remove("selected");
    }
}

function editCard(li) {
    let getEditingCardPromise = db.getCardByID(li.dataset.id);

    getEditingCardPromise.then(function(card) {
        const cardEntry = card.entry;
        const content = li.querySelector(".content") 
        content.innerHTML = '';
        const updateButton = li.querySelector(".updateCardButton");
        CM.toggleElementShown(updateButton)
        updateButton.onclick=handleUpdateCardButton;
        li.dataset.editing = 'true';
        let editor = CodeMirror(content, {
          theme: "default",
          mode: "hashtags",
          keyMap: "emacs",
          pollInterval: 1000,
          hintOptions: { hint: autoComplete.autocompleteHints, shown: function(){console.log(hello)} },
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

CM.clickHandle(".tagClick", function(e){
    e.preventDefault();
    const href = e.target.getAttribute("href");
    const tag = e.target.getAttribute("tag");

    switch (href) {
        case "/tag_all":
            utils.reloadAll();
            break;
        case "/tag_trash":
            db.getTrashCards(0, CM.limitItems).then(cards => reloadCardList(cards, "Trash"));
            break;
        case "/tag_no":
            db.getNoTagCards(0, CM.limitItems).then(cards => reloadCardList(cards, "No Tag"));
            break;
        default:
            db.getCardsByTag(tag, 0, CM.limitItems).then(cards => reloadCardList(cards, tag));
    }
});

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


function handleUpdateCardButton(ev){
    const li = ev.target.closest("li");
    const content = li.querySelector(".content");
    const cardID = li.dataset.id;
    const entry = content.firstChild.CodeMirror.getValue();

    db.updateCardEntryByID(cardID, entry).then(() => {
        content.innerHTML = marked.parse(entry);
        const updateButton = li.querySelector(".updateCardButton");
        CM.toggleElementHidden(updateButton);
    });
    li.dataset.editing = 'false';
}



function reloadCardList(cards, headerTitle = 'All Cards', order=CM.listInsertBeforeFirst) {
    CM.toggleElementShown(CM.loadingIndicator)// Show the loading indicator
    CM.cardsHeader.textContent = headerTitle; // Update the cards header

    document.documentElement.scrollTop = 0; // Reset the scroll position to the top

    // Display the cards
    CM.cardsList.innerHTML = '';  // Clear the current cards
    cards.forEach(card => {
        console.log(card.id);
        insertCardToList(card, order)
    });

    if (CM.cardsList.children.length > 0) {
        CM.toggleElementHidden(CM.creationTip);
    } else {
        CM.toggleElementShown(CM.creationTip);
    }
}

function insertCardToList(card, order){
    const fragment = document.createDocumentFragment();
    const li = createCardElementFromObject(card);
    fragment.appendChild(li);
    if (order == CM.listInsertAfterLast) {
        CM.cardsList.insertBefore(fragment, null);
    } else if (order == CM.listInsertBeforeFirst) {
        CM.cardsList.insertBefore(fragment, CM.cardsList.firstChild);
    }
    return li
}

function createCardElementFromObject(card) {
    const li = document.createElement('li');
    const listItem = CM.cardItemTemplate.content.cloneNode(true);
    const content = listItem.querySelector(".content");
    content.innerHTML = marked.parse(card.entry);

    const createTimeSapn = listItem.querySelector("span.createTime")
    const createdTate = CM.unixTimeFormat(card.created_at);
    createTimeSapn.textContent = createdTate;

    li.appendChild(listItem);

    li.dataset.id = card.id;
    li.dataset.editing = 'false';

    addCardEventListeners(li);

    return li;
}

function highlightNote(event, arrowDirection) {
  if (CM.suggestionBox.classList.contains("hidden")) {
    return;
  }
  //处理没有搜索结果的情况
  if (!CM.noResults.classList.contains("hidden")) {
    return;
  }
  const highlightedNote = document.querySelector(
    "#suggestionResults .highlighted"
  );

  let highlightNextNote = null;
  if (arrowDirection === CM.highlightUp) {
    highlightNextNote =
      highlightedNote.previousElementSibling || CM.suggestionResults.lastChild;
  } else if (arrowDirection === CM.highlightDown) {
    highlightNextNote =
      highlightedNote.nextElementSibling || CM.suggestionResults.firstChild;
  }
  if (highlightNextNote !== null) {
    highlightedNote.classList.remove("highlighted");
    highlightNextNote.classList.add("highlighted");
    highlightNextNote.scrollIntoView({ block: "nearest" });
  }
  event.preventDefault();
}

let isComposing = false;
CM.searchBox.addEventListener("compositionstart", function (event) {
  isComposing = true;
});

CM.searchBox.addEventListener("compositionend", function (event) {
  isComposing = false;
  performSearch(event.target.value);
});

CM.searchBox.addEventListener("input", function (event) {
  if (!isComposing) {
    performSearch(event.target.value);
  }
});

function performSearch(searchTerm) {
  // If the search term is empty, hide the suggestion box and exit the function
  if (searchTerm === "") {
    CM.suggestionBox.classList.add("hidden");
    return;
  }

  db.searchCards(searchTerm, 0, CM.limitItems).then(function (cards) {
    updateSuggestionBox(cards);
  });
}

function updateSuggestionBox(cards) {
  // Show the suggestion box
  CM.toggleElementShown(CM.suggestionBox);

  // Clear suggestion results
  CM.suggestionResults.innerHTML = "";

  if (cards.length === 0) {
    // If there are no matching notes, show the "No matched notes" message
    CM.toggleElementShown(CM.noResults)
  } else {
    // If there are matching notes, hide the "No matched notes" message
    CM.toggleElementHidden(CM.noResults)

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

      CM.suggestionResults.appendChild(div);

      // Auto-highlight the first note
      if (div === CM.suggestionResults.firstChild) {
        div.classList.add("highlighted");
      }
    }
    // Show suggestion reuslts
    CM.suggestionResults.classList.remove("hidden");
  }
}

function searchOptionClick(event) {
  const cardID = event.target.dataset.id;
  handleOptionSelect(cardID);
  clearSearch(event);
}

function handleOptionSelect(cardID) {
  db.getCardsByMiddleID(Number(cardID), 0, 0, CM.limitItems).then(function (cards) {
    reloadCardList(cards, "All Cards");
    CM.hideOmniSearchAndUnfocus()
  });
}

function clearSearch(event) {
  // Defocus the search box
  CM.searchBox.blur();

  // Clear the search term
  CM.searchBox.value = "";

  // Clear the suggested notes
  CM.suggestionResults.innerHTML = "";

  // Hide the noResults message
  CM.noResults.classList.add("hidden");

  // Hide the suggestionResults
  CM.suggestionResults.classList.add("hidden");

  // Hide the entire suggestion box
  CM.suggestionBox.classList.add("hidden");

  CM.hideOmniSearchAndUnfocus()
}

const omniSearchButton = document.getElementById('omniSearchButton');


omniSearchButton.addEventListener('click', function(event) {
    if (CM.omniSearch.classList.contains('hidden')) {
        CM.showOmniSearchAndFocus()
    }

    event.preventDefault();
    event.stopPropagation();
});

CM.omniSearch.addEventListener('click', function(event) {
    if (event.target !== CM.searchBox) {
        clearSearch();
        event.stopPropagation();
    }
});

CM.sideNavButton.addEventListener('click', function() {
    if (CM.sideNav.classList.contains('hidden')) {
        openSideNav();
    } else {
        closeSideNav();
    }
});

CM.sideNav.addEventListener('click', function(event) {
    // Check if the clicked element is a child of the sideNav
    if (CM.sideNav.contains(event.target)) {
        closeSideNav();
    }
});

// Hide sideNav and overlay when the overlay is clicked
CM.overlay.addEventListener('click', function() {
    closeSideNav();
});

let isSideNavOpen = false;
function openSideNav() {
    CM.sideNav.classList.remove('hidden');
    CM.overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    isSideNavOpen = true;
}

function closeSideNav() {
    CM.sideNav.classList.add('hidden');
    CM.overlay.classList.add('hidden');
    CM.sideNavButton.blur();
    document.body.classList.remove('overflow-hidden');
    isSideNavOpen = false;
}


export function handleScroll() {
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

        args[offsetArgsIndex] += CM.limitItems;
        args[limitIndex] = scrollDirection === 'down' ? CM.limitItems : -CM.limitItems;

        return fn(...args);
    }

    function handleCards(cards, order, directionFlag) {
        for (let card of cards) {
            insertCardToList(card, order);
        }
        if (cards.length < CM.limitItems) {
            directionFlag === 'down' ? listHasGetLastItemDown = 1 : listHasGetLastItemUp = 1;
        }
    }

    return function(event) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const nearBottom = scrollTop + clientHeight >= scrollHeight - 20;

        if (nearBottom) {
            loadCardsFromStorage('down').then(cards => {
                handleCards(cards, CM.listInsertAfterLast, 'down');
            });
        } else if (scrollTop === 0) {
            const lastCallList = JSON.parse(localStorage.getItem("list_call"));
            
            if (lastCallList.funcName !== "getCardsByMiddleID") {
                // If not this specific function, then no need to handle upward scrolling.
                return;
            }

            loadCardsFromStorage('up').then(cards => {
                handleCards(cards, CM.listInsertBeforeFirst, 'up');
            });
        }
    }
}

document.addEventListener('scroll', handleScroll());

window.addEventListener('DOMContentLoaded', function() {
    marked.use({
        mangle: false,
        headerIds: false
    });

    //load cards
    db.getCards(0, CM.limitItems).then(function(cards) {
        reloadCardList(cards, "All Cards", CM.listInsertAfterLast)
    });

    db.getAllTags().then(function(tags){
        for(let t of tags){
            const li = document.createElement("li")
            li.setAttribute("href", `/tag/${t.tag}`)
            li.classList.add("tagClick");
            li.textContent = t.tag;
            CM.tagList.appendChild(li);
        }
    })

});


export {
    highlightNote,
    handleOptionSelect,
    clearSearch,
    insertCardToList,
}