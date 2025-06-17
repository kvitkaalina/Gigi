# Используем официальный Node.js образ
FROM node:20-alpine
# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app
# Копируем package.json и package-lock.json для уставки зависимсотей
# Используем шаблон *, чтобы избежать повторения
COPY package*.json ./
# Устанавливаем зависимости
RUN npm install --legacy-peer-deps
# Копируем весь проект в рабочую директорию контейнера
COPY . .
# Открываем порт 5173 - стандартный порт для Vite
EXPOSE 5174
# Запускаем dev-сервер Vite с помощью скрипта "devdocker"
# В package.json должке быть скрипт: "devdocker": "vite"
CMD [ "npm", "run", "devdocker" ]

