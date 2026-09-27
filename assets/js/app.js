const todoForm = document.getElementById("todoForm");
const spinner = document.getElementById("spinner");
const updateTodoBtn = document.getElementById("updateTodoBtn");

const baseTodoUrl = `https://posts-crud-c2796-default-rtdb.firebaseio.com`;


function snackBar(msg, icon) {
    Swal.fire({
        text: msg,
        icon: icon,
        timer: 3000
    })
}

const localState = {
    todoArray: [],
    editId: null
}

function handleSpinner(flag) {
    if (flag) {
        spinner.classList.remove("d-none");
    } else {
        spinner.classList.add("d-none");
    }
}


//raad 

function fetchTodoData() {
    const todoUrl = `${baseTodoUrl}/todo.json`;
    handleSpinner(true);
    fetch(todoUrl, {
        body: null,
        headers: {
            "Content-type": "application/json",
            "security": "JWT token",
        },
        method: "GET"
    })
        .then(res => {
            return res.json();
        })
        .then(data => {
            for (let key in data) {
                data[key].id = key;
                localState.todoArray.unshift(data[key]);
            }

            createTodos(localState.todoArray);
        })
        .catch(err => {
            console.log("Error while fetching todo data", err);
            snackBar(`error while fetching data`, "error");
        })
        .finally(() => {
            console.log("Api call completed");
            handleSpinner();
        })
}

function createTodos(arr) {
    const todoContainer = document.getElementById("todoContainer");
    let res = "";
    arr.forEach(todo => {
        res += `
            <li class="list-group-item d-flex justify-content-between" id="${todo.id}">
                <strong>${todo.todoItem}</strong>
                <div>
                    <button onclick="onEdit(this)" class="btn btn-sm btn-outline-info mr-2">Edit</button>
                    <button onclick="onDelete(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                </div>
            </li>
        `
    });
    todoContainer.innerHTML = res;
}

fetchTodoData();

// create

function onTodoCreate(event) {
    const todoContainer = document.getElementById("todoContainer");
    const todoUrl = `${baseTodoUrl}/todo.json`;
    const todoInput = document.getElementById("todoInput");
    event.preventDefault();
    const todoObj = {
        todoItem: todoInput.value
    }
    handleSpinner(true);
    fetch(todoUrl, {
        method: "POST",
        body: JSON.stringify(todoObj),
        headers: {
            "Content-type": "application/json",
            "security": "JWT token",
        }
    })
        .then(res => {
            return res.json();
        })
        .then(data => {
            todoObj.id = data.name;
            localState.todoArray.unshift(todoObj);
            todoForm.reset();
            //create li on ui

            let newLi = document.createElement("li");
            newLi.id = todoObj.id;
            newLi.className = "list-group-item d-flex justify-content-between";
            newLi.innerHTML = `
            <strong>${todoObj.todoItem}</strong>
            <div>
                <button onclick="onEdit(this)" class="btn btn-sm btn-outline-info mr-2">Edit</button>
                <button onclick="onDelete(this)" class="btn btn-sm btn-outline-danger">Remove</button>
            </div>
        `;
            todoContainer.prepend(newLi);
            snackBar(`Todo added successfully`, "success");
        })
        .catch(err => {
            snackBar(`Error while creating new todo`, err);
        })
        .finally(() => {
            handleSpinner();
        })
}


function onEdit(ele) {
    const addTodoBtn = document.getElementById("addTodoBtn");
    const todoInput = document.getElementById("todoInput");
    const editId = ele.closest("li").id;
    localState.editId = editId;
    const editObj = localState.todoArray.find(todo => todo.id === editId);
    todoInput.value = editObj.todoItem;
    addTodoBtn.classList.add("d-none");
    updateTodoBtn.classList.remove("d-none");
}

function onTodoUpdate() {
    const todoInput = document.getElementById("todoInput");
    const udpateId = localState.editId;
    const updateUrl = `${baseTodoUrl}/todo/${udpateId}.json`;
    const udpatedObj = {
        todoItem: todoInput.value
    }
    handleSpinner(true)
    fetch(updateUrl, {
        method: "PATCH",
        body: JSON.stringify(udpatedObj),
        headers: {
            "Content-type": "application/json",
            "security": "JWT token",
        }
    })
        .then(res => {
            return res.json();
        })
        .then(data => {
            const udpdateIndex = localState.todoArray.findIndex(todo => todo.id === udpateId);
            localState.todoArray[udpdateIndex] = udpatedObj;
            let udpateLi = document.getElementById(udpateId);
            udpateLi.querySelector("strong").innerText = udpatedObj.todoItem;
            todoForm.reset();
            const addTodoBtn = document.getElementById("addTodoBtn");
            addTodoBtn.classList.remove("d-none");
            updateTodoBtn.classList.add("d-none");
            snackBar(`Todo with id : ${udpateId} is updated successfully...`, "success");
        })
        .catch(err => {
            snackBar(`Error while updating todo !!!`, "error")
        })
        .finally(() => {
            handleSpinner();
        })
}


//delete
function onDelete(ele) {
    const deleteId = ele.closest("li").id;
    const delelteUrl = `${baseTodoUrl}/todo/${deleteId}.json`
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            handleSpinner(true)
            fetch(delelteUrl, {
                method: "Delete",
                body: null,
                headers: {
                    "Content-type": "application/json",
                    "security": "JWT token"
                }
            })
                .then(res => {
                    return res.json();
                })
                .then(data => {
                    const deleteIndex = localState.todoArray.findIndex(todo => todo.id === deleteId);
                    localState.todoArray.splice(deleteIndex, 1);
                    ele.closest("li").remove();
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your todo has been deleted.",
                        icon: "success"
                    });
                })
                .catch(err => {
                    snackBar(`Todo with id ${deleteId} is removed successfully...`);
                })
                .finally(() => {
                    handleSpinner();
                })

        }
    });
}


todoForm.addEventListener("submit", onTodoCreate);
updateTodoBtn.addEventListener("click", onTodoUpdate)