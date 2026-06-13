import React from "react";
import { Sparkles, Calendar, Menu, X, Users, BookOpen, Star } from "lucide-react";

interface HeaderProps {
  onScrollTo: (sectionId: string) => void;
  onOpenBooking: () => void;
}

export default function Header({ onScrollTo, onOpenBooking }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { label: "Sobre mí", id: "sobre-mi" },
    { label: "Cómo funciona", id: "como-funciona" },
    { label: "Pro probar IA", id: "probar-ia" },
    { label: "Precios", id: "precios" },
    { label: "FAQ", id: "faq" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#fcf9f8] border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <button 
          onClick={() => onScrollTo("sobre-mi")}
          className="flex items-center gap-2 cursor-pointer text-left"
          id="nav-logo"
        >
          <div className="bg-[#0054d4] text-white p-1.5 rounded-lg border-2 border-black font-extrabold text-xl font-sans tracking-tight">
            K
          </div>
          <span className="text-2xl font-black font-sans tracking-tight text-gray-900">
            Kuni<span className="text-[#0054d4]">.</span>
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onScrollTo(item.id)}
              className="text-gray-700 hover:text-[#0054d4] font-medium font-sans text-sm transition-colors cursor-pointer"
              id={`nav-item-${item.id}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenBooking}
            className="flex items-center gap-2 bg-[#0054d4] text-white font-sans font-bold text-sm px-5 py-2.5 rounded-full border-2 border-black hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            id="nav-btn-book"
          >
            <Calendar className="w-4 h-4" />
            Reservar Sesión
          </button>
        </div>

        {/* Mobile Hamburger Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg border-2 border-black bg-white hover:bg-gray-100 transition-colors cursor-pointer text-gray-900"
          aria-label="Toggle menu"
          id="nav-mobile-hamburger"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-black bg-[#fcf9f8] px-4 py-4 space-y-3 shadow-inner">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onScrollTo(item.id);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2.5 px-4 text-gray-800 hover:text-[#0054d4] hover:bg-gray-100 font-sans font-medium rounded-lg transition-all cursor-pointer text-sm"
              id={`nav-mobile-${item.id}`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={() => {
                onOpenBooking();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#0054d4] text-white font-sans font-bold text-sm py-3 px-4 rounded-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              id="nav-mobile-book-btn"
            >
              <Calendar className="w-4 h-4" />
              Reservar Sesión (S/30)
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
