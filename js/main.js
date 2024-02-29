Vue.component('kanban',{
    template:`
        <div class='app'> 
            <h1>KABAN TABLE</h1>
            <create-task-form @task-created="createTask"></create-task-form>
            <div class="columns">
                <column title="Planned tasks" :tasks="plannedTasks" @task-moved="moveTask"></column>
                <column title="Tasks in progress" :tasks='inProgressTasks'></column>
<!--                <column></column>-->
<!--                <column></column>-->
            </div>
        </div>
    `,
    data(){
        return{
            plannedTasks: [],
            inProgressTasks:[]
        }
    },
    methods:{
        createTask(task) {
            this.plannedTasks.push(task);
        }
    }
})

Vue.component('create-task-form',{
   template: `
        <div class="task-form">
            <h2>Create task</h2>
            <input type="text" v-model="title" placeholder="Title">
            <textarea v-model="description" placeholder="Description"></textarea>
            <input type="date" v-model="deadline">
            <button @click="createTask">Create</button>
        </div>
   `,
    data(){
       return{
           title:'',
           description:'',
           deadline:''
       }
    },
    methods:{
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

Vue.component('column',{
    props:['tasks', 'title'],
    template:`
        <div>
            <div class="column">
                <h2>{{ title }}</h2>
                <div class="tasks">
                    <task-card v-for="task in tasks" :key="task.id" :task="task"></task-card>
                </div>
            </div>
        </div>
    `,

})

Vue.component('task-card', {
    props:['task'],
    template:`
        <div class="task-card">
            <h3>{{ task.title }}</h3>
            <p>{{ task.description }}</p>
            <p>Deadline: {{ task.deadline }}</p>
            <p>Last change: {{ task.lastEdited }}</p>
            <button @click="moveToNextColumn">Move to next column</button>
        </div>
    `,methods:{
        moveToNextColumn(){
            this.$emit('move', {task: this.task, targetColumn: getNextColumn(this.task.column)})
        }
    },
    getNextColumn(currentColumn){

    }
})

let app = new Vue({
    el: '#app'
})