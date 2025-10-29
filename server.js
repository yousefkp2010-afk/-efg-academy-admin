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
app.use(express.static('public'));

// جلسات المستخدم
app.use(session({
    secret: 'your-secret-key-here',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// وظيفة لقراءة ملفات JSON
function readJSONFile(filename) {
    try {
        const data = fs.readFileSync(path.join(__dirname, '/data', filename), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

// وظيفة لكتابة ملفات JSON
function writeJSONFile(filename, data) {
    fs.writeFileSync(path.join(__dirname, '/data', filename), JSON.stringify(data, null, 2));
}

// صفحة الدخول
app.get('/admin', (req, res) => {
    if (req.session.isLoggedIn) {
        res.sendFile(path.join(__dirname, '/puplic', 'dashboard.html'));
    } else {
        res.sendFile(path.join(__dirname, '/puplic', 'admin.html'));
    }
});

// معالجة طلب الدخول
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJSONFile('users.json');

    const admin = users.admins.find(a => a.username === username && a.password === password);
    
    if (admin) {
        req.session.isLoggedIn = true;
        req.session.username = username;
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
});

// تسجيل الخروج
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin');
});

// Middleware للتحقق من تسجيل الدخول
function requireLogin(req, res, next) {
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.status(401).json({ error: 'غير مصرح' });
    }
}
// APIs للأخبار

// الحصول على جميع الأخبار
app.get('/admin/api/news', requireLogin, (req, res) => {
    const content = readJSONFile('content.json');
    res.json(content.news || []);
});

// إضافة خبر جديد
app.post('/admin/api/news', requireLogin, (req, res) => {
    const content = readJSONFile('content.json');
    const newNews = {
        id: Date.now(),
        ...req.body
    };

    if (!content.news) content.news = [];
    content.news.unshift(newNews);
    
    writeJSONFile('content.json', content);
    res.json({ success: true, news: newNews });
});

// حذف خبر
app.delete('/admin/api/news/:id', requireLogin, (req, res) => {
    const content = readJSONFile('content.json');
    const newsId = parseInt(req.params.id);
    
    if (content.news) {
        content.news = content.news.filter(item => item.id !== newsId);
        writeJSONFile('content.json', content);
        res.json({ success: true });
    } else {
        res.json({ success: false, error: 'لا توجد أخبار' });
    }
});
// APIs للكورسات

// الحصول على جميع الكورسات
app.get('/admin/api/courses', requireLogin, (req, res) => {
    const content = readJSONFile('content.json');
    res.json(content.courses || {});
});

// إضافة كورس جديد
app.post('/admin/api/courses', requireLogin, (req, res) => {
    const content = readJSONFile('content.json');
    const { language, level, ...courseData } = req.body;

    if (!content.courses) content.courses = {};
    if (!content.courses[language]) content.courses[language] = {};

    content.courses[language][level] = courseData;
    
    writeJSONFile('content.json', content);
    res.json({ success: true });
});

// حذف كورس
app.delete('/admin/api/courses/:language/:level', requireLogin, (req, res) => {
    const content = readJSONFile('content.json');
    const { language, level } = req.params;
    
    if (content.courses && content.courses[language] && content.courses[language][level]) {
        delete content.courses[language][level];
        writeJSONFile('content.json', content);
        res.json({ success: true });
    } else {
        res.json({ success: false, error: 'الكورس غير موجود' });
    }
});

// APIs للدروس

// الحصول على جميع الدروس
app.get('/admin/api/lessons', requireLogin, (req, res) => {
    const content = readJSONFile('content.json');
    res.json(content.lessons || {});
});

// إضافة درس جديد
app.post('/admin/api/lessons', requireLogin, (req, res) => {
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
    
    // ترتيب الدروس حسب الترتيب
    content.lessons[language][level].sort((a, b) => a.order - b.order);
    
    writeJSONFile('content.json', content);
    res.json({ success: true, lesson: newLesson });
});

// حذف درس
app.delete('/admin/api/lessons/:language/:level/:id', requireLogin, (req, res) => {
    const content = readJSONFile('content.json');
    const { language, level, id } = req.params;
    const lessonId = parseInt(id);
    
    if (content.lessons && content.lessons[language] && content.lessons[language][level]) {
        content.lessons[language][level] = content.lessons[language][level].filter(lesson => lesson.id !== lessonId);
        writeJSONFile('content.json', content);
        res.json({ success: true });
    } else {
        res.json({ success: false, error: 'الدرس غير موجود' });
    }
});
// بدء السيرفر
app.listen(PORT, () => {
    console.log(`السيرفر يعمل على http://localhost:${PORT}`);
});