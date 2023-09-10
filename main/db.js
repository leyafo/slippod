const schema = require("./schema");
const sqlite3 = require("better-sqlite3");

const tagPattern = /#([a-zA-Z0-9\u4e00-\u9fff/\\_-]+)(?![a-zA-Z0-9\u4e00-\u9fff/\\_-]*;)/g;
const linkAtPattern = /@(\d+)/g;

let db = null;
const configs = {
    isInitlized: false,
    extPath: "",
    dictPath: "",
}

function getTagRegex(){
    return tagPattern
}

function getLinkAtRegex(){
    return linkAtPattern
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
    newDB.pragma("trusted_schema = 1");
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

function getMaxCardID(){
    return db.prepare(`select max(id) as max_id from cards`).get();
}

// get all cards
function getAllCards() {
    return db.prepare(`select * from cards order by id desc`).all();
}

//the newest card is order in first
function getCards(offset, limit){
    return db.prepare(`select * from cards order by id desc limit ?, ?`).all(Math.floor(Number(offset)), 
                    Math.floor(Number(limit)));
}

function getCardsByMiddleID(middleID, upLimit, downLimit, limit){
    if (upLimit == 0 && downLimit == 0){
        const upCards = db.prepare(`select * from cards where id >= ? order by id asc limit 0, ?  `).all(Number(middleID), Number(limit));
        const downCards = db.prepare(`select * from cards where id < ? order by id desc limit 0, ?`).all(Number(middleID), Number(limit)); 
        return downCards.reverse().concat(upCards);
    }
    if(limit > 0){ //going down
        let downCards =  db.prepare(`select * from cards where id < ? order by id desc limit ?, ?`).all(Number(middleID), Number(downLimit), Number(limit)); 
        return downCards.reverse();
    }else if(limit < 0){
        //going up
        console.log(middleID, upLimit, downLimit, limit);
        return db.prepare(`select * from cards where id >= ? order by id asc limit ?, ?`).all(Number(middleID), Number(upLimit), Math.abs(limit));
    }
}

function getTrashCards(offset, limit){
    const trashCards =  db.prepare(`select * from trash order by card_id desc limit ?, ?`).all(Math.floor(Number(offset)), 
                    Math.floor(Number(limit)));
    let cards = [];
    for (tc of trashCards){
        cards.push({
            id: tc.card_id,
            trash_id: tc.id,
            is_trash: true,
            entry: tc.card_entry,
            created_at: tc.card_created_at,
            updated_at: tc.card_updated_at
        });
    }
    return cards;
}

function createNewCard(cardEntry) {
  try {
    const tags = parseTags(cardEntry);
    return db.transaction((entry, tags) => {
      const changes = db
        .prepare(`insert into cards(entry) values(?)`)
        .run(entry);
      tags.forEach((tag) => {
        db.prepare(`insert into tags(card_id, tag) values(?, ?)`).run(
          changes.lastInsertRowid,
          tag
        );
      });
      return changes.lastInsertRowid;
    })(cardEntry, tags);
  } catch (err) {
    if (!db.inTransaction) throw err; // (transaction was forcefully rolled back)
  }
}


function parseTags(cardEntry){
    const tags = new Set();
    const matches = cardEntry.matchAll(tagPattern);
    for (m of matches){
        let matchedString = m[0].trim()
        if(matchedString[0] == '#'){
            tags.add(matchedString.slice(1));
        }
    }

    return tags
}

function parseLinks(cardEntry){
    const links = new Set();
    const matches = cardEntry.matchAll(linkAtPattern);
    for (m of matches){
        let matchedString = m[0].trim()
        if(matchedString[0] == '@'){
            links.add(matchedString.slice(1));
        }
    }
    return links
}

function getAllTags(){
    const tags = db.prepare("select distinct(tag) from tags order by tag asc").all();
    return tags
}

function getNoTagCards(offset, limit){
   const cards = db.prepare("SELECT cards.* FROM cards LEFT JOIN tags ON cards.id = tags.card_id WHERE tags.card_id IS NULL order by cards.id desc limit ?, ?;").all(offset, limit)
   return cards
}

function getCardsByTag(tag, offset, limit){
    const sql = `SELECT cards.* FROM cards JOIN tags ON cards.id = tags.card_id WHERE tags.tag = ? order by cards.id desc limit ?,?;`
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
    const keyword = `@${id}`
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

    result.references = []
    const links = parseLinks(result.card.entry);
    links.forEach((linkID) => {
        const card = getCardByID(linkID)
        result.references.push(card);
    });

    return result
}

function moveCardToTrash(id){
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

function removeCardPermanently(trashID){
    db.transaction(function(trashID){
        db.prepare(`delete from trash where id = ?`).run(trashID);
    })(trashID);
}

function removeCardFromTrash(trashID){
    return removeCardPermanently(trashID);
}

function restoreCard(trashID){
    const removedCard = db.prepare(`select * from trash where id = ?`).get(trashID)
    const tags = parseTags(removedCard.card_entry);
    db.transaction(function(trashID){
        db.prepare("insert into cards(id, entry, created_at, updated_at) values(?, ?, ?, ?)")
            .run(removedCard.card_id, removedCard.card_entry, removedCard.card_created_at, removedCard.card_updated_at)

        tags.forEach((tag) => {
            db.prepare(`insert into tags(card_id, tag) values(?, ?)`).run(
                removedCard.card_id,
                tag)
        });
        db.prepare(`delete from trash where id = ?`).run(trashID);
    })(trashID);
}

function cardIsExisted(id){
    return db.prepare(`select id from cards where id=?`).get(id);
}

function updateCardEntryByID(id, cardEntry){
    const tagsInContent = parseTags(cardEntry);
    const existedTags = db.prepare("select tag from tags where card_id = ?").pluck().all(id)
    const existedTagsSet = new Set(existedTags);
    db.transaction(function(cardID, entry, newTags, oldTags){
        db.prepare("update cards set entry = ?, updated_at=strftime('%s', 'now') where id = ?").run(entry, cardID)

        //delete removed tags
        oldTags.forEach(function(tag){
            if (!newTags.has(tag)){
                db.prepare(`delete from tags where card_id = ? and tag = ?`).run(cardID, tag)
            }
        })
        //insert new tags
        newTags.forEach(function(tag){
            if (!oldTags.has(tag)){
                db.prepare(`insert into tags(card_id, tag)values(?, ?)`).run(cardID, tag)
            }
        })

    })(id, cardEntry, tagsInContent, existedTagsSet);
    return id;
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

function searchCardsWithStyle(keyWord, offset, limit){
    const sql = `SELECT rowid,simple_highlight(cards_fts, 0, '<mark>', '</mark>' ) as result FROM cards_fts WHERE 
                  entry MATCH simple_query('${keyWord}', '0') ORDER BY rank limit ?, ?;`;
    const result =  db.prepare(sql).all(offset, limit)
    let cards = [];
    for(r of result){
        cards.push({
            id: r.rowid,
            entry: r.result,
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
    getAllCards,
    getCards,
    createNewCard,
    getCardsByTag,
    getCardByID,
    updateCardEntryByID,
    initialize,
    initializeMemoryDB,
    getCardDetails,
    searchCards,
    getNoTagCards,
    cardIsExisted,
    getCardsByMiddleID,
    getMaxCardID,

    //trash functions
    getTrashCards,
    moveCardToTrash,
    removeCardFromTrash,
    removeCardPermanently,
    restoreCard,

    //for test
    parseTags,
    getTagRegex,
    getLinkAtRegex,
    searchCardsWithStyle,
};