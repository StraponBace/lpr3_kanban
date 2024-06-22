Vue.component('kanban', {
    template: `
        <div class='app'> 
            <h1>KABAN TABLE</h1>
            <create-task-form @task-created="createTask"></create-task-form>
            <div class="columns">
                <column title="Запланированные задачи" :tasks="plannedTasks" @task-moved="moveTask" @task-delete="deleteTask"></column>
                <column title="Задачи в работе" :tasks='inProgressTasks' @task-moved="moveTask"></column>
                <column title="Тестирование" :tasks="testingTasks" @task-moved="moveTask" @task-returned="returnTask"></column>
                <column title="Выполненные задачи" :tasks="completedTasks"></column>
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
        returnTask({task, targetColumn, returnReason}){
            this[task.column].splice(this[task.column].indexOf(task), 1);
            this[targetColumn].push({...task, column: targetColumn, lastEdited: new Date(), returnReason: returnReason});
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
            <h2>Создание задачи</h2>
            <input type="text" v-model="title" placeholder="Заголовок">
            <textarea v-model="description" placeholder="Описание"></textarea>
            <label for="deadline">Дедлайн:</label>
            <input type="date" v-model="deadline">
            <h4 v-if="title == '' || description == '' || deadline ==''">Для создания задачи заполните все поля</h4>
            <button @click="createTask" v-if="title !== '' && description !== '' && deadline !==''">Создать</button>
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
        returnTask(newColumn) {
            this.$emit('task-returned', {task: newColumn.task, targetColumn: newColumn.targetColumn, returnReason: newColumn.returnReason});
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
            <h3 v-if="!isEditing">{{ task.title }}</h3>
            <input v-else type="text" v-model="newTitle" />
            <p v-if="!isEditing">{{ task.description }}</p>
            <textarea v-else v-model="newDescription" />
            <input v-if="isReturning" type="text" v-model="returnReason" placeholder="Причина возврата" />
            <p>Дедлайн: {{ formatDate(task.deadline) }}</p>
            <p>Последнее изменение: {{ formatDate(task.lastEdited) }}</p>
            <p v-if="task.returnReason">Причина возврата: {{ task.returnReason }}</p>
            <p v-if="allowStatus">Статус : {{ checkDeadline() }}</p>
            <div class="buttons">
                <button v-if="isReturning" @click="saveReturnReason">Сохранить причину возврата</button>
                <button v-if="allowMove && !isEditing && !isReturning" @click="moveToNextColumn">Переместить дальше</button>
                <button v-if="allowReturn && !isEditing && !isReturning" @click="returnTaskToSecondColumn">Вернуть задачу</button>
                <button v-if="allowEdit && !isEditing && !isReturning" @click="startEditing">Редактировать задачу</button>
                <button v-if="isEditing && !isReturning" @click="saveEdit">Сохранить изменения</button>
                <button v-if="allowDel && !isEditing && !isReturning" @click="deleteTask">Удалить задачу</button>
            </div>
        </div>
    `,
    data() {
        return {
            isEditing: false,
            newTitle: '',
            newDescription: '',
            isReturning: false,
            returnReason: ''
        }
    },
    methods: {
        moveToNextColumn() {
            this.$emit('move', {task: this.task, targetColumn: this.getNextColumn(this.task.column)})
        },
        startEditing() {
            this.isEditing = true;
            this.newTitle = this.task.title;
            this.newDescription = this.task.description;
        },
        saveEdit() {
            this.task.title = this.newTitle;
            this.task.description = this.newDescription;
            this.task.lastEdited = new Date();
            this.isEditing = false;
        },
        returnTaskToSecondColumn() {
            this.isReturning = true;
        },
        saveReturnReason() {
            this.$emit('return', {task: this.task, targetColumn: this.returnInSecondColumn(this.task.column), returnReason: this.returnReason});
            this.task.returnReason = this.returnReason;
            this.isReturning = false;
            this.returnReason = '';
        },
        deleteTask(){
            this.$emit('delete', this.task)
        },
        checkDeadline(){
            const deadline = new Date(this.task.deadline);
            const now = new Date();
            if(now > deadline){
                return 'Просрочено';
            }else{
                return 'Выполнено в срок';
            }
        },
        formatDate(date) {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}.${month}.${year}`;
        },
        getNextColumn(currentColumn) {
            switch (currentColumn) {
                case 'plannedTasks':
                    return 'inProgressTasks';
                case 'inProgressTasks':
                    return 'testingTasks';
                case 'testingTasks':
                    return 'completedTasks';
            }
        },
        returnInSecondColumn(currentColumn){
            switch (currentColumn){
                case 'testingTasks':
                    return 'inProgressTasks';
            }
        }
    },
    computed:{
        allowEdit(){
            return this.task.column === 'plannedTasks' || this.task.column === 'inProgressTasks' || this.task.column === 'testingTasks';
        },
        allowMove(){
            return this.task.column === 'plannedTasks' || this.task.column === 'inProgressTasks' || this.task.column === 'testingTasks';
        },
        allowReturn(){
            return this.task.column === 'testingTasks';
        },
        allowDel(){
            return this.task.column === 'plannedTasks';
        },
        allowStatus(){
            return this.task.column === 'completedTasks';
        }
    }
})

let app = new Vue({
    el: '#app'
})