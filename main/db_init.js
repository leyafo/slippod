

const db = require("./db.js");
const path = require('path');
const configFile = require('./config.js');
const fs = require("fs");
const {getExtensionPath} = require("./schema.js");

(function(){

    const appDir = path.join(path.dirname(require.main.filename), "..");
    const extPath = getExtensionPath(path.join(appDir, "libsimple"));
    const dictPath = path.join(appDir, "libsimple", "dict")
    const dbPath = path.join(appDir, "slippod.db");
    if (fs.existsSync(dbPath)){
        //don't init db twice
        return
    }
    //save db path to config file
    try{
        configFile.writeDBPathConfig(dbPath)
    }catch(err){
        console.log(err)
        process.exit(1);
    }

    db.initialize(extPath, dictPath, dbPath);

    const slippodTag = `[#slippod]()`
    const sqliteTag = `[#sqlite]()`
    const firstCardID = db.createNewCard(`这是一张简单的卡片。  slippodTag`);
    db.createNewCard(`本项目采用 sqlite 做为后端存储。  
采用sqlite做为数据存储。sqlite 的好处有：  

* 小巧，一个文件可以存储所有数据。  
* 功能强大，几乎是一个拥有全功能的数据库。  
* 不用安装任何三方软件，就像加载一个文件一样加载数据库。  
* sql 是最强大的查询语言，数据库是强大的数据存储容器。   
* fts extetion 全文搜索支持。  
* 
${slippodTag} ${sqliteTag}
    `);
    db.createNewCard(`
全文搜索的意思是你敲下的每一个字都会索引，你在搜索框（快捷键 ctrl+k ） 搜索任何内容都可以在秒级返回。   
${sqliteTag}
${slippodTag}
    `)
    db.createNewCard(`笔记支持 tag。 tag 直接在卡片的内容中插入，格式为:     
\[\#tag\]\(\)

也支持链接到其他任何笔记。格式为:   
\[@\]\(\)   
比如这里 [@${firstCardID}]() 链接到第一条笔记。

[#slippod]()  
    `)

    db.createNewCard(`点击左边的 link 链接可以过滤有相关 tag 的笔记。   
${slippodTag}
    `)

    db.createNewCard(`
如何新建笔记？   
按下 ctrl+k 快捷键后，输入任意内容再按下 enter（回车）即可。  

${slippodTag}
    `)

}());