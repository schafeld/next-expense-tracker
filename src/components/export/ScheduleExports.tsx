'use client';

import { useState } from 'react';
import { Expense } from '@/types';
import { cloudExportService } from '@/lib/cloudExportService';
import { formatCurrency } from '@/lib/utils';

interface ScheduleExportsProps {
  expenses: Expense[];
  connections: Array<{
    service: string;
    connected: boolean;
    status: string;
  }>;
}

interface NewSchedule {
  name: string;
  template: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string;
  destinations: string[];
  filters: {
    categories: string[];
    dateRange: 'all' | 'last30' | 'last90' | 'thisMonth' | 'thisQuarter';
  };
}

export const ScheduleExports: React.FC<ScheduleExportsProps> = ({
  expenses,
  connections,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'create'>('active');
  const [schedules] = useState(cloudExportService.getScheduledExports());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState<NewSchedule>({
    name: '',
    template: 'monthly-summary',
    frequency: 'monthly',
    dayOfMonth: 1,
    time: '09:00',
    destinations: [],
    filters: {
      categories: [],
      dateRange: 'thisMonth',
    },
  });

  const templates = cloudExportService.getTemplates();
  const connectedServices = connections.filter(c => c.connected);

  const frequencyOptions = [
    { value: 'daily', label: 'Daily', icon: '📅', description: 'Every day at specified time' },
    { value: 'weekly', label: 'Weekly', icon: '📊', description: 'Every week on selected day' },
    { value: 'monthly', label: 'Monthly', icon: '📆', description: 'Every month on selected date' },
    { value: 'quarterly', label: 'Quarterly', icon: '📋', description: 'Every 3 months' },
  ];

  const getNextRunTime = (schedule: { nextRun: string }) => {
    const nextRun = new Date(schedule.nextRun);
    const now = new Date();
    const diffInMs = nextRun.getTime() - now.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMs < 0) return 'Overdue';
    if (diffInDays > 0) return `in ${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
    if (diffInHours > 0) return `in ${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
    return 'Soon';
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '📅';
      case 'weekly': return '📊';
      case 'monthly': return '📆';
      case 'quarterly': return '📋';
      default: return '⏰';
    }
  };

  const handleCreateSchedule = () => {
    console.log('Creating schedule:', newSchedule);
    // In a real app, this would call an API to create the schedule
    setShowCreateForm(false);
    // Reset form
    setNewSchedule({
      name: '',
      template: 'monthly-summary',
      frequency: 'monthly',
      dayOfMonth: 1,
      time: '09:00',
      destinations: [],
      filters: {
        categories: [],
        dateRange: 'thisMonth',
      },
    });
  };

  const handleToggleSchedule = (scheduleId: string, enabled: boolean) => {
    console.log(`Toggle schedule ${scheduleId}: ${enabled}`);
    // In a real app, this would call an API
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Automated Exports</h3>
        <p className="text-gray-600 mb-4">
          Set up recurring exports to keep your data synchronized automatically
        </p>
        
        {/* Stats */}
        <div className="flex space-x-4 text-sm">
          <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
            <span className="font-semibold text-green-600">
              {schedules.filter(s => s.enabled).length}
            </span>
            <span className="text-gray-600 ml-1">active schedules</span>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
            <span className="font-semibold text-blue-600">
              {schedules.reduce((sum, s) => sum + s.runCount, 0)}
            </span>
            <span className="text-gray-600 ml-1">total runs</span>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
            <span className="font-semibold text-orange-600">{connectedServices.length}</span>
            <span className="text-gray-600 ml-1">destinations</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Schedules ({schedules.filter(s => s.enabled).length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create New
          </button>
        </div>

        {activeTab === 'active' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm font-medium"
          >
            ➕ New Schedule
          </button>
        )}
      </div>

      {activeTab === 'active' && (
        <div className="space-y-4">
          {/* Active Schedules */}
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`bg-white rounded-xl border-2 p-6 transition-all ${
                schedule.enabled
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-2xl">{getFrequencyIcon(schedule.frequency)}</div>
                    <div>
                      <h4 className="font-bold text-gray-900">{schedule.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{schedule.template}</span>
                        <span>•</span>
                        <span className="capitalize">{schedule.frequency}</span>
                        <span>•</span>
                        <span>Next: {getNextRunTime(schedule)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Destinations */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                      Destinations
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {schedule.destination.map((dest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700"
                        >
                          {dest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Run Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Total Runs</div>
                      <div className="font-semibold text-gray-900">{schedule.runCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Last Run</div>
                      <div className="font-semibold text-gray-900">
                        {schedule.lastRun 
                          ? cloudExportService.getRelativeTime(schedule.lastRun)
                          : 'Never'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Success Rate</div>
                      <div className="font-semibold text-green-600">98.5%</div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-3 ml-6">
                  {/* Status Toggle */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={schedule.enabled}
                      onChange={(e) => handleToggleSchedule(schedule.id, e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-sm text-gray-600">
                      {schedule.enabled ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      ⚙️
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                      ▶️
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {schedules.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏰</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No scheduled exports</h4>
              <p className="text-gray-500 mb-4">Automate your exports to save time and stay organized</p>
              <button
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Create Your First Schedule
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Schedule Templates */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-bold text-gray-900 mb-4">Quick Setup Templates</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: 'Weekly Team Report',
                  description: 'Every Monday at 9 AM',
                  frequency: 'weekly',
                  template: 'business-expenses',
                  popular: true,
                },
                {
                  name: 'Monthly Tax Prep',
                  description: '1st of every month',
                  frequency: 'monthly',
                  template: 'tax-report',
                  popular: true,
                },
                {
                  name: 'Quarterly Review',
                  description: 'Every quarter end',
                  frequency: 'quarterly',
                  template: 'category-analysis',
                  popular: false,
                },
              ].map((template, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setNewSchedule({
                      ...newSchedule,
                      name: template.name,
                      frequency: template.frequency as 'daily' | 'weekly' | 'monthly' | 'quarterly',
                      template: template.template,
                    });
                    setShowCreateForm(true);
                  }}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-gray-900">{template.name}</h5>
                    {template.popular && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <div className="text-xs text-orange-600 font-medium">Use Template →</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Schedule Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-gray-900">Create Custom Schedule</h4>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                >
                  Custom Setup →
                </button>
              )}
            </div>

            {showCreateForm && (
              <form onSubmit={(e) => { e.preventDefault(); handleCreateSchedule(); }} className="space-y-6">
                {/* Schedule Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Name
                  </label>
                  <input
                    type="text"
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Monthly Expense Summary"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Export Template
                    </label>
                    <select
                      value={newSchedule.template}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, template: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                    >
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={newSchedule.frequency}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'quarterly' }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                    >
                      {frequencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Timing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {newSchedule.frequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day of Week
                      </label>
                      <select
                        value={newSchedule.dayOfWeek || 1}
                        onChange={(e) => setNewSchedule(prev => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                      >
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                          <option key={index} value={index}>{day}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {newSchedule.frequency === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day of Month
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={newSchedule.dayOfMonth || 1}
                        onChange={(e) => setNewSchedule(prev => ({ ...prev, dayOfMonth: Number(e.target.value) }))}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={newSchedule.time}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Destinations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinations
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {connectedServices.map((service) => (
                      <label key={service.service} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={newSchedule.destinations.includes(service.service)}
                          onChange={(e) => {
                            const destinations = e.target.checked
                              ? [...newSchedule.destinations, service.service]
                              : newSchedule.destinations.filter(d => d !== service.service);
                            setNewSchedule(prev => ({ ...prev, destinations }));
                          }}
                          className="rounded text-orange-600"
                        />
                        <span className="text-sm font-medium">{service.service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newSchedule.name || newSchedule.destinations.length === 0}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Schedule
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Runs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-bold text-gray-900 mb-4">Upcoming Runs</h4>
        <div className="space-y-3">
          {schedules
            .filter(s => s.enabled)
            .sort((a, b) => new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime())
            .slice(0, 5)
            .map((schedule, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">{getFrequencyIcon(schedule.frequency)}</div>
                  <div>
                    <div className="font-medium text-gray-900">{schedule.name}</div>
                    <div className="text-sm text-gray-500">{schedule.template}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {getNextRunTime(schedule)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(schedule.nextRun).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {schedules.filter(s => s.enabled).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No upcoming scheduled exports
          </div>
        )}
      </div>
    </div>
  );
};