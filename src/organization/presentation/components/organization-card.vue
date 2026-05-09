<script>
import Button from 'primevue/button';
export default {
  name:'organization-card',
  components:{ Button },
  props:{ org:{ type:Object, required:true }},
  emits:['enter','delete'],
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  }
};
</script>

<template>
  <div class="org-card">
    <div class="left">
      <h2 class="title">{{ org.name }}</h2>
      <p class="description">{{ org.description }}</p>
      <div class="meta">
        <div class="meta-item">
          <i class="pi pi-users"></i>
          <span>{{ org.getMemberCount() }} miembro{{ org.getMemberCount() !== 1 ? 's' : '' }}</span>
        </div>
        <div class="meta-item" v-if="org.location">
          <i class="pi pi-map-marker"></i>
          <span>{{ org.location }}</span>
        </div>
        <div class="meta-item" v-if="org.createdAt">
          <i class="pi pi-calendar"></i>
          <span>Creada: {{ formatDate(org.createdAt) }}</span>
        </div>
      </div>
    </div>

    <div class="right">
      <Button
        icon="pi pi-trash"
        severity="danger"
        text
        rounded
        @click="$emit('delete', org)"
        title="Eliminar organización"
      />
      <Button
        label="Entrar"
        severity="success"
        @click="$emit('enter', org)"
      />
    </div>
  </div>
</template>

<style scoped>
.org-card{
  background:#fff;border-radius:16px;display:grid;grid-template-columns:1fr auto;
  align-items:center;padding:24px 18px;margin:0 auto 18px auto;
  box-shadow:0 6px 18px rgba(0,0,0,.06);width:100%;max-width:900px; /* ← más ancha */
}
.left{padding-right:12px}
.title{margin:0 0 8px 0;color:#111}     /* ← texto negro */
.description {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1rem;
  line-height: 1.5;
}
.meta{display:flex;align-items:center;gap:.5rem;color:#111} /* ← texto negro */
.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.right{
  display:flex;align-items:center;gap:10px;background:#2a7c3e;
  padding:18px;border-radius:12px
}
</style>
