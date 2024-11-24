import { thread } from "../thread.ts";
import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { options, script, style } from "./mock.ts";

describe("testing options", () => {
    it("parses if fileIdentifier is included in filename", () => {
        const htmlInput =
            `<Flexbox cs={{ gap: '10px', backgroundColor: 'aqua' }}></Flexbox>`;
        const htmlOutput =
            `<Flexbox style="gap: 10px; background-color: aqua;"></Flexbox>`;
        const input = script + htmlInput + style;
        const output = script + htmlOutput + style;

        const result = thread(input, "Test.thread.svelte", {
            ...options,
            fileIdentifier: "thread",
        });
        expect(result).toEqual(output);
    });
    it("skips parsing if fileIdentifier is not included in filename", () => {
        const htmlInput =
            `<Flexbox cs={{ gap: '10px', backgroundColor: 'aqua' }}></Flexbox>`;
        const htmlOutput =
            `<Flexbox cs={{ gap: '10px', backgroundColor: 'aqua' }}></Flexbox>`;
        const input = script + htmlInput + style;
        const output = script + htmlOutput + style;

        const result = thread(input, "Test.svelte", {
            ...options,
            fileIdentifier: "skip",
        });
        expect(result).toEqual(output);
    });
    it("tests elementNames with elements in array", () => {
        const htmlInput =
            `<Flexbox cs={{ gap: '10px', backgroundColor: 'aqua' }}></Flexbox>`;
        const htmlOutput =
            `<Flexbox style="gap: 10px; background-color: aqua;"></Flexbox>`;
        const input = script + htmlInput + style;
        const output = script + htmlOutput + style;

        const result = thread(input, "Test.svelte", options);
        expect(result).toEqual(output);
    });
    it("tests elementNames with elements not in array", () => {
        const htmlInput =
            `<Fakebox cs={{ gap: '10px', backgroundColor: 'aqua' }}></Fakebox>`;
        const htmlOutput =
            `<Fakebox cs={{ gap: '10px', backgroundColor: 'aqua' }}></Fakebox>`;
        const input = script + htmlInput + style;
        const output = script + htmlOutput + style;

        const result = thread(input, "Test.svelte", options);
        expect(result).toEqual(output);
    });
    it("tests with different identifier", () => {
        const htmlInput =
            `<Fakebox test={{ gap: '10px', backgroundColor: 'aqua' }}></Fakebox>`;
        const htmlOutput =
            `<Fakebox test={{ gap: '10px', backgroundColor: 'aqua' }}></Fakebox>`;
        const input = script + htmlInput + style;
        const output = script + htmlOutput + style;

        const result = thread(input, "Test.svelte", {
            ...options,
            attributeName: "test",
        });
        expect(result).toEqual(output);
    });
});
