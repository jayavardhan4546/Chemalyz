# Use an official Node.js image
FROM node:18

# Install Tesseract-OCR
RUN apt-get update && apt-get install -y tesseract-ocr

# Set working directory
WORKDIR /app

# Copy backend package files **from the correct directory**
COPY Backend/package*.json ./

# Install backend dependencies
RUN npm install

# Copy the entire backend source **into the container**
COPY Backend/. .

# Expose the backend port
EXPOSE 5000

# Start the backend server
CMD ["node", "index.js"]
