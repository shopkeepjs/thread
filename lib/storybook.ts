import type { AST } from "svelte/compiler";
import type { Property, SpreadElement } from "types/estree";
import type { Options, ParseResult } from "./types.ts";
import {
    convertToSyleString,
    findAttribute,
    findProperties,
    getStyleString,
} from "./utils.ts";

export function parseStorybookNode(
    node: AST.Component,
    options: Options,
): ParseResult {
    const attribute = findAttribute(node.attributes, "args");
    if (!attribute) return {};
    const attributeProperties = findProperties(attribute);

    const threadAttribute = attributeProperties?.find((att) =>
        "name" in att.key && att.key.name === options.attributeName
    );
    const styleAttribute = findAttribute(node.attributes, "style");

    if (
        styleAttribute && threadAttribute &&
        threadAttribute.value.type === "ObjectExpression" &&
        threadAttribute.start && threadAttribute.end
    ) {
        const styleString = getStyleString(styleAttribute);
        const filteredProperties = threadAttribute.value.properties.filter((
            property: Property | SpreadElement,
        ) => property.type === "Property");
        const newStyleString = `style="${
            styleString + convertToSyleString(filteredProperties)
        }"`;
        return {
            newStyleString,
            start: styleAttribute.start,
            end: styleAttribute.end,
            kill: { start: threadAttribute.start, end: threadAttribute.end },
        };
    } else if (
        threadAttribute && threadAttribute.value.type === "ObjectExpression"
    ) {
        const filteredProperties = threadAttribute.value.properties.filter((
            property: Property | SpreadElement,
        ) => property.type === "Property");
        const newStyleString = `style: "${
            convertToSyleString(filteredProperties)
        }"`;
        return {
            newStyleString,
            start: threadAttribute.start,
            end: threadAttribute.end,
        };
    }

    return {};
}
