const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const axios = require("axios");
const WebSocket = require("ws");
const path = require("path");


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
// ---------------- Session -----------------
app.use(session({
    secret: "secret-key-12345",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60*60*1000 } // 1 ชั่วโมง
}));

// ---------------- WebSocket -----------------
const wss = new WebSocket.Server({ port: 8081 });

function broadcast(name, avatar, message) {
    const msgObj = { name, avatar, message };
    const msgStr = JSON.stringify(msgObj);

    wss.clients.forEach(client => {
        if(client.readyState === WebSocket.OPEN) {
            client.send(msgStr);
        }
    });
}

// ---------------- Middleware ตรวจ session -----------------
function authMiddleware(req, res, next) {
    if(req.session.user) next();
    else res.status(401).json({ status:"error", msg:"Unauthorized" });
}

// ---------------- Login -----------------
// ใช้ axios เรียก API login ภายนอก
app.post("/login", async (req,res) => {
    const { username, password } = req.body;
    if(!username || !password) return res.json({status:"error", msg:"กรอก username/password"});

    try {
        // เรียก API login ภายนอก
        const response = await axios.post("https://it.e-tech.ac.th/api/v1/login?username="+username+"&password="+password, { username, password });
        const data = response.data;
        //console.log(data);
        
        if(data.message === "ok") {

            const response2 = await axios.get("https://it.e-tech.ac.th/api/v1/user/"+username, { username });
            const data2 = response2.data
            const idCode = data2.datas[0].id_code
            const fullName = data2.datas[0].surname+data2.datas[0].fname+data2.datas[0].lname
            const profile = data2.datas[0].picts
            //console.log(data2.datas[0].id_code);
            
            // เก็บ session ของ user
            req.session.user = { username };
            res.json({ status:"success", msg:"Login สำเร็จ", data:data2 });
        } else {
            res.json({ status:"error", msg: data.msg || "Login ล้มเหลว" });
        }

    } catch(err) {
        console.error(err.message);
        res.json({ status:"error", msg:"ไม่สามารถเข้าสู่ระบบได้ โปรดตรวจสอบข้อมูล" });
    }
});

// ---------------- Logout -----------------
app.post("/logout", (req,res)=>{
    req.session.destroy();
    res.json({ status:"success", msg:"Logout สำเร็จ" });
});

// ---------------- Protected API /send -----------------
app.post("/send", authMiddleware, (req,res)=>{
    const message = req.body.message;
    const fname = req.body.name;
    const avartar = req.body.avatar;
    if(!message || message.trim() === "") return res.json({ status:"error", msg:"Empty message" });

    // ส่งข้อความไป WebSocket
    console.log(req.body);
    
    broadcast(fname,avartar,message);
    res.json({ status:"success" });
});

// ---------------- Start server -----------------
app.listen(3000, () => console.log("Express running on http://localhost:3000"));
