<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const props = defineProps({
  latitude: { type: [Number, String], default: null },
  longitude: { type: [Number, String], default: null }
});

const emit = defineEmits(['update:latitude', 'update:longitude']);

const mapContainer = ref(null);
let map = null;
let marker = null;

const PERU_LAT = -9.189967;
const PERU_LNG = -75.015152;

onMounted(() => {
  const initialLat = props.latitude ? Number(props.latitude) : PERU_LAT;
  const initialLng = props.longitude ? Number(props.longitude) : PERU_LNG;
  const initialZoom = props.latitude && props.longitude ? 14 : 6; // Zoom más cerca si ya hay ubicación

  map = L.map(mapContainer.value).setView([initialLat, initialLng], initialZoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);

  marker.on('dragend', () => {
    const position = marker.getLatLng();
    updateCoordinates(position.lat, position.lng);
  });

  map.on('click', (e) => {
    marker.setLatLng(e.latlng);
    updateCoordinates(e.latlng.lat, e.latlng.lng);
  });
});

function updateCoordinates(lat, lng) {
  const fixedLat = parseFloat(lat.toFixed(6));
  const fixedLng = parseFloat(lng.toFixed(6));

  emit('update:latitude', fixedLat);
  emit('update:longitude', fixedLng);
}

watch(() => [props.latitude, props.longitude], ([newLat, newLng]) => {
  if (map && marker && newLat && newLng) {
    const currentLatLng = marker.getLatLng();
    if (currentLatLng.lat !== Number(newLat) || currentLatLng.lng !== Number(newLng)) {
      const pos = [Number(newLat), Number(newLng)];
      marker.setLatLng(pos);
      map.setView(pos, 14);
    }
  }
});

onUnmounted(() => {
  if (map) map.remove();
});
</script>

<template>
  <div class="map-wrapper mb-3">
    <div ref="mapContainer" class="map-instance"></div>
    <div class="map-help-text">
      <i class="pi pi-info-circle"></i> Haz clic en el mapa o arrastra el marcador para fijar las coordenadas.
    </div>
  </div>
</template>

<style scoped>
.map-wrapper {
  width: 100%;
}
.map-instance {
  height: 250px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
}
.map-help-text {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}
:deep(.leaflet-marker-icon) {
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
}
</style>