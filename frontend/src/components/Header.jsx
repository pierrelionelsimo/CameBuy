import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, Waves, Globe, LogOut, ShoppingCart, Menu, X } from "lucide-react";
import { ThemeContext } from "../contexts/ThemeContext";
import { CartContext } from "../contexts/CartContext";
import { NotificationBell } from "./FloatingWidgets";
import "./Header.css";

const THEME_ICONS = {
  light: <Sun size={15} />,
  dark: <Moon size={15} />,
  "blue-night": <Waves size={15} />,
};

function Header({ fournisseur, setFournisseur }) {
  const { theme, setTheme, lang, setLang, t, themes } = useContext(ThemeContext);
  const { totalItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("fournisseur");
    setFournisseur(null);
    navigate("/");
    setMobileOpen(false);
  };

  const themeLabel = {
    light: t("themeLight"),
    dark: t("themeDark"),
    "blue-night": t("themeBlueNight"),
  };

  return (
    <header className="hdr">
      <div className="hdr-bg" />

      <div className="hdr-inner">
        {/* ── LOGO ── */}
        <Link to="/" className="hdr-logo" onClick={() => setMobileOpen(false)}>
          <span className="hdr-logo-cam">CAME</span>
          <span className="hdr-logo-buy">BUY</span>
          <span className="hdr-logo-dot">.</span>
        </Link>

        {/* ── CENTER TEXT (desktop only) ── */}
        <div className="hdr-center">
          <h1 className="hdr-tagline">La marketplace du Cameroun</h1>
          <p className="hdr-slogan">{t("slogan")}</p>
        </div>

        {/* ── RIGHT — toujours visible ── */}
        <div className="hdr-right">

          {/* Theme switcher */}
          <div className="hdr-theme-wrap">
            <button
              className="hdr-icon-btn"
              onClick={() => { setThemeOpen((v) => !v); }}
              title={t("theme")}
            >
              {THEME_ICONS[theme]}
            </button>
            {themeOpen && (
              <>
                <div className="hdr-dd-backdrop" onClick={() => setThemeOpen(false)} />
                <div className="hdr-theme-dd">
                  {themes.map((th) => (
                    <button
                      key={th}
                      className={`hdr-theme-opt${theme === th ? " active" : ""}`}
                      onClick={() => { setTheme(th); setThemeOpen(false); }}
                    >
                      {THEME_ICONS[th]}
                      <span>{themeLabel[th]}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Language switcher */}
          <button
            className="hdr-icon-btn hdr-lang-btn"
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            title={t("language")}
          >
            <Globe size={14} />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Notifications — fournisseur uniquement */}
          {fournisseur && <NotificationBell fournisseur={fournisseur} />}

          {/* Cart */}
          <Link to="/cart" className="hdr-icon-btn hdr-cart-btn" title={t("cart")}>
            <ShoppingCart size={17} />
            {totalItems > 0 && (
              <span className="hdr-badge">{totalItems > 9 ? "9+" : totalItems}</span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button
            className="hdr-hamburger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav className={`hdr-nav${mobileOpen ? " hdr-nav--open" : ""}`}>
        {fournisseur ? (
          <>
            <span className="hdr-welcome">
              {t("welcome")},&nbsp;<strong>{fournisseur.nom || fournisseur.username}</strong>
            </span>
            <Link to="/" className="hdr-link" onClick={() => setMobileOpen(false)}>{t("home")}</Link>
            <Link to="/categories" className="hdr-link" onClick={() => setMobileOpen(false)}>{t("categories")}</Link>
            <button className="hdr-logout" onClick={handleLogout}>
              <LogOut size={13} /> {t("logout")}
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="hdr-link" onClick={() => setMobileOpen(false)}>{t("home")}</Link>
            <Link to="/categories" className="hdr-link" onClick={() => setMobileOpen(false)}>{t("categories")}</Link>
            <Link to="/login" className="hdr-link" onClick={() => setMobileOpen(false)}>{t("login")}</Link>
            <Link to="/register" className="hdr-link hdr-link--cta" onClick={() => setMobileOpen(false)}>
              {t("register")}
            </Link>
          </>
        )}
      </nav>

      {/* Mobile nav overlay backdrop */}
      {mobileOpen && (
        <div className="hdr-nav-backdrop" onClick={() => setMobileOpen(false)} />
      )}
    </header>
  );
}

export default Header;
