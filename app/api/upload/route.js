import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured on the server.' },
        { status: 503 }
      );
    }

    let formData;
    try {
      formData = await request.formData();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid form data. Please upload a valid image file.' },
        { status: 400 }
      );
    }

    const file = formData?.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'An image file is required.' },
        { status: 400 }
      );
    }

    // Support images up to 6 MB
    const maxSizeBytes = 6 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: 'Images must be smaller than 6 MB.' },
        { status: 413 }
      );
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, and WEBP images are supported.' },
        { status: 415 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash('sha1')
      .update(`folder=birthday-bloom&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const upload = new FormData();
    upload.append('file', file);
    upload.append('api_key', apiKey);
    upload.append('timestamp', timestamp.toString());
    upload.append('folder', 'birthday-bloom');
    upload.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: upload,
      }
    );

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Cloudinary upload failed:', result);
      return NextResponse.json(
        { error: result.error?.message || 'Cloudinary upload failed.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Unexpected upload route error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process image upload.' },
      { status: 500 }
    );
  }
}
