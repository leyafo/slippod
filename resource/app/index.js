import * as marked from 'marked';

String.prototype.isEmpty = function() {
    // This doesn't work the same way as the isEmpty function used 
    // in the first example, it will return true for strings containing only whitespace
    return (this.length === 0 || !this.trim());
};

function unixTimeFormat(unixTime){
    const d = new Date(unixTime*1000);
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getUTCDate()} ${d.getHours()}:${d.getMinutes()}`;
}

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
  const listInsertFirst = 1;
  const listInsertLast = 2;
  const needUpdateList = true;
  const limitItems = 20;

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

    if (order == listInsertLast) {
      listView.insertBefore(listItem, listView.firstChild);
    } else if (order == listInsertFirst) {
      listView.insertBefore(listItem, null);
    }
  }


  //load cards
  (async ()=>{
    db.getCards(0, limitItems).then(function(cards){
      for(let card of cards){
        insertCard(card, listInsertFirst);
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
      db.getCardsByTag(tag, 0, limitItems).then(function(cards){
        listView.innerHTML = '';
        for (let card of cards) {
          insertCard(card, listInsertFirst);
        }
      });
    }
  });
  clickHandle(".markdown-body a", function(event){
    event.preventDefault();
    const targetContent = event.target.textContent.trim()
    if (targetContent[0] == '@'){
      const cardID = targetContent.slice(1, targetContent.length)
      showCard(cardID)
    }else if(targetContent[0] == '#'){
      const tag = targetContent.slice(1, targetContent.length)
      db.getCardsByTag(tag, 0, limitItems).then(function(cards){
        listView.innerHTML = '';
        for (let card of cards) {
          insertCard(card, listInsertFirst);
        }
      });
    }
  })

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
    cardDetailContainer.setAttribute("card-id", cardID);
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

      let spanID = cardView.querySelector("span.card-id");
      spanID.textContent = cardID;
      let cardCreatedAt = cardView.querySelector("span.card-created-at");
      cardCreatedAt.textContent = "Created At: " + unixTimeFormat(cardDetails.card.created_at);
      let cardUpdatedAt = cardView.querySelector("span.card-updated-at");
      cardUpdatedAt.textContent = "Updated At: "+ unixTimeFormat(cardDetails.card.updated_at);

      let refView = cardView.querySelector(".card-references")
      refView.innerHTML = '';

      let refByView = cardView.querySelector(".card-references-by")
      refByView.innerHTML = '';

      //更新list列表用的
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

  longTextInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      const cardID = cardDetailContainer.getAttribute("card-id")
      db.editCardByID(cardID, longTextInput.value).then(function(cardID){
        showCard(cardID, true);
      });
    }
  });

  const searchContainer = document.querySelector('.search-container');
  const searchInput = searchContainer.querySelector('input[type="text"]');

  function displaySearchResult(cards){
    // if(cards.length > 0){
      listView.innerHTML = '';
      for (const card of cards){
        insertCard(card, listInsertFirst);
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
          insertCard(card, listInsertLast);
          searchInput.value = "";
          searchInput.blur();
          showEditor(card.id);
        });
      });
    }else if(event.key == "Escape"){
      searchInput.blur();
    } else{
      if(searchTerm.length>0){
        db.searchCards(searchTerm, 0, limitItems).then(function(cards){
          displaySearchResult(cards);
        });
      }
    }
  });
  window.addEventListener("keydown",function(event){
    if (event.ctrlKey && event.key == 'k'){
      searchInput.focus();
    }else if(event.ctrlKey && event.key == "n"){
      db.createNewCard("").then((newCardID) => {
        db.getCardByID(newCardID).then((card) => {
          insertCard(card, listInsertLast);
          showEditor(card.id);
        });
      })
    }
  })

  let listHasGetLastItem = 0;
  document.querySelector('.list-container').onscroll = function(ev) {
    const listContainer = ev.target;
    const totalHeight = listContainer.scrollHeight - listContainer.offsetHeight;
    if ((totalHeight - listContainer.scrollTop) < 2){
      let lastCallList = JSON.parse(localStorage.getItem('list_call'));
      let fn = db[lastCallList.funcName];
      let args = lastCallList.args
      const offsetArgsIndex=args.length-2
      if(args[offsetArgsIndex] == 0){
        listHasGetLastItem = 0;
      }
      if(listHasGetLastItem == 1){
        return
      }
      args[offsetArgsIndex]+=limitItems;
      fn(...args).then(function(cards){
        for(let card of cards){
          insertCard(card, listInsertFirst);
        }
        if(cards.length < limitItems){
          listHasGetLastItem = 1;
        }
      })
    }
  };
});
