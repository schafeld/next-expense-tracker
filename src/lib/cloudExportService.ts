import { Expense } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'business' | 'personal' | 'tax' | 'analysis';
  fields: string[];
  format: 'csv' | 'excel' | 'pdf' | 'json';
  useCase: string;
}

export interface ExportJob {
  id: string;
  template: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'shared';
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  shareUrl?: string;
  recordCount: number;
  fileSize: string;
  recipient?: string;
  destination?: string;
}

export interface ScheduledExport {
  id: string;
  name: string;
  template: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  nextRun: string;
  destination: string[];
  enabled: boolean;
  lastRun?: string;
  runCount: number;
}

class CloudExportService {
  private exportTemplates: ExportTemplate[] = [
    {
      id: 'tax-report',
      name: 'Tax Deduction Report',
      description: 'IRS-ready expense report with categorized deductions',
      icon: '📊',
      category: 'tax',
      fields: ['Date', 'Description', 'Category', 'Amount', 'Tax Category', 'Receipt Status'],
      format: 'pdf',
      useCase: 'Perfect for tax season - includes business expense categories'
    },
    {
      id: 'monthly-summary',
      name: 'Monthly Summary',
      description: 'Clean overview of monthly spending patterns',
      icon: '📅',
      category: 'personal',
      fields: ['Month', 'Category', 'Total Spent', 'Transaction Count', 'Average'],
      format: 'excel',
      useCase: 'Track spending trends and identify budget opportunities'
    },
    {
      id: 'business-expenses',
      name: 'Business Expense Report',
      description: 'Professional report for expense reimbursements',
      icon: '💼',
      category: 'business',
      fields: ['Date', 'Vendor', 'Description', 'Amount', 'Category', 'Project Code'],
      format: 'pdf',
      useCase: 'Submit to HR or accounting department for reimbursement'
    },
    {
      id: 'category-analysis',
      name: 'Category Breakdown',
      description: 'Deep dive into spending by category with charts',
      icon: '🎯',
      category: 'analysis',
      fields: ['Category', 'Amount', 'Percentage', 'Trend', 'Budget vs Actual'],
      format: 'pdf',
      useCase: 'Understand where your money goes and optimize spending'
    },
    {
      id: 'raw-data',
      name: 'Complete Data Export',
      description: 'All expense data in spreadsheet format',
      icon: '📋',
      category: 'personal',
      fields: ['All Fields'],
      format: 'csv',
      useCase: 'Import into other financial tools or perform custom analysis'
    },
    {
      id: 'receipt-tracker',
      name: 'Receipt Tracking Log',
      description: 'Track which expenses need receipt documentation',
      icon: '🧾',
      category: 'business',
      fields: ['Date', 'Description', 'Amount', 'Receipt Status', 'Notes'],
      format: 'excel',
      useCase: 'Ensure compliance and organize receipt collection'
    }
  ];

  private exportHistory: ExportJob[] = [
    {
      id: 'job-001',
      template: 'Tax Deduction Report',
      status: 'completed',
      createdAt: '2025-01-10T09:30:00Z',
      completedAt: '2025-01-10T09:32:15Z',
      downloadUrl: '#',
      shareUrl: 'https://exports.expensetracker.com/share/abc123',
      recordCount: 156,
      fileSize: '2.3 MB',
      destination: 'email'
    },
    {
      id: 'job-002',
      template: 'Monthly Summary',
      status: 'shared',
      createdAt: '2025-01-08T14:15:00Z',
      completedAt: '2025-01-08T14:16:30Z',
      downloadUrl: '#',
      shareUrl: 'https://exports.expensetracker.com/share/def456',
      recordCount: 89,
      fileSize: '1.8 MB',
      recipient: 'accountant@company.com',
      destination: 'google-sheets'
    },
    {
      id: 'job-003',
      template: 'Business Expense Report',
      status: 'processing',
      createdAt: '2025-01-12T11:20:00Z',
      recordCount: 203,
      fileSize: 'Calculating...',
      destination: 'dropbox'
    },
    {
      id: 'job-004',
      template: 'Category Analysis',
      status: 'failed',
      createdAt: '2025-01-07T16:45:00Z',
      recordCount: 156,
      fileSize: '0 MB',
      destination: 'email'
    }
  ];

  private scheduledExports: ScheduledExport[] = [
    {
      id: 'schedule-001',
      name: 'Weekly Team Report',
      template: 'Business Expense Report',
      frequency: 'weekly',
      nextRun: '2025-01-17T09:00:00Z',
      destination: ['Google Sheets', 'Email'],
      enabled: true,
      lastRun: '2025-01-10T09:00:00Z',
      runCount: 12
    },
    {
      id: 'schedule-002',
      name: 'Monthly Tax Prep',
      template: 'Tax Deduction Report',
      frequency: 'monthly',
      nextRun: '2025-02-01T08:00:00Z',
      destination: ['Dropbox'],
      enabled: true,
      lastRun: '2025-01-01T08:00:00Z',
      runCount: 3
    },
    {
      id: 'schedule-003',
      name: 'Quarterly Analysis',
      template: 'Category Analysis',
      frequency: 'quarterly',
      nextRun: '2025-04-01T07:00:00Z',
      destination: ['Email', 'OneDrive'],
      enabled: false,
      runCount: 1
    }
  ];

  /**
   * Get all available export templates
   */
  getTemplates(): ExportTemplate[] {
    return this.exportTemplates;
  }

  /**
   * Get templates filtered by category
   */
  getTemplatesByCategory(category: string): ExportTemplate[] {
    return this.exportTemplates.filter(template => template.category === category);
  }

  /**
   * Get export history
   */
  getExportHistory(): ExportJob[] {
    return this.exportHistory.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get scheduled exports
   */
  getScheduledExports(): ScheduledExport[] {
    return this.scheduledExports;
  }

  /**
   * Create a new export job
   */
  async createExportJob(
    templateId: string, 
    expenses: Expense[], 
    destination?: string,
    recipient?: string
  ): Promise<string> {
    const template = this.exportTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const jobId = `job-${Date.now()}`;
    const newJob: ExportJob = {
      id: jobId,
      template: template.name,
      status: 'processing',
      createdAt: new Date().toISOString(),
      recordCount: expenses.length,
      fileSize: 'Processing...',
      destination,
      recipient
    };

    this.exportHistory.unshift(newJob);

    // Simulate processing time
    setTimeout(() => {
      const job = this.exportHistory.find(j => j.id === jobId);
      if (job) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.fileSize = this.calculateFileSize(expenses.length, template.format);
        job.downloadUrl = '#';
        job.shareUrl = `https://exports.expensetracker.com/share/${Math.random().toString(36).substring(7)}`;
      }
    }, 2000 + Math.random() * 3000);

    return jobId;
  }

  /**
   * Generate shareable link for expenses
   */
  async generateShareableLink(expenses: Expense[], expirationDays: number = 7): Promise<{
    url: string;
    qrCode: string;
    expiresAt: string;
  }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const shareId = Math.random().toString(36).substring(7);
    const url = `https://share.expensetracker.com/view/${shareId}`;
    const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString();

    // Generate QR code will be handled by the component
    return {
      url,
      qrCode: '', // Will be generated in component
      expiresAt
    };
  }

  /**
   * Simulate integration connection
   */
  async connectIntegration(service: string): Promise<boolean> {
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 90% success rate for demo
    return Math.random() > 0.1;
  }

  /**
   * Export to specific integration
   */
  async exportToIntegration(
    service: string, 
    expenses: Expense[], 
    templateId: string
  ): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return this.createExportJob(templateId, expenses, service);
  }

  /**
   * Calculate estimated file size based on record count and format
   */
  private calculateFileSize(recordCount: number, format: string): string {
    let sizeInKB: number;
    
    switch (format) {
      case 'csv':
        sizeInKB = recordCount * 0.5; // ~0.5KB per record
        break;
      case 'excel':
        sizeInKB = recordCount * 1.2; // ~1.2KB per record
        break;
      case 'pdf':
        sizeInKB = Math.max(recordCount * 2.5, 50); // ~2.5KB per record, min 50KB
        break;
      case 'json':
        sizeInKB = recordCount * 0.8; // ~0.8KB per record
        break;
      default:
        sizeInKB = recordCount * 1;
    }

    if (sizeInKB < 1024) {
      return `${Math.round(sizeInKB)} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(1)} MB`;
    }
  }

  /**
   * Format relative time
   */
  getRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return formatDate(dateString);
  }
}

export const cloudExportService = new CloudExportService();