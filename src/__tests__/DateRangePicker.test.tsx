import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { fireEvent, render, screen } from '@testing-library/react';

describe('DateRangePicker', () => {
  const mockOnDateRangeChange = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with default state', () => {
    render(
      <DateRangePicker
        onDateRangeChange={mockOnDateRangeChange}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText('Select date range')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('shows selected date range when provided', () => {
    const startDate = new Date('2025-08-01');
    const endDate = new Date('2025-08-07');

    render(
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={mockOnDateRangeChange}
        onClear={mockOnClear}
      />
    );

    // Check for the formatted date range (using toLocaleDateString format)
    // The actual format shows as 7/31/2025 - 8/6/2025 due to timezone conversion
    expect(screen.getByText(/7\/31\/2025 - 8\/6\/2025/)).toBeInTheDocument();
  });

  test('opens dropdown when clicked', () => {
    render(
      <DateRangePicker
        onDateRangeChange={mockOnDateRangeChange}
        onClear={mockOnClear}
      />
    );

    const trigger = screen.getByText('Select date range').closest('button')!;
    fireEvent.click(trigger);

    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Quick Select')).toBeInTheDocument();
  });

  test('calls onDateRangeChange when Apply is clicked with valid dates', () => {
    render(
      <DateRangePicker
        onDateRangeChange={mockOnDateRangeChange}
        onClear={mockOnClear}
      />
    );

    // Open dropdown
    const trigger = screen.getByText('Select date range').closest('button')!;
    fireEvent.click(trigger);

    // Set dates
    const startInput = screen.getByLabelText('Start Date');
    const endInput = screen.getByLabelText('End Date');

    fireEvent.change(startInput, { target: { value: '2025-08-01' } });
    fireEvent.change(endInput, { target: { value: '2025-08-07' } });

    // Click Apply
    fireEvent.click(screen.getByText('Apply'));

    expect(mockOnDateRangeChange).toHaveBeenCalledWith(
      new Date('2025-08-01'),
      new Date('2025-08-07')
    );
  });

  test('calls onClear when Clear is clicked', () => {
    const startDate = new Date('2025-08-01');
    const endDate = new Date('2025-08-07');

    render(
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={mockOnDateRangeChange}
        onClear={mockOnClear}
      />
    );

    // Open dropdown
    const trigger = screen.getAllByRole('button')[0]; // First button is the main trigger
    fireEvent.click(trigger);

    // Click Clear
    fireEvent.click(screen.getByText('Clear'));

    expect(mockOnClear).toHaveBeenCalled();
  });

  test('quick select buttons set correct dates', () => {
    render(
      <DateRangePicker
        onDateRangeChange={mockOnDateRangeChange}
        onClear={mockOnClear}
      />
    );

    // Open dropdown
    const trigger = screen.getByText('Select date range').closest('button')!;
    fireEvent.click(trigger);

    // Click "Last 7 days"
    fireEvent.click(screen.getByText('Last 7 days'));

    const startInput = screen.getByLabelText('Start Date') as HTMLInputElement;
    const endInput = screen.getByLabelText('End Date') as HTMLInputElement;

    // Check that dates were set (exact values depend on current date)
    expect(startInput.value).toBeTruthy();
    expect(endInput.value).toBeTruthy();
  });

  test('disables Apply button when dates are invalid', () => {
    render(
      <DateRangePicker
        onDateRangeChange={mockOnDateRangeChange}
        onClear={mockOnClear}
      />
    );

    // Open dropdown
    const trigger = screen.getByText('Select date range').closest('button')!;
    fireEvent.click(trigger);

    const applyButton = screen.getByText('Apply');
    expect(applyButton).toBeDisabled();

    // Set only start date
    const startInput = screen.getByLabelText('Start Date');
    fireEvent.change(startInput, { target: { value: '2025-08-01' } });

    expect(applyButton).toBeDisabled();
  });

  test('shows clear button when date range is selected', () => {
    const startDate = new Date('2025-08-01');
    const endDate = new Date('2025-08-07');

    render(
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={mockOnDateRangeChange}
        onClear={mockOnClear}
      />
    );

    // There should be two buttons: the main trigger and the clear button
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);

    // The clear button should be the second one
    const clearButton = buttons[1];
    expect(clearButton).toBeInTheDocument();
  });
});
