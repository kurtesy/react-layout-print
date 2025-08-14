# react-layout-print

[![npm version](https://img.shields.io/npm/v/react-layout-print.svg)](https://www.npmjs.com/package/react-layout-print)
[![npm downloads](https://img.shields.io/npm/dm/react-layout-print.svg)](https://www.npmjs.com/package/react-layout-print)
[![license](https://img.shields.io/npm/l/react-layout-print.svg)](./LICENSE)

A powerful React component to print, preview, and export complex web page layouts to PDF, JPEG, and SVG. `react-layout-print` is designed for high-fidelity HTML to document conversions, making it perfectly suited for printing complex web pages with custom headers, footers, and sidebars.

## Why `react-layout-print`?

To provide a simple and powerful solution for printing complex React components and layouts, offering features like an interactive **print preview** and multiple export formats (PDF, JPEG, SVG). It's particularly well-suited for generating professional-looking documents from your web application's data.

## Features

- Print any React component or DOM element.
- High-fidelity HTML to document conversion.
- Interactive **Print Preview** modal for PDF before exporting.
- Export to **PDF**, **JPEG**, and **SVG** formats.
- Customizable PDF layout with side panels and footers.
- Programmatically trigger printing via a modal.
- Lightweight and easy to integrate.

## Installation

```sh
npm install --save react-layout-print
```

or

```sh
yarn add react-layout-print
```

## Usage

Here is a basic example of how to use `LayoutPrinter`. You wrap a trigger element (like a button) with the `LayoutPrinter` component and provide a `ref` to the content you want to print.

```jsx
import React, { useRef } from 'react';
import LayoutPrinter from 'react-layout-print';

// Example components for PDF layout sections
const SidePanel = ({ data }) => (
    <div style={{ fontSize: '12px', padding: '10px', fontFamily: 'sans-serif' }}>
        <h3>{data.title}</h3>
        <p><strong>Client:</strong> {data.clientName}</p>
        <p><strong>Location:</strong> {data.location}</p>
        <hr />
        <p><em>This is a custom side panel.</em></p>
    </div>
);

const FooterPanel = ({ data, logoUrl }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px', fontFamily: 'sans-serif' }}>
        <p><strong>Notes:</strong> {data.notes}</p>
        {logoUrl && <img src={logoUrl} alt="logo" style={{ width: '80px' }} />}
    </div>
);

function MyPrintablePage() {
    const printableRef = useRef(null);

    const printData = {
        title: 'My Awesome Plan',
        clientName: 'ACME Corp',
        location: 'Mars',
        notes: 'All dimensions are in light-years.',
        facing: 'N', // For the compass
    };

    return (
        <div>
            <h1>React Layout Printer Example</h1>
            
            <div ref={printableRef} style={{ width: '800px', height: '600px', border: '2px dashed #ccc', padding: '1rem', background: 'white' }}>
                <h2>This is the content to be printed</h2>
                <p>It can be any React component or DOM structure.</p>
            </div>

            <LayoutPrinter
                elementRef={printableRef}
                data={printData}
                fileName="my-document"
                SidePanelComponent={SidePanel}
                FooterComponent={FooterPanel}
                logoUrl="https://via.placeholder.com/150"
            >
                <button>Print Document</button>
            </LayoutPrinter>
        </div>
    );
}
```

### Class Component

```jsx
import React from 'react';
import ReactLayoutPrint from 'react-layout-print';

class MyComponentToPrint extends React.Component {
  render() {
    return (
      <div>
        <h1>My Component</h1>
        <p>This is the content that will be printed.</p>
      </div>
    );
  }
}

export const Example = () => {
  const componentRef = React.useRef();

  return (
    <div>
      <ReactLayoutPrint
        trigger={() => <button>Print this out!</button>}
        content={() => componentRef.current}
      />
      <MyComponentToPrint ref={componentRef} />
    </div>
  );
};
```

## Props

| Prop              | Type                               | Default | Description                                                              |
| ----------------- | ---------------------------------- | ------- | ------------------------------------------------------------------------ |
| `trigger`         | `() => React.ReactNode`            | -       | A function that returns a React component to trigger the print.          |
| `content`         | `() => React.ReactInstance`        | -       | A function that returns the component to be printed.                     |
| `onBeforePrint`   | `() => void \| Promise<void>`      | -       | Callback executed just before the print dialog opens.                    |
| `onAfterPrint`    | `() => void`                       | -       | Callback executed after the print dialog is closed.                      |
| `documentTitle`   | `string`                           | `''`    | The title of the document when printing.                                 |
| `pageStyle`       | `string`                           | `''`    | Custom CSS styles to apply to the printed page.                          |
| `copyStyles`      | `boolean`                          | `true`    | Copy all `<style>` and `<link rel="stylesheet">` tags from `<head>`.   |
| `removeAfterPrint`| `boolean`                          | `false`   | Remove the print iframe after printing.                                  |

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.