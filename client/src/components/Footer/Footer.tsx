import "./Footer.scss";

function Footer() {
  return (
    <footer className="footer">
      <hr />
      <p> &copy; {new Date().getFullYear()}. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
