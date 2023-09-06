
import {linkClick, fillingCardItem } from "./common";

const cardTemplate = document.getElementById('cardTemplate')

document.addEventListener('click', linkClick) 

function displayCard(card){
    const cardItem = cardTemplate.content.cloneNode(true); 
    fillingCardItem(cardItem, card);
    
    // Append the cardItem fragment to the body
    document.body.appendChild(cardItem);

    // Return the actual displayed node (assuming it's the last child of the body after appending)
    return document.body.lastElementChild;
}

window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('cardID');
    db.getCardDetails(id).then(function(cardDetail){
        window.cardDetail = cardDetail;
        const cardItem = displayCard(cardDetail.card)
        if (cardDetail.references.length > 0){
            const metaInfo = cardItem.querySelector('.itemMetaInfo')
            let span = document.createElement('span');
            span.textContent= `${cardDetail.references.length} Linked Note`
            span.className
            metaInfo.appendChild(span);
        }
        // document.body.appendChild(cardItem);
        for(let refCard of cardDetail.references){
            displayCard(refCard)
        }
    })
})