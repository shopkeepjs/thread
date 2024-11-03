# Thread Library for Svelte

This library provides utilities for using css-in-js in Svelte by preprocessing
the components and converting to inline styles. This is the basis for a design
system that allows for custom styling attributes and element transformations
that can be built on top of this library and allow js/typescript to be used for
styling to ensure type safety and consistency.

## Features

- Provide a preprocessor that integrates easily with Svelte, transforming your
  components at build time.
- Traverse Svelte AST nodes and modify elements based on specified attributes.
- Convert camelCase properties to kebab-case inline styles.

## Installation

To use this library in your project, simply import the functions you need.
Ensure that you have installed the necessary dependencies, including
`svelte/compiler` and `magic-string`.

## Usage

### Preprocessor

The `threadPreprocessor` function creates a Svelte preprocessor group that can
be used in your Svelte configuration.

```typescript
export function threadPreprocessor(opts: Options): PreprocessorGroup;
```

To use it, import it and use it in your `svelte.config.js` file to apply
transformations to your components.

```typescript
import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { threadPreprocessor } from "@shopkeep/thread";

const config = {
  preprocess: [
    vitePreprocess(),
    threadPreprocessor({
      attributeName: "cs",
      elementNames: ["Box", "Flexbox"],
      fileIdentifier: "thread",
    }),
  ],
  kit: {
    adapter: adapter(),
  },
};
```

### Options

The `Options` allows you to configure how the library processes components:

```typescript
export type Options = {
  fileIdentifier?: string;
  attributeName: string;
  elementNames: string[];
};
```

- **fileIdentifier**: Optional identifier used to filter files for processing
  (e.g. only apply to `.thread.svelte` files).
- **attributeName**: Name of the attribute that will be used for converting
  custom styles (e.g., `cs`).
- **elementNames**: List of element names to target for transformation (e.g.,
  `Flexbox`, `Box`).

## Helper Functions

### camelToKebabCase

Converts camelCase strings to kebab-case, useful for generating inline styles.

```typescript
const result = camelToKebabCase("camelCaseString");
// Outputs: 'camel-case-string'
```

## Development Notes

- **TODOs**: The current implementation has several `TODO` comments for adding
  features like design system-specific value conversions and improving type
  handling.
- **MagicString**: This library uses `magic-string` to simplify AST
  modifications while keeping track of offsets.

## Contributing

Feel free to contribute by creating pull requests or reporting issues.
Improvements to type handling are especially welcome!

## License

This library is licensed under the MIT License.
