import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Dumbbell, Laptop, ArrowLeft, MapPin, Heart } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
// A tightly-cropped copy of the header's logo (that file has a lot of
// transparent padding baked in) — trimmed so its visible right edge lines
// up with the text right below it in this right-aligned RTL heading;
// the header keeps using the original, padded file.
import logo from "@/assets/logo-green-hero.png";

import heroImg from "@/assets/hero-studio.jpg.asset.json";
import { PAGE_IMAGE_KEYS, usePageGalleryWithAspect } from "@/lib/page-images";
import hero0 from "@/assets/home-hero-0.png.asset.json";
import hero1 from "@/assets/home-hero-1.png.asset.json";
import hero3 from "@/assets/home-hero-3.jpg.asset.json";
import { HeroFullBleed } from "@/components/home-hero-variants";

// Placeholder photos until real Sport Plus space/office photos are
// uploaded via /admin/gallery (same admin-managed gallery mechanism as
// the rest of this app) — these are still the inherited Sweetbaby stock
// shots, kept only so the layout has *something* to show meanwhile.
const HERO_SLIDES: string[] = [hero0.url, hero1.url, hero3.url];

const OG_IMAGE = `https://sportplus.co.il${hero0.url}`;

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "ספורט פלוס - השכרת חלל ספורט ומשרד + חוג התעמלות לילדות" },
      { name: "description", content: "ספורט פלוס — השכרת חלל ספורט וסטודיו, השכרת משרד עם מחשב וסינון נטפרי, וחוג התעמלות קרקע וריקוד לילדות בבית שמש." },
      { property: "og:title", content: "ספורט פלוס - השכרת חלל ספורט ומשרד + חוג התעמלות לילדות" },
      { property: "og:description", content: "השכרת חלל ספורט וסטודיו, השכרת משרד עם מחשב וסינון נטפרי, וחוג התעמלות קרקע וריקוד לילדות." },
      { property: "og:url", content: "https://sportplus.co.il/" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:title", content: "ספורט פלוס - השכרת חלל ספורט ומשרד + חוג התעמלות לילדות" },
      { name: "twitter:description", content: "השכרת חלל ספורט וסטודיו, השכרת משרד עם מחשב וסינון נטפרי, וחוג התעמלות קרקע וריקוד לילדות." },
      { name: "twitter:image", content: OG_IMAGE },
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

      {/* HERO — full-bleed image across the whole width, per explicit
          request (not the arch/side-image layout). */}
      <HeroFullBleed slide={slide} setSlide={setSlide} slides={slides} logo={logo} />


      {/* THREE OFFERINGS */}
      <section className="container-page py-16 md:py-24" dir="rtl">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-[#ea7c1e] font-medium mb-3">
              מה תרצו להזמין השבוע
            </div>
            <h2 className="text-4xl md:text-6xl text-[#33363d] max-w-2xl leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
              חלל, משרד או חוג — הכל כאן.
            </h2>
          </div>
          <div className="text-sm text-[#33363d]/70 max-w-xs leading-relaxed">
            הזמנה עצמאית ביומן, אזור אישי וכרטיסיית מועדון — בחרו את מה שמתאים לכם.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Space rental */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} custom={0} variants={fadeUp}>
            <Link to="/studio-rental" className="group block bg-white rounded-[2rem] overflow-hidden border border-[#33363d]/5 h-full flex flex-col hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="h-64 relative overflow-hidden bg-[#e6e4e0]">
                <img src={heroImg.url} alt="חלל הספורט" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute top-4 right-4 h-12 w-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-[#33363d]" />
                </div>
              </div>
              <div className="p-7 flex flex-col flex-grow">
                <div className="text-[11px] tracking-[0.28em] uppercase text-[#ea7c1e] mb-2">01 · Space</div>
                <h3 className="text-2xl text-[#33363d] mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  השכרת חלל ספורט
                </h3>
                <p className="text-sm text-[#33363d]/70 leading-relaxed flex-grow">
                  חלל מאובזר לאימונים, חוגים ואירועים — תאורה נעימה, מראות וציוד בסיסי.
                </p>
                <div className="mt-6 flex items-end justify-between pt-6 border-t border-[#33363d]/10">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#33363d]/50">החל מ-</div>
                    <div className="text-2xl text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>₪70 <span className="text-xs text-[#33363d]/60">/ שעה</span></div>
                  </div>
                  <div className="h-10 w-10 rounded-full border border-[#33363d]/20 flex items-center justify-center group-hover:bg-[#33363d] group-hover:text-[#f4f3f0] transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Office rental */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} custom={1} variants={fadeUp}>
            <Link to="/office-rental" className="group block bg-[#d6d7da]/20 rounded-[2rem] overflow-hidden border border-[#d6d7da]/40 h-full flex flex-col hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="h-64 relative overflow-hidden">
                <img src={hero0.url} alt="חלל המשרד" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute top-4 right-4 h-12 w-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center">
                  <Laptop className="h-5 w-5 text-[#33363d]" />
                </div>
              </div>
              <div className="p-7 flex flex-col flex-grow">
                <div className="text-[11px] tracking-[0.28em] uppercase text-[#ea7c1e] mb-2">02 · Office</div>
                <h3 className="text-2xl text-[#33363d] mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  השכרת משרד
                </h3>
                <p className="text-sm text-[#33363d]/70 leading-relaxed flex-grow">
                  משרד שקט לעבודה — כולל מחשב עם סינון נטפרי, לפי שעה.
                </p>
                <div className="mt-6 flex items-end justify-between pt-6 border-t border-[#33363d]/10">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#33363d]/50">החל מ-</div>
                    <div className="text-2xl text-[#33363d]" style={{ fontFamily: "'DM Serif Display', serif" }}>₪15 <span className="text-xs text-[#33363d]/60">/ שעה</span></div>
                  </div>
                  <div className="h-10 w-10 rounded-full border border-[#33363d]/20 flex items-center justify-center group-hover:bg-[#33363d] group-hover:text-[#f4f3f0] transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Girls' gymnastics + dance class */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} custom={2} variants={fadeUp}>
            <Link to="/girls-class" className="group block bg-white rounded-[2rem] overflow-hidden border border-[#33363d]/5 h-full flex flex-col hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="h-64 relative overflow-hidden bg-[#f5d5cf]">
                <img src={hero1.url} alt="חוג התעמלות לילדות" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute top-4 right-4 h-12 w-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center">
                  <Heart className="h-5 w-5 text-[#33363d]" />
                </div>
              </div>
              <div className="p-7 flex flex-col flex-grow">
                <div className="text-[11px] tracking-[0.28em] uppercase text-[#ea7c1e] mb-2">03 · Girls</div>
                <h3 className="text-2xl text-[#33363d] mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  חוג התעמלות קרקע + ריקוד
                </h3>
                <p className="text-sm text-[#33363d]/70 leading-relaxed flex-grow">
                  חיזוק שרירי הכתפיים, קורדינציה ועיצוב הגוף — יחד עם אנרגיה קבוצתית ושמחה. 2 חוגים בחודש אחד.
                </p>
                <div className="mt-6 flex items-end justify-between pt-6 border-t border-[#33363d]/10">
                  <div className="text-sm font-medium text-[#33363d]">הרשמה לחוג</div>
                  <div className="h-10 w-10 rounded-full border border-[#33363d]/20 flex items-center justify-center group-hover:bg-[#33363d] group-hover:text-[#f4f3f0] transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="container-page pb-16 md:pb-24" dir="rtl">
        <div className="rounded-[2rem] bg-[#e6e4e0]/40 border border-[#33363d]/10 p-8 md:p-12">
          <div className="grid md:grid-cols-4 gap-8 items-center">
            {[
              { icon: Dumbbell, title: "חלל מאובזר", desc: "מזרנים, משקולות וגומיות התנגדות — מוכן לאימון" },
              { icon: Laptop, title: "משרד שקט", desc: "אינטרנט עם סינון נטפרי, מקום נעים לעבודה" },
              { icon: Heart, title: "חוג לילדות", desc: "התעמלות קרקע וריקוד, בליווי מקצועי וחם" },
              { icon: MapPin, title: "בלב בית שמש", desc: "רח׳ לקיש 8, קומה -1 — חנייה נוחה" },
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

      <Footer />
    </div>
  );
}
