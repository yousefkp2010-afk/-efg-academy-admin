const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// 📧 إعدادات Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// 🔥 إعدادات GitHub للنشر
const GITHUB_CONFIG = {
  token: process.env.GITHUB_TOKEN, // س تضيفه في الخطوة التالية
  owner: 'yousefkp2010-afk',
  repo: 'efg-academy-data',
  branch: 'main'
};
// 📁 وظيفة النشر إلى GitHub
async function publishToGitHub(data) {
  if (!GITHUB_CONFIG.token || !GITHUB_CONFIG.owner || !GITHUB_CONFIG.repo) {
    console.log('⚠️ إعدادات GitHub غير مكتملة - تخطي النشر');
    return false;
  }

  try {
    console.log('🚀 بدء النشر إلى GitHub...');
    
    const getUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/data.json`;
    const getResponse = await fetch(getUrl, {
      headers: {
        'Authorization': `Bearer ${GITHUB_CONFIG.token}`,
        'User-Agent': 'EFG-Academy-App'
      }
    });

    let sha = null;
    if (getResponse.status === 200) {
      const fileInfo = await getResponse.json();
      sha = fileInfo.sha;
    }

    const updateUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/data.json`;
    const contentBase64 = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_CONFIG.token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'EFG-Academy-App'
      },
      body: JSON.stringify({
        message: `Auto-update: ${new Date().toLocaleString('ar-EG')}`,
        content: contentBase64,
        sha: sha,
        branch: GITHUB_CONFIG.branch
      })
    });

    if (updateResponse.ok) {
      console.log('✅ تم النشر إلى GitHub بنجاح!');
      return true;
    } else {
      const errorText = await updateResponse.text();
      console.error('❌ فشل النشر إلى GitHub:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ خطأ في النشر إلى GitHub:', error.message);
    return false;
  }
}

// 📁 وظيفة إرسال النسخة الاحتياطية بالإيميل
async function sendBackupEmail() {
    try {
        console.log('🔄 بدء عملية النسخ الاحتياطي بالإيميل...');
        
        const backupPath = path.join(__dirname, 'data', 'content.json');
        
        if (!fs.existsSync(backupPath)) {
            console.log('❌ ملف content.json غير موجود');
            return false;
        }
        
        const fileContent = fs.readFileSync(backupPath, 'utf8');
        if (!fileContent) {
            console.log('❌ ملف content.json فارغ');
            return false;
        }
        
        const fileStats = fs.statSync(backupPath);
        const fileSize = (fileStats.size / 1024).toFixed(2);
        
        console.log(`📊 حجم الملف: ${fileSize} KB`);

        const { data, error } = await resend.emails.send({
            from: 'EFG Academy <onboarding@resend.dev>',
            to: ['yousefkp2010@gmail.com'],
            subject: `نسخة احتياطية - ${new Date().toLocaleDateString('ar-EG')}`,
            html: `
                <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #2E86AB;">🎓 نسخة احتياطية تلقائية - EFG Academy</h2>
                    <p>تم إنشاء نسخة احتياطية من ملف content.json تلقائياً</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>📁 الحجم:</strong> ${fileSize} KB</p>
                        <p><strong>🕒 الوقت:</strong> ${new Date().toLocaleString('ar-EG')}</p>
                        <p><strong>🔔 السبب:</strong> تعديل محتوى الموقع</p>
                    </div>
                    <p style="color: #666; font-size: 14px;">هذه الرسالة تلقائية - لا ترد عليها</p>
                </div>
            `,
            attachments: [
                {
                    filename: `content_backup_${Date.now()}.json`,
                    content: Buffer.from(fileContent).toString('base64')
                }
            ]
        });

        if (error) {
            console.error('❌ فشل في إرسال الإيميل:', error);
            return false;
        }

        console.log('✅ تم إرسال الإيميل بنجاح!');
        return true;
        
    } catch (error) {
        console.error('❌ فشل في إرسال الإيميل:', error.message);
        return false;
    }
}

// 📁 وظيفة حفظ نسخة محلية احتياطية
function createLocalBackup() {
    try {
        const content = readJSONFile('content.json');
        const backupDir = path.join(__dirname, 'backups');
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const backupFileName = `content_backup_${Date.now()}.json`;
        const backupPath = path.join(backupDir, backupFileName);
        
        fs.writeFileSync(backupPath, JSON.stringify(content, null, 2));
        console.log(`✅ تم إنشاء نسخة محلية: ${backupFileName}`);
        return true;
    } catch (error) {
        console.error('❌ خطأ في إنشاء النسخة المحلية:', error);
        return false;
    }
}

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
        
        if (filename === 'content.json') {
            console.log('🚀 بدء عملية النشر إلى GitHub...');
            
            publishToGitHub(data).then(githubSuccess => {
                if (githubSuccess) {
                    console.log('🎉 اكتملت عملية النشر إلى GitHub بنجاح');
                } else {
                    console.log('⚠️ تم الحفظ محلياً لكن فشل النشر إلى GitHub');
                }
            });
            
            console.log('🔄 إنشاء نسخة احتياطية...');
            createLocalBackup();
        }
        
        return true;
    } catch (error) {
        console.log('خطأ في كتابة الملف:', filename);
        return false;
    }
}

// API للبيانات العامة (للموقع الرئيسي)
app.get('/api/data', async (req, res) => {
    if (GITHUB_CONFIG.token) {
        try {
            const githubDataUrl = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/main/data.json`;
            const response = await fetch(githubDataUrl);
            if (response.ok) {
                const githubData = await response.json();
                console.log('📦 تم تحميل البيانات من GitHub');
                return res.json(githubData);
            }
        } catch (error) {
            console.log('⚠️ استخدام البيانات المحلية بدلاً من GitHub');
        }
    }
    
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
    if (!content.courses[language][level]) content.courses[language][level] = {};

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

// API للنشر اليدوي إلى GitHub
app.post('/admin/api/publish', async (req, res) => {
    try {
        const content = readJSONFile('content.json');
        const success = await publishToGitHub(content);
        
        if (success) {
            res.json({ success: true, message: 'تم النشر إلى GitHub بنجاح' });
        } else {
            res.json({ success: false, error: 'فشل في النشر إلى GitHub' });
        }
    } catch (error) {
        res.json({ success: false, error: 'خطأ في النشر: ' + error.message });
    }
});

// Health check route
app.get('/health-check', (req, res) => {
  res.status(200).json({ status: 'OK', time: new Date() });
});

// بدء السيرفر
app.listen(PORT, () => {
    console.log(`✅ السيرفر يعمل على البورت ${PORT}`);
    console.log(`🌐 الموقع الرئيسي: http://localhost:${PORT}`);
    console.log(`⚙️ لوحة التحكم: http://localhost:${PORT}/admin`);
    
    if (GITHUB_CONFIG.token && GITHUB_CONFIG.owner && GITHUB_CONFIG.repo) {
        console.log(`🚀 نظام النشر إلى GitHub جاهز: ${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`);
    } else {
        console.log('⚠️ إعدادات GitHub غير مكتملة - سيتم الحفظ محلياً فقط');
    }
});
