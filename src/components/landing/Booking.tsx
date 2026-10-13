import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowUpRight, MessageCircle, Send } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

const WHATSAPP = "https://wa.me/998901234567";
const TELEGRAM = "https://t.me/zahrodentaluz";
const API_URL = (import.meta.env.VITE_API_URL ?? "https://api.zahro.iqroagency.uz").replace(/\/+$/, "");

export const Booking = () => {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/public/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(f.get("name") ?? "").trim(),
          phone: String(f.get("phone") ?? "").trim(),
          service: service || undefined,
          date: String(f.get("date") ?? "") || undefined,
          note: String(f.get("note") ?? "").trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setService("");
      toast.success(t.booking.ok);
    } catch {
      toast.error(t.booking.err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-24 md:py-36 relative overflow-hidden bg-[hsl(var(--background))]"
    >
      {/* watermark */}
      <div className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 origin-center pointer-events-none select-none hidden lg:block">
        <span className="font-display text-[10rem] font-semibold tracking-tighter leading-none uppercase text-foreground/[0.035] whitespace-nowrap">
          Rendez-vous
        </span>
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* LEFT — editorial header */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[hsl(var(--gold))]">§ 09</span>
                <span className="h-px w-14 bg-[hsl(var(--gold))]" />
                <span className="text-[10px] uppercase tracking-[0.4em] font-semibold text-foreground/50">
                  {t.booking.kicker}
                </span>
              </div>
              <h2 className="font-display font-light leading-[0.9] tracking-[-0.02em] text-[clamp(2rem,5.6vw,4.6rem)]">
                {t.booking.title.split(" ").slice(0, -1).join(" ")}{" "}
                <em className="italic text-[hsl(var(--gold))] font-normal">
                  {t.booking.title.split(" ").slice(-1)[0]}
                </em>
                <span className="text-[hsl(var(--gold))]">.</span>
              </h2>
              <p className="mt-8 text-[15px] leading-[1.75] text-foreground/60 font-light max-w-md">
                {t.booking.desc}
              </p>

              <div className="mt-10 space-y-4 border-t border-foreground/15 pt-6 max-w-sm">
                {[
                  { k: "01", v: "Ma’lumotlarni yuboring" },
                  { k: "02", v: "15 daqiqada javob beramiz" },
                  { k: "03", v: "Qulay vaqtni tanlaymiz" },
                ].map((s) => (
                  <div key={s.k} className="flex items-baseline gap-4">
                    <span className="font-display text-[hsl(var(--gold))] tabular-nums text-sm">
                      {s.k}
                    </span>
                    <span className="text-[13px] text-foreground/70 font-light">{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — editorial form */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={onSubmit}
            className="lg:col-span-7 relative"
          >
            {/* offset gold frame */}
            <span className="absolute -top-4 -right-4 w-full h-full border border-[hsl(var(--gold))]/35 pointer-events-none z-0 hidden md:block" />

            <div className="relative bg-[hsl(var(--card))] border border-foreground/15 p-8 md:p-12 z-10">
              <div className="flex items-center justify-between mb-8 pb-5 border-b border-foreground/15">
                <span className="text-[10px] uppercase tracking-[0.32em] font-bold text-foreground/50">
                  — Formulaire N° 01
                </span>
                <span className="text-[10px] uppercase tracking-[0.32em] font-bold text-[hsl(var(--gold))]">
                  Bepul · Free
                </span>
              </div>

              <div className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-[10px] uppercase tracking-[0.28em] font-bold text-foreground/50"
                    >
                      01 — {t.booking.name}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder={t.booking.namePh}
                      required
                      className="h-11 rounded-none border-0 border-b border-foreground/25 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[hsl(var(--gold))] text-base font-light placeholder:text-foreground/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-[10px] uppercase tracking-[0.28em] font-bold text-foreground/50"
                    >
                      02 — {t.booking.phone}
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder={t.booking.phonePh}
                      required
                      className="h-11 rounded-none border-0 border-b border-foreground/25 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[hsl(var(--gold))] text-base font-light placeholder:text-foreground/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="service"
                      className="text-[10px] uppercase tracking-[0.28em] font-bold text-foreground/50"
                    >
                      03 — {t.booking.service}
                    </Label>
                    <Select value={service} onValueChange={setService}>
                      <SelectTrigger
                        id="service"
                        className="h-11 rounded-none border-0 border-b border-foreground/25 bg-transparent px-0 focus:ring-0 text-base font-light data-[placeholder]:text-foreground/30"
                      >
                        <SelectValue placeholder={t.booking.servicePh} />
                      </SelectTrigger>
                      <SelectContent>
                        {t.services.items.map((s) => (
                          <SelectItem key={s.title} value={s.title}>
                            {s.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="date"
                      className="text-[10px] uppercase tracking-[0.28em] font-bold text-foreground/50"
                    >
                      04 — {t.booking.date}
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      required
                      className="h-11 rounded-none border-0 border-b border-foreground/25 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[hsl(var(--gold))] text-base font-light"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="note"
                    className="text-[10px] uppercase tracking-[0.28em] font-bold text-foreground/50"
                  >
                    05 — {t.booking.note}
                  </Label>
                  <Textarea
                    id="note"
                    name="note"
                    placeholder={t.booking.notePh}
                    rows={3}
                    className="rounded-none border-0 border-b border-foreground/25 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[hsl(var(--gold))] text-base font-light resize-none placeholder:text-foreground/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full inline-flex items-center justify-center px-10 py-5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[11px] uppercase tracking-[0.32em] font-semibold overflow-hidden disabled:opacity-70"
                >
                  <span className="relative z-10 inline-flex items-center gap-3 transition-colors duration-500 group-hover:text-foreground">
                    {loading ? t.booking.sending : t.booking.send}
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                  <span className="absolute inset-0 bg-[hsl(var(--gold))] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                </button>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <a
                    href={WHATSAPP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-12 border border-foreground/20 text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground/70 hover:border-[#25D366] hover:text-[#25D366] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> {t.booking.whatsapp}
                  </a>
                  <a
                    href={TELEGRAM}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-12 border border-foreground/20 text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground/70 hover:border-[#229ED9] hover:text-[#229ED9] transition-colors"
                  >
                    <Send className="w-4 h-4" /> {t.booking.telegram}
                  </a>
                </div>
              </div>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
};
