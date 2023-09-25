import * as CM from "./common.js";
import * as UI from "./ui.js";

function startingSearch(){
    globalState.setSearching();
    CM.showOmniSearchAndFocus();
    CM.searchBox.focus();
}

function ctrlCmdKey(event){
    switch (window.platform){
    case "darwin":
        return event.metaKey
    default:
        return event.ctrlKey
    }
}

//全局快捷键盘
document.addEventListener("keydown", function (event) {
    if(!globalState.isViewing()){
        return
    }

    if (event.key == "k" && ctrlCmdKey(event)) {
        startingSearch()
        event.preventDefault();
        return
    }

    if (event.key === "ArrowUp" || (event.key === "p" && event.ctrlKey) ){ //ctrl-p
        if (CM.cardsList.querySelectorAll("li").length > 0) {
            CM.highlightUpOrDownItem(CM.highlightUp, "selected", CM.cardsList)
            event.preventDefault();
            return
        }
    }else if (event.key === "ArrowDown" || (event.key === "n" && event.ctrlKey)){ //ctrl-n
        if (CM.cardsList.querySelectorAll("li").length > 0) {
            CM.highlightUpOrDownItem(CM.highlightDown, "selected", CM.cardsList)
            event.preventDefault();
            return
        }
    }else if (event.key === "o" && ctrlCmdKey(event)){
        UI.activateNewItemEditor('')
    }else if (event.key === "Escape"){
        CM.unHighlightItem("selected", CM.cardsList);
    } else if (event.key === "d" && ctrlCmdKey(event)){
        const li = CM.getHighlightedCardItem()
        CM.deleteCard(li);
    }else if (event.key === "Enter"){
        const li = CM.getHighlightedCardItem()
        UI.editCard(li);
        globalState.setEditing();
    }
});

//搜索框快捷键
CM.searchBox.addEventListener("keydown", function (event) {
    if (!globalState.isSearching()){
        return
    }

    if (event.key == "k" && event.ctrlKey) {
        startingSearch()
        event.preventDefault();
        return
    }

    if (event.key === "ArrowDown" || (event.key == "n" && event.ctrlKey)) {
        CM.highlightUpOrDownItem(CM.highlightDown, "highlighted", CM.suggestionResults)
        event.preventDefault();
    } else if (event.key === "ArrowUp" || (event.key == "p" && event.ctrlKey)) {
        CM.highlightUpOrDownItem(CM.highlightUp, "highlighted", CM.suggestionResults)
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
            UI.handleOptionSelect(highlightedSuggestion.dataset.id);
            UI.clearSearch(event);
            globalState.setViewing();
        }else{
            const input = CM.searchBox.value
            UI.activateNewItemEditor(input);
            globalState.setEditing();
        }
        event.stopPropagation();
    } else if (event.key == "Escape") {
        UI.clearSearch(event);
        globalState.setViewing();
    }
    return
});


//编辑器功能快捷键，内部文字操作快捷键在单独的快捷键定义里。
CodeMirror.defineExtension("keydownMap", function(eventMap){
    return this.on('keydown', function (cm, event) {
        if (!globalState.isEditing()){
            return
        }
        if (ctrlCmdKey(event) && event.key === "Enter") {  
            eventMap.commit(cm, event)
            globalState.setViewing();
        }else if(event.key == 'Escape'){
            eventMap.cancel(cm, event)
            globalState.setViewing();
        }else if(ctrlCmdKey(event) && event.key === "s"){
            eventMap.save(cm, event)
        }
    });
})