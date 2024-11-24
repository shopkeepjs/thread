import { thread } from "../thread.ts";
import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { colors, options, script, style } from "./mock.ts";

const designSystemOptions = { ...options, designSystem: { colors } };

const newStyleString = `<style>
div {
  background-color: red;  
}
p {
  color: green;  
}
root { --color-neutral-100: #ffffff; }</style>`;

describe("parses a design system object", () => {
    it.only("parses if options include a design system object", () => {
        const htmlInput =
            `<ScopedStyles cs={{ gap: '10px', backgroundColor: 'aqua' }}></ScopedStyles>`;
        const htmlOutput =
            `<ScopedStyles style="gap: 10px; background-color: aqua;"></ScopedStyles>`;
        const input = script + htmlInput + style;
        const output = script + htmlOutput + newStyleString;

        const result = thread(input, "Test.thread.svelte", {
            ...designSystemOptions,
            fileIdentifier: "thread",
        });
        expect(result).toEqual(output);
    });
});
