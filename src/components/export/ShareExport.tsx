'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types';
import { cloudExportService } from '@/lib/cloudExportService';
import { formatCurrency } from '@/lib/utils';
import QRCode from 'qrcode';

interface ShareExportProps {
  expenses: Expense[];
}

interface ShareableLink {
  url: string;
  qrCode: string;
  expiresAt: string;
  views: number;
  maxViews?: number;
  password?: string;
}

export const ShareExport: React.FC<ShareExportProps> = ({ expenses }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [shareSettings, setShareSettings] = useState({
    expirationDays: 7,
    maxViews: 0,
    requirePassword: false,
    password: '',
    allowDownload: true,
    showSummaryOnly: false,
  });
  const [generatingLink, setGeneratingLink] = useState(false);
  const [currentLink, setCurrentLink] = useState<ShareableLink | null>(null);
  const [existingLinks, setExistingLinks] = useState<ShareableLink[]>([
    {
      url: 'https://share.expensetracker.com/view/abc123',
      qrCode: '',
      expiresAt: '2025-01-20T12:00:00Z',
      views: 24,
      maxViews: 50,
    },
    {
      url: 'https://share.expensetracker.com/view/def456',
      qrCode: '',
      expiresAt: '2025-01-25T12:00:00Z',
      views: 3,
      password: '****',
    },
  ]);

  // Generate QR codes for existing links
  useEffect(() => {
    const generateQRCodes = async () => {
      const updatedLinks = await Promise.all(
        existingLinks.map(async (link) => ({
          ...link,
          qrCode: await QRCode.toDataURL(link.url, { width: 200 }),
        }))
      );
      setExistingLinks(updatedLinks);
    };

    generateQRCodes();
  }, []);

  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    try {
      const { url, expiresAt } = await cloudExportService.generateShareableLink(
        expenses,
        shareSettings.expirationDays
      );
      
      const qrCode = await QRCode.toDataURL(url, { width: 200 });
      
      const newLink: ShareableLink = {
        url,
        qrCode,
        expiresAt,
        views: 0,
        maxViews: shareSettings.maxViews || undefined,
        password: shareSettings.requirePassword ? shareSettings.password : undefined,
      };
      
      setCurrentLink(newLink);
      setExistingLinks([newLink, ...existingLinks]);
    } catch (error) {
      console.error('Failed to generate link:', error);
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // In a real app, show a toast notification
      console.log('Copied to clipboard:', text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getTimeUntilExpiration = (expiresAt: string) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffInMs = expiration.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffInMs < 0) return 'Expired';
    if (diffInDays > 0) return `${diffInDays}d ${diffInHours}h`;
    return `${diffInHours}h`;
  };

  const totalValue = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const recordCount = expenses.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Share & Collaborate</h3>
        <p className="text-gray-600 mb-4">
          Create secure, shareable links for your expense data with full control
        </p>
        
        {/* Data Summary */}
        <div className="flex space-x-4 text-sm">
          <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
            <span className="font-semibold text-emerald-600">{recordCount}</span>
            <span className="text-gray-600 ml-1">records to share</span>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
            <span className="font-semibold text-teal-600">{formatCurrency(totalValue)}</span>
            <span className="text-gray-600 ml-1">total value</span>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
            <span className="font-semibold text-blue-600">{existingLinks.length}</span>
            <span className="text-gray-600 ml-1">active links</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'create'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Create New Share
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'manage'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Manage Links ({existingLinks.length})
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Share Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-bold text-gray-900 mb-4">Share Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Expiration
                </label>
                <select
                  value={shareSettings.expirationDays}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, expirationDays: Number(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={1}>1 day</option>
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={365}>1 year</option>
                </select>
              </div>

              {/* View Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View Limit
                </label>
                <input
                  type="number"
                  value={shareSettings.maxViews}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, maxViews: Number(e.target.value) }))}
                  placeholder="0 = unlimited"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Password Protection */}
            <div className="mt-6">
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  id="requirePassword"
                  checked={shareSettings.requirePassword}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, requirePassword: e.target.checked }))}
                  className="rounded text-emerald-600"
                />
                <label htmlFor="requirePassword" className="text-sm font-medium text-gray-700">
                  Require password to access
                </label>
              </div>
              {shareSettings.requirePassword && (
                <input
                  type="password"
                  value={shareSettings.password}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>

            {/* Additional Options */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowDownload"
                  checked={shareSettings.allowDownload}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, allowDownload: e.target.checked }))}
                  className="rounded text-emerald-600"
                />
                <label htmlFor="allowDownload" className="text-sm font-medium text-gray-700">
                  Allow viewers to download data
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="showSummaryOnly"
                  checked={shareSettings.showSummaryOnly}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, showSummaryOnly: e.target.checked }))}
                  className="rounded text-emerald-600"
                />
                <label htmlFor="showSummaryOnly" className="text-sm font-medium text-gray-700">
                  Show summary only (hide individual transactions)
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-6">
              <button
                onClick={handleGenerateLink}
                disabled={generatingLink || recordCount === 0}
                className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
              >
                {generatingLink ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating Secure Link...</span>
                  </>
                ) : (
                  <>
                    <span>🔗</span>
                    <span>Generate Shareable Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Link */}
          {currentLink && (
            <div className="bg-white rounded-xl border border-green-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🎉</span>
                <h4 className="font-bold text-gray-900">Link Generated Successfully!</h4>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  {/* URL */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shareable URL
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={currentLink.url}
                        readOnly
                        className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(currentLink.url)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Share Info */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-green-600 font-medium">Expires in</div>
                        <div className="text-green-800">{getTimeUntilExpiration(currentLink.expiresAt)}</div>
                      </div>
                      <div>
                        <div className="text-green-600 font-medium">Views</div>
                        <div className="text-green-800">
                          {currentLink.views}{currentLink.maxViews ? ` / ${currentLink.maxViews}` : ' (unlimited)'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  {/* QR Code */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">QR Code for Mobile Access</p>
                    {currentLink.qrCode && (
                      <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                        <img src={currentLink.qrCode} alt="QR Code" className="w-32 h-32" />
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={() => copyToClipboard(currentLink.url)}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                    >
                      📋 Copy Link
                    </button>
                    <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">
                      📧 Email
                    </button>
                    <button className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200">
                      💬 Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-4">
          {/* Links List */}
          {existingLinks.map((link, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="font-medium text-gray-900">
                      Expense Share #{index + 1}
                    </div>
                    {link.password && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        🔒 Password Protected
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      getTimeUntilExpiration(link.expiresAt) === 'Expired'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {getTimeUntilExpiration(link.expiresAt) === 'Expired' ? '❌ Expired' : `⏰ ${getTimeUntilExpiration(link.expiresAt)}`}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">{link.url}</div>
                  
                  <div className="flex space-x-6 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Views:</span> {link.views}
                      {link.maxViews && ` / ${link.maxViews}`}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {cloudExportService.getRelativeTime(link.expiresAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => copyToClipboard(link.url)}
                    className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded text-sm"
                  >
                    📋
                  </button>
                  <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded text-sm">
                    📊
                  </button>
                  <button className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}

          {existingLinks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔗</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No shared links yet</h4>
              <p className="text-gray-500 mb-4">Create your first shareable link to get started</p>
              <button
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Create Share Link
              </button>
            </div>
          )}
        </div>
      )}

      {/* Share Analytics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-bold text-gray-900 mb-4">Share Analytics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">127</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">43</div>
            <div className="text-sm text-gray-600">Downloads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">8.3%</div>
            <div className="text-sm text-gray-600">Conversion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};