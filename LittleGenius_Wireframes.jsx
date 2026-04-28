import { useState } from "react";

const screens = [
  { id: "home", label: "🏠 Home", short: "Home" },
  { id: "listing", label: "🛍️ Product Listing", short: "Listing" },
  { id: "detail", label: "🔍 Product Detail", short: "Detail" },
  { id: "custom", label: "🎨 Custom Order", short: "Custom" },
];

const PALETTE = {
  bg: "#0e0b07",
  card: "#161208",
  border: "#2a2010",
  accent: "#f5a623",
  accentSoft: "#ffd580",
  teal: "#4ecdc4",
  pink: "#ff6b9d",
  green: "#7eda9c",
  muted: "rgba(255,255,255,0.18)",
  dim: "rgba(255,255,255,0.08)",
  text: "#f5f0e8",
  textMuted: "rgba(245,240,232,0.45)",
  textDim: "rgba(245,240,232,0.25)",
};

const tag = (label, color = PALETTE.accent, bg = "transparent") => (
  <span style={{
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "4px",
    border: `1px solid ${color}`,
    color,
    background: bg || `${color}18`,
    fontSize: "9px",
    fontFamily: "'Space Mono', monospace",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontWeight: 700,
    whiteSpace: "nowrap",
  }}>{label}</span>
);

const Section = ({ title, note, children, accent = PALETTE.accent, noPad }) => (
  <div style={{
    border: `1px solid ${PALETTE.border}`,
    borderRadius: "10px",
    marginBottom: "10px",
    overflow: "hidden",
  }}>
    <div style={{
      background: `${accent}14`,
      borderBottom: `1px solid ${PALETTE.border}`,
      padding: "8px 14px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "8px",
      flexWrap: "wrap",
    }}>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: accent, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {title}
      </span>
      {note && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "9px", color: PALETTE.textDim, letterSpacing: "0.05em" }}>{note}</span>}
    </div>
    <div style={{ padding: noPad ? 0 : "12px 14px" }}>{children}</div>
  </div>
);

const Row = ({ children, gap = 8, style = {} }) => (
  <div style={{ display: "flex", gap, flexWrap: "wrap", marginBottom: "6px", ...style }}>{children}</div>
);

const Box = ({ label, note, width = "auto", color, flex, dashed, height, center }) => (
  <div style={{
    flex: flex || "0 0 auto",
    width: flex ? undefined : width,
    minHeight: height || "36px",
    border: `${dashed ? "1.5px dashed" : "1px solid"} ${color || PALETTE.border}`,
    borderRadius: "6px",
    background: color ? `${color}10` : PALETTE.dim,
    padding: "6px 10px",
    display: "flex",
    flexDirection: "column",
    justifyContent: center ? "center" : "flex-start",
    alignItems: center ? "center" : "flex-start",
    gap: "3px",
  }}>
    {label && <span style={{ fontSize: "10px", color: PALETTE.text, fontFamily: "'Space Mono', monospace", lineHeight: 1.4, textAlign: center ? "center" : "left", whiteSpace: "pre-line" }}>{label}</span>}
    {note && <span style={{ fontSize: "9px", color: PALETTE.textDim, fontFamily: "'Space Mono', monospace", lineHeight: 1.3, textAlign: center ? "center" : "left" }}>{note}</span>}
  </div>
);

const CTABox = ({ label, type = "primary", width }) => {
  const styles = {
    primary: { bg: PALETTE.accent, color: "#0e0b07", border: PALETTE.accent },
    secondary: { bg: "transparent", color: PALETTE.accent, border: PALETTE.accent },
    ghost: { bg: "transparent", color: PALETTE.textMuted, border: PALETTE.border },
    teal: { bg: "transparent", color: PALETTE.teal, border: PALETTE.teal },
    pink: { bg: PALETTE.pink + "22", color: PALETTE.pink, border: PALETTE.pink },
  };
  const s = styles[type] || styles.primary;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "7px 14px", borderRadius: "6px",
      border: `1.5px solid ${s.border}`,
      background: s.bg, color: s.color,
      fontFamily: "'Space Mono', monospace", fontSize: "9px", fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap",
      width: width || "auto",
    }}>{label}</div>
  );
};

const Divider = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "10px 0" }}>
    <div style={{ flex: 1, height: "1px", background: PALETTE.border }} />
    {label && <span style={{ fontSize: "9px", color: PALETTE.textDim, fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap" }}>{label}</span>}
    <div style={{ flex: 1, height: "1px", background: PALETTE.border }} />
  </div>
);

const Annotation = ({ text }) => (
  <div style={{
    display: "flex", gap: "6px", alignItems: "flex-start",
    padding: "5px 10px", background: `${PALETTE.teal}0d`,
    border: `1px solid ${PALETTE.teal}30`, borderRadius: "5px",
    marginTop: "6px",
  }}>
    <span style={{ color: PALETTE.teal, fontSize: "9px", marginTop: "1px" }}>💡</span>
    <span style={{ fontSize: "9px", color: `${PALETTE.teal}cc`, fontFamily: "'Space Mono', monospace", lineHeight: 1.5 }}>{text}</span>
  </div>
);

const MobileNote = ({ text }) => (
  <div style={{
    display: "flex", gap: "6px", alignItems: "flex-start",
    padding: "5px 10px", background: `${PALETTE.pink}0d`,
    border: `1px solid ${PALETTE.pink}30`, borderRadius: "5px",
    marginTop: "6px",
  }}>
    <span style={{ fontSize: "9px", marginTop: "1px" }}>📱</span>
    <span style={{ fontSize: "9px", color: `${PALETTE.pink}cc`, fontFamily: "'Space Mono', monospace", lineHeight: 1.5 }}>{text}</span>
  </div>
);

// ─── SCREEN: HOME ────────────────────────────────────────────────────────────
function HomeScreen() {
  return (
    <div>

      {/* NAV */}
      <Section title="01 — Sticky Navigation Bar" note="height: 56px · position: fixed top · z-index: 100" accent={PALETTE.accent}>
        <Row>
          <Box label="🧸 LittleGenius LAB" note="Logo + wordmark · left aligned" width="200px" color={PALETTE.accent} />
          <Box label="Shop  |  Custom  |  How It Works  |  About" note="Desktop nav links · hidden on mobile" flex="1" />
          <Box label="🔍  🤍  🛒 (2)" note="Search · Wishlist · Cart icon with count badge · right side" width="130px" color={PALETTE.teal} />
        </Row>
        <Row>
          <Box label="☰  LittleGenius LAB  [Cart 🛒]" note="MOBILE: Hamburger left · logo centre · cart right" flex="1" color={PALETTE.pink} />
        </Row>
        <Annotation text="Sticky on scroll. On mobile, cart icon shows item count bubble. Nav background becomes opaque white after 80px scroll." />
      </Section>

      {/* HERO */}
      <Section title="02 — Hero Section" note="Full viewport height on desktop · 85vh on mobile" accent={PALETTE.accentSoft}>
        <Row gap={10}>
          <div style={{ flex: 2, minWidth: "200px" }}>
            <Box label="EYEBROW TAG" note="🇮🇳  Made in Tamil Nadu, India" width="100%" color={PALETTE.teal} height="28px" />
            <div style={{ height: 6 }} />
            <Box label="Where Imagination Gets a Shape 🧸" note="H1 · Display font · 52px desktop / 32px mobile · 2-line max" width="100%" color={PALETTE.accent} height="72px" center />
            <div style={{ height: 6 }} />
            <Box label="Handcrafted 3D printed toys — animals, robots, chibi figurines, and toys made just from your photos." note="Subheadline · 16px · max 2 lines · colour: muted white" width="100%" height="44px" />
            <div style={{ height: 8 }} />
            <Row>
              <CTABox label="Explore the Magic →" type="primary" />
              <CTABox label="Design My Custom Toy" type="secondary" />
            </Row>
            <div style={{ height: 8 }} />
            <Box label="⭐ 4.9  ·  500+ families  ·  Child-safe PLA  ·  Ships in 2 days" note="Social proof micro-row · 12px · below CTAs" width="100%" height="28px" />
          </div>
          <div style={{ flex: 1.2, minWidth: "160px" }}>
            <Box label="[ HERO IMAGE ]" note="Full-bleed product photo · Chubby elephant or chibi on colourful background · slight right-tilt for energy" width="100%" height="220px" color={PALETTE.accentSoft} center />
          </div>
        </Row>
        <MobileNote text="Mobile: Image stacks ABOVE text. Headline 32px. Both CTAs full-width stacked. Image is 50vw height, object-fit: cover." />
      </Section>

      {/* TRUST BAR */}
      <Section title="03 — Trust Ticker Bar" note="Full width · auto-scroll · background: accent · text: dark" accent={PALETTE.green}>
        <Box
          label="🇮🇳 Made in Tamil Nadu  ·  🧸 Child-Safe PLA  ·  📦 Ships in 2 Days  ·  ⭐ 4.9 Rating  ·  🎁 Gift Wrapping Available  ·  🔄 7-Day Returns  ·  [repeats]"
          note="Marquee / ticker · infinite scroll animation · 13px · accent background · dark text · no pause"
          width="100%" height="36px" color={PALETTE.green}
        />
        <Annotation text="Use CSS marquee animation. This bar builds instant trust for first-time visitors — never remove it. Keep it a single line, always visible." />
      </Section>

      {/* CATEGORIES */}
      <Section title="04 — Shop by Category" note="2×2 grid mobile · 4-column desktop" accent={PALETTE.teal}>
        <Box label="SECTION HEADLINE" note='"Pick Your World"  ·  H2 · centred · 28px' width="100%" height="32px" color={PALETTE.teal} center />
        <div style={{ height: 8 }} />
        <Row gap={8}>
          {[
            { icon: "🐘", label: "Animal Kingdom", note: "Rs. 300–500", color: PALETTE.green },
            { icon: "🤖", label: "Robot Crew", note: "Rs. 400–700", color: PALETTE.teal },
            { icon: "🧸", label: "Chibi Squad", note: "Rs. 500–900", color: PALETTE.pink },
            { icon: "🎨", label: "Made Just for You", note: "From Rs. 800", color: PALETTE.accent },
          ].map(c => (
            <div key={c.label} style={{ flex: "1 1 80px" }}>
              <Box label={`${c.icon}\n${c.label}`} note={c.note} color={c.color} height="90px" center />
            </div>
          ))}
        </Row>
        <MobileNote text="Mobile: 2×2 grid. Each card is 160×160px. Icon 36px. Label bold 13px. Tap → goes to category listing page." />
      </Section>

      {/* BESTSELLERS */}
      <Section title="05 — Bestsellers Horizontal Scroll" note="Horizontal scroll on mobile · 4-col grid desktop" accent={PALETTE.accent}>
        <Box label="SECTION HEADLINE" note='"Fresh Off the Printer 🔥"  ·  H2 left-aligned  +  "View All →" link right' width="100%" height="32px" color={PALETTE.accent} />
        <div style={{ height: 8 }} />
        <Row gap={8}>
          {[
            { name: "Chubby Elephant", price: "Rs. 400", badge: "🔥 Bestseller" },
            { name: "Captain Bolt Robot", price: "Rs. 550", badge: "✨ New" },
            { name: "Chibi Figurine", price: "Rs. 700", badge: "🎁 Gift Pick" },
            { name: "Dragon Articulated", price: "Rs. 750", badge: "🔥 Bestseller" },
          ].map(p => (
            <div key={p.name} style={{ flex: "1 1 100px" }}>
              <div style={{ border: `1px solid ${PALETTE.border}`, borderRadius: "8px", overflow: "hidden" }}>
                <Box label={`[ PRODUCT IMAGE ]`} note="Square 1:1 · product on white/pastel bg" color={PALETTE.accentSoft} height="90px" center noPad />
                <div style={{ padding: "8px" }}>
                  <div style={{ marginBottom: "3px" }}>{tag(p.badge, PALETTE.accent)}</div>
                  <Box label={p.name} note={p.price} width="100%" height="38px" />
                  <div style={{ height: 5 }} />
                  <CTABox label="Add to Cart" type="primary" width="100%" />
                </div>
              </div>
            </div>
          ))}
        </Row>
        <MobileNote text="Mobile: horizontally scrollable row, cards 160px wide, no wrap. Slight peek of next card signals scroll. 'View All' above the row." />
      </Section>

      {/* HOW IT WORKS */}
      <Section title="06 — How It Works" note="3-step · icon + text · centred" accent={PALETTE.green}>
        <Box label="SECTION HEADLINE" note='"From Idea to Your Hands in 3 Steps"  ·  centred H2' width="100%" height="30px" center color={PALETTE.green} />
        <div style={{ height: 8 }} />
        <Row gap={8}>
          {[
            { n: "01", icon: "🛒", step: "Browse & Pick", note: "Choose from animals, robots, chibis or describe your own idea" },
            { n: "02", icon: "🖨️", step: "We 3D Print It", note: "Your toy is printed overnight with child-safe PLA in our Tamil Nadu studio" },
            { n: "03", icon: "📦", step: "Delivered to Door", note: "Packed with care and shipped in 2–5 business days" },
          ].map(s => (
            <div key={s.n} style={{ flex: "1 1 120px" }}>
              <Box label={`${s.icon}  Step ${s.n}\n${s.step}`} note={s.note} color={PALETTE.green} height="90px" center />
            </div>
          ))}
        </Row>
        <Annotation text="Connector arrows between steps on desktop. On mobile, steps stack vertically with a dotted line connecting them." />
      </Section>

      {/* CUSTOM ORDER CTA BAND */}
      <Section title="07 — Custom Order CTA Band" note="Full-width · dark background · high contrast · conversion section" accent={PALETTE.pink}>
        <Row gap={10}>
          <div style={{ flex: 1, minWidth: "160px" }}>
            <Box label="[ BEFORE / AFTER IMAGE ]" note="Customer photo → finished toy render side-by-side" color={PALETTE.pink} height="100px" center />
          </div>
          <div style={{ flex: 2, minWidth: "200px" }}>
            <Box label="Turn Any Memory into a Toy 🎨" note="H2 · 26px · white · bold" width="100%" height="36px" color={PALETTE.pink} />
            <div style={{ height: 5 }} />
            <Box label="Send us a photo — of your child, pet, or character. We'll 3D print a one-of-a-kind figurine just for you." note="Body · 14px · muted" width="100%" height="44px" />
            <div style={{ height: 8 }} />
            <Row>
              <CTABox label="Start My Custom Toy →" type="pink" />
              <CTABox label="Chat on WhatsApp" type="ghost" />
            </Row>
            <div style={{ height: 6 }} />
            <Box label="✅ Free design preview  ·  ✅ 2 revisions  ·  ✅ Ships in 6–7 days  ·  Starting Rs. 800" note="Trust micro-row · 11px" width="100%" height="26px" />
          </div>
        </Row>
        <MobileNote text="Mobile: image full-width at top, then text + CTAs stacked below. Both CTAs full-width. This section must appear above the fold on first scroll." />
      </Section>

      {/* INSTAGRAM STRIP */}
      <Section title="08 — Instagram Feed Strip" note="6 latest posts · square grid · tappable" accent={PALETTE.teal}>
        <Box label="HEADLINE" note='"Follow Our Latest Drops @LittleGeniusLAB"  ·  centred · with Instagram icon' width="100%" height="28px" center color={PALETTE.teal} />
        <div style={{ height: 8 }} />
        <Row gap={4}>
          {[1,2,3,4,5,6].map(n => (
            <Box key={n} label={`[IG ${n}]`} note="Tap → Instagram" flex="1" height="70px" color={PALETTE.teal} center />
          ))}
        </Row>
        <MobileNote text="Mobile: 3×2 grid, square tiles. Each tile links to Instagram post. Last tile has Instagram follow button overlay." />
      </Section>

      {/* REVIEWS */}
      <Section title="09 — Customer Reviews" note="Swipeable carousel · 3 visible desktop · 1 mobile" accent={PALETTE.accentSoft}>
        <Box label="HEADLINE" note='"Families Who Found Their Favourite Toy ⭐"  ·  centred H2' width="100%" height="28px" center color={PALETTE.accentSoft} />
        <div style={{ height: 8 }} />
        <Row gap={8}>
          {[
            { name: "Priya M., Chennai", stars: "⭐⭐⭐⭐⭐", text: '"My daughter carries her elephant everywhere!"' },
            { name: "Rajan K., Bengaluru", stars: "⭐⭐⭐⭐⭐", text: '"The custom figurine of my son — absolutely perfect!"' },
            { name: "Deepa S., Coimbatore", stars: "⭐⭐⭐⭐⭐", text: '"Fast delivery, beautiful packaging, loved it!"' },
          ].map(r => (
            <div key={r.name} style={{ flex: "1 1 140px" }}>
              <Box label={`${r.stars}\n${r.text}`} note={`— ${r.name}`} color={PALETTE.accentSoft} height="90px" />
            </div>
          ))}
        </Row>
        <MobileNote text="Mobile: 1 review visible at a time, swipe carousel. Dot indicators below. Auto-advances every 4s." />
      </Section>

      {/* FOOTER */}
      <Section title="10 — Footer" note="4-column desktop · stacked mobile · bg: near-black" accent={PALETTE.muted}>
        <Row gap={8}>
          <Box label="🧸 LittleGenius LAB\nDesign. Print. Play.\nMade in Tamil Nadu 🇮🇳" note="Logo + tagline column" flex="1" height="80px" />
          <Box label="SHOP\nAnimal Toys\nRobot Toys\nChibi Figurines\nCustom Orders" note="Nav column" flex="1" height="80px" />
          <Box label="HELP\nHow It Works\nShipping Info\nReturn Policy\nContact Us" note="Support column" flex="1" height="80px" />
          <Box label="CONNECT\nInstagram  · WhatsApp\nFacebook  · YouTube\n📧 hello@littlegeniuslab.in" note="Social + contact" flex="1" height="80px" />
        </Row>
        <Divider label="© 2026 LittleGenius LAB · All rights reserved · Tamil Nadu, India" />
      </Section>

    </div>
  );
}

// ─── SCREEN: PRODUCT LISTING ─────────────────────────────────────────────────
function ListingScreen() {
  return (
    <div>

      <Section title="01 — Page Header + Breadcrumb" note="Below sticky nav · 48px height" accent={PALETTE.accent}>
        <Box label="Home  ›  Shop  ›  Animal Toys" note="Breadcrumb · 12px · left aligned · clickable" width="100%" height="28px" />
        <div style={{ height: 6 }} />
        <Row>
          <Box label="Animal Kingdom 🐘" note="H1 · 32px desktop / 24px mobile" flex="1" color={PALETTE.accent} height="40px" />
          <Box label="18 toys found — each one printed with care 🎨" note="Results count · 12px · right aligned · muted" width="240px" height="40px" />
        </Row>
      </Section>

      <Section title="02 — Filter + Sort Bar" note="Sticky below nav on scroll · full width" accent={PALETTE.teal}>
        <Row>
          <Box label="[ Filter ▾ ]  Price  ·  Size  ·  Colour  ·  In Stock Only" note="Filter pills · desktop inline · mobile: 'Filters' sheet trigger" flex="1" color={PALETTE.teal} />
          <Box label="Sort: Most Loved ▾" note="Dropdown right · 120px width" width="140px" color={PALETTE.teal} />
        </Row>
        <div style={{ height: 5 }} />
        <Row>
          <Box label="Active filter: Animals × " note="Applied filter chips with × remove button" flex="1" height="26px" />
        </Row>
        <MobileNote text="Mobile: 'Filters' button opens bottom sheet with all filter options. Sort is a separate tap. Chips show below the bar." />
      </Section>

      <Section title="03 — Product Grid" note="3-col desktop · 2-col tablet · 2-col mobile" accent={PALETTE.accentSoft}>
        <Row gap={8}>
          {[
            { name: "Chubby Elephant", price: "Rs. 400", badge: "🔥 Bestseller", stock: "In Stock" },
            { name: "Gentle Giraffe", price: "Rs. 450", badge: "✨ New", stock: "In Stock" },
            { name: "Robo-Shark", price: "Rs. 480", badge: null, stock: "Only 3 left!" },
            { name: "Farm Cat", price: "Rs. 380", badge: "🎁 Gift Pick", stock: "In Stock" },
            { name: "Arctic Fox", price: "Rs. 420", badge: null, stock: "Sold Out" },
            { name: "Baby Dragon", price: "Rs. 500", badge: "🔥 Bestseller", stock: "In Stock" },
          ].map(p => (
            <div key={p.name} style={{ flex: "1 1 130px" }}>
              <div style={{ border: `1px solid ${PALETTE.border}`, borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ position: "relative" }}>
                  <Box label="[ PRODUCT IMAGE ]" note="Aspect 1:1 · white/pastel bg · hover: second image" color={PALETTE.accentSoft} height="100px" center />
                  {p.badge && <div style={{ position: "absolute", top: 6, left: 6 }}>{tag(p.badge, PALETTE.accent)}</div>}
                  {p.stock === "Sold Out" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>{tag("Taking a Nap 💤", "#aaa")}</div>}
                </div>
                <div style={{ padding: "8px" }}>
                  <div style={{ fontSize: "11px", color: p.stock.includes("left") ? PALETTE.pink : PALETTE.green, fontFamily: "'Space Mono', monospace", marginBottom: "3px" }}>{p.stock}</div>
                  <div style={{ fontSize: "11px", color: PALETTE.text, fontFamily: "'Space Mono', monospace", marginBottom: "2px", fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: "11px", color: PALETTE.accent, fontFamily: "'Space Mono', monospace", marginBottom: "6px" }}>{p.price}</div>
                  <CTABox label={p.stock === "Sold Out" ? "Notify Me" : "Add to Cart"} type={p.stock === "Sold Out" ? "ghost" : "primary"} width="100%" />
                </div>
              </div>
            </div>
          ))}
        </Row>
        <Annotation text="Hover state on desktop: product image swaps to alternate angle. Wishlist heart icon appears top-right on hover. Quick-add to cart without leaving listing." />
        <MobileNote text="Mobile: strict 2-column grid. Card width = (100vw - 32px) / 2. Image 1:1. Name 12px bold. Price 11px accent. CTA full card width." />
      </Section>

      <Section title="04 — Load More / Pagination" note="Below product grid" accent={PALETTE.muted}>
        <Row>
          <Box label="Showing 6 of 18 toys" note="Count · muted · left" flex="1" height="30px" />
          <CTABox label="Load More Toys →" type="secondary" />
        </Row>
        <Annotation text="Prefer 'Load More' button over infinite scroll on mobile — better for WhatsApp/Instagram referral traffic who may navigate back." />
      </Section>

      <Section title="05 — Empty State (no results)" note="When filters return 0 results" accent={PALETTE.pink}>
        <Box label="🧸  No toys match that search — yet!" note="Headline · centred · 20px" width="100%" height="36px" center color={PALETTE.pink} />
        <div style={{ height: 5 }} />
        <Box label="We're always printing new designs. Try a different filter or browse all toys." note="Subtext · centred · 13px · muted" width="100%" height="32px" center />
        <div style={{ height: 8 }} />
        <Row style={{ justifyContent: "center" }}>
          <CTABox label="Clear All Filters" type="secondary" />
          <CTABox label="Browse Everything →" type="primary" />
        </Row>
      </Section>

    </div>
  );
}

// ─── SCREEN: PRODUCT DETAIL ───────────────────────────────────────────────────
function DetailScreen() {
  return (
    <div>

      <Section title="01 — Breadcrumb + Back" note="12px · below sticky nav" accent={PALETTE.accent}>
        <Box label="← Back to Animals  ·  Home › Shop › Animal Toys › Chubby Elephant" note="Back link left · Breadcrumb right" width="100%" height="28px" />
      </Section>

      <Section title="02 — Product Hero (2-column desktop · stacked mobile)" note="Main product section" accent={PALETTE.accentSoft}>
        <Row gap={12} style={{ alignItems: "flex-start" }}>
          {/* LEFT: Images */}
          <div style={{ flex: 1.2, minWidth: "160px" }}>
            <Box label="[ MAIN PRODUCT IMAGE ]" note="Large · 1:1 aspect · zoomable on tap · rounded corners · pastel bg" color={PALETTE.accentSoft} height="180px" center />
            <div style={{ height: 6 }} />
            <Row gap={5}>
              {[1,2,3,4].map(n => (
                <Box key={n} label={`[${n}]`} note="Thumb" flex="1" height="44px" color={PALETTE.border} center />
              ))}
            </Row>
            <MobileNote text="Mobile: image full-width at top, swipeable gallery. Thumbnail row below. Pinch-to-zoom enabled." />
          </div>

          {/* RIGHT: Product Info */}
          <div style={{ flex: 2, minWidth: "200px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <Row gap={6}>
              {tag("🔥 Bestseller", PALETTE.accent)}
              {tag("Child-Safe PLA", PALETTE.green)}
            </Row>
            <Box label="Chubby Elephant — Pastel Pink Edition 🐘" note="H1 · Product name · 22px bold · 2-line max" width="100%" color={PALETTE.accent} height="48px" />
            <Box label="Rs. 400" note="Price · 24px · accent colour · bold" width="100%" height="32px" color={PALETTE.accent} />
            <Box label="⭐ ⭐ ⭐ ⭐ ⭐  4.9  (47 reviews)  →  Read reviews" note="Star rating row · 12px · links to reviews section below" width="100%" height="26px" />

            <Divider />

            <Box label="SIZE SELECTOR" note="Small (100mm)  ·  Medium (150mm)  ·  Large (200mm) — pill toggle buttons · default: Small selected" width="100%" height="40px" color={PALETTE.teal} />

            <Divider />

            <Box label="Short Description" note="A round, squishy-looking elephant with big ears and a gentle smile. Your child's new best friend. · 2 lines max" width="100%" height="40px" />

            <Divider />

            <Row gap={8}>
              <CTABox label="Add to Cart — Rs. 400" type="primary" />
              <CTABox label="Buy Now" type="teal" />
            </Row>

            <Box label="🎁  This makes a beautiful birthday gift. Add a gift note at checkout →" note="Gift nudge banner · accent bg soft · 12px · full width" width="100%" height="30px" color={PALETTE.accent} />

            <Box label="📦 Ships in 2 days  ·  🔄 7-day returns  ·  🇮🇳 Made in Tamil Nadu" note="Delivery trust row · 11px · icon + text chips" width="100%" height="28px" />

            <Row gap={6}>
              <CTABox label="💬 Chat on WhatsApp" type="ghost" />
              <CTABox label="🤍 Save to Wishlist" type="ghost" />
            </Row>
          </div>
        </Row>
      </Section>

      <Section title="03 — Product Specs Tab / Accordion" note="Below hero · accordion on mobile · tabs on desktop" accent={PALETTE.teal}>
        <Row gap={6}>
          {["The Details 🔍", "How It's Made", "Shipping & Returns"].map(t => (
            <CTABox key={t} label={t} type="ghost" />
          ))}
        </Row>
        <div style={{ height: 8 }} />
        <Row gap={8}>
          {[
            { label: "Size", val: "100mm (palm-sized)" },
            { label: "Material", val: "PLA — child-safe, non-toxic" },
            { label: "Colour", val: "Pastel pink, soft grey" },
            { label: "Finish", val: "Smooth matte" },
            { label: "Ships In", val: "2 business days" },
            { label: "Made In", val: "Tamil Nadu, India 🇮🇳" },
          ].map(s => (
            <Box key={s.label} label={s.label} note={s.val} flex="1" color={PALETTE.teal} height="50px" />
          ))}
        </Row>
        <MobileNote text="Mobile: full-width accordion rows. Tap to expand each section. Specs shown as simple 2-col key/value list." />
      </Section>

      <Section title="04 — Full Description" note="Collapsible on mobile after 3 lines" accent={PALETTE.muted}>
        <Box
          label="Long Description Block"
          note="Meet your new little friend. This chubby 3D printed elephant is designed to be everything a toy should be — soft-looking, colourful, and impossible to put down. Printed in child-safe PLA plastic with smooth pastel colours... [Read more ↓]"
          width="100%" height="70px"
        />
        <Annotation text="Show first 3 lines, then 'Read more' toggle. On desktop show full text. SEO-important: full description always rendered in DOM, just visually hidden." />
      </Section>

      <Section title="05 — Custom Upsell Banner" note="Only on chibi/animal pages · high-value nudge" accent={PALETTE.pink}>
        <Box
          label="✨ Want this as YOU? We can make a custom chibi that looks exactly like your child, pet, or character."
          note="Full-width banner · soft pink bg · CTA: 'Start Custom Order →' right side · dismissible"
          width="100%" height="44px" color={PALETTE.pink}
        />
      </Section>

      <Section title="06 — Customer Reviews" note="Full review list · sortable" accent={PALETTE.accentSoft}>
        <Box label="What Other Families Are Saying ⭐  (47 reviews · avg 4.9)" note="H2 + aggregate score" width="100%" height="32px" color={PALETTE.accentSoft} />
        <div style={{ height: 8 }} />
        <Row>
          <Box label="⭐⭐⭐⭐⭐  'My daughter carries her elephant everywhere!'\n— Priya M., Chennai · Verified Purchase · 2 days ago" flex="1" height="70px" />
          <Box label="⭐⭐⭐⭐⭐  'Amazing quality, arrived perfectly packed.'\n— Karthik R., Madurai · Verified Purchase · 5 days ago" flex="1" height="70px" />
        </Row>
        <div style={{ height: 6 }} />
        <Row style={{ justifyContent: "space-between" }}>
          <CTABox label="Load More Reviews" type="ghost" />
          <CTABox label="Share Your Experience →" type="secondary" />
        </Row>
      </Section>

      <Section title="07 — You Might Also Like" note="4 product horizontal scroll" accent={PALETTE.accent}>
        <Box label="You Might Also Like" note="H3 · left aligned · 18px" width="100%" height="26px" color={PALETTE.accent} />
        <div style={{ height: 6 }} />
        <Row gap={8}>
          {["Gentle Giraffe", "Baby Dragon", "Captain Bolt", "Farm Cat"].map(n => (
            <div key={n} style={{ flex: "1 1 100px" }}>
              <Box label={`[ IMG ]\n${n}`} note="Rs. 420–550" color={PALETTE.border} height="90px" center />
            </div>
          ))}
        </Row>
        <MobileNote text="Mobile: horizontal scroll row. Peeks next card to signal scroll. No wrap." />
      </Section>

      {/* STICKY BOTTOM BAR — MOBILE */}
      <Section title="08 — Mobile Sticky Bottom Bar" note="📱 MOBILE ONLY · fixed bottom · always visible" accent={PALETTE.pink}>
        <Row gap={8}>
          <Box label="Chubby Elephant — Rs. 400" note="Product name + price · left side" flex="1" color={PALETTE.pink} height="44px" />
          <CTABox label="Add to Cart 🛒" type="primary" />
        </Row>
        <MobileNote text="This bar is CRITICAL on mobile. Eliminates scroll-back to buy. Hides when the main CTA is in viewport. Shows when user scrolls past it." />
      </Section>

    </div>
  );
}

// ─── SCREEN: CUSTOM ORDER ─────────────────────────────────────────────────────
function CustomScreen() {
  return (
    <div>

      <Section title="01 — Page Hero" note="Full-width · emotional · high trust" accent={PALETTE.pink}>
        <Row gap={10}>
          <div style={{ flex: 1, minWidth: "160px" }}>
            <Box label="[ BEFORE / AFTER ]\nPhoto → Finished Toy\nSide-by-side comparison image" note="Builds immediate trust · show real customer examples" color={PALETTE.pink} height="120px" center />
          </div>
          <div style={{ flex: 2, minWidth: "200px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <Box label="Turn Any Memory into a Toy 🎨" note="H1 · 28px · bold · white" width="100%" color={PALETTE.pink} height="40px" />
            <Box label="Send us a photo. We'll design and 3D print a one-of-a-kind figurine — of your child, your pet, or any character you love. No two are ever the same." note="Subheadline · 15px · 3 lines max · muted white" width="100%" height="52px" />
            <div style={{ height: 4 }} />
            <Row gap={6}>
              {["✅ Free design preview", "✅ 2 revisions included", "✅ Ships in 6–7 days", "✅ From Rs. 800"].map(t => (
                <Box key={t} label={t} note="" color={PALETTE.green} height="26px" />
              ))}
            </Row>
          </div>
        </Row>
        <MobileNote text="Mobile: image stacks above text, full width. Trust badges wrap to 2×2 grid. Hero text 22px." />
      </Section>

      <Section title="02 — How It Works (3 Steps)" note="Compact horizontal · above the form" accent={PALETTE.teal}>
        <Box label={"\"It's Easier Than You Think ✨\""} note="Section headline · centred · 18px" width="100%" height="28px" center color={PALETTE.teal} />
        <div style={{ height: 8 }} />
        <Row gap={8}>
          {[
            { n: "01", icon: "📸", step: "Share Your Photo", note: "Upload a clear front-facing photo or describe your character" },
            { n: "02", icon: "💬", step: "Get a Design Preview", note: "We send a 3D render to your WhatsApp within 2 hours" },
            { n: "03", icon: "🎁", step: "Your Toy Gets Printed", note: "Once you approve, we print, pack beautifully & ship" },
          ].map(s => (
            <div key={s.n} style={{ flex: "1 1 120px" }}>
              <Box label={`${s.icon}  Step ${s.n}\n${s.step}`} note={s.note} color={PALETTE.teal} height="90px" center />
            </div>
          ))}
        </Row>
        <Box label="Starting at just Rs. 800 — the most personal gift you can give." note="Pricing line · centred · 13px · accent" width="100%" height="28px" center color={PALETTE.accent} />
      </Section>

      <Section title="03 — Custom Order Form" note="The primary conversion surface · mobile-first layout" accent={PALETTE.accent}>
        <Box label="FORM HEADLINE" note='"Tell Us About Your Toy 🎨"  ·  H2 left · 20px' width="100%" height="28px" color={PALETTE.accent} />

        <Divider label="STEP 1 — Your Photo or Description" />

        <Box
          label="📸  Upload Your Photo"
          note="Drag-and-drop zone · 160px tall · dashed border · 'JPG or PNG under 10MB · Front-facing works best!' · tap to open file picker on mobile"
          width="100%" height="60px" color={PALETTE.accent} dashed
        />
        <div style={{ height: 6 }} />
        <Box label="OR  ✍️  Describe Your Character" note="Textarea · 3 rows · placeholder: 'e.g. A girl with curly hair, blue dress, holding a cat — with a big smile!'" width="100%" height="56px" />

        <Divider label="STEP 2 — Customise Your Order" />

        <Row gap={8}>
          <Box
            label="What's the Occasion? 🎉"
            note="Radio/pill selector: 🎂 Birthday  ·  💍 Anniversary  ·  🐾 Pet Figurine  ·  🎁 Just Because!  ·  🏢 Corporate"
            flex="1" height="70px" color={PALETTE.teal}
          />
          <Box
            label="Select Size 📏"
            note="3-pill toggle:\nSmall · 100mm · Rs. 800\nMedium · 150mm · Rs. 1,000\nLarge · 200mm · Rs. 1,400"
            flex="1" height="70px" color={PALETTE.teal}
          />
        </Row>

        <div style={{ height: 6 }} />

        <Box
          label="💬  Add a Base Message? (optional)"
          note="Single-line input · placeholder: 'e.g. Happy Birthday Arjun! 🎂' — engraved on the toy base · 30 char limit · character counter shown"
          width="100%" height="44px"
        />

        <Divider label="STEP 3 — Your Contact Details" />

        <Row gap={8}>
          <Box label="Your Name" note="Text input · required · placeholder: 'Priya'" flex="1" height="44px" />
          <Box label="WhatsApp Number 📱" note="Phone input · required · placeholder: '98765 43210' · +91 prefix auto-added" flex="1" height="44px" />
        </Row>
        <div style={{ height: 5 }} />
        <Box label="Delivery Pincode" note="6-digit number input · auto-checks serviceability on blur · helper: 'We'll confirm delivery to your area'" width="100%" height="44px" />

        <Divider />

        <Box
          label="[ Send My Request → Get a Quote in 2 Hours ]"
          note="PRIMARY SUBMIT CTA · full-width · accent bg · large 16px · rounded · disabled until required fields filled"
          width="100%" height="50px" color={PALETTE.accent} center
        />
        <Box
          label="No payment needed now. We'll WhatsApp you a quote before anything is confirmed."
          note="Helper text · centred below button · 11px · muted · CRITICAL for trust"
          width="100%" height="28px" center
        />

        <Annotation text="Form validation: inline errors per field on blur. Photo field shows preview thumbnail after upload. Submit button becomes active only when Name + WhatsApp + (Photo OR Description) are filled." />
        <MobileNote text="Mobile: all fields full-width stacked. Photo upload first (most important). Size selector is horizontal scroll if 3 options don't fit. Submit button pinned to bottom of screen while form is active." />
      </Section>

      <Section title="04 — Post-Submit Confirmation State" note="Replaces form after submission" accent={PALETTE.green}>
        <Box label="🎉  We've Got Your Request!" note="Success headline · centred · 22px · green" width="100%" height="36px" center color={PALETTE.green} />
        <div style={{ height: 5 }} />
        <Box label="Expect a WhatsApp message from us within 2 hours with your design quote." note="Body · centred · 14px · muted" width="100%" height="32px" center />
        <div style={{ height: 5 }} />
        <Box label="Your order reference: #LGL-2847" note="Reference number · monospace · 12px · muted · centred" width="100%" height="26px" center />
        <div style={{ height: 8 }} />
        <Row style={{ justifyContent: "center" }} gap={8}>
          <CTABox label="Browse Ready-Made Toys →" type="secondary" />
          <CTABox label="Follow us on Instagram" type="ghost" />
        </Row>
      </Section>

      <Section title="05 — Social Proof Strip (below form)" note="Reassurance for hesitant customers" accent={PALETTE.accentSoft}>
        <Box label="SECTION HEADLINE" note='"200+ Custom Toys Made & Delivered 🎨"  ·  centred · 18px' width="100%" height="28px" center color={PALETTE.accentSoft} />
        <div style={{ height: 8 }} />
        <Row gap={6}>
          {[
            { img: "[Before/After 1]", text: "Birthday gift for daughter" },
            { img: "[Before/After 2]", text: "Pet miniature — Golden Retriever" },
            { img: "[Before/After 3]", text: "Corporate gifting — 20 units" },
            { img: "[Before/After 4]", text: "Anniversary couple figurine" },
          ].map(e => (
            <div key={e.text} style={{ flex: "1 1 100px" }}>
              <Box label={e.img} note={e.text} color={PALETTE.accentSoft} height="80px" center />
            </div>
          ))}
        </Row>
        <MobileNote text="Mobile: 2×2 grid. Each example shows customer photo + finished toy side-by-side. Caption below. Tappable to expand." />
      </Section>

    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Wireframes() {
  const [active, setActive] = useState("home");

  const renderScreen = () => {
    if (active === "home") return <HomeScreen />;
    if (active === "listing") return <ListingScreen />;
    if (active === "detail") return <DetailScreen />;
    if (active === "custom") return <CustomScreen />;
  };

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.bg, color: PALETTE.text, fontFamily: "'Space Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${PALETTE.border}; border-radius: 2px; }
      `}</style>

      {/* Top Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: PALETTE.bg,
        borderBottom: `1px solid ${PALETTE.border}`,
        padding: "12px 20px",
        display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: "11px", color: PALETTE.accent, fontWeight: 700, letterSpacing: "0.12em" }}>
            🧸 LITTLEGENIUS LAB
          </div>
          <div style={{ fontSize: "9px", color: PALETTE.textDim, letterSpacing: "0.08em" }}>
            WEBSITE WIREFRAMES · TEXT-BASED UI SPEC
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Legend */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {[
            { color: PALETTE.teal, label: "💡 Design Note" },
            { color: PALETTE.pink, label: "📱 Mobile Priority" },
            { color: PALETTE.accent, label: "Primary CTA" },
            { color: PALETTE.green, label: "Trust / Success" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "2px", background: l.color, opacity: 0.7 }} />
              <span style={{ fontSize: "8px", color: PALETTE.textDim }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Screen Tabs */}
      <div style={{
        display: "flex", gap: "4px", padding: "12px 20px",
        borderBottom: `1px solid ${PALETTE.border}`,
        background: PALETTE.card,
        overflowX: "auto",
      }}>
        {screens.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: `1px solid ${active === s.id ? PALETTE.accent : PALETTE.border}`,
              background: active === s.id ? `${PALETTE.accent}18` : "transparent",
              color: active === s.id ? PALETTE.accent : PALETTE.textMuted,
              fontFamily: "'Space Mono', monospace",
              fontSize: "10px",
              fontWeight: active === s.id ? 700 : 400,
              cursor: "pointer",
              whiteSpace: "nowrap",
              letterSpacing: "0.06em",
              transition: "all 0.15s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Screen Content */}
      <div style={{ padding: "16px 20px 60px", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{
          padding: "8px 12px", marginBottom: "14px",
          background: `${PALETTE.accent}0a`, border: `1px solid ${PALETTE.accent}30`,
          borderRadius: "6px", fontSize: "9px", color: `${PALETTE.accent}99`,
          letterSpacing: "0.05em", lineHeight: 1.6,
        }}>
          SPEC NOTE · Each section shows desktop layout first. Pink 📱 notes = mobile-specific behaviour.
          Teal 💡 notes = design/UX decisions. All copy is from the UX Copy doc. Colours match brand system.
        </div>

        {renderScreen()}
      </div>
    </div>
  );
}
