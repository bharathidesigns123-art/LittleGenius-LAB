import {
  ArrowRight,
  BadgeCheck,
  Box,
  CheckCircle2,
  ClipboardCheck,
  Cuboid,
  HeartHandshake,
  ImageUp,
  MessageCircle,
  Palette,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { SectionHeading } from "@/components/ui/section-heading";

const readySteps = [
  {
    step: "01",
    icon: ShoppingBag,
    title: "Pick a toy",
    description:
      "Browse animals, robots, chibi characters, and gift-ready designs by age, colour, and occasion.",
    detail: "Ready designs",
  },
  {
    step: "02",
    icon: Cuboid,
    title: "Printed with care",
    description:
      "We print your toy layer by layer in Tamil Nadu using child-safe PLA and rounded, friendly forms.",
    detail: "Made to order",
  },
  {
    step: "03",
    icon: Truck,
    title: "Packed and shipped",
    description:
      "Each piece is checked, packed neatly, and sent with delivery updates you can follow easily.",
    detail: "2-5 business days",
  },
];

const customSteps = [
  {
    icon: ImageUp,
    title: "Share the idea",
    description: "Upload a photo, sketch, or short description of the character you want.",
  },
  {
    icon: MessageCircle,
    title: "Confirm details",
    description: "We clarify size, colours, pose, and finish so the brief is clean before printing.",
  },
  {
    icon: Palette,
    title: "Approve the preview",
    description: "You review the design direction and request small changes before production starts.",
  },
  {
    icon: Box,
    title: "Receive the toy",
    description: "Your custom toy is printed, quality checked, packed, and shipped to your door.",
  },
];

const qualityPoints = [
  "Non-toxic PLA material",
  "Rounded child-friendly forms",
  "No peeling paint",
  "Local Tamil Nadu production",
];

const promiseCards = [
  {
    icon: ShieldCheck,
    title: "Safety-led design",
    description:
      "Soft edges, sturdy proportions, and fewer detachable details keep each toy practical for everyday play.",
  },
  {
    icon: ClipboardCheck,
    title: "Checked before packing",
    description:
      "We inspect surface finish, stability, and order details before a toy leaves the studio.",
  },
  {
    icon: HeartHandshake,
    title: "Clear human support",
    description:
      "For custom orders, our team stays close through WhatsApp-style updates and quick clarifications.",
  },
];

export default function HowItWorksPage() {
  return (
    <StorefrontShell>
      <section className="page-shell grid gap-10 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-16">
        <div className="flex flex-col justify-center">
          <span className="status-pill status-pill-yellow w-fit">
            <Sparkles size={15} aria-hidden="true" />
            Made after you order
          </span>
          <h1 className="display-font mt-5 max-w-3xl text-5xl font-semibold leading-tight text-[var(--color-blue)] md:text-7xl">
            From idea to toy, without the guesswork
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--color-ink-soft)]">
            LittleGenius LAB turns ready designs and custom ideas into safe, playful 3D printed toys.
            The process is simple, transparent, and built around parent confidence.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="site-button site-button-primary gap-2">
              Shop ready toys
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/custom-order" className="site-button site-button-secondary gap-2">
              Start a custom toy
              <Sparkles size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="surface-card card-shadow overflow-hidden rounded-[2.5rem]">
          <div className="bg-[linear-gradient(135deg,#fff4cf_0%,#fce0d2_48%,#e7f0ff_100%)] p-6">
            <div className="rounded-[2rem] bg-white/80 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                    Order Preview
                  </p>
                  <p className="mt-1 text-xl font-bold text-[var(--color-blue)]">Custom robot buddy</p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-blue)] text-white">
                  <Cuboid size={24} aria-hidden="true" />
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {["Design confirmed", "Printing in studio", "Safety check", "Packed for delivery"].map(
                  (item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3"
                    >
                      <CheckCircle2
                        size={20}
                        className={index < 2 ? "text-[var(--color-orange)]" : "text-[var(--color-blue)]/40"}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-semibold text-[var(--color-ink)]">{item}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] bg-white text-center">
            <div className="p-5">
              <p className="text-2xl font-bold text-[var(--color-blue)]">3</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                Easy steps
              </p>
            </div>
            <div className="p-5">
              <p className="text-2xl font-bold text-[var(--color-blue)]">PLA</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                Safe material
              </p>
            </div>
            <div className="p-5">
              <p className="text-2xl font-bold text-[var(--color-blue)]">IN</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                Made locally
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-12">
        <SectionHeading
          eyebrow="Ready Toy Flow"
          title="Choose, print, deliver"
          description="For catalogue toys, the path is intentionally short. Parents can pick a design, understand what happens next, and move to checkout with confidence."
        />
        <div className="relative grid gap-5 md:grid-cols-3">
          <div className="absolute left-6 right-6 top-12 hidden h-px border-t border-dashed border-[var(--color-border)] md:block" />
          {readySteps.map((step) => (
            <article key={step.step} className="surface-card card-shadow relative rounded-[2rem] p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--color-surface-2)] text-[var(--color-blue)]">
                  <step.icon size={26} aria-hidden="true" />
                </div>
                <span className="rounded-full bg-[var(--color-blue)] px-3 py-1 text-xs font-bold text-white">
                  {step.step}
                </span>
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                {step.detail}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--color-blue)]">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[var(--color-blue)] py-16 text-white">
        <div className="page-shell grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-yellow)]">
              Custom Toy Flow
            </p>
            <h2 className="display-font mt-3 text-4xl font-semibold md:text-5xl">
              A guided path for personal ideas
            </h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Custom toys need a little more conversation. You will know exactly what to share,
              what we confirm, and when your toy moves into production.
            </p>
            <Link href="/custom-order" className="site-button mt-7 bg-[var(--color-yellow)] text-[var(--color-blue)]">
              Start custom order
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {customSteps.map((step) => (
              <article key={step.title} className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5">
                <step.icon size={24} className="text-[var(--color-yellow)]" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/70">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-8 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-start">
        <div className="surface-card card-shadow rounded-[2.5rem] p-7 md:p-9">
          <span className="status-pill status-pill-orange w-fit">
            <ShieldCheck size={15} aria-hidden="true" />
            Safety first
          </span>
          <h2 className="display-font mt-5 text-4xl font-semibold text-[var(--color-blue)]">
            Built for little hands and everyday homes
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-ink-soft)]">
            We use plant-based PLA, avoid sharp edges, and design toys with durable, friendly proportions.
            Every order gets a final look before it is packed.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {qualityPoints.map((point) => (
              <div key={point} className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface)] p-4">
                <BadgeCheck size={20} className="text-[var(--color-orange)]" aria-hidden="true" />
                <span className="text-sm font-bold text-[var(--color-ink)]">{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {promiseCards.map((card) => (
            <article key={card.title} className="surface-card rounded-[1.75rem] p-6">
              <div className="flex gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-surface-2)] text-[var(--color-blue)]">
                  <card.icon size={23} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[var(--color-blue)]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-ink-soft)]">{card.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell pb-16">
        <div className="grid gap-6 rounded-[2.5rem] bg-[linear-gradient(135deg,#fff4cf_0%,#ffffff_58%,#eaf2ff_100%)] p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
              Ready when you are
            </p>
            <h2 className="display-font mt-2 text-4xl font-semibold text-[var(--color-blue)]">
              Find a toy today or create one from scratch
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="site-button site-button-primary">
              Explore toys
            </Link>
            <Link href="/custom-order" className="site-button site-button-secondary">
              Make it custom
            </Link>
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
