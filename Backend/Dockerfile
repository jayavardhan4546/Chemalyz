# Use an official Node.js image
FROM node:18

# Install Tesseract-OCR
RUN apt-get update && apt-get install -y tesseract-ocr

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json from the root (not Backend/)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire backend source (assuming Backend/ contains backend code)
COPY Backend/. .

# Expose the backend port
EXPOSE 5000

# Start the backend server
CMD ["node", "index.js"]
