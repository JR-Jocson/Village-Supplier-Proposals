import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseServer } from '@/lib/supabase-server';

const STORAGE_BUCKET = 'projects'; // Bucket name for storing project files

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract project data
    const kibbutzName = formData.get('kibbutzName') as string;
    const submitterName = formData.get('submitterName') as string;
    const submitterEmail = formData.get('submitterEmail') as string;
    const submitterPhone = formData.get('submitterPhone') as string;
    const invoicePrice = formData.get('invoicePrice') ? parseFloat(formData.get('invoicePrice') as string) : null;

    // Validate required fields
    if (!kibbutzName || !submitterName || !submitterEmail || !submitterPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create project in database
    const project = await prisma.project.create({
      data: {
        kibbutzName,
        submitterName,
        submitterEmail,
        submitterPhone,
        invoicePrice,
        status: 'draft',
      },
    });

    // Ensure storage bucket exists (create if it doesn't)
    const { data: buckets } = await supabaseServer.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
    
    if (!bucketExists) {
      // Try to create bucket (may fail if no permissions, but that's okay)
      await supabaseServer.storage.createBucket(STORAGE_BUCKET, {
        public: false, // Private bucket
      });
    }

    // Upload files
    const uploadedFiles: Array<{
      fileName: string;
      filePath: string;
      fileType: string;
      fileSize: number;
      mimeType: string;
    }> = [];

    // Process invoice file
    const invoiceFile = formData.get('invoiceFile') as File | null;
    if (invoiceFile) {
      const filePath = await uploadFile(invoiceFile, project.id, 'invoice');
      if (filePath) {
        uploadedFiles.push({
          fileName: invoiceFile.name,
          filePath,
          fileType: 'invoice',
          fileSize: invoiceFile.size,
          mimeType: invoiceFile.type,
        });
      }
    }

    // Process proposal files
    let proposalIndex = 0;
    while (formData.has(`proposalFile_${proposalIndex}`)) {
      const proposalFile = formData.get(`proposalFile_${proposalIndex}`) as File;
      if (proposalFile) {
        const filePath = await uploadFile(proposalFile, project.id, 'proposal', proposalIndex);
        if (filePath) {
          uploadedFiles.push({
            fileName: proposalFile.name,
            filePath,
            fileType: 'proposal',
            fileSize: proposalFile.size,
            mimeType: proposalFile.type,
          });
        }
      }
      proposalIndex++;
    }

    // Process tender file (if exists)
    const tenderFile = formData.get('tenderFile') as File | null;
    if (tenderFile) {
      const filePath = await uploadFile(tenderFile, project.id, 'tender');
      if (filePath) {
        uploadedFiles.push({
          fileName: tenderFile.name,
          filePath,
          fileType: 'tender',
          fileSize: tenderFile.size,
          mimeType: tenderFile.type,
        });
      }
    }

    // Create ProjectFile records in database
    if (uploadedFiles.length > 0) {
      await prisma.projectFile.createMany({
        data: uploadedFiles.map(file => ({
          projectId: project.id,
          fileName: file.fileName,
          filePath: file.filePath,
          fileType: file.fileType,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
        })),
      });
    }

    // Update project status to submitted
    await prisma.project.update({
      where: { id: project.id },
      data: { status: 'submitted' },
    });

    return NextResponse.json({
      success: true,
      projectId: project.id,
      filesUploaded: uploadedFiles.length,
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function uploadFile(
  file: File,
  projectId: string,
  fileType: 'invoice' | 'proposal' | 'tender',
  index?: number
): Promise<string | null> {
  try {
    const fileExtension = file.name.split('.').pop() || 'pdf';
    const timestamp = Date.now();
    const fileName = index !== undefined 
      ? `${fileType}_${index}_${timestamp}.${fileExtension}`
      : `${fileType}_${timestamp}.${fileExtension}`;
    const filePath = `${projectId}/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabaseServer.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error(`Error uploading ${fileType} file:`, error);
      return null;
    }

    return filePath;
  } catch (error) {
    console.error(`Error processing ${fileType} file:`, error);
    return null;
  }
}

