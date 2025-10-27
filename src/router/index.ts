import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      meta: {
        title: 'Главная страница',
      },
      component: HomeView,
    },
    {
      path: '/Experimental',
      children: [
        {
          path: '/ExperimentalTable1',
          name: 'ExperimentalTable1',
          meta: {
            title: 'Эксперименты с таблицей №1',
          },
          component: () => import('../views/TableExperiments.vue'),
        },
        {
          path: '/ExperimentalTable2',
          name: 'ExperimentalTable2',
          meta: {
            title: 'Эксперименты с таблицей №2',
          },
          component: () => import('../views/TableExperiments2.vue'),
        },
      ],
    },
    {
      path: '/anims',
      children: [
        {
          path: '/anim1',
          name: 'ExperimentalAnim1',
          meta: {
            title: 'Эксперименты с анимацией №1',
          },
          component: () => import('../views/animations/ExperimentalAnim1.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  document.title = to.meta.title as string
})

export default router
