const fs = require("fs");
const schema = require("./schema")
let db = null;
const configs = {
    isInitlized: false,
    extPath: "",
    dictPath: "",
}

function checkDBSchema(dbPath){
    const checkdb = require('better-sqlite3')(dbPath, {verbose: console.log})
    const tables = checkdb.prepare(
        `SELECT name FROM sqlite_master WHERE type='table'`
        ).pluck().all()
    const setTables = new Set(tables)
    for(t of schema.tables){
        if (!setTables.has(t)){
            return null
        }
    }
    return checkdb
}

function reloadDB(dbPath){
    if (!configs.isInitlized){
        throw "db is not initialized";
    }
    const checkDB = checkDBSchema(dbPath);
    if(checkDB == null){
        throw "db is invalidated";
    }
    checkDB.loadExtension(configs.extPath)
    checkDB.prepare("select jieba_dict(?)").run(configs.dictPath);
    db = checkDB;
}

function createSchema(extPath, dictPath, dbPath){
    if (configs.isInitlized){
        return
    }
    if (!fs.existsSync(dictPath)){
        console.log(`${dictPath} is not existed.`);
        process.exit(1);
    }
    db = require('better-sqlite3')(dbPath, {verbose: console.log})

    db.loadExtension(extPath);
    //set jieba dict path
    db.prepare("select jieba_dict(?)").run(dictPath);

    db.exec(schema.schema);
    configs.dictPath = dictPath;
    configs.extPath = extPath;
    configs.isInitlized = true
}

function initialize(extPath, dictPath, dbPath){
    if (configs.isInitlized){
        return
    }
    if (!fs.existsSync(dictPath)){
        console.log(`${dictPath} is not existed.`);
        process.exit(1);
    }
    db = checkDBSchema(dbPath);
    if(db == null){
        console.log(`${dbPath} is not matched.`);
        process.exit(1);
    }
    db.loadExtension(extPath);

    //set jieba dict path
    db.prepare("select jieba_dict(?)").run(dictPath);
    configs.dictPath = dictPath;
    configs.extPath = extPath;
    configs.isInitlized = true
}

//for test use
function initializeMemoryDB(extPath, dictPath){
    if (configs.isInitlized){
        return
    }
    db = require('better-sqlite3')(":memory:", {verbose: console.log})

    db.loadExtension(extPath);
    //set jieba dict path
    db.prepare("select jieba_dict(?)").run(dictPath);
    const {schema} = require('./schema.js');
    db.exec(schema)
    configs.dictPath = dictPath;
    configs.extPath = extPath;
    configs.isInitlized = true
}

//the newest card is order in first
function getCards(offset, limit){
    return db.prepare(`select * from cards order by id desc limit ?, ?`).all(Math.floor(Number(offset)), 
                    Math.floor(Number(limit)))
}

function createNewCard(cardEntry){
    try {
        const tagslinks = parseTagsLinks(cardEntry);
        return db.transaction((entry, tags, links) => {
            const changes = db.prepare(`insert into cards(entry) values(?)`).run(entry);
            tags.forEach((tag)=>{
                db.prepare(`insert into tags(card_id, tag) values(?, ?)`).run(changes.lastInsertRowid, tag)
            })
            links.forEach((link)=>{
                db.prepare(`insert into links(card_id, link_id) values(?, ?)`).run(changes.lastInsertRowid, link)
            })
            return changes.lastInsertRowid
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
    result.references = db.prepare(`
    SELECT cards.* from cards JOIN links on cards.id = links.link_id where
			links.card_id = ?`).all(id)
    result.referencesBy = db.prepare(`
		SELECT cards.* from cards JOIN links on cards.id = links.card_id where 
			links.link_id = ?;
    `).all(id)
    result.tags = db.prepare(`
        SELECT tag from tags where card_id = ?
    `).all(id)

    return result
}

function deleteCardByID(id){
    db.transaction(function(cardID){
        db.prepare("delete from cards where id = ?").run(cardID);
        db.prepare("delete from links where card_id = ? OR link_id = ? ").run(cardID, cardID);
        db.prepare("delete from tags where card_id = ?").run(cardID);
    })(id)
    return 
}

function editCardByID(id, cardEntry){
    const tagsLinks = parseTagsLinks(cardEntry);
    const existedTags = db.prepare("select tag from tags where card_id = ?").pluck().all(id)
    const existedTagsSet = new Set(existedTags);
    const existedLinks = db.prepare("select link_id from links where card_id = ?").pluck().all(id)
    const existedLinksSet = new Set(existedLinks);
    db.transaction(function(cardID, entry, newTags, newLinks, oldTags, oldLinks){
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

        //the same way like tags
        oldLinks.forEach(function(linkID){
            if (!newLinks.has(linkID)){
                db.prepare(`delete from links where card_id = ? and link_id = ?`).run(cardID, l)
            }
        })
        newLinks.forEach(function(linkID){
            if (!oldLinks.has(linkID)){
                db.prepare(`insert into links(card_id, link_id) values(?, ?)`).run(cardID, linkID)
            }
        })
    })(id, cardEntry, tagsLinks[0], tagsLinks[1], existedTagsSet, existedLinksSet);
    return id;
}

function searchCards(keyWord, offset, limit){
    const sql = `SELECT rowid, entry FROM cards_fts WHERE entry MATCH simple_query('${keyWord}') ORDER BY rank limit ?, ?;`;
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
    createSchema,
    reloadDB,
    getAllTags,
    getCards,
    createNewCard,
    getCardsByTag,
    getCardByID,
    deleteCardByID,
    editCardByID,
    initialize,
    parseTagsLinks,
    initializeMemoryDB,
    getCardDetails,
    searchCards,
}