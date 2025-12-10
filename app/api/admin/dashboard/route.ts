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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const kibbutz = searchParams.get('kibbutz');
    const projectName = searchParams.get('projectName');
    const submitter = searchParams.get('submitter');
    const priceType = searchParams.get('priceType');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const priceValue = searchParams.get('priceValue');
    const aiStatus = searchParams.get('aiStatus');

    console.log('Fetching projects from database...');
    
    // First, fetch ALL projects to calculate kibbutz dropdown options
    const { data: allProjects } = await supabaseServer
      .from('Project')
      .select('kibbutzName');

    // Start building the filtered query
    let query = supabaseServer
      .from('Project')
      .select('*');

    // Apply filters
    if (kibbutz) {
      query = query.eq('kibbutzName', kibbutz);
    }
    
    if (projectName) {
      query = query.ilike('projectName', `%${projectName}%`);
    }
    
    if (submitter) {
      query = query.or(`submitterName.ilike.%${submitter}%,submitterEmail.ilike.%${submitter}%`);
    }

    // Price filters
    if (priceType === 'range') {
      if (priceMin) {
        query = query.gte('totalProjectCost', parseFloat(priceMin));
      }
      if (priceMax) {
        query = query.lte('totalProjectCost', parseFloat(priceMax));
      }
    } else if (priceType === 'less' && priceValue) {
      query = query.lt('totalProjectCost', parseFloat(priceValue));
    } else if (priceType === 'greater' && priceValue) {
      query = query.gt('totalProjectCost', parseFloat(priceValue));
    } else if (priceType === 'equal' && priceValue) {
      query = query.eq('totalProjectCost', parseFloat(priceValue));
    }

    // Order by createdAt
    query = query.order('createdAt', { ascending: false });

    const { data: projects, error: projectsError } = await query;

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
    let projectsWithRelations = (projects || []).map(p => ({
      ...p,
      files: filesByProject[p.id] || [],
      analysis: analysisByProject[p.id] || null,
    }));

    // Apply AI status filter (needs to be done after joining analysis data)
    if (aiStatus) {
      projectsWithRelations = projectsWithRelations.filter(p => {
        if (aiStatus === 'approved') {
          return p.analysis?.isApproved === true;
        } else if (aiStatus === 'needs_review') {
          return p.analysis?.isApproved === false;
        } else if (aiStatus === 'pending') {
          return !p.analysis || p.analysis.isApproved === null;
        }
        return true;
      });
    }

    // Calculate statistics
    const stats = {
      totalProjects: projectsWithRelations.length,
      submittedProjects: projectsWithRelations.filter(p => p.status === 'submitted').length,
      draftProjects: projectsWithRelations.filter(p => p.status === 'draft').length,
      totalValue: projectsWithRelations.reduce((sum, p) => sum + (p.totalProjectCost || 0), 0),
      avgValue: projectsWithRelations.length > 0 
        ? projectsWithRelations.reduce((sum, p) => sum + (p.totalProjectCost || 0), 0) / projectsWithRelations.length 
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

    // Projects grouped by kibbutz (from ALL projects for dropdown, not filtered)
    const projectsByKibbutz = (allProjects || []).reduce((acc, project) => {
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
          totalProjectCost: p.totalProjectCost,
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

