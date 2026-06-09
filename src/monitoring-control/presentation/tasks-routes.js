const logs = ()=> import('./views/farmer/logs.component.vue')
const checkList = ()=> import('./views/farmer/checklist-view.component.vue')
const taskDashboard = ()=> import('./views/farmer/task-dashboard.component.vue')
const newTask = ()=> import('./views/farmer/new-task.component.vue')
const taskForm = ()=> import('./view/task-form.vue')
const taskKanban = ()=> import('./views/farmer/task-kanban.component.vue')

const tasksRoutes = [
    {
        path: "/tasks",
        component: taskDashboard,
        redirect: "/tasks/kanban",
        children: [
            {
                path: "kanban",
                components: {"task-dashboard": taskKanban},
            },
            {
                path: "logs",
                components: {"task-dashboard": logs},
            },
            {
                path: "in-progress/:id/checklist",
                components: {"task-dashboard": checkList},
            },
            {
                path: "new-task",
                components: {"task-dashboard": newTask},
            },
            {
                path: ":id/edit",
                components: {"task-dashboard": taskForm},
            }
        ]
    }
]

export default tasksRoutes;