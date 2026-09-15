import { heError } from "@/lib/he-errors";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, CreditCard, Wifi, ArrowLeft, MapPin, Star, ShieldCheck } from "lucide-react";
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

export const Route = createFileRoute("/office-rental")({
  head: () => ({
    meta: [
      { title: "השכרת משרד | Sport Plus" },
      { name: "description", content: "השכרת משרד שקט בבית שמש, כולל מחשב עם סינון נטפרי — 15 ₪ לשעה. קביעת תור אונליין." },
      { property: "og:title", content: "השכרת משרד | Sport Plus" },
      { property: "og:description", content: "משרד שקט לעבודה, כולל מחשב עם סינון נטפרי — 15 ₪ לשעה." },
      { property: "og:url", content: "https://sportplus.co.il/office-rental" },
    ],
    links: [{ rel: "canonical", href: "https://sportplus.co.il/office-rental" }],
  }),
  component: OfficeRentalPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const } }),
};

const quickFacts = [
  { icon: Clock, label: "8:00–12:00 · 16:00–18:00" },
  { icon: CreditCard, label: "15 ₪ לשעה" },
  { icon: Wifi, label: "אינטרנט עם סינון נטפרי" },
];

type Form = { clientName: string; phone: string; email: string; specialRequests: string; agreed: boolean };
const emptyForm: Form = { clientName: "", phone: "", email: "", specialRequests: "", agreed: false };
const DRAFT_KEY = "sp_office_intake_draft";

function OfficeRentalPage() {
  const [form, setForm] = useState<Form>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const { user } = useAuth();
  const profile = useProfilePrefill();
  const submitIntake = useServerFn(submitStudioIntake);
  const upd = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!profile.loaded) return;
    setForm((f) => ({
      ...f,
      clientName: f.clientName || profile.fullName,
      phone: f.phone || profile.phone,
      email: f.email || profile.email,
    }));
  }, [profile.loaded, profile.fullName, profile.phone, profile.email]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      localStorage.removeItem(DRAFT_KEY);
      setForm((f) => ({ ...f, ...(JSON.parse(raw) as Partial<Form>) }));
    } catch { /* ignore */ }
  }, []);

  const sendIntake = async () => {
    if (!form.clientName.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error("נא למלא שם, טלפון ואימייל.");
      return;
    }
    if (!form.agreed) {
      toast.error("יש לאשר את תנאי השימוש במשרד לפני השליחה.");
      return;
    }
    if (!user) {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* ignore */ }
      toast.error("יש להתחבר או להמשיך כאורח — נחזור בדיוק לכאן.");
      nav({ to: "/auth", search: { redirect: "/office-rental" } });
      return;
    }
    setSubmitting(true);
    try {
      await submitIntake({
        data: {
          clientName: form.clientName,
          phone: form.phone,
          email: form.email,
          sessionType: "השכרת משרד",
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
      saveContactHandoff({ fullName: form.clientName, phone: form.phone, email: form.email, sessionType: "השכרת משרד", guidance: "" });
      toast.success("הפרטים נשמרו ✓ ממשיכים לבחירת תאריך ושעה ביומן.");
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
              <span className="text-[15px] tracking-[0.18em] uppercase text-[#33363d]/70 font-medium">Office Rental · בית שמש</span>
            </div>
            <h1 className="mt-4 text-[2.4rem] leading-[1.05] md:text-[3.6rem] md:leading-[1] text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>
              השכרת <em className="not-italic text-[#ea7c1e]">משרד</em>
            </h1>
            <p className="mt-3 text-base text-[#33363d]/75 max-w-2xl leading-relaxed">
              משרד שקט לעבודה — כולל מחשב עם סינון נטפרי, לפי שעה.
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
      <section className="container-page pb-10" dir="rtl">
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-[#33363d]/10 px-4 py-5">
          <div className="text-[14px] tracking-[0.16em] uppercase text-[#ea7c1e] mb-1">Pricing</div>
          <h3 className="text-lg text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>שעתי</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>₪15</span>
            <span className="text-xs text-[#33363d]/60">/ שעה</span>
          </div>
          <p className="mt-2 text-[14px] text-[#33363d]/75 flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5 text-[#ea7c1e]" /> כולל מחשב עם סינון נטפרי
          </p>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="container-page pb-14" dir="rtl">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
          className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-[#33363d]/5 p-5 md:p-8 shadow-[0_20px_60px_-30px_rgba(45,61,43,0.35)]"
        >
          <div className="text-[15px] tracking-[0.18em] uppercase text-[#ea7c1e] mb-2">Booking</div>
          <h2 className="text-2xl md:text-3xl text-[#33363d] mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
            פרטים לשריון
          </h2>
          <p className="text-sm text-[#33363d]/70 mb-5">לאחר השליחה נעבור לבחירת תאריך ושעה ביומן.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="שם מלא *">
              <input className={inputCls} value={form.clientName} onChange={(e) => upd("clientName", e.target.value)} />
            </Field>
            <Field label="טלפון *">
              <input className={inputCls} dir="ltr" type="tel" value={form.phone} onChange={(e) => upd("phone", e.target.value)} />
            </Field>
            <Field label="אימייל *" full>
              <input className={inputCls} dir="ltr" type="email" list="email-suggest-office-rental" value={form.email} onChange={(e) => upd("email", e.target.value)} />
              <EmailDatalist id="email-suggest-office-rental" value={form.email} />
            </Field>
            <Field label="הערות" full>
              <textarea className={inputCls} rows={3} value={form.specialRequests} onChange={(e) => upd("specialRequests", e.target.value)} />
            </Field>
          </div>

          <label className="mt-4 flex items-start gap-2.5 text-xs text-[#33363d]/85 cursor-pointer leading-relaxed bg-[#d6d7da]/20 border border-[#d6d7da]/40 rounded-xl p-3">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#ea7c1e]" checked={form.agreed} onChange={(e) => upd("agreed", e.target.checked)} />
            <span className="flex items-start gap-1.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#ea7c1e]" />
              <span><strong>קראתי והסכמתי</strong> לתנאי השימוש במשרד (מחירון, ניקיון, אחריות ונזקים).</span>
            </span>
          </label>

          <button
            type="button"
            onClick={sendIntake}
            disabled={submitting}
            className="mt-5 rounded-full bg-[#33363d] hover:bg-[#1f2b1e] text-[#f4f3f0] px-7 py-3.5 text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {submitting ? "שומר…" : "המשך ליומן"} <ArrowLeft className="h-4 w-4" />
          </button>
        </motion.div>
      </section>

      <section className="container-page pb-12" dir="rtl">
        <ArrivalDirections className="max-w-4xl mx-auto" />
      </section>

      <Footer />
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
