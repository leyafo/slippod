//all existed elements
export const sideNav = document.getElementById('sideNav')
export const btnSideNav = document.getElementById('btnSideNav')
export const overlay= document.getElementById('overlay')
export const main = document.getElementById('main')
export const listArea = document.getElementById('listArea')
export const listHeader = document.getElementById('listHeader')
export const listTitle= document.getElementById('listTitle')
export const cardsList= document.getElementById('cardsList')
export const creationTip= document.getElementById('creationTip')
export const itemTemplate= document.getElementById("itemTemplate")
export const searchBox= document.getElementById("searchBox")
export const suggestionBox= document.getElementById("suggestionBox")
export const suggestionResults= document.getElementById("suggestionResults")
export const noResults= document.getElementById("noResults")
export const omniSearch= document.getElementById('omniSearch')
export const sideNavContainer = document.getElementById('sideNavContainer')
export const newItemContainer = document.getElementById('newItem')
export const newItemEditor = document.getElementById('newItemEditor')
export const newItemCtrlPanel = document.getElementById('newItemCtrlPanel')
export const tagList= document.getElementById("tagsList")
export const allCardsTag = document.getElementById("allCards")
export const cardsNoTag = document.getElementById("noTag")
export const cardsTrash = document.getElementById("trashCards")
export const endTip = document.getElementById("endTip")

export const limitItems= 20;
export const listInsertBeforeFirst= 1;
export const listInsertAfterLast= 2;
export const highlightUp = 1;
export const highlightDown = 2;
export const limitSugesstionItmes = 10;

export function eventHandle(selector, eventType, handle) {
    document.addEventListener(eventType, function(event) {
        if (!event.target.closest(selector)) {
            return;
        }
        handle(event);
    });
}

// this should be removed later.
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

export function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    
    if (html === '') {
        throw new Error('The HTML string is empty.');
    }
    
    template.innerHTML = html;

    if (template.content.childElementCount === 0) {
        throw new Error('The HTML string does not contain any HTML elements.');
    }

    return template.content.firstChild;
}

export function hideTrialBar() {
    const trialBar = document.getElementById('trialBar');

    if (trialBar) {
        trialBar.remove();
    }
}

export function selectSiblingElement(element, className) {
    const parent = element.parentElement;
    const sibling = parent.querySelector(className);
    return sibling;
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

export function setScrollbarToTop(){
    document.documentElement.scrollTop = 0; // Reset the scroll position to the top
}

//这里如果从第一个跳到最后一个时，会出现跳转到中间的错觉。
//实际上根据分页的机制，如果第一次加载的是[60...49]，当从60向上滚动时会跳动49。
//然后代码会检测当前已经跳到了底部，会加载[48...19] 的数据，看起来就会像是滚动到了中间。
export function highlightUpOrDownItem(arrowDirection, highlightedClass, parentElement) {
    const selector = `.${highlightedClass}`
    let highLightedItem = parentElement.querySelector(selector)
    if(!highLightedItem){
        parentElement.firstChild.classList.add(highlightedClass);
        return
    }
    if(arrowDirection == highlightUp){
        highLightedItem = highLightedItem.previousElementSibling || parentElement.lastChild 
    }else if(arrowDirection === highlightDown){
        highLightedItem = highLightedItem.nextElementSibling || parentElement.firstChild 
    }
    highLightedItemWithScrolling(highlightedClass, highLightedItem, parentElement)
    return highLightedItem
}

export function highLightedItemWithScrolling(highlightedClass, item, parentElement){
    highlightItem(highlightedClass, item, parentElement);
    if(item == parentElement.firstChild){
        setScrollbarToTop()
    }else{
        item.scrollIntoView({block: "nearest" });
    }
}

export function highlightItem( highlightedClass, item, parentElement) {
    unHighlightItem(highlightedClass, parentElement);
    item.classList.add(highlightedClass);
}

export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
        rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
        rect.bottom > 0 &&
        rect.right > 0
    );
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

    if (timeDifference < 30) {
        return `just now`;
    }
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
    const markdownHtml = document.createElement('div');

    markdownHtml.classList.add('markdown-body');

    utils.markdownRender(card.entry).then(function(html) {
        markdownHtml.innerHTML = html;

        content.innerHTML = '';
        content.appendChild(markdownHtml);
    })

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

export function deleteCard(li) {
    const cardID = li.dataset.id
    if(li.dataset.is_trash) {
        db.removeCardPermanently(li.dataset.trash_id).then(function(){
            cardsList.removeChild(li);
        })
    } else {
        db.moveCardToTrash(cardID).then(function() {
            cardsList.removeChild(li);

            db.getAllTags().then(function(tags){
                let tree = buildTagTree(tags)
                let tagListHTML = buildTagHtml(tree)
                CM.tagList.innerHTML = tagListHTML
            })
        })
    }
}

export function getHighlightedCardItem(){
    const highlightedLi = cardsList.querySelector("li.selected")
    return highlightedLi
}

export function getSuffix(str, ...prefixes){
    for(let prefix of prefixes){
        if(str.indexOf(prefix) != 0){
            continue;
        }
        return str.slice(prefix.length)
    }
    return ""
}

export function linkClick(event){
    // If the clicked element is not an <a>, ignore
    if (event.target.tagName !== 'A') {
        return;
    }
    const href = event.target.getAttribute('href');

    const cardID = getSuffix(href, "/links/")
    if (cardID === ""){
        return;
    }
    event.preventDefault();
    db.cardIsExisted(cardID).then(function(isExisted){
        if (isExisted){
            pages.showCardDetail(cardID);
        }
    });
} 

eventHandle('a[href^="http"]', 'click', function(event){
    event.preventDefault();
    const href = event.target.href
    console.log(href);
    utils.openExternalURL(href);
})

window.testHotKey = function() {
}
