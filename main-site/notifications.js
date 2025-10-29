// js/notifications.js

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.displayedNotifications = new Set();
        this.permission = this.getStoredPermission();
        this.init();
    }

    // تهيئة النظام
    init() {
        this.loadNotifications();
        this.loadDisplayedNotifications();
        this.requestPermission();
        this.setupAutoNotifications();
        this.createNotificationsContainer();
    }

    // تحميل الإشعارات المعروضة مسبقاً
    loadDisplayedNotifications() {
        const saved = localStorage.getItem('efg_displayed_notifications');
        if (saved) {
            this.displayedNotifications = new Set(JSON.parse(saved));
        }
    }

    // حفظ الإشعارات المعروضة
    saveDisplayedNotifications() {
        const toSave = Array.from(this.displayedNotifications);
        localStorage.setItem('efg_displayed_notifications', JSON.stringify(toSave));
    }

    // التحقق مما إذا كان الإشعار معروضاً مسبقاً
    hasNotificationBeenDisplayed(notificationId) {
        return this.displayedNotifications.has(notificationId);
    }

    // وضع إشعار كمعروض
    markNotificationAsDisplayed(notificationId) {
        this.displayedNotifications.add(notificationId);
        this.saveDisplayedNotifications();
    }

    // دالة مبسطة لإضافة الإشعارات
    addSimpleNotification(title, message, options = {}) {
        const notificationId = this.generateNotificationId(title, message);
        
        // التحقق من عدم عرض هذا الإشعار مسبقاً
        if (this.hasNotificationBeenDisplayed(notificationId)) {
            console.log('الإشعار معروض مسبقاً:', title);
            return null;
        }

        const notification = {
            title,
            message,
            type: options.type || 'info',
            icon: options.icon || '🔔',
            link: options.link || '#',
            persistent: options.persistent || false
        };

        const id = this.addNotification(notification);
        
        // إذا لم يكن persistent، نضعه كمعروض
        if (!notification.persistent) {
            this.markNotificationAsDisplayed(notificationId);
        }
        
        return id;
    }

    // إنشاء معرف فريد للإشعار (بدون استخدام btoa)
    generateNotificationId(title, message) {
        // استخدام timestamp + hash بسيط
        const timestamp = Date.now().toString(36);
        const simpleHash = this.simpleStringHash(title + message);
        return `notif_${timestamp}_${simpleHash}`;
    }

    // دالة هاش بسيطة للنصوص العربية
    simpleStringHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    // إضافة إشعار جديد (النسخة الأصلية)
    addNotification(notification) {
        const newNotification = {
            id: Date.now() + Math.random(),
            title: notification.title,
            message: notification.message,
            type: notification.type || 'info',
            icon: notification.icon || '🔔',
            link: notification.link || '#',
            read: false,
            timestamp: new Date().toISOString(),
            expiresAt: notification.expiresAt || this.getDefaultExpiry(),
            persistent: notification.persistent || false
        };

        this.notifications.unshift(newNotification);
        this.saveNotifications();
        
        // التحقق من عدم عرض هذا الإشعار مسبقاً
        const notificationId = this.generateNotificationId(notification.title, notification.message);
        if (!this.hasNotificationBeenDisplayed(notificationId)) {
            this.showNotification(newNotification);
            if (!newNotification.persistent) {
                this.markNotificationAsDisplayed(notificationId);
            }
        }
        
        return newNotification.id;
    }

    // عرض الإشعار
    showNotification(notification) {
        // إشعار المتصفح
        if (this.canShowNotifications() && !document.hasFocus()) {
            this.showBrowserNotification(notification);
        }

        // الإشعار الداخلي في الموقع
        this.showInAppNotification(notification);

        // تحديث العداد
        this.updateBadge();
    }

    // إشعار المتصفح
    showBrowserNotification(notification) {
        const options = {
            body: notification.message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'efg-academy',
            requireInteraction: false
        };

        const browserNotification = new Notification(notification.title, options);

        browserNotification.onclick = () => {
            window.focus();
            if (notification.link && notification.link !== '#') {
                window.location.href = notification.link;
            }
            browserNotification.close();
        };

        setTimeout(() => {
            browserNotification.close();
        }, 5000);
    }

    // إشعار داخل التطبيق
    showInAppNotification(notification) {
        const notificationElement = this.createNotificationElement(notification);
        const container = document.getElementById('notifications-container');
        
        if (container) {
            container.appendChild(notificationElement);
            
            setTimeout(() => {
                notificationElement.classList.add('show');
            }, 100);

            // إخفاء تلقائي بعد 5 ثواني
            if (notification.type !== 'important') {
                setTimeout(() => {
                    this.removeNotificationElement(notificationElement);
                }, 5000);
            }
        }
    }

    // إنشاء عنصر الإشعار
    createNotificationElement(notification) {
        const div = document.createElement('div');
        div.className = `notification-item notification-${notification.type}`;
        div.setAttribute('data-id', notification.id);
        
        div.innerHTML = `
            <div class="notification-icon">${notification.icon}</div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
            </div>
            <button class="notification-close" onclick="notificationSystem.closeNotification(${notification.id})">
                &times;
            </button>
        `;

        div.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notification-close')) {
                this.markAsRead(notification.id);
                if (notification.link && notification.link !== '#') {
                    window.location.href = notification.link;
                }
            }
        });

        return div;
    }

    // إغلاق إشعار
    closeNotification(id) {
        this.removeNotificationElement(document.querySelector(`[data-id="${id}"]`));
        this.markAsRead(id);
    }

    // إزالة عنصر الإشعار
    removeNotificationElement(element) {
        if (element) {
            element.classList.remove('show');
            element.classList.add('hide');
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }
    }

    // تعيين كمقروء
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.updateBadge();
        }
    }

    // تعيين الكل كمقروء
    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.saveNotifications();
        this.updateBadge();
        
        if (typeof loadNotificationsPanel === 'function') {
            loadNotificationsPanel();
        }
    }

    // تحديث عداد الإشعارات
    updateBadge() {
        const unreadCount = this.getUnreadCount();
        const badge = document.getElementById('notification-badge');
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        // تحديث title标签
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) ${this.getOriginalTitle()}`;
        } else {
            document.title = this.getOriginalTitle();
        }
    }

    // الحصول على عدد الإشعارات غير المقروءة
    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    // حفظ الإشعارات في localStorage
    saveNotifications() {
        const toSave = this.notifications.slice(0, 50);
        localStorage.setItem('efg_notifications', JSON.stringify(toSave));
    }

    // تحميل الإشعارات من localStorage
    loadNotifications() {
        const saved = localStorage.getItem('efg_notifications');
        if (saved) {
            this.notifications = JSON.parse(saved);
            this.cleanExpiredNotifications();
            this.updateBadge();
        }
    }

    // تنظيف الإشعارات المنتهية
    cleanExpiredNotifications() {
        const now = new Date();
        this.notifications = this.notifications.filter(notification => {
            return new Date(notification.expiresAt) > now;
        });
    }

    // الحصول على تاريخ انتهاء افتراضي
    getDefaultExpiry() {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);
        return expiry.toISOString();
    }

    // الحصول على الإذن المحفوظ
    getStoredPermission() {
        return localStorage.getItem('efg_notification_permission') || 'default';
    }

    // حفظ حالة الإذن
    setStoredPermission(permission) {
        this.permission = permission;
        localStorage.setItem('efg_notification_permission', permission);
    }

    // طلب إذن الإشعارات
    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('المتصفح لا يدعم الإشعارات');
            return;
        }

        if (this.permission !== 'default') {
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            this.setStoredPermission(permission);
            
            if (permission === 'denied') {
                this.showPermissionHelp();
            }
        } catch (error) {
            console.error('خطأ في طلب الإذن:', error);
        }
    }

    // التحقق من إمكانية عرض الإشعارات
    canShowNotifications() {
        return this.permission === 'granted';
    }

    // إنشاء حاوية الإشعارات
    createNotificationsContainer() {
        if (!document.getElementById('notifications-container')) {
            const container = document.createElement('div');
            container.id = 'notifications-container';
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
    }

    // تنسيق الوقت
    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `قبل ${minutes} دقيقة`;
        if (hours < 24) return `قبل ${hours} ساعة`;
        if (days < 7) return `قبل ${days} يوم`;
        
        return time.toLocaleDateString('ar-EG');
    }

    // الحصول على العنوان الأصلي
    getOriginalTitle() {
        return document.title.replace(/^\(\d+\)\s*/, '');
    }

    // الإشعارات التلقائية
    setupAutoNotifications() {
        // إشعار ترحيب
        setTimeout(() => {
            if (!this.hasSeenWelcome()) {
                this.addSimpleNotification(
                    'مرحباً بك في EFG Academy! 🎓',
                    'ابدأ رحلتك في تعلم اللغات مع أفضل المناهج التعليمية',
                    {
                        icon: '👋',
                        link: '#languages'
                    }
                );
                this.setWelcomeSeen();
            }
        }, 5000);
    }

    // التحقق من رؤية الترحيب
    hasSeenWelcome() {
        return localStorage.getItem('efg_welcome_seen') === 'true';
    }

    // تعيين رؤية الترحيب
    setWelcomeSeen() {
        localStorage.setItem('efg_welcome_seen', 'true');
    }

    // مساعدة الإذن
    showPermissionHelp() {
        setTimeout(() => {
            this.addSimpleNotification(
                'إعدادات الإشعارات 🔔',
                'يمكنك تعديل إعدادات الإشعارات في أي وقت من إعدادات المتصفح',
                {
                    icon: '⚙️'
                }
            );
        }, 3000);
    }

    // إعادة تعيين الإذن
    resetPermission() {
        this.setStoredPermission('default');
        localStorage.removeItem('efg_notification_permission');
        
        this.addSimpleNotification(
            'تم إعادة تعيين الإعدادات',
            'سيتم طلب إذن الإشعارات مرة أخرى عند الحاجة',
            {
                icon: '🔄'
            }
        );
    }

    // طرق مساعدة للاستخدام العام
    getAllNotifications() {
        return this.notifications;
    }

    getUnreadNotifications() {
        return this.notifications.filter(n => !n.read);
    }

    deleteNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications();
        this.updateBadge();
    }

    clearAllNotifications() {
        this.notifications = [];
        this.saveNotifications();
        this.updateBadge();
    }

    isSupported() {
        return 'Notification' in window;
    }

    getPermissionStatus() {
        return this.permission;
    }
}

// إنشاء نسخة عامة من النظام
window.notificationSystem = new NotificationSystem();

// ⭐⭐ الدوال المبسطة للاستخدام السهل ⭐⭐

// دالة رئيسية مبسطة لإضافة الإشعارات
window.showNotification = function(title, message, options = {}) {
    return window.notificationSystem.addSimpleNotification(title, message, options);
};

// دوال مساعدة سريعة لأنواع مختلفة من الإشعارات
window.showSuccessNotification = function(title, message, link = '#') {
    return window.notificationSystem.addSimpleNotification(title, message, {
        type: 'success',
        icon: '✅',
        link: link
    });
};

window.showErrorNotification = function(title, message, link = '#') {
    return window.notificationSystem.addSimpleNotification(title, message, {
        type: 'error',
        icon: '❌',
        link: link
    });
};

window.showWarningNotification = function(title, message, link = '#') {
    return window.notificationSystem.addSimpleNotification(title, message, {
        type: 'warning',
        icon: '⚠️',
        link: link
    });
};

window.showInfoNotification = function(title, message, link = '#') {
    return window.notificationSystem.addSimpleNotification(title, message, {
        type: 'info',
        icon: 'ℹ️',
        link: link
    });
};

// دالة للإشعارات التي تظهر في كل جلسة (مهمة)
window.showPersistentNotification = function(title, message, options = {}) {
    return window.notificationSystem.addSimpleNotification(title, message, {
        ...options,
        persistent: true
    });
};

// دوال للمسابقات والإعلانات
window.showContestNotification = function(title, message, link = '#') {
    return window.notificationSystem.addSimpleNotification(title, message, {
        type: 'contest',
        icon: '🏆',
        link: link
    });
};

window.showNewCourseNotification = function(courseName, level, link = '#') {
    return window.notificationSystem.addSimpleNotification(
        `كورس جديد! 🎉`,
        `تم إطلاق ${courseName} - المستوى ${level}`,
        {
            type: 'success',
            icon: '📚',
            link: link
        }
    );
};

// دوال للإذن
window.resetNotificationPermission = function() {
    return window.notificationSystem.resetPermission();
};

window.getNotificationPermission = function() {
    return window.notificationSystem.getPermissionStatus();
};

// أمثلة على الاستخدام:
console.log("✅ نظام الإشعارات المحدث جاهز!");
console.log("🎯 استخدم الدوال المبسطة:");
console.log("   showNotification('عنوان', 'رسالة')");
console.log("   showSuccessNotification('نجاح', 'تم العملية بنجاح')");
console.log("   showErrorNotification('خطأ', 'حدث خطأ ما')");
console.log("   showContestNotification('مسابقة', 'انضم للمسابقة الآن')");


// if (localStorage.getItem('not1') === null){
//     localStorage.setItem('not1', false)
// }

// if (localStorage.getItem('not1') === "false"){
//     // مع خيارات إضافية
// showNotification('مسابقة', 'القوا نظرة على قناتنا في تلغرام لرؤية المسابقة', {
//     type: 'contest', // success, error, warning, info, contest
//     icon: '🎯',      // أي إيموجي
//     link: '', // رابط عند النقر
//     persistent: false // إذا كان true يظهر في كل جلسة
// });
// localStorage.setItem('not1', true)
// }

// // لاضافة اشعار ثاني : =>
// if (localStorage.getItem('not2') === null){
//     localStorage.setItem('not2', false)
// }

// if (localStorage.getItem('not2') === "false"){
//     // مع خيارات إضافية
// showNotification('مسابقة', 'القوا نظرة على قناتنا في تلغرام لرؤية المسابقة', {
//     type: 'contest', // success, error, warning, info, contest
//     icon: '🎯',      // أي إيموجي
//     link: '#courses', // رابط عند النقر
//     persistent: false // إذا كان true يظهر في كل جلسة
// });
// localStorage.setItem('not2', true)
// }


