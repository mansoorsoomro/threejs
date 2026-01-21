import { NextRequest, NextResponse } from 'next/server';
import { BuildingDesign } from '@/types/building';
import nodemailer from 'nodemailer';
import { generatePDF } from '@/lib/pdfGenerator';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const design: BuildingDesign = await request.json();

    // Read pricing config for accurate PDF calculation
    let pricingConfig = undefined;
    try {
      const configPath = path.join(process.cwd(), 'data', 'pricing-config.json');
      if (fs.existsSync(configPath)) {
        const fileContents = fs.readFileSync(configPath, 'utf8');
        pricingConfig = JSON.parse(fileContents);
      }
    } catch (e) {
      console.error('Error reading pricing config for quote:', e);
    }

    // Generate PDF
    const pdfBlob = await generatePDF(design, pricingConfig);
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

    // Send email with PDF attachment
    await sendEmail(design, pdfBuffer);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting quote:', error);
    return NextResponse.json(
      { error: 'Failed to submit quote' },
      { status: 500 }
    );
  }
}

async function sendEmail(design: BuildingDesign, pdfBuffer: Buffer) {
  // Configure email transporter
  // In production, use environment variables for credentials
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // email addresses
  const recipients = ['sales@coupebuildingco.com'];
  if (design.clientEmail) {
    recipients.push(design.clientEmail);
  }

  // Email content
  const mailOptions = {
    from: process.env.SMTP_USER || 'noreply@coupebuildingco.com',
    to: recipients.join(', '),
    subject: `New Building Quote - ${design.clientName}`,
    text: `New building quote received from ${design.clientName}.\n\nPlease see attached PDF for full details.`,
    html: `
      <h2>New Building Quote</h2>
      <p><strong>Client:</strong> ${design.clientName}</p>
      <p><strong>Email:</strong> ${design.clientEmail}</p>
      <p><strong>Phone:</strong> ${design.clientPhone}</p>
      <p><strong>Address:</strong> ${design.clientAddress}</p>
      <p>Please see attached PDF for complete building specifications, floor plan, and pricing.</p>
    `,
    attachments: [
      {
        filename: `building-quote-${design.clientName.replace(/\s+/g, '-')}.pdf`,
        content: pdfBuffer,
      },
    ],
  };

  // If SMTP credentials are not configured, log instead of sending
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Email would be sent with the following content:');
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    console.log('PDF attachment size:', pdfBuffer.length, 'bytes');
    console.log('\nNote: Configure SMTP credentials in .env.local to enable email sending');
    return;
  }

  await transporter.sendMail(mailOptions);
}

