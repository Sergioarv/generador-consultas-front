# Etapa de compilación
FROM node:16.20.2-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa de producción
FROM nginx:alpine
COPY --from=build /usr/src/app/dist/generador-consultas-front /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]