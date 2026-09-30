import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '../../../../lib/db';
import BirthdayPage from '../../../../models/BirthdayPage';

function cleanPayload(body = {}) {
  const dob = body.dob?.toString().trim() || '';
  const date = body.date?.toString().trim() || dob || new Date().toISOString().split('T')[0];

  return {
    name: body.name?.trim() || 'Someone Special',
    nickname: body.nickname?.trim() || '',
    dob,
    age: body.age?.toString().trim() || '',
    date,
    message: body.message?.trim() || 'Wishing you a magical and unforgettable birthday filled with joy and love!',
    reasons: Array.isArray(body.reasons)
      ? body.reasons.map((r) => r?.toString().trim()).filter(Boolean).slice(0, 5)
      : [],
    photo: body.photo || '',
    photoPublicId: body.photoPublicId || '',
    gallery: Array.isArray(body.gallery) ? body.gallery.slice(0, 17) : [],
    galleryPublicIds: Array.isArray(body.galleryPublicIds) ? body.galleryPublicIds.slice(0, 17) : []
  };
}

export async function POST(request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      pagePayload
    } = await request.json();

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json({ error: 'Razorpay secret not configured' }, { status: 500 });
    }

    // Verify cryptographic signature
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    const isSignatureValid = generatedSignature === razorpay_signature;
    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Payment verification failed: invalid signature.' },
        { status: 400 }
      );
    }

    // Payment signature verified! Now save celebration page to MongoDB
    await connectToDatabase();
    const data = cleanPayload(pagePayload);

    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'birthday';
    let slug = `${baseSlug}${Math.floor(1000 + Math.random() * 8999)}`;

    let attempts = 0;
    while (await BirthdayPage.exists({ slug }) && attempts < 5) {
      slug = `${baseSlug}${Math.floor(1000 + Math.random() * 8999)}`;
      attempts++;
    }

    const page = await BirthdayPage.create({
      ...data,
      slug,
      isPaid: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    return NextResponse.json({
      success: true,
      slug: page.slug,
      id: page.slug,
    });
  } catch (error) {
    console.error('Payment verification / save failed:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verified but failed to save celebration page.' },
      { status: 500 }
    );
  }
}
