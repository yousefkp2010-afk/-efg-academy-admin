// js/data.js

window.efgData = {
    // معلومات الأكاديمية
    academy: {
        name: "EFG Academy",
        description: "منصة تعليمية رائدة لتعليم اللغات الإنجليزية، الألمانية، والفرنسية بطريقة مبتكرة تفاعلية",
        founded: "2024",
        students: "2,500+",
        courses: "18+"
    },

    // الكورسات والمستويات
    courses: {
        english: {
            language: "اللغة الإنجليزية",
            icon: "🇬🇧",
            description: "احترف اللغة الإنجليزية من الصفر إلى الاحتراف مع منهج متكامل وشامل",
            levels: {
                "A1": {
                    title: "المستوى المبتدئ A1",
                    description: "ابدأ رحلتك في تعلم الإنجليزية من الصفر، تعلم الأساسيات والمحادثة اليومية",
                    youtubeLink: "https://www.youtube.com/playlist?list=PLxVC1H5vBcVl1uV6Y0",
                    telegramGroup: "https://t.me/EFG_English_A1",
                    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop",
                    status: "مكتمل"
                },
                "A2": {
                    title: "المستوى الأساسي A2",
                    description: "تحدث بطلاقة في المواقف اليومية، طور مهارات الاستماع والتحدث",
                    youtubeLink: "https://www.youtube.com/playlist?list=PLxVC1H5vBcVl2uV7Y1",
                    telegramGroup: "https://t.me/EFG_English_A2",
                    image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&h=300&fit=crop",
                    status: "جاري التجهيز"
                },
                "B1": {
                    title: "المستوى المتوسط B1",
                    description: "تعبير متقدم، كتابة الرسائل، وفهم النصوص المعقدة",
                    youtubeLink: "https://www.youtube.com/playlist?list=PLxVC1H5vBcVl3uV8Y2",
                    telegramGroup: "https://t.me/EFG_English_B1",
                    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop",
                    status: "قريباً"
                },
                "B2": {
                    title: "المستوى فوق المتوسط B2",
                    description: "محادثات متقدمة، تحليل النصوص، وإتقان القواعد المعقدة",
                    youtubeLink: "#",
                    telegramGroup: "#",
                    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop",
                    status: "قيد التطوير"
                },
                "C1": {
                    title: "المستوى المتقدم C1",
                    description: "إتقان اللغة بطلاقة، فهم اللهجات المختلفة، والكتابة الأكاديمية",
                    youtubeLink: "#",
                    telegramGroup: "#",
                    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
                    status: "قيد التطوير"
                },
                "C2": {
                    title: "المستوى الإحترافي C2",
                    description: "الإتقان الكامل، التعامل كلغة أم، والترجمة المتقدمة",
                    youtubeLink: "#",
                    telegramGroup: "#",
                    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
                    status: "قيد التطوير"
                }
            }
        },

        german: {
            language: "اللغة الألمانية", 
            icon: "🇩🇪",
            description: "تعلم الألمانية بمنهجية مدروسة واحترافية تفتح لك أبواب العلم والعمل",
            levels: {
                "A1.1": {
                    title: "المستوى المبتدئ A1.1",
                    description: "الكورس المجاني الشامل لتعلم الأساسيات الأولى للألمانية",
                    youtubeLink: "https://www.youtube.com/playlist?list=PLxVC1H5vBcVl4uV9Y3",
                    telegramGroup: "https://t.me/EFG_German_A1_1",
                    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop",
                    status: "مكتمل"
                },
                "A1.2": {
                    title: "المستوى المبتدئ A1.2",
                    description: "استكمال المستوى الأول مع تعلم الجمل اليومية والمحادثة",
                    youtubeLink: "https://www.youtube.com/playlist?list=PLxVC1H5vBcVl5uV0Y4",
                    telegramGroup: "https://t.me/EFG_German_A1_2", 
                    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
                    status: "مكتمل"
                },
                "A2": {
                    title: "المستوى الأساسي A2",
                    description: "تطوير المهارات اللغوية وفهم القواعد المتوسطة",
                    youtubeLink: "https://www.youtube.com/playlist?list=PLxVC1H5vBcVl6uV1Y5",
                    telegramGroup: "https://t.me/EFG_German_A2",
                    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
                    status: "جاري التجهيز"
                },
                "B1": {
                    title: "المستوى المتوسط B1",
                    description: "محادثات متقدمة وكتابة النصوص وفهم القواعد المعقدة",
                    youtubeLink: "#",
                    telegramGroup: "#",
                    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop",
                    status: "قريباً"
                },
                "B2": {
                    title: "المستوى فوق المتوسط B2", 
                    description: "الإعداد للامتحانات الرسمية والتحدث بطلاقة",
                    youtubeLink: "#",
                    telegramGroup: "#",
                    image: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=400&h=300&fit=crop",
                    status: "قيد التطوير"
                },
                "C1": {
                    title: "المستوى المتقدم C1",
                    description: "الإتقان المتقدم والتحضير للدراسة في ألمانيا",
                    youtubeLink: "#", 
                    telegramGroup: "#",
                    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop",
                    status: "قيد التطوير"
                }
            }
        },

        french: {
            language: "اللغة الفرنسية",
            icon: "🇫🇷", 
            description: "اتقن الفرنسية مع أفضل المناهج التعليمية وطريقة التدريس التفاعلية",
            levels: {
                "A1": {
                    title: "المستوى المبتدئ A1",
                    description: "بداية رحلتك في تعلم الفرنسية مع الأساسيات والتهجئة",
                    youtubeLink: "https://www.youtube.com/playlist?list=PLxVC1H5vBcVl7uV2Y6",
                    telegramGroup: "https://t.me/EFG_French_A1",
                    image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop",
                    status: "مكتمل"
                },
                "A2": {
                    title: "المستوى الأساسي A2",
                    description: "تطوير المحادثة اليومية وفهم القواعد الأساسية",
                    youtubeLink: "https://www.youtube.com/playlist?list=PLxVC1H5vBcVl8uV3Y7",
                    telegramGroup: "https://t.me/EFG_French_A2",
                    image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400&h=300&fit=crop",
                    status: "جاري التجهيز"
                },
                "B1": {
                    title: "المستوى المتوسط B1",
                    description: "محادثات متقدمة وكتابة الرسائل والتقارير البسيطة",
                    youtubeLink: "#",
                    telegramGroup: "#", 
                    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=300&fit=crop",
                    status: "قريباً"
                },
                "B2": {
                    title: "المستوى فوق المتوسط B2",
                    description: "التحدث بطلاقة وفهم البرامج التلفزيونية والأفلام",
                    youtubeLink: "#",
                    telegramGroup: "#",
                    image: "https://images.unsplash.com/photo-1506919258185-6078bba55d2a?w=400&h=300&fit=crop",
                    status: "قيد التطوير"
                },
                "C1": {
                    title: "المستوى المتقدم C1",
                    description: "الإتقان المتقدم والكتابة الأكاديمية والمهنية",
                    youtubeLink: "#",
                    telegramGroup: "#",
                    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&h=300&fit=crop",
                    status: "قيد التطوير"
                },
                "C2": {
                    title: "المستوى الإحترافي C2",
                    description: "الإتقان الكامل والتعامل كلغة أم مع الفرنسيين",
                    youtubeLink: "#",
                    telegramGroup: "#",
                    image: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=400&h=300&fit=crop",
                    status: "قيد التطوير"
                }
            }
        }
    },

    // الأخبار والمسابقات
    news: [
        {
            id: 1,
            date: "2024-01-20",
            title: "إطلاق كورس الألمانية A1.1 المجاني بالكامل",
            description: "تم إطلاق الكورس المجاني لتعلم اللغة الألمانية للمستوى A1.1 مع دروس يوتيوب ومجموعة تلجرام تفاعلية",
            image: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=250&fit=crop",
            type: "إطلاق",
            urgent: true
        },
        {
            id: 2,
            date: "2024-01-18", 
            title: "مسابقة نهاية الشابتر الأول للغة الإنجليزية",
            description: "انضم لمسابقة المراجعة واربح هدايا قيمة، المسابقة متاحة لمشتركي كورس A1 فقط",
            image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=250&fit=crop",
            type: "مسابقة",
            urgent: false
        },
        {
            id: 3,
            date: "2024-01-15",
            title: "بداية التسجيل في الدفعة الثالثة للألمانية",
            description: "ابتداءً من اليوم سيتم فتح التسجيل للدفعة الثالثة من كورس الألمانية A1.1",
            image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop", 
            type: "تسجيل",
            urgent: true
        },
        {
            id: 4,
            date: "2024-01-12",
            title: "حلقة خاصة عن المصطلحات الطبية بالألمانية",
            description: "حلقة بودكاست جديدة تتناول المصطلحات الطبية الخاصة بطلاب الطب الراغبين بالدراسة في ألمانيا",
            image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=250&fit=crop",
            type: "بودكاست", 
            urgent: false
        },
        {
            id: 5,
            date: "2024-01-10",
            title: "إطلاق قناة اليوتيوب الرسمية للأكاديمية",
            description: "تم إطلاق القناة الرسمية على اليوتيوب وسيتم نشر جميع الدروس والحلقات عليها",
            image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=250&fit=crop",
            type: "إعلان",
            urgent: false
        },
        {
            id: 6, 
            date: "2024-01-05",
            title: "بداية التحضير لكورس الفرنسية المتقدم",
            description: "بدأ فريق العمل في تحضير كورس الفرنسية للمستويات المتقدمة B2/C1",
            image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop",
            type: "تحديث",
            urgent: false
        }
    ],

    // المميزات
    features: [
        {
            icon: "🎥",
            title: "دروس فيديو عالية الجودة",
            description: "دروس مصورة بجودة عالية على يوتيوب مع شرح واضح ومبسط"
        },
        {
            icon: "💬", 
            title: "مجموعات تفاعلية يومية",
            description: "مجموعات تلجرام للدعم والتفاعل اليومي مع المدرسين والزملاء"
        },
        {
            icon: "📚",
            title: "مناهج متكاملة",
            description: "مناهج شاملة تغطي جميع المستويات من المبتدئ إلى المتقدم"
        },
        {
            icon: "🆓",
            title: "مجانية 100%", 
            description: "دروس مجانية بالكامل للجميع بدون أي رسوم خفية"
        },
        {
            icon: "👨‍🏫",
            title: "مدرسين محترفين",
            description: "فريق تدريس متخصص بخبرة طويلة في تعليم اللغات"
        },
        {
            icon: "🔄",
            title: "تحديث مستمر",
            description: "تحديث المحتوى بشكل مستمر وإضافة دروس جديدة أسبوعياً"
        }
    ],

    // وسائل التواصل
    contact: {
        youtube: "https://www.youtube.com/@EFGAcademy",
        telegram: "https://t.me/EFGAcademy",
        email: "contact@efg-academy.com",
        social: {
            facebook: "https://facebook.com/EFGAcademy",
            twitter: "https://twitter.com/EFGAcademy",
            instagram: "https://instagram.com/EFGAcademy"
        }
    },

    // الإحصائيات
    stats: {
        totalStudents: 2500,
        activeStudents: 1800,
        coursesCompleted: 12,
        youtubeSubscribers: 15000,
        telegramMembers: 3200,
        satisfactionRate: 98
    },

    // فريق العمل (معلومات افتراضية)
    team: [
        {
            name: "د. أحمد محمد",
            role: "مؤسس ومنسق عام",
            bio: "خبير في تعليم اللغات مع أكثر من 10 سنوات خبرة",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
        },
        {
            name: "أ. سارة الخالد",
            role: "مديرة قسم الإنجليزية", 
            bio: "متخصصة في اللغة الإنجليزية والأدب الإنجليزي",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face"
        },
        {
            name: "أ. محمد الشامي",
            role: "مدير قسم الألمانية",
            bio: "خريج جامعات ألمانية ومترجم معتمد",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
        },
        {
            name: "أ. لينا فارس",
            role: "مديرة قسم الفرنسية",
            bio: "حاصلة على شهادة DELF ومتخصصة في اللغة الفرنسية",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face"
        }
    ],
    lessons: {
        english: {
            A1: [
                {
                    id: 1,
                    title: "المقدمة والتعارف",
                    description: "تعلم أساسيات التعريف بالنفس والتحيات اليومية بالإنجليزية",
                    youtubeLink: "https://www.youtube.com/watch?v=english_a1_1",
                    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop",
                    duration: "15:30",
                    order: 1
                },
                {
                    id: 2,
                    title: "الأرقام والألوان",
                    description: "تعلم العد من 1 إلى 100 والألوان الأساسية بالإنجليزية",
                    youtubeLink: "https://www.youtube.com/watch?v=english_a1_2",
                    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=250&fit=crop",
                    duration: "18:45",
                    order: 2
                },
                {
                    id: 3,
                    title: "أفراد العائلة",
                    description: "تعلم أسماء أفراد العائلة والعلاقات الأسرية",
                    youtubeLink: "https://www.youtube.com/watch?v=english_a1_3",
                    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=250&fit=crop",
                    duration: "22:10",
                    order: 3
                }
            ],
            A2: [
                {
                    id: 4,
                    title: "الضمائر وأفعال الكون",
                    description: "الضمائر الشخصية وأفعال be, have, do في المضارع",
                    youtubeLink: "https://www.youtube.com/watch?v=english_a2_1",
                    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop",
                    duration: "25:20",
                    order: 1
                }
            ],
            
        },
        german: {
            A1: [
                {
                    id: 1,
                    title: "Das Alphabet - الأبجدية الألمانية",
                    description: "تعلم نطق الحروف الألمانية والفرق بين الأحرف الخاصة",
                    youtubeLink: "https://www.youtube.com/watch?v=german_a1_1",
                    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=250&fit=crop",
                    duration: "20:15",
                    order: 1
                },
                {
                    id: 2,
                    title: "التعريف والتحية",
                    description: "كيفية التحية والتعريف بالنفس بالألمانية في المواقف المختلفة",
                    youtubeLink: "https://www.youtube.com/watch?v=german_a1_2",
                    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
                    duration: "17:30",
                    order: 2
                },
                {
                    id: 3,
                    title: "الأرقام من 1 إلى 100",
                    description: "تعلم العد بالألمانية مع القواعد الخاصة بالأرقام المركبة",
                    youtubeLink: "https://www.youtube.com/watch?v=german_a1_3",
                    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=250&fit=crop",
                    duration: "19:45",
                    order: 3
                }
            ],
            A2: [
                {
                    id: 4,
                    title: "أدوات التعريف Der, Die, Das",
                    description: "فهم نظام الجنس في اللغة الألمانية وأدوات التعريف",
                    youtubeLink: "https://www.youtube.com/watch?v=german_a1_4",
                    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=250&fit=crop",
                    duration: "28:10",
                    order: 1
                }
            ]
        },
        french: {
            A1: [
                {
                    id: 1,
                    title: "L'alphabet français - الأبجدية الفرنسية",
                    description: "تعلم نطق الحروف الفرنسية والأصوات الخاصة",
                    youtubeLink: "https://www.youtube.com/watch?v=french_a1_1",
                    image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=250&fit=crop",
                    duration: "16:20",
                    order: 1
                },
                {
                    id: 2,
                    title: "Les salutations - التحيات",
                    description: "التحيات اليومية والتعارف باللغة الفرنسية",
                    youtubeLink: "https://www.youtube.com/watch?v=french_a1_2",
                    image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400&h=250&fit=crop",
                    duration: "14:35",
                    order: 2
                }
            ],
            C2: [
                    {
                    id: 3,
                    title: "L'alphabet français - الأبجدية الفرنسية",
                    description: "تعلم نطق الحروف الفرنسية والأصوات الخاصة",
                    youtubeLink: "https://www.youtube.com/watch?v=french_a1_1",
                    image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=250&fit=crop",
                    duration: "16:20",
                    order: 1
                },
 
            ]
        }
    }
    
};

console.log("✅ تم تحميل بيانات EFG Academy بنجاح!");
console.log(`🏫 ${window.efgData.academy.name}`);
console.log(`📚 ${Object.keys(window.efgData.courses).length} لغات متاحة`);
console.log(`📰 ${window.efgData.news.length} خبر متاح`);