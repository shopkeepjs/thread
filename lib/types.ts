import type { AST } from "svelte/compiler";
import type { Property } from "types/estree";

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
    shouldIncludeStorybookFiles?: boolean;
};

export type Position = {
    start: number;
    end: number;
};

export type ParseResult = {
    newStyleString?: string;
    kill?: Position;
} & Partial<Position>;

export type ExtendedProperty = Property & Partial<AST.BaseNode>;
