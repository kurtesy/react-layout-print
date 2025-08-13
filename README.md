# react-layout-printer

[![npm version](https://img.shields.io/npm/v/react-layout-printer.svg)](https://www.npmjs.com/package/react-layout-printer)
[![npm downloads](https://img.shields.io/npm/dm/react-layout-printer.svg)](https://www.npmjs.com/package/react-layout-printer)
[![license](https://img.shields.io/npm/l/react-layout-printer.svg)](./LICENSE.md)

A simple and powerful React component to print your layouts and components.

## Why `react-layout-printer`?

- To provide a simple, lightweight, and powerful solution for printing React components.
- To offer a flexible API that is easy to use and extend.
- To ensure that what you see is what you get when printing.

## Features

- Print any React component.
- Preserve layout and styling.
- Trigger printing programmatically.
- Hooks for before and after printing.
- Lightweight and easy to use.

## Installation

```sh
npm install --save react-layout-printer
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