# ใช้ Node.js version 20
FROM node:20-alpine

# สร้างโฟลเดอร์แอปใน container
WORKDIR /usr/src/app

# คัดลอก package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกโค้ดทั้งหมดไป container
COPY . .

# เปิด port 3000 สำหรับ Express
EXPOSE 3000

# รันแอป
CMD ["node", "server.js"]
