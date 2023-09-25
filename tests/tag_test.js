/*
var assert = require('assert');
const db = require('../main/db.js');

describe(`test tag parse`, function () {
    it('should parse chinese', function(){
        let content = "#中文 tag"
        let tags = db.parseTags(content)
        assert.ok(tags.has("中文"))
        content = `
            #中文/dsfds\sdfds/d/sif老扽
            #jldskf  
            #dlkfj\dsfsf 
            #lskdjf_sdfsdf 
            #slkdjf-dfsdf 
            #lkjdsf/sdfsdf 
        `
        tags = db.parseTags(content) 
        assert.ok("中文/dsfds\sdfds/d/sif老扽");
        assert.ok("jldskf");
        assert.ok("dlkfj\dsfsf"); 
        assert.ok("lskdjf_sdfsdf");
        assert.ok("slkdjf-dfsdf");
        assert.ok("lkjdsf/sdfsdf");
    })
})
*/