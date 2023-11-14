const marked = require("marked")
const db = require("./db.js")

function createMarkdownRender(){
    let linkAtRegex = db.getLinkAtRegex()
    let tagRegex = db.getTagRegex()

    const renderer = new marked.Renderer();
    renderer.text = function (text) {
        text = text.replace(tagRegex, function(matchedTag){
            const tagText = matchedTag.slice(1)
            return `<a href="/tags/${tagText}" class="cm-hashtag">#${tagText}</a>`;
        })
        return text.replace(linkAtRegex, function(matchedLink){
            const linkID = matchedLink.slice(1)
            if(db.cardIsExisted(linkID)){
                return `<a href="/links/${linkID}" class="cm-linkref">${matchedLink}</a>`;
            }
            return matchedLink
        })
    };
    marked.setOptions({ renderer});

    marked.use({
        mangle: false,
        headerIds: false,
    });

    return function(rawText){
        return marked.parse(rawText);
    }
} 

module.exports = {
    createMarkdownRender
}