// frontend/src/api/settingsApi.js - Ensure this exists
import API from './axios';

const settingsApi = {
  // Get dashboard stats (LEGACY - now use dashboardApi)
  getDashboardStats: () =>
    API.get('/api/dashboard/overview').then(res => res.data),
};

export const { getDashboardStats } = settingsApi;
export default settingsApi;