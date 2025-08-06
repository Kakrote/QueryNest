'use client';
import React, { useState } from 'react';
import { sanitizeRichText, sanitizePlainText, escapeHtml } from '@/utils/sanitize';
import { runXSSTests, generateSecurityReport, XSS_TEST_VECTORS } from '@/utils/xssTests';

const SecurityTestPage = () => {
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [testType, setTestType] = useState('richText');

  const runTests = () => {
    const sanitizeFunction = testType === 'richText' ? sanitizeRichText : 
                            testType === 'plainText' ? sanitizePlainText : escapeHtml;
    
    const results = runXSSTests(sanitizeFunction);
    const report = generateSecurityReport(results, null);
    
    setTestResults({ results, report });
  };

  const testCustomInput = () => {
    const sanitizeFunction = testType === 'richText' ? sanitizeRichText : 
                            testType === 'plainText' ? sanitizePlainText : escapeHtml;
    
    const sanitized = sanitizeFunction(testInput);
    return {
      original: testInput,
      sanitized: sanitized,
      changed: testInput !== sanitized
    };
  };

  const customTest = testInput ? testCustomInput() : null;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">XSS Security Testing Dashboard</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Controls */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Controls</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sanitization Type
                    </label>
                    <select 
                      value={testType} 
                      onChange={(e) => setTestType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="richText">Rich Text (dangerouslySetInnerHTML)</option>
                      <option value="plainText">Plain Text</option>
                      <option value="escape">HTML Escape</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={runTests}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Run XSS Tests
                  </button>
                </div>
              </div>

              {/* Custom Input Test */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Custom Input Test</h3>
                <textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter potentially malicious content to test..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                {customTest && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <strong className="text-sm text-gray-700">Original:</strong>
                      <pre className="mt-1 text-xs bg-red-50 p-2 rounded border overflow-x-auto">
                        {customTest.original}
                      </pre>
                    </div>
                    <div>
                      <strong className="text-sm text-gray-700">Sanitized:</strong>
                      <pre className="mt-1 text-xs bg-green-50 p-2 rounded border overflow-x-auto">
                        {customTest.sanitized}
                      </pre>
                    </div>
                    <div className={`text-sm font-medium ${customTest.changed ? 'text-green-600' : 'text-yellow-600'}`}>
                      {customTest.changed ? '✅ Content was sanitized' : '⚠️ Content unchanged'}
                    </div>
                  </div>
                )}
              </div>

              {/* Sample XSS Vectors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Sample XSS Vectors</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(XSS_TEST_VECTORS).map(([category, vectors]) => (
                    <details key={category} className="border rounded p-2">
                      <summary className="cursor-pointer font-medium text-sm text-gray-700 capitalize">
                        {category} ({Array.isArray(vectors) ? vectors.length : 1} tests)
                      </summary>
                      <div className="mt-2 space-y-1">
                        {(Array.isArray(vectors) ? vectors : [vectors]).map((vector, index) => (
                          <button
                            key={index}
                            onClick={() => setTestInput(vector)}
                            className="block w-full text-left text-xs bg-gray-50 p-2 rounded hover:bg-gray-100 transition-colors"
                          >
                            {vector.substring(0, 80)}...
                          </button>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
              
              {testResults ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-600 font-medium">Passed: </span>
                        {testResults.results.passed}
                      </div>
                      <div>
                        <span className="text-red-600 font-medium">Failed: </span>
                        {testResults.results.failed}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Total: </span>
                        {testResults.results.total}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Results by Category</h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(testResults.results.summary).map(([category, results]) => (
                        <div key={category} className="flex justify-between">
                          <span className="capitalize">{category}:</span>
                          <span className={results.failed > 0 ? 'text-red-600' : 'text-green-600'}>
                            {results.passed}/{results.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {testResults.results.failed > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2 text-red-800">Failures</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {testResults.results.failures.map((failure, index) => (
                          <div key={index} className="text-xs bg-white p-2 rounded border">
                            <div className="font-medium text-red-700">{failure.category}</div>
                            <div className="mt-1">
                              <strong>Original:</strong> {failure.original.substring(0, 50)}...
                            </div>
                            <div>
                              <strong>Sanitized:</strong> {failure.sanitized.substring(0, 50)}...
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Run tests to see results here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTestPage;
