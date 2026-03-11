import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-brand">🛍️ CAMEBUY</span>
        <span className="footer-sep">·</span>
        <p className="footer-text">
          &copy; {new Date().getFullYear()} CAMEBUY. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
