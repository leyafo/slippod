import * as CM from "./common.js";
import * as UI from "./ui.js";

//全局快捷键盘
document.addEventListener("keydown", function (event) {
    //编辑状态下不捕获全局快捷键
    if (CM.cardsList.querySelector("[data-editing='true']") !== null){
        return
    }
    //input 状态下不捕获全局快捷键
    if(document.activeElement === CM.searchBox){
        return
    }

    if (event.key == "k" && event.ctrlKey) {
        CM.showOmniSearchAndFocus();
        CM.searchBox.focus();
        event.preventDefault();
        return
    }
    if (event.key === "ArrowUp" || (event.key == "p" && event.ctrlKey)){
        CM.highlightItem(CM.highlightUp, "selected", CM.cardsList)
        event.preventDefault();
        return
    }else if (event.key === "ArrowDown" || (event.key == "n" && event.ctrlKey)){
        CM.highlightItem(CM.highlightDown, "selected", CM.cardsList)
        event.preventDefault();
        return
    }else if (event.key === "Escape"){
        CM.UnHighlightItem("selected", CM.cardsList);
    }
});

//搜索框快捷键
CM.searchBox.addEventListener("keydown", function (event) {
    if (CM.suggestionBox.classList.contains("hidden")) {
        return;
    }

    if (event.key === "ArrowDown") {
        CM.highlightItem(CM.highlightDown, "highlighted", CM.suggestionResults)
        event.preventDefault();
    } else if (event.key === "ArrowUp") {
        CM.highlightItem(CM.highlightUp, "highlighted", CM.suggestionResults)
        event.preventDefault();
    } else if (event.key === "Enter") {
        if (event.ctrlKey) {
            event.stopPropagation();
            return;
        }

        const highlightedSuggestion = document.querySelector(
            "#suggestionResults .highlighted"
        );
        if (highlightedSuggestion) {
            console.log(highlightedSuggestion.dataset.id);
            UI.handleOptionSelect(highlightedSuggestion.dataset.id);
            UI.clearSearch(event);
            event.stopPropagation();
        }
    } else if (event.key == "n" && event.ctrlKey) {
        const searchTerm = CM.searchBox.value;
        db.createNewCard(searchTerm).then((newCardID) => {
            db.getCardByID(newCardID).then((card) => {
                const li = UI.insertCardToList(card, CM.listInsertBeforeFirst);
                UI.editCard(li);
                UI.clearSearch(event);
            });
        });
        UI.clearSearch(event);
        event.stopPropagation();
    } else if (event.key == "Escape") {
        UI.clearSearch(event);
    }
});