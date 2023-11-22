let DEFAULT_NOTE_ID = "";
let DEVICE;
const notesContainer = document.querySelector("#notesContainer");

document.addEventListener("DOMContentLoaded", function () {
    // Check if notes list container exists
    if (!document.querySelector("#notesListContainer")) {
        DEFAULT_NOTE_ID = document.querySelector("#notesContainer .note:first-child").getAttribute('data-note-id'); 
    }
    setDevice();
    initializeNotes();
    setupEventListeners();
});

function initializeNotes() {
    if (document.querySelector("#notesListContainer")) { return; }
    const entryNoteElement = document.querySelector("#notesContainer .note:first-child");
    const entryNoteId = entryNoteElement.getAttribute('data-note-id');
    const queryNotes = getQueryNotes();

    // Remove all notes except the entry note
    const notesToBeRemoved = document.querySelectorAll("#notesContainer .note:not(:first-child)"); 
    notesToBeRemoved.forEach(note => note.remove());

    // Load notes from queryNotes excluding the entry note
    queryNotes.forEach(noteId => {
        if (noteId !== entryNoteId) {
            loadNote(noteId);
        }
    });
}

function setupEventListeners() {
    if (notesContainer === null) { return; }

    // Adding event listener for notes container click
    notesContainer.addEventListener("click", handleNotesContainerClick);

    // Adding event listener for notes container scroll
    notesContainer.addEventListener("scroll", handleNotesContainerScroll);

    // Adding event listener for mouse over
    notesContainer.addEventListener("mouseover", handleNotesContainerMouseOver);
    
    // Adding event listener for backlinks tab
    clickHandle(".backlinkTab", switchToBacklinks);
    clickHandle(".outgoingLinkTab", switchToOutgoingLinks);

    // Event listeners for popstate and resize
    window.addEventListener('popstate', initializeNotes);
    window.addEventListener('resize', setDevice);
}

function handleNotesContainerClick(event) {
    let noteId;

    // If the device is small
    if (DEVICE === 'small') {
        const refNoteWrapper = event.target.closest(".refNoteWrapper");
        if (refNoteWrapper) {
            event.preventDefault();
            noteId = refNoteWrapper.getAttribute("data-note-id");
            const noteLink = document.createElement("a");
            noteLink.href = "/note/" + noteId;
            noteLink.click();
            return;
        } else {
            return;
        }
    }

    // Identify the clicked element type
    const isNoteLink = event.target.tagName === 'A' && event.target.hasAttribute("data-note-id");
    const isOutsideRefNoteWrapper = !event.target.closest(".refNoteWrapper");

    // For anchor links not inside .refNoteWrapper
    if (isNoteLink && isOutsideRefNoteWrapper) {
        event.preventDefault();
        noteId = event.target.getAttribute("data-note-id");
    } else if (event.target.closest(".refNoteWrapper")) {
        const refNoteWrapper = event.target.closest(".refNoteWrapper");
        if (refNoteWrapper) {
            event.preventDefault();
            noteId = refNoteWrapper.getAttribute("data-note-id");
        }
    }

    if (!noteId) { return; }

    const currentNotes = [DEFAULT_NOTE_ID].concat(getQueryNotes());
    const targetNote = document.querySelector(`.note[data-note-id="${noteId}"]`);
    const clickedNote = event.target.closest('.note');
    const clickedNoteIndex = currentNotes.indexOf(clickedNote.getAttribute('data-note-id'));

    if (!currentNotes.includes(noteId)) {
        currentNotes.splice(clickedNoteIndex + 1); // Remove notes after the clicked one
        document.querySelectorAll(".note").forEach((node, idx) => {
            if (idx > clickedNoteIndex) {
                node.remove();
                highlightActiveLinks();
            }
        });
        currentNotes.push(noteId);
        loadNote(noteId).then(loadedNote => {
            scrollToNote(loadedNote, clickedNote);
        });
        currentNotes.shift();
        updateQueryParams(currentNotes);
    } else {
        scrollToNote(targetNote, clickedNote);
    }
}

function handleNotesContainerScroll(event) {
    const notes = document.querySelectorAll(".note");
    notes.forEach(note => note.classList.remove('overlap'));
    
    for (let i = 1; i < notes.length; i++) {
        if (isOverlapping(notes[i-1], notes[i])) {
            notes[i].classList.add('overlap');
        }
    }
}

function handleNotesContainerMouseOver(event) {
    if (DEVICE === 'small') { return; }

    const target = event.target;

    if (target.tagName === 'A' && target.hasAttribute("data-note-id") && !target._tippy && !target.closest(".refNoteWrapper")) {
        tippy(target, {
            theme: "light",
            arrow: false,
            content: "Loading...",
            allowHTML: true,
            maxWidth: 300,
            onShow(instance) {
                const noteId = target.getAttribute('data-note-id');
                fetchNoteContent(noteId, false)
                    .then(previewContent => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(previewContent, "text/html");
                        instance.setContent(doc.querySelector(".content"));
                    })
                    .catch(error => {
                        instance.setContent("Error loading preview.");
                    });
            }
        });
        
        // Trigger the tooltip manually since it won't show up automatically the first time after initialization
        target._tippy.show();
    }
}

function switchToBacklinks(event) {
    event.stopPropagation();
    const noteLinks = event.target.closest('.noteLinks');

    noteLinks.querySelector('.backlinkTab').classList.add('selected');
    noteLinks.querySelector('.outgoingLinkTab').classList.remove('selected');

    noteLinks.querySelector('.backlinks').classList.remove('hidden');
    noteLinks.querySelector('.outgoingLinks').classList.add('hidden');
}

function switchToOutgoingLinks(event) {
    event.stopPropagation();
    const noteLinks = event.target.closest('.noteLinks');

    noteLinks.querySelector('.outgoingLinkTab').classList.add('selected');
    noteLinks.querySelector('.backlinkTab').classList.remove('selected');

    noteLinks.querySelector('.outgoingLinks').classList.remove('hidden');
    noteLinks.querySelector('.backlinks').classList.add('hidden');
}

function getQueryNotes() {
    const queryParams = new URLSearchParams(window.location.search);
    const stackednotes = queryParams.get('stackednotes');
    if (stackednotes) {
        return stackednotes.split(",").filter(item => item && item !== DEFAULT_NOTE_ID).map(item => item.trim());
    } else {
        return [];
    }
}

function updateQueryParams(notesList) {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('stackednotes', notesList.join(','));
    window.history.pushState(null, null, `?${queryParams.toString()}`);
}

function fetchNoteContent(noteId, includeLinks = true) {
    return fetch(`/note/${noteId}/index.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.text();
        })
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "text/html");
            if (includeLinks) {
                return doc.querySelector("#notesContainer > div").innerHTML;
            } else {
                return doc.querySelector("#notesContainer .noteWrapper").innerHTML;
            }
        });
}

function loadNote(noteId) {
    return new Promise((resolve, reject) => {
        fetchNoteContent(noteId)
            .then(noteContent => {
                const noteDiv = document.createElement("div");
                noteDiv.className = "note";
                noteDiv.setAttribute("data-note-id", noteId);
                noteDiv.innerHTML = noteContent;

                const scriptTag = noteDiv.querySelector("script");
                if (scriptTag) {
                    scriptTag.remove();
                }

                const noteCount = document.querySelectorAll("#notesContainer .note").length;
                noteDiv.style.left = `${noteCount * 40}px`;
                noteDiv.style.right = "-584px";

                notesContainer.appendChild(noteDiv);
                highlightActiveLinks();
                resolve(noteDiv);  // Resolve the promise with the noteDiv
            })
            .catch(error => {
                console.error("Error loading note:", error);
                reject(error);  // Reject the promise with the error
            });
    });
}

function scrollToNote(targetElm, fromElm) {
    if (targetElm) {
        const allNotes = Array.from(document.querySelectorAll("#notesContainer .note"));

        const targetNoteIndex = allNotes.indexOf(targetElm);
        const containerScrollLeft = notesContainer.scrollLeft;

        let distance = targetNoteIndex * 545 - containerScrollLeft;

        // Home Position
        if (targetNoteIndex === 0) {
            notesContainer.scrollTo({ left: 0, behavior: "smooth" });
            return;
        }

        // End Position
        if (targetNoteIndex === allNotes.length - 1) {
            notesContainer.scrollTo({ left: notesContainer.scrollWidth, behavior: "smooth" });
            return;
        }

        // Relative Backward Navigation and Relative Forward Navigation
        notesContainer.scrollBy({ left: distance, behavior: "smooth" });
    }
}

function highlightActiveLinks() {
    const allNotes = Array.from(document.querySelectorAll("#notesContainer .note")).map(note => note.getAttribute('data-note-id'));
    const allNoteWrappers = Array.from(document.querySelectorAll("#notesContainer .noteWrapper"));

    allNoteWrappers.forEach(wrapper => {
        const allNotesInWrapper = Array.from(wrapper.querySelectorAll('a[data-note-id]'));
        const allLinkNoteIds = allNotesInWrapper.map(link => link.getAttribute('data-note-id'));

        allNotesInWrapper.forEach(link => {
            const noteId = link.getAttribute('data-note-id');
            if (allNotes.includes(noteId)) {
                link.classList.add('active-link');
            } else {
                link.classList.remove('active-link');
            }
        });
    });
}

function setDevice() {
    const viewportWidth = window.innerWidth;

    if (viewportWidth <= 620) {
        DEVICE = 'small';
    } else {
        DEVICE = 'large';
    }
}

function clickHandle(selector, handle) {
    document.addEventListener("click", function(event) {
        if (!event.target.closest(selector)) {
            return;
        }
        handle(event);
    });
}

function isOverlapping(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    return rect1.right > rect2.left;
}

function toggleElementShown(element) {
    element.classList.remove('hidden');
}

function toggleElementHidden(element){
    element.classList.add('hidden')
}