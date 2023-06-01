
const db = require('../main/db.js');
const path = require('path');

var assert = require('assert');
describe(`test card entry's regex`, function () {
  describe('#parseEntry(cardEntry)', function () {
    it('should return tags and links when the content has [@id] or [#tag]', function () {
        const content = `fasdf [#tag] [@123]`;
        const result = db.parseTagsLinks(content); console.log(result); assert.ok(result[0].has('tag'));
        assert.ok(result[1].has(123));
    });

    it('should not parse the invalid link id', function () {
        const content = `fasdf [#tag] [@0123] [@z123]`;
        const result = db.parseTagsLinks(content);
        console.log(result);
        assert.ok(result[1].has(123));
    });
    it('should parse only the one word tag', function () {
        const content = `fasdf [#tag second] [@0123] [@z123]`;
        const result = db.parseTagsLinks(content);
        console.log(result);
        assert.equal(result[0].size, 0);
    });
  });
});

describe(`test database operation`, function(){
    db.initializeMemoryDB(path.join(__dirname, "../libsimple/libsimple"), path.join(__dirname, "../libsimple", "dict"));
    it('show insert a new card', function(){
        db.createNewCard('hello');
        const card = db.getCards(0, 10);
        console.log(card)
        assert.ok(card.length>0);
    })

    it('show insert a new card with tag and links', function(){
        const id = db.createNewCard('hello [@1] [#tag]');
        const cardDetails = db.getCardDetails(id);
        assert.equal(cardDetails.tags[0].tag, 'tag');
        assert.equal(cardDetails.references[0].id, 1);
        console.log(cardDetails);
        return cardDetails;
    })
    it('show update a card', function(){
        const id = db.createNewCard('hello  [@1] [#tag]');
        let newContent=`hello[@1][@2][#new_tag]`;
        db.editCardByID(id, newContent);
        let cardReferences = db.getCardDetails(id);
        console.log(cardReferences);
        assert.equal(cardReferences.card.entry, newContent);
        assert.equal(cardReferences.tags.length, 1);
        assert.equal(cardReferences.tags[0].tag, 'new_tag');
        assert.equal(cardReferences.references.length, 2);
    })
})
