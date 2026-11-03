import ScreenFrame from "../components/ScreenFrame";

function ContactScreen() {
  return (
    <ScreenFrame title="CONTACT">

      <h1>Contact Me</h1>

      <p>You can reach me at:</p>
      <nav>
        <ul>
          <li>Phone: (757) 376-1170</li>
          <li>Email: <a href="mailto:kicksilver@icloud.com">kicksilver@icloud.com</a></li>
        </ul>
      </nav>

      <p>Get in touch with me!</p>
    </ScreenFrame>
  );
}
export default ContactScreen;