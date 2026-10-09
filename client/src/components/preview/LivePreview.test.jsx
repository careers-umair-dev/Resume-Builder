import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import LivePreview from './LivePreview';
import { usePdfDocument } from '../../hooks/usePdfDocument';

vi.mock('../../hooks/usePdfDocument', () => ({ usePdfDocument: vi.fn() }));
vi.mock('./PdfPages', () => ({ default: () => <div data-testid="resume-pages" />, A4_CSS_WIDTH: 794 }));

beforeEach(() => {
  window.print = vi.fn();
  usePdfDocument.mockReturnValue({ doc: { numPages: 1 }, loading: false, error: '', empty: false, retry: vi.fn() });
});

describe('live preview print', () => {
  it('prints the resume preview and keeps the print area available', () => {
    const { container } = render(<LivePreview payload={{}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Print resume' }));
    expect(window.print).toHaveBeenCalledOnce();
    expect(container.querySelector('.print-preview-root')).toBeInTheDocument();
    expect(screen.getByTestId('resume-pages')).toBeInTheDocument();
    expect(document.body).toHaveClass('printing-resume');
    fireEvent(window, new Event('afterprint'));
    expect(document.body).not.toHaveClass('printing-resume');
  });

  it('disables printing while the preview is updating', () => {
    usePdfDocument.mockReturnValue({ doc: { numPages: 1 }, loading: false, error: '', empty: false, retry: vi.fn() });
    render(<LivePreview payload={{}} pending />);
    expect(screen.getByRole('button', { name: 'Print resume' })).toBeDisabled();
  });
});
