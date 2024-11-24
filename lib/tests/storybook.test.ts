import { thread } from "../thread.ts";
import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { options, script, style } from "./mock.ts";

describe("tests storybook files", () => {
    const htmlInput =
        `<Story name="Primary" args={{ cs: { backgroundColor: 'aqua', width: '50px', height: '50px' }, text: 'Hello, world!'}}/>`;
    const htmlOutput =
        `<Story name="Primary" args={{ style: "background-color: aqua; width: 50px; height: 50px;", text: 'Hello, world!'}}/>`;

    const storybookOptions = { ...options, shouldIncludeStorybookFiles: true };

    it("works if file has .story file extension", () => {
        const input = script + htmlInput + style;
        const output = script + htmlOutput + style;

        const result = thread(input, "Test.story.svelte", {
            ...storybookOptions,
        });
        expect(result).toEqual(output);
    });

    it("works if file has .stories file extension", () => {
        const input = script + htmlInput + style;
        const output = script + htmlOutput + style;

        const result = thread(input, "Test.stories.svelte", {
            ...storybookOptions,
        });
        expect(result).toEqual(output);
    });
    it("works if file has multiple stories", () => {
        const input = script + htmlInput + htmlInput + style;
        const output = script + htmlOutput + htmlOutput + style;

        const result = thread(input, "Test.story.svelte", {
            ...storybookOptions,
        });
        expect(result).toEqual(output);
    });
    it("does not parse if filename does not have fileIdentifier ", () => {
        const input = script + htmlInput + htmlInput + style;
        const result = thread(input, "Test.story.svelte", {
            ...storybookOptions,
            fileIdentifier: "thread",
        });
        expect(result).toEqual(input);
    });
    it("does parse if filename does have fileIdentifier", () => {
        const input = script + htmlInput + htmlInput + style;
        const output = script + htmlOutput + htmlOutput + style;

        const result = thread(input, "Test.thread.story.svelte", {
            ...storybookOptions,
            fileIdentifier: "thread",
        });
        expect(result).toEqual(output);
    });
    it("does not parse if shouldIncludeStorybookOptions is not set", () => {
        const input = script + htmlInput + htmlInput + style;

        const result = thread(input, "Test.thread.story.svelte", {
            ...options,
            fileIdentifier: "thread",
        });
        expect(result).toEqual(input);
    });
});
