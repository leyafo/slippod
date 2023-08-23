import * as CM from "./common.js"

//全局快捷键盘
document.addEventListener('keydown', function(event) {
    if (event.key == "k" &&event.ctrlKey){
        showOmniSearchAndFocus();
        CM.searchBox.focus();
        event.preventDefault();
    }
});

//搜索框快捷键
CM.searchBox.addEventListener("keydown", function (event) {
  if (event.key === "ArrowDown") {
    highlightNote(event, CM.highlightDown);
  } else if (event.key === "ArrowUp") {
    highlightNote(event, CM.highlightUp);
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
        handleOptionSelect(highlightedSuggestion.dataset.id);
        clearSearch(event);
        event.stopPropagation();
    }
  }else if (event.key == "n" && event.ctrlKey){
        const searchTerm = CM.searchBox.value;
        db.createNewCard(searchTerm).then((newCardID) => {
            db.getCardByID(newCardID).then((card) => {
                const li = insertCardToList(card, CM.listInsertBeforeFirst);
                editCard(li);
                clearSearch(event);
            });
        });
        clearSearch(event);
        event.stopPropagation();
  } else if (event.key == "Escape") {
        clearSearch(event);
  }
});