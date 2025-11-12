import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Run all tests
    const tests = [
      { name: 'PostgreSQL', url: `${baseUrl}/api/test/db` },
      { name: 'Redis', url: `${baseUrl}/api/test/redis` },
      { name: 'Gemini API', url: `${baseUrl}/api/test/gemini` },
      { name: 'Eskiz.uz API', url: `${baseUrl}/api/test/eskiz` },
    ];

    const results = await Promise.allSettled(
      tests.map(test =>
        fetch(test.url).then(res => res.json())
      )
    );

    const testResults = tests.map((test, index) => {
      const result = results[index];
      return {
        name: test.name,
        status: result.status === 'fulfilled' && result.value.success ? 'PASS' : 'FAIL',
        data: result.status === 'fulfilled' ? result.value : { error: result.reason },
      };
    });

    const allPassed = testResults.every(r => r.status === 'PASS');

    return NextResponse.json({
      success: allPassed,
      message: allPassed
        ? 'All infrastructure tests passed! ✅'
        : 'Some tests failed ❌',
      results: testResults,
      summary: {
        total: tests.length,
        passed: testResults.filter(r => r.status === 'PASS').length,
        failed: testResults.filter(r => r.status === 'FAIL').length,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Test execution error:', error);

    return NextResponse.json({
      success: false,
      message: 'Test execution failed ❌',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
