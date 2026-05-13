<script>
import Button from 'primevue/button';
export default {
  name:'organization-card',
  components:{ Button },
  props:{
    org:{ type:Object, required:true },
    canDelete:{ type:Boolean, default:true }
  },
  emits:['enter','delete'],
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const locale = this.$i18n ? (this.$i18n.locale === 'en' ? 'en-US' : 'es-ES') : 'es-ES';
      return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
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
          <span>{{ org.getMemberCount() }} {{ $t('organization.memberCount') }}</span>
        </div>
        <div class="meta-item" v-if="org.location">
          <i class="pi pi-map-marker"></i>
          <span>{{ org.location }}</span>
        </div>
        <div class="meta-item" v-if="org.createdAt">
          <i class="pi pi-calendar"></i>
          <span>{{ $t('organization.createdAt') }}: {{ formatDate(org.createdAt) }}</span>
        </div>
      </div>
    </div>

    <div class="right">
      <Button
        v-if="canDelete"
        icon="pi pi-trash"
        severity="danger"
        text
        rounded
        @click="$emit('delete', org)"
        title="Eliminar organización"
      />
      <Button
        :label="$t('organizationExt.enter')"
        severity="success"
        @click="$emit('enter', org)"
      />
    </div>
  </div>
</template>

<style scoped>
.org-card {
  background: #fff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,.07);
  border: 1px solid #e9ecef;
  width: 100%;
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}

.org-card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,.1);
  transform: translateY(-1px);
}

.left {
  flex: 1;
  min-width: 0;
  padding-right: 1.5rem;
}

.title {
  margin: 0 0 4px 0;
  color: #1a1a1a;
  font-size: 1.2rem;
  font-weight: 700;
}

.description {
  margin: 0 0 10px 0;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #555;
  font-size: 0.85rem;
}

.meta-item i {
  color: #2c5530;
  font-size: 0.9rem;
}

.right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
</style>
