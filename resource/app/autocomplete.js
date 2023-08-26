function showCustomMenu(cm) {
    var cursor = cm.getCursor(); // Get the current cursor position
    var coords = cm.cursorCoords(cursor, 'window'); // Get the coordinates of the cursor

    var menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.left = coords.left + 'px';
    menu.style.top = coords.bottom + 'px';
    menu.className = 'custom-menu';
    
    // Populate menu with your custom HTML
    menu.innerHTML = '<div>Your HTML here</div>';

    // Attach event handlers, etc. as needed for the menu items

    document.body.appendChild(menu);

    // Close the menu if clicked outside
    document.addEventListener('click', function closeMenu(event) {
        if (!menu.contains(event.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

function autocompleteHints(cm, option) {
  cm.on("shown", function () {
    console.log("hhhhkdjfls");
  });
  return new Promise(function (accept) {
    let cursor = cm.getCursor(),
      lineContent = cm.getLine(cursor.line),
      token = cm.getTokenAt(cursor);
    let signalCh = lineContent[cursor.ch - 1];
    console.log(token, signalCh);
    if (signalCh == "#") {
      db.getAllTags().then(function (tags) {
        let hints = [];
        for (let t of tags) {
          hints.push({
            text: `[${t.tag}](/tag/${t.tag})`,
            displayText: t.tag,
          });
        }
        return accept({
          list: hints,
          from: { line: cursor.line, ch: cursor.ch - 1 },
          to: cursor,
        });
      });
    } else if (signalCh == "@") {
    }
  });
}

CodeMirror.defineMode("hashtags", function (config, parserConfig) {
    var hashtagOverlay = {
    token: function (stream, state) {
        if (stream.match(/#[a-zA-Z0-9_]+/)) {
        return "hashtag";
        }
        while (
        stream.next() != null &&
        !stream.match(/#[a-zA-Z0-9_]+/, false)
        ) {}
        return null;
    },
    };
    return CodeMirror.overlayMode(
    CodeMirror.getMode(config, parserConfig.backdrop || "markdown"),
    hashtagOverlay
    );
});

export {
    autocompleteHints,
}