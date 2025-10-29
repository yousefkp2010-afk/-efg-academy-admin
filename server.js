const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// الموقع الأصلي - يظهر عند الدخول على /
app.use('/', express.static(path.join(__dirname, 'main-site')));

// لوحة التحكم - تظهر فقط عند الدخول على /admin
app.use('/admin', express.static(path.join(__dirname, 'public')));

// جلسات المستخدم
app.use(session({
    secret: 'efg-academy-secret',
    resave: false,
    saveUninitialized: false
}));

// وظيفة لقراءة الملفات
function readJSONFile(filename) {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', filename), 'utf8'));
    } catch (error) {
        return {};
    }
}

// API بسيط لخدمة البيانات للموقع الأصلي
app.get('/api/data', (req, res) => {
    const content = readJSONFile('content.json');
    res.json(content);
});

// نظام الدخول للوحة التحكم
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJSONFile('users.json');

    const admin = users.admins.find(a => a.username === username && a.password === password);
    
    if (admin) {
        req.session.isLoggedIn = true;
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'خطأ في الدخول' });
    }
});

// بدء السيرفر
app.listen(PORT, () => {
    console.log(`✅ السيرفر يعمل على البورت ${PORT}`);
});