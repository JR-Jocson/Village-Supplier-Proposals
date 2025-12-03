import { NextRequest, NextResponse } from 'next/server';

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'https://tauga.app.n8n.cloud';
const N8N_AUTH_HEADER_NAME = process.env.N8N_AUTH_HEADER_NAME || 'village_proposal_auth';
const N8N_AUTH_HEADER_VALUE = process.env.N8N_AUTH_HEADER_VALUE || 'G5EhcKzo6BvFpv';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('invoice') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer/base64 for n8n API
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = buffer.toString('base64');
    
    // Call n8n workflow to analyze invoice
    try {
      const response = await fetch(`${N8N_BASE_URL}/webhook/analyze-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [N8N_AUTH_HEADER_NAME]: N8N_AUTH_HEADER_VALUE,
        },
        body: JSON.stringify({
          file: base64File,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error(`n8n API error: ${response.status}`);
      }

      const data = await response.json();
      
      return NextResponse.json({
        price: data.price || data.detectedPrice || data.amount,
        fileName: file.name,
        fileSize: file.size,
        ...data, // Include any additional data from n8n
      });
      
    } catch (n8nError) {
      console.error('n8n API Error:', n8nError);
      
      // TEMPORARY: Fallback to mock data if n8n fails during development
      // TODO: Remove this fallback in production
      console.log('Falling back to mock data...');
      const mockPrice = Math.floor(Math.random() * 200000);
      await new Promise(resolve => setTimeout(resolve, 1500));

      return NextResponse.json({
        price: mockPrice,
        fileName: file.name,
        fileSize: file.size,
        isMock: true, // Flag to indicate this is mock data
      });
    }
    
  } catch (error) {
    console.error('Error analyzing invoice:', error);
    return NextResponse.json(
      { error: 'Failed to analyze invoice' },
      { status: 500 }
    );
  }
}

