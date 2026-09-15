import { heError } from "@/lib/he-errors";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, CreditCard, CalendarDays, Sparkles, ArrowLeft, X, MapPin, Star, AlertTriangle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/auth";
import { useProfilePrefill } from "@/hooks/use-profile";
import { saveContactHandoff } from "@/lib/contact-handoff";
import { EmailDatalist } from "@/components/EmailDatalist";
import { submitStudioIntake } from "@/lib/studio-intake.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrivalDirections } from "@/components/ArrivalDirections";


export const Route = createFileRoute("/studio-rental")({
  head: () => ({
    meta: [
      { title: "השכרת חלל ספורט | Sport Plus" },
      { name: "description", content: "השכרת חלל ספורט בבית שמש — לאימונים אישיים, חוגים ואירועים. מחירון שקוף וקביעת תור אונליין." },
      { property: "og:title", content: "השכרת חלל ספורט | Sport Plus" },
      { property: "og:description", content: "חלל מאובזר, אווירה נעימה — 70 ₪ לשעה." },
      { property: "og:url", content: "https://sportplus.co.il/studio-rental" },
    ],
    links: [{ rel: "canonical", href: "https://sportplus.co.il/studio-rental" }],
  }),
  component: StudioRentalPage,
});

const EMAIL_TO = "s0548529277@gmail.com";

type IntakeForm = {
  clientName: string; phone: string; email: string;
  sessionType: string; sessionDate: string; peopleCount: string; babyAge: string;
  cameraBrand: string; cameraNeed: string; flashExperience: string; needProps: string; specialRequests: string;
  guidance: string;
  agreed: boolean;
};
const emptyForm: IntakeForm = {
  clientName: "", phone: "", email: "", sessionType: "", sessionDate: "",
  peopleCount: "", babyAge: "", cameraBrand: "", cameraNeed: "", flashExperience: "",
  needProps: "", specialRequests: "", guidance: "basic", agreed: false,
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const } }),
};

// Space-rental rules — shown inside the intake modal so signing the
// checkbox = agreeing to everything. Pricing/hours are real (from the
// owner); deposit/cancellation specifics are placeholders — TODO: replace
// with the real policy numbers.
const rulesBlocks: { title: string; items: string[] }[] = [
  { title: "💳 מחירון", items: [
    "70 ₪ לשעה",
    "חצי שעה = חצי מהתעריף",
    "מינימום הזמנה: שעה",
  ]},
  { title: "📅 תשלום וביטולים", items: [
    "פרטי מקדמה/ביטול — לעדכון",
  ]},
  { title: "🧹 סדר וניקיון", items: [
    "החלל נמסר נקי ומסודר — יש להחזירו למצבו המקורי",
  ]},
  { title: "🛡️ אחריות ונזקים", items: [
    "הבטיחות באחריות השוכר/ת בלבד",
    "נזק לציוד/לחלל — באחריות השוכר/ת",
  ]},
];

const quickFacts = [
  { icon: Clock, label: "8:00–12:00 · 16:00–18:00" },
  { icon: CreditCard, label: "70 ₪ לשעה" },
];

const INTAKE_DRAFT_KEY = "sb_studio_intake_draft";

function StudioRentalPage() {

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<IntakeForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const { user } = useAuth();
  const profile = useProfilePrefill();
  const submitIntake = useServerFn(submitStudioIntake);
  const upd = <K extends keyof IntakeForm>(k: K, v: IntakeForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  // Prefill from the customer's personal area.
  useEffect(() => {
    if (!profile.loaded) return;
    setForm((f) => ({
      ...f,
      clientName: f.clientName || profile.fullName,
      phone: f.phone || profile.phone,
      email: f.email || profile.email,
    }));
  }, [profile.loaded, profile.fullName, profile.phone, profile.email]);

  // If the customer had to sign in mid-way, bring them back to exactly
  // where they were — same form, same answers.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(INTAKE_DRAFT_KEY);
      if (!raw) return;
      localStorage.removeItem(INTAKE_DRAFT_KEY);
      setForm((f) => ({ ...f, ...(JSON.parse(raw) as Partial<IntakeForm>) }));
      setShowForm(true);
    } catch { /* ignore */ }
  }, []);





  const sendIntake = async () => {
    if (!form.clientName.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error("נא למלא שם, טלפון ואימייל.");
      return;
    }
    if (!form.sessionType.trim()) {
      toast.error("נא לבחור את מטרת השימוש בחלל.");
      return;
    }
    if (!form.agreed) {
      toast.error("יש לאשר את תנאי השימוש בחלל לפני השליחה.");
      return;
    }
    if (!user) {
      try { localStorage.setItem(INTAKE_DRAFT_KEY, JSON.stringify(form)); } catch { /* ignore */ }
      toast.error("יש להתחבר או להמשיך כאורח — נחזור בדיוק לכאן.");
      nav({ to: "/auth", search: { redirect: "/studio-rental" } });
      return;
    }

    setSubmitting(true);
    try {
      await submitIntake({
        data: {
          clientName: form.clientName,
          phone: form.phone,
          email: form.email,
          sessionType: form.sessionType,
          sessionDate: "",
          peopleCount: "",
          babyAge: "",
          cameraBrand: "",
          flashExperience: "",
          needProps: "",
          specialRequests: form.specialRequests,
          agreed: true,
        },
      });
      saveContactHandoff({
        fullName: form.clientName,
        phone: form.phone,
        email: form.email,
        sessionType: form.sessionType,
        guidance: form.guidance,
      });
      toast.success("ההסכם נשמר ✓ ממשיכות לשלב 2 — בחירת תאריך ושעה ביומן.");
      setShowForm(false);
      nav({ to: "/booking" });
    } catch (e) {
      toast.error(heError(e, "שליחה נכשלה"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f3f0] text-[#33363d]" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden" dir="rtl">
        <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />

        <div className="relative container-page pt-6 pb-8">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-1.5 border border-[#33363d]/10">
              <Star className="h-3.5 w-3.5 fill-[#d6d7da] text-[#d6d7da]" />
              <span className="text-[15px] tracking-[0.18em] uppercase text-[#33363d]/70 font-medium">Space Rental · בית שמש</span>
            </div>
            <h1 className="mt-4 text-[2.4rem] leading-[1.05] md:text-[3.6rem] md:leading-[1] text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>
              השכרת <em className="not-italic text-[#ea7c1e]">חלל הספורט</em>
            </h1>
            <p className="mt-3 text-base text-[#33363d]/75 max-w-2xl leading-relaxed">
              חלל מאובזר לאימונים אישיים, חוגים ואירועים — מחירון שקוף, יומן פתוח.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {quickFacts.map(({ icon: Icon, label }) => (
                <div key={label} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-3.5 py-1.5 rounded-full border border-[#33363d]/10 text-xs text-[#33363d]/75">
                  <Icon className="h-3.5 w-3.5 text-[#ea7c1e]" />
                  <span>{label}</span>
                </div>
              ))}
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-3.5 py-1.5 rounded-full border border-[#33363d]/10 text-xs text-[#33363d]/75">
                <MapPin className="h-3.5 w-3.5 text-[#ea7c1e]" />
                <span>לקיש 8, קומה -1</span>
              </div>
           </div>
          </motion.div>
        </div>
      </section>


      {/* PRICING */}
      <section className="container-page pb-6" dir="rtl">
        <div className="max-w-md mx-auto">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} custom={0} variants={fadeUp}
            className="bg-white rounded-2xl border border-[#33363d]/10 px-4 py-5"
          >
            <div>
              <div className="text-[14px] tracking-[0.16em] uppercase text-[#ea7c1e] mb-1">Pricing</div>
              <h3 className="text-lg text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>שעתי</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>₪70</span>
                <span className="text-xs text-[#33363d]/60">/ שעה</span>
              </div>
              <p className="mt-2 text-[14px] text-[#33363d]/75">חצאי שעות בחישוב יחסי · מינימום שעה</p>
              <button type="button" onClick={() => setShowForm(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#33363d] text-[#f4f3f0] px-4 py-2 text-xs font-semibold">
                לקביעת מועד <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ONLINE PAYMENT */}
    


      {/* Guidance packages are chosen inside the intake form only */}


      {/* BOOKING PROCESS */}
      <section className="container-page pb-14" dir="rtl">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
          className="max-w-4xl mx-auto bg-white rounded-[2rem] border border-[#33363d]/5 overflow-hidden shadow-[0_20px_60px_-30px_rgba(45,61,43,0.35)]"
        >
          <div className="px-4 py-6 md:px-6 md:py-9">
            <div className="text-center">
              <div className="text-[15px] tracking-[0.18em] uppercase text-[#ea7c1e] mb-2">Booking Process</div>
              <h2 className="text-2xl md:text-3xl text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                איך קובעים תור? 3 שלבים
              </h2>
              <p className="mt-2 text-sm text-[#33363d]/70 max-w-xl mx-auto leading-relaxed">
                התהליך כולו מתבצע כאן באתר — בסיום תקבלי מייל אחד מסודר עם ההסכם, פרטי השריון והתשלום.
              </p>
            </div>

            <div className="mt-7 grid md:grid-cols-3 gap-3 md:gap-4">
              {[
                { n: "01", title: "שאלון ואישור", desc: "ממלאים פרטים בסיסיים, מטרת השימוש ואישור תנאי החלל." },
                { n: "02", title: "קביעת יומן", desc: "בוחרים תאריך ושעה פנויים ביומן החי, ומשך השהות." },
                { n: "03", title: "תשלום", desc: "70 ₪ לשעה — פרטי תשלום ומקדמה ייקבעו איתך." },
              ].map((s) => (
                <div key={s.n} className="rounded-2xl border border-[#33363d]/10 bg-white p-5">
                  <div className="text-[14px] tracking-[0.18em] uppercase text-[#ea7c1e] mb-1">Step {s.n}</div>
                  <h3 className="text-lg text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>{s.title}</h3>
                  <p className="mt-1.5 text-[15px] text-[#33363d]/75 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3 items-start bg-[#f4f3f0] border border-[#33363d]/10 rounded-2xl p-4">
              <AlertTriangle className="h-5 w-5 text-[#8b3a2a] mt-0.5 shrink-0" />
              <div className="text-sm text-[#33363d]/85 leading-relaxed">
                השאלון הוא השלב הראשון — מיד לאחר האישור נפתח היומן לבחירת שעה. אישור הטופס = הסכמה מלאה לתנאי החלל.
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3">
              <motion.button
                type="button"
                onClick={() => setShowForm(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#e6e4e0] via-[#f8c4c0] to-[#e6e4e0] text-[#33363d] px-12 py-5 text-[15px] font-bold shadow-[0_12px_40px_-12px_rgba(245,213,207,0.85)] hover:shadow-[0_18px_50px_-14px_rgba(245,213,207,1)] transition-all overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/60 text-[#ea7c1e]">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <span className="relative">להתחיל את התהליך · שאלון וקביעת יומן</span>
                <Sparkles className="relative h-4 w-4 text-[#ea7c1e] opacity-70 group-hover:opacity-100 transition-opacity" />
              </motion.button>
              <span className="text-[14px] text-[#33363d]/55 font-medium">שלב 1 מתוך 3 · לוקח כדקה</span>
            </div>

            <p className="mt-5 text-xs text-[#33363d]/60 text-center">
              לשאלות: <a href={`mailto:${EMAIL_TO}`} className="font-semibold text-[#33363d] underline decoration-[#e6e4e0] decoration-2 underline-offset-4">{EMAIL_TO}</a>
            </p>
          </div>
        </motion.div>


      </section>
      <section className="container-page pb-12" dir="rtl">
        <ArrivalDirections className="max-w-4xl mx-auto" />
      </section>

      <Footer />

      {/* INTAKE MODAL — includes the full studio rules */}
      {showForm && (
        <div
          className="fixed inset-0 bg-[#33363d]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 md:p-6"
          onClick={() => setShowForm(false)}
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#f4f3f0] rounded-[1.75rem] px-4 py-5 md:px-6 md:py-8 max-w-3xl w-full max-h-[94vh] overflow-y-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "'Fira Sans', sans-serif" }}
          >
            <button
              onClick={() => setShowForm(false)}
              aria-label="סגירה"
              className="absolute top-3 left-3 h-10 w-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-[#33363d]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-[15px] tracking-[0.18em] uppercase text-[#ea7c1e] mb-2">Coordination</div>
            <h2 className="text-2xl md:text-3xl text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>
              הסכם תיאום ציפיות
            </h2>
            <p className="mt-2 text-sm text-[#33363d]/75 leading-relaxed">
              שלב 1 מתוך 3. <strong>אישור ההסכם הוא תנאי לפתיחת היומן</strong> — מיד לאחר השליחה נעבור לבחירת תאריך ושעה.
            </p>

            {/* RULES — full agreement text */}
            <div className="mt-5 bg-white rounded-2xl border border-[#33363d]/10 p-4 md:p-5 max-h-72 overflow-y-auto">
              <h3 className="text-lg text-[#33363d] mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
                כללי הסטודיו — לקריאה לפני האישור
              </h3>
              <div className="grid gap-4">
                {rulesBlocks.map((block) => (
                  <div key={block.title}>
                    <div className="text-sm font-semibold text-[#33363d] mb-1.5">{block.title}</div>
                    <ul className="space-y-1 text-[15px] text-[#33363d]/80">
                      {block.items.map((it) => (
                        <li key={it} className="flex items-start gap-1.5">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-[#d6d7da] shrink-0" />
                          <span className="leading-relaxed">{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* FORM */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="שם מלא *">
                <input className={inputCls} value={form.clientName} onChange={(e) => upd("clientName", e.target.value)} />
              </Field>
              <Field label="טלפון *">
                <input className={inputCls} dir="ltr" type="tel" value={form.phone} onChange={(e) => upd("phone", e.target.value)} />
              </Field>
              <Field label="אימייל *">
                <input className={inputCls} dir="ltr" type="email" list="email-suggest-studio-rental" value={form.email} onChange={(e) => upd("email", e.target.value)} />
                <EmailDatalist id="email-suggest-studio-rental" value={form.email} />
              </Field>
              <Field label="מטרת השימוש בחלל *">
                <select className={inputCls} value={form.sessionType} onChange={(e) => upd("sessionType", e.target.value)} required>
                  <option value="">בחרו…</option>
                  <option>אימון אישי</option>
                  <option>חוג / קבוצה</option>
                  <option>אירוע</option>
                  <option>אחר</option>
                </select>
              </Field>

              <Field label="בקשות מיוחדות / הערות" full>
                <textarea className={inputCls} rows={3} value={form.specialRequests} onChange={(e) => upd("specialRequests", e.target.value)} />
              </Field>
            </div>


            <label className="mt-4 flex items-start gap-2.5 text-xs text-[#33363d]/85 cursor-pointer leading-relaxed bg-[#d6d7da]/20 border border-[#d6d7da]/40 rounded-xl p-3">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[#ea7c1e]"
                checked={form.agreed}
                onChange={(e) => upd("agreed", e.target.checked)}
              />
              <span><strong>קראתי והסכמתי</strong> לתנאי השימוש בחלל המפורטים מעלה (מחירון, ניקיון, אחריות ונזקים).</span>
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={sendIntake}
                disabled={submitting}
                className="rounded-full bg-[#33363d] hover:bg-[#1f2b1e] text-[#f4f3f0] px-7 py-3.5 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? "שומר…" : "אישור והמשך ליומן →"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full border border-[#33363d]/25 text-[#33363d] px-7 py-3.5 text-sm font-medium hover:bg-white/50 transition-colors"
              >
                ביטול
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl bg-white border border-[#33363d]/15 px-3.5 py-2.5 text-sm text-[#33363d] outline-none focus:border-[#ea7c1e] focus:ring-2 focus:ring-[#d6d7da]/30 transition-colors";

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs font-semibold text-[#33363d]/70 tracking-wide">{label}</span>
      {children}
    </label>
  );
}
