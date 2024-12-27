document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');

    // Load todos from localStorage
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function getFormattedDateTime() {
        return new Date().toLocaleString();
    }

    function createTodoElement(todo) {
        const li = document.createElement('li');
        li.draggable = true;
        li.setAttribute('data-todo-id', todo.id);
        li.innerHTML = `
            <span class="todo-text">${todo.text}</span>
            <div class="timestamp">Last updated: ${todo.timestamp}</div>
            <div class="todo-actions">
                <i class="fas fa-edit"></i>
                <i class="fas fa-trash-alt"></i>
            </div>
        `;

        if (todo.completed) {
            li.classList.add('checked');
        }

        // Toggle completion
        li.addEventListener('click', (e) => {
            if (!e.target.classList.contains('fa-edit') && 
                !e.target.classList.contains('fa-trash-alt') &&
                !e.target.classList.contains('editing')) {
                li.classList.toggle('checked');
                todo.completed = !todo.completed;
                saveTodos();
            }
        });

        // Edit todo
        li.querySelector('.fa-edit').addEventListener('click', () => {
            const todoTextElement = li.querySelector('.todo-text');
            const currentText = todoTextElement.textContent;
            
            // Create input element
            const inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.value = currentText;
            inputElement.classList.add('edit-input');
            
            // Replace text with input
            todoTextElement.replaceWith(inputElement);
            inputElement.focus();
            
            // Handle input blur and enter key
            const handleEdit = () => {
                const newText = inputElement.value.trim();
                if (newText !== '') {
                    todo.text = newText;
                    todo.timestamp = getFormattedDateTime();
                    const newSpan = document.createElement('span');
                    newSpan.classList.add('todo-text');
                    newSpan.textContent = newText;
                    inputElement.replaceWith(newSpan);
                    li.querySelector('.timestamp').textContent = `Last updated: ${todo.timestamp}`;
                    saveTodos();
                } else {
                    inputElement.replaceWith(todoTextElement);
                }
            };

            inputElement.addEventListener('blur', handleEdit);
            inputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleEdit();
                }
            });
        });

        // Delete todo
        li.querySelector('.fa-trash-alt').addEventListener('click', () => {
            li.remove();
            todos = todos.filter(t => t !== todo);
            saveTodos();
        });

        // Add drag event listeners
        li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', todo.id);
            li.classList.add('dragging');
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
        });

        return li;
    }

    function initializeDragAndDrop() {
        const todoList = document.getElementById('todo-list');

        todoList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = document.querySelector('.dragging');
            const siblings = [...todoList.querySelectorAll('li:not(.dragging)')];
            
            const nextSibling = siblings.find(sibling => {
                const box = sibling.getBoundingClientRect();
                const offset = e.clientY - box.top - box.height / 2;
                return offset < 0;
            });

            todoList.insertBefore(draggingItem, nextSibling);
        });

        todoList.addEventListener('drop', (e) => {
            e.preventDefault();
            // Update todos array to match new order
            const newTodos = [];
            todoList.querySelectorAll('li').forEach(li => {
                const todo = todos.find(t => t.id === li.getAttribute('data-todo-id'));
                if (todo) newTodos.push(todo);
            });
            todos = newTodos;
            saveTodos();
        });
    }

    function addTodo() {
        const todoText = todoInput.value.trim();
        if (todoText) {
            const todo = {
                id: Date.now().toString(),
                text: todoText,
                completed: false,
                timestamp: getFormattedDateTime()
            };
            todos.push(todo);
            todoList.appendChild(createTodoElement(todo));
            todoInput.value = '';
            saveTodos();
        }
    }

    // Event listeners
    addButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // Load existing todos
    todos.forEach(todo => {
        todoList.appendChild(createTodoElement(todo));
    });

    initializeDragAndDrop();
});
