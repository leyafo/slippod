const db = require('./db.js')
function insertSampleData() {
    const slippodTag = `#slippod`
    const sqliteTag = `#sqlite`

    const slippodHowToSearchCardID = db.createNewCard(`${sqliteTag} ${slippodTag} **如何全文搜索？**
    
全文搜索的意思是你敲下的每一个字都会索引，你在搜索框（快捷键 Ctrl / CMD + K ） 搜索任何内容都可以在秒级返回。`)

    const slippodTechSQLiteCardID = db.createNewCard(`${slippodTag} ${sqliteTag} **Slippod 采用 SQLite 做数据存储**
    
SQLite 的好处有：
* Local first，你的数据永远只属于你；
* 小巧，一个文件可以存储所有数据；
* 功能强大，一个拥有全功能的数据库； 
* 无须安装任何三方软件，如打开一个文件一样的加载数据库；
* SQL 是最强大的查询语言；  
* 支持全文搜索 @${slippodHowToSearchCardID} 。`)

    db.createNewCard(`${slippodTag} **如何使用 tag 整理卡片？**

笔记支持 tagging。 在卡片中可直接插入 tag，格式为:  ${slippodTag}。`)

    db.createNewCard(`${slippodTag} **如何建立笔记的双链？**

输入 @ 链接到其他笔记，建立笔记间的双链。比如： @${slippodTechSQLiteCardID} 。`)

    db.createNewCard(`${slippodTag} **如何新建笔记？**

* Ctrl / Cmd + O 激活输入框， Ctrl / Cmd + Enter 提交新建笔记。 
* 按下 Ctrl + K 输入任意内容，如没有搜索到任何内容，再按下 Enter 键即可快速新建笔记。`)

    db.createNewCard(`${slippodTag} **Slippod快捷键**

| 类目   | 操作        | Windows & Linux       | Mac                   |
|------|-----------|-----------------------|-----------------------|
| 搜索   | 激活搜索框     | Ctrl + K              | Cmd + K               |
| 搜索   | 关闭搜索框     | Esc                   | Esc                   |
| 搜索   | 向下选下一条目   | Arrow Down / Ctrl + N | Arrow Down / Ctrl + N |
| 搜索   | 向上选上一条目   | Arrow Up / Ctrl + P   | Arrow Up / Ctrl + P   |
| 搜索   | 跳转所选条目    | Enter                 | Enter                 |
| 搜索   | 新建卡片（无提示） | Enter                 | Enter                 |
| 卡片列表 | 选下一张卡片    | Arrow Down / Ctrl + N | Arrow Down / Ctrl + N |
| 卡片列表 | 选上一张卡片    | Arrow Up / Ctrl + P   | Arrow Up / Ctrl + P   |
| 卡片列表 | 取消选中状态    | Esc                   | Esc                   |
| 卡片列表 | 查看选中卡片    | V                      |V                   |
| 卡片列表 | 编辑所选卡片    | Enter                 | Enter                 |
| 卡片列表 | 删除所选卡片    | Ctrl + D              | Cmd + D              |
| 卡片   | 新建卡片      | Ctrl + O              | Cmd + O               |
| 卡片   | 保存卡片      | Ctrl + S                | Cmd + S                 |
| 卡片   | 保存卡片且退出编辑 | Ctrl + Enter          | Cmd + Enter           |
| 文本编辑 | 复制        | Ctrl + C                | Cmd + C                 |
| 文本编辑 | 粘贴        | Ctrl + V                | Cmd + V               |
| 文本编辑 | 全选        | Ctrl + A                | Cmd + A               |
| 文本编辑 | 回撤        | Ctrl + Z              | Cmd + Z               |
| 文本编辑 | 向前回撤      | Ctrl + Shift + Z      | Cmd + Shift + Z       |
| 文本编辑 | 移动到行首     | Ctrl + A                | Ctrl + A                |
| 文本编辑 | 移动到行尾     | Ctrl + E                | Ctrl + E                |
| 文本编辑 | 光标前移一个字符  | Ctrl + F                | Ctrl + F                |
| 文本编辑 | 光标后移一个字符  | Ctrl + B                | Ctrl + B                |
| 文本编辑 | 光标向上移动一行  | Ctrl + P                | Ctrl + P                |
| 文本编辑 | 光标向下移动一行  | Ctrl + N                | Ctrl + N                |
| 文本编辑 | 光标后移一个单词  | Alt + B                 | Alt + B                 |
| 文本编辑 | 光标前移一个单词  | Alt + F                 | Alt + F                 |
| 文本编辑 | 光标移到开始  | Ctrl + Arrow Up                 |Cmd + Arrow Up                 |
| 文本编辑 | 光标移到结束  |  Ctrl + Arrow Down                 |Cmd + Arrow Down                 |
| 文本编辑 | 向前选中一个字符  | Ctrl + Shift + F          | Ctrl + Shift + F          |
| 文本编辑 | 向后选中一个字符  | Ctrl + Shift + B          | Ctrl + Shift + B          |
| 文本编辑 | 向前选中一个单词  | Alt + Shift + B           | Alt + Shift + B           |
| 文本编辑 | 向后选中一个单词  | Alt + Shift + F           | Alt + Shift + F           |
| 文本编辑 | 选中至行首     | Ctrl + Shift+A          | Ctrl + Shift + A          |
| 文本编辑 | 选中至行尾     | Ctrl + Shift+E          | Ctrl + Shift + E          |
| 文本编辑 | 向后删除一个单词  | Ctrl + W                | Ctrl + W                |
| 文本编辑 | 向前删除一个单词  | Alt + D                 | Alt + D                 |
| 文本编辑 | 删除到行首     | Ctrl + U                | Ctrl + U                |
| 文本编辑 | 删除到行尾     | Ctrl + K                | Ctrl + K                |`)

}

module.exports = {
    insertSampleData,
}