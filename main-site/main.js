// js/main.js - الملف المحدث مع إصلاح الإشعارات

// متغير لتتبع الإشعارات المعروضة
let displayedNotifications = new Set();

// تهيئة التطبيق عند تحميل الصفحة
async function loadData() {
    try {
        const response = await fetch('/api/data');
        window.efgData = await response.json();
        console.log('✅ تم تحميل البيانات:', window.efgData);
    } catch (error) {
        console.error('❌ فشل في تحميل البيانات:', error);
        window.efgData = { news: [], courses: {}, lessons: {}, notifications: [] };
    }
}

// تحميل الإشعارات المعروضة مسبقاً من localStorage
function loadDisplayedNotifications() {
    try {
        const saved = localStorage.getItem('efg_displayed_notifications');
        if (saved) {
            displayedNotifications = new Set(JSON.parse(saved));
        }
        console.log('📋 الإشعارات المعروضة مسبقاً:', Array.from(displayedNotifications));
    } catch (error) {
        console.error('❌ خطأ في تحميل الإشعارات المعروضة:', error);
        displayedNotifications = new Set();
    }
}

// حفظ الإشعارات المعروضة في localStorage
function saveDisplayedNotifications() {
    try {
        const toSave = Array.from(displayedNotifications);
        localStorage.setItem('efg_displayed_notifications', JSON.stringify(toSave));
    } catch (error) {
        console.error('❌ خطأ في حفظ الإشعارات المعروضة:', error);
    }
}

// التحقق مما إذا كان الإشعار معروضاً مسبقاً
function isNotificationDisplayed(notificationId) {
    return displayedNotifications.has(notificationId.toString());
}

// وضع علامة على الإشعار كمعروض
function markNotificationAsDisplayed(notificationId) {
    displayedNotifications.add(notificationId.toString());
    saveDisplayedNotifications();
}

// تحميل الإشعارات من السيرفر
async function loadNotificationsFromServer() {
    try {
        console.log('🔄 جاري تحميل الإشعارات من السيرفر...');
        const response = await fetch('/api/notifications');
        
        if (!response.ok) {
            throw new Error(`خطأ في السيرفر: ${response.status}`);
        }
        
        const serverNotifications = await response.json();
        console.log('📨 الإشعارات المستلمة:', serverNotifications);
        
        if (serverNotifications && serverNotifications.length > 0) {
            // تصفية الإشعارات الجديدة فقط
            const newNotifications = serverNotifications.filter(notification => 
                !isNotificationDisplayed(notification.id)
            );
            
            console.log('🆕 الإشعارات الجديدة:', newNotifications.length);
            
            // عرض الإشعارات الجديدة فقط
            newNotifications.forEach(notification => {
                if (window.notificationSystem) {
                    showServerNotification(notification);
                }
            });
            
            // تحديث العداد
            updateNotificationBadge(serverNotifications.filter(n => !n.read).length);
        } else {
            console.log('ℹ️ لا توجد إشعارات في السيرفر');
            updateNotificationBadge(0);
        }
    } catch (error) {
        console.error('❌ فشل في تحميل الإشعارات من السيرفر:', error);
        updateNotificationBadge(0);
    }
}

// عرض إشعار من السيرفر
function showServerNotification(serverNotification) {
    if (!window.notificationSystem) {
        console.log('⚠️ نظام الإشعارات غير جاهز بعد');
        return;
    }
    
    console.log('➕ عرض إشعار جديد:', serverNotification.title);
    
    // إذا كان الإشعار مهماً ويجب عرضه كمنبثق
    if (serverNotification.important && serverNotification.showPopup) {
        showNotificationPopup(serverNotification);
    }
    
    // إضافة الإشعار للنظام المحلي
    window.notificationSystem.addSimpleNotification(
        serverNotification.title,
        serverNotification.message,
        {
            type: serverNotification.type || 'info',
            icon: getNotificationIcon(serverNotification.type),
            link: serverNotification.link || '#',
            persistent: false
        }
    );
    
    // وضع علامة على الإشعار كمعروض
    markNotificationAsDisplayed(serverNotification.id);
}

// عرض نافذة منبثقة للإشعار المهم
function showNotificationPopup(notification) {
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
                <h4 style="margin: 0; color: var(--primary-blue);">${notification.title}</h4>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">✕</button>
        </div>
        <p style="margin: 0; color: #666; line-height: 1.5;">${notification.message}</p>
        <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
            <small style="color: #999;">${new Date(notification.timestamp).toLocaleString('ar-EG')}</small>
            ${notification.link && notification.link !== '#' ? 
                `<a href="${notification.link}" style="color: var(--gold); text-decoration: none;">المزيد →</a>` : ''
            }
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // إزالة النافذة تلقائياً بعد 8 ثواني
    setTimeout(() => {
        if (popup.parentNode) {
            popup.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            }, 300);
        }
    }, 8000);
}

// الحصول على لون الإشعار حسب النوع
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

// الحصول على أيقونة بناءً على النوع
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

// بدء التطبيق بعد تحميل البيانات
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 بدء تحميل التطبيق...');
    await loadData();
    await initializeApp();
});

async function initializeApp() {
    console.log('⚙️ تهيئة التطبيق...');
    
    // تحميل الإشعارات المعروضة مسبقاً
    loadDisplayedNotifications();
    
    initNavigation();
    initLevelSystem();
    loadContent();
    initNotifications();
    initSmoothScroll();
    
    // تحميل الإشعارات من السيرفر بعد تهيئة النظام
    setTimeout(async () => {
        await loadNotificationsFromServer();
    }, 1500);
}

// باقي الدوال تبقى كما هي (بدون تغيير)
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

async function initNotifications() {
    console.log('🔔 تهيئة نظام الإشعارات...');
    
    if (typeof notificationSystem === 'undefined') {
        console.log('⏳ انتظار تحميل نظام الإشعارات...');
        setTimeout(initNotifications, 500);
        return;
    }
    
    createNotificationsButton();
    console.log('✅ تم تهيئة نظام الإشعارات');
}

async function loadPopupNotifications() {
    try {
        console.log('📋 جاري تحميل الإشعارات للعرض...');
        const response = await fetch('/api/notifications');
        
        if (!response.ok) {
            throw new Error(`خطأ في السيرفر: ${response.status}`);
        }
        
        const notifications = await response.json();
        console.log('📨 الإشعارات المعروضة:', notifications);
        
        const content = document.getElementById('notifications-popup-content');
        if (!content) return;
        
        if (notifications.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🔔</div>
                    <p>لا توجد إشعارات جديدة</p>
                </div>
            `;
        } else {
            content.innerHTML = notifications.map(notification => `
                <div class="notification-item" style="padding: 15px; border-bottom: 1px solid #eee; display: flex; gap: 10px;">
                    <div style="font-size: 20px;">${getNotificationIcon(notification.type)}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; margin-bottom: 5px; color: var(--primary-blue);">
                            ${notification.title}
                            ${notification.important ? ' <span style="color: red; font-size: 12px;">⭐ مهم</span>' : ''}
                        </div>
                        <div style="color: #666; margin-bottom: 5px;">${notification.message}</div>
                        <div style="font-size: 12px; color: #999;">
                            ${new Date(notification.timestamp).toLocaleString('ar-EG')}
                            ${notification.read ? ' | ✅ مقروء' : ' | 👁️ غير مقروء'}
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('❌ فشل في تحميل الإشعارات للعرض:', error);
        const content = document.getElementById('notifications-popup-content');
        if (content) {
            content.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #ef4444;">
                    فشل في تحميل الإشعارات: ${error.message}
                </div>
            `;
        }
    }
}

function updateNotificationBadge(count) {
    let badge = document.getElementById('notification-badge');
    
    if (!badge) {
        const notificationsToggle = document.getElementById('notifications-toggle');
        if (notificationsToggle) {
            badge = document.createElement('span');
            badge.id = 'notification-badge';
            badge.className = 'notification-badge';
            notificationsToggle.appendChild(badge);
        }
    }
    
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
            console.log(`🔴 تحديث العداد: ${count} إشعارات غير مقروءة`);
        } else {
            badge.style.display = 'none';
            console.log('⚪ لا توجد إشعارات غير مقروءة');
        }
    }
}

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
    
    console.log('✅ تم إنشاء زر الإشعارات');
}

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
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    popup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: var(--primary-blue);">الإشعارات</h3>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
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

// إضافة أنيميشن للعناصر
window.addEventListener('load', function() {
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
    
    const animatedElements = document.querySelectorAll('.language-card, .feature-card, .news-card, .contact-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// جعل الدوال متاحة عالمياً
window.loadPopupNotifications = loadPopupNotifications;
window.showNotificationsPopup = showNotificationsPopup;