import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

const { name, email, message } = body;

if (typeof name !== 'string' || name.trim() === '' || name.length > 100) {
    return Response.json({ error: 'Name is required (max 100 characters)'}, { status: 400});
}

const { error } = await resend.emails.send({
    from: "Zach's Arcade <onboarding@resend.dev>",
    to: process.env.CONTACT_TO_EMAIL!,
    replyTo: email as string,
    subject: `Arcade message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
});

if (error) {
    console.error(error);
    return Response.json({ error: 'Could not send message'}, { status: 500});
}

return Response.json({ ok: true });

}