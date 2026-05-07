import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom 3D Printed Toy Orders",
  description:
    "Upload a photo and order custom 3D printed figurines from LittleGenius LAB. Approve on WhatsApp and get India-wide delivery.",
  alternates: {
    canonical: "/custom-order",
  },
};

export default function CustomOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
