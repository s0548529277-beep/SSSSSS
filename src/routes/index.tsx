import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Camera, Home as HomeIcon, Sparkles, ArrowLeft, MapPin, Star, Heart, LayoutGrid } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CountUp } from "@/components/CountUp";
// A tightly-cropped copy of the header's logo (that file has a lot of
// transparent padding baked in) — trimmed so its visible right edge lines
// up with the text right below it in this right-aligned RTL heading;
// the header keeps using the original, padded file.
import logo from "@/assets/logo-green-hero.png";

import heroImg from "@/assets/hero-studio.jpg.asset.json";
import { PAGE_IMAGE_KEYS, usePageGalleryWithAspect } from "@/lib/page-images";
import hero0 from "@/assets/home-hero-0.png.asset.json";
import hero1 from "@/assets/home-hero-1.png.asset.json";
import hero2 from "@/assets/home-hero-2.png.asset.json";
import hero3 from "@/assets/home-hero-3.jpg.asset.json";
import hero4 from "@/assets/home-hero-4.jpg.asset.json";
import hero5 from "@/assets/home-hero-5.jpg.asset.json";
import hero7 from "@/assets/home-hero-7.png.asset.json";
import studioInterior from "@/assets/studio-interior.jpg";
import studioPropsCorner from "@/assets/studio-props-corner.jpg";
import heroScene from "@/assets/hero-scene.jpg";
import { HeroFullBleed, HeroLightArch } from "@/components/home-hero-variants";
import { useHeroVariant } from "@/lib/page-images";

const GALLERY_IMAGES: { src: string; caption: string }[] = [
  { src: hero0.url,             caption: "פינת ניו-בורן ורודה" },
  { src: studioInterior,        caption: "הסטודיו — אור טבעי" },
  { src: hero3.url,             caption: "סט וינטג׳ בבז׳" },
  { src: studioPropsCorner,     caption: "פינת אביזרים סרוגים" },
  { src: hero1.url,             caption: "רכות ופסטל" },
  { src: heroScene,             caption: "סצנת צילום מוכנה" },
  { src: hero4.url,             caption: "משפחה בסטודיו" },
  { src: hero2.url,             caption: "טקסטורות ומקרמה" },
  { src: hero5.url,             caption: "דרמה בשחור" },
  { src: hero7.url,             caption: "פרחים ואור בוקר" },
];

const HERO_SLIDES: string[] = [
  hero0.url,
  hero1.url,
  hero2.url,
  hero3.url,
  hero4.url,
  hero5.url,
  hero7.url,
];


const OG_IMAGE = `https://sportplus.co.il${hero0.url}`;

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "סטודיו לצילום להשכרה - ספורט פלוס - צלמת מיכל סיבוני" },
      { name: "description", content: "סטודיו לצילום להשכרה ספורט פלוס — התמונה הראשונה שלי. סטודיו בוטיק להשכרה בבית שמש השכרת אביזרים לצילום ניוברן חלאקה סמאש קיק ועוד, סשן צילום -הצלמת מיכל סיבוני" },
      { property: "og:title", content: "סטודיו לצילום להשכרה - ספורט פלוס - צלמת מיכל סיבוני" },
      { property: "og:description", content: "סטודיו לצילום להשכרה ספורט פלוס — התמונה הראשונה שלי. סטודיו בוטיק להשכרה בבית שמש השכרת אביזרים לצילום ניוברן חלאקה סמאש קיק ועוד, סשן צילום -הצלמת מיכל סיבוני" },
      { property: "og:url", content: "https://sportplus.co.il/" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:alt", content: "סטודיו Sport Plus — פינת צילום ורודה עם אביזרים מעוצבים" },
      { name: "twitter:title", content: "סטודיו לצילום להשכרה - ספורט פלוס - צלמת מיכל סיבוני" },
      { name: "twitter:description", content: "סטודיו לצילום להשכרה ספורט פלוס — התמונה הראשונה שלי. סטודיו בוטיק להשכרה בבית שמש השכרת אביזרים לצילום ניוברן חלאקה סמאש קיק ועוד, סשן צילום -הצלמת מיכל סיבוני" },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:image:alt", content: "סטודיו Sport Plus — פינת צילום ורודה עם אביזרים מעוצבים" },
    ],
    links: [{ rel: "canonical", href: "https://sportplus.co.il/" }],
  }),
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const } }),
};

function Home() {
  const [slide, setSlide] = useState(0);
  // Hero slides are managed from /admin/gallery (add / remove / reorder,
  // and portrait vs landscape); the bundled list is the fallback.
  const heroGallery = usePageGalleryWithAspect(PAGE_IMAGE_KEYS.homeHero);
  const slides = heroGallery.images.length > 0 ? heroGallery.images : HERO_SLIDES;
  // Which hero design to render — one-click switchable from /admin/gallery,
  // per explicit request, so trying an older design back doesn't need a
  // developer. Defaults to the full-bleed design (the one actually live).
  const { variant: heroVariant } = useHeroVariant();
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % slides.length), 3800);
    return () => clearInterval(id);
  }, [slides.length]);

  // Arriving from another page via the header's "המלצות" link lands here
  // with #testimonials in the URL — scroll to it once mounted.
  useEffect(() => {
    if (window.location.hash === "#testimonials") {
      const t = setTimeout(() => {
        document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f3f0] text-[#33363d] overflow-hidden" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
      <Header />

      {/* HERO — one of two switchable designs (see /admin/gallery),
          per explicit request so switching back to an older design never
          needs a developer. Both variants render the exact same content;
          only the layout/background treatment differs. */}
      {heroVariant === "light-arch" ? (
        <HeroLightArch slide={slide} setSlide={setSlide} slides={slides} logo={logo} aspect={heroGallery.aspect} />
      ) : (
        <HeroFullBleed slide={slide} setSlide={setSlide} slides={slides} logo={logo} />
      )}


      {/* THREE OFFERINGS */}
      <section className="container-page py-16 md:py-24" dir="rtl">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-[#ea7c1e] font-medium mb-3">
              שלוש דרכים לצייר את הזיכרון
            </div>
            <h2 className="text-4xl md:text-6xl text-[#33363d] max-w-2xl leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
              איך תרצי לצלם השבוע?
            </h2>
          </div>
          <div className="text-sm text-[#33363d]/70 max-w-xs leading-relaxed">
            סטודיו מאובזר, צלמת אישית או קטלוג אביזרים — בחרי את השילוב שלך.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Photography */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} custom={0} variants={fadeUp}>
            <Link to="/studio-photography" className="group block bg-white rounded-[2rem] overflow-hidden border border-[#33363d]/5 h-full flex flex-col hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="h-64 relative overflow-hidden bg-[#e6e4e0]">
                <img src={hero3.url} alt="צילום של מיכל סיבוני" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <img src={hero4.url} alt="צילום נוסף של מיכל סיבוני" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" loading="lazy" />
                <div className="absolute top-4 right-4 h-12 w-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center">
                  <Camera className="h-5 w-5 text-[#33363d]" />
                </div>
              </div>
              <div className="p-7 flex flex-col flex-grow">
                <div className="text-[11px] tracking-[0.28em] uppercase text-[#ea7c1e] mb-2">01 · Photography</div>
                <h3 className="text-2xl text-[#33363d] mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  צילומים עם מיכל סיבוני
                </h3>
                <p className="text-sm text-[#33363d]/70 leading-relaxed flex-grow">
                  סשן אישי, רגוע ומקצועי בסטודיו המאובזר — כולל אפשרות לחצי שעה ובניית סטים בהתאמה.
                </p>
                <div className="mt-6 flex items-end justify-between pt-6 border-t border-[#33363d]/10">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#33363d]/50">החל מ-</div>
                    <div className="text-2xl text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>₪300 <span className="text-xs text-[#33363d]/60">/ שעה</span></div>
                  </div>
                  <div className="h-10 w-10 rounded-full border border-[#33363d]/20 flex items-center justify-center group-hover:bg-[#33363d] group-hover:text-[#f4f3f0] transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Studio Rental — actual studio space photos */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} custom={1} variants={fadeUp}>
            <Link to="/studio-rental" className="group block bg-[#d6d7da]/20 rounded-[2rem] overflow-hidden border border-[#d6d7da]/40 h-full flex flex-col hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="h-64 relative overflow-hidden">
                <img src={heroImg.url} alt="חלל הסטודיו" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <img src={hero0.url} alt="פינת רקעים בסטודיו" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" loading="lazy" />
                <div className="absolute top-4 right-4 h-12 w-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center">
                  <HomeIcon className="h-5 w-5 text-[#33363d]" />
                </div>
              </div>
              <div className="p-7 flex flex-col flex-grow">
                <div className="text-[11px] tracking-[0.28em] uppercase text-[#ea7c1e] mb-2">02 · Space</div>
                <h3 className="text-2xl text-[#33363d] mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  השכרת הסטודיו
                </h3>
                <p className="text-sm text-[#33363d]/70 leading-relaxed flex-grow">
                  חלל בוטיק לצלמים — תאורה טבעית, אווירה שקטה ומגוון רקעים. חבילת בוקר ניוברן: 240₪ ל-3 שעות.
                </p>
                <div className="mt-6 flex items-end justify-between pt-6 border-t border-[#33363d]/10">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#33363d]/50">החל מ-</div>
                    <div className="text-2xl text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>₪120 <span className="text-xs text-[#33363d]/60">/ שעה</span></div>
                  </div>
                  <div className="h-10 w-10 rounded-full border border-[#33363d]/20 flex items-center justify-center group-hover:bg-[#33363d] group-hover:text-[#f4f3f0] transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Catalog — same real-photo-topped card shape as the other two,
              instead of a solid dark-green block, so all three "offerings"
              read as one consistent family. */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} custom={2} variants={fadeUp}>
            <Link to="/rental-catalog" className="group block bg-white rounded-[2rem] overflow-hidden border border-[#33363d]/5 h-full flex flex-col hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="h-64 relative overflow-hidden bg-[#e6e4e0]">
                <img src={studioPropsCorner} alt="פינת אביזרים לצילום" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <img src={hero2.url} alt="אביזרים נוספים" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" loading="lazy" />
                <div className="absolute top-4 right-4 h-12 w-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-[#33363d]" />
                </div>
              </div>
              <div className="p-7 flex flex-col flex-grow">
                <div className="text-[11px] tracking-[0.28em] uppercase text-[#ea7c1e] mb-2">03 · Collection</div>
                <h3 className="text-2xl text-[#33363d] mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  קטלוג האביזרים
                </h3>
                <p className="text-sm text-[#33363d]/70 leading-relaxed flex-grow">
                  מעל <CountUp end={400} suffix="" className="font-semibold" /> פריטים ייחודיים לצילומי ניוברן, ילדים והריון — וינטג׳, מקרמה, סרוגים ועבודות יד.
                </p>
                <div className="mt-6 flex items-end justify-between pt-6 border-t border-[#33363d]/10">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#33363d]/50">החל מ-</div>
                    <div className="text-2xl text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>₪50</div>
                  </div>
                  <div className="h-10 w-10 rounded-full border border-[#33363d]/20 flex items-center justify-center group-hover:bg-[#33363d] group-hover:text-[#f4f3f0] transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* GALLERY — a real, asymmetric photo grid (the editorial-portfolio
          side of the two references), using the studio's own bundled
          photos. Real captions, real photos, no icon badges or filled
          color blocks — just the pictures themselves. */}
      <section className="container-page pb-16 md:pb-24" dir="rtl">
        <div className="mb-10">
          <div className="text-xs tracking-[0.3em] uppercase text-[#ea7c1e] font-medium mb-3">
            רגעים מהסטודיו
          </div>
          <h2 className="text-4xl md:text-5xl text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            קצת מהאווירה שלנו
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[9rem] md:auto-rows-[11rem]">
          {GALLERY_IMAGES.map((g, i) => (
            <motion.div
              key={g.src}
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} custom={i % 5} variants={fadeUp}
              className={`group relative overflow-hidden rounded-2xl border border-[#33363d]/10 ${
                i === 0 ? "col-span-2 row-span-2" : i === 5 ? "md:col-span-2" : ""
              }`}
            >
              <img
                src={g.src}
                alt={g.caption}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-3 py-2.5">
                <span className="text-[12px] text-white/90">{g.caption}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* COLLAGE STUDIO — new "קולאזים" category. Links straight to the full
          Studio gallery (/collage-studio), not the older/simpler
          /collage-maker — per explicit follow-up request: the powerful
          editor should be the direct destination, no "want more control?"
          detour needed first. */}
      <section className="container-page pb-16 md:pb-24" dir="rtl">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} custom={0} variants={fadeUp}>
          <Link
            to="/collage-studio"
            className="group block rounded-[2rem] overflow-hidden border border-[#33363d]/5 bg-white hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            <div className="grid md:grid-cols-[1.1fr_1fr] items-center">
              <div className="p-8 md:p-12">
                <div className="text-[11px] tracking-[0.28em] uppercase text-[#ea7c1e] mb-3">04 · Collages</div>
                <h2 className="text-3xl md:text-4xl text-[#33363d] mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  קולאז'ים
                </h2>
                <p className="text-sm text-[#33363d]/70 leading-relaxed max-w-md mb-6">
                  סטודיו קולאז'ים חינמי ומקצועי — תבניות מעוצבות ומוכנות, גרירה חופשית של כמה תמונות ביחד, מדבקות וצבעים, והורדה מוכנה להדפסה. בלי הרשמה.
                </p>
                <span className="inline-flex items-center gap-2 bg-[#33363d] text-[#f4f3f0] px-6 py-3 rounded-full text-sm font-semibold group-hover:bg-[#33363d]/90 transition-colors">
                  לעיצוב קולאז' <ArrowLeft className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="h-56 md:h-full min-h-56 relative overflow-hidden bg-[#e6e4e0] flex items-center justify-center">
                <div className="grid grid-cols-3 gap-2 p-6 w-full max-w-xs">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`rounded-lg bg-white/70 border border-white ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`} />
                  ))}
                </div>
                <div className="absolute top-4 left-4 h-11 w-11 rounded-full bg-white/90 backdrop-blur flex items-center justify-center">
                  <LayoutGrid className="h-5 w-5 text-[#33363d]" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* TRUST STRIP */}
      <section className="container-page pb-16 md:pb-24" dir="rtl">
        <div className="rounded-[2rem] bg-[#e6e4e0]/40 border border-[#33363d]/10 p-8 md:p-12">
          <div className="grid md:grid-cols-4 gap-8 items-center">
            {[
              { icon: Heart, title: "רגעים אמיתיים", desc: "אווירה רגועה שמאפשרת לילד להיות עצמו" },
              { icon: Sparkles, title: "עיצוב מוקפד", desc: "אביזרים בעבודת יד וטקסטורות ייחודיות" },
              { icon: Camera, title: "אמנות ולא רק צילום", desc: "כל תמונה נבנית כמו יצירה" },
              { icon: MapPin, title: "בלב בית שמש", desc: "חנייה נוחה, כניסה נגישה, חלל אינטימי" },
            ].map((f, i) => (
              <motion.div
                key={f.title} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                className="text-[#33363d]"
              >
                <div className="h-12 w-12 rounded-2xl bg-white border border-[#33363d]/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="text-lg font-semibold" style={{ fontFamily: "'DM Serif Display', serif" }}>{f.title}</div>
                <div className="text-sm text-[#33363d]/70 mt-1 leading-relaxed">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="container-page pb-16 md:pb-24 scroll-mt-28" dir="rtl">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[#ea7c1e] font-medium mb-3">
            מה אומרות המשפחות
          </div>
          <h2 className="text-4xl md:text-5xl text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            חוויות מהסטודיו
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              name: "מיכל אזולאי",
              initial: "א",
              text: "הגענו לצילומי ניוברן כשהיינו מותשים אחרי הלידה, ומיכל ידעה בדיוק איך להרגיע את כולנו. התמונות יצאו מעבר לציפיות — ממש יצירות אמנות.",
            },
            {
              name: "חני גוטליב",
              initial: "ג",
              text: "שכרנו את הסטודיו לחלאקה של הבן שלנו והאווירה הייתה חמה ומושקעת. כל פינה מעוצבת עד הפרט האחרון, וקיבלנו תמונות שנשארות איתנו לתמיד.",
            },
            {
              name: "שירה כהן",
              initial: "כ",
              text: "השכרתי אביזרים לצילומי גיל שנה בבית והתהליך היה קל ומהיר — בחירה אונליין, איסוף נוח, והכל הגיע נקי ומטופל. ממליצה בחום!",
            },
          ].map((t, i) => (
            <motion.div
              key={t.name}
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} custom={i} variants={fadeUp}
              className="bg-white rounded-[2rem] p-8 border border-[#33363d]/5 flex flex-col"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-[#e6e4e0] text-[#e6e4e0]" />
                ))}
              </div>
              <p className="text-sm text-[#33363d]/80 leading-relaxed flex-grow">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-6 pt-6 border-t border-[#33363d]/10 flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full bg-[#d6d7da] text-[#33363d] flex items-center justify-center shrink-0"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  {t.initial}
                </div>
                <div className="text-sm font-medium text-[#33363d]">{t.name}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
