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
app.use(express.static('public'));

// إصلاح مشكلة الجلسات على render.com
app.set('trust proxy', 1); // مهم لخدمات السحابية

// جلسات المستخدم - الإصدار المصحح
app.use(session({
    store: new MemoryStore({
        checkPeriod: 86400000
    }),
    secret: process.env.SESSION_SECRET || 'efg-academy-secret-key-2024-' + Math.random().toString(36),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // غير إلى false لتعمل على render.com
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
}));

// وظيفة لقراءة ملفات JSON
function readJSONFile(filename) {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data', filename), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('خطأ في قراءة الملف:', filename, error.message);
        return {};
    }
}

// وظيفة لكتابة ملفات JSON
function writeJSONFile(filename, data) {
    try {
        fs.writeFileSync(path.join(__dirname, 'data', filename), JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.log('خطأ في كتابة الملف:', filename, error.message);
        return false;
    }
}

// صفحة الرئيسية
app.get('/', (req, res) => {
    res.redirect('/admin');
});

// صفحة الدخول
app.get('/admin', (req, res) => {
    console.log('جلسة المستخدم:', req.session);
    console.log('هل تم تسجيل الدخول؟', req.session.isLoggedIn);
    
    if (req.session.isLoggedIn) {
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    }
});

// معالجة طلب الدخول - الإصدار المحسن
app.post('/admin/login', (req, res) => {
    console.log('طلب دخول مستلم:', req.body);
    
    const { username, password } = req.body;
    const users = readJSONFile('users.json');

    console.log('المستخدمون الموجودون:', users);

    // تحقق من وجود ملف المستخدمين
    if (!users.admins || !Array.isArray(users.admins)) {
        console.log('خطأ: ملف المستخدمين غير صالح');
        return res.json({ 
            success: false, 
            message: 'خطأ في النظام. يرجى المحاولة لاحقاً.' 
        });
    }

    const admin = users.admins.find(a => a.username === username && a.password === password);
    
    if (admin) {
        // إعداد الجلسة
        req.session.isLoggedIn = true;
        req.session.username = username;
        req.session.userId = Date.now();
        
        console.log('تم تسجيل الدخول بنجاح:', req.session);
        
        // حفظ الجلسة قبل الإرسال
        req.session.save((err) => {
            if (err) {
                console.log('خطأ في حفظ الجلسة:', err);
                return res.json({ 
                    success: false, 
                    message: 'خطأ في النظام' 
                });
            }
            
            res.json({ 
                success: true,
                message: 'تم الدخول بنجاح'
            });
        });
    } else {
        console.log('فشل تسجيل الدخول:', username);
        res.json({ 
            success: false, 
            message: 'اسم المستخدم أو كلمة المرور غير صحيحة' 
        });
    }
});

// تسجيل الخروج
app.get('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('خطأ في تسجيل الخروج:', err);
        }
        res.redirect('/admin');
    });
});

// Middleware للتحقق من تسجيل الدخول
function requireLogin(req, res, next) {
    console.log('التحقق من تسجيل الدخول:', req.session.isLoggedIn);
    
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.status(401).json({ 
            error: 'غير مصرح. يرجى تسجيل الدخول أولاً.' 
        });
    }
}

// APIs للأخبار
app.get('/admin/api/news', requireLogin, (req, res) => {
    const content = readJSONFile('content.json');
    res.json(content.news || []);
});

app.post('/admin/api/news', requireLogin, (req, res) => {
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
        res.json({ success: false, error: 'فشل في حفظ البيانات' });
    }
});

app.delete('/admin/api/news/:id', requireLogin, (req, res) => {
    const content = readJSONFile('content.json');
    const newsId = parseInt(req.params.id);
    
    if (content.news) {
        content.news = content.news.filter(item => item.id !== newsId);
        const success = writeJSONFile('content.json', content);
        
        if (success) {
            res.json({ success: true });
        } else {
            res.json({ success: false, error: 'فشل في حفظ البيانات' });
        }
    } else {
        res.json({ success: false, error: 'لا توجد أخبار' });
    }
});

// APIs للكورسات والدروس (نفس الكود السابق)
app.get('/admin/api/courses', requireLogin, (req, res) => {
    const content = readJSONFile('content.json');
    res.json(content.courses || {});
});

app.post('/admin/api/courses', requireLogin, (req, res) => {
    const content = readJSONFile('content.json');
    const { language, level, ...courseData } = req.body;

    if (!content.courses) content.courses = {};
    if (!content.courses[language]) content.courses[language] = {};

    content.courses[language][level] = courseData;
    
    const success = writeJSONFile('content.json', content);
    
    if (success) {
        res.json({ success: true });
    } else {
        res.json({ success: false, error: 'فشل في حفظ البيانات' });
    }
});

app.delete('/admin/api/courses/:language/:level', requireLogin, (req, res) => {
    const content = readJSONFile('content.json');
    const { language, level } = req.params;
    
    if (content.courses && content.courses[language] && content.courses[language][level]) {
        delete content.courses[language][level];
        const success = writeJSONFile('content.json', content);
        
        if (success) {
            res.json({ success: true });
        } else {
            res.json({ success: false, error: 'فشل في حفظ البيانات' });
        }
    } else {
        res.json({ success: false, error: 'الكورس غير موجود' });
    }
});

app.get('/admin/api/lessons', requireLogin, (req, res) => {
    const content = readJSONFile('content.json');
    res.json(content.lessons || {});
});

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
    content.lessons[language][level].sort((a, b) => a.order - b.order);
    
    const success = writeJSONFile('content.json', content);
    
    if (success) {
        res.json({ success: true, lesson: newLesson });
    } else {
        res.json({ success: false, error: 'فشل في حفظ البيانات' });
    }
});

app.delete('/admin/api/lessons/:language/:level/:id', requireLogin, (req, res) => {
    const content = readJSONFile('content.json');
    const { language, level, id } = req.params;
    const lessonId = parseInt(id);
    
    if (content.lessons && content.lessons[language] && content.lessons[language][level]) {
        content.lessons[language][level] = content.lessons[language][level].filter(lesson => lesson.id !== lessonId);
        const success = writeJSONFile('content.json', content);
        
        if (success) {
            res.json({ success: true });
        } else {
            res.json({ success: false, error: 'فشل في حفظ البيانات' });
        }
    } else {
        res.json({ success: false, error: 'الدرس غير موجود' });
    }
});

// بدء السيرفر
app.listen(PORT, () => {
    console.log(`✅ السيرفر يعمل على http://localhost:${PORT}`);
    console.log(`✅ لوحة التحكم: http://localhost:${PORT}/admin`);
});