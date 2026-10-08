import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Baby, CalendarDays, Check, Gift, Mail, Phone, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmailDatalist } from "@/components/EmailDatalist";
import { useAuth } from "@/lib/auth";
import { useProfilePrefill } from "@/hooks/use-profile";
import { heError } from "@/lib/he-errors";
import { requestPhotographySession } from "@/lib/photography.functions";
import { PAYMENT_LABELS } from "@/lib/photography-options";
import { NEWBORN_PACKAGES, NEWBORN_ADDONS, NEWBORN_TIMELINE_STEPS } from "@/lib/newborn-packages";
import { requestBirthBasketInterest } from "@/lib/newborn-orders.functions";
import { usePageGallery, PORTFOLIO_CATEGORIES } from "@/lib/page-images";

// Site-branded (Sport Plus header/footer, theme tokens) version of the
// standalone /newborn landing page. Booking goes through the same
// requestPhotographySession server fn as /studio-photography, so a request
// lands in the admin calendar (bookings), the admin notifications, and the
// finance page's income ("סשן צילומים עם מיכל", priced from the chosen
// package) exactly like any other photography booking — nothing new to wire.
export const Route = createFileRoute("/newborn-photography")({
  head: () => ({
    meta: [
      { title: "צילומי ניו-בורן | Sport Plus" },
      {
        name: "description",
        content: "צילומי ניו-בורן, גיל שנה ומשפחה בסטודיו בוטיק בבית שמש — חבילות מלאות עם עיבוד, קולאז' ואלבום, וקביעת מועד ישירות ביומן.",
      },
      { property: "og:title", content: "צילומי ניו-בורן | Sport Plus" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sportplus.co.il/newborn-photography" },
    ],
    links: [{ rel: "canonical", href: "https://sportplus.co.il/newborn-photography" }],
  }),
  component: NewbornPhotographyPage,
});

const PHONE = "0583258197";
const EMAIL = "s0548529277@gmail.com";
const REGULAR_PACKAGES = NEWBORN_PACKAGES.filter((p) => p.categories.includes("regular"));

const inputCls =
  "w-full rounded-xl bg-card border border-primary/15 px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors";

function PortfolioGallery({ onOpen }: { onOpen: (src: string) => void }) {
  const [cat, setCat] = useState<string>(PORTFOLIO_CATEGORIES[0].key);
  const gallery = usePageGallery(cat);
  const photos = gallery.images;

  return (
    <section id="gallery" className="container-page pb-16">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl md:text-4xl text-primary mb-1">מהסשנים שלנו</h2>
        <p className="text-sm text-muted-foreground">בוחרים קטגוריה ורואים תמונות אמיתיות מהסטודיו</p>
      </div>
      <div className="grid grid-cols-5 gap-2 md:gap-6 mb-8" role="tablist" dir="rtl">
        {PORTFOLIO_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={cat === c.key}
            onClick={() => setCat(c.key)}
            className={`pb-3 text-xs sm:text-sm md:text-base border-b-2 transition-colors ${
              cat === c.key ? "border-primary text-primary" : "border-foreground/30 text-foreground/70 hover:text-primary"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      {photos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/20 bg-cream/60 p-10 text-center text-sm text-muted-foreground">
          התמונות של הקטגוריה הזו יעלו בקרוב.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => onOpen(src)}
              className="relative overflow-hidden rounded-2xl bg-cream aspect-[4/5] group"
            >
              <img
                src={src}
                alt={`${PORTFOLIO_CATEGORIES.find((c) => c.key === cat)?.label ?? ""} ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function NewbornPhotographyPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const profile = useProfilePrefill();
  const bookSession = useServerFn(requestPhotographySession);
  const sendBirthBasketInterest = useServerFn(requestBirthBasketInterest);

  const [lightbox, setLightbox] = useState<string | null>(null);
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [basketSending, setBasketSending] = useState(false);
  const [basketSent, setBasketSent] = useState(false);
  const [book, setBook] = useState({
    name: "",
    phone: "",
    date: "",
    time: "10:00",
    email: "",
    payment: "cash",
    packageId: REGULAR_PACKAGES[0]?.id ?? "mini",
    notes: "",
  });

  useEffect(() => {
    if (!profile.loaded) return;
    setBook((b) => ({ ...b, name: b.name || profile.fullName, phone: b.phone || profile.phone, email: b.email || profile.email }));
  }, [profile.loaded, profile.fullName, profile.phone, profile.email]);

  const chosenPackage = REGULAR_PACKAGES.find((p) => p.id === book.packageId) ?? REGULAR_PACKAGES[0];

  const openWizard = (packageId?: string) => {
    if (packageId) setBook((b) => ({ ...b, packageId }));
    setStep(1);
    setWizard(true);
  };

  const submitBooking = async () => {
    if (!book.name.trim() || !book.phone.trim() || !book.date) {
      toast.error("נא למלא שם, טלפון ותאריך.");
      return;
    }
    if (!user) {
      toast.error("יש להתחבר כדי לקבוע מועד ביומן.");
      nav({ to: "/auth" });
      return;
    }
    setSending(true);
    try {
      const res = await bookSession({
        data: {
          session_date: book.date,
          start_time: book.time,
          hours: 3,
          contact_name: book.name.trim(),
          contact_phone: book.phone.trim(),
          contact_email: book.email.trim() || null,
          payment_method: book.payment as "cash" | "transfer" | "bit" | "later",
          session_type: "ניו-בורן",
          location: "studio",
          package_id: chosenPackage?.id ?? null,
          notes: book.notes || null,
        },
      });
      toast.success("הבקשה נקלטה ביומן הסטודיו ✓");
      setBook((b) => ({ ...b, notes: "" }));
      setWizard(false);
      nav({ to: "/photo-thanks/$id", params: { id: res.id } });
    } catch (e) {
      toast.error(heError(e, "קביעת המועד נכשלה"));
    } finally {
      setSending(false);
    }
  };

  const handleBirthBasketInterest = async () => {
    setBasketSending(true);
    try {
      await sendBirthBasketInterest({
        data: { name: book.name || profile.fullName, phone: book.phone || profile.phone, email: book.email || profile.email },
      });
      setBasketSent(true);
      toast.success("קיבלתי! אחזור אלייך בהקדם 💗");
    } catch {
      toast.error("משהו השתבש, נסי שוב או התקשרי");
    } finally {
      setBasketSending(false);
    }
  };

  const gmailLink =
    `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}` +
    `&su=${encodeURIComponent("תיאום צילומי ניו-בורן")}&body=${encodeURIComponent("היי מיכל, אשמח לתאם צילומי ניו-בורן 🌿")}`;

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground overflow-x-clip">
      <Header />

      {/* Hero */}
      <section className="container-page pt-12 pb-14 md:pt-20 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-card px-5 py-2 rounded-full text-sm text-primary mb-6 border border-primary/10">
            <Baby size={14} /> צילומי ניו-בורן · מיכל סיבוני
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-primary leading-[1.1] mb-5">
            הימים הראשונים,
            <br />
            נשארים לתמיד.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-9">
            חוויית צילום רגועה ומקצועית בסטודיו בוטיק בבית שמש — עם עיבוד מוקפד, קולאז' ואלבום שנשאר למשפחה.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => openWizard()}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 h-12 text-sm font-medium hover:opacity-90 transition"
            >
              <CalendarDays size={18} /> קביעת מועד ביומן
            </button>
            <a
              href={gmailLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-card border border-primary/15 text-primary px-7 h-12 text-sm font-medium hover:bg-cream transition"
            >
              <Mail size={18} /> לתיאום במייל
            </a>
          </div>
        </motion.div>
      </section>

      <PortfolioGallery onOpen={setLightbox} />

      {/* Packages */}
      <section id="packages" className="container-page pb-16">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl md:text-4xl text-primary mb-1">חבילות ניו-בורן</h2>
          <p className="text-sm text-muted-foreground">בוחרים חבילה, וממשיכים ישר לקביעת מועד</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {REGULAR_PACKAGES.map((pkg) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className={`relative bg-card rounded-3xl border p-7 flex flex-col ${
                pkg.id === "pampering" ? "border-primary/40 shadow-lg" : "border-primary/10"
              }`}
            >
              {pkg.id === "pampering" && (
                <span className="absolute -top-3 right-1/2 translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  הכי פופולרית
                </span>
              )}
              <div className="font-display text-2xl text-primary mb-1">{pkg.name}</div>
              <div className="text-sm text-muted-foreground mb-4">₪{pkg.price}</div>
              <ul className="space-y-2 mb-6 flex-1">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-primary shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => openWizard(pkg.id)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 h-11 text-sm font-medium hover:opacity-90 transition"
              >
                <CalendarDays size={16} /> קביעת מועד לחבילה זו
              </button>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl bg-cream/70 border border-primary/10 p-5 text-center text-sm">
          תוספות אפשריות: {NEWBORN_ADDONS.map((a) => a.label.replace(/\s*\(אוכל\)/, "")).join(" · ")}.
        </div>

        <div className="mt-6 rounded-3xl border border-primary/15 bg-cream p-6 md:p-7 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
          <div className="h-12 w-12 rounded-full bg-card flex items-center justify-center shrink-0">
            <Gift size={22} className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-primary mb-0.5">מימוש סל לידה מקופת החולים?</div>
            <div className="text-sm text-muted-foreground">יש חבילות ייעודיות למימוש סל לידה — לחצי ואחזור אלייך עם כל הפרטים.</div>
          </div>
          <button
            type="button"
            onClick={handleBirthBasketInterest}
            disabled={basketSending || basketSent}
            className="inline-flex items-center gap-2 shrink-0 rounded-full bg-primary text-primary-foreground px-6 h-11 text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {basketSent ? <Check size={16} /> : <Gift size={16} />}
            {basketSent ? "הבקשה נשלחה ✓" : basketSending ? "שולח…" : "מעוניינת במימוש סל לידה"}
          </button>
        </div>
      </section>

      {/* Process */}
      <section className="container-page pb-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary text-xs tracking-[0.28em] uppercase mb-2">
            <ShieldCheck size={14} /> איך זה עובד
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-primary">התהליך, שלב אחר שלב</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {NEWBORN_TIMELINE_STEPS.map((s, i) => (
            <div key={s.key} className="bg-card rounded-2xl border border-primary/10 p-4 text-center">
              <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-cream flex items-center justify-center text-sm font-medium text-primary">
                {i + 1}
              </div>
              <div className="text-xs leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-4">
        <div className="bg-card rounded-3xl border border-primary/10 p-10 md:p-14 text-center">
          <h3 className="font-display text-3xl md:text-4xl text-primary mb-3">מוכנים להנציח את הימים הראשונים?</h3>
          <p className="text-muted-foreground mb-7 max-w-xl mx-auto">נשמח לתאם סשן ניו-בורן רגוע ומקצועי בסטודיו בבית שמש.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={() => openWizard()}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 h-12 text-sm font-medium hover:opacity-90 transition"
            >
              <CalendarDays size={18} /> קביעת מועד ביומן
            </button>
            <a
              href={`tel:${PHONE}`}
              dir="ltr"
              className="inline-flex items-center gap-2 rounded-full border border-primary/15 text-primary px-7 h-12 text-sm hover:bg-cream transition"
            >
              <Phone size={18} /> {PHONE}
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            כבר צילמתן איתנו? <Link to="/my-photos" className="underline">התמונות שלך כאן</Link>
          </p>
        </div>
      </section>

      {wizard && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setWizard(false)}
        >
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-background rounded-3xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-primary">שלב {step} מתוך 3</div>
              <button type="button" aria-label="סגירה" onClick={() => setWizard(false)} className="h-9 w-9 rounded-full hover:bg-cream flex items-center justify-center">
                ✕
              </button>
            </div>
            <div className="h-1.5 rounded-full bg-primary/10 mb-6 overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${(step / 3) * 100}%` }} />
            </div>

            {step === 1 && (
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium">תאריך *</span>
                  <input className={inputCls} type="date" value={book.date} onChange={(e) => setBook({ ...book, date: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium">שעת התחלה *</span>
                  <input className={inputCls} type="time" step={1800} value={book.time} onChange={(e) => setBook({ ...book, time: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className="text-xs font-medium">חבילה</span>
                  <select className={inputCls} value={book.packageId} onChange={(e) => setBook({ ...book, packageId: e.target.value })}>
                    {REGULAR_PACKAGES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · ₪{p.price}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium">שם מלא *</span>
                  <input className={inputCls} value={book.name} onChange={(e) => setBook({ ...book, name: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium">טלפון *</span>
                  <input className={inputCls} dir="ltr" type="tel" value={book.phone} onChange={(e) => setBook({ ...book, phone: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium">אימייל לאישור</span>
                  <input className={inputCls} dir="ltr" type="email" list="email-suggest-newborn-photo" value={book.email} onChange={(e) => setBook({ ...book, email: e.target.value })} placeholder="you@example.com" />
                  <EmailDatalist id="email-suggest-newborn-photo" value={book.email} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium">אמצעי תשלום</span>
                  <select className={inputCls} value={book.payment} onChange={(e) => setBook({ ...book, payment: e.target.value })}>
                    {Object.entries(PAYMENT_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className="text-xs font-medium">הערות</span>
                  <textarea className={inputCls} rows={2} value={book.notes} onChange={(e) => setBook({ ...book, notes: e.target.value })} />
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="rounded-2xl bg-card border border-primary/10 p-5 text-sm space-y-2">
                <div className="font-medium text-primary text-base mb-1">סיכום לפני שליחה</div>
                <div>תאריך: <strong>{book.date || "—"}</strong> · שעה: <strong>{book.time || "—"}</strong></div>
                <div>חבילה: <strong>{chosenPackage?.name}</strong> (₪{chosenPackage?.price})</div>
                <div>שם: <strong>{book.name || "—"}</strong> · טלפון: <strong>{book.phone || "—"}</strong></div>
                <div>תשלום: <strong>{PAYMENT_LABELS[book.payment]}</strong></div>
                <p className="text-xs text-muted-foreground pt-2">
                  המועד יישמר ביומן הסטודיו ואישור יישלח למייל. המועד מאושר סופית לאחר תיאום עם הצלמת.
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => (step === 1 ? setWizard(false) : setStep(step - 1))}
                className="h-12 px-6 rounded-full border border-primary/20 text-sm hover:bg-cream"
              >
                {step === 1 ? "ביטול" : "חזרה"}
              </button>
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="h-12 px-8 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                >
                  המשך
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitBooking}
                  disabled={sending}
                  className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  <CalendarDays size={18} /> {sending ? "שולח…" : "שליחה וקביעה ביומן"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setLightbox(null)}
          >
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={lightbox} alt="" className="max-w-full max-h-full rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
