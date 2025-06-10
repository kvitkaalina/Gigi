interface UserData {
  token: string;
  userId: string;
  username: string;
}

class AuthService {
  private static readonly TOKEN_KEY = 'app_token';
  private static readonly USER_ID_KEY = 'app_user_id';
  private static readonly USERNAME_KEY = 'app_username';

  // Сохраняем данные пользователя в sessionStorage вместо localStorage
  static setUserData(data: UserData): void {
    sessionStorage.setItem(this.TOKEN_KEY, data.token);
    sessionStorage.setItem(this.USER_ID_KEY, data.userId);
    sessionStorage.setItem(this.USERNAME_KEY, data.username);
  }

  // Получаем токен
  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  // Получаем ID пользователя
  static getUserId(): string | null {
    return sessionStorage.getItem(this.USER_ID_KEY);
  }

  // Получаем имя пользователя
  static getUsername(): string | null {
    return sessionStorage.getItem(this.USERNAME_KEY);
  }

  // Проверяем, авторизован ли пользователь
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Очищаем все данные пользователя
  static logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_ID_KEY);
    sessionStorage.removeItem(this.USERNAME_KEY);
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
    sessionStorage.setItem(this.TOKEN_KEY, newToken);
  }
}

export default AuthService; 