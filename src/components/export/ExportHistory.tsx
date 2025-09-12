'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types';
import { cloudExportService } from '@/lib/cloudExportService';

interface ExportHistoryProps {
  expenses: Expense[];
}

export const ExportHistory: React.FC<ExportHistoryProps> = ({ expenses }) => {
  const [history, setHistory] = useState(cloudExportService.getExportHistory());
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');

  // Update history periodically to show real-time status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(cloudExportService.getExportHistory());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredHistory = history.filter(job => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100';
      case 'processing': return 'text-blue-700 bg-blue-100';
      case 'failed': return 'text-red-700 bg-red-100';
      case 'shared': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '⏳';
      case 'failed': return '❌';
      case 'shared': return '🌐';
      case 'pending': return '⏸️';
      default: return '❓';
    }
  };

  const handleBulkAction = (action: 'download' | 'delete' | 'share') => {
    console.log(`Bulk action: ${action} on jobs:`, selectedJobs);
    // In a real app, this would trigger the appropriate API calls
  };

  const handleJobAction = (jobId: string, action: 'download' | 'share' | 'retry' | 'delete') => {
    console.log(`Action: ${action} on job:`, jobId);
    // In a real app, this would trigger the appropriate API call
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Export History</h3>
        <p className="text-gray-600 mb-4">
          Track your export jobs, download files, and manage shared links
        </p>
        
        {/* Stats */}
        <div className="flex space-x-4 text-sm">
          <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
            <span className="font-semibold text-green-600">
              {history.filter(j => j.status === 'completed').length}
            </span>
            <span className="text-gray-600 ml-1">completed</span>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
            <span className="font-semibold text-blue-600">
              {history.filter(j => j.status === 'processing').length}
            </span>
            <span className="text-gray-600 ml-1">in progress</span>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
            <span className="font-semibold text-purple-600">
              {history.filter(j => j.status === 'shared').length}
            </span>
            <span className="text-gray-600 ml-1">shared</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All', count: history.length },
            { key: 'completed', label: 'Completed', count: history.filter(j => j.status === 'completed').length },
            { key: 'processing', label: 'Processing', count: history.filter(j => j.status === 'processing').length },
            { key: 'failed', label: 'Failed', count: history.filter(j => j.status === 'failed').length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as 'all' | 'completed' | 'processing' | 'failed')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedJobs.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleBulkAction('download')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Download ({selectedJobs.length})
            </button>
            <button
              onClick={() => handleBulkAction('share')}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            >
              Share
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Export History Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    className="rounded text-purple-600"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedJobs(filteredHistory.map(j => j.id));
                      } else {
                        setSelectedJobs([]);
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Template</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Records</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Size</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Destination</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredHistory.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded text-purple-600"
                      checked={selectedJobs.includes(job.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJobs([...selectedJobs, job.id]);
                        } else {
                          setSelectedJobs(selectedJobs.filter(id => id !== job.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{job.template}</div>
                    {job.recipient && (
                      <div className="text-sm text-gray-500">to: {job.recipient}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getStatusIcon(job.status)}</span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {job.recordCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {job.fileSize}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {cloudExportService.getRelativeTime(job.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {job.destination && (
                      <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        {job.destination}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {job.status === 'completed' && (
                        <>
                          <button
                            onClick={() => handleJobAction(job.id, 'download')}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            title="Download"
                          >
                            ⬇️
                          </button>
                          <button
                            onClick={() => handleJobAction(job.id, 'share')}
                            className="text-purple-600 hover:text-purple-800 text-sm"
                            title="Share"
                          >
                            🔗
                          </button>
                        </>
                      )}
                      {job.status === 'failed' && (
                        <button
                          onClick={() => handleJobAction(job.id, 'retry')}
                          className="text-orange-600 hover:text-orange-800 text-sm"
                          title="Retry"
                        >
                          🔄
                        </button>
                      )}
                      <button
                        onClick={() => handleJobAction(job.id, 'delete')}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📂</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No exports found</h4>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Start by creating your first export from the Templates tab.'
                : `No exports with status "${filter}" found.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Storage Usage */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-900">Storage Usage</h4>
          <span className="text-sm text-gray-500">Updated just now</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Export files</span>
            <span className="text-sm font-medium">47.2 MB of 100 MB</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '47%' }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Free plan: 100 MB storage</span>
            <button className="text-purple-600 hover:text-purple-800">Upgrade</button>
          </div>
        </div>
      </div>
    </div>
  );
};