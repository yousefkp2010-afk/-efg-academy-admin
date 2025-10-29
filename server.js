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
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// وظائف الملفات
function readJSONFile(filename) {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', filename), 'utf8'));
    } catch (error) {
        console.log('خطأ في قراءة الملف:', filename);
        return {};
    }
}

function writeJSONFile(filename, data) {
    try {
        fs.writeFileSync(path.join(__dirname, 'data', filename), JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.log('خطأ في كتابة الملف:', filename);
        return false;
    }
}

// API للبيانات العامة (للموقع الرئيسي)
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

// ⭐⭐ الـ APIs للوحة التحكم ⭐⭐

// Middleware للتحقق من الدخول لجميع APIs الإدارة
app.use('/admin/api', (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.status(401).json({ error: 'غير مصرح. يرجى تسجيل الدخول.' });
    }
    next();
});

// APIs للأخبار
app.get('/admin/api/news', (req, res) => {
    const content = readJSONFile('content.json');
    res.json(content.news || []);
});

app.post('/admin/api/news', (req, res) => {
    const content = readJSONFile('content.json');
    const newNews = {
        id: Date.now(),
        ...req.body
    };

    if (!content.news) content.news = [];
    content.news.unshift(newNews);
    
    const success = writeJSONFile('content.json', content);
    
    if (success) {
        res.json({ success: true, news: newNews });
    } else {
        res.json({ success: false, error: 'فشل في حفظ الخبر' });
    }
});

app.delete('/admin/api/news/:id', (req, res) => {
    const content = readJSONFile('content.json');
    const newsId = parseInt(req.params.id);
    
    if (content.news) {
        content.news = content.news.filter(item => item.id !== newsId);
        const success = writeJSONFile('content.json', content);
        
        if (success) {
            res.json({ success: true });
        } else {
            res.json({ success: false, error: 'فشل في حذف الخبر' });
        }
    } else {
        res.json({ success: false, error: 'لا توجد أخبار' });
    }
});

// APIs للكورسات
app.get('/admin/api/courses', (req, res) => {
    const content = readJSONFile('content.json');
    res.json(content.courses || {});
});

app.post('/admin/api/courses', (req, res) => {
    const content = readJSONFile('content.json');
    const { language, level, ...courseData } = req.body;

    if (!content.courses) content.courses = {};
    if (!content.courses[language]) content.courses[language] = {};

    content.courses[language][level] = courseData;
    
    const success = writeJSONFile('content.json', content);
    
    if (success) {
        res.json({ success: true });
    } else {
        res.json({ success: false, error: 'فشل في حفظ الكورس' });
    }
});

app.delete('/admin/api/courses/:language/:level', (req, res) => {
    const content = readJSONFile('content.json');
    const { language, level } = req.params;
    
    if (content.courses && content.courses[language] && content.courses[language][level]) {
        delete content.courses[language][level];
        const success = writeJSONFile('content.json', content);
        
        if (success) {
            res.json({ success: true });
        } else {
            res.json({ success: false, error: 'فشل في حذف الكورس' });
        }
    } else {
        res.json({ success: false, error: 'الكورس غير موجود' });
    }
});

// APIs للدروس
app.get('/admin/api/lessons', (req, res) => {
    const content = readJSONFile('content.json');
    res.json(content.lessons || {});
});

app.post('/admin/api/lessons', (req, res) => {
    const content = readJSONFile('content.json');
    const { language, level, ...lessonData } = req.body;

    if (!content.lessons) content.lessons = {};
    if (!content.lessons[language]) content.lessons[language] = {};
    if (!content.lessons[language][level]) content.lessons[language][level] = [];

    const newLesson = {
        id: Date.now(),
        ...lessonData,
        order: parseInt(lessonData.order) || 1
    };

    content.lessons[language][level].push(newLesson);
    content.lessons[language][level].sort((a, b) => a.order - b.order);
    
    const success = writeJSONFile('content.json', content);
    
    if (success) {
        res.json({ success: true, lesson: newLesson });
    } else {
        res.json({ success: false, error: 'فشل في حفظ الدرس' });
    }
});

app.delete('/admin/api/lessons/:language/:level/:id', (req, res) => {
    const content = readJSONFile('content.json');
    const { language, level, id } = req.params;
    const lessonId = parseInt(id);
    
    if (content.lessons && content.lessons[language] && content.lessons[language][level]) {
        content.lessons[language][level] = content.lessons[language][level].filter(lesson => lesson.id !== lessonId);
        const success = writeJSONFile('content.json', content);
        
        if (success) {
            res.json({ success: true });
        } else {
            res.json({ success: false, error: 'فشل في حذف الدرس' });
        }
    } else {
        res.json({ success: false, error: 'الدرس غير موجود' });
    }
});

// APIs للإشعارات
app.get('/admin/api/notifications', (req, res) => {
    const content = readJSONFile('content.json');
    res.json(content.notifications || []);
});

app.post('/admin/api/notifications', (req, res) => {
    const content = readJSONFile('content.json');
    const newNotification = {
        id: Date.now(),
        ...req.body,
        timestamp: new Date().toISOString()
    };

    if (!content.notifications) content.notifications = [];
    content.notifications.unshift(newNotification);
    
    const success = writeJSONFile('content.json', content);
    
    if (success) {
        res.json({ success: true, notification: newNotification });
    } else {
        res.json({ success: false, error: 'فشل في حفظ الإشعار' });
    }
});

app.delete('/admin/api/notifications/:id', (req, res) => {
    const content = readJSONFile('content.json');
    const notificationId = parseInt(req.params.id);
    
    if (content.notifications) {
        content.notifications = content.notifications.filter(item => item.id !== notificationId);
        const success = writeJSONFile('content.json', content);
        
        if (success) {
            res.json({ success: true });
        } else {
            res.json({ success: false, error: 'فشل في حذف الإشعار' });
        }
    } else {
        res.json({ success: false, error: 'لا توجد إشعارات' });
    }
});

// بدء السيرفر
app.listen(PORT, () => {
    console.log(`✅ السيرفر يعمل على البورت ${PORT}`);
    console.log(`🌐 الموقع الرئيسي: http://localhost:${PORT}`);
    console.log(`⚙️ لوحة التحكم: http://localhost:${PORT}/admin`);
});