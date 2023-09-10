import * as CM from './common.js';
import * as marked from "marked";
import * as autoComplete from "./autocomplete.js"

const hrefTagAll = "/tag_all"
const hrefTagTrash = "/tag_trash"
const hrefTagNo = "/tag_no"

function highlightSidebarLink(href){
    const className = "selected" 
    //remove previous highlight
    const lastHighlightDiv = CM.sideNavContainer.querySelector(`div.${className}`);
    if(lastHighlightDiv != null && lastHighlightDiv.classList.contains(className)){
        lastHighlightDiv.classList.remove(className);
    }
    console.log(href);
    const div = CM.sideNavContainer.querySelector(`div[href="${href}"]`);
    const tagContainer = div.closest(".tagContainer")
    tagContainer.classList.add(className);
}


function updateCard(li){
    const content = li.querySelector(".content");
    const cardID = li.dataset.id;
    const entry = content.firstChild.CodeMirror.getValue();

    db.updateCardEntryByID(cardID, entry).then(() => {
        content.innerHTML = marked.parse(entry);
        const controlPanel = li.querySelector(".itemCtrlPanel");
        CM.toggleElementHidden(controlPanel)
    });
    li.dataset.editing = 'false';
}

function cancelUpdate(li){
    const content = li.querySelector(".content");
    const cardID = li.dataset.id;
    db.getCardByID(cardID).then(function(card){
        content.innerHTML = marked.parse(card.entry);
        const controlPanel = li.querySelector(".itemCtrlPanel");
        CM.toggleElementHidden(controlPanel)
    })
    li.dataset.editing = 'false';
}

function editCard(li) {
    let getEditingCardPromise = db.getCardByID(li.dataset.id);

    getEditingCardPromise.then(function(card) {
        const cardEntry = card.entry;
        const content = li.querySelector(".content") 
        content.innerHTML = '';
        const controlPanel = li.querySelector(".itemCtrlPanel");
        CM.toggleElementShown(controlPanel)
        li.dataset.editing = 'true';
        let editor = CodeMirror(content, {
          theme: "default",
          mode: "hashtags",
          keyMap: "emacs",
          pollInterval: 1000,
          hintOptions: { hint: autoComplete.autocompleteHints },
          lineWrapping: false,
        });

        editor.on("change", function (cm, change) {
            if (change.text[0] == "#") {
                cm.showHint();
            }else if (change.text[0] === "@"){
                autoComplete.showAtLinkMenu(cm, editor)
            }

            //set height as the same of content
            let lineCount = editor.lineCount();
            let totalHeight = lineCount * editor.defaultTextHeight();
            editor.setSize(null, totalHeight);
        });
        editor.setValue(cardEntry);
        editor.on("endCompletion", function () {
          console.log("Autocomplete menu is being closed programmatically");
        });
        editor.on('keydown', function (cm, event) {
            if (event.ctrlKey && event.key === "Enter") {  
                updateCard(li);
            }else if(event.key == 'Escape'){
                cancelUpdate(li);
            }
        });

        CM.unHighlightItem("selected", CM.cardsList)
    });
}

function deleteCard(li) {
    const cardID = li.dataset.id
    if(li.dataset.is_trash) {
        db.removeCardPermanently(li.dataset.trash_id).then(function(){
            CM.cardsList.removeChild(li);
        })
    } else {
        db.moveCardToTrash(cardID).then(function() {
            CM.cardsList.removeChild(li);
        })
    }
}

function restoreCard(li){
    if(li.dataset.is_trash){
        db.restoreCard(li.dataset.trash_id).then(function(){
            CM.cardsList.removeChild(li);
        })
    }
}

CM.clickHandle(".tagClick", function(e){
    e.preventDefault();

    var target = e.target;
    var tagContainer = target.closest(".tagContainer");

    let href;
    let tag;
    if (target.tagName !== 'DIV') {
        href = target.parentNode.getAttribute("href");
        tag = target.parentNode.dataset.tag;
    } else {
        href = target.getAttribute("href");
        tag = target.dataset.tag;
    }
    
    switch (href) {
        case hrefTagAll:
            utils.reloadAll();
            break;
        case hrefTagTrash:
            db.getTrashCards(0, CM.limitItems).then(cards => reloadCardList(cards, "Trash", CM.listInsertAfterLast));
            break;
        case hrefTagNo:
            db.getNoTagCards(0, CM.limitItems).then(cards => reloadCardList(cards, "No Tag", CM.listInsertAfterLast));
            break;
        default:
            db.getCardsByTag(tag, 0, CM.limitItems).then(cards => reloadCardList(cards, tag, CM.listInsertAfterLast));
    }
    CM.highlightItem("selected", tagContainer, CM.sideNavContainer);
});

CM.clickHandle(".foldIcon", function(e){
    e.preventDefault()
    const span = e.target;
    const li = span.closest('li');
    const ul = li.querySelector("ul");
    if(ul !== null){
        //fold
        if(ul.classList.contains("hidden")){
            span.classList.remove("close")
            span.classList.add("open")
            CM.toggleElementShown(ul);
        }else{
            //unfold
            span.classList.remove("open")
            span.classList.add("close")
            CM.toggleElementHidden(ul);
        }
    }
})

CM.clickHandle("#btnDuplicateWindow", function(e){
    pages.duplicateWindow();
})

function addCardEventListeners(li) {
    li.addEventListener('dblclick', function() {
        if (li.dataset.editing === 'false') {
            editCard(li);
        }
    });

    li.addEventListener('click', function() {
        if (li.dataset.editing === 'false') {
            CM.unHighlightItem("selected", CM.cardsList)
            li.classList.add('selected');
        }
    });
    const cardMenuContainer = li.querySelector(".itemMenuContainer")
    const cardMenuOptions = li.querySelector(".itemMenuOptions");

    cardMenuContainer.addEventListener('mouseover', function(event){
        CM.toggleElementShown(cardMenuOptions)
    })
    cardMenuContainer.addEventListener('mouseout', function(event){
        CM.toggleElementHidden(cardMenuOptions)
    })
    cardMenuOptions.querySelector(".editOption").addEventListener('click', function(event) {
        editCard(li)
    })
    cardMenuOptions.querySelector(".deleteOption").addEventListener('click', function(event) {
        deleteCard(li)
    })
    cardMenuOptions.querySelector(".restoreOption").addEventListener('click', function(event) {
        restoreCard(li)
    })
}

CM.clickHandle(".btnUpdateCard", function(ev) {
    const li = ev.target.closest("li");
    updateCard(li);
})

CM.clickHandle(".btnCancelCard", function(ev) {
    const li = ev.target.closest("li");
    cancelUpdate(li);
})

function reloadCardList(cards, headerTitle = 'All Cards', order = CM.listInsertBeforeFirst) {
    CM.listHeader.classList.remove("iconAllCards", "iconNoTag", "iconTrash", "iconTag");
    switch (headerTitle) {
        case "All Cards":
            CM.listHeader.classList.add("iconAllCards");
            break;
        case "No Tag":
            CM.listHeader.classList.add("iconNoTag");
            break;
        case "Trash":
            CM.listHeader.classList.add("iconTrash");
            break;
        default:
            CM.listHeader.classList.add("iconTag");
            break;
    }
    CM.listTitle.textContent = headerTitle; // Update the cards header

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
    const listItem = CM.itemTemplate.content.cloneNode(true);
    CM.fillingCardItem(listItem, card);

    li.appendChild(listItem);

    li.dataset.id = card.id;
    li.dataset.editing = 'false';
    if (card.is_trash) {
        li.dataset.is_trash = true;
        li.dataset.trash_id = card.trash_id;
        const cardMenuOptions = li.querySelector(".itemMenuOptions");
        CM.toggleElementHidden(cardMenuOptions.querySelector(".editOption"))
        CM.toggleElementShown(cardMenuOptions.querySelector(".restoreOption"))
    }

    addCardEventListeners(li);

    return li;
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
        const spanEntry = document.createElement("span");
        const spanIcon = document.createElement("span");
      
        spanEntry.textContent = card.entry.trim();
        spanEntry.classList.add("entry");
      
        spanIcon.classList.add("icon");
      
        div.dataset.id = card.id;
        div.onclick = searchOptionClick;
        div.classList.add("suggestedItem");
      
        div.addEventListener("mouseover", function () {
          CM.unHighlightItem("highlighted", CM.suggestionResults);
          div.classList.add("highlighted");
        });
      
        div.appendChild(spanIcon);
        div.appendChild(spanEntry);
      
        CM.suggestionResults.appendChild(div);
      
        if (div === CM.suggestionResults.firstChild) {
          div.classList.add("highlighted");
        }
      }

    // Show suggestion reuslts
    CM.toggleElementShown(CM.suggestionResults)
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
    highlightSidebarLink(hrefTagAll)
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

CM.btnSideNav.addEventListener('click', function() {
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
    CM.btnSideNav.blur();
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

function buildTagTree(tagList) {
  const tree = {};
  tagList.forEach(tagItem => {
    let node = tree;
    tagItem.tag.split('/').forEach(part => {
      if (!node[part]) {
        node[part] = {};
      }
      node = node[part];
    });
  });
  return tree;
}

function buildTagHtml(tree, prefix = '') {
  let html = '';
  for (const [key, value] of Object.entries(tree)) {
    const fullTag = prefix ? `${prefix}/${key}` : key;
    //folder
    if(Object.keys(value).length > 0) {
        html += `<li>
                <div class="tagContainer">
                <span class="foldIcon open"></span>
                <div class="tagClick" href="/tags/${fullTag}" data-tag="${fullTag}"><span class="tagIcon"></span><span class="label">${key}</span></div>
                </div>`;
    }else{
        // file
        html += `<li>
                <div class="tagContainer">
                <div class="tagClick" href="/tags/${fullTag}" data-tag="${fullTag}"><span class="tagIcon"></span><span class="label">${key}</span></div>
                </div>`;
    }

    if (Object.keys(value).length > 0) {
      html += '<ul>';
      html += buildTagHtml(value, fullTag);
      html += '</ul>';
    }
    html += '</li>';
  }
  return html;
}

document.addEventListener('click', CM.linkClick) 

//tag click
document.addEventListener('click', function(event){
    if (event.target.tagName !== 'A') {
        return;
    }

    const href = event.target.getAttribute('href');
    const tag = CM.getSuffix(href, "/tags/")
    if(tag == ""){
        return
    }
    event.preventDefault();
    db.getCardsByTag(tag, 0, CM.limitItems).then(cards => reloadCardList(cards, tag));
    highlightSidebarLink(href)
})

window.addEventListener('DOMContentLoaded', function() {
    CM.markedConfig();
    //load cards
    db.getCards(0, CM.limitItems).then(function(cards) {
        reloadCardList(cards, "All Cards", CM.listInsertAfterLast)
        highlightSidebarLink(hrefTagAll)
    });

    //load tags
    db.getAllTags().then(function(tags){
        let tree = buildTagTree(tags)
        let tagListHTML = buildTagHtml(tree)
        CM.tagList.innerHTML = tagListHTML
    })
});

export {
    handleOptionSelect,
    clearSearch,
    insertCardToList,
    editCard,
}