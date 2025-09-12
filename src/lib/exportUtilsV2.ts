import { Expense } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

// Dynamic imports for PDF generation to avoid SSR issues
let jsPDF: typeof import('jspdf').default | null = null;
let autoTable: typeof import('jspdf-autotable').default | null = null;

const initializePDFLibraries = async () => {
  if (!jsPDF) {
    const jsPDFModule = await import('jspdf');
    jsPDF = jsPDFModule.default;
    
    const autoTableModule = await import('jspdf-autotable');
    autoTable = autoTableModule.default;
  }
};

export type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportOptions {
  title?: string;
  includeMetadata?: boolean;
  dateFormat?: 'short' | 'long';
}

class ExportUtilsV2 {
  /**
   * Main export function that routes to appropriate format handler
   */
  async exportData(
    expenses: Expense[], 
    format: ExportFormat, 
    filename: string,
    options: ExportOptions = {}
  ): Promise<void> {
    if (expenses.length === 0) {
      throw new Error('No data to export');
    }

    // Add artificial delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 800));

    switch (format) {
      case 'csv':
        return this.exportToCSV(expenses, filename, options);
      case 'json':
        return this.exportToJSON(expenses, filename, options);
      case 'pdf':
        return this.exportToPDF(expenses, filename, options);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Enhanced CSV export with better formatting and metadata
   */
  private exportToCSV(expenses: Expense[], filename: string, options: ExportOptions): void {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Created At', 'Updated At'];
    
    // Sort expenses by date (newest first)
    const sortedExpenses = [...expenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const rows = sortedExpenses.map(expense => [
      formatDate(expense.date),
      this.escapeCSVValue(expense.description),
      expense.category,
      expense.amount.toString(),
      this.formatDateTime(expense.createdAt),
      this.formatDateTime(expense.updatedAt),
    ]);

    // Calculate totals and summary
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryBreakdown = this.getCategoryBreakdown(expenses);

    let csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // Add metadata footer if requested
    if (options.includeMetadata !== false) {
      csvContent += '\n\n';
      csvContent += '"=== EXPORT SUMMARY ==="\n';
      csvContent += `"Total Records:",${expenses.length}\n`;
      csvContent += `"Total Amount:",${totalAmount}\n`;
      csvContent += `"Export Date:",${new Date().toISOString()}\n`;
      csvContent += '\n"=== CATEGORY BREAKDOWN ==="\n';
      
      categoryBreakdown.forEach(({ category, amount, count }) => {
        csvContent += `"${category}:",${amount},(${count} records)\n`;
      });
    }

    this.downloadFile(csvContent, filename, 'text/csv');
  }

  /**
   * Enhanced JSON export with metadata and statistics
   */
  private exportToJSON(expenses: Expense[], filename: string, options: ExportOptions): void {
    // Sort expenses by date (newest first)
    const sortedExpenses = [...expenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryBreakdown = this.getCategoryBreakdown(expenses);
    
    const exportData = {
      metadata: {
        title: options.title || 'Expense Tracker Export',
        exportDate: new Date().toISOString(),
        version: '2.0',
        format: 'json',
        recordCount: expenses.length,
        totalAmount,
        dateRange: {
          earliest: expenses.length > 0 ? Math.min(...expenses.map(e => new Date(e.date).getTime())) : null,
          latest: expenses.length > 0 ? Math.max(...expenses.map(e => new Date(e.date).getTime())) : null,
        }
      },
      summary: {
        totalRecords: expenses.length,
        totalAmount,
        averageAmount: expenses.length > 0 ? totalAmount / expenses.length : 0,
        categoryBreakdown: categoryBreakdown.map(item => ({
          ...item,
          percentage: (item.amount / totalAmount) * 100
        }))
      },
      expenses: sortedExpenses.map(expense => ({
        ...expense,
        formattedAmount: formatCurrency(expense.amount),
        formattedDate: formatDate(expense.date),
      }))
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  /**
   * Professional PDF export with tables and charts
   */
  private async exportToPDF(expenses: Expense[], filename: string, options: ExportOptions): Promise<void> {
    await initializePDFLibraries();
    
    if (!jsPDF || !autoTable) {
      throw new Error('PDF libraries failed to load');
    }
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Title and header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(options.title || 'Expense Report', pageWidth / 2, 20, { align: 'center' });
    
    // Subtitle with date range
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const dateRange = this.getDateRange(expenses);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(dateRange, pageWidth / 2, 40, { align: 'center' });
    
    // Summary statistics
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryBreakdown = this.getCategoryBreakdown(expenses);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, 60);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Records: ${expenses.length}`, 20, 70);
    doc.text(`Total Amount: ${formatCurrency(totalAmount)}`, 20, 80);
    doc.text(`Average per Transaction: ${formatCurrency(totalAmount / expenses.length)}`, 20, 90);
    
    // Category breakdown table
    if (categoryBreakdown.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Category Breakdown', 20, 110);
      
      const categoryTableData = categoryBreakdown.map(item => [
        item.category,
        item.count.toString(),
        formatCurrency(item.amount),
        `${((item.amount / totalAmount) * 100).toFixed(1)}%`
      ]);
      
      autoTable(doc, {
        startY: 120,
        head: [['Category', 'Count', 'Amount', 'Percentage']],
        body: categoryTableData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] },
        theme: 'striped',
        margin: { left: 20, right: 20 }
      });
    }

    // Main expense table
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Transactions', 20, 20);
    
    // Sort expenses by date (newest first)
    const sortedExpenses = [...expenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const tableData = sortedExpenses.map(expense => [
      formatDate(expense.date),
      expense.description.length > 25 ? expense.description.substring(0, 25) + '...' : expense.description,
      expense.category,
      formatCurrency(expense.amount)
    ]);
    
    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Description', 'Category', 'Amount']],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
      theme: 'striped',
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 65 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25, halign: 'right' }
      }
    });
    
    // Footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    const pdfData = doc.output('blob');
    const url = window.URL.createObjectURL(pdfData);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Helper function to download files
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Helper function to escape CSV values
   */
  private escapeCSVValue(value: string): string {
    return value.replace(/"/g, '""');
  }

  /**
   * Helper function to format date-time
   */
  private formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  /**
   * Helper function to get category breakdown
   */
  private getCategoryBreakdown(expenses: Expense[]) {
    const breakdown = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = { count: 0, amount: 0 };
      }
      acc[expense.category].count++;
      acc[expense.category].amount += expense.amount;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    return Object.entries(breakdown)
      .map(([category, data]) => ({
        category,
        count: data.count,
        amount: data.amount
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Helper function to get date range string
   */
  private getDateRange(expenses: Expense[]): string {
    if (expenses.length === 0) return 'No data';
    
    const dates = expenses.map(e => new Date(e.date).getTime());
    const earliest = new Date(Math.min(...dates));
    const latest = new Date(Math.max(...dates));
    
    if (earliest.getTime() === latest.getTime()) {
      return `Date: ${formatDate(earliest.toISOString())}`;
    }
    
    return `Period: ${formatDate(earliest.toISOString())} - ${formatDate(latest.toISOString())}`;
  }
}

export const exportUtilsV2 = new ExportUtilsV2();