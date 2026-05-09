<script setup lang="js">
import { ref } from 'vue'
import {TaskService} from '../../../application/task.service.js'
import {CheckListService} from "../../../application/checklist.service.js";

const taskService = new TaskService()
const checkListService = new CheckListService()

const task = ref({
  id: null,
  title: '',
  responsibleId: '',
  status: 'Pending',
  startedAt: '',
  completedAt: ''
})

const checklist = ref({
  id: null,
  taskId: task.value.id,
  title: '',
  items: []
})

const addItem = () => {
  checklist.value.items.push({
    id: Date.now().toString() + Math.floor(Math.random() * 1000),
    description: ''
  })
}

const removeItem = (index) => {
  checklist.value.items.splice(index, 1)
}

const submitForm = async () => {
  try {
    const taskData = await taskService.registerNewTask(task.value);
    if (!taskData?.id) {
      alert("Error al crear tarea");
      return;
    }
    const realTaskId = taskData.id;
    const itemsArray = Array.isArray(checklist.value.items)
        ? checklist.value.items
        : [];
    const checklistPayload = {
      taskId: realTaskId,
      title: checklist.value.title?.trim() || "Checklist",
      items: itemsArray.map(item => ({
        description: item.description?.trim() || ""
      })).filter(i => i.description)
    };

    const checklistOk = await checkListService.registerNewChecklist(checklistPayload);

    if (checklistOk) {
      alert("¡Tarea y checklist creadas correctamente!");
      task.value.title = "";
      task.value.responsibleId = "";
      checklist.value.title = "";
      checklist.value.items = [];
    } else {
      alert("Tarea creada, pero falló el checklist");
    }

  } catch (err) {
    console.error("Error:", err);
    alert("Error al registrar");
  }
}
</script>

<template>
  <div class="container">
    <div class="card-form">
      <h2 class="text-xl font-bold mb-4">Registrar nueva tarea</h2>
      <div class="mb-4">
        <h3 class="font-semibold mb-2">Datos de la tarea</h3>
        <div class="mb-3">
          <label class="block text-sm font-medium">Título</label>
          <pv-input-text v-model="task.title" placeholder="Ej. Revisión de riego" class="w-full input" />
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium">Responsable (ID)</label>
          <pv-input-text v-model="task.responsibleId" placeholder="Ej. 1" class="w-full input" />
        </div>
      </div>
      <div class="mb-4 border-t pt-4">
        <h3 class="font-semibold mb-2">Checklist asociada</h3>
        <div class="mb-3">
          <label class="block text-sm font-medium">Título de checklist</label>
          <pv-input-text v-model="checklist.title" placeholder="Ej. Revisión de maquinaria" class="w-full input" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Items</label>
          <div v-for="(item, index) in checklist.items" :key="index" class="flex items-center gap-2 mb-2">
            <pv-input-text v-model="item.description" placeholder="Descripción del ítem" class="flex-1" />
            <pv-button icon="pi pi-trash" severity="danger" @click="removeItem(index)" text />
          </div>
          <pv-button icon="pi pi-plus" label="Añadir ítem" @click="addItem" outlined class="mt-2 items" />
        </div>
      </div>
      <div class="button">
        <pv-button label="Registrar" icon="pi pi-check" @click="submitForm" class="mt-4 w-full register-btn" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  h2 {
    color: #2c5530;
    text-align: center;
    margin-bottom: 1.5rem;
  }
  .mb-4 {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
  }
  h3 {
    color: #3d3d3d;
    border-left: 4px solid #2c5530;
    padding-left: 0.5rem;
    margin-bottom: 1rem;
  }
  label {
    color: #444;
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
  }
  .p-inputtext{
    width: 100%;
    border-radius: 0.5rem;
    padding: 0.75rem;
    border: 1px solid #d0d0d0;
    transition: all 0.3s ease;
  }
  .p-inputtext:hover{
    border-color: #2c5530 !important;
    box-shadow: 0 0 0 2px rgba(44, 85, 48, 0.2) !important;
  }
  .p-inputtext:focus{
    border-color: #2c5530 !important;
    box-shadow: 0 0 0 2px rgba(44, 85, 48, 0.2) !important;
  }
  .flex {
    display: flex;
  }
  .items-center {
    align-items: center;
  }
  .gap-2 {
    gap: 0.5rem;
  }
  .mb-2 {
    margin-bottom: 0.5rem;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }
  .button{
    width: 100%;
    justify-content: center;
    align-items: center;
    display: flex;
  }
  .register-btn{
    background-color: #2196F3;
    border: none;
  }
  .register-btn:hover{
    background-color: #1b73b8 !important;
    border: none !important;
  }
  .items{
    color: rgba(0,0,0,0.5);
    border: 1px solid rgba(0,0,0,0.2);
  }
  .items:hover{
    color: rgba(0,0,0,0.8) !important;
    border: 1px solid rgba(0,0,0,0.8) !important;
    background-color: #ffffff !important;
  }
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }
  .card-form {
    width: 60%;
    max-width: 700px;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }
  .container {
    padding-top: 1rem !important;
    padding-bottom: 2rem !important;
    min-height: auto !important;
  }

  .card-form {
    margin-top: 0 !important;
    padding: 1.8rem !important;
  }

  .mb-4 {
    margin-bottom: 1.2rem !important;

    .mb-3 {
      margin-bottom: 0.8rem !important;
    }

    h2 {
      margin-bottom: 1rem !important;
    }

    h3 {
      margin-bottom: 0.8rem !important;
    }

    .p-inputtext {
      height: 42px !important;
    }
  }
  @media (max-width: 768px) {
    .card-form {
      width: 90%;
      padding: 1.5rem;
    }
  }
  @media (max-width: 640px) {
    .p-card {
      padding: 1rem;
    }

    h2 {
      font-size: 1.25rem;
    }
  }
</style>