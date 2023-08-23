//all existed elements
export const sideNav = document.getElementById('sideNav')
export const sideNavButton = document.getElementById('sideNavButton')
export const overlay= document.getElementById('overlay')
export const loadingIndicator= document.getElementById('loadingIndicator')
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