import * as CM from "./common.js";
import * as UI from "./ui.js";

//全局快捷键盘
document.addEventListener("keydown", function (event) {
    if (event.key == "k" && event.ctrlKey) {
        //check the editing status
        if (CM.cardsList.querySelector("[data-editing='true']") !== null){
            return
        }
        CM.showOmniSearchAndFocus();
        CM.searchBox.focus();
        event.preventDefault();
    }
});

//搜索框快捷键
CM.searchBox.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown") {
        UI.highlightNote(event, CM.highlightDown);
    } else if (event.key === "ArrowUp") {
        UI.highlightNote(event, CM.highlightUp);
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
