//bind the global variable
db.getTagRegex().then(function(regex){
    window.tagRegex = regex;
});

db.getLinkAtRegex().then(function(regex){
    window.linkAtRegex = regex;
})

import "./statemachine.js";
import "./ui.js";
import "./keys.js";
import "./autocomplete.js";
