# Use Node.js official image
FROM node:18

# Install dependencies for OCR processing
RUN apt-get update && apt-get install -y tesseract-ocr

# Set working directory
WORKDIR /app

# Copy package files and install backend dependencies
COPY package*.json ./
RUN npm install

# Copy backend source code
COPY . .

# Copy the frontend build folder
COPY build ./build

# Expose the backend port
EXPOSE 5000

# Start the backend server
CMD ["node", "index.js"]
