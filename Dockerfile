# Шаг 1: Сборка проекта
FROM node:20-alpine AS build
WORKDIR /app

# Копируем конфиги и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем весь исходный код
COPY . .

# Собираем проект.
# ВНИМАНИЕ: Если ты используешь Vite, папка будет 'dist'. Если Create React App — 'build'.
RUN npm run build

# Шаг 2: Раздача через Nginx
FROM nginx:stable-alpine

# Копируем билд из первого этапа (замени dist на build, если нужно)
COPY --from=build /app/dist /usr/share/nginx/html

# Настройка Nginx, чтобы React Router работал корректно
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]