import { runXSSTests, generateSecurityReport } from '@/utils/xssTests';
import { sanitizeRichText, sanitizePlainText, escapeHtml } from '@/utils/sanitize';
import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    // Test all sanitization functions
    const richTextResults = runXSSTests(sanitizeRichText);
    const plainTextResults = runXSSTests(sanitizePlainText);
    const escapeResults = runXSSTests(escapeHtml);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        richText: {
          passed: richTextResults.passed,
          failed: richTextResults.failed,
          total: richTextResults.total,
          successRate: `${((richTextResults.passed / richTextResults.total) * 100).toFixed(1)}%`
        },
        plainText: {
          passed: plainTextResults.passed,
          failed: plainTextResults.failed,
          total: plainTextResults.total,
          successRate: `${((plainTextResults.passed / plainTextResults.total) * 100).toFixed(1)}%`
        },
        escape: {
          passed: escapeResults.passed,
          failed: escapeResults.failed,
          total: escapeResults.total,
          successRate: `${((escapeResults.passed / escapeResults.total) * 100).toFixed(1)}%`
        }
      },
      details: {
        richText: richTextResults,
        plainText: plainTextResults,
        escape: escapeResults
      },
      textReport: generateSecurityReport(richTextResults, null)
    };

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
