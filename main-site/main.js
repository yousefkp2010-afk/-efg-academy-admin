// js/main.js

// تهيئة التطبيق عند تحميل الصفحة
async function loadData() {
    try {
        const response = await fetch('/api/data');
        window.efgData = await response.json();
    } catch (error) {
        // إذا فشل الاتصال، استخدم بيانات افتراضية
        window.efgData = { news: [], courses: {}, lessons: {} };
    }
}

// بدء التطبيق بعد تحميل البيانات
document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    initializeApp(); // استدعاء الدوال الأصلية
});
function initializeApp() {
    initNavigation();
    initLevelSystem();
    loadContent();
    initNotifications();
    initSmoothScroll();
}

// نظام التنقل
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // toggle قائمة الهواتف
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // إغلاق القائمة عند النقر على رابط
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // تغيير لون الشريط عند التمرير
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'var(--white)';
            navbar.style.backdropFilter = 'none';
        }
    });
}

// نظام المستويات
function initLevelSystem() {
    const levelButtons = document.querySelectorAll('.level-btn');
    
    levelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const languageCard = this.closest('.language-card');
            const language = languageCard.querySelector('h3').textContent;
            const level = this.textContent;
            
            // اختيار المستوى مباشرة بدون نافذة منبثقة
            selectLevel(language, level);
        });
    });
}
// فتح النموذج المنبثق لاختيار المستوى
function openLevelModal(language, level) {

    selectLevel(language, level); // الاختيار المباشر
}

// تحديث نظام المستويات
function selectLevel(language, level) {
    // حفظ في localStorage مع اللغة المحددة
    const userPreferences = {
        language: language,
        level: level,
        languageCode: getLanguageCode(language),
        selectedAt: new Date().toISOString()
    };
    
    localStorage.setItem('efg_user_preferences', JSON.stringify(userPreferences));
    
    // عرض إشعار
    showToast(`تم اختيار ${language} - المستوى ${level}`, 'success');
    
    // تحديث الواجهة وعرض الدروس
    updateSelectedLevelDisplay();
    displayLessons(language, level);
    
    // التمرير إلى قسم الدروس
    scrollToLessons();
}
function scrollToLessons() {
    const lessonsSection = document.getElementById('lessons');
    if (lessonsSection) {
        const offsetTop = lessonsSection.offsetTop - 100;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// تحديث عرض المستوى المختار
function updateSelectedLevelDisplay() {
    const preferences = getUserPreferences();
    if (!preferences) return;
    
    // إعادة تعيين جميع الأزرار
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '';
        btn.style.color = '';
    });
    
    // تلوين الزر المختار في اللغة المحددة فقط
    const languageCards = document.querySelectorAll('.language-card');
    languageCards.forEach(card => {
        const cardLanguage = card.querySelector('h3').textContent;
        if (cardLanguage === preferences.language) {
            const levelBtns = card.querySelectorAll('.level-btn');
            levelBtns.forEach(btn => {
                if (btn.textContent === preferences.level) {
                    btn.classList.add('active');
                    btn.style.background = 'var(--gold)';
                    btn.style.color = 'var(--primary-blue)';
                }
            });
        }
    });
}

// عرض الدروس للمستوى المختار
function displayLessons(language, level) {
    const languageCode = getLanguageCode(language);
    const lessonsContainer = document.getElementById('lessons-container');
    
    // مسح المحتوى السابق
    lessonsContainer.innerHTML = '';
    
    // البحث عن الدروس المناسبة
    const lessons = window.efgData.lessons[languageCode]?.[level] || [];
    
    if (lessons.length === 0) {
        lessonsContainer.innerHTML = `
            <div class="no-lessons">
                <h3>🚧 الدروس قيد التجهيز</h3>
                <p>سيتم إضافة الدروس لهذا المستوى قريباً. ترقبوا التحديثات!</p>
            </div>
        `;
        return;
    }
    
    // إضافة عنوان القسم
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'lessons-section-title';
    sectionTitle.textContent = `دروس ${language} - المستوى ${level}`;
    lessonsContainer.appendChild(sectionTitle);
    
    // إنشاء بطاقات الدروس
    const lessonsGrid = document.createElement('div');
    lessonsGrid.className = 'lessons-grid';
    
    lessons.forEach(lesson => {
        const lessonCard = document.createElement('div');
        lessonCard.className = 'lesson-card';
        lessonCard.innerHTML = `
            <div class="lesson-image">
                <img src="${lesson.image}" alt="${lesson.title}" loading="lazy">
                <div class="lesson-duration">${lesson.duration}</div>
            </div>
            <div class="lesson-content">
                <h3 class="lesson-title">${lesson.title}</h3>
                <p class="lesson-description">${lesson.description}</p>
                <div class="lesson-actions">
                    <a href="${lesson.youtubeLink}" target="_blank" class="btn btn-primary">
                        📺 شاهد على يوتيوب
                    </a>
                </div>
            </div>
        `;
        lessonsGrid.appendChild(lessonCard);
    });
    
    lessonsContainer.appendChild(lessonsGrid);
}

// دالة مساعدة للحصول على كود اللغة
function getLanguageCode(languageName) {
    const languageMap = {
        'اللغة الإنجليزية': 'english',
        'اللغة الألمانية': 'german', 
        'اللغة الفرنسية': 'french'
    };
    return languageMap[languageName] || 'english';
}

// تحديث تحميل المحتوى
function loadContent() {
    loadLevels();
    loadNews(); 
    loadContactLinks();
    updateSelectedLevelDisplay();
    
    // تحميل الدروس إذا كان هناك تفضيلات محفوظة
    const preferences = getUserPreferences();
    if (preferences) {
        displayLessons(preferences.language, preferences.level);
    }
}


// الحصول على تفضيلات المستخدم
function getUserPreferences() {
    const preferences = localStorage.getItem('efg_user_preferences');
    return preferences ? JSON.parse(preferences) : null;
}


// التمرير السلس
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // تعويض الشريط الثابت
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}


// تحميل المستويات
function loadLevels() {
    const languages = ['english', 'german', 'french'];
    
    languages.forEach(lang => {
        const container = document.getElementById(`${lang}-levels`);
        if (container) {
            const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            
            levels.forEach(level => {
                const levelBtn = document.createElement('button');
                levelBtn.className = 'level-btn';
                levelBtn.textContent = level;
                levelBtn.addEventListener('click', function() {
                    const languageName = getLanguageName(lang);
                    openLevelModal(languageName, level);
                });
                container.appendChild(levelBtn);
            });
        }
    });
}

// تحميل الأخبار
function loadNews() {
    const newsContainer = document.getElementById('news-container');
    
    if (window.efgData && window.efgData.news) {
        window.efgData.news.forEach(newsItem => {
            const newsCard = createNewsCard(newsItem);
            newsContainer.appendChild(newsCard);
        });
    } else {
        // بيانات افتراضية في حالة عدم وجود data.js
        const defaultNews = [
            {
                date: '2024-01-15',
                title: 'إطلاق كورس الألمانية A1.1 المجاني',
                description: 'تم إطلاق الكورس المجاني لتعلم اللغة الألمانية للمستوى A1.1'
            },
            {
                date: '2024-01-10',
                title: 'مسابقة نهاية الشابتر الأول',
                description: 'انضم لمسابقة المراجعة واربح هدايا قيمة'
            }
        ];
        
        defaultNews.forEach(newsItem => {
            const newsCard = createNewsCard(newsItem);
            newsContainer.appendChild(newsCard);
        });
    }
}

// إنشاء بطاقة خبر
function createNewsCard(newsItem) {
    const card = document.createElement('div');
    card.className = 'news-card';
    
    card.innerHTML = `
        <div class="news-content">
            <div class="news-date">${formatDate(newsItem.date)}</div>
            <h3 class="news-title">${newsItem.title}</h3>
            <p class="news-description">${newsItem.description}</p>
        </div>
    `;
    
    return card;
}

// تحميل روابط التواصل
function loadContactLinks() {
    const youtubeLink = document.getElementById('youtube-link');
    const telegramLink = document.getElementById('telegram-link');
    
    if (window.efgData && window.efgData.contact) {
        if (youtubeLink) youtubeLink.href = window.efgData.contact.youtube;
        if (telegramLink) telegramLink.href = window.efgData.contact.telegram;
    } else {
        // روابط افتراضية
        if (youtubeLink) youtubeLink.href = 'https://youtube.com/c/EFGAcademy';
        if (telegramLink) telegramLink.href = 'https://t.me/EFGAcademy';
    }
}

// إشعارات Toast
function showToast(message, type = 'info') {
    // إنصراف element جديد للإشعار
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // إضافة أنيميشن للإشعار
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // إظهار الإشعار
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // إخفاء الإشعار بعد 3 ثواني
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// وظائف مساعدة
function getLanguageName(langCode) {
    const languages = {
        'english': 'اللغة الإنجليزية',
        'german': 'اللغة الألمانية', 
        'french': 'اللغة الفرنسية'
    };
    return languages[langCode] || langCode;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
}

// تحميل تفضيلات المستخدم عند فتح الصفحة
function loadUserPreferences() {
    const preferences = getUserPreferences();
    if (preferences) {
        console.log('تم تحميل تفضيلات المستخدم:', preferences);
    }
}

// التهيئة النهائية
window.addEventListener('load', function() {
    loadUserPreferences();
    
    // إضافة أنيميشن للعناصر عند التمرير
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // مراقبة العناصر لإضافة أنيميشن
    const animatedElements = document.querySelectorAll('.language-card, .feature-card, .news-card, .contact-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});



// في main.js - إضافة هذه الدوال

// تهيئة نظام الإشعارات
function initNotifications() {
    // إنصراف واجهة الإشعارات إذا لم تكن موجودة
    if (!document.getElementById('notifications-container')) {
        const notificationsContainer = document.createElement('div');
        notificationsContainer.id = 'notifications-container';
        notificationsContainer.className = 'notifications-container';
        document.body.appendChild(notificationsContainer);
    }

    // إضافة زر الإشعارات في الشريط إذا لم يكن موجوداً
    if (!document.querySelector('.nav-notifications')) {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            const notificationsItem = document.createElement('li');
            notificationsItem.className = 'nav-item nav-notifications';
            notificationsItem.innerHTML = `
                <a href="#" class="nav-link" id="notifications-toggle">
                    🔔
                    <span class="notification-badge" id="notification-badge"></span>
                </a>
            `;
            navMenu.appendChild(notificationsItem);

            // إضافة حدث النقر
            document.getElementById('notifications-toggle').addEventListener('click', function(e) {
                e.preventDefault();
                toggleNotificationsPanel();
            });
        }
    }

    // إنصراف لوحة الإشعارات
    if (!document.getElementById('notifications-panel')) {
        const panel = document.createElement('div');
        panel.id = 'notifications-panel';
        panel.className = 'notifications-panel';
        panel.innerHTML = `
            <div class="notifications-header">
                <h3>الإشعارات</h3>
                <button class="mark-all-read" onclick="notificationSystem.markAllAsRead()">
                    تعيين الكل كمقروء
                </button>
            </div>
            <div class="notifications-list" id="notifications-list">
                <!-- الإشعارات تضاف هنا -->
            </div>
            <div class="notifications-footer">
                <button class="close-panel" onclick="closeNotificationsPanel()">
                    إغلاق
                </button>
            </div>
        `;
        document.body.appendChild(panel);
    }

    // تحميل الإشعارات في اللوحة
    loadNotificationsPanel();
}

// تحميل الإشعارات في اللوحة
function loadNotificationsPanel() {
    const list = document.getElementById('notifications-list');
    if (!list) return;

    list.innerHTML = '';

    window.notificationSystem.notifications.forEach(notification => {
        const item = document.createElement('div');
        item.className = `notification-panel-item ${notification.read ? 'read' : 'unread'}`;
        item.setAttribute('data-id', notification.id);
        
        item.innerHTML = `
            <div class="notification-panel-icon">${notification.icon}</div>
            <div class="notification-panel-content">
                <div class="notification-panel-title">${notification.title}</div>
                <div class="notification-panel-message">${notification.message}</div>
                <div class="notification-panel-time">${window.notificationSystem.formatTime(notification.timestamp)}</div>
            </div>
            ${!notification.read ? '<div class="unread-dot"></div>' : ''}
        `;

        item.addEventListener('click', () => {
            window.notificationSystem.markAsRead(notification.id);
            if (notification.link && notification.link !== '#') {
                window.location.href = notification.link;
            }
            closeNotificationsPanel();
        });

        list.appendChild(item);
    });

    // إذا لم توجد إشعارات
    if (window.notificationSystem.notifications.length === 0) {
        list.innerHTML = `
            <div class="no-notifications">
                <div class="no-notifications-icon">🔔</div>
                <p>لا توجد إشعارات جديدة</p>
            </div>
        `;
    }
}

// فتح/إغلاق لوحة الإشعارات
function toggleNotificationsPanel() {
    const panel = document.getElementById('notifications-panel');
    panel.classList.toggle('active');
}

function closeNotificationsPanel() {
    const panel = document.getElementById('notifications-panel');
    panel.classList.remove('active');
}


