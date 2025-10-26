import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET: Analyze SEO data for duplicates and issues
export async function GET(request: NextRequest) {
  try {
    const allSeoData = await prisma.seoData.findMany();

    // Check for duplicate titles
    const titleMap = new Map<string, string[]>();
    const descriptionMap = new Map<string, string[]>();
    const issues: any[] = [];

    for (const seo of allSeoData) {
      const pageIdentifier = `${seo.pageType}/${seo.pageSlug}`;

      // Check title duplicates
      if (!titleMap.has(seo.title)) {
        titleMap.set(seo.title, []);
      }
      titleMap.get(seo.title)!.push(pageIdentifier);

      // Check description duplicates
      if (!descriptionMap.has(seo.description)) {
        descriptionMap.set(seo.description, []);
      }
      descriptionMap.get(seo.description)!.push(pageIdentifier);

      // Check title length (optimal: 50-60 chars)
      if (seo.title.length < 30) {
        issues.push({
          type: 'warning',
          severity: 'medium',
          page: pageIdentifier,
          field: 'title',
          message: `Title too short (${seo.title.length} chars). Optimal: 50-60 characters`,
          value: seo.title
        });
      } else if (seo.title.length > 60) {
        issues.push({
          type: 'error',
          severity: 'high',
          page: pageIdentifier,
          field: 'title',
          message: `Title too long (${seo.title.length} chars). Maximum: 60 characters`,
          value: seo.title
        });
      }

      // Check description length (optimal: 120-160 chars)
      if (seo.description.length < 100) {
        issues.push({
          type: 'warning',
          severity: 'medium',
          page: pageIdentifier,
          field: 'description',
          message: `Description too short (${seo.description.length} chars). Optimal: 120-160 characters`,
          value: seo.description
        });
      } else if (seo.description.length > 160) {
        issues.push({
          type: 'error',
          severity: 'high',
          page: pageIdentifier,
          field: 'description',
          message: `Description too long (${seo.description.length} chars). Maximum: 160 characters`,
          value: seo.description
        });
      }

      // Check missing keywords
      if (!seo.keywords || seo.keywords.trim().length === 0) {
        issues.push({
          type: 'warning',
          severity: 'low',
          page: pageIdentifier,
          field: 'keywords',
          message: 'No meta keywords specified',
          value: ''
        });
      }

      // Check missing OG image
      if (!seo.ogImage) {
        issues.push({
          type: 'info',
          severity: 'low',
          page: pageIdentifier,
          field: 'ogImage',
          message: 'No Open Graph image specified. Using default.',
          value: ''
        });
      }
    }

    // Find duplicate titles
    const duplicateTitles: any[] = [];
    for (const [title, pages] of titleMap.entries()) {
      if (pages.length > 1) {
        duplicateTitles.push({
          title,
          pages,
          count: pages.length
        });
        issues.push({
          type: 'error',
          severity: 'critical',
          page: pages.join(', '),
          field: 'title',
          message: `Duplicate title found on ${pages.length} pages`,
          value: title
        });
      }
    }

    // Find duplicate descriptions
    const duplicateDescriptions: any[] = [];
    for (const [description, pages] of descriptionMap.entries()) {
      if (pages.length > 1) {
        duplicateDescriptions.push({
          description,
          pages,
          count: pages.length
        });
        issues.push({
          type: 'error',
          severity: 'critical',
          page: pages.join(', '),
          field: 'description',
          message: `Duplicate meta description found on ${pages.length} pages`,
          value: description
        });
      }
    }

    // Calculate SEO score
    const totalPages = allSeoData.length;
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;
    
    let score = 100;
    score -= criticalIssues * 10;
    score -= highIssues * 5;
    score -= mediumIssues * 2;
    score = Math.max(0, Math.min(100, score));

    return NextResponse.json({
      success: true,
      data: {
        score,
        totalPages,
        issues: {
          critical: criticalIssues,
          high: highIssues,
          medium: mediumIssues,
          low: issues.filter(i => i.severity === 'low').length,
          total: issues.length
        },
        duplicates: {
          titles: duplicateTitles,
          descriptions: duplicateDescriptions
        },
        issuesList: issues.sort((a, b) => {
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
        })
      }
    });
  } catch (error) {
    console.error('Error analyzing SEO:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze SEO data' },
      { status: 500 }
    );
  }
}

