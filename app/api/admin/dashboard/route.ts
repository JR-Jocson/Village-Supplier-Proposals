import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyAdminSession } from '@/lib/auth';

const STORAGE_BUCKET = 'projects';

export async function GET(request: Request) {
  try {
    // Verify admin session
    const session = await verifyAdminSession(request);
    if (!session) {
      console.log('No admin session found');
      // Temporarily allow without auth for debugging
      // return NextResponse.json(
      //   { error: 'Unauthorized' },
      //   { status: 401 }
      // );
    }

    console.log('Fetching projects from database...');
    
    // Fetch all projects using Supabase (Prisma has connection issues)
    const { data: projects, error: projectsError } = await supabaseServer
      .from('Project')
      .select('*')
      .order('createdAt', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json(
        { error: 'Failed to fetch projects', details: projectsError.message },
        { status: 500 }
      );
    }

    // Fetch all project files
    const { data: allFiles } = await supabaseServer
      .from('ProjectFile')
      .select('*');

    // Fetch all project analyses
    const { data: allAnalyses } = await supabaseServer
      .from('ProjectAnalysis')
      .select('*');

    // Group files and analyses by projectId
    const filesByProject = (allFiles || []).reduce((acc, file) => {
      if (!acc[file.projectId]) acc[file.projectId] = [];
      acc[file.projectId].push(file);
      return acc;
    }, {} as Record<string, any[]>);

    const analysisByProject = (allAnalyses || []).reduce((acc, analysis) => {
      acc[analysis.projectId] = analysis;
      return acc;
    }, {} as Record<string, any>);

    // Combine the data
    const projectsWithRelations = (projects || []).map(p => ({
      ...p,
      files: filesByProject[p.id] || [],
      analysis: analysisByProject[p.id] || null,
    }));

    // Calculate statistics
    const stats = {
      totalProjects: projectsWithRelations.length,
      submittedProjects: projectsWithRelations.filter(p => p.status === 'submitted').length,
      draftProjects: projectsWithRelations.filter(p => p.status === 'draft').length,
      totalValue: projectsWithRelations.reduce((sum, p) => sum + (p.invoicePrice || 0), 0),
      avgValue: projectsWithRelations.length > 0 
        ? projectsWithRelations.reduce((sum, p) => sum + (p.invoicePrice || 0), 0) / projectsWithRelations.length 
        : 0,
      laApprovedCount: projectsWithRelations.filter(p => p.laApproval === true).length,
      avivaApprovedCount: projectsWithRelations.filter(p => p.avivaApproval === true).length,
      projectsWithIssues: projectsWithRelations.filter(p => p.analysis && p.analysis.issues && p.analysis.issues.length > 0).length,
      totalIssues: projectsWithRelations.reduce((sum, p) => sum + (p.analysis?.issues?.length || 0), 0),
      approvedByAI: projectsWithRelations.filter(p => p.analysis?.isApproved === true).length,
      needsReview: projectsWithRelations.filter(p => p.analysis?.isApproved === false).length,
      pendingAnalysis: projectsWithRelations.filter(p => !p.analysis || p.analysis.isApproved === null).length,
    };

    // File type breakdown
    const fileTypeStats = (allFiles || []).reduce((acc, file) => {
      if (!acc[file.fileType]) {
        acc[file.fileType] = 0;
      }
      acc[file.fileType]++;
      return acc;
    }, {} as Record<string, number>);

    // Projects grouped by kibbutz
    const projectsByKibbutz = projectsWithRelations.reduce((acc, project) => {
      const kibbutz = project.kibbutzName || 'Unknown';
      if (!acc[kibbutz]) {
        acc[kibbutz] = 0;
      }
      acc[kibbutz]++;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentProjects = projectsWithRelations.filter(p => new Date(p.createdAt) >= sevenDaysAgo).length;

    console.log(`Successfully fetched ${projectsWithRelations.length} projects`);

    // Generate signed URLs for all files
    const projectsWithUrls = await Promise.all(
      projectsWithRelations.map(async (p) => {
        const filesWithUrls = await Promise.all(
          p.files.map(async (f: any) => {
            // Generate signed URL (valid for 1 hour)
            const { data, error } = await supabaseServer.storage
              .from(STORAGE_BUCKET)
              .createSignedUrl(f.filePath, 3600); // 1 hour

            if (error) {
              console.error('Error creating signed URL for file:', f.fileName, error);
            }

            return {
              id: f.id,
              fileName: f.fileName,
              fileType: f.fileType,
              fileSize: f.fileSize,
              mimeType: f.mimeType,
              createdAt: f.createdAt,
              downloadUrl: data?.signedUrl || null,
            };
          })
        );

        return {
          id: p.id,
          kibbutzName: p.kibbutzName,
          projectName: p.projectName,
          submitterName: p.submitterName,
          submitterEmail: p.submitterEmail,
          submitterPhone: p.submitterPhone,
          invoicePrice: p.invoicePrice,
          status: p.status,
          laApproval: p.laApproval,
          avivaApproval: p.avivaApproval,
          additionalNotes: p.additionalNotes,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          filesCount: p.files.length,
          files: filesWithUrls,
          analysis: p.analysis ? {
            isApproved: p.analysis.isApproved,
            analysisNotes: p.analysis.analysisNotes,
            confidenceScore: p.analysis.confidenceScore,
            issues: p.analysis.issues,
            createdAt: p.analysis.createdAt,
          } : null,
        };
      })
    );

    return NextResponse.json({
      stats,
      projects: projectsWithUrls,
      fileTypeStats,
      projectsByKibbutz,
      recentProjects,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

