import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import type { Lang } from "@/i18n/translations";
import { siteConfig } from "@/config/site";

const langCodes: Lang[] = ["uz", "ru", "en"];
const langLabels: Record<Lang, string> = { uz: "O‘Z", ru: "RU", en: "EN" };

export const Navbar = () => {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);

  const links = [
    { href: "#services", label: t.nav.services },
    { href: "#doctors", label: t.nav.doctors },
    { href: "#pricing", label: t.nav.pricing },
    { href: "#gallery", label: t.nav.gallery },
    { href: "#contact", label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    requestAnimationFrame(() => {
      const el = href === "#" ? document.body : document.querySelector(href);
      if (el) {
        (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
        if (href !== "#") history.replaceState(null, "", href);
      }
    });
  };

  const Logo = () => (
    <a href="#" onClick={(e) => handleNav(e, "#")} className="flex items-center gap-2.5 group">
      <span className="grid place-items-center w-10 h-10 rounded-xl gradient-primary text-primary-foreground shadow-soft">
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c-2.5 0-4 1-5.5 1S3 3 3 6c0 4 1.5 6 2.5 9.5C6.2 18 7 21 9 21c1.5 0 1.8-3 3-3s1.5 3 3 3c2 0 2.8-3 3.5-5.5C19.5 12 21 10 21 6c0-3-2-2-3.5-2S14.5 3 12 3z"/>
        </svg>
      </span>
      <span className="font-display text-xl sm:text-2xl font-semibold tracking-normal leading-none uppercase">
        Zahro<span className="text-gold">Dental</span>
      </span>
    </a>
  );

  const LangSwitch = ({ className = "" }: { className?: string }) => (
    <div className={`inline-flex items-center p-1 rounded-full bg-accent/70 border border-border ${className}`}>
      {langCodes.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2.5 py-1.5 text-[11px] font-bold tracking-wider rounded-full transition-all ${
            lang === l
              ? "gradient-primary text-primary-foreground shadow-soft"
              : "text-foreground/60 hover:text-foreground"
          }`}
        >
          {langLabels[l]}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "glass shadow-card border-b border-border/60" : "bg-transparent"
        }`}
      >
        <nav className={`container flex items-center justify-between transition-all ${scrolled ? "h-14 md:h-16" : "h-16 md:h-20"}`}>
          <Logo />

          <ul className="hidden lg:flex items-center gap-8 xl:gap-10 text-sm font-medium text-foreground/75">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={(e) => handleNav(e, l.href)}
                  className="relative hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-3">
            {siteConfig.phone && (
              <a
                href={`tel:${siteConfig.phone.e164}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                {siteConfig.phone.display}
              </a>
            )}
            <LangSwitch />
            <Button asChild size="sm" className="px-5">
              <a href="#contact" onClick={(e) => handleNav(e, "#contact")}>{t.nav.cta}</a>
            </Button>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            {siteConfig.phone && (
              <a
                href={`tel:${siteConfig.phone.e164}`}
                aria-label={t.nav.call}
                className="grid place-items-center w-9 h-9 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            <LangSwitch />
          </div>
        </nav>
      </header>
    </>
  );
};
