import { NextRequest, NextResponse } from 'next/server';
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
    const laApproval = formData.get('laApproval') === 'true' ? true : formData.get('laApproval') === 'false' ? false : null;
    const avivaApproval = formData.get('avivaApproval') === 'true' ? true : formData.get('avivaApproval') === 'false' ? false : null;

    // Validate required fields
    if (!kibbutzName || !submitterName || !submitterEmail || !submitterPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create project in database using Supabase client
    const { data: project, error: projectError } = await supabaseServer
      .from('Project')
      .insert({
        kibbutzName,
        submitterName,
        submitterEmail,
        submitterPhone,
        invoicePrice,
        laApproval,
        avivaApproval,
        status: 'draft',
      })
      .select()
      .single();

    if (projectError || !project) {
      console.error('Error creating project:', projectError);
      throw new Error(projectError?.message || 'Failed to create project record');
    }

    // Ensure storage bucket exists (create if it doesn't)
    const { data: buckets } = await supabaseServer.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
    
    if (!bucketExists) {
      // Try to create bucket (may fail if no permissions, but that's okay)
      await supabaseServer.storage.createBucket(STORAGE_BUCKET, {
        public: false, // Private bucket
      });
    }

    // Collect all files to upload (parallel processing)
    const filesToUpload: Array<{
      file: File;
      type: 'invoice' | 'proposal' | 'tender' | 'committee_approval' | 'charge_notice';
      index?: number;
    }> = [];

    // Committee approval file
    const committeeApprovalFile = formData.get('committeeApprovalFile') as File | null;
    if (committeeApprovalFile) {
      filesToUpload.push({ file: committeeApprovalFile, type: 'committee_approval' });
    }

    // Invoice files (multiple)
    let invoiceIndex = 0;
    while (formData.has(`invoiceFile_${invoiceIndex}`)) {
      const invoiceFile = formData.get(`invoiceFile_${invoiceIndex}`) as File;
      if (invoiceFile) {
        filesToUpload.push({ file: invoiceFile, type: 'invoice', index: invoiceIndex });
      }
      invoiceIndex++;
    }

    // Proposal files
    let proposalIndex = 0;
    while (formData.has(`proposalFile_${proposalIndex}`)) {
      const proposalFile = formData.get(`proposalFile_${proposalIndex}`) as File;
      if (proposalFile) {
        filesToUpload.push({ file: proposalFile, type: 'proposal', index: proposalIndex });
      }
      proposalIndex++;
    }

    // Tender file (if exists)
    const tenderFile = formData.get('tenderFile') as File | null;
    if (tenderFile) {
      filesToUpload.push({ file: tenderFile, type: 'tender' });
    }

    // Charge notice file (if exists)
    const chargeNoticeFile = formData.get('chargeNoticeFile') as File | null;
    if (chargeNoticeFile) {
      filesToUpload.push({ file: chargeNoticeFile, type: 'charge_notice' });
    }

    // Upload all files in parallel
    const uploadPromises = filesToUpload.map(async ({ file, type, index }) => {
      const filePath = await uploadFile(file, project.id, type, index);
      if (filePath) {
        return {
          fileName: file.name,
          filePath,
          fileType: type,
          fileSize: file.size,
          mimeType: file.type,
        };
      }
      return null;
    });

    const uploadResults = await Promise.all(uploadPromises);
    const uploadedFiles = uploadResults.filter((result): result is NonNullable<typeof result> => result !== null);

    // Create ProjectFile records in database
    if (uploadedFiles.length > 0) {
      const { error: filesError } = await supabaseServer
        .from('ProjectFile')
        .insert(
          uploadedFiles.map(file => ({
            projectId: project.id,
            fileName: file.fileName,
            filePath: file.filePath,
            fileType: file.fileType,
            fileSize: file.fileSize,
            mimeType: file.mimeType,
          }))
        );

      if (filesError) {
        console.error('Error creating project files:', filesError);
        throw new Error(filesError.message || 'Failed to create file records');
      }
    }

    // Update project status to submitted
    const { error: updateError } = await supabaseServer
      .from('Project')
      .update({ status: 'submitted' })
      .eq('id', project.id);

    if (updateError) {
      console.error('Error updating project status:', updateError);
      throw new Error(updateError.message || 'Failed to update project status');
    }

    return NextResponse.json({
      success: true,
      projectId: project.id,
      filesUploaded: uploadedFiles.length,
    });

  } catch (error) {
    console.error('Error creating project:', error);
    
    // Provide detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = {
      message: errorMessage,
      name: error instanceof Error ? error.name : 'Error',
      stack: error instanceof Error ? error.stack : undefined,
    };
    
    console.error('Full error details:', errorDetails);
    
    return NextResponse.json(
      { 
        error: 'Failed to create project', 
        details: errorMessage,
        debugInfo: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}

async function uploadFile(
  file: File,
  projectId: string,
  fileType: 'invoice' | 'proposal' | 'tender' | 'committee_approval' | 'charge_notice',
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

