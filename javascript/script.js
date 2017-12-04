//Getting Elements from the HTML
var inputTexto = document.getElementById("inputText");  //Text input
var inputDate = document.getElementById("dateBox");     //Date input
var firstRadio = document.getElementById("veryImp");    //first of two radios
var mybutton = document.getElementById("mybutton");   //Button
var notValidDateSpan = document.getElementById("dateError");    //Space for the dateError
var notValidNote = document.getElementById("noteError");    //Space for the note error

var postitPlace = document.getElementById("postitList"); //Space in the HTML for the Post It


//Valid Regex DD/MM/YYYY
var validDate =  /^(0[1-9]|[12][0-9]|3[01])[\- \/.](?:(0[1-9]|1[012])[\- \/.](19|20)[0-9]{2})$/;

//Creo que esto no hace falta 
var idVirtual = 0;

//Array of notes
var noteArray = [];

var importance_level;
//Function constructor
var Note = function (noteText, noteDate, importance_level, idVirtual) {
    "use strict";
    this.noteText = noteText;
    this.noteDate = noteDate;
    this.importance_level = importance_level;
    this.idVirtual = idVirtual;
};


function dateValidation(date) {
    if (!validDate.test(date.value)) {
        notValidDateSpan.style.visibility = "visible";
        date.focus();
        return false;
    } else {
        notValidDateSpan.style.visibility = "hidden";
        return true;
    }
}

function noteValidation(textArea) {
    if (textArea.value === "") {
        notValidNote.style.visibility = "visible";
        textArea.focus();
        return false;
    } else {
        notValidNote.style.visibility = "hidden";
        return true;
    }
}

//Global proccess: Validation -> Add note to the array -> Print note on screen -> Save notes on LocalStorage
var newNote;
function createNewNote(e) {
    "use strict";
    e.preventDefault();
    if (noteValidation(inputTexto) && dateValidation(inputDate)) {
        noteToArray();
        newPositToView(newNote);
        resetForm();
        saveToLocalStorage(noteArray);
    }
}

mybutton.addEventListener("click", createNewNote);  //Adding global proccess to button

//Each note in Array will have a property called idVirtual /unique in each note/  (it will be also the id of the postIt built after the validation proccess) It is the way I will use to localize the note in the array  to remove it from it.
var idSimulator = 0;
var idSimulatorString;
function noteToArray() {
    idSimulatorString = idSimulator.toString();
    if (firstRadio.checked) {  //Veryfing the importance level of the task.
        importance_level = "Very important";
    } else {
        importance_level = "Not so important";
    }
    newNote = new Note(inputTexto.value, inputDate.value, importance_level, idSimulatorString);
    noteArray.push(newNote);
    idSimulator += 1;
}

var trashButtonD;
var postItDiv;

function newPositToView(a) {
    "use strict";
    //Creating elements
    postItDiv = document.createElement("div");
    var postItText = document.createElement("div");
    var postItDate = document.createElement("div");
    trashButtonD = document.createElement("div");
    var trashIcon = document.createElement("span");
    
    //appending + className
    postitPlace.appendChild(postItDiv);
    if (importance_level === "Very important") {
        postItDiv.className = "thePostIt thePostItImportant col-xs-4";  //If it is a very important task, I use another image for the                                                                      background
    } else {
        postItDiv.className = "thePostIt col-xs-4";
    }
    postItDiv.appendChild(postItText);
    postItText.className = "theNoteInside";
    postItDiv.appendChild(postItDate);
    postItDate.className = "theDateInside";
    postItDiv.appendChild(trashButtonD);
    trashButtonD.appendChild(trashIcon);
    trashButtonD.className = "trashButtonD";
    trashIcon.className = "glyphicon glyphicon-trash trash_icon trashDiv";
    setTimeout(fadingIn, 1);
    //Send values to HTML
    //console.log(newNote.noteText);
    postItText.innerHTML = a.noteText; //With this font i need an extra space after first letter.
    postItDate.innerHTML = a.noteDate;
    postItDiv.id = Number.parseInt(a.idVirtual);

    //Adding listener to the Trash Button.
    trashButtonD.addEventListener("click", removePostIt);
    trashButtonD.addEventListener("click", removeFromArray);
    
    inputTexto.focus();
}

function fadingIn() {
    postItDiv.style.opacity = "1";
}

function resetForm() {
    "use strict";
    document.getElementById("inputText").value = "";
    inputDate.value = "";
    document.getElementById("normalImp").checked = true; //Default selection
}


//Removing the element from the HTML
var idDeleted;
var postItToDelete;
function removePostIt() {
    "use Strict"
    //Detect and save the ID of the clicked parent Element
    idDeleted = this.parentElement.getAttribute("id");
    postItToDelete = document.getElementById(idDeleted);
    //Animation to hide through opacity
    postItToDelete.className += " deletingNOW";
    //Function that remove the div from the HTML, with a delay =  duration of the animation
    setTimeout(removeElement, 1000);
    function removeElement() {
        postItToDelete.parentElement.removeChild(postItToDelete);
    }
}

//Removing the object from the array
function removeFromArray() {
    "use strict";
    var j;
    for (j = 0; j < noteArray.length; j += 1) {  //I need to find which position in array ocuppies the postIt removed. (id of the div = idVirtualproperty); 
        if (noteArray[j].idVirtual == idDeleted) {
            console.log(j);
            noteArray.splice(j, 1);
        }
    }
    saveToLocalStorage(noteArray); //EXPLICAR POR QUE ALMACENO TODO Y NO UNA A UNA
}



//Save notes in Local Storage
var lastSessionNoteArrayString;
function saveToLocalStorage(a) {
    lastSessionNoteArrayString = JSON.stringify(a);
    localStorage.setItem("lastSessionNoteArrayJSON", lastSessionNoteArrayString);
}



//Get notes from Local Storage. I decided to save it in an unique string, and not each note in a different string so as to preserve the order when I send them to the HTML and when I add new not after getting the last notes from the HTML.
var lastNoteArrayString;
var lastNoteArrayParse;
var lastIdNo;
function getAllNotesFromLocalStorage() {
    if (localStorage.getItem("lastSessionNoteArrayJSON") === null ||                localStorage.getItem("lastSessionNoteArrayJSON") === "[]") {
        return false;
    }
    LastNoteArrayString =  localStorage.getItem("lastSessionNoteArrayJSON");
    lastNoteArrayParse = JSON.parse(LastNoteArrayString);
    noteArray = lastNoteArrayParse;
    var arrPosition = 0;
    while (arrPosition < noteArray.length) {
        //console.log(noteArray[arrPosition]);
        newPositToView(noteArray[arrPosition]);
        postItDiv.style.opacity = "1";
        arrPosition += 1;
    }
    //The first new note must have an idVirtual+1 than last saved note
    var lastId = noteArray[noteArray.length - 1].idVirtual;
    lastIdNo = Number.parseInt(lastId);
    idSimulator = lastIdNo;
    idSimulator += 1;  
}

window.onload = getAllNotesFromLocalStorage();