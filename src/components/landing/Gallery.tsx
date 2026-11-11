import { useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import before1 from "@/assets/smile-before.jpg";
import after1 from "@/assets/smile-after.jpg";
import before2 from "@/assets/smile-before-2.jpg";
import after2 from "@/assets/smile-after-2.jpg";

type Sample = { cat: number; before: string; after: string };

const samples: Sample[] = [
  { cat: 0, before: before1, after: after1 },
  { cat: 2, before: before2, after: after2 },
  { cat: 1, before: before1, after: after1 },
  { cat: 3, before: before2, after: after2 },
];

const Comparison = ({
  before,
  after,
  labelBefore,
  labelAfter,
}: {
  before: string;
  after: string;
  labelBefore: string;
  labelAfter: string;
}) => {
  const { t } = useLang();
  const [pos, setPos] = useState(50);
  return (
    <div className="relative overflow-hidden border border-foreground/15 bg-foreground select-none aspect-[4/3] shadow-[0_18px_50px_-24px_hsl(var(--primary)/0.35)]">
      <img
        src={after}
        alt={t.gallery.altAfter}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${pos}%` }}
      >
        <img
          src={before}
          alt={t.gallery.altBefore}
          className="w-full h-full object-cover"
          style={{ width: `${100 / (pos / 100)}%`, maxWidth: "none" }}
          loading="lazy"
        />
      </div>
      <div
        className="absolute inset-y-0 w-px bg-[hsl(var(--gold))] pointer-events-none"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[hsl(var(--background))] grid place-items-center shadow-elevated border border-[hsl(var(--gold))]/40">
          <span className="text-foreground text-sm">⇆</span>
        </div>
      </div>
      <span className="absolute top-4 left-4 px-3 py-1 bg-[hsl(var(--background))]/90 backdrop-blur-md text-foreground text-[9px] font-bold uppercase tracking-[0.28em]">
        {labelBefore}
      </span>
      <span className="absolute top-4 right-4 px-3 py-1 bg-[hsl(var(--gold))] text-foreground text-[9px] font-bold uppercase tracking-[0.28em]">
        {labelAfter}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        aria-label={t.gallery.slider}
      />
    </div>
  );
};

export const Gallery = () => {
  const { t } = useLang();
  const [cat, setCat] = useState<number | null>(null);
  const filtered = cat === null ? samples : samples.filter((s) => s.cat === cat);

  return (
    <section id="gallery" className="py-24 md:py-36 relative overflow-hidden bg-[hsl(var(--muted))]">
      {/* Rotated watermark */}
      <div className="absolute -left-24 top-1/2 -translate-y-1/2 -rotate-90 origin-center pointer-events-none select-none hidden lg:block">
        <span className="font-display text-[10rem] font-semibold tracking-tighter leading-none uppercase text-foreground/[0.035] whitespace-nowrap">
          Galerie
        </span>
      </div>

      <div className="container relative">
        {/* Editorial header */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-end mb-14">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[hsl(var(--gold))]">§ 06</span>
              <span className="h-px w-14 bg-[hsl(var(--gold))]" />
              <span className="text-[10px] uppercase tracking-[0.4em] font-semibold text-foreground/50">
                {t.gallery.kicker} · Avant / Après
              </span>
            </div>
            <h2 className="font-display font-light leading-[0.9] tracking-[-0.02em] text-[clamp(2rem,5.8vw,5rem)]">
              {t.gallery.title.split("/")[0].trim()}{" "}
              <em className="italic text-[hsl(var(--gold))] font-normal">
                / {t.gallery.title.split("/")[1]?.trim() ?? "Keyin"}
              </em>
              <span className="text-[hsl(var(--gold))]">.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[15px] leading-[1.75] text-foreground/60 font-light max-w-md lg:ml-auto">
              {t.gallery.desc}
            </p>
          </div>
        </div>

        {/* Filter — editorial tabs */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-12 border-y border-foreground/15 py-4">
          <span className="text-[10px] uppercase tracking-[0.32em] font-bold text-foreground/40 mr-2">
            Index —
          </span>
          <button
            onClick={() => setCat(null)}
            className={`text-[11px] uppercase tracking-[0.22em] font-semibold pb-1 border-b transition-colors ${
              cat === null
                ? "text-[hsl(var(--gold))] border-[hsl(var(--gold))]"
                : "text-foreground/60 border-transparent hover:text-foreground"
            }`}
          >
            00 — All
          </button>
          {t.gallery.categories.map((c, i) => (
            <button
              key={c}
              onClick={() => setCat(i)}
              className={`text-[11px] uppercase tracking-[0.22em] font-semibold pb-1 border-b transition-colors ${
                cat === i
                  ? "text-[hsl(var(--gold))] border-[hsl(var(--gold))]"
                  : "text-foreground/60 border-transparent hover:text-foreground"
              }`}
            >
              {String(i + 1).padStart(2, "0")} — {c}
            </button>
          ))}
        </div>

        {/* Plates */}
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-14">
          {filtered.slice(0, 4).map((s, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Comparison
                before={s.before}
                after={s.after}
                labelBefore={t.gallery.labelBefore}
                labelAfter={t.gallery.labelAfter}
              />
              <figcaption className="mt-5 flex items-baseline justify-between border-t border-foreground/15 pt-4">
                <span className="text-[10px] uppercase tracking-[0.32em] text-foreground/50 font-bold">
                  Plate N° {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display italic text-lg text-foreground">
                  {t.gallery.categories[s.cat]}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};
