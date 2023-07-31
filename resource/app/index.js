import * as marked from "marked";
import Alpine from 'alpinejs'

function unixTimeFormat(unixTime) {
    const d = new Date(unixTime * 1000);
    let minute = d.getMinutes();
    minute = minute < 10 ? '0'+minute:minute; 
    let second = d.getSeconds()
    second = second < 10 ? '0'+second:second;
    return `${d.getFullYear()}-${
      d.getMonth() + 1
    }-${d.getUTCDate()} ${d.getHours()}:${minute}:${second}`;
}

function clickHandle(selector, handle) {
    document.addEventListener("click", function(event) {
        if (!event.target.closest(selector)) {
            return;
        }
        handle(event);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    window.Alpine = Alpine
    Alpine.start()

    marked.use({
        mangle: false,
        headerIds: false
    });

    let longTextInput = document.getElementById("longTextInput");
    const listView = document.getElementById("listView");
    const editorView = document.getElementById("editor-view");
    const cardDetailContainer = document.getElementById("card-detail-container");
    const listInsertFirst = 1;
    const listInsertLast = 2;
    const limitItems = 20;
    const updatingCardsContainer = new Map();

    // let editor = CodeMirror.fromTextArea(longTextInput, {
    //     theme: "default",
    //     mode: "markdown",
    //     keyMap: "emacs",
    //     pollInterval: 1000,
    //     lineWrapping: true,
    // });
    // editor.refresh();
    // editor.setSize("100%", "90%");

    // editor.on("change", function(cm, obj) {
    //     const cardID = cardDetailContainer.getAttribute("card-id");
    //     updatingCardsContainer.set(cardID, editor.getValue());
    // });
    setInterval(() => {
        updatingCardsContainer.forEach(function(entry, cardID, map){
            db.editCardByID(cardID, entry).then(function(cardID){
                db.getCardByID(cardID).then(function(card){
                    const editingID = cardDetailContainer.getAttribute("card-id");
                    if(editingID == cardID){
                        displayUpdatedAtTime(card.updated_at);
                    }
                    const listItem = document.getElementById(`list-item-${cardID}`);
                    listItem.querySelector(".content").innerHTML = marked.parse(card.entry);
                    updatingCardsContainer.delete(cardID);
                })
            })
        })
    }, 5000);//saving cards for 5s

    function insertCard(card, order) {
        const template = document.getElementById("listItemTemplate");
        const listItem = template.content.cloneNode(true);
        const content = listItem.querySelector(".content");
        content.innerHTML = marked.parse(card.entry);

        const topRow = listItem.querySelector(".top-row");
        const idSpan = listItem.querySelector(".card-id");
        idSpan.textContent = card.id;
        //没法直接设置属性
        listItem.querySelector(".list-item").setAttribute("card-id", card.id);
        listItem
            .querySelector(".list-item")
            .setAttribute("id", `list-item-${card.id}`);

        let cardCreatedAt = topRow.querySelector("span.card-created-at");
        cardCreatedAt.textContent =
            "Created At: " + unixTimeFormat(card.created_at);
        let cardUpdatedAt = topRow.querySelector("span.card-updated-at");
        cardUpdatedAt.textContent =
            "Updated At: " + unixTimeFormat(card.updated_at);

        // const menuBtn = topRow.querySelector("button.card-menu-button");
        // menuBtn.setAttribute("data-dropdown-toggle", `card-${card.id}-menu`)
        // menuBtn.setAttribute("id", `card-${card.id}-menu-button`)
        // topRow.querySelector("div.card-menu").setAttribute("id", `card-${card.id}-menu`)

        if (order == listInsertLast) {
            listView.insertBefore(listItem, listView.firstChild);
        } else if (order == listInsertFirst) {
            listView.insertBefore(listItem, null);
        }
    }

    //load cards
    (async () => {
        db.getCards(0, limitItems).then(function(cards) {
            for (let card of cards) {
                insertCard(card, listInsertFirst);
            }
        });
    })();

    clickHandle(".a-tag", function(event) {
        const element = event.target.closest(`a`);
        const href = element.getAttribute("href");
        //这里要小心，可能会把其他的link时间覆盖掉
        if (href.indexOf("/tag/") != 0 && href.indexOf("/tags/") != 0) {
            return;
        }
        event.preventDefault();
        const tag = element.getAttribute("tag");
        if (tag == "#") {
            utils.reloadAll();
        } else {
            db.getCardsByTag(tag, 0, limitItems).then(function(cards) {
                listView.innerHTML = "";
                for (let card of cards) {
                    insertCard(card, listInsertFirst);
                }
            });
        }
    });

    clickHandle("div.CodeMirror span.cm-link", function(event){
        let linkContent = event.target.textContent;
        const cardID = linkContent.replace(/\[|\]/gm, "");
        db.cardIsExisted(cardID).then(function(r){
            if (r != undefined) {
                highlightListItem(cardID);
                // showCardInEditor(r.id);
            }
        });
    });

    //list-item event listener
    let lastHighLightItem = 0;
    function highlightListItem(cardID){
        if(lastHighLightItem != 0){
            document.getElementById(`list-item-${lastHighLightItem}`).classList.remove('hl-list-item');
        }
        document.getElementById(`list-item-${cardID}`).classList.add('hl-list-item');
        lastHighLightItem = cardID;
    }

    // clickHandle(".list-item", function(event) {
    //     const listItem = event.target.closest(".list-item");
    //     const cardID = listItem.getAttribute("card-id");
    //     console.log(cardID);
    //     highlightListItem(cardID);
    //     // showCardInEditor(cardID);
    // });

    function displayCreatedAtTime(createAt){
        let cardCreatedAt = editorView.querySelector("span.card-created-at");
        cardCreatedAt.textContent =
            "Created At: " + unixTimeFormat(createAt);
    }

    function displayUpdatedAtTime(updateAt){
        let cardUpdatedAt = editorView.querySelector("span.card-updated-at");
        cardUpdatedAt.textContent =
            "Updated At: " + unixTimeFormat(updateAt);
    }

    // function showCardInEditor(cardID) {
    //     if (editorView.classList.contains("hidden")) {
    //         editorView.remove("hidden");
    //     }
    //     db.getCardDetails(cardID).then(function(cardDetails) {
    //         console.log(cardDetails.referencesBy);
    //         cardDetailContainer.setAttribute("card-id", cardID);
    //         //缓存里面有数据就直接读缓存里面的
    //         let entry = updatingCardsContainer.get(cardID);
    //         if(entry == undefined){//没有就去读数据库里的
    //             entry = cardDetails.card.entry
    //         }
    //         editor.setValue(entry);
    //         editor.setCursor(entry.length);
    //         editor.focus();
    //         let spanID = editorView.querySelector("span.card-id");
    //         spanID.textContent = cardID;
    //         displayCreatedAtTime(cardDetails.card.created_at);
    //         displayUpdatedAtTime(cardDetails.card.updated_at);
    //     });
    // }

    const searchContainer = document.querySelector(".search-container");
    const searchInput = searchContainer.querySelector('input[type="text"]');

    function displaySearchResult(cards) {
        // if(cards.length > 0){
        listView.innerHTML = "";
        for (const card of cards) {
            insertCard(card, listInsertFirst);
        }
        // }
    }

    searchInput.addEventListener("keyup", (event) => {
        const searchTerm = searchInput.value;
        if (event.key == "Enter") {
            if (searchTerm.length == 0) {
                utils.reloadAll();
                return;
            }
            db.createNewCard(searchTerm).then((newCardID) => {
                db.getCardByID(newCardID).then((card) => {
                    insertCard(card, listInsertLast);
                    searchInput.value = "";
                    searchInput.blur();
                    // showCardInEditor(card.id);
                });
            });
        } else if (event.key == "Escape") {
            searchInput.blur();
            utils.reloadAll();
        } else if (event.key == "n" && event.ctrlKey) {
            console.log("test");
        } else {
            if (searchTerm.length > 0) {
                db.searchCards(searchTerm, 0, limitItems).then(function(cards) {
                    displaySearchResult(cards);
                });
            }
        }
    });
    window.addEventListener("keydown", function(event) {
        if (event.key == "F3") {
            event.preventDefault();
            searchInput.focus();
        }
    });

    let listHasGetLastItem = 0;
    document.querySelector(".list-container").onscroll = function(ev) {
        const listContainer = ev.target;
        const totalHeight = listContainer.scrollHeight - listContainer.offsetHeight;
        if (totalHeight - listContainer.scrollTop < 2) {
            let lastCallList = JSON.parse(localStorage.getItem("list_call"));
            let fn = db[lastCallList.funcName];
            let args = lastCallList.args;
            const offsetArgsIndex = args.length - 2;
            if (args[offsetArgsIndex] == 0) {
                listHasGetLastItem = 0;
            }
            if (listHasGetLastItem == 1) {
                return;
            }
            args[offsetArgsIndex] += limitItems;
            fn(...args).then(function(cards) {
                for (let card of cards) {
                    insertCard(card, listInsertFirst);
                }
                if (cards.length < limitItems) {
                    listHasGetLastItem = 1;
                }
            });
        }
    };
});