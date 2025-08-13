import React, { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { LayoutPrinter } from './src/LayoutPrinter'; // Import from source for example

// Example components for PDF layout sections
const SidePanel = ({ data, pageFormat }) => (
    <div style={{ fontSize: '12px', padding: '10px', fontFamily: 'sans-serif' }}>
        <h3>{data.title}</h3>
        <p><strong>Client:</strong> {data.clientName}</p>
        <p><strong>Location:</strong> {data.location}</p>
        <hr />
        <p><em>This is a custom side panel.</em></p>
    </div>
);

const FooterPanel = ({ data, pageFormat, logoUrl }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px', fontFamily: 'sans-serif' }}>
        <p><strong>Notes:</strong> {data.notes}</p>
        {logoUrl && <img src={logoUrl} alt="logo" style={{ width: '80px' }} />}
    </div>
);


function MyPrintableComponent() {
    const printableRef = useRef(null);

    const printData = {
        title: 'My Awesome Plan',
        clientName: 'ACME Corp',
        location: 'Mars',
        notes: 'All dimensions are in light-years.',
        facing: 'N', // For the compass
    };

    const facingImages = {
        "N": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Compass-icon_bb_E.svg/440px-Compass-icon_bb_E.svg.png",
        "W": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Compass-icon_bb_W.svg/440px-Compass-icon_bb_W.svg.png",
        "S": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Compass-icon_bb_N.svg/440px-Compass-icon_bb_N.svg.png",
        "E": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Compass-icon_bb_S.svg/1010px-Compass-icon_bb_S.svg.png"
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>React Layout Printer Example</h1>
            <p>This is an example of using the `react-layout-printer` package.</p>

            <div ref={printableRef} style={{ width: '800px', height: '600px', border: '2px dashed #ccc', padding: '1rem', background: 'white', margin: '2rem 0' }}>
                <h2>This is the content to be printed</h2>
                <p>It can be any React component or DOM structure.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa.</p>
            </div>

            <LayoutPrinter
                elementRef={printableRef}
                data={printData}
                fileName="my-document"
                SidePanelComponent={SidePanel}
                FooterComponent={FooterPanel}
                logoUrl="https://via.placeholder.com/150/0000FF/808080?Text=Logo"
                facingImages={facingImages}
                facingDataKey="facing"
            >
                <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
                    Print Document
                </button>
            </LayoutPrinter>
        </div>
    );
}

// To make this example runnable, we'll render it to the DOM.
// An `index.html` with a `<div id="root"></div>` is assumed.
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<MyPrintableComponent />);
}

export default MyPrintableComponent;
