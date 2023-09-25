import * as CM from './common.js';

const cardTemplate = document.getElementById('cardTemplate')
const mainCardArea = document.getElementById('mainCardArea')
const linkedCards = document.getElementById('linkedCards')
const backlinksCards = document.getElementById('backlinksCards')
const outgoingLinksCards = document.getElementById('outgoingLinksCards')
const linkedCardsTab = document.getElementById('linkedCardsTab')
const backlinkTab = document.getElementById('backlinkTab')
const outgoingLinkTab = document.getElementById('outgoingLinkTab')
const headerBarTitle = document.getElementById('headerBarTitle')

document.addEventListener('click', CM.linkClick) 

function displayCard(card, parentElement) {
    const cardItem = cardTemplate.content.cloneNode(true); 
    CM.fillingCardItem(cardItem, card);
    
    // Append the cardItem fragment to the body
    parentElement.appendChild(cardItem);

    // Return the actual displayed node (assuming it's the last child of the body after appending)
    return parentElement.lastElementChild;
}

window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('cardID');

    headerBarTitle.textContent = `Note @${id} Details`;

    db.getCardDetails(id).then(function(cardDetail) {
        window.cardDetail = cardDetail;
        const cardItem = displayCard(cardDetail.card, mainCardArea);

        if (cardItem) {
            let backlinkTabLabel = backlinkTab.querySelector('.label');
            backlinkTabLabel.textContent = `Backlinks(${cardDetail.referencesBy.length})`;

            // select backlinkTab by default
            backlinkTab.classList.add('selected');

            let outgoingLinkTabLabel = outgoingLinkTab.querySelector('.label');
            outgoingLinkTabLabel.textContent = `Outgoinglinks(${cardDetail.references.length})`;

            CM.toggleElementShown(linkedCardsTab);
        }
        
        if (cardDetail.referencesBy.length > 0) {
            for(let refCard of cardDetail.referencesBy) {
                // displayCard(refCard, linkedCards);
                displayCard(refCard, backlinksCards);
            }
        } else {
            let noBacklinkMessage = document.createElement('div');
            noBacklinkMessage.classList.add('noLinkMessage');
            noBacklinkMessage.textContent = "No backlinks";
            backlinksCards.appendChild(noBacklinkMessage);
        }
        if (cardDetail.references.length > 0) {
            for(let refCard of cardDetail.references) {
                displayCard(refCard, outgoingLinksCards);
            }
        } else {
            let noOutgoingLinkMessage = document.createElement('div');
            noOutgoingLinkMessage.classList.add('noLinkMessage');
            noOutgoingLinkMessage.textContent = "No outgoing links";
            outgoingLinksCards.appendChild(noOutgoingLinkMessage);
        }
    })
})

CM.clickHandle("#backlinkTab", function() {
    backlinkTab.classList.add('selected');
    outgoingLinkTab.classList.remove('selected');

    backlinksCards.classList.remove('hidden');
    outgoingLinksCards.classList.add('hidden');
});

CM.clickHandle("#outgoingLinkTab", function() {
    outgoingLinkTab.classList.add('selected');
    backlinkTab.classList.remove('selected');

    outgoingLinksCards.classList.remove('hidden');
    backlinksCards.classList.add('hidden');
});
