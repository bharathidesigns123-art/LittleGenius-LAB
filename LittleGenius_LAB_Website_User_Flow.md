# 🧩 LittleGenius LAB — Complete Website User Flow
**3D Printed Toy Brand · Tamil Nadu, India · 2026**

---

## 📐 Site Architecture & Navigation

```
HOMEPAGE
│
├── Shop
│   ├── Animal Toys (Rs. 300–500)
│   ├── Robot Toys (Rs. 400–700)
│   ├── Chibi Figurines (Rs. 500–900)
│   └── Festive Editions (Seasonal)
│
├── Custom Orders
│   ├── Custom Figurine from Photo
│   ├── Pet Miniature
│   ├── Birthday Gift Figurine
│   └── Corporate Gifting
│
├── How It Works
│
├── Gallery / Lookbook
│
├── About Us
│
└── Contact / WhatsApp CTA
```

---

## 👤 USER PERSONAS

| Persona | Goal | Entry Point |
|---|---|---|
| **Parent (Primary)** | Buy a unique, safe toy for child | Instagram → Website |
| **Gift Buyer** | Find something personal & memorable | Google / Instagram |
| **Custom Order Customer** | Get a figurine made from a photo | WhatsApp / Instagram DM |
| **Corporate Buyer** | Order branded figurines in bulk | Google / Direct |

---

---

# 🗺️ FLOW 1: First Visit → Product Purchase
**Persona:** Parent / Gift Buyer · Mobile-first

---

## 📍 ASSUMPTIONS
- User discovers LittleGenius LAB via Instagram reel or story
- Mobile browser, first-time visitor
- Interested in buying a ready-made toy (not custom)

## 👤 USER GOAL
Browse and buy a 3D printed toy (animal, robot, or chibi) and complete checkout confidently.

---

## ✅ HAPPY PATH

**Step 1:** User sees LittleGenius LAB reel on Instagram → taps "Visit Profile"
→ System shows Instagram bio with link: "🧸 Shop Now → littlegeniuslab.in"

**Step 2:** User taps bio link → lands on Homepage
→ System loads mobile-optimised Homepage with hero: *"Magical 3D Printed Toys, Made in India"* + sticky "Shop Now" CTA button

**Step 3:** User scrolls Homepage — sees product categories (Animals · Robots · Chibi · Custom)
→ System shows image-first grid cards with price range labels and "Bestseller" badges

**Step 4:** User taps "Animal Toys" category
→ System loads Animal Toys listing page — grid of toy photos, name, price, "Add to Cart" button per card

**Step 5:** User taps a product (e.g. Chubby Elephant — Rs. 400)
→ System loads Product Detail Page with: photo gallery, size info (100mm), material (PLA, child-safe), delivery time (2–5 days), customer reviews, "Add to Cart" button

**Step 6:** User taps "Add to Cart"
→ System adds item, shows mini cart drawer with item + "Proceed to Checkout" CTA

**Step 7:** User taps "Proceed to Checkout"
→ System loads Checkout Page: Name, Phone, Delivery Address, Pincode, Payment method

**Step 8:** User fills in details, selects UPI / COD / Card payment
→ System validates form in real-time, shows estimated delivery date

**Step 9:** User taps "Place Order →"
→ System processes order, shows Order Confirmation Page with order ID + WhatsApp order tracking option

**Step 10:** System sends WhatsApp message automatically:
→ *"Hi [Name]! Your [Elephant Toy] is being 3D printed with care. Dispatch in 2 business days. — Team LittleGenius LAB 🧸"*

→ ✅ **SUCCESS STATE:** User receives order confirmation on screen + WhatsApp. Feels confident about their purchase.

---

## ⚠️ EDGE CASES & DECISION POINTS

- **If user is on desktop:** → Responsive layout with sidebar cart, larger product images
- **If item is out of stock:** → Show "Notify Me" button, capture email/WhatsApp number
- **If user adds multiple items:** → Cart shows all items with subtotal, quantity controls, remove option
- **If pincode is not serviceable:** → Show "We ship via Shiprocket — enter a different address or contact us on WhatsApp"
- **If user wants to see more before buying:** → Show "You may also like" section + link to Gallery
- **If user is returning visitor:** → Show "Welcome back! Your last order was [Product]" personalisation (via cookie)

---

## ❌ ERROR STATES

- **Payment fails** → "Payment didn't go through. Try UPI / COD or WhatsApp us to complete your order." → Recovery: retry or switch to COD
- **Form incomplete** → Inline field validation: "Please enter your pincode to check delivery" → field highlights red
- **Page load slow (mobile data)** → Show skeleton loading placeholders, not blank screen → progressive image loading
- **WhatsApp message not delivered** → Fallback SMS confirmation sent

---

## 🔄 EXIT POINTS

- **Homepage → Instagram** → "Follow us for new drops" button → user exits to follow, may return later
- **Product page → back** → Sticky bottom bar persists with "Add to Cart" even while scrolling
- **Checkout abandonment** → Trigger WhatsApp reminder after 30 min: *"Hey! You left something in your cart 🧸 Complete your order here →"*

---

## 📊 FLOW SUMMARY
| | |
|---|---|
| Total steps (happy path) | 10 |
| Decision points | 6 |
| Error states | 4 |
| Estimated completion time | 3–6 minutes |

---

## 💡 DESIGN NOTES
1. **Instagram is the #1 entry point** — the homepage must feel like a visual brand extension of the Instagram feed. Heavy on photos, light on text.
2. **COD (Cash on Delivery) is critical** for first-time Indian buyers who distrust new websites — make it the first payment option, not the last.
3. **WhatsApp confirmation replaces email** for this audience — more trust, higher open rate. Auto-message on every order is a key retention touch.

---
---

# 🗺️ FLOW 2: Custom Order Inquiry → Order Placed
**Persona:** Gift Buyer / Custom Figurine Customer · Mobile-first

---

## 📍 ASSUMPTIONS
- User saw a custom toy reel on Instagram ("We turn your photo into a 3D figure!")
- Wants a personalized figurine as a birthday gift
- Will initiate via website Custom Orders page or WhatsApp directly

## 👤 USER GOAL
Submit a custom order request with their photo and receive a quote + timeline.

---

## ✅ HAPPY PATH

**Step 1:** User taps Instagram story swipe-up or bio link → Custom Orders page
→ System loads Custom Order landing page with: examples gallery, "How It Works" steps (3 steps), starting price "From Rs. 800", and a big "Start My Custom Order" CTA

**Step 2:** User taps "Start My Custom Order"
→ System shows Custom Order Form:
- Upload photo (or describe character)
- Select size: Small (100mm) / Medium (150mm) / Large (200mm)
- Select occasion: Birthday / Anniversary / Pet / Corporate
- Add message for base engraving (optional)
- WhatsApp number for updates
- "Submit Request" button

**Step 3:** User uploads photo, selects birthday + medium size, adds name
→ System validates file (JPG/PNG under 10MB), shows photo preview, confirms all fields

**Step 4:** User taps "Submit Request →"
→ System shows confirmation page: *"We've received your request! Expect a quote on WhatsApp within 2 hours."* + Order reference number

**Step 5:** Team receives notification, reviews photo, sends WhatsApp quote
→ *"Hi [Name]! We can create a custom chibi figurine from your photo. Size: 150mm, Price: Rs. 1,200, Timeline: 6–7 days. Tap below to confirm and pay ✅"* + payment link

**Step 6:** Customer approves quote, pays advance (50%) via UPI link
→ System marks order as "In Production"

**Step 7:** Team 3D designs model, shares preview render on WhatsApp for approval
→ User approves or requests revision (max 2 revisions included)

**Step 8:** Toy printed, quality checked, packed in LittleGenius LAB packaging
→ System sends WhatsApp: *"Your custom toy is on its way! 🎉 Tracking: [link]"*

→ ✅ **SUCCESS STATE:** Customer receives unique custom toy, leaves review / posts unboxing on Instagram.

---

## ⚠️ EDGE CASES & DECISION POINTS

- **If photo quality is too low:** → WhatsApp message: *"Could you share a clearer front-facing photo? This helps us get the likeness right!"*
- **If customer wants multiple characters:** → Quote adjusted, price shown per additional figure
- **If customer requests revision after print:** → Policy shown on order page: free revisions only at design stage (before printing)
- **If customer is corporate (bulk order):** → Redirect to Corporate Gifting inquiry form with MOQ (minimum 10 units), custom branding options
- **If customer is international:** → Show shipping cost estimator + international payment options (Razorpay / PayPal)

---

## ❌ ERROR STATES

- **Photo upload fails (>10MB):** → "File too large. Please upload a JPG or PNG under 10MB." → compression tip shown
- **WhatsApp number invalid:** → "Please enter a valid 10-digit number to receive your quote."
- **No response after quote sent:** → Follow-up WhatsApp after 24 hours: *"Hi! Did you get a chance to review your custom order quote? Happy to answer any questions 😊"*

---

## 🔄 EXIT POINTS

- **Form page → Shop** → "Not sure? Browse our ready-made toys" banner at bottom
- **After quote → no response** → 24-hour WhatsApp nudge, then close after 7 days
- **After order → social share** → Post-delivery message: *"Love your toy? Tag us @LittleGeniusLAB for a 10% discount on your next order 🧸"*

---

## 📊 FLOW SUMMARY
| | |
|---|---|
| Total steps (happy path) | 8 |
| Decision points | 5 |
| Error states | 3 |
| Estimated completion time | 5–10 min (form) + async quote |

---

## 💡 DESIGN NOTES
1. **The form must feel approachable, not clinical** — use friendly labels ("Tell us about your character 🎨") not formal ones ("Upload reference image").
2. **Show real examples** on the custom order page — a before/after of a customer photo → finished toy builds instant trust.
3. **WhatsApp is the CRM** for this business — every form submission should trigger a WhatsApp message within 2 hours. This is the key conversion moment.

---
---

# 🗺️ FLOW 3: Mobile Homepage Experience
**Mobile-first UX requirements**

---

## 📱 MOBILE PAGE STRUCTURE (Scroll Order)

```
1. STICKY HEADER
   Logo (left) | Hamburger menu (right) | Cart icon with count

2. HERO SECTION
   Full-width product photo
   Headline: "Magical 3D Toys, Made in India 🧸"
   Sub: "Animals · Robots · Chibi · Custom Orders"
   CTA Button: [Shop Now]  [Custom Order]

3. TRUST BAR (scrolling ticker)
   "🇮🇳 Made in Tamil Nadu  ·  🧸 Child-Safe PLA  ·  📦 Ships in 2 Days  ·  ⭐ 4.9 Rating"

4. PRODUCT CATEGORIES (2×2 grid, image-first)
   🐘 Animal Toys | 🤖 Robot Toys
   🧸 Chibi Figures | 🎨 Custom Orders

5. BESTSELLERS (horizontal scroll cards)
   Top 4 products with photo + name + price + Add to Cart

6. HOW IT WORKS (3 steps, icon + text)
   1. Browse & Order → 2. We 3D Print → 3. Delivered to Door

7. CUSTOM ORDER CTA SECTION
   "Turn Your Photo Into a 3D Toy 🎨"
   [Start Custom Order]  [Chat on WhatsApp]

8. INSTAGRAM FEED STRIP
   Latest 6 posts, tappable, links to Instagram

9. REVIEWS (swipeable cards)
   Customer name · star rating · short review text

10. FOOTER
    Quick links | WhatsApp | Instagram | Email
    © 2026 LittleGenius LAB, Tamil Nadu
```

---

## 📊 OVERALL WEBSITE PAGES SUMMARY

| Page | Purpose | Key CTA |
|---|---|---|
| Homepage | Brand first impression, discovery | Shop Now / Custom Order |
| Shop (All Products) | Browse full catalogue | Add to Cart |
| Category Page | Filtered product listing | Add to Cart |
| Product Detail Page | Convert browser to buyer | Add to Cart / Buy Now |
| Custom Orders | Capture custom inquiries | Submit Request |
| How It Works | Build trust, reduce anxiety | Start Shopping |
| Gallery / Lookbook | Social proof, inspiration | Shop This Look |
| About Us | Brand story, India-made angle | Contact Us |
| Cart | Review order | Proceed to Checkout |
| Checkout | Complete purchase | Place Order |
| Order Confirmation | Reassure, retain | Track on WhatsApp |
| Contact | Customer support | WhatsApp / Email |

---

## 🔗 CROSS-PLATFORM JOURNEY MAP

```
INSTAGRAM REEL / STORY
        ↓
  Bio Link → Website Homepage
        ↓
  Browse Products
   ↙          ↘
Ready Toy    Custom Order
   ↓               ↓
Add to Cart    Submit Form
   ↓               ↓
Checkout      WhatsApp Quote
   ↓               ↓
Order Placed   Approve + Pay
   ↓               ↓
WhatsApp    Design Approval
Confirmation      ↓
   ↓          Print + Ship
Delivered         ↓
   ↓          Delivered
Review /          ↓
Instagram     Tag + Review
  Repost
```

---

*User Flow Document — LittleGenius LAB · Prepared 2026*
*Skills used: /user-flow-writer + Business Guide Document*
