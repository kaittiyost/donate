// wsServer.js
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8081 });

// ฟังก์ชันส่งข้อความไปทุก client
function broadcast(name, avatar, message) {
    const msgObj = { name, avatar, message };
    const msgStr = JSON.stringify(msgObj);

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msgStr);
        }
    });
}

wss.on("connection", (ws) => {
    console.log("New WebSocket connection established");

    ws.on("message", (msg) => {
        console.log("Received from client:", msg);
    });

    ws.on("close", () => {
        console.log("WebSocket connection closed");
    });
});

module.exports = { wss, broadcast };
