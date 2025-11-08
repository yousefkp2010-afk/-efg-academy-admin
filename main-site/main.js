// js/main.js - نظام مبسط بدون تعقيد

// متغيرات النظام
let allNotifications = [];
let displayedNotificationIds = new Set();

// تحميل البيانات الأساسية
async function loadData() {
    try {
        const response = await fetch('/api/data');
        window.efgData = await response.json();
        console.log('✅ تم تحميل البيانات الأساسية');
    } catch (error) {
        console.error('❌ فشل في تحميل البيانات:', error);
        window.efgData = { news: [], courses: {}, lessons: {}, notifications: [] };
    }
}

// تحميل الإشعارات من السيرفر
async function loadNotifications() {
    try {
        console.log('🔄 جاري تحميل الإشعارات...');
        const response = await fetch('/api/notifications');
        
        if (!response.ok) throw new Error(`خطأ في السيرفر: ${response.status}`);
        
        allNotifications = await response.json();
        console.log('📨 عدد الإشعارات المستلمة:', allNotifications.length);
        
        // تحميل الإشعارات المعروضة مسبقاً
        loadDisplayedNotifications();
        
        // عرض الإشعارات الجديدة
        showNewNotifications();
        
        // تحديث العداد
        updateNotificationBadge();
        
    } catch (error) {
        console.error('❌ فشل في تحميل الإشعارات:', error);
        allNotifications = [];
    }
}

// تحميل الإشعارات المعروضة مسبقاً
function loadDisplayedNotifications() {
    try {
        const saved = localStorage.getItem('efg_displayed_notifications');
        if (saved) {
            displayedNotificationIds = new Set(JSON.parse(saved));
        }
        console.log('📋 الإشعارات المعروضة مسبقاً:', displayedNotificationIds.size);
    } catch (error) {
        console.error('❌ خطأ في تحميل الإشعارات المعروضة:', error);
        displayedNotificationIds = new Set();
    }
}

// حفظ الإشعارات المعروضة
function saveDisplayedNotifications() {
    try {
        const toSave = Array.from(displayedNotificationIds);
        localStorage.setItem('efg_displayed_notifications', JSON.stringify(toSave));
    } catch (error) {
        console.error('❌ خطأ في حفظ الإشعارات المعروضة:', error);
    }
}

// عرض الإشعارات الجديدة
function showNewNotifications() {
    const newNotifications = allNotifications.filter(notification => 
        !displayedNotificationIds.has(notification.id.toString())
    );

    console.log('🆕 الإشعارات الجديدة:', newNotifications.length);

    if (newNotifications.length > 0) {
        // عرض أول إشعار جديد فقط (لمنع التكرار)
        const notification = newNotifications[0];
        showNotificationPopup(notification);
        
        // وضع علامة على جميع الإشعارات الجديدة كمعروضة
        newNotifications.forEach(notif => {
            displayedNotificationIds.add(notif.id.toString());
        });
        saveDisplayedNotifications();
    }
}

// عرض نافذة منبثقة للإشعار
function showNotificationPopup(notification) {
    // منع النوافذ المكررة
    if (document.querySelector('.notification-popup')) return;

    const popup = document.createElement('div');
    popup.className = 'notification-popup';
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        width: 350px;
        border-right: 5px solid ${getNotificationColor(notification.type)};
        animation: slideIn 0.3s ease;
    `;
    
    popup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">${getNotificationIcon(notification.type)}</span>
                <h4 style="margin: 0; color: #0d1b36;">${notification.title}</h4>
            </div>
            <button onclick="closeNotificationPopup(this)" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">✕</button>
        </div>
        <p style="margin: 0; color: #666; line-height: 1.5;">${notification.message}</p>
        <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
            <small style="color: #999;">${new Date(notification.timestamp).toLocaleString('ar-EG')}</small>
            ${notification.link && notification.link !== '#' ? 
                `<a href="${notification.link}" target="_blank" style="color: #d4af37; text-decoration: none;">المزيد →</a>` : ''
            }
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // إزالة النافذة تلقائياً بعد 8 ثواني
    setTimeout(() => {
        closeNotificationPopup(popup.querySelector('button'));
    }, 8000);
}

// إغلاق النافذة المنبثقة
function closeNotificationPopup(closeButton) {
    const popup = closeButton.closest('.notification-popup');
    if (popup) {
        popup.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 300);
    }
}

// الحصول على لون الإشعار
function getNotificationColor(type) {
    const colors = {
        'info': '#3b82f6',
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'update': '#8b5cf6',
        'event': '#ec4899',
        'course': '#06b6d4',
        'news': '#f97316'
    };
    return colors[type] || '#3b82f6';
}

// الحصول على أيقونة الإشعار
function getNotificationIcon(type) {
    const icons = {
        'info': 'ℹ️',
        'success': '✅', 
        'warning': '⚠️',
        'error': '❌',
        'update': '🔄',
        'event': '🎉',
        'course': '📚',
        'news': '📰'
    };
    return icons[type] || '🔔';
}

// تحديث عداد الإشعارات
function updateNotificationBadge() {
    const unreadCount = allNotifications.filter(n => !n.read).length;
    let badge = document.getElementById('notification-badge');
    
    if (!badge) {
        const toggle = document.getElementById('notifications-toggle');
        if (toggle) {
            badge = document.createElement('span');
            badge.id = 'notification-badge';
            badge.className = 'notification-badge';
            toggle.appendChild(badge);
        }
    }
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// تحميل الإشعارات في الصندوق
async function loadPopupNotifications() {
    try {
        console.log('📦 جاري تحميل الإشعارات للصندوق...');
        const response = await fetch('/api/notifications');
        
        if (!response.ok) throw new Error(`خطأ في السيرفر: ${response.status}`);
        
        const notifications = await response.json();
        const content = document.getElementById('notifications-popup-content');
        
        if (!content) {
            console.error('❌ عنصر عرض الإشعارات غير موجود');
            return;
        }
        
        console.log('📊 عرض الإشعارات في الصندوق:', notifications.length);
        
        if (notifications.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🔔</div>
                    <p>لا توجد إشعارات</p>
                </div>
            `;
        } else {
            content.innerHTML = notifications.map(notification => `
                <div class="notification-item" style="padding: 15px; border-bottom: 1px solid #eee; display: flex; gap: 10px; background: ${notification.read ? '#f9f9f9' : 'white'};">
                    <div style="font-size: 20px;">${getNotificationIcon(notification.type)}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; margin-bottom: 5px; color: #0d1b36; display: flex; align-items: center; gap: 8px;">
                            ${notification.title}
                            ${notification.important ? '<span style="color: red; font-size: 12px; background: #ffeaea; padding: 2px 6px; border-radius: 10px;">⭐ مهم</span>' : ''}
                        </div>
                        <div style="color: #666; margin-bottom: 5px; line-height: 1.4;">${notification.message}</div>
                        <div style="font-size: 12px; color: #999;">
                            ${new Date(notification.timestamp).toLocaleString('ar-EG')}
                            ${notification.read ? ' | ✅ مقروء' : ' | 👁️ غير مقروء'}
                            ${notification.link && notification.link !== '#' ? 
                                ` | <a href="${notification.link}" target="_blank" style="color: #d4af37;">رابط متعلق</a>` : ''
                            }
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('❌ فشل في تحميل الإشعارات للصندوق:', error);
        const content = document.getElementById('notifications-popup-content');
        if (content) {
            content.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #ef4444;">
                    فشل في تحميل الإشعارات
                </div>
            `;
        }
    }
}

// عرض صندوق الإشعارات
function showNotificationsPopup() {
    const popup = document.createElement('div');
    popup.className = 'notifications-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 1000;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    popup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
            <h3 style="margin: 0; color: #0d1b36;">🔔 جميع الإشعارات</h3>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #666;">✕</button>
        </div>
        <div id="notifications-popup-content">
            <div style="text-align: center; padding: 20px; color: #666;">
                جاري تحميل الإشعارات...
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    loadPopupNotifications();
}

// إنشاء زر الإشعارات
function createNotificationsButton() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    
    if (document.querySelector('.nav-notifications')) return;
    
    const notificationsItem = document.createElement('li');
    notificationsItem.className = 'nav-item nav-notifications';
    notificationsItem.innerHTML = `
        <a href="#" class="nav-link" id="notifications-toggle">
            🔔 الإشعارات
            <span class="notification-badge" id="notification-badge" style="display: none;"></span>
        </a>
    `;
    navMenu.appendChild(notificationsItem);
    
    document.getElementById('notifications-toggle').addEventListener('click', function(e) {
        e.preventDefault();
        showNotificationsPopup();
    });
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 بدء تحميل التطبيق...');
    await loadData();
    initializeApp();
});

function initializeApp() {
    console.log('⚙️ تهيئة التطبيق...');
    
    initNavigation();
    initLevelSystem();
    loadContent();
    createNotificationsButton();
    initSmoothScroll();
    
    // تحميل الإشعارات بعد تهيئة التطبيق
    setTimeout(() => {
        loadNotifications();
    }, 1000);
}

// نظام التنقل
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (hamburger) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar && window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else if (navbar) {
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
            selectLevel(language, level);
        });
    });
}

function selectLevel(language, level) {
    const userPreferences = {
        language: language,
        level: level,
        languageCode: getLanguageCode(language),
        selectedAt: new Date().toISOString()
    };
    
    localStorage.setItem('efg_user_preferences', JSON.stringify(userPreferences));
    showToast(`تم اختيار ${language} - المستوى ${level}`, 'success');
    updateSelectedLevelDisplay();
    displayLessons(language, level);
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

function updateSelectedLevelDisplay() {
    const preferences = getUserPreferences();
    if (!preferences) return;
    
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '';
        btn.style.color = '';
    });
    
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

function displayLessons(language, level) {
    const languageCode = getLanguageCode(language);
    const lessonsContainer = document.getElementById('lessons-container');
    
    if (!lessonsContainer) return;
    
    lessonsContainer.innerHTML = '';
    
    const lessons = window.efgData.lessons?.[languageCode]?.[level] || [];
    
    if (lessons.length === 0) {
        lessonsContainer.innerHTML = `
            <div class="no-lessons">
                <h3>🚧 الدروس قيد التجهيز</h3>
                <p>سيتم إضافة الدروس لهذا المستوى قريباً. ترقبوا التحديثات!</p>
            </div>
        `;
        return;
    }
    
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'lessons-section-title';
    sectionTitle.textContent = `دروس ${language} - المستوى ${level}`;
    lessonsContainer.appendChild(sectionTitle);
    
    const lessonsGrid = document.createElement('div');
    lessonsGrid.className = 'lessons-grid';
    
    lessons.forEach(lesson => {
        const lessonCard = document.createElement('div');
        lessonCard.className = 'lesson-card';
        lessonCard.innerHTML = `
            <div class="lesson-image">
                <img src="${lesson.image || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop'}" alt="${lesson.title}" loading="lazy">
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

function getLanguageCode(languageName) {
    const languageMap = {
        'اللغة الإنجليزية': 'english',
        'اللغة الألمانية': 'german', 
        'اللغة الفرنسية': 'french'
    };
    return languageMap[languageName] || 'english';
}

function loadContent() {
    loadLevels();
    loadNews(); 
    loadContactLinks();
    updateSelectedLevelDisplay();
    
    const preferences = getUserPreferences();
    if (preferences) {
        displayLessons(preferences.language, preferences.level);
    }
}

function getUserPreferences() {
    const preferences = localStorage.getItem('efg_user_preferences');
    return preferences ? JSON.parse(preferences) : null;
}

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

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
                    selectLevel(languageName, level);
                });
                container.appendChild(levelBtn);
            });
        }
    });
}

function loadNews() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;
    
    newsContainer.innerHTML = '';
    
    if (window.efgData && window.efgData.news && window.efgData.news.length > 0) {
        window.efgData.news.forEach(newsItem => {
            const newsCard = createNewsCard(newsItem);
            newsContainer.appendChild(newsCard);
        });
    } else {
        newsContainer.innerHTML = `
            <div class="no-news">
                <h3>📰 لا توجد أخبار حالياً</h3>
                <p>سيتم إضافة الأخبار والمسابقات قريباً</p>
            </div>
        `;
    }
}

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

function loadContactLinks() {
    const youtubeLink = document.getElementById('youtube-link');
    const telegramLink = document.getElementById('telegram-link');
    
    if (window.efgData && window.efgData.contact) {
        if (youtubeLink) youtubeLink.href = window.efgData.contact.youtube || '#';
        if (telegramLink) telegramLink.href = window.efgData.contact.telegram || '#';
    } else {
        if (youtubeLink) youtubeLink.href = 'https://youtube.com';
        if (telegramLink) telegramLink.href = 'https://t.me';
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
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
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function getLanguageName(langCode) {
    const languages = {
        'english': 'اللغة الإنجليزية',
        'german': 'اللغة الألمانية', 
        'french': 'اللغة الفرنسية'
    };
    return languages[langCode] || langCode;
}

function formatDate(dateString) {
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ar-EG', options);
    } catch (error) {
        return dateString;
    }
}

// جعل الدوال متاحة عالمياً
window.closeNotificationPopup = closeNotificationPopup;
window.showNotificationsPopup = showNotificationsPopup;
window.loadPopupNotifications = loadPopupNotifications;