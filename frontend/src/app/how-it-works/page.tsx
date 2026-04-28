import { StorefrontShell } from "@/components/site/storefront-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import Link from "next/link";

export default function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      icon: "🛒",
      title: "Browse & Pick Your Toy",
      description: "Choose from our magical collection of animals, robots, and chibi characters, or describe a unique idea you have in mind.",
      color: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      number: "02",
      icon: "🖨️",
      title: "We 3D Print It with Care",
      description: "Your toy is printed overnight in our Tamil Nadu studio using child-safe, non-toxic PLA plastic. No sharp edges, no peeling paint.",
      color: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      number: "03",
      icon: "📦",
      title: "Delivered to Your Door",
      description: "We pack each toy in our signature LittleGenius LAB packaging and ship it to you in 2-5 business days across India.",
      color: "bg-yellow-50",
      iconColor: "text-yellow-600"
    }
  ];

  return (
    <StorefrontShell>
      <section className="page-shell py-16">
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)] mb-4">
            The Magic Behind the Scenes
          </p>
          <h1 className="display-font text-5xl md:text-6xl font-semibold text-[var(--color-blue)]">
            How It Works
          </h1>
          <p className="mt-6 text-lg text-[var(--color-ink-soft)] max-w-2xl mx-auto">
            From a digital dream to a physical friend. Here is how we create every LittleGenius LAB toy.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-[var(--color-border)] -z-10 -translate-y-12"></div>
          
          {steps.map((step) => (
            <div key={step.number} className="surface-card card-shadow rounded-[2.5rem] p-8 flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full ${step.color} flex items-center justify-center text-4xl mb-6 border-2 border-white shadow-sm`}>
                {step.icon}
              </div>
              <p className={`text-xs font-bold uppercase tracking-widest ${step.iconColor} mb-2`}>
                Step {step.number}
              </p>
              <h3 className="display-font text-2xl font-bold text-[var(--color-blue)] mb-4">
                {step.title}
              </h3>
              <p className="text-[var(--color-ink-soft)] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 surface-card card-shadow rounded-[3rem] overflow-hidden">
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-12 md:p-16">
              <h2 className="display-font text-4xl font-bold text-[var(--color-blue)] mb-6">
                Crafted with Safety First
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <h4 className="font-bold text-[var(--color-ink)]">Child-Safe Material</h4>
                    <p className="text-sm text-[var(--color-ink-soft)]">We use PLA (Polylactic Acid), a biodegradable material made from corn starch. It&apos;s non-toxic and safe for little hands.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <h4 className="font-bold text-[var(--color-ink)]">No Small Parts</h4>
                    <p className="text-sm text-[var(--color-ink-soft)]">Our designs are optimized for durability and safety, avoiding small detachable parts that could be hazardous.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl">🇮🇳</span>
                  <div>
                    <h4 className="font-bold text-[var(--color-ink)]">Made in India</h4>
                    <p className="text-sm text-[var(--color-ink-soft)]">Every toy is designed and printed in our studio in Tamil Nadu, ensuring quality at every step.</p>
                  </div>
                </div>
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/shop" className="site-button site-button-primary">
                  Shop the Collection
                </Link>
                <Link href="/custom-order" className="site-button site-button-secondary">
                  Design a Custom Toy
                </Link>
              </div>
            </div>
            <div className="bg-[var(--color-blue)] h-full min-h-[400px] flex items-center justify-center p-12 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
              </div>
              <div className="relative text-center">
                <div className="text-8xl mb-6">🖨️</div>
                <p className="text-white text-xl font-medium max-w-xs mx-auto italic">
                  &quot;We don&apos;t just print toys, we print memories.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
