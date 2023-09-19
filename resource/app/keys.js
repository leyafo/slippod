import * as CM from "./common.js";
import * as UI from "./ui.js";

//全局快捷键盘
document.addEventListener("keydown", function (event) {
    if(!globalState.isViewing()){
        return
    }

    if (event.key == "k" && event.ctrlKey) {
        globalState.setSearching();
        CM.showOmniSearchAndFocus();
        CM.searchBox.focus();
        event.preventDefault();
        return
    }
    if (event.key === "ArrowUp" || (event.key === "p" && event.ctrlKey) ){
        CM.highlightUpOrDownItem(CM.highlightUp, "selected", CM.cardsList)
        event.preventDefault();
        return
    }else if (event.key === "ArrowDown" || (event.key === "n" && event.ctrlKey)){
        CM.highlightUpOrDownItem(CM.highlightDown, "selected", CM.cardsList)
        event.preventDefault();
        return
    }else if (event.key === "o" && event.ctrlKey){
        UI.activateNewItemEditor('')
    }else if (event.key === "Escape"){
        CM.unHighlightItem("selected", CM.cardsList);
    }
});

//搜索框快捷键
CM.searchBox.addEventListener("keydown", function (event) {
    if (!globalState.isSearching()){
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
        if (event.ctrlKey && event.key === "Enter") {  
            eventMap.commit(cm, event)
            globalState.setViewing();
        }else if(event.key == 'Escape'){
            eventMap.cancel(cm, event)
            globalState.setViewing();
        }
    });
})