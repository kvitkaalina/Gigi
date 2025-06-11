interface UserData {
  token: string;
  userId: string;
  username: string;
  role?: string;
}

class AuthService {
  private static readonly TOKEN_KEY = 'token';
  private static readonly USER_ID_KEY = 'userId';
  private static readonly USERNAME_KEY = 'username';
  private static readonly USER_ROLE_KEY = 'userRole';

  // Сохраняем данные пользователя в localStorage
  static setUserData(data: UserData): void {
    localStorage.setItem(this.TOKEN_KEY, data.token);
    localStorage.setItem(this.USER_ID_KEY, data.userId);
    localStorage.setItem(this.USERNAME_KEY, data.username);
    if (data.role) {
      localStorage.setItem(this.USER_ROLE_KEY, data.role);
    }
  }

  // Получаем токен
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Получаем ID пользователя
  static getUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY);
  }

  // Получаем имя пользователя
  static getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  // Проверяем, авторизован ли пользователь
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Проверяем, является ли пользователь админом
  static isAdmin(): boolean {
    const role = localStorage.getItem(this.USER_ROLE_KEY);
    return role === 'admin';
  }

  // Очищаем все данные пользователя
  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    localStorage.removeItem(this.USER_ROLE_KEY);
  }

  // Получаем заголовки для API запросов
  static getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  }

  // Обновляем токен
  static updateToken(newToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, newToken);
  }
}

export default AuthService; 