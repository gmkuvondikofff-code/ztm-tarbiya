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
    heroTitle: "Milliy tarbiya — kelajak poydevori",
    heroSubtitle: "O'zbekiston yoshlarini ma'naviy va axloqiy tarbiyalash markazi",
    aiHelper: "AI yordamchi",
    aiPlaceholder: "Milliy tarbiya bo'yicha savolingizni yozing...",
    send: "Yuborish",
    contactUs: "Biz bilan bog'laning",
    phone: "Telefon",
    telegram: "Telegram",
    download: "Yuklab olish",
    open: "Ochish",
    backToList: "Ro'yxatga qaytish",
    publishedAt: "Sana",
    author: "Muallif",
    noNews: "Yangiliklar topilmadi",
    loading: "Yuklanmoqda...",
    aiIntro: "Salom! Men milliy tarbiya bo'yicha savollarga javob beradigan yordamchiman. Faqat shu mavzu doirasidagi savollarga javob beraman.",
    footerAbout: "Biz haqimizda",
    footerDesc: "Milliy tarbiya orqali sog'lom va barkamol avlodni shakllantirish maqsadida ishlaymiz.",
    rights: "Barcha huquqlar himoyalangan",
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
    heroTitle: "Национальное воспитание — фундамент будущего",
    heroSubtitle: "Центр духовно-нравственного воспитания молодёжи Узбекистана",
    aiHelper: "AI помощник",
    aiPlaceholder: "Задайте вопрос о национальном воспитании...",
    send: "Отправить",
    contactUs: "Свяжитесь с нами",
    phone: "Телефон",
    telegram: "Telegram",
    download: "Скачать",
    open: "Открыть",
    backToList: "Вернуться к списку",
    publishedAt: "Дата",
    author: "Автор",
    noNews: "Новости не найдены",
    loading: "Загрузка...",
    aiIntro: "Здравствуйте! Я помощник, отвечающий на вопросы о национальном воспитании. Я отвечаю только на вопросы по этой теме.",
    footerAbout: "О нас",
    footerDesc: "Мы работаем для формирования здорового и всесторонне развитого поколения через национальное воспитание.",
    rights: "Все права защищены",
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
