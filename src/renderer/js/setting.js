document.addEventListener('DOMContentLoaded', () => {
    fs.getDBPath().then(function(path){
      document.getElementById("DBPath").textContent = path;
    })
    document.addEventListener("click", function(event){
        if(!event.target.closest("#filePicker")){
            return
        }
        document.getElementById("filePicker").disabled = true;
        fs.filePicker().then(function(path){
          document.getElementById("filePicker").disabled = false;
          document.getElementById("DBPath").textContent = path[0];
        });
    })
})

console.log("setting.js loaded");