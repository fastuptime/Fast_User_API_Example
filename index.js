const express = require('express');
const app = express();
const port = 80;
const db = require("croxydb");
const bodyParser = require("body-parser");
const moment = require("moment");
const md5 = require("md5");
const salt = "fastuptime";
const adminpassword = "admin";
///////////////////////// Middleware /////////////////////////
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
///////////////////////// Middleware /////////////////////////

app.get('/', (req, res) => res.send('Power By FastUptime Api'));

///////////////////////// Functions /////////////////////////
function randomString(length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
///////////////////////// Functions /////////////////////////

///////////////////////// Api /////////////////////////

app.post("/api/create/user", (req, res) => {
    let {
        mail,
        password,
        username,
    } = req.body;
    if (!mail || !password || !username) return res.json({ status: "error", message: "Lütfen tüm alanları doldurun." });
    let users = db.get("users") || [];
    let user = users.find((x) => x.mail === mail);
    if (user) return res.json({ status: "error", message: "Bu e-posta adresi zaten kayıtlı." });

    let newUser = {
        mail,
        password: md5(password + salt),
        username,
        createdAt: moment().format("DD/MM/YYYY HH:mm:ss"),
        id: randomString(12),
    };
    users.push(newUser);
    db.set("users", users);
    res.json({ status: "success", message: "Başarıyla kayıt oldunuz.", user_id: newUser.id });
});

app.post("/api/login/user", (req, res) => {
    let {
        mail,
        password,
    } = req.body;
    if (!mail || !password) return res.json({ status: "error", message: "Lütfen tüm alanları doldurun." });
    let users = db.get("users") || [];
    let user = users.find((x) => x.mail === mail);
    if (!user) return res.json({ status: "error", message: "Bu e-posta adresi kayıtlı değil." });
    password = md5(password + salt);
    if (user.password !== password) return res.json({ status: "error", message: "Şifreniz yanlış." });
    res.json({ status: "success", message: "Başarıyla giriş yaptınız. (User ID İle Kullanıcının Detaylarını Sorgulaya Bilirsiniz. Admin Pass Gereklidir.)", user_id: user.id });
});

app.post("/api/get/user", (req, res) => {
    let {
        user_id,
        admin_pass,
    } = req.body;
    if (!user_id || !admin_pass) return res.json({ status: "error", message: "Lütfen tüm alanları doldurun." });
    if (admin_pass !== adminpassword) return res.json({ status: "error", message: "Admin şifreniz yanlış." });
    let users = db.get("users") || [];
    let user = users.find((x) => x.id === user_id);
    if (!user) return res.json({ status: "error", message: "Bu kullanıcı bulunamadı." });
    res.json({ status: "success", message: "Kullanıcı bilgileri başarıyla getirildi.", user });
});

app.post("/api/delete/user", (req, res) => {
    let {
        user_id,
        admin_pass,
    } = req.body;
    if (!user_id || !admin_pass) return res.json({ status: "error", message: "Lütfen tüm alanları doldurun." });
    if (admin_pass !== adminpassword) return res.json({ status: "error", message: "Admin şifreniz yanlış." });
    let users = db.get("users") || [];
    let user = users.find((x) => x.id === user_id);
    if (!user) return res.json({ status: "error", message: "Bu kullanıcı bulunamadı." });
    let newUsers = users.filter((x) => x.id !== user_id);
    db.set("users", newUsers);
    res.json({ status: "success", message: "Kullanıcı başarıyla silindi." });
});

///////////////////////// Api /////////////////////////
app.listen(port, () =>
    console.log(`Bot bu adres üzerinde çalışıyor: http://localhost:${port}`)
);