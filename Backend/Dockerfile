# Use Node.js official image
FROM node:18

# Install dependencies for OCR processing
RUN apt-get update && apt-get install -y tesseract-ocr

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install backend dependencies
RUN npm install

# ✅ Copy all backend files
COPY . . 

# ✅ Build the frontend
WORKDIR /app/Frontend
RUN npm install
RUN npm run build

# ✅ Move built frontend files to backend
WORKDIR /app
RUN mv /app/Frontend/build ./build

# Expose the backend port
EXPOSE 5000

# Start the backend server
CMD ["node", "Backend/index.js"]

