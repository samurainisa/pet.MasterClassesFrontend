# MasterClasses Frontend (diploma project)

SPA для просмотра, поиска и управления мастер-классами. Пользователи фильтруют события, смотрят детали и регистрируются; организаторы создают мероприятия, работают с картой и заявками.

Бэкенд — Django REST API. Фронтенд построен на **Vue 3 + TypeScript** с архитектурой, близкой к **Feature-Sliced Design**.

---

## Содержание

- [Возможности](#возможности)
- [Стек](#стек)
- [Архитектура](#архитектура)
- [Структура проекта](#структура-проекта)
- [Быстрый старт](#быстрый-старт)
- [Переменные окружения](#переменные-окружения)
- [Маршруты и авторизация](#маршруты-и-авторизация)
- [Работа с API](#работа-с-api)
- [Состояние приложения](#состояние-приложения)
- [Скрипты](#скрипты)
- [Соглашения по разработке](#соглашения-по-разработке)

---

## Возможности

| Роль | Что доступно |
|------|--------------|
| **Гость** | Каталог мероприятий, поиск и фильтры, просмотр карточки, регистрация аккаунта |
| **Участник** | Запись на мастер-класс, избранное, профиль |
| **Организатор / Admin** | Создание мероприятий, карта (маркеры / heatmap / хороплет), список своих событий, просмотр заявок |

---

## Стек

| Категория | Технологии |
|-----------|------------|
| UI | Vue 3 (Composition API), Vue Router 4 |
| Язык | TypeScript 5 |
| Сборка | Vite 5 |
| Состояние | Pinia 2 |
| HTTP | Axios (singleton + interceptors) |
| Карты | Leaflet, leaflet.heat, leaflet.markercluster |
| Стили | Sass, CSS |
| Формы / UI | @vueform/vueform, @vuepic/vue-datepicker |
| Утилиты | date-fns, js-cookie |

---

## Архитектура

Проект разделён на слои по принципам FSD:

```
┌─────────────────────────────────────────────────────┐
│  app          — инициализация, роутер, guards       │
├─────────────────────────────────────────────────────┤
│  pages        — экраны (композиция виджетов)         │
├─────────────────────────────────────────────────────┤
│  widgets      — крупные UI-блоки (напр. AppNav)     │
├─────────────────────────────────────────────────────┤
│  features     — (зарезервировано под фичи)          │
├─────────────────────────────────────────────────────┤
│  entities     — доменные сущности: types + API      │
├─────────────────────────────────────────────────────┤
│  shared       — axios, config, lib, общие типы      │
└─────────────────────────────────────────────────────┘
         ↕                    ↕
      stores              components
   (Pinia, UI-state)   (переиспользуемые UI)
```

**Поток данных:**

```
Page / Component  →  Store (Pinia)  →  Entity API  →  HttpClient (axios)  →  Backend
```

**Правила слоёв:**

- `pages` не ходят в axios напрямую — только через store или entity API
- URL эндпоинтов живут в `shared/api/routes.ts`, не размазаны по компонентам
- Типы домена — в `entities/*/model/types.ts`, без дублирования в компонентах
- Имена маршрутов — только через `routeNames` из `app/router/routes.ts`

---

## Структура проекта

```
src/
├── app/
│   └── router/              # routes, guards, meta-типы
├── pages/                   # страницы приложения
│   ├── home/
│   ├── map/
│   ├── masterclass-detail/
│   ├── masterclass-requests/
│   ├── add-masterclass/
│   ├── organizer-masterclasses/
│   ├── profile/
│   ├── register/
│   └── logout/
├── widgets/
│   └── layout/ui/           # AppNav — глобальная навигация
├── entities/
│   ├── user/                # User, AuthTokens, userApi
│   ├── master-class/        # MasterClass, masterClassApi
│   ├── favorite/
│   ├── registration/
│   └── organizer/
├── shared/
│   ├── api/                 # HttpClient singleton, API_ROUTES
│   ├── config/env.ts        # VITE_API_BASE_URL
│   └── lib/                 # jwt, formatDate, leaflet, rolesDictionary
├── stores/                  # Pinia-сторы по доменам
│   ├── user/
│   ├── master-class/
│   ├── favorite/
│   ├── registration/
│   └── map/
├── components/              # переиспользуемые UI-компоненты
│   ├── map/                 # Timeline, LayerToggle, Sidebar…
│   └── ui/                  # карточки, фильтры, модалки…
├── composables/             # useToast и др.
├── assets/                  # стили, изображения, GeoJSON
├── App.vue
└── main.ts
```

---

## Быстрый старт

### Требования

- **Node.js** ≥ 18
- **npm** ≥ 9
- Запущенный **Django-бэкенд** (по умолчанию `http://127.0.0.1:8000`)

### Установка

```bash
git clone <repository-url>
cd MasterClassesFrontend
npm install
```

### Конфигурация

```bash
cp .env.example .env
```

Отредактируйте `.env`, если бэкенд на другом адресе.

### Запуск в dev-режиме

```bash
npm run dev
```

Приложение откроется на `http://localhost:5173`.

### Production-сборка

```bash
npm run build
npm run preview   # локальный просмотр сборки
```

---

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `VITE_API_BASE_URL` | Базовый URL Django API | `http://127.0.0.1:8000` |

Пример `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

> Переменные с префиксом `VITE_` доступны в клиентском коде через `import.meta.env`.

---

## Маршруты и авторизация

| Путь | Имя (`routeNames`) | Доступ |
|------|-------------------|--------|
| `/home` | `home` | Все |
| `/masterclass/:id` | `masterClassDetail` | Все |
| `/register` | `register` | Только гости |
| `/profile` | `profile` | Авторизованные |
| `/logout` | `logout` | Авторизованные |
| `/map` | `map` | Organizer, Admin |
| `/add-masterclass` | `addMasterClass` | Organizer, Admin |
| `/my-masterclasses` | `organizerMasterClasses` | Organizer, Admin |
| `/masterclass/:id/requests` | `masterClassRequests` | Organizer, Admin |

**Guards** (`app/router/guards.ts`):

- `meta.requiresAuth` — редирект на `/home?redirect=…`, открывается модалка входа
- `meta.roles` — проверка роли пользователя
- `meta.guestOnly` — авторизованных перенаправляет с `/register` на home
- `meta.layout: 'map'` — полноэкранный layout без отступа под navbar

**Аутентификация:**

- JWT (`access` / `refresh`) и CSRF-токен хранятся в cookies
- Axios interceptor автоматически обновляет access-токен при `401`
- При старте приложения вызывается `userStore.checkUser()`

---

## Работа с API

### HttpClient (singleton)

```typescript
// src/shared/api/http-client.ts
import { api } from '@/shared/api/http-client'

// api — единственный экземпляр axios с interceptors
```

Interceptors:

1. **Request** — подставляет `Authorization: Bearer …` и `X-CSRFToken`
2. **Response** — при `401` пробует `/token/refresh/`, повторяет исходный запрос

### Entity API

Каждая сущность — класс с типизированными методами:

```typescript
import { masterClassApi } from '@/entities/master-class/api/masterClassApi'

const list = await masterClassApi.fetchList({ categories: [1], cities: ['Москва'] })
const item = await masterClassApi.fetchById(42)
```

### Маршруты API

Все пути централизованы в `shared/api/routes.ts`:

```typescript
import { API_ROUTES } from '@/shared/api/routes'

API_ROUTES.masterClasses.detail(42)   // /api/masterclasses/42/
API_ROUTES.auth.login                 // /login/
```

---

## Состояние приложения

| Store | Файл | Ответственность |
|-------|------|-----------------|
| `useUserStore` | `stores/user/userStore.ts` | Авторизация, профиль |
| `useMasterClassesStore` | `stores/master-class/masterClassStore.ts` | Каталог, фильтры, геокодинг |
| `useFavoritesStore` | `stores/favorite/favoriteStore.ts` | Избранное |
| `useRegistrationStore` | `stores/registration/registrationStore.ts` | Запись на мероприятие |
| `useLayersStore` | `stores/map/layersStore.ts` | Слои карты (Leaflet) |
| `useSidebarStore` | `stores/map/sidebarStore.ts` | Sidebar на карте |

Все сторы используют **Composition API** (`defineStore + setup`).

---

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер с HMR |
| `npm run build` | Type-check + production-сборка |
| `npm run build-only` | Сборка без проверки типов |
| `npm run type-check` | Проверка типов (`vue-tsc`) |
| `npm run preview` | Просмотр production-сборки |
| `npm run lint` | ESLint с автофиксом |
| `npm run format` | Prettier для `src/` |

---

## Соглашения по разработке

### Добавление новой страницы

1. Создай `src/pages/<feature>/ui/<Feature>Page.vue`
2. Зарегистрируй маршрут в `app/router/routes.ts` + добавь имя в `routeNames`
3. При необходимости укажи `meta: { requiresAuth, roles, layout }`

### Добавление API-метода

1. Типы → `entities/<entity>/model/types.ts`
2. Метод → `entities/<entity>/api/<entity>Api.ts`
3. URL → `shared/api/routes.ts`
4. Вызов из store, не из компонента

### Импорты

Алиас `@/` указывает на `src/`:

```typescript
import { routeNames } from '@/app/router/routes'
import type { MasterClass } from '@/entities/master-class/model/types'
```

### TypeScript

- Все `.vue`-файлы — `<script setup lang="ts">`
- Не используй `any` в API-слое и stores
- Перед PR: `npm run type-check && npm run lint`

### IDE

Рекомендуется **VS Code / Cursor** с расширением [Vue — Official (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar). Vetur отключить.

---

## Лицензия

Private / internal use.
