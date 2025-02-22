# Use an official Node.js image
FROM node:18

# Install Tesseract-OCR
RUN apt-get update && apt-get install -y tesseract-ocr

# Set working directory
WORKDIR /app

# Copy backend package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the entire backend source
COPY . .

# Expose the port (match your backend port)
EXPOSE 5000

# Start the backend server
CMD ["node", "index.js"]
