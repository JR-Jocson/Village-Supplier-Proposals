import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseServer } from '@/lib/supabase-server';

const STORAGE_BUCKET = 'projects'; // Bucket name for storing project files

// n8n configuration
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'https://tauga.app.n8n.cloud';
const N8N_AUTH_HEADER_NAME = process.env.N8N_AUTH_HEADER_NAME || 'village_proposal_auth';
const N8N_AUTH_HEADER_VALUE = process.env.N8N_AUTH_HEADER_VALUE || 'G5EhcKzo6BvFpv';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract project data
    const kibbutzName = formData.get('kibbutzName') as string;
    const projectName = formData.get('projectName') as string;
    const submitterName = formData.get('submitterName') as string;
    const submitterEmail = formData.get('submitterEmail') as string;
    const submitterPhone = formData.get('submitterPhone') as string;
    const additionalNotes = formData.get('additionalNotes') as string | null;
    // totalProjectCost is now populated by n8n from documents, not required from form
    const totalProjectCost = formData.get('totalProjectCost') ? parseFloat(formData.get('totalProjectCost') as string) : null;
    // Keep invoicePrice for backward compatibility (deprecated)
    const invoicePrice = formData.get('invoicePrice') ? parseFloat(formData.get('invoicePrice') as string) : null;
    const laApproval = formData.get('laApproval') === 'true' ? true : formData.get('laApproval') === 'false' ? false : null;
    const avivaApproval = formData.get('avivaApproval') === 'true' ? true : formData.get('avivaApproval') === 'false' ? false : null;

    // Validate required fields
    if (!kibbutzName || !projectName || !submitterName || !submitterEmail || !submitterPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create project in database using Supabase client
    // Set invoicePrice to totalProjectCost if available, otherwise use the old invoicePrice field (for backward compatibility)
    const finalInvoicePrice = totalProjectCost || invoicePrice;
    const { data: project, error: projectError } = await supabaseServer
      .from('Project')
      .insert({
        kibbutzName,
        projectName,
        submitterName,
        submitterEmail,
        submitterPhone,
        additionalNotes: additionalNotes || null,
        totalProjectCost: totalProjectCost || invoicePrice, // Will be populated by n8n from documents if not provided (fallback to invoicePrice for backward compatibility)
        invoicePrice: finalInvoicePrice, // Fill invoicePrice with totalProjectCost (kept for backward compatibility)
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

    // Extract invoices with their prices and files
    const invoices: Array<{
      file: File;
      price: number;
      proposals: File[];
      tender?: File;
    }> = [];

    let invoiceIndex = 0;
    while (formData.has(`invoice_${invoiceIndex}_file`)) {
      const invoiceFile = formData.get(`invoice_${invoiceIndex}_file`) as File;
      const invoicePriceStr = formData.get(`invoice_${invoiceIndex}_price`) as string;
      
      if (!invoiceFile) {
        throw new Error(`Invoice file missing for invoice ${invoiceIndex}`);
      }
      
      if (!invoicePriceStr) {
        throw new Error(`Invoice price missing for invoice ${invoiceIndex}`);
      }
      
      const price = parseFloat(invoicePriceStr);
      if (isNaN(price) || price <= 0) {
        throw new Error(`Invalid invoice price for invoice ${invoiceIndex}: ${invoicePriceStr}`);
      }
      
      const proposals: File[] = [];
      let proposalIndex = 0;
      
      // Extract proposals for this invoice
      while (formData.has(`invoice_${invoiceIndex}_proposal_${proposalIndex}`)) {
        const proposalFile = formData.get(`invoice_${invoiceIndex}_proposal_${proposalIndex}`) as File;
        if (proposalFile) {
          proposals.push(proposalFile);
        }
        proposalIndex++;
      }
      
      // Extract tender for this invoice (if exists)
      const tenderFile = formData.get(`invoice_${invoiceIndex}_tender`) as File | null;
      
      invoices.push({
        file: invoiceFile,
        price,
        proposals,
        tender: tenderFile || undefined,
      });
      invoiceIndex++;
    }
    
    // Validate that we have at least one invoice
    if (invoices.length === 0) {
      throw new Error('At least one invoice is required');
    }
    
    console.log(`Processing ${invoices.length} invoice(s)`);

    // If no invoices found in new format, try old format for backward compatibility
    if (invoices.length === 0) {
      // Old format: invoiceFile_0, invoiceFile_1, etc.
      let oldInvoiceIndex = 0;
      while (formData.has(`invoiceFile_${oldInvoiceIndex}`)) {
        const invoiceFile = formData.get(`invoiceFile_${oldInvoiceIndex}`) as File;
        if (invoiceFile) {
          invoices.push({
            file: invoiceFile,
            price: invoicePrice || 0, // Use project-level price as fallback
            proposals: [],
          });
        }
        oldInvoiceIndex++;
      }
    }

    // Create Invoice records and upload invoice files
    const invoiceRecords: Array<{ id: string; price: number }> = [];
    for (let i = 0; i < invoices.length; i++) {
      const invoice = invoices[i];
      const invoiceId = randomUUID();
      
      console.log(`Creating invoice ${i + 1}/${invoices.length} with price: ${invoice.price}`);
      
      // Create Invoice record
      const now = new Date().toISOString();
      const { data: invoiceData, error: invoiceError } = await supabaseServer
        .from('Invoice')
        .insert({
          id: invoiceId,
          projectId: project.id,
          price: invoice.price,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();

      if (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        console.error('Invoice data:', { id: invoiceId, projectId: project.id, price: invoice.price });
        throw new Error(`Failed to create invoice record: ${invoiceError.message || JSON.stringify(invoiceError)}`);
      }

      if (!invoiceData) {
        throw new Error('Invoice was not created but no error was returned');
      }

      invoiceRecords.push({ id: invoiceId, price: invoice.price });

      // Upload invoice file
      const invoiceFilePath = await uploadFile(invoice.file, project.id, 'invoice', i);
      if (invoiceFilePath) {
        const { error: fileError } = await supabaseServer
          .from('ProjectFile')
          .insert({
            projectId: project.id,
            invoiceId: invoiceId,
            fileName: invoice.file.name,
            filePath: invoiceFilePath,
            fileType: 'invoice',
            fileSize: invoice.file.size,
            mimeType: invoice.file.type,
          });

        if (fileError) {
          console.error('Error creating invoice file record:', fileError);
        }
      }

      // Upload proposal files for this invoice
      for (let j = 0; j < invoice.proposals.length; j++) {
        const proposalFile = invoice.proposals[j];
        const proposalFilePath = await uploadFile(proposalFile, project.id, 'proposal', j);
        if (proposalFilePath) {
          const { error: fileError } = await supabaseServer
            .from('ProjectFile')
            .insert({
              projectId: project.id,
              invoiceId: invoiceId,
              fileName: proposalFile.name,
              filePath: proposalFilePath,
              fileType: 'proposal',
              fileSize: proposalFile.size,
              mimeType: proposalFile.type,
              proposalIndex: j, // 0-indexed: 0 = first proposal, 1 = second, etc.
            });

          if (fileError) {
            console.error('Error creating proposal file record:', fileError);
          }
        }
      }

      // Upload tender file for this invoice (if exists)
      if (invoice.tender) {
        const tenderFilePath = await uploadFile(invoice.tender, project.id, 'tender');
        if (tenderFilePath) {
          const { error: fileError } = await supabaseServer
            .from('ProjectFile')
            .insert({
              projectId: project.id,
              invoiceId: invoiceId,
              fileName: invoice.tender.name,
              filePath: tenderFilePath,
              fileType: 'tender',
              fileSize: invoice.tender.size,
              mimeType: invoice.tender.type,
            });

          if (fileError) {
            console.error('Error creating tender file record:', fileError);
          }
        }
      }
    }

    // Upload project-level files (committee approval, charge notice)
    const projectFiles: Array<{
      fileName: string;
      filePath: string;
      fileType: string;
      fileSize: number;
      mimeType: string;
    }> = [];

    // Committee approval file
    const committeeApprovalFile = formData.get('committeeApprovalFile') as File | null;
    if (committeeApprovalFile) {
      const filePath = await uploadFile(committeeApprovalFile, project.id, 'committee_approval');
      if (filePath) {
        projectFiles.push({
          fileName: committeeApprovalFile.name,
          filePath,
          fileType: 'committee_approval',
          fileSize: committeeApprovalFile.size,
          mimeType: committeeApprovalFile.type,
        });
      }
    }

    // Charge notice file (if exists)
    const chargeNoticeFile = formData.get('chargeNoticeFile') as File | null;
    if (chargeNoticeFile) {
      const filePath = await uploadFile(chargeNoticeFile, project.id, 'charge_notice');
      if (filePath) {
        projectFiles.push({
          fileName: chargeNoticeFile.name,
          filePath,
          fileType: 'charge_notice',
          fileSize: chargeNoticeFile.size,
          mimeType: chargeNoticeFile.type,
        });
      }
    }

    // Create ProjectFile records for project-level files
    if (projectFiles.length > 0) {
      const { error: filesError } = await supabaseServer
        .from('ProjectFile')
        .insert(
          projectFiles.map(file => ({
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

    // Get public URLs for all uploaded files
    const fileUrls = await getFileUrls(project.id, invoiceRecords);

    // Send to n8n grader workflow
    await sendToGraderWorkflow(project.id, projectName, fileUrls);

    return NextResponse.json({
      success: true,
      projectId: project.id,
      invoicesCreated: invoiceRecords.length,
      filesUploaded: projectFiles.length + invoiceRecords.reduce((sum, inv) => {
        const invoice = invoices.find(i => i.price === inv.price);
        return sum + (invoice?.proposals.length ?? 0);
      }, 0),
    });

  } catch (error) {
    console.error('Error creating project:', error);
    
    // Provide detailed error information
    let errorMessage = 'Unknown error';
    let errorDetails: any = {};
    
    if (error instanceof Error) {
      errorMessage = error.message || 'Unknown error';
      errorDetails = {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    } else if (typeof error === 'object' && error !== null) {
      errorDetails = error;
      errorMessage = (error as any).message || JSON.stringify(error);
    } else {
      errorMessage = String(error);
    }
    
    console.error('Full error details:', errorDetails);
    console.error('Error message:', errorMessage);
    
    // Always return a properly formatted error response
    const errorResponse = {
      error: 'Failed to create project',
      details: errorMessage,
    };
    
    // Only include debug info in development
    if (process.env.NODE_ENV === 'development') {
      (errorResponse as any).debugInfo = errorDetails;
    }
    
    return NextResponse.json(
      errorResponse,
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

async function getFileUrls(
  projectId: string,
  invoiceRecords: Array<{ id: string; price: number }>
): Promise<{
  committeeApprovalUrl: string;
  chargeNoticeUrl: string;
  invoiceUrls: string[];
  proposalUrls: string[];
  invoiceChecks: Array<{ invoicePrice: number; proposalUrls: string }>;
}> {
  // Get all project files
  const { data: projectFiles, error } = await supabaseServer
    .from('ProjectFile')
    .select('*')
    .eq('projectId', projectId);

  if (error || !projectFiles) {
    console.error('Error fetching project files:', error);
    return {
      committeeApprovalUrl: '',
      chargeNoticeUrl: '',
      invoiceUrls: [],
      proposalUrls: [],
      invoiceChecks: [],
    };
  }

  const committeeApprovalFile = projectFiles.find(f => f.fileType === 'committee_approval');
  const chargeNoticeFile = projectFiles.find(f => f.fileType === 'charge_notice');
  const invoiceFiles = projectFiles.filter(f => f.fileType === 'invoice');
  const proposalFiles = projectFiles.filter(f => f.fileType === 'proposal');

  // Get signed URLs for private files (valid for 1 year)
  const getSignedUrl = async (filePath: string): Promise<string> => {
    const { data, error } = await supabaseServer.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, 31536000); // 1 year in seconds
    
    if (error || !data) {
      console.error('Error creating signed URL for', filePath, error);
      return '';
    }
    
    return data.signedUrl;
  };

  // Get all URLs in parallel
  const [committeeUrl, chargeUrl, invoiceUrls, proposalUrls] = await Promise.all([
    committeeApprovalFile ? getSignedUrl(committeeApprovalFile.filePath) : Promise.resolve(''),
    chargeNoticeFile ? getSignedUrl(chargeNoticeFile.filePath) : Promise.resolve(''),
    Promise.all(invoiceFiles.map(f => getSignedUrl(f.filePath))),
    Promise.all(proposalFiles.map(f => getSignedUrl(f.filePath))),
  ]);

  // Build invoice checks array - organize proposals by invoice (exclude tenders)
  const invoiceChecks: Array<{ invoicePrice: number; proposalUrls: string }> = [];
  
  for (const invoiceRecord of invoiceRecords) {
    // Get proposal files for this invoice (exclude tenders)
    const invoiceProposalFiles = proposalFiles.filter(
      f => f.invoiceId === invoiceRecord.id && f.fileType === 'proposal'
    );
    
    // Get signed URLs for proposals of this invoice
    const invoiceProposalUrls = await Promise.all(
      invoiceProposalFiles.map(f => getSignedUrl(f.filePath))
    );
    
    // Filter out empty URLs and join with comma
    const proposalUrlsString = invoiceProposalUrls
      .filter(url => url !== '')
      .join(', ');
    
    invoiceChecks.push({
      invoicePrice: invoiceRecord.price,
      proposalUrls: proposalUrlsString,
    });
  }

  return {
    committeeApprovalUrl: committeeUrl,
    chargeNoticeUrl: chargeUrl,
    invoiceUrls: invoiceUrls.filter(url => url !== ''),
    proposalUrls: proposalUrls.filter(url => url !== ''),
    invoiceChecks,
  };
}

async function sendToGraderWorkflow(
  projectId: string,
  projectName: string,
  fileUrls: {
    committeeApprovalUrl: string;
    chargeNoticeUrl: string;
    invoiceUrls: string[];
    proposalUrls: string[];
    invoiceChecks: Array<{ invoicePrice: number; proposalUrls: string }>;
  }
): Promise<void> {
  try {
    const payload = {
      projectId,
      projectName,
      committeeApprovalUrl: fileUrls.committeeApprovalUrl,
      chargeNoticeUrl: fileUrls.chargeNoticeUrl,
      invoiceUrls: fileUrls.invoiceUrls.join(', '),
      proposalUrls: fileUrls.proposalUrls.join(', '),
      invoiceChecks: fileUrls.invoiceChecks,
    };

    console.log('Sending to n8n grader workflow:', payload);

    const response = await fetch(`${N8N_BASE_URL}/webhook/village-supplier-proposal/grader`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [N8N_AUTH_HEADER_NAME]: N8N_AUTH_HEADER_VALUE,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n grader workflow error:', response.status, errorText);
      throw new Error(`n8n grader workflow failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('n8n grader workflow response:', result);
  } catch (error) {
    console.error('Error sending to n8n grader workflow:', error);
    // Don't throw error - we don't want to fail the entire request if n8n is down
    // The project is already created and files uploaded successfully
  }
}
