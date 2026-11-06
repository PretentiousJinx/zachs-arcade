import ScreenFrame from "../components/ScreenFrame";
import { useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile'

function ContactScreen() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');

    const fields = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, token }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(data.error ?? 'Something went wrong.');
        setStatus('error');
        turnstileRef.current?.reset();
        setToken(null);
        return;
      }

      setStatus('sent');

    } catch {
      setErrorMessage('Could not reach the server. Check your network connection and try again.');
      setStatus('error');
      turnstileRef.current?.reset();
      setToken(null);
    }
  };
  
  return (
    <ScreenFrame title="Contact Me">
      {status === 'sent' ? (
        <p className="form-success" role="status">
          Thank you for reaching out. I will be sure to get back to you as quickly as possible!
        </p>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
              <label htmlFor="name">Name</label>
              <input id="name" name="name" required maxLength={100} />

              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required maxLength={254} />

              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={5} required maxLength={5000} />

              <Turnstile
              ref={turnstileRef}
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              options={{ theme: 'dark' }}
              onSuccess={setToken}
              onExpire={() => setToken(null)}
              onError={() => setToken(null)}
              />

              <button type="submit" disabled={status === 'sending' || !token}>
                  {status === 'sending' ? 'SENDING...' : 'SEND'}
              </button>

              {status === 'error' && (
                <p className="form-error" role="alert">{errorMessage}</p>
              )}
          </form>
        )}
    </ScreenFrame>
  );
}
export default ContactScreen;