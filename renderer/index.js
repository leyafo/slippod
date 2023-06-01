import * as marked from 'marked';

String.prototype.isEmpty = function() {
    // This doesn't work the same way as the isEmpty function used 
    // in the first example, it will return true for strings containing only whitespace
    return (this.length === 0 || !this.trim());
};


function clickHandle(selector, handle){
  document.addEventListener("click", function(event){
    if(!event.target.closest(selector)){
      return
    }
    handle(event)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  // Now, you can create a CodeMirror instance linked to a text area:
  marked.use({
    mangle: false, 
    headerIds: false,
  });
  const longTextInput = document.getElementById('longTextInput');
  const listView = document.getElementById('listView');
  const cardView = document.getElementById('card-view');
  const editorViewPanel = document.getElementById('editor-view');
  const cardDetailContainer = document.getElementById('card-detail-container');
  const orderBeforeLast = 1;
  const orderBeforeFirst = 2;
  const needUpdateList = true;

  function insertCard(card, order) {
    const template = document.getElementById("listItemTemplate");
    const listItem = template.content.cloneNode(true);
    const content = listItem.querySelector(".content");
    content.innerHTML = marked.parse(card.entry);

    const idSpan = listItem.querySelector(
      ".card-id"
    )
    idSpan.textContent = card.id;
    //没法直接设置属性
    listItem.querySelector(".list-item").setAttribute("card-id", card.id);
    listItem.querySelector(".list-item").setAttribute("id", `list-item-${card.id}`);

    if (order == orderBeforeFirst) {
      listView.insertBefore(listItem, listView.firstChild);
    } else if (order == orderBeforeLast) {
      listView.insertBefore(listItem, listView.lastChild);
    }
  }


  //load cards
  (async ()=>{
    db.getCards(0, 20).then(function(cards){
      for(let card of cards){
        insertCard(card, orderBeforeLast);
      }
    });

    db.getAllTags().then(function (tags){
      const tagsContainer = document.querySelector(".tags-container");
      for(let tag of tags){
        let child = document.createElement('a');
        child.setAttribute('class', 'text-blue-600 visited:text-purple-600 a-tag');
        child.textContent = tag.tag;
        child.setAttribute('href', `/tag/${tag.tag}`);
        child.setAttribute('tag', tag.tag);
        tagsContainer.insertBefore(child, tagsContainer.lastChild);
      }
    })
  })();

  clickHandle(".a-tag", function(event){
    const element = event.target.closest(`a`);
    const href =element.getAttribute('href'); 
    //这里要小心，可能会把其他的link时间覆盖掉
    if (href.indexOf('/tag/') != 0 && href.indexOf('/tags/') != 0){
      return
    }
    event.preventDefault();
    const tag = element.getAttribute("tag");
    if(tag == '#'){
      utils.reloadAll();
    }else{
      db.getCardsByTag(tag, 0, 10000).then(function(cards){
        listView.innerHTML = '';
        for (let card of cards) {
          insertCard(card, orderBeforeLast);
        }
      });
    }

  });

  //list-items envents listener
  clickHandle(".list-item", function(event){
    const listItem = event.target.closest(".list-item");
    const cardID = listItem.getAttribute("card-id");
    cardDetailContainer.setAttribute("card-id", cardID);
    showCard(cardID);
  });

  clickHandle(".edit-btn", function(event){
    const cardID = cardDetailContainer.getAttribute("card-id")
    showEditor(cardID);
  });

  clickHandle(".delete-btn", function(event){
    const cardID = cardDetailContainer.getAttribute("card-id")
    const ensure = confirm(`Do you really want to remove this card: ${cardID}?`)
    if (ensure){
      db.deleteCardByID(cardID).then(function(){
        document.getElementById(`list-item-${cardID}`).remove();
        hiddenCardPanel(cardID);
      })
    }
  });

  function showEditor(cardID){
    cardView.classList.add("hidden");
    editorViewPanel.classList.remove("hidden");
    db.getCardByID(cardID).then(function(card){
      longTextInput.value = card.entry;
      longTextInput.focus();
    });
  }
  function showCard(cardID, isNeedUpdateList){
    db.getCardDetails(cardID).then(function(cardDetails){
      let mdView = cardView.querySelector(".markdown-body")
      const mdContentHTML = marked.parse(cardDetails.card.entry);
      mdView.innerHTML = mdContentHTML;
      cardView.classList.remove("hidden")
      editorViewPanel.classList.add("hidden");

      let refView = cardView.querySelector(".card-references")
      refView.innerHTML = '';

      let refByView = cardView.querySelector(".card-references-by")
      refByView.innerHTML = '';

      if (isNeedUpdateList==needUpdateList){
        const listItem = document.getElementById(`list-item-${cardID}`);
        listItem.querySelector(".content").innerHTML = mdContentHTML;
      }
      if(cardDetails.references.length > 0){
        for(let card of cardDetails.references){
          let articleTemplate = document.getElementById("articleTemplate").content;
          let article = articleTemplate.cloneNode(true);
          const idSpan = article.querySelector(".card-id");
          idSpan.textContent = card.id;
          article.querySelector(".content").innerHTML = marked.parse(card.entry);
          refView.insertBefore(article, refView.lastChild)
        }
      }
      if(cardDetails.referencesBy.length > 0){
        for(let card of cardDetails.referencesBy){
          let articleTemplate = document.getElementById("articleTemplate").content;
          let article = articleTemplate.cloneNode(true);
          const idSpan = article.querySelector(".card-id");
          idSpan.textContent = card.id;
          article.querySelector(".content").innerHTML = marked.parse(card.entry);
          refByView.insertBefore(article, refByView.lastChild);
        }
      }

    })
  }
  function hiddenCardPanel(cardID){
    cardView.classList.add("hidden");
    editorViewPanel.classList.add("hidden");
  }

  clickHandle(".editor-submit-btn", function(event){
    const cardID = cardDetailContainer.getAttribute("card-id")
    db.editCardByID(cardID, longTextInput.value).then(function(cardID){
      showCard(cardID, true);
    });
  });

  clickHandle(".editor-cancel-btn", function(event){
    const cardID = cardDetailContainer.getAttribute("card-id")
    showCard(cardID);
  });

  function addListItem() {
    const inputContent = longTextInput.value;
    if (inputContent.isEmpty()) {
      return
    }
    db.createNewCard(inputContent).then(newCardID=>{
      db.getCardByID(newCardID).then(card => {
        insertCard(card, orderBeforeFirst);
        longTextInput.value = '';
      })
    });
  }

  longTextInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      addListItem();
    }
  });

  const searchContainer = document.querySelector('.search-container');
  const searchInput = searchContainer.querySelector('input[type="text"]');

  function displaySearchResult(cards){
    // if(cards.length > 0){
      listView.innerHTML = '';
      for (const card of cards){
        insertCard(card, orderBeforeLast);
      }
    // }
  }

  searchInput.addEventListener("keyup", (event) => {
    const searchTerm = searchInput.value;
    if(event.key == "Enter"){
      if(searchTerm.length == 0){
        utils.reloadAll();
        return
      }
      db.createNewCard(searchTerm).then((newCardID) => {
        db.getCardByID(newCardID).then((card) => {
          insertCard(card, orderBeforeFirst);
          searchInput.value = "";
          searchInput.blur();
          showEditor(card.id);
        });
      });
    }else if(event.key == "Escape"){
      searchInput.blur();
    } else{
      if(searchTerm.length>0){
        db.searchCards(searchTerm).then(function(cards){
          displaySearchResult(cards);
        });
      }
    }
  });
  window.addEventListener("keydown",function(event){
    if (event.ctrlKey && event.key == 'k'){
      searchInput.focus();
    }
  })

  // window.onscroll = function(ev) {
  //   if ((window.innerHeight + Math.ceil(window.pageYOffset)) >= document.body.offsetHeight) {
  //       // you're at the bottom of the page
  //       console.log('test');
  //       let listOffset = Number(localStorage.getItem("list_offset"))
  //       db.getCards('', listOffset, 10).then(cards => {
  //         for(const card of cards){
  //           insertCard(card, orderBeforeLast);
  //           listOffset+=1;
  //         }
  //         localStorage.setItem("list_offset", listOffset)
  //       })
  //   }
  // };
});
