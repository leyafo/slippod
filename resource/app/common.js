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
export const tagList= document.getElementById("tagsList")
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

export function highlightItem( highlightedClass,item, parentElement){
    item.classList.add(highlightedClass)
    unHighlightItem(highlightedClass, parentElement)
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
