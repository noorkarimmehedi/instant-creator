import { MiniNavbar } from "../ui/mini-navbar";

const navLinks = [
  { href: "#problem", label: "Problem" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  return <MiniNavbar links={navLinks} />;
}
