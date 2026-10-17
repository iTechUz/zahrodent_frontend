import type { ElementType } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, ArrowUpRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

const LAT = 41.311081;
const LNG = 69.279737;
const EMBED = `https://www.google.com/maps?q=${LAT},${LNG}&hl=en&z=16&output=embed`;
const DIR = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`;

export const Location = () => {
  const { t } = useLang();

  return (
    <section
      id="location"
      className="py-24 md:py-36 relative overflow-hidden bg-[hsl(var(--muted))]"
    >
      <div className="container">
        {/* Editorial header */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-end mb-14">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[hsl(var(--gold))]">§ 10</span>
              <span className="h-px w-14 bg-[hsl(var(--gold))]" />
              <span className="text-[10px] uppercase tracking-[0.4em] font-semibold text-foreground/50">
                {t.location.kicker} · Adresse
              </span>
            </div>
            <h2 className="font-display font-light leading-[0.9] tracking-[-0.02em] text-[clamp(2rem,5.6vw,4.6rem)]">
              {t.location.title.split(" ").slice(0, -1).join(" ")}{" "}
              <em className="italic text-[hsl(var(--gold))] font-normal">
                {t.location.title.split(" ").slice(-1)[0]}
              </em>
              <span className="text-[hsl(var(--gold))]">.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:justify-self-end">
            <p className="text-[13px] uppercase tracking-[0.3em] font-semibold text-foreground/60">
              41.3110° N · 69.2797° E
            </p>
          </div>
        </div>

        {/* Editorial split */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">
          {/* Info column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex flex-col"
          >
            <ol className="divide-y divide-foreground/15 border-y border-foreground/15">
              {[
                {
                  n: "01",
                  Icon: MapPin,
                  label: "Manzil",
                  value: t.location.address,
                  sub: "Mirzo Ulug‘bek tumani",
                },
                {
                  n: "02",
                  Icon: Phone,
                  label: "Telefon",
                  value: t.location.phone,
                  sub: "Har kuni · 09:00 – 20:00",
                  href: `tel:${t.location.phone.replace(/\s/g, "")}`,
                },
                {
                  n: "03",
                  Icon: Clock,
                  label: t.location.hoursLabel,
                  value: t.location.hoursWeek,
                  sub: t.location.hoursSun,
                },
              ].map(({ n, Icon, label, value, sub, href }) => {
                const Wrap: ElementType = href ? "a" : "div";
                const wrapProps = href
                  ? { href, className: "group block py-7" }
                  : { className: "block py-7" };
                return (
                  <li key={n}>
                    <Wrap {...wrapProps}>
                      <div className="flex items-start gap-6">
                        <span className="font-display italic text-[hsl(var(--gold))] text-lg tabular-nums pt-1">
                          {n}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] font-bold text-foreground/50 mb-2">
                            <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                            {label}
                          </div>
                          <p className="font-display text-xl md:text-2xl leading-tight text-foreground">
                            {value}
                          </p>
                          {sub && (
                            <p className="mt-1 text-[13px] text-foreground/55 font-light">
                              {sub}
                            </p>
                          )}
                        </div>
                        {href && (
                          <ArrowUpRight className="w-4 h-4 text-foreground/40 group-hover:text-[hsl(var(--gold))] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                    </Wrap>
                  </li>
                );
              })}
            </ol>

            <a
              href={DIR}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative mt-8 inline-flex items-center justify-center px-10 py-5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[11px] uppercase tracking-[0.32em] font-semibold overflow-hidden"
            >
              <span className="relative z-10 inline-flex items-center gap-3 transition-colors duration-500 group-hover:text-foreground">
                {t.location.route}
                <ArrowUpRight className="w-4 h-4" />
              </span>
              <span className="absolute inset-0 bg-[hsl(var(--gold))] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </a>
          </motion.div>

          {/* Map plate */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 relative"
          >
            <span className="absolute -top-4 -right-4 w-full h-full border border-[hsl(var(--gold))]/35 pointer-events-none z-0" />
            <div className="relative overflow-hidden border border-foreground/15 min-h-[420px] lg:min-h-[560px] shadow-[0_28px_70px_-30px_hsl(var(--primary)/0.35)] z-10">
              <iframe
                title="ZAHRODENTAL klinikasi manzili"
                src={EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[420px] lg:min-h-[560px] border-0 grayscale-[0.35] contrast-[0.95]"
                allowFullScreen
              />
              <div className="absolute top-4 left-4 bg-[hsl(var(--background))]/95 backdrop-blur-md px-4 py-2 border border-foreground/10 pointer-events-none">
                <p className="text-[9px] uppercase tracking-[0.32em] font-bold text-foreground/50">
                  — Plate N° X
                </p>
                <p className="text-[11px] font-display italic text-foreground mt-0.5">
                  ZAHRODENTAL · Mirzo Ulug‘bek
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
