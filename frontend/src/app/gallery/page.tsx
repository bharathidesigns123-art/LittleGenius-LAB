import { StorefrontShell } from "@/components/site/storefront-shell";
import Link from "next/link";

export default function GalleryPage() {
  const categories = [
    "All", "Animals", "Robots", "Chibi", "Custom Orders"
  ];

  // This would ideally come from an API or a structured list of "off-the-printer" photos
  const items = [
    { id: 1, title: "Chubby Elephant", category: "Animals", icon: "🐘" },
    { id: 2, title: "Captain Bolt", category: "Robots", icon: "🤖" },
    { id: 3, title: "Custom Chibi Figurine", category: "Custom Orders", icon: "🎨" },
    { id: 4, title: "Gentle Giraffe", category: "Animals", icon: "🦒" },
    { id: 5, title: "Mini Robot Squad", category: "Robots", icon: "🦾" },
    { id: 6, title: "Birthday Cake Topper", category: "Custom Orders", icon: "🎂" },
    { id: 7, title: "Pastel Dino", category: "Animals", icon: "🦖" },
    { id: 8, title: "Custom Pet Portrait", category: "Custom Orders", icon: "🐾" },
  ];

  return (
    <StorefrontShell>
      <section className="page-shell py-16">
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)] mb-4">
            Lookbook
          </p>
          <h1 className="display-font text-5xl md:text-6xl font-semibold text-[var(--color-blue)]">
            Fresh Off the Printer
          </h1>
          <p className="mt-6 text-lg text-[var(--color-ink-soft)] max-w-2xl mx-auto">
            A peek inside our studio. Real photos of real toys made for families just like yours.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button 
              key={cat} 
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${cat === "All" ? 'bg-[var(--color-blue)] text-white' : 'bg-white border border-[var(--color-border)] text-[var(--color-blue)] hover:bg-[var(--color-surface-2)]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="break-inside-avoid surface-card card-shadow rounded-[2rem] overflow-hidden group cursor-pointer relative">
               <div className="aspect-[3/4] bg-[var(--color-surface-2)] flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
               </div>
               <div className="p-6 bg-white/90 backdrop-blur-sm absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-xs font-bold text-[var(--color-orange)] uppercase tracking-wider mb-1">{item.category}</p>
                  <h4 className="font-bold text-[var(--color-blue)]">{item.title}</h4>
               </div>
            </div>
          ))}
        </div>

        {/* Instagram Nudge */}
        <div className="mt-20 surface-card card-shadow rounded-[3rem] p-12 text-center bg-[linear-gradient(135deg,#fdfbf7_0%,#fff4cf_100%)]">
           <h3 className="display-font text-3xl font-bold text-[var(--color-blue)] mb-4">
              See them in action on Instagram 📸
           </h3>
           <p className="text-[var(--color-ink-soft)] mb-8 max-w-lg mx-auto">
              We post unboxing videos, 3D printing timelapses, and new design reveals every day.
           </p>
           <a 
             href="https://instagram.com/littlegeniuslab" 
             target="_blank" 
             rel="noopener noreferrer"
             className="site-button site-button-primary"
           >
             Follow @LittleGeniusLAB
           </a>
        </div>
      </section>
    </StorefrontShell>
  );
}
