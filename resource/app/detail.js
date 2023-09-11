
import {linkClick, fillingCardItem } from "./common";

const cardTemplate = document.getElementById('cardTemplate')
const mainCardArea = document.getElementById('mainCardArea')
const linkedCards = document.getElementById('linkedCards')
const linkedCardsCount = document.getElementById('linkedCardsCount')
const headerBarTitle = document.getElementById('headerBarTitle')

document.addEventListener('click', linkClick) 

function displayCard(card, parentElement) {
    const cardItem = cardTemplate.content.cloneNode(true); 
    fillingCardItem(cardItem, card);
    
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
        if (cardDetail.references.length > 0) {
            const metaInfo = cardItem.querySelector('.itemMetaInfo')
            let span = document.createElement('span');

            let noteText = cardDetail.references.length === 1 ? 'Linked Note' : 'Linked Notes';
            span.textContent = ` · ${cardDetail.references.length} ${noteText}`;
            linkedCardsCount.textContent = `${cardDetail.references.length} ${noteText}`;

            metaInfo.appendChild(span);
        }
        // document.body.appendChild(cardItem);
        for(let refCard of cardDetail.references) {
            displayCard(refCard, linkedCards);
        }
    })
})