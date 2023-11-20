const db = require('./db.js')
function insertSampleData(){ 
    const slippodTag = `#slippod `
    const sqliteTag = `#sqlite `
    const firstCardID = db.createNewCard(`这是一张简单的卡片。  ${slippodTag}`);
    db.createNewCard(`本项目采用 sqlite 做为后端存储。  
采用sqlite做为数据存储。sqlite 的好处有：  

* Local first 你的数据永远属于你。
* 小巧，一个文件可以存储所有数据。  
* 功能强大，几乎是一个拥有全功能的数据库。  
* 不用安装任何三方软件，就像加载一个文件一样加载数据库。  
* sql 是最强大的查询语言，数据库是最强大的数据存储容器。   
* 支持全文搜索。  
${slippodTag} ${sqliteTag}
    `);

    db.createNewCard(`
全文搜索的意思是你敲下的每一个字都会索引，你在搜索框（快捷键 ctrl+k ） 搜索任何内容都可以在秒级返回。   
${sqliteTag}
${slippodTag}
    `)
    const tagExample = '#tag ';
    db.createNewCard(`
笔记支持 tag。 tag 直接在卡片的内容中插入，格式为:  ${tagExample}
支持直接输入 @ 链接到其他笔记。
比如： @${firstCardID} 链接到第一条笔记。   
#slippod  
    `)

    db.createNewCard(`
${slippodTag}
点击左边的 link 链接可以过滤有相关 tag 的笔记。   
    `)

    db.createNewCard(`
如何新建笔记？  ctrl + o 激活输入框， ctrl + enter 提交新建笔记。 
按下 ctrl+k 输入任意内容，如没有搜索到任何内容，再按下 enter（回车）即可快速新建笔记。  

${slippodTag}
    `)
}

module.exports = {
    insertSampleData,
}