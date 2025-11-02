<script setup lang="js">
import {LogsService} from '../../../application/logs.service.js'
import {ref, onMounted} from "vue"

const logsService = new LogsService()
const logsList = ref([])

onMounted(async () => {
  try{
    const result = await logsService.getLogs()
    logsList.value = result && Array.isArray(result)? result: []
  }catch(err){
    console.log(err)
    logsList.value = []
  }
})
</script>

<template>
  <div class="container">
    <h3>Logs:</h3>
    <table v-if="logsList.length > 0">
      <thead>
        <tr>
          <th>Actividad</th>
          <th>Fecha</th>
          <th>Duracion</th>
          <th>Volumen</th>
          <th>Evidencia</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logsList" :key="log.id">
          <td>{{log.activity}}</td>
          <td>{{log.date}}</td>
          <td>{{log.duration}}</td>
          <td>{{log.volume}}</td>
          <td>{{log.evidence}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  box-shadow: 1px 1px 7px rgb(218, 218, 218) !important;
  text-align: center;
  padding: 5px;
}
.container h3{
  margin-top: 2rem;
}
table{
  width: 100%;
  text-align: left;
  border-radius: 8px;
  overflow: hidden;
  border: none;
  padding: 0 2px;
}
th, td{
  border: none;
}
thead{
  font-weight: bold;
}
tbody tr td:first-child{
  border-left: none;
}
tbody tr td{
  border-left: 1px solid #e0e0e0;
}

thead th{
  border-bottom: 1px solid #e0e0e0;
}
tbody tr:last-child td {
  border-bottom: none;
}
</style>