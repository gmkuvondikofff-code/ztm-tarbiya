import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "uz" | "ru";

const dict = {
  uz: {
    home: "Bosh sahifa",
    news: "Yangiliklar",
    resources: "Resurslar",
    documents: "Hujjatlar",
    qa: "Savol-Javob",
    contact: "Aloqa",
    important: "Muhim",
    readMore: "To'liq o'qish",
    views: "ko'rildi",
    admin: "Admin",
    latestNews: "So'nggi yangiliklar",
    allNews: "Barcha yangiliklar",
    heroTitle: "Zamonaviy ta'lim va milliy tarbiya",
    heroSubtitle: "O'zbekiston yoshlarini zamonaviy bilim va milliy qadriyatlar asosida tarbiyalash markazi",
    aiHelper: "AI yordamchi",
    aiPlaceholder: "Zamonaviy ta'lim va milliy tarbiya bo'yicha savolingizni yozing...",
    send: "Yuborish",
    contactUs: "Biz bilan bog'laning",
    phone: "Telefon",
    telegram: "Telegram",
    download: "Yuklab olish",
    open: "Ochish",
    read: "O'qish",
    backToList: "Ro'yxatga qaytish",
    publishedAt: "Sana",
    author: "Muallif",
    noNews: "Yangiliklar topilmadi",
    loading: "Yuklanmoqda...",
    aiIntro: "Salom! Men zamonaviy ta'lim va milliy tarbiya bo'yicha savollarga javob beradigan yordamchiman.",
    footerAbout: "Biz haqimizda",
    footerDesc: "Zamonaviy ta'lim va milliy tarbiya orqali sog'lom va barkamol avlodni shakllantirishga xizmat qilamiz.",
    rights: "Barcha huquqlar himoyalangan",
    library: "Kutubxona",
    allCategories: "Barchasi",
    general: "Umumiy",
    video: "Video",
    quizzes: "Testlar",
    econtent: "E-kontent",
    audio: "Audio",
    videoContent: "Video kontent",
    audioContent: "Audio kontent",
    listen: "Eshitish",
    watch: "Ko'rish",
  },
  ru: {
    home: "Главная",
    news: "Новости",
    resources: "Ресурсы",
    documents: "Документы",
    qa: "Вопрос-Ответ",
    contact: "Контакты",
    important: "Важно",
    readMore: "Читать полностью",
    views: "просмотров",
    admin: "Админ",
    latestNews: "Последние новости",
    allNews: "Все новости",
    heroTitle: "Современное образование и национальное воспитание",
    heroSubtitle: "Центр современного образования и национально-нравственного воспитания молодёжи Узбекистана",
    aiHelper: "AI помощник",
    aiPlaceholder: "Задайте вопрос о современном образовании и национальном воспитании...",
    send: "Отправить",
    contactUs: "Свяжитесь с нами",
    phone: "Телефон",
    telegram: "Telegram",
    download: "Скачать",
    open: "Открыть",
    read: "Читать",
    backToList: "Вернуться к списку",
    publishedAt: "Дата",
    author: "Автор",
    noNews: "Новости не найдены",
    loading: "Загрузка...",
    aiIntro: "Здравствуйте! Я помощник по вопросам современного образования и национального воспитания.",
    footerAbout: "О нас",
    footerDesc: "Мы работаем для формирования здорового и всесторонне развитого поколения через современное образование и национальное воспитание.",
    rights: "Все права защищены",
    library: "Библиотека",
    allCategories: "Все",
    general: "Общее",
    video: "Видео",
    quizzes: "Тесты",
    econtent: "Э-контент",
    audio: "Аудио",
    videoContent: "Видео контент",
    audioContent: "Аудио контент",
    listen: "Слушать",
    watch: "Смотреть",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof dict.uz) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("uz");
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "uz" || saved === "ru") setLangState(saved);
  }, []);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("lang", l); };
  const t = (k: keyof typeof dict.uz) => dict[lang][k] || dict.uz[k];
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
}

export function pickLang<T extends Record<string, any>>(row: T, lang: Lang, base: string): string {
  const ru = row[`${base}_ru`];
  const uz = row[`${base}_uz`];
  if (lang === "ru" && ru) return ru;
  return uz || ru || "";
}
