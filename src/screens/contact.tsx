import ScreenFrame from "../components/ScreenFrame";

function ContactScreen() {
  return (
    <ScreenFrame title="Contact Me">
      <p>You can reach me at:</p>
      <nav>
        <ul>
          <li>Email: <a href="mailto:kicksilver@icloud.com">kicksilver@icloud.com</a></li>
        </ul>
      </nav>

      <p>Get in touch with me!</p>
    </ScreenFrame>
  );
}
export default ContactScreen;