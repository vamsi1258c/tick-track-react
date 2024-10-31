# Base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application code to the working directory
COPY . .

# Expose port 3000 for the React development server
EXPOSE 3000

# Default command to run the app in development mode
CMD ["npm", "start"]
