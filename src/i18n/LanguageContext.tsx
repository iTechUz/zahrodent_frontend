import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations, Lang, TranslationDict } from "./translations";
import { applySeo } from "@/lib/seo";
import { siteConfig } from "@/config/site";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TranslationDict;
};

const LanguageContext = createContext<Ctx | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "uz";
    const saved = localStorage.getItem("lang") as Lang | null;
    return saved === "ru" || saved === "uz" || saved === "en" ? saved : "uz";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
    applySeo(document, siteConfig, lang, translations[lang]);
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
};
