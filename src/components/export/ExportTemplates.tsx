'use client';

import { useState } from 'react';
import { Expense } from '@/types';
import { cloudExportService, ExportTemplate } from '@/lib/cloudExportService';
import { formatCurrency } from '@/lib/utils';

interface ExportTemplatesProps {
  expenses: Expense[];
  onExport: (isProcessing: boolean) => void;
}

export const ExportTemplates: React.FC<ExportTemplatesProps> = ({
  expenses,
  onExport,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const templates = cloudExportService.getTemplates();
  const categories = [
    { id: 'all', name: 'All Templates', icon: '📋', color: 'gray' },
    { id: 'business', name: 'Business', icon: '💼', color: 'blue' },
    { id: 'personal', name: 'Personal', icon: '👤', color: 'green' },
    { id: 'tax', name: 'Tax & Legal', icon: '📊', color: 'purple' },
    { id: 'analysis', name: 'Analysis', icon: '🎯', color: 'orange' },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleTemplateSelect = (template: ExportTemplate) => {
    setSelectedTemplate(template.id);
  };

  const handleExportNow = async (template: ExportTemplate) => {
    onExport(true);
    try {
      const jobId = await cloudExportService.createExportJob(template.id, expenses);
      // Show success notification in real app
      console.log('Export job created:', jobId);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setTimeout(() => onExport(false), 3000); // Simulate processing time
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Export Templates</h3>
        <p className="text-gray-600 mb-4">
          Choose from professionally designed templates optimized for different use cases
        </p>
        <div className="flex space-x-4 text-sm">
          <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
            <span className="font-semibold text-blue-600">{expenses.length}</span>
            <span className="text-gray-600 ml-1">records ready</span>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
            <span className="font-semibold text-green-600">{formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</span>
            <span className="text-gray-600 ml-1">total value</span>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
            <span className="font-semibold text-purple-600">{templates.length}</span>
            <span className="text-gray-600 ml-1">templates available</span>
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
                ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
              selectedTemplate === template.id
                ? 'border-purple-300 shadow-lg ring-4 ring-purple-100'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <div className="p-6">
              {/* Template Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{template.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-900">{template.name}</h4>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                      template.category === 'business' ? 'bg-blue-100 text-blue-700' :
                      template.category === 'personal' ? 'bg-green-100 text-green-700' :
                      template.category === 'tax' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {template.category}
                    </span>
                  </div>
                </div>
                <div className={`px-2 py-1 text-xs rounded font-medium ${
                  template.format === 'pdf' ? 'bg-red-100 text-red-700' :
                  template.format === 'excel' ? 'bg-green-100 text-green-700' :
                  template.format === 'csv' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {template.format.toUpperCase()}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4">{template.description}</p>

              {/* Use Case */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                  Best For
                </p>
                <p className="text-sm text-gray-700">{template.useCase}</p>
              </div>

              {/* Fields Preview */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
                  Included Fields
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.fields.slice(0, 4).map((field, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {field}
                    </span>
                  ))}
                  {template.fields.length > 4 && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                      +{template.fields.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportNow(template);
                  }}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Export Now
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
        <h4 className="font-bold text-gray-900 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
            <div className="text-2xl">⚡</div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Quick CSV</div>
              <div className="text-sm text-gray-500">Export all data instantly</div>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
            <div className="text-2xl">🔄</div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Repeat Last</div>
              <div className="text-sm text-gray-500">Use your last template</div>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
            <div className="text-2xl">➕</div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Custom Template</div>
              <div className="text-sm text-gray-500">Create your own</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};