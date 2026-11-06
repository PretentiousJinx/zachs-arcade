import ScreenFrame from "../components/ScreenFrame";
import { useState } from "react";
import type { FormEvent } from "react";

function ContactScreen() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');

    const fields = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(data.error ?? 'Something went wrong.');
        setStatus('error');
        return;
      }

      setStatus('sent');

    } catch {
      setErrorMessage('Could not reach the server. Check your network connection and try again.');
      setStatus('error');

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

              <button type="submit" disabled={status === 'sending'}>
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