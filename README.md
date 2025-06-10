# GiGi - Social Media Frontend

Фронтенд часть социальной сети GiGi, построенная на React.

## 🚀 Быстрый старт

### Предварительные требования
- Node.js (версия 14 или выше)
- npm (устанавливается вместе с Node.js)
- Запущенный бэкенд сервер (см. [GiGi-backend](https://github.com/kvitkaalina/Gigi-backend))

### Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/kvitkaalina/Gigi.git front
cd front
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите приложение:
```bash
npm start
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

## 📁 Структура проекта

```
front/
├── src/
│   ├── components/     # React компоненты
│   ├── services/      # Сервисы для работы с API
│   ├── hooks/         # Пользовательские хуки
│   ├── context/       # React контексты
│   ├── assets/        # Статические файлы
│   └── styles/        # CSS модули и стили
├── public/            # Публичные файлы
└── package.json       # Зависимости и скрипты
```

## 🔄 Работа с Git

### Получение последних изменений
```bash
git pull origin main
```

### Сохранение ваших изменений
```bash
git add .
git commit -m "Описание ваших изменений"
git push origin main
```

## 🛠 Основные команды

- `npm start` - Запуск приложения в режиме разработки
- `npm run build` - Сборка приложения для продакшена
- `npm test` - Запуск тестов
- `npm run lint` - Проверка кода линтером

## 📝 Заметки по разработке

- Приложение использует React Router для навигации
- Для стилизации используются CSS модули
- Для работы с API используется fetch
- Для управления состоянием используется React Context

## 🔗 Связанные репозитории

- [GiGi Backend](https://github.com/kvitkaalina/Gigi-backend) - Бэкенд часть приложения
