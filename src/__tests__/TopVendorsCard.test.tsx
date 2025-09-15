import { render, screen, fireEvent } from '@testing-library/react';
import { TopVendorsCard } from '@/components/TopVendorsCard';
import { Vendor } from '@/types';

const mockVendors: Vendor[] = [
  {
    name: 'Amazon',
    totalSpent: 250.00,
    transactionCount: 5,
    categories: ['Shopping', 'Entertainment'],
    averageTransaction: 50.00,
    firstTransaction: '2024-01-01',
    lastTransaction: '2024-01-15',
  },
  {
    name: 'Shell',
    totalSpent: 180.75,
    transactionCount: 6,
    categories: ['Transportation'],
    averageTransaction: 30.13,
    firstTransaction: '2024-01-03',
    lastTransaction: '2024-01-13',
  },
  {
    name: 'Target',
    totalSpent: 156.90,
    transactionCount: 4,
    categories: ['Shopping'],
    averageTransaction: 39.23,
    firstTransaction: '2024-01-06',
    lastTransaction: '2024-01-10',
  },
  {
    name: 'Starbucks',
    totalSpent: 125.50,
    transactionCount: 10,
    categories: ['Food'],
    averageTransaction: 12.55,
    firstTransaction: '2024-01-02',
    lastTransaction: '2024-01-14',
  },
  {
    name: 'Walmart',
    totalSpent: 89.25,
    transactionCount: 3,
    categories: ['Shopping', 'Food'],
    averageTransaction: 29.75,
    firstTransaction: '2024-01-04',
    lastTransaction: '2024-01-12',
  },
  {
    name: 'McDonald\'s',
    totalSpent: 67.80,
    transactionCount: 8,
    categories: ['Food'],
    averageTransaction: 8.48,
    firstTransaction: '2024-01-05',
    lastTransaction: '2024-01-11',
  },
];

describe('TopVendorsCard', () => {
  it('renders loading state', () => {
    render(<TopVendorsCard vendors={[]} isLoading={true} />);

    // Should show skeleton loading animation
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty state when no vendors', () => {
    render(<TopVendorsCard vendors={[]} isLoading={false} />);

    expect(screen.getByText('No vendors found')).toBeInTheDocument();
    expect(screen.getByText('Add some expenses to see your top vendors')).toBeInTheDocument();
  });

  it('renders vendor list correctly', () => {
    render(<TopVendorsCard vendors={mockVendors} limit={3} />);

    expect(screen.getByText('Top Vendors')).toBeInTheDocument();
    expect(screen.getByText('Top Vendor')).toBeInTheDocument();
    expect(screen.getAllByText('Amazon')).toHaveLength(2); // Once in header, once in list

    // Should show top 3 vendors (Amazon already checked above)
    // Based on the sorting (by totalSpent desc): Amazon (250), Shell (180.75), Target (156.90)
    expect(screen.getByText('Shell')).toBeInTheDocument();
    expect(screen.getByText('Target')).toBeInTheDocument();

    // Should not show vendors beyond limit
    expect(screen.queryByText('Starbucks')).not.toBeInTheDocument();
    expect(screen.queryByText('Walmart')).not.toBeInTheDocument();
  });

  it('displays vendor information correctly', () => {
    render(<TopVendorsCard vendors={mockVendors} limit={1} />);

    // Check if Amazon (top vendor) is displayed with correct info
    expect(screen.getAllByText('Amazon')).toHaveLength(2); // Header and list
    expect(screen.getByText('$250.00')).toBeInTheDocument();
    expect(screen.getByText('5 transactions • Avg: $50.00')).toBeInTheDocument();

    // Check percentage calculation (Amazon: 250/870 * 100 ≈ 28.7%)
    expect(screen.getByText('28.7%')).toBeInTheDocument();
  });

  it('shows/hides additional vendors with show all button', () => {
    render(<TopVendorsCard vendors={mockVendors} limit={3} />);

    // Initially shows only 3 vendors
    expect(screen.getAllByText('Amazon')).toHaveLength(2); // Once in header, once in list
    expect(screen.getByText('Shell')).toBeInTheDocument();
    expect(screen.getByText('Target')).toBeInTheDocument();
    expect(screen.queryByText('Starbucks')).not.toBeInTheDocument();

    // Show all button should be present
    const showAllButton = screen.getByText('Show All (6)');
    expect(showAllButton).toBeInTheDocument();

    // Click show all
    fireEvent.click(showAllButton);

    // Now should show all vendors
    expect(screen.getByText('Starbucks')).toBeInTheDocument();
    expect(screen.getByText('Walmart')).toBeInTheDocument();
    expect(screen.getByText('McDonald\'s')).toBeInTheDocument();

    // Button should now say "Show Less"
    expect(screen.getByText('Show Less')).toBeInTheDocument();
  });

  it('displays summary statistics', () => {
    render(<TopVendorsCard vendors={mockVendors} />);

    expect(screen.getByText('6')).toBeInTheDocument(); // Total vendors
    expect(screen.getByText('Total Vendors')).toBeInTheDocument();
    expect(screen.getByText('$870.20')).toBeInTheDocument(); // Total spent
    expect(screen.getByText('Total Spent')).toBeInTheDocument();
  });

  it('handles single transaction vendor correctly', () => {
    const singleTransactionVendor: Vendor[] = [{
      name: 'One-Time Store',
      totalSpent: 50.00,
      transactionCount: 1,
      categories: ['Shopping'],
      averageTransaction: 50.00,
      firstTransaction: '2024-01-01',
      lastTransaction: '2024-01-01',
    }];

    render(<TopVendorsCard vendors={singleTransactionVendor} />);

    expect(screen.getByText('1 transaction • Avg: $50.00')).toBeInTheDocument();
  });

  it('displays vendor rankings correctly', () => {
    render(<TopVendorsCard vendors={mockVendors} limit={3} />);

    // Check that vendor rankings are displayed (1, 2, 3)
    const rankings = screen.getAllByText(/^[123]$/);
    expect(rankings).toHaveLength(3);

    // Check that rank 1 is displayed
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('does not show show all button when vendors count is within limit', () => {
    render(<TopVendorsCard vendors={mockVendors.slice(0, 3)} limit={5} />);

    // Should not show "Show All" button since we have 3 vendors with limit of 5
    expect(screen.queryByText(/Show All/)).not.toBeInTheDocument();
  });

  it('applies correct styling and layout', () => {
    render(<TopVendorsCard vendors={mockVendors} limit={2} />);

    // Check for vendor items
    const vendorItems = document.querySelectorAll('.bg-gray-50');
    expect(vendorItems.length).toBeGreaterThan(0);

    // Check for main container classes
    const mainContainer = document.querySelector('.bg-white.rounded-lg.shadow-md');
    expect(mainContainer).toBeInTheDocument();
  });
});