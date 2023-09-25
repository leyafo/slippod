const marked = require("marked")
const db = require("./db")

function createMarkdownRender(){
    let linkAtRegex = db.getLinkAtRegex()
    let tagRegex = db.getTagRegex()

    const renderer = new marked.Renderer();
    renderer.text = function (text) {
        text = text.replace(tagRegex, '<a href="/tags/$1" class="cm-hashtag">#$1</a>');
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