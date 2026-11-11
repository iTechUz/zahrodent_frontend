import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

export const CtaBanner = () => {
  const { t } = useLang();
  const { title, subtitle, cta } = t.ctaBanner;

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
      {/* subtle overlays */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      <div className="absolute -right-24 -top-24 w-[520px] h-[520px] rounded-full bg-[hsl(var(--gold))]/15 blur-3xl pointer-events-none" />

      {/* enormous editorial wordmark */}
      <div className="absolute inset-x-0 bottom-[-3.5rem] pointer-events-none select-none opacity-[0.06]">
        <p className="font-display italic text-[22vw] leading-none tracking-tighter text-center text-[hsl(var(--gold))] whitespace-nowrap">
          ZAHRODENTAL
        </p>
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="h-px w-14 bg-[hsl(var(--gold))]" />
              <span className="text-[10px] uppercase tracking-[0.4em] font-semibold text-[hsl(var(--gold))]">
                Colophon · Prenez rendez-vous
              </span>
            </div>
            <h2 className="font-display font-light leading-[0.92] tracking-[-0.02em] text-[clamp(2.1rem,6vw,5.5rem)] max-w-3xl">
              {title.split(" ").slice(0, -1).join(" ")}{" "}
              <em className="italic text-[hsl(var(--gold))] font-normal">
                {title.split(" ").slice(-1)[0]}
              </em>
              <span className="text-[hsl(var(--gold))]">.</span>
            </h2>
            <p className="mt-8 text-[15px] leading-[1.75] text-[hsl(var(--primary-foreground))]/65 font-light max-w-lg">
              {subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-4 lg:justify-self-end w-full lg:w-auto"
          >
            <a
              href="#contact"
              className="group relative w-full lg:w-auto inline-flex items-center justify-between gap-6 px-8 md:px-10 py-5 md:py-6 bg-[hsl(var(--gold))] text-foreground text-[11px] uppercase tracking-[0.32em] font-semibold overflow-hidden shadow-[0_28px_60px_-24px_hsl(var(--gold)/0.55)]"
            >
              <span className="relative z-10 transition-colors duration-500 group-hover:text-[hsl(var(--gold))]">
                {cta}
              </span>
              <ArrowUpRight className="relative z-10 w-4 h-4 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[hsl(var(--gold))]" />
              <span className="absolute inset-0 bg-[hsl(var(--primary))] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </a>
            <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--primary-foreground))]/45 text-right">
              — {t.ctaBanner.note}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
