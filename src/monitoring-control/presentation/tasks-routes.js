const completedTasks = ()=> import('./views/farmer/completed-tasks.component.vue')
const pendingTasks = ()=> import('./views/farmer/pending-tasks.component.vue')
const inProgressTasks = ()=> import('./views/farmer/in-progress-tasks.component.vue')
const logs = ()=> import('./views/farmer/logs.component.vue')
const checkList = ()=> import('./views/farmer/checklist-view.component.vue')
const taskDashboard = ()=> import('./views/farmer/task-dashboard.component.vue')

const tasksRoutes = [
    {
        path: "/tasks",
        component: taskDashboard,
        redirect: "/tasks/completed",
        children: [
            {
                path: "completed",
                components: {"task-dashboard": completedTasks},
            },
            {
                path: "in-progress",
                components: {"task-dashboard": inProgressTasks},
            },
            {
                path: "pending",
                components: {"task-dashboard": pendingTasks},
            },
            {
                path: "logs",
                components: {"task-dashboard": logs},
            },
            {
                path: "in-progress/:id/checklist",
                components: {"task-dashboard": checkList},
            }
        ]
    }
]

export default tasksRoutes;