const {marked} = require("marked")
const db = require("./db.js")

function createMarkdownRender(){
    let linkAtRegex = db.getLinkAtRegex()
    let tagRegex = db.getTagRegex()

    const renderer = new marked.Renderer();
    renderer.text = function (text) {
        text = text.replace(tagRegex, '<a href="/tags/$1" class="cm-hashtag">#$1</a>');
        return text.replace(linkAtRegex, function(matchedLink){
            const linkID = matchedLink.slice(1)
            const card = db.cardIsExisted(linkID)
            if (card != undefined){
                return `<a href="/links/${card.id}" class="cm-linkref">${matchedLink}</a>`;
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