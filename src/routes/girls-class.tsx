import { heError } from "@/lib/he-errors";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, MapPin, Phone, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/auth";
import { useProfilePrefill } from "@/hooks/use-profile";
import { EmailDatalist } from "@/components/EmailDatalist";
import { submitStudioIntake } from "@/lib/studio-intake.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

// A distinct, softer sub-brand for the girls' class — deliberately pink,
// unlike the rest of the (gray/orange) Sport Plus site, per explicit
// request. Local hex classes on this page only, not a global palette
// change (same pattern as Sweetbaby's own newborn sub-brand page).
export const Route = createFileRoute("/girls-class")({
  head: () => ({
    meta: [
      { title: "חוג התעמלות קרקע וריקוד לילדות | Sport Plus" },
      { name: "description", content: "חוג התעמלות קרקע וריקוד לילדות בבית שמש — חיזוק, קורדינציה, ביטחון עצמי ושמחה. 2 מפגשים בשבוע." },
      { property: "og:title", content: "חוג התעמלות קרקע וריקוד לילדות | Sport Plus" },
      { property: "og:url", content: "https://sportplus.co.il/girls-class" },
    ],
    links: [{ rel: "canonical", href: "https://sportplus.co.il/girls-class" }],
  }),
  component: GirlsClassPage,
});

const PHONE = "058-3258197";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const } }),
};

const programBlocks = [
  {
    title: "קרקע",
    points: ["חיזוק שרירי הכתפיים", "קורדינציה", "עיצוב הגוף", "שיווי משקל טבעי"],
  },
  {
    title: "ריקוד",
    points: ["ביטחון עצמי", "אנרגיה קבוצתית", "שמחה שלא מובנת מאליה", "שחרור הגוף"],
  },
];

type Form = { childName: string; parentName: string; phone: string; email: string; age: string; notes: string; agreed: boolean };
const emptyForm: Form = { childName: "", parentName: "", phone: "", email: "", age: "", notes: "", agreed: false };
const DRAFT_KEY = "sp_girls_class_draft";

function GirlsClassPage() {
  const [form, setForm] = useState<Form>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { user } = useAuth();
  const profile = useProfilePrefill();
  const submitIntake = useServerFn(submitStudioIntake);
  const upd = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!profile.loaded) return;
    setForm((f) => ({ ...f, parentName: f.parentName || profile.fullName, phone: f.phone || profile.phone, email: f.email || profile.email }));
  }, [profile.loaded, profile.fullName, profile.phone, profile.email]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      localStorage.removeItem(DRAFT_KEY);
      setForm((f) => ({ ...f, ...(JSON.parse(raw) as Partial<Form>) }));
    } catch { /* ignore */ }
  }, []);

  const register = async () => {
    if (!form.childName.trim() || !form.parentName.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error("נא למלא את כל הפרטים.");
      return;
    }
    if (!form.agreed) {
      toast.error("נא לאשר את תנאי ההרשמה.");
      return;
    }
    if (!user) {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* ignore */ }
      toast.error("יש להתחבר או להמשיך כאורח כדי לשלוח את ההרשמה.");
      return;
    }
    setSubmitting(true);
    try {
      await submitIntake({
        data: {
          clientName: form.parentName,
          phone: form.phone,
          email: form.email,
          sessionType: "חוג התעמלות קרקע וריקוד לילדות",
          sessionDate: "",
          peopleCount: "",
          babyAge: form.age,
          cameraBrand: "",
          flashExperience: "",
          needProps: "",
          specialRequests: [`שם הילדה: ${form.childName}`, form.notes].filter(Boolean).join(" · "),
          agreed: true,
        },
      });
      setDone(true);
      toast.success("ההרשמה נשלחה! נחזור אלייך בהקדם 💗");
    } catch (e) {
      toast.error(heError(e, "שליחה נכשלה"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-[#fdf3ec] text-[#4a3221]" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "linear-gradient(135deg, #fdf3ec 0%, #f3d3dd 55%, #fbe4d0 100%)" }} />
        <div className="container-page pt-14 pb-12 text-center">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-5 py-2 rounded-full text-sm text-[#4a3221] mb-6 border border-[#4a3221]/10 shadow-sm">
              <Heart size={14} className="fill-[#c23b6d] text-[#c23b6d]" /> חוג בנות · Sport Plus
            </div>
            <h1 className="text-4xl md:text-6xl mb-4 leading-[1.1]" style={{ fontFamily: "'DM Serif Display', serif" }}>
              התעמלות קרקע
              <br />
              <span className="text-[#c23b6d]">וריקוד לילדות.</span>
            </h1>
            <p className="text-lg text-[#4a3221]/80 max-w-xl mx-auto leading-relaxed">
              2 מפגשים בשבוע — חיזוק, קורדינציה, ביטחון עצמי ושמחה.
            </p>
          </motion.div>
        </div>
      </section>

      {/* PROGRAM */}
      <section className="container-page pb-14">
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {programBlocks.map((b, i) => (
            <motion.div
              key={b.title}
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} custom={i} variants={fadeUp}
              className="bg-white rounded-3xl border border-[#4a3221]/10 p-7"
            >
              <div className="h-11 w-11 rounded-full bg-[#f3d3dd] flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5 text-[#c23b6d]" />
              </div>
              <h3 className="text-2xl mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>{b.title}</h3>
              <ul className="space-y-2">
                {b.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-[#4a3221]/80">
                    <Check size={16} className="text-[#c23b6d] shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* REGISTRATION */}
      <section className="container-page pb-16">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
          className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-[#4a3221]/10 p-5 md:p-8 shadow-[0_20px_60px_-30px_rgba(74,50,33,0.25)]"
        >
          {done ? (
            <div className="text-center py-6">
              <div className="h-14 w-14 rounded-full bg-[#f3d3dd] flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-[#c23b6d]" />
              </div>
              <h3 className="text-2xl mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>ההרשמה התקבלה!</h3>
              <p className="text-sm text-[#4a3221]/70">נחזור אלייך בטלפון בהקדם לתיאום פרטים.</p>
            </div>
          ) : (
            <>
              <div className="text-[15px] tracking-[0.18em] uppercase text-[#c23b6d] mb-2">הרשמה</div>
              <h2 className="text-2xl md:text-3xl mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
                הרשמה לחוג
              </h2>
              <p className="text-sm text-[#4a3221]/70 mb-5">נחזור אלייך לתיאום פרטים ותשלום.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="שם הילדה *">
                  <input className={inputCls} value={form.childName} onChange={(e) => upd("childName", e.target.value)} />
                </Field>
                <Field label="גיל">
                  <input className={inputCls} value={form.age} onChange={(e) => upd("age", e.target.value)} />
                </Field>
                <Field label="שם ההורה *">
                  <input className={inputCls} value={form.parentName} onChange={(e) => upd("parentName", e.target.value)} />
                </Field>
                <Field label="טלפון *">
                  <input className={inputCls} dir="ltr" type="tel" value={form.phone} onChange={(e) => upd("phone", e.target.value)} />
                </Field>
                <Field label="אימייל *" full>
                  <input className={inputCls} dir="ltr" type="email" list="email-suggest-girls-class" value={form.email} onChange={(e) => upd("email", e.target.value)} />
                  <EmailDatalist id="email-suggest-girls-class" value={form.email} />
                </Field>
                <Field label="הערות" full>
                  <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => upd("notes", e.target.value)} />
                </Field>
              </div>

              <label className="mt-4 flex items-start gap-2.5 text-xs text-[#4a3221]/85 cursor-pointer leading-relaxed bg-[#f3d3dd]/25 border border-[#f3d3dd]/50 rounded-xl p-3">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#c23b6d]" checked={form.agreed} onChange={(e) => upd("agreed", e.target.checked)} />
                <span><strong>מאשרת</strong> את תנאי ההרשמה לחוג.</span>
              </label>

              <button
                type="button"
                onClick={register}
                disabled={submitting}
                className="mt-5 rounded-full bg-[#c23b6d] hover:bg-[#c23b6d]/90 text-white px-7 py-3.5 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {submitting ? "שולח…" : "שליחת הרשמה"}
              </button>
            </>
          )}
        </motion.div>
      </section>

      {/* CONTACT */}
      <section className="container-page pb-16 text-center">
        <div className="inline-flex flex-wrap justify-center gap-3">
          <a href={`tel:${PHONE}`} dir="ltr" className="inline-flex items-center gap-2 bg-white border border-[#4a3221]/15 text-[#4a3221] px-6 py-3 rounded-full text-sm font-medium hover:bg-[#fdf3ec] transition-colors">
            <Phone size={16} /> {PHONE}
          </a>
          <div className="inline-flex items-center gap-2 bg-white border border-[#4a3221]/15 text-[#4a3221] px-6 py-3 rounded-full text-sm font-medium">
            <MapPin size={16} /> לקיש 8, קומה -1, בית שמש
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const inputCls =
  "w-full rounded-xl bg-white border border-[#4a3221]/15 px-3.5 py-2.5 text-sm text-[#4a3221] outline-none focus:border-[#c23b6d] focus:ring-2 focus:ring-[#f3d3dd]/40 transition-colors";

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs font-semibold text-[#4a3221]/70 tracking-wide">{label}</span>
      {children}
    </label>
  );
}
