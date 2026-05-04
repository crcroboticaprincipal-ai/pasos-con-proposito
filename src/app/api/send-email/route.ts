import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with an environment variable
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function POST(request: Request) {
  try {
    const { email, name, type } = await request.json();

    let subject = '';
    let html = '';

    if (type === 'registration') {
      subject = 'Solicitud de Inscripción Recibida - Pasos con Propósito 4K';
      html = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #2563eb;">¡Hola ${name}!</h2>
          <p>Hemos recibido tu solicitud de inscripción para la carrera-caminata <strong>Pasos con Propósito: 4K de Solidaridad</strong>.</p>
          <p>Tu pago está en proceso de verificación. Pronto recibirás noticias nuestras confirmando tu participación.</p>
          <br/>
          <p>Atentamente,</p>
          <p><strong>El Equipo del Colegio Rafael Castillo</strong></p>
        </div>
      `;
    } else if (type === 'confirmation') {
      subject = '¡Pago Verificado! Tu inscripción está confirmada - Pasos con Propósito 4K';
      html = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #16a34a;">¡Pago Verificado, ${name}!</h2>
          <p>Tu inscripción en <strong>Pasos con Propósito</strong> está confirmada.</p>
          <p>Prepárate para los 4K. Te esperamos con mucha energía para apoyar esta noble causa.</p>
          <br/>
          <p>Atentamente,</p>
          <p><strong>El Equipo del Colegio Rafael Castillo</strong></p>
        </div>
      `;
    }

    // If Resend API key is not configured, just log to console
    if (!process.env.RESEND_API_KEY) {
      console.log('Mock Email Sent:', { to: email, subject, html });
      return NextResponse.json({ success: true, message: 'Mock email sent (RESEND_API_KEY not configured)' });
    }

    const data = await resend.emails.send({
      from: 'Pasos con Propósito <eventos@tudominio.com>', // User needs to configure their domain in Resend
      to: email,
      subject,
      html,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}
