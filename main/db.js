const fs = require("fs");
const schema = require("./schema");
const sqlite3 = require("better-sqlite3");
let db = null;
const configs = {
    isInitlized: false,
    extPath: "",
    dictPath: "",
}

function checkDBSchema(checkDB){
    const tables = checkDB.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).pluck().all()
    const setTables = new Set(tables)
    for(t of schema.tables){
        if (!setTables.has(t)){
            return false
        }
    }
    return true
}

function openDB(extPath, dictPath, dbPath){
    let newDB = null;
    newDB = sqlite3(dbPath, {verbose: console.log})
    newDB.loadExtension(extPath);
    //set jieba dict path
    newDB.prepare("select jieba_dict(?)").run(dictPath);
    return newDB
}

function reloadDB(newDbPath){
    if (!configs.isInitlized){
        throw new Error("db is not initialized");
    }
    let newDB = openDB(configs.extPath, configs.dictPath, newDbPath)
    if(checkDBSchema(newDB) == false){
        throw new Error("db is invalidated");
    }
    db = newDB;
}

function initialize(extPath, dictPath, dbPath){
    if (configs.isInitlized){
        return
    }
    db = openDB(extPath, dictPath, dbPath)
    configs.dictPath = dictPath;
    configs.extPath = extPath;
    configs.isInitlized = true
}

function updateSchema(){
    return db.exec(schema.schema);
}

//for test use
function initializeMemoryDB(extPath, dictPath){
    if (configs.isInitlized){
        return
    }
    db = openDB(extPath, dictPath, ":memory:")
    updateSchema()
    configs.dictPath = dictPath;
    configs.extPath = extPath;
    configs.isInitlized = true
}

//the newest card is order in first
function getCards(offset, limit){
    return db.prepare(`select * from cards order by id desc limit ?, ?`).all(Math.floor(Number(offset)), 
                    Math.floor(Number(limit)))
}

function getTrashCards(offset, limit){
    const trashCards =  db.prepare(`select * from trash order by id desc limit ?, ?`).all(Math.floor(Number(offset)), 
                    Math.floor(Number(limit)));
    let cards = [];
    for (tc of trashCards){
        cards.push({
            id: tc.card_id,
            entry: tc.card_entry,
            created_at: tc.card_created_at,
            updated_at: tc.card_updated_at
        });
    }
    return cards;
}

function createNewCard(cardEntry) {
  try {
    const tagslinks = parseTagsLinks(cardEntry);
    return db.transaction((entry, tags, links) => {
      const changes = db
        .prepare(`insert into cards(entry) values(?)`)
        .run(entry);
      tags.forEach((tag) => {
        db.prepare(`insert into tags(card_id, tag) values(?, ?)`).run(
          changes.lastInsertRowid,
          tag
        );
      });
    //   links.forEach((link) => {
    //     db.prepare(`insert into links(card_id, link_id) values(?, ?)`).run(
    //       changes.lastInsertRowid,
    //       link
    //     );
    //   });
      return changes.lastInsertRowid;
    })(cardEntry, tagslinks[0], tagslinks[1]);
  } catch (err) {
    if (!db.inTransaction) throw err; // (transaction was forcefully rolled back)
  }
}


function parseTagsLinks(cardEntry){
    const pattern = /(\[#\w+\])|(\[@\d+\])/g;
    const links = new Set();
    const tags = new Set();
    const matches = cardEntry.matchAll(pattern);
    for (m of matches){
        let matchedString = m[0].trim()
        if (matchedString[1] == '@'){
            const id = parseInt(matchedString.slice(2, matchedString.length-1), 10);
            if (isNaN(id)){
                continue;
            }
            links.add(id);
        }else if(matchedString[1] == '#'){
            tags.add(matchedString.slice(2, matchedString.length-1));
        }
    }

    return [tags, links]
}

function getAllTags(){
    const tags = db.prepare("select distinct(tag) from tags").all();
    return tags
}

function getNoTagCards(offset, limit){
   const cards = db.prepare("SELECT cards.* FROM cards LEFT JOIN tags ON cards.id = tags.card_id WHERE tags.card_id IS NULL limit ?, ?;").all(offset, limit)
   return cards
}

function getCardsByTag(tag, offset, limit){
    const sql = `SELECT cards.* FROM cards JOIN tags ON cards.id = tags.card_id WHERE tags.tag = ? limit ?,?;`
    const cards = db.prepare(sql).all(tag, offset, limit)
    return cards
}

function getCardByID(id){
    return db.prepare(`select * from cards where id=?`).get(id);
}

function getCardDetails(id){
    var result = {}
    result.card = getCardByID(id)
    result.referencesBy = [] 
    const keyword = `[${id}]`
    const tokenLengh = keyword.length; //limit the token size
    const searchRef = `SELECT rowid, entry, simple_snippet(cards_fts, 0, '', '', '', ${tokenLengh}) as snippet FROM cards_fts WHERE entry MATCH simple_query('${keyword}') ORDER BY rank`;
    const refResult =  db.prepare(searchRef).all()
    for(r of refResult){
        if(r.snippet.indexOf(keyword) != -1){
            result.referencesBy.push({
                id: r.rowid,
                entry: r.entry,
                created_at: 0,
                updated_at: 0,
            })
        }
    }
    result.tags = db.prepare(`
        SELECT tag from tags where card_id = ?
    `).all(id)

    return result
}

function deleteCardByID(id){
    const card = getCardByID(id);
    db.transaction(function(cardID){
        db.prepare("delete from tags where card_id = ?").run(cardID);
        db.prepare("delete from cards where id = ?").run(cardID);
        db.prepare(`insert into trash( 
            card_id, card_entry, card_created_at, card_updated_at
            ) values(?, ?, ?, ?)`).run(card.id, card.entry, card.created_at, card.updated_at);
    })(id)
    return 
}

function cardIsExisted(id){
    return db.prepare(`select id from cards where id=?`).get(id);
}

function editCardByID(id, cardEntry){
    db.prepare("update cards set entry = ?, updated_at=strftime('%s', 'now') where id = ?").run(cardEntry, id)
    return id;
}

function searchCards(keyWord, offset, limit){
    // in simple_query, we accept a second params, '0' means disable pinyin split
    const sql = `SELECT rowid, entry FROM cards_fts WHERE entry MATCH simple_query('${keyWord}', '0') ORDER BY rank limit ?, ?;`;
    const result =  db.prepare(sql).all(offset, limit)
    let cards = [];
    for(r of result){
        cards.push({
            id: r.rowid,
            entry: r.entry,
            created_at: 0,
            updated_at: 0,
        })
    }
    return cards
}

module.exports = {
  updateSchema,
  reloadDB,
  getAllTags,
  getCards,
  createNewCard,
  getCardsByTag,
  getCardByID,
  deleteCardByID,
  editCardByID,
  initialize,
  initializeMemoryDB,
  getCardDetails,
  getTrashCards,
  searchCards,
  getNoTagCards,
  cardIsExisted,
};