import { useEffect, useState } from "react";
import { ArrowUp, Send } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

import { siteConfig } from "@/config/site";

// Tugma sozlangan klinika Telegram kanaliga olib boradi (shaxsiy akkaunt emas).
const TELEGRAM = siteConfig.telegramChannelUrl;

export const FloatingButtons = () => {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a
        href={TELEGRAM}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.floating.telegram}
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 6rem)" }}
        className="fixed right-4 md:right-7 md:!bottom-7 z-40 grid place-items-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#229ED9] text-white shadow-elevated hover:scale-110 transition-transform"
      >
        <Send className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
        <span className="absolute inline-flex w-full h-full rounded-full bg-[#229ED9] opacity-50 animate-ping" />
      </a>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t.floating.top}
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 10.5rem)" }}
        className={`fixed right-4 md:right-7 md:!bottom-7 md:!right-[6rem] z-40 grid place-items-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-card border border-border text-foreground shadow-card hover:gradient-primary hover:text-primary-foreground transition-all ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </>
  );
};
