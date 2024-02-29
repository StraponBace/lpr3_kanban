Vue.component('kanban',{
    template:`
        <div class='app'> 
            <h1>KABAN TABLE</h1>
            <create-task-form></create-task-form>
            <div class="colums">
                <column></column>
                <column></column>
                <column></column>
                <column></column>
            </div>
        </div>
    `,
    data(){
        return{

        }
    }
})

Vue.component('create-tsk-form',{
   template: `
        <div class="task-form">
            <h2>Create task</h2>
            <input type="text" v-model="title" placeholder="Title">
            <textarea v-model="description" placeholder="Description"></textarea>
            <input type="date" v-model="deadline">
            <button @click="createTask">Create</button>
        </div>
   `
})

let app = new Vue({
    el: '#app'
})