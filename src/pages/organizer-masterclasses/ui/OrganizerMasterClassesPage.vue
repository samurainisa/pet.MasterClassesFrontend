<template>
  <div class="organizer-master-classes-container">
    <div class="organizer-master-classes">
      <h2>Мои мероприятия</h2>
      <div class="master-class-list">
        <div
          v-for="masterClass in masterClasses"
          :key="masterClass.id"
          class="master-class-item"
        >
          <MasterClassCard :masterClass="masterClass" />
          <router-link
            :to="{ name: routeNames.masterClassRequests, params: { id: masterClass.id } }"
            class="requests-link"
          >
            Заявки
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { organizerApi } from '@/entities/organizer/api/organizerApi'
import { useUserStore } from '@/stores/user/userStore'
import { routeNames } from '@/app/router/routes'
import MasterClassCard from '@/components/ui/masterclass/MasterClassCard.vue'
import type { MasterClass } from '@/entities/master-class/model/types'

const userStore = useUserStore()
const masterClasses = ref<MasterClass[]>([])

const organizerId = computed(() => userStore.user?.id)

const loadMasterClasses = async () => {
  if (!organizerId.value) return

  try {
    masterClasses.value = await organizerApi.fetchMasterClasses(organizerId.value)
  } catch (error) {
    console.error('Ошибка при загрузке мастер-классов:', error)
  }
}

onMounted(loadMasterClasses)
</script>

<style scoped lang="scss">
@import '@/assets/variables';

.organizer-master-classes-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.organizer-master-classes {
  max-width: 1380px;
  width: 100%;

  h2 {
    margin-bottom: 20px;
    color: $green;
  }

  .master-class-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .master-class-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .requests-link {
    color: $green;
    text-align: center;
    font-weight: 500;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
