FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
ENV npm_config_audit=false
ENV npm_config_fund=false
RUN npm install --omit=dev

# Copy app source
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
