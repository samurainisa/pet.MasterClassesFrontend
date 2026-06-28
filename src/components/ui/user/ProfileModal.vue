<template>
  <div class="profile-modal">
    <div class="popper__arrow"></div>
    <div class="profile-modal__header">
      <div class="profile-modal__info" v-if="user">
        <h3>{{ user.username }}</h3>
        <p>ID {{ user.id }}</p>
      </div>
    </div>
    <ul class="profile-modal__list">
      <li><a @click="goToProfile">Профиль</a></li>
      <AuthGuard :roles="organizerRoles">
        <li><a @click="goToOrganizerMasterClasses">Мои мероприятия</a></li>
      </AuthGuard>
      <li><a href="#" @click="logout">Выход</a></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user/userStore'
import { routeNames } from '@/app/router/routes'
import AuthGuard from '@/components/ui/permission/AuthGuard.vue'

const organizerRoles = ['Organizer', 'Admin']

const emit = defineEmits<{ close: [] }>()

const userStore = useUserStore()
const user = computed(() => userStore.user)
const router = useRouter()

const goToProfile = () => {
  emit('close')
  router.push({ name: routeNames.profile })
}

const goToOrganizerMasterClasses = () => {
  emit('close')
  router.push({ name: routeNames.organizerMasterClasses })
}

const logout = () => {
  emit('close')
  userStore.logout()
  router.push({ name: routeNames.home })
}
</script>

<style scoped lang="scss">
@import '@/assets/variables';

.profile-modal {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;

  .popper__arrow {
    position: absolute;
    width: 10px;
    height: 10px;
    background: white;
    border-left: 1px solid #ddd;
    border-top: 1px solid #ddd;
    top: -5px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
  }
}

.profile-modal__header {
  display: flex;
  align-items: center;
}

.profile-modal__info h3 {
  margin: 0;
}

.profile-modal__list {
  list-style: none;
  padding: 0;
}

.profile-modal__list li {
  margin-top: 10px;
}

.profile-modal__list a {
  color: $green;
  text-decoration: none;
  cursor: pointer;
}

.profile-modal__list a:hover {
  text-decoration: underline;
}
</style>
