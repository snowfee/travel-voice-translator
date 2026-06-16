import { createRouter, createWebHistory } from 'vue-router';

import ConversationView from '@/views/ConversationView.vue';
import HistoryDetailView from '@/views/HistoryDetailView.vue';
import HistoryView from '@/views/HistoryView.vue';
import PhrasesView from '@/views/PhrasesView.vue';
import SettingsView from '@/views/SettingsView.vue';
import TranslateView from '@/views/TranslateView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/conversation' },
    { path: '/conversation', component: ConversationView },
    { path: '/translate', component: TranslateView },
    { path: '/phrases', component: PhrasesView },
    { path: '/history', component: HistoryView },
    { path: '/history/:id', component: HistoryDetailView },
    { path: '/settings', component: SettingsView },
  ],
});

export default router;
