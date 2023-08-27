//all existed elements
export const sideNav = document.getElementById('sideNav')
export const sideNavButton = document.getElementById('sideNavButton')
export const overlay= document.getElementById('overlay')
export const cardsHeader= document.getElementById('cardsHeader')
export const cardsList= document.getElementById('cardsList')
export const creationTip= document.getElementById('creationTip')
export const cardItemTemplate= document.getElementById("cardItemTemplate")
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

export function highlightItem(arrowDirection, highlightedClass, parentElement){
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

export function UnHighlightItem(highlightedClass, parentElement){
    const items = parentElement.querySelectorAll(`.${highlightedClass}`)
    for(let item of items){
        item.classList.remove(highlightedClass)
    }
}