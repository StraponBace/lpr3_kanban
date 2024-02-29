Vue.component('kanban',{
    template:`
        <div class='app'> 
            <h1>KABAN TABLE</h1>
            <create-task-form @task-created="createTask"></create-task-form>
            <div class="columns">
                <column :tasks="plannedTasks"></column>
<!--                <column></column>-->
<!--                <column></column>-->
<!--                <column></column>-->
            </div>
        </div>
    `,
    data(){
        return{
            plannedTasks: []
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
    props:['tasks', 'task'],
    template:`
        <div>
            <div class="column">
                <div class="tasks" >
                    <div class="task-card" v-for="task in tasks" :key="task.id" :task="task">
                        <h3>{{ task.title }}</h3>
                        <p>{{ task.description }}</p>
                        <p>Deadline: {{ task.deadline }}</p>
                        <p>Last change: {{ task.lastEdited }}</p>
                    </div>
                </div>
            </div>
        </div>
    `,

})

let app = new Vue({
    el: '#app'
})