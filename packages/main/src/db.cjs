const { table } = require("console");
const sqlite3 = require("better-sqlite3");

const tagPattern = /#([a-zA-Z0-9\u4e00-\u9fff/\\_-]+)(?![a-zA-Z0-9\u4e00-\u9fff/\\_-]*;)/g;
const linkAtPattern = /@(\d+)/g;

let db = null;
let existedIDs = new Set();
const configs = {
    isConnectd: false,
    extPath: "",
    dictPath: "",
}

function N(number){
    return Math.floor(Number(number))
}

function getTagRegex(){
    return tagPattern
}

function getLinkAtRegex(){
    return linkAtPattern
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

function checkDBDifference(newDB, oldDB){
    const oldTables = oldDB.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).pluck().all()
    const oldTablesSet = new Set(oldTables)

    const newTables = newDB.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).pluck().all()

    for(let t of newTables){
        if (!oldTablesSet.has(t)){
            return false
        }
    }
    return true
}

function reloadDB(newDbPath){
    if (!configs.isConnectd){
        throw new Error("db is not initialized");
    }
    let newDB = openDB(configs.extPath, configs.dictPath, newDbPath)
    if(!checkDBDifference(newDB, db)){
        throw new Error("db version is not same");
    }
    db = newDB;
}

function connect(extPath, dictPath, dbPath){
    if (configs.isConnectd){
        return
    }
    db = openDB(extPath, dictPath, dbPath)
    configs.dictPath = dictPath;
    configs.extPath = extPath;
    configs.isConnectd = true
}

function loadSchema(sqlSchema){
    return db.exec(sqlSchema);
}

//for test use
function initializeMemoryDB(extPath, dictPath, schemaSQL){
    if (configs.isConnectd){
        return
    }
    db = openDB(extPath, dictPath, ":memory:")
    loadSchema(schemaSQL)
    configs.dictPath = dictPath;
    configs.extPath = extPath;
    configs.isConnectd = true
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
    return db.prepare(`select * from cards order by id desc limit ?, ?`).all(N(offset), N(limit));
}

function getCardsByMiddleID(middleID, upLimit, downLimit, limit){
    if (upLimit == 0 && downLimit == 0){
        const upCards = db.prepare(`select * from cards where id >= ? order by id asc limit 0, ?  `).all(N(middleID), N(limit));
        const downCards = db.prepare(`select * from cards where id < ? order by id desc limit 0, ?`).all(N(middleID), N(limit)); 
        return downCards.reverse().concat(upCards);
    }
    if(limit > 0){ //going down
        let downCards =  db.prepare(`select * from cards where id < ? order by id desc limit ?, ?`).all(N(middleID), N(downLimit), N(limit)); 
        return downCards.reverse();
    }else if(limit < 0){
        //going up
        console.log(middleID, upLimit, downLimit, limit);
        return db.prepare(`select * from cards where id >= ? order by id asc limit ?, ?`).all(N(middleID), N(upLimit), Math.abs(limit));
    }
}

function getTrashCards(offset, limit){
    const trashCards =  db.prepare(`select * from trash order by card_id desc limit ?, ?`).all(N(offset), 
                    N(limit));
    let cards = [];
    for (let tc of trashCards){
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
    for (let m of matches){
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
    for (let m of matches){
        let matchedString = m[0].trim()
        if(matchedString[0] == '@'){
            const linkID = N(matchedString.slice(1));
            links.add(linkID);
        }
    }
    return links
}

function getAllTags(){
    const tags = db.prepare("select distinct(tag) from tags order by tag asc").all();
    return tags
}

function getNoTagCards(offset, limit) {
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

function getCardsByIDs(ids){
    const sql = `SELECT * FROM cards WHERE id IN (SELECT value FROM json_each(?))`;
    const stmt = db.prepare(sql);
    return stmt.all(JSON.stringify(ids));
}

function getCardSearchSuggestions(keyword, limit){
    const tokenLengh = keyword.length+20; //limit the token size
    if(keyword === ""){//get latest 5 records
        let recentCards = getCards(0, limit);
        let results = [];
        for(let card of recentCards){
            //get the begining of content
            card.entry = card.entry.trim().slice(0, tokenLengh).replaceAll("\n", " ");
            results.push(card)
        }
        return results;
    }
    let matchSingleCard = null
    let singleLinkMatches = keyword.match(linkAtPattern)
    if(singleLinkMatches!=null){
        const cardID =singleLinkMatches[0].slice(1)
        matchSingleCard = getCardByID(N(cardID))
    }
    const searchRef = `SELECT rowid, simple_snippet(cards_fts, 0, '<mark>', '</mark>', '...', ${tokenLengh}) as snippet 
                            FROM cards_fts WHERE entry MATCH jieba_query('${keyword}', 0) ORDER BY rank limit ?,?`;
    const results = db.prepare(searchRef).all(0, limit)

    let matchedCards = [];
    if(matchSingleCard != null){
        matchSingleCard.entry = card.entry.trim().replaceAll("\n", " ");
        matchedCards.push(matchSingleCard);
    }
    for (let r of  results){
        if(matchSingleCard != null && r.id == matchSingleCard.id){
            continue
        }
        matchedCards.push({
            id: r.rowid,
            entry: r.snippet.trim().replaceAll("\n", " "),
        })
    }
    return matchedCards 
}

function getCardDetails(id){
    id = N(id);
    var result = {}
    result.card = getCardByID(id)
    result.referencesBy = [] 
    const keyword = `@${id}`
    const tokenLengh = keyword.length; //limit the token size
    const searchRef = `SELECT rowid, entry, simple_snippet(cards_fts, 0, '', '', '', ${tokenLengh}) as snippet FROM cards_fts WHERE entry MATCH simple_query('${keyword}') ORDER BY rank`;
    const refResult =  db.prepare(searchRef).all()
    for(let r of refResult){
        if(r.snippet.indexOf(keyword) != -1 && N(r.rowid) !== id){
            
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
    let linkIDs = [];
    const links = parseLinks(result.card.entry);
    links.forEach((linkID) => {
        if (linkID !== id){ //exclude self
            linkIDs.push(linkID)
        }
    });
    result.references = getCardsByIDs(linkIDs)

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
        existedIDs.delete(id);
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
    if(existedIDs.has(id)){
        return true;
    }
    let result = db.prepare(`select id from cards where id=?`).get(id);
    if (result != undefined){
        existedIDs.add(id)
        return true
    }
    return false
}

function updateCardEntryByID(id, cardEntry){
    const tagsInContent = parseTags(cardEntry);
    const existedTags = db.prepare("select tag from tags where card_id = ?").pluck().all(id)
    const existedTagsSet = new Set(existedTags);
    const updateTimeUnix = N(Date.now() / 1000);
    db.transaction(function(cardID, entry, newTags, oldTags){
        db.prepare("update cards set entry = ?, updated_at= ? where id = ?").run(entry, updateTimeUnix, cardID)

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
    return {id: id, updated_at: updateTimeUnix};
}

function searchCards(keyWord, offset, limit){
    // in simple_query, we accept a second params, '0' means disable pinyin split
    const sql = `SELECT rowid, entry FROM cards_fts WHERE entry MATCH simple_query('${keyWord}', 0) ORDER BY rank limit ?, ?;`;
    const result =  db.prepare(sql).all(offset, limit)
    let cards = [];
    for(let r of result){
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
    for(let r of result){
        cards.push({
            id: r.rowid,
            entry: r.result,
            created_at: 0,
            updated_at: 0,
        })
    }
    return cards
}

function countTaggedCards(tag){
    const sql = `SELECT count(1) AS count FROM cards JOIN tags ON cards.id = tags.card_id WHERE tags.tag = ?;`
    const taggedCards = db.prepare(sql).get(tag)
    return taggedCards.count
}

function countDifferentCards(){
    const allCards = db.prepare(`select count(1) as count from cards`).get();
    const notagCards = db.prepare("SELECT count(1) as count FROM cards LEFT JOIN tags ON cards.id = tags.card_id WHERE tags.card_id IS NULL").get()
    const trashCards = db.prepare(`select count(1) as count from trash`).get();
    return {
        allCards: allCards.count,
        noTagCards: notagCards.count,
        trashCards: trashCards.count,
    }
}

module.exports = {
    loadSchema,
    reloadDB,
    getAllTags,
    getAllCards,
    getCards,
    createNewCard,
    getCardsByTag,
    getCardByID,
    updateCardEntryByID,
    connect,
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
    getCardSearchSuggestions,
    countDifferentCards,
    countTaggedCards,
};