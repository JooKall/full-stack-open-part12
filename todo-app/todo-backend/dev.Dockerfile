FROM node:20

WORKDIR /usr/src/app

COPY --chown=node:node . .

# Change npm ci to npm install since we are going to be in development mode
RUN npm install

ENV DEBUG=todo-backend:*

ENV PORT=3000

USER node

# npm run dev is the command to start the application in development mode
CMD ["npm", "run", "dev", "--", "--host"]