import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Validates whether a given string is a correctly formatted email address.
 * @param email the string input to test
 * @returns boolean 
 *
 */
function isValidEmail(email: string): boolean {
    if (!email || email.length > 254) {
        return false; // RFC 5321 sets maximum email length to 254 characters
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);

}

export async function POST(request: Request) {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    // Null Body Catch
    if (typeof body !== 'object' || body === null) {
        return Response.json({ error: 'Request body must be an object' }, { status: 400 });
    }

    const { name, email, message } = body;

    // 1. Name Validation
    if (typeof name !== 'string' || name.trim() === '' || name.length > 100) {
        return Response.json({ error: 'Name is required (max 100 characters)'}, { status: 400});
    }

    // 2. Email Validation
    if (typeof email !== 'string' || !isValidEmail(email)) {
        return Response.json({ error: 'Email is invalid'}, { status: 400});
    }

    // 3. Message Validation
    if (typeof message !== 'string' || message.trim() === '' || message.length > 5000) {
        return Response.json({
            error: 'Message is required and must be under 5,000 characters'
        }, { status: 400 });
    }

    const cleanName = name.replace(/[\r\n]/g, ' ').trim();
    const cleanEmail = email.replace(/[\r\n]/g, '').trim();

    const { error } = await resend.emails.send({
        from: "Zach's Arcade <onboarding@resend.dev>",
        to: process.env.CONTACT_TO_EMAIL!,
        replyTo: cleanEmail,
        subject: `Arcade message from ${cleanName}`,
        text: `From: ${cleanName} <${cleanEmail}>\n\n${message}`,
    });

    if (error) {
        console.error(error);
        return Response.json({ error: 'Could not send message'}, { status: 500});
    }

    return Response.json({ ok: true });

}