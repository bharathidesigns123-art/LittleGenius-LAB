import React from 'react';
import { ShieldCheck, Truck, Recycle, Heart } from 'lucide-react';

/**
 * Trust badges specifically designed for the Indian e-commerce context.
 * Focuses on safety standards (BIS) and local manufacturing.
 */
export const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
      title: "BIS Safety Compliant",
      desc: "Meets IS 9873 safety standards"
    },
    {
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      title: "100% Made in India",
      desc: "Designed & printed in Bangalore"
    },
    {
      icon: <Recycle className="w-6 h-6 text-emerald-600" />,
      title: "Child-Safe PLA",
      desc: "Bio-degradable, non-toxic plastic"
    },
    {
      icon: <Heart className="w-6 h-6 text-rose-500" />,
      title: "Hand-Finished",
      desc: "Carefully inspected for quality"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100">
      {badges.map((badge, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
            {badge.icon}
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 leading-tight">
              {badge.title}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {badge.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
