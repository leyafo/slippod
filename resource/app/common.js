import * as marked from "marked";

//all existed elements
export const sideNav = document.getElementById('sideNav')
export const btnSideNav = document.getElementById('btnSideNav')
export const overlay= document.getElementById('overlay')
export const cardsHeader= document.getElementById('cardsHeader')
export const cardsList= document.getElementById('cardsList')
export const creationTip= document.getElementById('creationTip')
export const itemTemplate= document.getElementById("itemTemplate")
export const searchBox= document.getElementById("searchBox")
export const suggestionBox= document.getElementById("suggestionBox")
export const suggestionResults= document.getElementById("suggestionResults")
export const noResults= document.getElementById("noResults")
export const omniSearch= document.getElementById('omniSearch')
export const sideNavContainer = document.getElementById('sideNavContainer')
export const tagList= document.getElementById("tagsList")
export const allCardsTag = document.getElementById("allCards")
export const limitItems= 20
export const listInsertBeforeFirst= 1
export const listInsertAfterLast= 2
export const highlightUp = 1
export const highlightDown = 2

export function clickHandle(selector, handle) {
    document.addEventListener("click", function(event) {
        if (!event.target.closest(selector)) {
            return;
        }
        handle(event);
    });
}

export function toggleElementShown(element) {
    element.classList.remove('hidden');
}

export function toggleElementHidden(element){
    element.classList.add('hidden')
}

export function unixTimeFormat(unixTime) {
    const d = new Date(unixTime * 1000);
    let minute = d.getMinutes();
    minute = minute < 10 ? '0'+ minute : minute; 
    let second = d.getSeconds()
    second = second < 10 ? '0'+second : second;
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getUTCDate()} ${d.getHours()}:${minute}:${second}`;
}
export function hideOmniSearchAndUnfocus() {
    toggleElementHidden(omniSearch)
    searchBox.blur();
    document.body.classList.remove('overflow-hidden');
}

export function showOmniSearchAndFocus() {
    toggleElementShown(omniSearch)
    searchBox.focus();
    document.body.classList.add('overflow-hidden');
}

export function highlightUpOrDownItem(arrowDirection, highlightedClass, parentElement){
    const selector = `.${highlightedClass}`
    let highLightedItem = parentElement.querySelector(selector)
    if(!highLightedItem){
        parentElement.firstChild.classList.add(highlightedClass);
        return
    }
    highLightedItem.classList.remove(highlightedClass)
    if(arrowDirection == highlightUp){
        highLightedItem = highLightedItem.previousElementSibling || parentElement.lastChild 
    }else if(arrowDirection === highlightDown){
        highLightedItem = highLightedItem.nextElementSibling || parentElement.firstChild 
    }
    highLightedItem.classList.add(highlightedClass)
    highLightedItem.scrollIntoView({ block: "nearest" });
    return highLightedItem
}

export function highlightItem( highlightedClass, item, parentElement) {
    unHighlightItem(highlightedClass, parentElement)
    item.classList.add(highlightedClass)
}

export function unHighlightItem(highlightedClass, parentElement){
    const items = parentElement.querySelectorAll(`.${highlightedClass}`)
    for(let item of items){
        item.classList.remove(highlightedClass)
    }
}

export function timeAgo(unixTimestamp) {
    const currentTime = Math.floor(Date.now() / 1000); // Convert to Unix timestamp
    const timeDifference = currentTime - unixTimestamp;

    if (timeDifference < 60) {
        return `${timeDifference} seconds ago`;
    }

    const minutes = Math.floor(timeDifference / 60);
    if (minutes < 60) {
        return `${minutes} minutes ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hours ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        return `${days} days ago`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return `${months} months ago`;
    }

    const years = Math.floor(days / 365);
    return `${years} years ago`;
}

export function fillingCardItem(parentItem, card){
    const content = parentItem.querySelector(".content");
    content.innerHTML = marked.parse(card.entry);

    const createTimeSapn = parentItem.querySelector("span.itemCreateTime");
    const createdTime = unixTimeFormat(card.created_at);
    createTimeSapn.textContent = createdTime;

    const idSpan = parentItem.querySelector("span.itemId");
    const aElement = document.createElement('a');
    aElement.textContent = "@" + card.id;
    aElement.setAttribute('href', `/links/${card.id}`);
    aElement.className = "cm-linkref"
    idSpan.appendChild(aElement);

    const updateTimeSpan = parentItem.querySelector("span.itemUpdateTime");
    updateTimeSpan.textContent = "Updated: "+ timeAgo(card.updated_at);
}

export function linkClick(event){
    // If the clicked element is not an <a>, ignore
    if (event.target.tagName !== 'A') {
        return;
    }
    const href = event.target.getAttribute('href');
    if (href.indexOf('/links/') != 0 && href.indexOf('/links/') != 0){
        return
    }
    // Prevent the default action
    event.preventDefault();
    const regex = /^\/links\/(\d+)$/;
    const match = href.match(regex);
    if (match && match[1]) {
        const cardID = match[1];
        pages.showCardDetail(cardID);
    }
} 


export function markedConfig(){
    const renderer = new marked.Renderer();
    renderer.text = function (text) {
        text = text.replace(window.tagRegex, '<a href="/tags/$1" class="cm-hashtag">#$1</a>');
        return text.replace(window.linkAtRegex, '<a href="/links/$1" class="cm-linkref">@$1</a>');
    };
    marked.setOptions({ renderer });

    marked.use({
        mangle: false,
        headerIds: false
    });
}
