import { parse, type PreprocessorGroup } from "svelte/compiler";
import MagicString from "magic-string";
import type { AST } from "svelte/compiler";
import type { Property, SpreadElement } from "types/estree";

/**
 * Represents the options for configuring a thread.
 *
 * @property {string} [fileIdentifier] - An optional identifier for the file.
 * @property {string} attributeName - The name of the attribute to be used.
 * @property {string[]} elementNames - An array of element names.
 */
export type Options = {
  fileIdentifier?: string;
  attributeName: string;
  elementNames: string[];
};

/**
 * Converts a camelCase string to kebab-case.
 *
 * @param str - The camelCase string to be converted.
 * @returns The converted kebab-case string.
 *
 * @example
 * ```typescript
 * const result = camelToKebabCase('camelCaseString');
 * console.log(result); // Outputs: 'camel-case-string'
 * ```
 */
export function camelToKebabCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

// TODO - replace the any
// deno-lint-ignore no-explicit-any
function parseTemplateLiteralValue(value: any): string | null {
  const pre = value.quasis[0]?.value.raw;
  const post = value.quasis[1]?.value.raw;
  const variable = value.expressions[0].name;
  return `${pre}\{${variable}}${post}`;
}

function convertToSyleString(properties: (Property | SpreadElement)[]): string {
  return properties.reduce((acc: string, property: Property | SpreadElement) => {
    // TODO - this is also a mess
    if (!("key" in property)) return acc;
    if (!("name" in property.key)) return acc;

    const propertyName = camelToKebabCase(property.key.name);

    // Returns if the value is a variable - i.e. cs={{gap: gapAmount}}
    if ("name" in property.value) {
      return acc + `${propertyName}: {${property.value.name}}; `;
    }

    // Returns if the value is a string - i.e. cs={{gap: '10px'}}
    if (("value" in property.value)) {
      return acc + `${propertyName}: ${property.value.value}; `;
    }

    // Returns if the value is a template literal - i.e. cs={{gap: `${computedHeight}px` }}
    if (property.value.type === "TemplateLiteral") {
      return acc +
        `${propertyName}: ${parseTemplateLiteralValue(property.value)}; `;
    }

    // Returns if the value is a ternary
    if (
      property.value.type === "ConditionalExpression" &&
      property.value.consequent.type === "Literal" &&
      property.value.alternate.type === "Literal"
    ) {
      // Returns if the value is a ternary - i.e. cs={{gap: isGap ? '10px' : '20px'}}
      if (property.value.test.type === "Identifier") {
        return acc +
          `${propertyName}: {${property.value.test.name} ? '${property.value.consequent.value}' : '${property.value.alternate.value}'}; `;
      }

      // Returns if the value is a ternary - i.e. cs={{gap: isGap ? '10px' : '20px'}}
      if (property.value.test.type === "BinaryExpression") {
        const leftValue = property.value.test.left.type === "Literal"
          ? property.value.test.left.raw
          : property.value.test.left.type === "Identifier"
            ? property.value.test.left.name
            : "";
        const rightValue = property.value.test.right.type === "Literal"
          ? property.value.test.right.raw
          : property.value.test.right.type === "Identifier"
            ? property.value.test.right.name
            : "";
        return acc +
          `${propertyName}: {${leftValue} ${property.value.test.operator} ${rightValue} ? '${property.value.consequent.value}' : '${property.value.alternate.value}'}; `;
      }
    }
    // Fallback
    return acc;
  }, "");
}

// TODO - insert design system specific values to transition things like 1 to 4px etc
// TODO - clean this up so values are more readable and consistent (more separate functions based off type?)
function convertsCsPropToInlineStyles(
  customStylingAttribute: AST.BaseElement["attributes"][number],
): string | null {
  // TODO - this is a mess
  if (customStylingAttribute.type !== "Attribute") return null;
  if (typeof customStylingAttribute.value === "boolean") return null;
  if (Array.isArray(customStylingAttribute.value)) return null;
  if (customStylingAttribute.value.expression.type !== "ObjectExpression") {
    return null;
  }

  const styleString = convertToSyleString(customStylingAttribute.value.expression.properties);
  return `style="${styleString.trim()}"`;
}

function parseNodes(
  content: string,
  nodes: AST.Fragment["nodes"],
  filename: string,
  options: Options,
): string {

  const magicString = new MagicString(content);

  function processNode(node: AST.Fragment["nodes"][number]) {
    const isStorybookStory = node.type === "Component" && node.name === 'Story' && (filename.includes('.stories') || filename.includes('.story'))
    if (node.type !== "Component" || (!options.elementNames.includes(node.name) && !isStorybookStory)) return;

    if (!isStorybookStory) {
      const customStyling = node.attributes?.find(
        (attr: AST.BaseElement["attributes"][number]) =>
          "name" in attr && attr.name === options.attributeName,
      );
      if (customStyling) {
        const styleString = convertsCsPropToInlineStyles(customStyling);
        if (styleString) {
          magicString.overwrite(
            customStyling.start,
            customStyling.end,
            styleString,
          );
        }
      }
    } else {
      const args = node.attributes?.find(
        (attr: AST.BaseElement["attributes"][number]) =>
          "name" in attr && attr.name === 'args',
      );

      if (!args || args.type !== 'Attribute' || typeof args.value === 'boolean' || Array.isArray(args.value) || args.value.expression.type !== 'ObjectExpression') return

      const styleAttribute = args.value.expression.properties.find((property: Property | SpreadElement) => "key" in property && "name" in property.key && property.key.name === options.attributeName) as any
      if (!styleAttribute || styleAttribute.type === 'SpreadElement' || !("properties" in styleAttribute.value)) return

      const test = styleAttribute.value.properties as Property[]
      // const customStyling = args?.properties.find(
      //   (attr: AST.BaseElement["attributes"][number]) =>
      //     "name" in attr && attr.name === options.attributeName,
      // ) as any;


      const styleString = `style: "${convertToSyleString(test).trim()}"`;
      console.log(styleAttribute)
      // const styleString = doesTheThing(customStyling.expression)
      if (styleString) {
        magicString.overwrite(
          styleAttribute.start,
          styleAttribute.end,
          styleString,
        );
      }
    }

    if (Array.isArray(node.fragment?.nodes) && node.fragment.nodes.length > 0) {
      node.fragment.nodes.forEach(processNode);
    }
  }

  nodes.forEach(processNode);

  return magicString.toString();
}

/**
 * Processes the given content by parsing it and then parsing its nodes based on the provided options.
 *
 * @param content - The content to be processed.
 * @param filename - The name of the file associated with the content.
 * @param options - An object containing options for processing the content.
 * @returns The processed content as a string. If an error occurs during parsing, the original content is returned.
 */
export function thread(
  content: string,
  filename: string,
  options: Options,
): string {

  if (options.fileIdentifier && !filename.includes(options.fileIdentifier)) {
    return content;
  }
  try {
    const ast = parse(content, { filename, modern: true });

    return parseNodes(content, ast.fragment.nodes, filename, options);
  } catch (error) {
    console.error("Error parsing content", error);
    return content;
  }
}

/**
 * Creates a preprocessor group for threading operations.
 *
 * @param opts - The options to configure the threading preprocessor.
 * @returns A preprocessor group with a name and a markup function.
 *
 * @throws {Error} If no filename is provided in the markup function.
 */
export function threadPreprocessor(opts: Options): PreprocessorGroup {
  return {
    name: "thread-preprocessor",
    markup({ content, filename }: { content: string; filename?: string }) {
      if (!filename) {
        throw Error("No filename provided");
      }
      const transformedCode = thread(content, filename, opts);
      return {
        code: transformedCode,
      };
    },
  };
}
