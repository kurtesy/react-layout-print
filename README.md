# react-layout-print

[![npm version](https://img.shields.io/npm/v/react-layout-print.svg)](https://www.npmjs.com/package/react-layout-print)
[![npm downloads](https://img.shields.io/npm/dm/react-layout-print.svg)](https://www.npmjs.com/package/react-layout-print)
[![license](https://img.shields.io/npm/l/react-layout-print.svg)](./LICENSE.md)

Print, preview, and export complex web page layouts to PDF, JPEG, and SVG. `react-layout-print` is a powerful React component designed for high-fidelity HTML to document conversions, making it perfectly suited for printing complex web pages.

## Why `react-layout-print`?

To provide a simple and powerful solution for printing complex React components and layouts, offering features like an interactive **print preview** and multiple export formats (PDF, JPEG, SVG). It's particularly well-suited for converting detailed HTML to high-quality PDF documents.

## Features

- Print any React component or complex web page layout.
- High-fidelity HTML to document conversion.
- Interactive **Print Preview** modal before exporting to PDF.
- Export to **PDF**, **JPEG**, and **SVG** formats.
- Preserve layout and styling for accurate prints.
- Trigger printing programmatically.
- Lightweight and easy to use.

## Installation

```sh
npm install --save react-layout-print
```

or

```sh
yarn add react-layout-print
```

## Usage

### Functional Component with `useRef`

```jsx
import React, { useRef } from 'react';
import ReactLayoutPrint from 'react-layout-print';

const ComponentToPrint = React.forwardRef((props, ref) => (
  <div ref={ref}>
    <h1>My Component</h1>
    <p>This is the content that will be printed.</p>
  </div>
));

export const Example = () => {
  const componentRef = useRef();

  return (
    <div>
      <ReactLayoutPrint
        trigger={() => <button>Print this out!</button>}
        content={() => componentRef.current}
      />
      <ComponentToPrint ref={componentRef} />
    </div>
  );
};
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