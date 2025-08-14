import React, { useRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import LayoutPrinter from './LayoutPrinter';

// --- Mocks ---

// Mock external libraries to isolate the component
vi.mock('html-to-image', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        toJpeg: vi.fn(() => Promise.resolve('data:image/jpeg;base64,')),
        toSvg: vi.fn(() => Promise.resolve('data:image/svg+xml;base64,')),
    };
});

const mockJspdfInstance = {
    addImage: vi.fn(),
    html: vi.fn((_html, options) => {
        options.callback({
            save: vi.fn(),
            output: vi.fn(() => 'blob:url'),
        });
    }),
    internal: {
        pageSize: {
            getWidth: () => 842,
            getHeight: () => 595,
        },
    },
};

vi.mock('jspdf', () => ({
    default: vi.fn(() => mockJspdfInstance),
}));

vi.mock('react-dom/server', () => ({
    renderToStaticMarkup: vi.fn(() => '<div>Mocked Static Markup</div>'),
}));

// Mock UI components for simplicity
vi.mock('react-icons/fa', () => ({ FaPrint: () => <span>Print It!</span> }));
vi.mock('react-icons/ai', () => ({ AiOutlineClose: () => <span>Close</span> }));
vi.mock('react-icons/hi2', () => ({ HiDocumentMagnifyingGlass: () => <span>Print Preview!</span> }));
vi.mock('react-spinners', () => ({ ScaleLoader: () => <div data-testid="loader">Loading...</div> }));
vi.mock('react-iframe', () => ({ default: ({ url }) => <iframe src={url} title="preview" /> }));

// --- Test Setup ---

// A helper component to correctly manage the ref for the printable area
const TestHarness = (props) => {
    const printableRef = useRef(null);
    return (
        <div>
            <div ref={printableRef} data-testid="printable-area">
                <h1>Test Content</h1>
            </div>
            <LayoutPrinter elementRef={printableRef} {...props}>
                <button>Open Printer</button>
            </LayoutPrinter>
        </div>
    );
};

describe('LayoutPrinter', () => {
    let user;

    beforeEach(() => {
        user = userEvent.setup();
        // Ensure mocks are clean before each test
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Clean up the DOM
        document.body.innerHTML = '';
    });

    describe('Modal Interactions', () => {
        it('renders the trigger component', () => {
            render(<TestHarness />);
            expect(screen.getByText('Open Printer')).toBeInTheDocument();
        });

        it('opens the print options modal when the trigger is clicked', async () => {
            render(<TestHarness />);
            await user.click(screen.getByText('Open Printer'));
            expect(screen.getByText('Print Options')).toBeInTheDocument();
        });

        it('closes the print options modal when the close button is clicked', async () => {
            render(<TestHarness />);
            await user.click(screen.getByText('Open Printer'));
            expect(screen.getByText('Print Options')).toBeInTheDocument();

            await user.click(screen.getByText('Close'));
            expect(screen.queryByText('Print Options')).not.toBeInTheDocument();
        });

        it('displays custom page and print formats when provided', async () => {
            const customPageFormats = ['letter', 'legal'];
            const customPrintFormats = [{ label: 'custom', disabled: false }];
            render(
                <TestHarness pageFormats={customPageFormats} printFormats={customPrintFormats} />
            );

            await user.click(screen.getByText('Open Printer'));

            // Check for custom page formats
            for (const format of customPageFormats) {
                expect(screen.getByRole('option', { name: format.toUpperCase() })).toBeInTheDocument();
            }

            // Check for custom print formats
            for (const format of customPrintFormats) {
                expect(screen.getByRole('option', { name: format.label.toUpperCase() })).toBeInTheDocument();
            }
        });
    });

    describe('Image Generation', () => {
        it('calls toJpeg when JPEG format is selected and "Print It!" is clicked', async () => {
            const { toJpeg } = await import('html-to-image');
            render(<TestHarness fileName="test-jpeg" />);

            await user.click(screen.getByText('Open Printer'));
            await user.selectOptions(screen.getByDisplayValue('pdf'), 'jpeg');
            await user.click(screen.getByText('Print It!'));

            expect(toJpeg).toHaveBeenCalledTimes(1);
        });

        it('calls toSvg when SVG format is selected and "Print It!" is clicked', async () => {
            const { toSvg } = await import('html-to-image');
            render(<TestHarness fileName="test-svg" />);

            await user.click(screen.getByText('Open Printer'));
            await user.selectOptions(screen.getByDisplayValue('pdf'), 'svg');
            await user.click(screen.getByText('Print It!'));

            expect(toSvg).toHaveBeenCalledTimes(1);
        });
    });

    describe('PDF Generation', () => {
        it('calls jsPDF when PDF format is selected and "Print It!" is clicked', async () => {
            const jsPDF = (await import('jspdf')).default;
            render(<TestHarness fileName="test-pdf" />);

            await user.click(screen.getByText('Open Printer'));
            await user.selectOptions(screen.getByDisplayValue('pdf'), 'pdf');
            await user.click(screen.getByText('Print It!'));

            await waitFor(() => expect(jsPDF).toHaveBeenCalledTimes(1));
            await waitFor(() => expect(mockJspdfInstance.html).toHaveBeenCalledTimes(1));
        });

        it('uses custom SidePanelComponent and FooterComponent for PDF generation', async () => {
            const { renderToStaticMarkup } = await import('react-dom/server');
            const SidePanel = () => <div>Side Panel</div>;
            const FooterPanel = () => <div>Footer Panel</div>;

            render(
                <TestHarness SidePanelComponent={SidePanel} FooterComponent={FooterPanel} />
            );

            await user.click(screen.getByText('Open Printer'));
            await user.click(screen.getByText('Print It!'));

            await waitFor(() => {
                expect(renderToStaticMarkup).toHaveBeenCalledWith(expect.any(Object));
                // Check if our custom components were passed to renderToStaticMarkup
                const calls = renderToStaticMarkup.mock.calls;
                const componentTypes = calls.map(call => call[0].type.name);
                expect(componentTypes).toContain('SidePanel');
                expect(componentTypes).toContain('FooterPanel');
            });
        });

        it('opens the preview modal when "Print Preview!" is clicked', async () => {
            render(<TestHarness />);
            await user.click(screen.getByText('Open Printer'));
            await user.click(screen.getByText('Print Preview!'));

            expect(await screen.findByText('Print Preview')).toBeInTheDocument();
            expect(screen.getByTitle('preview')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('calls onError prop when printing fails', async () => {
            const { toJpeg } = await import('html-to-image');
            const error = new Error('Failed to generate image');
            toJpeg.mockRejectedValueOnce(error);

            const onErrorMock = vi.fn();
            render(<TestHarness onError={onErrorMock} />);

            await user.click(screen.getByText('Open Printer'));
            await user.selectOptions(screen.getByDisplayValue('pdf'), 'jpeg');
            await user.click(screen.getByText('Print It!'));

            await waitFor(() => expect(onErrorMock).toHaveBeenCalledWith(error));
        });

        it('calls onError prop if elementRef is not valid during print', async () => {
            const onErrorMock = vi.fn();
            const TestComponentWithNullRef = (props) => {
                // This ref will remain null
                const printableRef = useRef(null);
                return (
                    <LayoutPrinter elementRef={printableRef} {...props}>
                        <button>Open Printer</button>
                    </LayoutPrinter>
                );
            };
            render(<TestComponentWithNullRef onError={onErrorMock} />);

            await user.click(screen.getByText('Open Printer'));
            await user.click(screen.getByText('Print It!'));

            await waitFor(() => {
                expect(onErrorMock).toHaveBeenCalledWith(
                    new Error('Element to print not found.')
                );
            });
        });
    });
});
