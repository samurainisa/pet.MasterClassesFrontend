<template>
  <nav class="navbar">
    <div class="navbar__container">
      <div class="navbar__logo" @click="goToHome">Главная</div>
      <div class="navbar__actions">
        <AuthGuard :roles="organizerRoles">
          <img
            class="navbar__map-icon"
            src="@/assets/imgs/map.svg"
            @click="goToMap"
            alt="Map"
            title="На карту"
          />
        </AuthGuard>
        <img
          v-if="!isAuthenticated"
          class="navbar__icon"
          src="@/assets/imgs/LogOutIcon.svg"
          @click="openAuthModal"
          alt="Login"
          title="Войти"
        />
        <div class="navbar__profile-wrapper">
          <img
            v-if="isAuthenticated"
            class="navbar__profile-icon"
            src="@/assets/imgs/ProfileIcon.svg"
            @click="toggleProfileModal"
            alt="Profile"
            title="Профиль"
          />
          <ProfileModal
            v-if="isProfileModalVisible && isAuthenticated"
            @close="toggleProfileModal"
          />
        </div>
      </div>
    </div>
    <LoginModal :visible="isLoginModalVisible" @close="closeLoginModal" />
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user/userStore'
import { routeNames } from '@/app/router/routes'
import LoginModal from '@/components/ui/auth/LoginModal.vue'
import AuthGuard from '@/components/ui/permission/AuthGuard.vue'
import ProfileModal from '@/components/ui/user/ProfileModal.vue'

const organizerRoles = ['Organizer', 'Admin']

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isLoginModalVisible = ref(false)
const isProfileModalVisible = ref(false)

const isAuthenticated = computed(() => userStore.isAuthenticated)

const openAuthModal = () => {
  isLoginModalVisible.value = true
}

const closeLoginModal = () => {
  isLoginModalVisible.value = false
}

const toggleProfileModal = () => {
  isProfileModalVisible.value = !isProfileModalVisible.value
}

watch(isAuthenticated, (newVal) => {
  if (!newVal) {
    isProfileModalVisible.value = false
  }
})

onMounted(() => {
  if (route.query.redirect && !isAuthenticated.value) {
    isLoginModalVisible.value = true
  }
})

const goToHome = () => {
  router.push({ name: routeNames.home })
}

const goToMap = () => {
  router.push({ name: routeNames.map })
}
</script>

<style scoped lang="scss">
@import '@/assets/variables';

.navbar {
  width: 100%;
  background-color: $white;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  height: 55px;
  display: flex;
  justify-content: center;

  &__container {
    width: 100%;
    gap: 24px;
    max-width: 1280px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 20px;
  }

  &__logo {
    font-size: 24px;
    font-weight: bold;
    color: $green;
    cursor: pointer;
  }

  &__map-icon {
    height: 40px;
    width: 40px;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  &__actions {
    display: flex;
    align-items: center;

    .navbar__icon {
      height: 40px;
      cursor: pointer;
      margin-left: 10px;

      &:hover {
        transform: scale(1.1);
      }
    }

    .navbar__profile-wrapper {
      display: flex;
      position: relative;
    }

    .navbar__profile-icon {
      height: 40px;
      margin-left: 24px;
      cursor: pointer;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }
  }
}
</style>
