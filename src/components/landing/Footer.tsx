import { Facebook, Instagram, MessageCircle, Send, Youtube } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { resolveAddress, siteConfig } from "@/config/site";

export const Footer = () => {
  const { t, lang } = useLang();
  // Faqat sozlangan havolalar ko'rsatiladi (o'lik "#" ikonkalar yo'q).
  type Social = { href: string | null; Icon: typeof Send; label: string };
  const socials: Social[] = [
    { href: siteConfig.instagramUrl, Icon: Instagram, label: t.footer.social.instagram },
    { href: siteConfig.telegramChannelUrl, Icon: Send, label: t.footer.social.telegram },
    { href: siteConfig.youtubeUrl, Icon: Youtube, label: t.footer.social.youtube },
    { href: siteConfig.facebookUrl, Icon: Facebook, label: t.footer.social.facebook },
    { href: siteConfig.whatsappUrl, Icon: MessageCircle, label: t.footer.social.whatsapp },
  ].flatMap((s) => (s.href ? [{ ...s, href: s.href }] : []));
  return (
    <footer className="bg-foreground text-background/70 pt-24 pb-10 relative overflow-hidden">
      {/* Enormous editorial wordmark */}
      <div className="absolute inset-x-0 bottom-[-3vw] pointer-events-none select-none">
        <p className="font-display italic text-[26vw] leading-none tracking-tighter text-center text-background/[0.05] whitespace-nowrap">
          ZAHRODENTAL
        </p>
      </div>

      <div className="container relative">
        {/* Top editorial rule */}
        <div className="flex items-center gap-4 mb-12">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[hsl(var(--gold))]">
            § Colophon
          </span>
          <span className="h-px flex-1 bg-background/15" />
          <span className="text-[10px] uppercase tracking-[0.4em] font-semibold text-background/40">
            MMXIV — MMXXVI
          </span>
        </div>

        <div className="grid md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand column */}
          <div className="md:col-span-5">
            <a href="#" className="inline-flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-full border border-[hsl(var(--gold))]/50 text-[hsl(var(--gold))]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3c-2.5 0-4 1-5.5 1S3 3 3 6c0 4 1.5 6 2.5 9.5C6.2 18 7 21 9 21c1.5 0 1.8-3 3-3s1.5 3 3 3c2 0 2.8-3 3.5-5.5C19.5 12 21 10 21 6c0-3-2-2-3.5-2S14.5 3 12 3z" />
                </svg>
              </span>
              <span className="font-display italic text-3xl text-background font-normal tracking-tight">
                Zahro<span className="text-[hsl(var(--gold))]">Dental</span>
              </span>
            </a>
            <p className="mt-6 text-[14px] leading-[1.75] font-light max-w-sm text-background/65">
              {t.footer.tagline}
            </p>
            <div className="mt-8 flex gap-3">
              {socials.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-11 h-11 rounded-full border border-background/15 hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))] grid place-items-center transition-colors"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] uppercase tracking-[0.32em] font-bold text-[hsl(var(--gold))] mb-6">
              — {t.footer.sections}
            </h4>
            <ul className="space-y-3.5 text-[14px] font-light">
              {[
                ["#services", t.nav.services],
                ["#doctors", t.nav.doctors],
                ["#pricing", t.nav.pricing],
                ["#gallery", t.nav.gallery],
                ["#contact", t.nav.contact],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="group inline-flex items-center gap-2 text-background/70 hover:text-[hsl(var(--gold))] transition-colors"
                  >
                    <span className="w-4 h-px bg-background/25 group-hover:bg-[hsl(var(--gold))] group-hover:w-6 transition-all" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div className="md:col-span-4">
            <h4 className="text-[10px] uppercase tracking-[0.32em] font-bold text-[hsl(var(--gold))] mb-6">
              — {t.footer.contacts}
            </h4>
            <ul className="space-y-3 text-[14px] font-light text-background/70">
              {siteConfig.phone && (
                <li className="font-display italic text-xl text-background">
                  <a href={`tel:${siteConfig.phone.e164}`}>{siteConfig.phone.display}</a>
                </li>
              )}
              {siteConfig.email && <li>{siteConfig.email}</li>}
              <li>{resolveAddress(siteConfig, lang, t.location.address)}</li>
              <li className="pt-2 text-[12px] text-background/50">
                {t.location.hoursWeek} · {t.location.hoursSun}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-16 pt-6 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] uppercase tracking-[0.28em] text-background/45">
          <span>© 2026 ZAHRODENTAL — {t.footer.rights}</span>
          <span className="font-display italic text-sm normal-case tracking-normal text-background/55">
            “Sog‘lom tabassum — bizning san’atimiz.”
          </span>
        </div>
      </div>
    </footer>
  );
};
