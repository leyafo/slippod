const States = {
    Viewing: 1,
    Editing: 2,
    Searching: 3,
};

class StateMachine{
    #state = States.Viewing;
    setEditing() {
        this.#state = States.Editing;
    };
    isEditing(){
        return this.#state == States.Editing;
    }
    setViewing(){
        this.#state = States.Viewing;
    }
    isViewing(){
        return this.#state == States.Viewing;
    }
    setSearching(){
        this.#state = States.Searching;
    }
    isSearching(){
        return this.#state == States.Searching;
    }

    showStateText(){
        switch(this.#state){
        case States.Viewing:
            return 'viewing';
        case States.Editing:
            return 'editing';
        case States.Searching:
            return 'searching';
        }
    }
}

window.globalState = new StateMachine();
