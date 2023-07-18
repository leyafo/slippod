
const db = require("./db.js")
let queue = new Map();

function uploadCardEditing(id, entry){
    queue.set(id, entry);
}

setInterval(function(){
    for (const [id, entry] of queue){
        db.editCardByID(id, entry)
        queue.delete(id);
    }
}, 5000); //update to each 5s


module.exports = {
    uploadCardEditing,
}