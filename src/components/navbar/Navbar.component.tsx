import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { NAVBARITEMS } from "../../data/DATA_NAVBAR";
import type { NavbarItem } from "../../data/DATA_NAVBAR";

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const toggleMenu = () => setIsMenuOpen((s) => !s);

  // Fecha ao clicar fora do nav (inclui botão + menu porque usamos navRef)
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!navRef.current) return;
      // se o clique NÃO estiver dentro do nav, fecha
      if (isMenuOpen && !navRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("click", handleDocClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleDocClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isMenuOpen]);

  return (
    <nav ref={navRef} className="relative">
      {/* Hamburger Button */}
      <div className="lg:hidden flex items-center">
        <button
          ref={buttonRef}
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
          className="text-xl p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          type="button"
          style={{ cursor: "pointer" }}
        >
          <span
            className={`block w-6 h-0.5 bg-primary mb-1 transition-transform duration-200 origin-center ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}
          />
          <span
            className={`block w-6 h-0.5 bg-primary mb-1 transition-opacity duration-200 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}
          />
          <span
            className={`block w-6 h-0.5 bg-primary transition-transform duration-200 origin-center ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}
          />
        </button>
      </div>

      {/* Desktop menu */}
      <ul className="hidden lg:flex lg:gap-6 items-center">
        {NAVBARITEMS.map((item: NavbarItem) => {
          return (
            <li key={item.name} className="text-center">
              <Link
                to={item.path}
                className="flex items-center gap-3 font-semibold text-primary hover:text-accent hover:bg-primary transition-colors duration-200  px-3 rounded-xl"
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Mobile dropdown */}
      <ul
        className={`lg:hidden absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white shadow-lg rounded-md overflow-auto transition-all transform origin-top-right z-50
            flex-flex flex-col
            ${isMenuOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}
        style={{ maxHeight: 'calc(100vh - 6rem)' }}
        aria-hidden={!isMenuOpen}
      >
        {NAVBARITEMS.map((item: NavbarItem) => {          
          return (
            <li key={item.name} className="border-b last:border-b-0 w-full">
              <Link
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100 transition-colors"
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
