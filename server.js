const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// الموقع الأصلي
app.use('/', express.static(path.join(__dirname, 'main-site')));

// إصلاح الجلسات ل render.com
app.set('trust proxy', 1);

app.use(session({
    store: new MemoryStore({
        checkPeriod: 86400000
    }),
    secret: 'efg-academy-secret-key-' + Math.random().toString(36),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // مهم: يجب أن يكون false ل render.com
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// وظائف الملفات
function readJSONFile(filename) {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', filename), 'utf8'));
    } catch (error) {
        return {};
    }
}

// API للبيانات
app.get('/api/data', (req, res) => {
    const content = readJSONFile('content.json');
    res.json(content);
});

// صفحة الدخول
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// صفحة لوحة التحكم
app.get('/admin/dashboard', (req, res) => {
    if (req.session.isLoggedIn) {
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else {
        res.redirect('/admin');
    }
});

// تسجيل الدخول
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJSONFile('users.json');

    console.log('محاولة دخول:', username);
    
    const admin = users.admins?.find(a => a.username === username && a.password === password);
    
    if (admin) {
        req.session.isLoggedIn = true;
        req.session.username = username;
        console.log('تم الدخول بنجاح:', username);
        res.json({ success: true, redirect: '/admin/dashboard' });
    } else {
        console.log('فشل الدخول:', username);
        res.json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
});

// تسجيل الخروج
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin');
});

// APIs للبيانات (يجب أن تكون بعد التحقق من الدخول)
app.get('/admin/api/*', (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.status(401).json({ error: 'غير مصرح' });
    }
    next();
});

// بدء السيرفر
app.listen(PORT, () => {
    console.log(`✅ السيرفر يعمل على البورت ${PORT}`);
});