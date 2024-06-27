const db = require('./db.js')
function insertSampleData() {
    const welcomeTag = `#slippod/welcome`

    const welcomeCardKeyboard = db.createNewCard(`## Keyboard Shortcuts

### Search
| Action                      | Windows & Linux       | Mac                     |
|-----------------------------|-----------------------|-------------------------|
| Activate search box         | Ctrl + K              | Cmd + K                 |
| Close search box            | Esc                   | Esc                     |
| Select next item            | Arrow Down or Ctrl + N | Arrow Down or Ctrl + N |
| Select previous item        | Arrow Up or Ctrl + P   | Arrow Up or Ctrl + P   |
| Jump to selected item       | Enter                 | Enter                   |
| Create new card (no prompt) | Enter                 | Enter                   |

### Card List
| Action                      | Windows & Linux       | Mac                     |
|-----------------------------|-----------------------|-------------------------|
| Select next card            | Arrow Down or Ctrl + N | Arrow Down or Ctrl + N |
| Select previous card        | Arrow Up or Ctrl + P   | Arrow Up or Ctrl + P   |
| Cancel selection            | Esc                   | Esc                     |
| View selected card          | V                     | V                       |
| Edit selected card          | Enter                 | Enter                   |
| Delete selected card        | Ctrl + D              | Cmd + D                 |

### Card Creation
| Action                      | Windows & Linux       | Mac                     |
|-----------------------------|-----------------------|-------------------------|
| Create new card             | Ctrl + O              | Cmd + O                 |
| Save card                   | Ctrl + S              | Cmd + S                 |
| Save and exit edit mode     | Ctrl + Enter          | Cmd + Enter             |

### Card Editting
| Action                      | Windows & Linux       | Mac                     |
|-----------------------------|-----------------------|-------------------------|
| Copy                        | Ctrl + C              | Cmd + C                 |
| Paste                       | Ctrl + V              | Cmd + V                 |
| Select all                  | Ctrl + A              | Cmd + A                 |
| Undo                        | Ctrl + Z              | Cmd + Z                 |
| Redo                        | Ctrl + Shift + Z      | Cmd + Shift + Z         |
| Move to line start          | Ctrl + A              | Ctrl + A                |
| Move to line end            | Ctrl + E              | Ctrl + E                |
| Move cursor forward one char| Ctrl + F              | Ctrl + F                |
| Move cursor backward one char| Ctrl + B              | Ctrl + B               |
| Move cursor up one line     | Ctrl + P              | Ctrl + P                |
| Move cursor down one line   | Ctrl + N              | Ctrl + N                |
| Move cursor backward one word| Alt + B               | Alt + B                |
| Move cursor forward one word| Alt + F               | Alt + F                 |
| Move to start               | Ctrl + Arrow Up       | Cmd + Arrow Up          |
| Move to end                 | Ctrl + Arrow Down     | Cmd + Arrow Down        |
| Select forward one char     | Ctrl + Shift + F      | Ctrl + Shift + F        |
| Select backward one char    | Ctrl + Shift + B      | Ctrl + Shift + B        |
| Select forward one word     | Alt + Shift + B       | Alt + Shift + B         |
| Select backward one word    | Alt + Shift + F       | Alt + Shift + F         |
| Select to line start        | Ctrl + Shift + A      | Ctrl + Shift + A        |
| Select to line end          | Ctrl + Shift + E      | Ctrl + Shift + E        |
| Delete forward one word     | Ctrl + W              | Ctrl + W                |
| Delete backward one word    | Alt + D               | Alt + D                 |
| Delete to line start        | Ctrl + U              | Ctrl + U                |
| Delete to line end          | Ctrl + K              | Ctrl + K                |

---

${welcomeTag}`)

    const welcomeCardPrivacy = db.createNewCard(`## 🔒 Data privacy
Your data security is our top priority. In Slippod, all your data is stored locally and you can back it up anywhere you want. Since we use SQLite which is an open source database technology, you can directly read the database file with tools available free. 

We don't track you. The only server interaction is for license verification, nothing more. 

---

${welcomeTag}`)

    const welcomeCardBackup = db.createNewCard(`## 💾 Backup your cards
Slippod uses a local database technology called SQLite. All your cards are stored locally in a database file. Backing up your cards is as simple as saving that database file.

To backup your cards, follow the steps below:
1. Go to Settings (\`⌘+, / Ctrl+,\`)
2. Look up the folder your database file is stored
3. Open the folder and copy the database file to where you want to back it up

---

${welcomeTag}`)

    const welcomeCardSearch = db.createNewCard(`## 🔍 How to use search
Slippod supports full text search. To search your cards, click the search bar on top (\`⌘+K / Ctrl+K\`) and type what you are search for. Since all your data is stored locally, search is incredibly fast. 

---

${welcomeTag}`)
    
    const welcomeCardDetails = db.createNewCard(`## View a card's incoming and outgoing cards
If you are famillar with the concepts of networked thoughts or Zettelkasten, you are likely familar with bidirectional links between a note. Slippod supports bidirectional linking out of the box. 

To view bidirectional linked cards for a specific card, simply click an \`@id\` on any card and a card details window should open to display all the incoming cards and outgoing cards of the card.

![Slippod card details](https://download.slippod.com/slippod-card-details.png)

---

${welcomeTag}`)

    const welcomeCardMultiWindows = db.createNewCard(`## View cards from different tags side by side
You can open as many Slippod windows as you need. To clone a Slippod window, all you need to do is click the Duplicate window icon on the top right corner.

![Duplicate window icon](https://download.slippod.com/slippod-app-ui-window-clone.png)

With multiple windows, you can view cards from different tags side by side. This will allow you to understand how different cards are related from different topics.

![Multiple windows side by side](https://download.slippod.com/slippod-multiple-windows.png)

---

${welcomeTag}`)

    const welcomeCardHashLink = db.createNewCard(`## Reference other cards
You can reference other cards by using \`@\`, like @${welcomeCardFirst}. Simply typing \`@\` will bring up an auto-suggested list of cards and you can continue to type to search the specific card you want to reference.

---

${welcomeTag}`)

    const welcomeCardNestedTags = db.createNewCard(`## Organize tags with nested tags
You can create nested tags by using \`/\`, like ${welcomeTag}. This allows you to organize your topics or themes in a hierarchical way.

---

${welcomeTag}`)

    const welcomeCardTagging = db.createNewCard(`## Using tags in a card
Slippod uses tags to organize cards since a card can belong to multiple categories. Just like social media, you can tag a card simply using the \`#\` symbol, like \`#slippod\`, and they can go anywhere in your cards. Slippod's Sidebar will collect your tags, and you can click a tag to instantly see all cards that contain it. 

---

${welcomeTag}`)

    const welcomeCardMoreThanText = db.createNewCard(`## More than text
Your card can contain images, videos, e.g.,

![Buzz Lightyear](https://lumiere-a.akamaihd.net/v1/images/gallery_toystory_03jpg_2abbab4f.jpeg)

<iframe width="560" height="315" src="https://www.youtube.com/embed/BwZs3H_UN3k?si=VdTLBmYxE8hv--c0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Bascially anything that's stardard HTML syntax can be included in a card.

---

${welcomeTag}`)

    const welcomeCardMarkdown = db.createNewCard(`## Writing with styles using markdown
You can write markdown syntax to add all kinds of text styles and formatting your cards in a structureed way.

For a full reference of what markdown syntax you can use, you can check out [this](https://sindresorhus.com/github-markdown-css/).

---

${welcomeTag}`)

    const welcomeCardEditing = db.createNewCard(`## Editing a card
For any card you want to edit, simply double clicks it to enter editting mode to make your edits. Once done editing, click the paper plane button to save it (\`⌘+Enter / Ctrl+Enter\`).

---

${welcomeTag}`)

    const welcomeCardNewCard = db.createNewCard(`## How to create a new cards
Simply click the always present top compose box at the top your current card stack (\`⌘+O / Ctrl+O\`), type what you want to note down and click the paper plane button to save it (`⌘+Enter / Ctrl+Enter`).

![Slippod compose box](https://download.slippod.com/slippod-app-ui-compose-box.png)

---

${welcomeTag}`)

    const welcomeCardFirst = db.createNewCard(`## 🎉 Welcome to Slippod 👋

Slippod is a simple, privacy-first note-taking app designed specifically for your desktop. Effortlessly capture notes while you read, watch, or listen. Perfect for focused work, Slippod helps you organize your thoughts without distractions.

To get started, click any of the referenced cards below to learn more about a feature or topic.

---

### 🚀 Get started
* 📝 How to create a new card @${welcomeCardNewCard}
* 🖍️ Formatting cards
  * Editing a card @${welcomeCardEditing}
  * Write with styles using markdown @${welcomeCardMarkdown}
  * More than text @${welcomeCardMoreThanText}
* 🗃️ Oganizing cards
  * Use tags in a card @${welcomeCardTagging}
  * Organize tags with nested tags @${welcomeCardNestedTags}
  * Reference other cards @${welcomeCardHashLink}
* 👀 Viewing cards
  * View cards from different tags side by side @${welcomeCardMultiWindows}
  * View a card's incoming and outgoing cards @${welcomeCardDetails}
* 🔍 How to use search @${welcomeCardSearch}
* 💾 Backup your cards @${welcomeCardBackup}

### 🛠️ Under the hood
* 🔒 Data privacy @${welcomeCardPrivacy}
* ⌨️ Keyboard shortcuts @${welcomeCardKeyboard}

---

Thank you for trying out Slippod. You can use Slippod for free for 14 days. After the free trial period, a license is required to continue using the app.

As we are now in the beta testing phase, we are gifting free licenses to our beta testers. All you have to do is [send us an email](https://slippod.com/pricing/) to request your free license.

${welcomeTag}`)

}

module.exports = {
    insertSampleData,
}