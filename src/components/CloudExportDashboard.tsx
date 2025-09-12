'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cloudExportService } from '@/lib/cloudExportService';
import { ExportTemplates } from './export/ExportTemplates';
import { ExportHistory } from './export/ExportHistory';
import { CloudIntegrations } from './export/CloudIntegrations';
import { ShareExport } from './export/ShareExport';
import { ScheduleExports } from './export/ScheduleExports';

interface CloudExportDashboardProps {
  expenses: Expense[];
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'templates' | 'integrations' | 'schedule' | 'history' | 'share';

interface ConnectionStatus {
  service: string;
  connected: boolean;
  lastSync?: string;
  status: 'syncing' | 'connected' | 'error' | 'disconnected';
}

export const CloudExportDashboard: React.FC<CloudExportDashboardProps> = ({
  expenses,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [isProcessing, setIsProcessing] = useState(false);
  const [connections, setConnections] = useState<ConnectionStatus[]>([
    { service: 'Google Sheets', connected: true, lastSync: '2 minutes ago', status: 'connected' },
    { service: 'Dropbox', connected: true, lastSync: '1 hour ago', status: 'connected' },
    { service: 'Email', connected: true, lastSync: 'Never', status: 'connected' },
    { service: 'OneDrive', connected: false, status: 'disconnected' },
    { service: 'Notion', connected: false, status: 'disconnected' },
  ]);

  // Simulate real-time connection status updates
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setConnections(prev => prev.map(conn => {
        if (conn.connected && conn.service === 'Google Sheets') {
          return {
            ...conn,
            lastSync: Math.random() > 0.7 ? 'Just now' : conn.lastSync,
            status: Math.random() > 0.9 ? 'syncing' : 'connected'
          };
        }
        return conn;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const totalRecords = expenses.length;
  const totalValue = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const connectedServices = connections.filter(c => c.connected).length;

  const tabs = [
    { id: 'templates', label: 'Templates', icon: '📋', count: 6 },
    { id: 'integrations', label: 'Integrations', icon: '🔗', count: connectedServices },
    { id: 'schedule', label: 'Schedule', icon: '⏰', count: 3 },
    { id: 'history', label: 'History', icon: '📚', count: 12 },
    { id: 'share', label: 'Share', icon: '🌐', count: null },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Modern Header with Gradient */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">☁️ Cloud Export Hub</h2>
              <p className="text-indigo-100 text-lg">
                Export, share, and sync your data across platforms
              </p>
              
              {/* Real-time Stats */}
              <div className="flex space-x-6 mt-4 text-sm">
                <div className="bg-white bg-opacity-20 rounded-lg px-3 py-2">
                  <div className="font-semibold">{totalRecords}</div>
                  <div className="text-indigo-100">Records ready</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg px-3 py-2">
                  <div className="font-semibold">{formatCurrency(totalValue)}</div>
                  <div className="text-indigo-100">Total value</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg px-3 py-2">
                  <div className="font-semibold">{connectedServices}/5</div>
                  <div className="text-indigo-100">Connected</div>
                </div>
              </div>
            </div>
            
            {/* Connection Status Indicators */}
            <div className="flex items-start space-x-4">
              <div className="flex flex-col items-center space-y-2">
                {connections.slice(0, 3).map((conn) => (
                  <div
                    key={conn.service}
                    className={`w-3 h-3 rounded-full ${
                      conn.status === 'connected' ? 'bg-green-400' :
                      conn.status === 'syncing' ? 'bg-yellow-400 animate-pulse' :
                      conn.status === 'error' ? 'bg-red-400' :
                      'bg-gray-400'
                    }`}
                    title={`${conn.service}: ${conn.status}`}
                  />
                ))}
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-3xl leading-none"
                disabled={isProcessing}
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6" style={{ maxHeight: 'calc(95vh - 200px)' }}>
          {activeTab === 'templates' && (
            <ExportTemplates 
              expenses={expenses} 
              onExport={setIsProcessing}
            />
          )}
          
          {activeTab === 'integrations' && (
            <CloudIntegrations 
              connections={connections}
              onConnectionChange={setConnections}
              expenses={expenses}
            />
          )}
          
          {activeTab === 'schedule' && (
            <ScheduleExports 
              expenses={expenses}
              connections={connections}
            />
          )}
          
          {activeTab === 'history' && (
            <ExportHistory expenses={expenses} />
          )}
          
          {activeTab === 'share' && (
            <ShareExport expenses={expenses} />
          )}
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <div>
                <div className="font-semibold">Processing Export...</div>
                <div className="text-sm text-gray-500">Preparing your data</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};