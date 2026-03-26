import { PoweredByKansalt } from "../branding/PoweredByKansalt";

export const Footer = () => {
  return (
    <footer className="app-footer">
      <span className="app-footer__copyright">© SIMS Hospital</span>
      <PoweredByKansalt
        className="app-footer__powered-by"
        logoClassName="app-footer__logo"
        labelClassName="app-footer__label"
      />
    </footer>
  );
};
