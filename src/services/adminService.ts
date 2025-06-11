import api from '../utils/api';

export const adminService = {
    // Получить список всех пользователей
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },

    // Получить информацию о конкретном пользователе
    getUserDetails: async (userId: string) => {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data;
    },

    // Заблокировать/разблокировать пользователя
    toggleUserBlock: async (userId: string) => {
        const response = await api.put(`/admin/users/${userId}/toggle-block`);
        return response.data;
    },

    // Удалить пользователя
    deleteUser: async (userId: string) => {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    }
}; 