import { parse, type PreprocessorGroup } from "svelte/compiler";
import MagicString from "magic-string";
import { parseStorybookNode } from "./storybook.ts";
import {
  convertToSyleString,
  findAttribute,
  findProperties,
  getStyleString,
} from "./utils.ts";
import type { AST } from "svelte/compiler";
import type { Options, ParseResult } from "./types.ts";

function parseNode(
  node: AST.Component,
  options: Options,
): ParseResult {
  const threadAttribute = findAttribute(node.attributes, options.attributeName);
  if (!threadAttribute) return {};
  const styleProperties = findProperties(threadAttribute);

  const styleAttribute = findAttribute(node.attributes, "style");

  if (styleProperties && styleAttribute) {
    const styleString = getStyleString(styleAttribute);
    const newStyleString = `style="${
      styleString + " " + convertToSyleString(styleProperties)
    }"`;
    return {
      newStyleString,
      start: styleAttribute.start,
      end: styleAttribute.end,
      kill: { start: threadAttribute.start, end: threadAttribute.end },
    };
  } else if (styleProperties) {
    const newStyleString = `style="${convertToSyleString(styleProperties)}"`;
    return {
      newStyleString,
      start: threadAttribute.start,
      end: threadAttribute.end,
    };
  }
  return {};
}

function parseScopedStylesNode(
  css: AST.Root["css"],
): ParseResult {
  if (!css) return {};
  const temp = "root { --color-neutral-100: #ffffff; }";
  const newStyleTagContent = css.content.styles + temp;
  return {
    start: css.content.start,
    end: css.content.end,
    newStyleString: newStyleTagContent,
  };
}

function overwriteMagicString(
  magicString: MagicString,
  result: ParseResult,
) {
  if (result.kill) {
    magicString.remove(
      result.kill.start,
      result.kill.end,
    );
  }

  if (result.start && result.end && result.newStyleString) {
    magicString.overwrite(
      result.start,
      result.end,
      result.newStyleString,
    );
  }
}
function replaceFileContents(
  content: string,
  ast: AST.Root,
  filename: string,
  options: Options,
): string {
  const magicString = new MagicString(content);
  const nodes = ast.fragment.nodes;

  function replaceStyleStrings(node: AST.Fragment["nodes"][number]) {
    let result: ParseResult = {};
    const isStorybookStory = node.type === "Component" &&
      node.name === "Story" &&
      (filename.includes(".stories") || filename.includes(".story"));

    if (
      node.type !== "Component" ||
      (!options.elementNames.includes(node.name) && !isStorybookStory)
    ) return;

    const isScopedStylesComponent = node.name === "ScopedStyles";

    if (!isStorybookStory && isScopedStylesComponent) {
      result = parseScopedStylesNode(ast.css);
      overwriteMagicString(magicString, result);
    }

    if (!isStorybookStory) {
      result = parseNode(node, options);
      overwriteMagicString(magicString, result);
    } else if (options.shouldIncludeStorybookFiles) {
      result = parseStorybookNode(node, options);
      overwriteMagicString(magicString, result);
    }

    if (Array.isArray(node.fragment?.nodes) && node.fragment.nodes.length > 0) {
      node.fragment.nodes.forEach(replaceStyleStrings);
    }
  }
  nodes.forEach(replaceStyleStrings);
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
    return replaceFileContents(content, ast, filename, options);
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
