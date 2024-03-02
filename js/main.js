Vue.component('kanban', {
    template: `
        <div class='app'> 
            <h1>KABAN TABLE</h1>
            <create-task-form @task-created="createTask"></create-task-form>
            <div class="columns">
                <column title="Planned tasks" :tasks="plannedTasks" @task-moved="moveTask" @task-delete="deleteTask"></column>
                <column title="Tasks in progress" :tasks='inProgressTasks' @task-moved="moveTask"></column>
                <column title="Task in testing" :tasks="testingTasks" @task-moved="moveTask"></column>
                <column title="Completed Task" :tasks="completedTasks" @task-returned="returnTask"></column>
            </div>
        </div>
    `,
    data() {
        return {
            plannedTasks: [],
            inProgressTasks: [],
            testingTasks: [],
            completedTasks: []
        }
    },
    methods: {
        createTask(task) {
            this.plannedTasks.push(task);
        },
        moveTask({task, targetColumn}) {
            this[task.column].splice(this[task.column].indexOf(task), 1);
            this[targetColumn].push({...task, column: targetColumn, lastEdited: new Date()});
        },
        returnTask({task, targetColumn}){
            this[task.column].splice(this[task.column].indexOf(task), 1);
            this[targetColumn].push({...task, column: targetColumn, lastEdited: new Date()});
        },
        deleteTask(task){
            const index = this[task.column].findIndex(t => t === task);
            if (index !== -1) {
                this[task.column].splice(index, 1);
            }
        }

    }
})

Vue.component('create-task-form', {
    template: `
        <div class="task-form">
            <h2>Create task</h2>
            <input type="text" v-model="title" placeholder="Title">
            <textarea v-model="description" placeholder="Description"></textarea>
            <input type="date" v-model="deadline">
            <button @click="createTask">Create</button>
        </div>
   `,
    data() {
        return {
            title: '',
            description: '',
            deadline: ''
        }
    },
    methods: {
        createTask() {
            const newTask = {
                title: this.title,
                description: this.description,
                deadline: this.deadline,
                lastEdited: new Date(),
                column: 'plannedTasks'
            };

            this.$emit('task-created', newTask);

            this.title = '';
            this.description = '';
            this.deadline = '';
        }
    }
})

Vue.component('column', {
    props: ['tasks', 'title'],
    template: `
        <div>
            <div class="column">
                <h2>{{ title }}</h2>
                <div class="tasks">
                    <task-card v-for="task in tasks" :key="task.id" :task="task" @move="moveTask" @return="returnTask" @delete="deleteTask"></task-card>
                </div>
            </div>
        </div>
    `,
    methods: {
        moveTask(newColumn) {
            this.$emit('task-moved', {task: newColumn.task, targetColumn: newColumn.targetColumn})
        },
        returnTask(newColumn){
            this.$emit('task-returned', {task: newColumn.task, targetColumn: newColumn.targetColumn})
        },
        deleteTask(task){
            this.$emit('task-delete', task);
        }
    }

})

Vue.component('task-card', {
    props: ['task'],
    template: `
        <div class="task-card">
            <h3>{{ task.title }}</h3>
            <p>{{ task.description }}</p>
            <p>Deadline: {{ task.deadline }}</p>
            <p>Last change: {{ task.lastEdited }}</p>
            <button v-if="allowMove" @click="moveToNextColumn">Move to next column</button>
            <button v-if="allowReturn" @click="returnTaskToFirstColumn">Return task</button>
            <button v-if="allowEdit" @click="editTask">Edit task</button>
            <button v-if="allowDel" @click="deleteTask">Delete task</button>
        </div>
    `,
    methods: {
        moveToNextColumn() {
            this.$emit('move', {task: this.task, targetColumn: getNextColumn(this.task.column)})
        },
        // editTask(){
        //     this.task.title = 'New title'
        //     this.task.description = 'New description'
        //     this.task.lastEdited = new Date();
        // },
        returnTaskToFirstColumn(){
            this.$emit('return', {task: this.task, targetColumn: returnInFirstColumn(this.task.column)})
        },
        deleteTask(){
            this.$emit('delete', this.task)
        }
    },
    computed:{
        allowEdit(){
            return this.task.column === 'testingTasks';
        },
        allowMove(){
            return this.task.column === 'plannedTasks' || this.task.column === 'inProgressTasks' || this.task.column === 'testingTasks';
        },
        allowReturn(){
            return this.task.column === 'completedTasks';
        },
        allowDel(){
            return this.task.column === 'plannedTasks'
        }
    }
})

function getNextColumn(currentColumn) {
    switch (currentColumn) {
        case 'plannedTasks':
            return 'inProgressTasks';
        case 'inProgressTasks':
            return 'testingTasks';
        case 'testingTasks':
            return 'completedTasks';
    }
}

function returnInFirstColumn(currentColumn){
    switch (currentColumn){
        case 'completedTasks':
            return 'plannedTasks';
    }
}


let app = new Vue({
    el: '#app'
})