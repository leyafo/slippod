import * as marked from "marked";
import Alpine from 'alpinejs'

let currentInput = null;
let currentLi = null;
let selectedCard = null;
const limitItems = 20;
const loadingIndicator = document.getElementById('loadingIndicator');
const cardsHeader = document.getElementById('cardsHeader');
const cardsList = document.getElementById('cardsList');
const creationTip = document.getElementById('creationTip');

function createCardInput() {
    saveCurrentCard();

    const li = createCardElement();
    const textarea = createTextarea();
    const saveButton = createSaveButton(li, textarea);

    li.appendChild(textarea);
    li.appendChild(saveButton);

    insertNewCard(li);
    hideSuggestion();
    focusTextarea(textarea);

    deselectCurrentCard();
    updateCurrents(textarea, li);
}

function saveCurrentCard() {
    if (currentInput) {
        saveCard(currentInput.value, currentLi);
    }
}

function createCardElement() {
    const li = document.createElement('li');
    return li;
}

function createTextarea() {
    const textarea = document.createElement('textarea');
    textarea.className = 'cardInput';
    textarea.placeholder = 'New Card';
    addTextareaKeydownListener(textarea);
    return textarea;
}

function createSaveButton(li, textarea) {
    const saveButton = document.createElement('button');
    saveButton.className = 'saveButton';
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', function() {
        saveCardAndResetCurrents(textarea.value, li);
    });
    return saveButton;
}

function insertNewCard(li) {
    // if (selectedCard) {
    //     cardsList.insertBefore(li, selectedCard.nextSibling);
    // } else {
    //     cardsList.insertBefore(li, cardsList.firstChild);
    // }
    cardsList.insertBefore(li, cardsList.firstChild);
}

function hideSuggestion() {
    creationTip.classList.add('hidden');
}

function showSuggestion() {
    creationTip.classList.remove('hidden');
}

function focusTextarea(textarea) {
    textarea.focus();
}

function deselectCurrentCard() {
    if (selectedCard) {
        selectedCard.classList.remove('selected');
        selectedCard = null;
    }
}

function updateCurrents(textarea, li) {
    currentInput = textarea;
    currentLi = li;
}

async function saveCardAndResetCurrents(cardText, li) {
    try {
        await saveCard(cardText, li);
    } catch (error) {
        console.error("Error saving card:", error);
        // Handle the error appropriately, maybe show a user-friendly message
        return; // Exit the function if there was an error
    }
    
    currentInput = null;
    currentLi = null;
}

function addTextareaKeydownListener(textarea) {
    textarea.addEventListener('keydown', function(event) {
        handleTextareaKeydown(event, textarea);
    });
}

function handleTextareaKeydown(event, textarea) {
    const li = currentLi;
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        saveCardAndResetCurrents(textarea.value, li);
        event.preventDefault();
        event.stopPropagation();
    } else if (event.key === 'Escape') {
        saveCardAndResetCurrents(textarea.value, li);
        event.stopPropagation();
    }
}

async function saveCard(cardText, li) {
    let cardID;

    if (li.dataset.id && await db.cardIsExisted(li.dataset.id)) {
        // If the card already has an ID and exists in the database, it's being updated
        cardID = await db.editCardByID(li.dataset.id, cardText);
        if (!cardID) {
            console.error("Error updating card in the database:", li.dataset.id);
            return; // or handle this case differently based on your requirements
        }
    } else {
        // If the card doesn't have an ID or doesn't exist in the database, it's new
        cardID = await db.createNewCard(cardText);
        if (!cardID) {
            console.error("Error creating new card in the database.");
            return; // or handle this case differently based on your requirements
        }
        li.dataset.id = cardID; // Store the ID in the li element for future reference
    }

    const card = await db.getCardByID(cardID);
    if (!card) {
        console.error("Error fetching card details from the database:", cardID);
        return;
    }

    const newLi = createCardElementFromObject(card);
    li.replaceWith(newLi);

    // Add event listeners to the new card
    addCardEventListeners(newLi);

    selectCard(newLi);
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

function generateUniqueId() {
    return 'card-' + Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function editCard(li) {
    saveCurrentCard();

    console.log(li.dataset.id);

    let getEditingCardPromise = db.getCardByID(li.dataset.id);

    getEditingCardPromise.then(function(card) {
        const cardEntry = card.entry;
        li.innerHTML = '';
        li.dataset.editing = 'true';

        const textarea = createTextarea();
        textarea.value = cardEntry;
        const saveButton = createSaveButton(li, textarea);

        li.appendChild(textarea);
        li.appendChild(saveButton);
        focusTextarea(textarea);

        deselectCurrentCard();
        updateCurrents(textarea, li);
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
    handleDocumentKeydown(event);
});

document.getElementById('allCards').addEventListener('click', function() {
    loadCards(); // Display all cards
});

document.getElementById('noTag').addEventListener('click', function() {
    loadCards('noTag', 'Untagged Cards'); // Display cards with no tag
});


// Call loadCards when the page loads
window.addEventListener('DOMContentLoaded', function() {
    loadCards();
    populateTagsList();
});

// This function populates the tagsList div with all unique tags
async function populateTagsList() {
    const tagsList = document.getElementById('tagsList');
    tagsList.innerHTML = ''; // Clear existing tags

    try {
        const tags = await db.getAllTags();

        tags.forEach(tagObj => {
            const tagName = tagObj.tag; // Assuming the column name is 'tag' in your database
            const tagLi = document.createElement('li');
            tagLi.textContent = tagName;
            tagLi.addEventListener('click', function() {
                loadCards(tagName, tagName);
            });
            tagsList.appendChild(tagLi);
        });
    } catch (error) {
        console.error("Error populating tags:", error);
        throw error; // If there's an error, propagate it further
    }
}

async function loadCards(filter = 'all', headerTitle = 'All Cards') {
    try {
        loadingIndicator.classList.remove('hidden'); // Show the loading indicator
        cardsHeader.textContent = headerTitle; // Update the cards header

        document.documentElement.scrollTop = 0; // Reset the scroll position to the top
        endTip.classList.add('hidden'); // Ensure the end tip is hidden by default

        let cards;
        if (filter === 'all') {
            cards = await db.getCards(0, limitItems);
        } else if (filter === 'noTag') {
            cards = await db.getNoTagCards(0, limitItems);
        } else {
            cards = await db.getCardsByTag(filter, 0, limitItems);
        }

        // Display the cards
        cardsList.innerHTML = '';  // Clear the current cards

        const fragment = document.createDocumentFragment();
        cards.forEach(card => {
            const li = createCardElementFromObject(card);
            fragment.appendChild(li);
        });

        cardsList.appendChild(fragment);

        if (cardsList.children.length > 0) {
            hideSuggestion();
        } else {
            showSuggestion();
        }

        loadingIndicator.classList.add('hidden'); // Hide the loading indicator

        // Check if there are no more cards to load and display the end tip
        if (cards.length < limitItems) {
            endTip.classList.remove('hidden'); // Show the end tip
        }
        
        // Reattach the scroll event listener
        if (cards.length === limitItems) {
            document.addEventListener('scroll', handleScroll);
        }
    } catch (error) {
        console.error("Error fetching cards:", error);
        throw error; // If there's an error, propagate it further
    }
}

function createCardElementFromObject(card) {
    const li = createCardElement();

    const timeSpan = document.createElement('span');
    const createdTate = unixTimeFormat(card.created_at);
    timeSpan.textContent = createdTate;

    li.appendChild(timeSpan);
    li.appendChild(document.createElement('br'));
    li.appendChild(document.createTextNode(card.entry));

    li.dataset.id = card.id;
    li.dataset.editing = 'false';

    addCardEventListeners(li);

    return li;
}

function handleDocumentKeydown(event) {
    const cards = Array.from(cardsList.children);
    const selectedCardIndex = cards.indexOf(selectedCard);

    if (isSideNavOpen) {
        // If the side navigation is open, prevent certain shortcuts
        if ((event.ctrlKey || event.metaKey) && (event.key === 'n' || event.key === 'k')) {
            event.preventDefault();
            return;
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            return;
        }
        if (event.key === 'Escape') {
            closeSideNav();
            event.preventDefault();
            return;
        }
    }

    if (event.key === 'ArrowDown') {
        if (!suggestionBox.classList.contains('hidden')) {
            highlightNextCard(event);
        } else {
            selectNextCard(event, cards, selectedCardIndex);
        }
    } else if (event.key === 'ArrowUp') {
        if (!suggestionBox.classList.contains('hidden')) {
            highlightPreviousCard(event);
        } else {
            selectPreviousCard(event, cards, selectedCardIndex);
        }
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        createCardInput();
        event.preventDefault();
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        showOmniSearchAndFocus();
        event.preventDefault();
    } else if (event.key === 'Enter') {
        initiateCardEditing(event);
    } else if (event.key === 'Escape') {
        if (searchBox === document.activeElement) {
            clearSearch(event);
        } else {
            deselectActiveCard(event);
        }
    }
}

function selectNextCard(event, cards, selectedCardIndex) {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
    }

    event.preventDefault();

    if (selectedCard) {
        selectedCard.classList.remove('selected');
    }

    if (selectedCardIndex === cards.length - 1 || selectedCardIndex === -1) {
        selectedCard = cards[0];
        // If the first card is selected, scroll to the top
        window.scrollTo(0, 0);
    } else {
        selectedCard = cards[selectedCardIndex + 1];
    }

    selectedCard.classList.add('selected');
    selectedCard.scrollIntoView({ block: 'nearest' });
}

function selectPreviousCard(event, cards, selectedCardIndex) {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        console.log('222');
        return;
    }
    event.preventDefault();

    if (selectedCard) {
        selectedCard.classList.remove('selected');
    }

    if (selectedCardIndex <= 0) {
        selectedCard = cards[cards.length - 1];
    } else {
        selectedCard = cards[selectedCardIndex - 1];
        // If after moving up, the first card becomes selected, scroll to the top
        if (selectedCard === cards[0]) {
            window.scrollTo(0, 0);
        }
    }

    selectedCard.classList.add('selected');

    window.scrollBy(0, -100);  // Adjust by desired offset
    selectedCard.scrollIntoView({ block: 'nearest' });
}

function initiateCardEditing(event) {
    if (selectedCard && selectedCard.dataset.editing === 'false') {
        editCard(selectedCard);
        event.preventDefault();
    }
}

function deselectActiveCard(event) {
    if (selectedCard) {
        selectedCard.classList.remove('selected');
        selectedCard = null;
    }
    event.preventDefault();
}

// Get the search box and suggestion box elements
const omniSearch = document.getElementById('omniSearch');
const searchBox = document.getElementById('searchBox');
const suggestionBox = document.getElementById('suggestionBox');
const suggestionResults = document.getElementById('suggestionResults');
const noResults = document.getElementById('noResults');
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
        suggestionResults.innerHTML = '';
        suggestionBox.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }

    // Get all cards
    const cards = getAllCards();

    // Filter the cards based on the search term
    const matchingCards = cards.filter(card => card.content.includes(searchTerm));

    // Update the suggestion box
    updateSuggestionBox(matchingCards);
}

function updateSuggestionBox(cards) {
    // Show the suggestion box
    suggestionBox.classList.remove('hidden');

    // Clear suggestion results
    suggestionResults.innerHTML = '';

    if (cards.length === 0) {
        // If there are no matching cards, show the "No matched cards" message
        noResults.classList.remove('hidden');
        suggestionResults.classList.add('hidden');
    } else {
        // If there are matching cards, hide the "No matched cards" message
        noResults.classList.add('hidden');

        // Create a div for each matching card and add it to the suggestion box
        for (let card of cards) {
            const div = document.createElement('div');
            div.textContent = card.content;
            div.dataset.id = card.id;  // Attach the card's ID

            // Mouseover event for highlighting
            div.addEventListener('mouseover', function() {
                const currentlyHighlighted = document.querySelector('#suggestionResults .highlighted');
                if (currentlyHighlighted) {
                    currentlyHighlighted.classList.remove('highlighted');
                }
                div.classList.add('highlighted');
            });

            suggestionResults.appendChild(div);

            // Auto-highlight the first card
            if (div === suggestionResults.firstChild) {
                div.classList.add('highlighted');
            }
        }
        // Show suggestion reuslts
        suggestionResults.classList.remove('hidden');
    }
}

function getAllCards() {
    let cards = [];

    // Get all cards from localStorage
    // for (let i = 0; i < localStorage.length; i++) {
    //     const key = localStorage.key(i);
    //     if (key.startsWith('card-')) {
    //         const cardJSON = localStorage.getItem(key);
    //         const card = JSON.parse(cardJSON);
    //         cards.push(card);
    //     }
    // }

    // Get all cards from sqlite
    db.getCards(0, limitItems).then(function(cards) {
        for (let card of cards) {
            cards.push(card);
        }
    });

    return cards;
}

function highlightNextCard(event) {
    if (suggestionBox.classList.contains('hidden')) {
        return;
    }

    const highlightedCard = document.querySelector('#suggestionResults .highlighted');

    if (!highlightedCard) {
        return; 
    }

    const nextCard = highlightedCard.nextElementSibling || suggestionResults.firstChild;

    if (nextCard) {
        highlightedCard.classList.remove('highlighted');
        nextCard.classList.add('highlighted');
        nextCard.scrollIntoView({block: 'nearest'});
    }

    event.preventDefault();
    event.stopPropagation();
}

function highlightPreviousCard(event) {
    if (suggestionBox.classList.contains('hidden')) {
        return;
    }

    const highlightedCard = document.querySelector('#suggestionResults .highlighted');

    if (!highlightedCard) { 
        return; 
    }

    const previousCard = highlightedCard.previousElementSibling || suggestionResults.lastChild;

    if (previousCard) {
        highlightedCard.classList.remove('highlighted');
        previousCard.classList.add('highlighted');
        previousCard.scrollIntoView({block: 'nearest'});
    }

    event.preventDefault();
    event.stopPropagation();
}

function clearSearch(event) {
    searchBox.blur();
    searchBox.value = '';
    suggestionResults.innerHTML = '';
    suggestionResults.classList.remove('hidden');
    noResults.classList.remove('hidden');
    suggestionBox.classList.add('hidden');
    omniSearch.classList.add('hidden');

    document.body.classList.remove('overflow-hidden');

    // prevent default behavior or stop propagation
    // event.preventDefault();
    // event.stopPropagation();
}

// For the Enter key
searchBox.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const highlightedSuggestion = document.querySelector('#suggestionResults .highlighted');
        if (highlightedSuggestion) {
            selectCardFromMainList(highlightedSuggestion.dataset.id);
            event.stopPropagation();
        }
    }
});

// For mouse click
suggestionResults.addEventListener('click', function(event) {
    if (event.target.dataset.id) {
        selectCardFromMainList(event.target.dataset.id);
    }
});

function selectCardFromMainList(cardId) {
    document.getElementById('allCards').click(); // Trigger the "All Cards" tab

    // Once the cards are loaded, select the desired card
    loadCards().then(() => {
        const targetCard = cardsList.querySelector(`[data-id="${cardId}"]`);

        if (targetCard) {
            // Deselect any previously selected card
            deselectCurrentCard();

            // Select the target card
            selectCard(targetCard);

            // Scroll to make sure the selected card is visible
            targetCard.scrollIntoView({ block: 'nearest' });

            // Optionally, clear the search and hide suggestions
            clearSearch();
        }

        // Hide the loading indicator
        loadingIndicator.classList.add('hidden');
    });
}

const omniSearchButton = document.getElementById('omniSearchButton');

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

const sideNav = document.getElementById('sideNav');
const sideNavButton = document.getElementById('sideNavButton');
const overlay = document.getElementById('overlay');
let isSideNavOpen = false;

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

async function loadMoreCards() {
    document.removeEventListener('scroll', handleScroll);

    const lastCall = JSON.parse(localStorage.getItem('list_call'));
    if (lastCall) {
        const { funcName, args } = lastCall;
        const offset = args[0] + limitItems; // Assuming 20 is the limit

        try {
            const newCards = await db[funcName](offset, limitItems);
            appendCards(newCards);

            // Check if there are no more cards to load and display the end tip
            if (newCards.length < limitItems) {
                endTip.classList.remove('hidden'); // Show the end tip
            }

            // Only re-add the scroll listener if the fetched cards equal the limit
            if (newCards.length === limitItems) {
                document.addEventListener('scroll', handleScroll);
            } else {
                // No more cards to load, you can show a message or handle this case
            }
        } catch (error) {
            console.error("Error loading more cards:", error);
        }
    }
}

function appendCards(cards) {
    const fragment = document.createDocumentFragment();
    cards.forEach(card => {
        const li = createCardElementFromObject(card);
        fragment.appendChild(li);
    });
    cardsList.appendChild(fragment);
}

function handleScroll(event) {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 20) { // 20 is a buffer
        loadMoreCards();
    }
}

document.addEventListener('scroll', handleScroll);