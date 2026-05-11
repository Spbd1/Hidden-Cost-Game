FROM node:22-alpine

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY prisma ./prisma
RUN npm run db:generate

COPY . .

ARG NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION=false
ENV NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION=${NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION}

RUN npm run build

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]
