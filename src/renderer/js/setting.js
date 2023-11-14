import * as CM from './common.js';
const settingsWindow = document.getElementById('settingsWindow');

function settingsTemplate() {
    const template = `<div id="dbForm" class="form">
                        <div class="formBody">
                            <div class="formField">
                                <div class="fieldHeader">
                                    <label>Database</label>
                                    <p class="fieldDesc">You can change your database to your desired folder. Be sure to copy the existing database and store it with the same name as slippod.db in your desired folder.</p>
                                </div>
                                <div class="fieldInput">
                                    <input id="dbPath" type="text" readonly>
                                    <p class="inputError"></p>
                                </div>
                            </div>
                        </div>
                        <div class="formCtrlBar">
                            <button id="changeDBBtn" class="small"><span class="icon"></span><span class="label">Change Database</span></button>
                        </div>
                    </div>`;
    return CM.htmlToElement(template);
}

async function initWindow() {
    initDBForm();
};

async function initDBForm() {
    const settingsContainerDiv = settingsTemplate();

    const dbPathInput = settingsContainerDiv.querySelector('#dbPath');
    const changeDBBtn = settingsContainerDiv.querySelector('#changeDBBtn');

    let dbPath = await fs.getDBPath();
    dbPathInput.value = dbPath;

    changeDBBtn.addEventListener('click', async (event) =>  {
        event.stopPropagation();
        event.preventDefault();

        changeDBBtn.disabled = true;
        changeDBBtn.classList.add('saving');

        dbPath = await fs.filePicker();
        if (dbPath) {
            dbPathInput.value = dbPath;
            changeDBBtn.disabled = false;
            changeDBBtn.classList.remove('saving');
        } else {
            changeDBBtn.disabled = false;
            changeDBBtn.classList.remove('saving');
        }
    });

    settingsWindow.appendChild(settingsContainerDiv);
}

window.addEventListener('DOMContentLoaded', function(event) {
    initWindow();
});