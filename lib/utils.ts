import { camelToKebabCase } from "@shopkeep/fletcher";
import type { AST } from "svelte/compiler";
import type { Property, SpreadElement } from "types/estree";
import type { ExtendedProperty } from "./types.ts";

// TODO - replace the any
// deno-lint-ignore no-explicit-any
function parseTemplateLiteralValue(value: any): string | null {
    const pre = value.quasis[0]?.value.raw;
    const post = value.quasis[1]?.value.raw;
    const variable = value.expressions[0].name;
    return `${pre}\{${variable}}${post}`;
}

export function getStyleString(styleAttribute: AST.Attribute): string {
    if (
        typeof styleAttribute.value !== "boolean" &&
        !Array.isArray(styleAttribute.value) &&
        "name" in styleAttribute.value.expression
    ) return `{${styleAttribute.value.expression.name}}`;
    if (
        Array.isArray(styleAttribute.value) &&
        styleAttribute.value[0].type === "Text"
    ) return styleAttribute.value[0].raw;
    return "";
}

// TODO - insert design system specific values to transition things like 1 to 4px etc
export function convertToSyleString(properties: Property[]): string {
    const insideString = properties.reduce(
        (acc: string, property: Property | SpreadElement) => {
            // TODO - this is also a mess
            if (!("key" in property)) return acc;

            let propertyName;
            if ("name" in property.key) {
                propertyName = camelToKebabCase(property.key.name);
            }
            // Allows for css variables - i.e. cs={{'--gap': 10px}}
            if ("value" in property.key) propertyName = property.key.value;
            if (!propertyName) return acc;

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
                    `${propertyName}: ${
                        parseTemplateLiteralValue(property.value)
                    }; `;
            }

            // Returns if the value is a logical expression - i.e. cs={{gap: isGap && '10px'}}
            // or if it's a logical expression with a variable - i.e. cs={{gap: isGap && gapAmount}}
            if (property.value.type === "LogicalExpression") {
                const conditionalName =
                    property.value.left.type === "Identifier" &&
                    property.value.left.name;

                const value = property.value.right.type === "Literal"
                    ? property.value.right.raw
                    : property.value.right.type === "Identifier" &&
                        property.value.right.name;
                return acc +
                    `{${conditionalName} && \`${propertyName}: \${${value}}\`}; `;
            }

            // Returns if the value is a ternary
            if (property.value.type === "ConditionalExpression") {
                // Returns if the value is a ternary with a unary expression - i.e. cs={{gap: !isGap ? '10px' : undefined}}
                if (
                    property.value.test.type === "UnaryExpression" &&
                    (property.value.consequent.type !== "Literal" ||
                        property.value.alternate.type !== "Literal")
                ) {
                    const testName = "name" in property.value.test.argument &&
                        property.value.test.argument.name;
                    const alternateName =
                        property.value.alternate.type === "Literal" &&
                        property.value.alternate.raw;
                    const consequentName =
                        property.value.consequent.type === "Literal" &&
                        property.value.consequent.raw;

                    return acc +
                        `{!${testName} && \`${propertyName}: \${${
                            consequentName || alternateName
                        }}\`}; `;
                }

                // Returns if the value is a ternary with an undefined - i.e. cs={{gap: isGap ? '10px' : undefined}}
                if (
                    property.value.consequent.type !== "Literal" ||
                    property.value.alternate.type !== "Literal"
                ) {
                    // TODO - I think this is a uncaptured edge case
                    if (property.value.test.type !== "Identifier") return acc;
                    const testName = property.value.test.name;
                    const alternateName =
                        property.value.alternate.type === "Literal" &&
                        property.value.alternate.raw;
                    const consequentName =
                        property.value.consequent.type === "Literal" &&
                        property.value.consequent.raw;

                    return acc +
                        `{${testName} && \`${propertyName}: \${${
                            consequentName || alternateName
                        }}\`}; `;
                }

                // Returns if the value is a ternary - i.e. cs={{gap: isGap ? '10px' : '20px'}}
                if (property.value.test.type === "Identifier") {
                    return acc +
                        `${propertyName}: {${property.value.test.name} ? '${property.value.consequent.value}' : '${property.value.alternate.value}'}; `;
                }

                // Returns if the value is a ternary - i.e. cs={{gap: isGap ? '10px' : '20px'}}
                if (property.value.test.type === "BinaryExpression") {
                    const leftValue =
                        property.value.test.left.type === "Literal"
                            ? property.value.test.left.raw
                            : property.value.test.left.type === "Identifier"
                            ? property.value.test.left.name
                            : "";
                    const rightValue =
                        property.value.test.right.type === "Literal"
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
        },
        "",
    );
    return insideString.trim();
}

export function findAttribute(
    attributes: AST.BaseElement["attributes"],
    searchParameter: string,
): AST.Attribute | undefined {
    const attribute = attributes.find(
        (attr: AST.BaseElement["attributes"][number]) =>
            "name" in attr && attr.name === searchParameter,
    );
    if (
        !attribute || attribute.type !== "Attribute" ||
        typeof attribute.value === "boolean"
    ) return undefined;
    return attribute;
}

export function findProperties(
    attribute: AST.BaseElement["attributes"][number],
): ExtendedProperty[] | undefined {
    if (
        !attribute || attribute.type !== "Attribute" ||
        typeof attribute.value === "boolean" ||
        Array.isArray(attribute.value) ||
        attribute.value.expression.type !== "ObjectExpression"
    ) return undefined;
    return attribute.value.expression.properties.filter((
        property: ExtendedProperty | SpreadElement,
    ) => property.type === "Property");
}
