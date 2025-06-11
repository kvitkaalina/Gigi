import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import styles from './AdminPanel.module.css';

interface User {
    _id: string;
    username: string;
    email: string;
    isBlocked: boolean;
    role: string;
}

const AdminPanel: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // Загрузка пользователей
    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error loading users');
        } finally {
            setLoading(false);
        }
    };

    // Блокировка/разблокировка пользователя
    const handleToggleBlock = async (userId: string) => {
        try {
            await adminService.toggleUserBlock(userId);
            // Обновляем список пользователей
            loadUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error toggling user block status');
        }
    };

    // Удаление пользователя
    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await adminService.deleteUser(userId);
                // Обновляем список пользователей
                loadUsers();
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error deleting user');
            }
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.adminPanel}>
            <h1>User Management</h1>
            <div className={styles.userList}>
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={user.isBlocked ? styles.blocked : styles.active}>
                                        {user.isBlocked ? 'Blocked' : 'Active'}
                                    </span>
                                </td>
                                <td>{user.role}</td>
                                <td>
                                    {user.role !== 'admin' && (
                                        <>
                                            <button
                                                onClick={() => handleToggleBlock(user._id)}
                                                className={user.isBlocked ? styles.unblock : styles.block}
                                            >
                                                {user.isBlocked ? 'Unblock' : 'Block'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className={styles.delete}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel; 