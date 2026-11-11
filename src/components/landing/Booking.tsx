import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowUpRight, Bell, Send } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import {
  NAME_MAX,
  buildLeadPayload,
  classifyLeadError,
  cleanName,
  formatLocalPhone,
  isTooFast,
  isValidName,
  isValidPhone,
} from "@/lib/leadForm";
import { siteConfig } from "@/config/site";

const TELEGRAM = siteConfig.telegramChannelUrl;
/** Bot sozlanmagan bo'lsa (null) bot bloki butunlay yashiriladi — kanalga fallback yo'q. */
const BOT_URL = siteConfig.telegramBotUrl;
const API_URL = siteConfig.apiUrl;

type Errors = Partial<Record<"name" | "phone", string>>;

export const Booking = () => {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const phoneRef = useRef<HTMLInputElement>(null);
  const mountedAt = useRef(Date.now());
  const [website, setWebsite] = useState(""); // honeypot
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const clear = (k: keyof Errors) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));

  const validate = (): Errors => {
    const e: Errors = {};
    if (!isValidName(name)) e.name = t.booking.vName;
    if (!isValidPhone(phone)) e.phone = t.booking.vPhone;
    return e;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      const first = (["name", "phone"] as const).find((k) => found[k]);
      document.getElementById(first!)?.focus();
      return;
    }
    const done = () => {
      setName("");
      setPhone("");
      setErrors({});
      setSent(true);
      toast.success(t.booking.ok);
    };
    // Bot belgisi: forma ochilishi bilan darrov yuborilsa, API'ga chiqmay "muvaffaqiyat" ko'rsatamiz.
    if (isTooFast(mountedAt.current, Date.now())) {
      done();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/public/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildLeadPayload({ name, phone, website })),
      });
      if (!res.ok) throw Object.assign(new Error(String(res.status)), { status: res.status });
      done();
    } catch (err) {
      const kind = classifyLeadError((err as { status?: number }).status);
      if (kind === "validation") {
        setErrors({ phone: t.booking.errPhone });
        document.getElementById("phone")?.focus();
        toast.error(t.booking.errPhone);
      } else if (kind === "rateLimit") toast.error(t.booking.errRate);
      else if (kind === "offline") toast.error(t.booking.errOffline);
      else toast.error(t.booking.err);
    } finally {
      setLoading(false);
    }
  };

  const errCls = "text-[12px] text-red-600 font-normal mt-1";

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
                {t.booking.steps.map((v, i) => ({ k: `0${i + 1}`, v })).map((s) => (
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
            noValidate
            className="lg:col-span-7 relative"
          >
            {/* offset gold frame */}
            <span className="absolute -top-4 -right-4 w-full h-full border border-[hsl(var(--gold))]/35 pointer-events-none z-0 hidden md:block" />

            <div className="relative bg-[hsl(var(--card))] border border-foreground/15 p-8 md:p-12 z-10">
              <div className="flex items-center justify-between mb-8 pb-5 border-b border-foreground/15">
                <span className="text-[10px] uppercase tracking-[0.32em] font-bold text-foreground/50">
                  {t.booking.formNo}
                </span>
                <span className="text-[10px] uppercase tracking-[0.32em] font-bold text-[hsl(var(--gold))]">
                  {t.booking.free}
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
                      value={name}
                      onChange={(e) => { setName(cleanName(e.target.value)); clear("name"); }}
                      autoComplete="name"
                      maxLength={NAME_MAX}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-err" : undefined}
                      className="h-11 rounded-none border-0 border-b border-foreground/25 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[hsl(var(--gold))] text-base font-light placeholder:text-foreground/30"
                    />
                    {errors.name && <p id="name-err" role="alert" className={errCls}>{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-[10px] uppercase tracking-[0.28em] font-bold text-foreground/50"
                    >
                      02 — {t.booking.phone}
                    </Label>
                    <div
                      className={`flex items-center h-11 border-b transition-colors focus-within:border-[hsl(var(--gold))] ${
                        errors.phone ? "border-red-500" : "border-foreground/25"
                      }`}
                    >
                      <span
                        className="flex items-center gap-2 pr-3 mr-3 border-r border-foreground/15 text-base font-light text-foreground/70 select-none"
                        aria-hidden="true"
                      >
                        <span className="text-[10px] font-bold tracking-widest text-foreground/40">UZ</span>
                        +998
                      </span>
                      <input
                        ref={phoneRef}
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder="90 123 45 67"
                        value={phone}
                        onChange={(e) => {
                          const el = e.target;
                          // keep the caret next to the same digit after re-grouping
                          const digitsBefore = el.value.slice(0, el.selectionStart ?? el.value.length).replace(/\D/g, "").length;
                          const next = formatLocalPhone(el.value);
                          setPhone(next);
                          clear("phone");
                          requestAnimationFrame(() => {
                            let seen = 0;
                            let pos = 0;
                            while (pos < next.length && seen < digitsBefore) {
                              if (/\d/.test(next[pos])) seen++;
                              pos++;
                            }
                            phoneRef.current?.setSelectionRange(pos, pos);
                          });
                        }}
                        maxLength={14}
                        aria-label={`${t.booking.phone} +998`}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "phone-err" : undefined}
                        className="flex-1 min-w-0 h-full bg-transparent outline-none text-base font-light tracking-wide placeholder:text-foreground/30"
                      />
                    </div>
                    {errors.phone && <p id="phone-err" role="alert" className={errCls}>{errors.phone}</p>}
                  </div>
                </div>

                {/* Honeypot: odamga ko'rinmaydi, botlar to'ldiradi (backend `website`). */}
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0, overflow: "hidden" }}
                />

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

                <p className="-mt-4 text-[11px] leading-relaxed text-foreground/50 font-light text-center">
                  {t.booking.consent}
                </p>

                {sent && (
                  <div role="status" className="border border-[hsl(var(--gold))]/60 bg-[hsl(var(--gold))]/5 p-5">
                    <p className="text-[13px] font-semibold text-foreground/80">{t.booking.ok}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-foreground/60 font-light">{t.booking.sentNote}</p>
                    <p className="mt-2 text-[12px] text-foreground/60">
                      {t.location.hoursLabel}: {t.location.hoursWeek} · {t.location.hoursSun}
                    </p>
                  </div>
                )}

                {BOT_URL && (
                <div
                  className={`border p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
                    sent ? "border-[#229ED9] bg-[#229ED9]/5" : "border-foreground/15"
                  }`}
                >
                  <Bell className="w-5 h-5 text-[#229ED9] shrink-0" />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-foreground/80">
                      {sent ? t.booking.botDone : t.booking.botTitle}
                    </p>
                    {!sent && <p className="mt-1 text-[12px] leading-relaxed text-foreground/55 font-light">{t.booking.botDesc}</p>}
                  </div>
                  <a
                    href={BOT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-[#229ED9] text-white text-[11px] uppercase tracking-[0.2em] font-semibold hover:opacity-90 transition-opacity shrink-0"
                  >
                    <Send className="w-4 h-4" /> {t.booking.botBtn}
                  </a>
                </div>
                )}

                <div className="pt-2">
                  <a
                    href={TELEGRAM}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 h-12 border border-foreground/20 text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground/70 hover:border-[#229ED9] hover:text-[#229ED9] transition-colors"
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
