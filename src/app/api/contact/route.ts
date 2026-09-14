import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, phone, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "יש למלא את כל השדות" },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "ronshalom.jr@gmail.com",
      subject: `פנייה חדשה מהאתר - ${name}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          <h2>פנייה חדשה מאתר סוכנות רון שלום</h2>

          <p><strong>שם מלא:</strong> ${name}</p>

          <p><strong>טלפון:</strong> ${phone}</p>

          <p><strong>הודעה:</strong></p>

          <p style="white-space: pre-line;">
            ${message}
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "ההודעה נשלחה בהצלחה",
    });
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      { error: "אירעה שגיאה בשליחת ההודעה" },
      { status: 500 }
    );
  }
}