'use client';

import { useState } from 'react';
import { Expense } from '@/types';
import { cloudExportService } from '@/lib/cloudExportService';

interface ConnectionStatus {
  service: string;
  connected: boolean;
  lastSync?: string;
  status: 'syncing' | 'connected' | 'error' | 'disconnected';
}

interface CloudIntegrationsProps {
  connections: ConnectionStatus[];
  onConnectionChange: (connections: ConnectionStatus[]) => void;
  expenses: Expense[];
}

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'storage' | 'sheets' | 'email' | 'productivity' | 'accounting';
  features: string[];
  popular: boolean;
  comingSoon?: boolean;
}

export const CloudIntegrations: React.FC<CloudIntegrationsProps> = ({
  connections,
  onConnectionChange,
  expenses,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [connectingService, setConnectingService] = useState<string | null>(null);

  const integrations: Integration[] = [
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      icon: '📊',
      description: 'Automatically sync expenses to Google Sheets with real-time updates',
      category: 'sheets',
      features: ['Auto-sync', 'Real-time updates', 'Custom formulas', 'Collaboration'],
      popular: true,
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: '📦',
      description: 'Store export files in your Dropbox with organized folder structure',
      category: 'storage',
      features: ['Auto-backup', 'Version control', 'Team sharing', 'Mobile access'],
      popular: true,
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      icon: '☁️',
      description: 'Microsoft OneDrive integration with Office 365 compatibility',
      category: 'storage',
      features: ['Office integration', 'SharePoint sync', 'Teams compatibility', 'Enterprise security'],
      popular: false,
    },
    {
      id: 'email',
      name: 'Email Delivery',
      icon: '📧',
      description: 'Send exports directly via email with custom schedules',
      category: 'email',
      features: ['Scheduled delivery', 'Multiple recipients', 'Custom templates', 'Delivery tracking'],
      popular: true,
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: '📝',
      description: 'Create expense databases in Notion with rich formatting',
      category: 'productivity',
      features: ['Database sync', 'Rich formatting', 'Templates', 'Team workspaces'],
      popular: false,
    },
    {
      id: 'airtable',
      name: 'Airtable',
      icon: '🗃️',
      description: 'Build powerful expense tracking bases with Airtable',
      category: 'productivity',
      features: ['Custom views', 'Automation', 'Collaboration', 'API access'],
      popular: false,
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      icon: '💼',
      description: 'Sync expenses directly to your QuickBooks account',
      category: 'accounting',
      features: ['Auto-categorization', 'Tax preparation', 'Financial reports', 'Multi-currency'],
      popular: true,
      comingSoon: true,
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: '💬',
      description: 'Get export notifications and reports in your Slack channels',
      category: 'productivity',
      features: ['Channel notifications', 'Bot commands', 'Report summaries', 'Team alerts'],
      popular: false,
    },
  ];

  const categories = [
    { id: 'all', name: 'All Integrations', icon: '🔗', count: integrations.length },
    { id: 'storage', name: 'Cloud Storage', icon: '☁️', count: integrations.filter(i => i.category === 'storage').length },
    { id: 'sheets', name: 'Spreadsheets', icon: '📊', count: integrations.filter(i => i.category === 'sheets').length },
    { id: 'email', name: 'Email', icon: '📧', count: integrations.filter(i => i.category === 'email').length },
    { id: 'productivity', name: 'Productivity', icon: '⚡', count: integrations.filter(i => i.category === 'productivity').length },
    { id: 'accounting', name: 'Accounting', icon: '💼', count: integrations.filter(i => i.category === 'accounting').length },
  ];

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory);

  const getConnectionStatus = (serviceId: string) => {
    return connections.find(c => c.service.toLowerCase().replace(' ', '-') === serviceId);
  };

  const handleConnect = async (integration: Integration) => {
    if (integration.comingSoon) return;
    
    setConnectingService(integration.id);
    
    try {
      const success = await cloudExportService.connectIntegration(integration.name);
      
      if (success) {
        const newConnections = connections.map(conn => 
          conn.service.toLowerCase().replace(' ', '-') === integration.id
            ? { ...conn, connected: true, status: 'connected' as const, lastSync: 'Just connected' }
            : conn
        );
        
        // Add new connection if not exists
        if (!newConnections.find(c => c.service.toLowerCase().replace(' ', '-') === integration.id)) {
          newConnections.push({
            service: integration.name,
            connected: true,
            status: 'connected',
            lastSync: 'Just connected'
          });
        }
        
        onConnectionChange(newConnections);
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnectingService(null);
    }
  };

  const handleDisconnect = (integration: Integration) => {
    const newConnections = connections.map(conn => 
      conn.service.toLowerCase().replace(' ', '-') === integration.id
        ? { ...conn, connected: false, status: 'disconnected' as const }
        : conn
    );
    onConnectionChange(newConnections);
  };

  const handleExportTo = async (integration: Integration) => {
    try {
      const jobId = await cloudExportService.exportToIntegration(
        integration.name, 
        expenses, 
        'raw-data'
      );
      console.log('Export started:', jobId);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Cloud Integrations</h3>
        <p className="text-gray-600 mb-4">
          Connect your favorite tools and services for seamless data synchronization
        </p>
        
        {/* Connection Stats */}
        <div className="flex space-x-4 text-sm">
          <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
            <span className="font-semibold text-green-600">
              {connections.filter(c => c.connected).length}
            </span>
            <span className="text-gray-600 ml-1">connected</span>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
            <span className="font-semibold text-blue-600">
              {integrations.length}
            </span>
            <span className="text-gray-600 ml-1">available</span>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
            <span className="font-semibold text-purple-600">
              {connections.filter(c => c.status === 'syncing').length}
            </span>
            <span className="text-gray-600 ml-1">syncing now</span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
            <span className="bg-white bg-opacity-70 text-xs px-2 py-1 rounded-full">
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Popular Integrations Banner */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-purple-900 mb-1">⭐ Most Popular</h4>
            <p className="text-purple-700 text-sm">Connect these highly-rated integrations</p>
          </div>
          <div className="flex space-x-2">
            {integrations.filter(i => i.popular && !i.comingSoon).slice(0, 3).map((integration) => (
              <div key={integration.id} className="text-2xl">{integration.icon}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => {
          const connectionStatus = getConnectionStatus(integration.id);
          const isConnected = connectionStatus?.connected || false;
          const isConnecting = connectingService === integration.id;
          
          return (
            <div
              key={integration.id}
              className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                isConnected
                  ? 'border-green-300 bg-green-50'
                  : integration.comingSoon
                  ? 'border-gray-200 opacity-60'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-6">
                {/* Integration Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{integration.icon}</div>
                    <div>
                      <h4 className="font-bold text-gray-900 flex items-center space-x-2">
                        <span>{integration.name}</span>
                        {integration.popular && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                            Popular
                          </span>
                        )}
                        {integration.comingSoon && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </h4>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium mt-1 ${
                        integration.category === 'storage' ? 'bg-blue-100 text-blue-700' :
                        integration.category === 'sheets' ? 'bg-green-100 text-green-700' :
                        integration.category === 'email' ? 'bg-purple-100 text-purple-700' :
                        integration.category === 'productivity' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {integration.category}
                      </span>
                    </div>
                  </div>
                  
                  {/* Connection Status */}
                  {isConnected && (
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        connectionStatus?.status === 'connected' ? 'bg-green-400' :
                        connectionStatus?.status === 'syncing' ? 'bg-yellow-400 animate-pulse' :
                        connectionStatus?.status === 'error' ? 'bg-red-400' :
                        'bg-gray-400'
                      }`}></div>
                      <span className="text-xs text-gray-500">
                        {connectionStatus?.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">{integration.description}</p>

                {/* Features */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
                    Features
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {integration.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Last Sync Info */}
                {isConnected && connectionStatus?.lastSync && (
                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <div className="text-xs text-green-600 font-medium">Last synced</div>
                    <div className="text-sm text-green-700">{connectionStatus.lastSync}</div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {integration.comingSoon ? (
                    <button
                      disabled
                      className="flex-1 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  ) : isConnected ? (
                    <>
                      <button
                        onClick={() => handleExportTo(integration)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Export Now
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration)}
                      disabled={isConnecting}
                      className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isConnecting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <span>Connect</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Marketplace */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="font-bold text-gray-900">Request an Integration</h4>
            <p className="text-gray-600 text-sm">Missing a service you use? Let us know!</p>
          </div>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium">
            Submit Request
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Xero', 'Zapier', 'IFTTT', 'Power BI'].map((service) => (
            <div key={service} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm font-medium text-gray-600">{service}</div>
              <div className="text-xs text-gray-500">Requested by 12+ users</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};