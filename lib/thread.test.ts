import { camelToKebabCase, thread } from "./thread.ts";
import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";

const script = `<script lang="ts">
  import Flexbox from '$lib/components/Flexbox/Flexbox.svelte';
  import Box from '../lib/components/Box/Box.svelte';
  let color = $state('aqua');
  let computedHeight = $state(200);
  let computedWidth = $derived(color === 'aqua' ? 200 : 100);
  let asdf = 'background-color: green;';
  let cs = { backgroundColor: 'purple' };
</script>`;

const style = `<style>
div {
  background-color: red;  
}
</style>`;

const options = { elementNames: ["Flexbox", "Box"], attributeName: "cs" };

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

describe("parsing attributes", () => {
  it("converts a single attribute", () => {
    const htmlInput = `<Flexbox cs={{ gap: '10px' }}></Flexbox>`;
    const htmlOutput = `<Flexbox style="gap: 10px;"></Flexbox>`;
    const input = script + htmlInput + style;
    const output = script + htmlOutput + style;

    const result = thread(input, "Test.svelte", options);
    expect(result).toEqual(output);
  });

  it("converts multiple attributes", () => {
    const htmlInput =
      `<Flexbox cs={{ gap: '10px', backgroundColor: 'aqua' }}></Flexbox>`;
    const htmlOutput =
      `<Flexbox style="gap: 10px; background-color: aqua;"></Flexbox>`;
    const input = script + htmlInput + style;
    const output = script + htmlOutput + style;

    const result = thread(input, "Test.svelte", options);
    expect(result).toEqual(output);
  });

  it("converts nested components", () => {
    const htmlInput =
      `<Flexbox cs={{ gap: '10px' }}><Flexbox cs={{backgroundColor: 'aqua'}}></Flexbox></Flexbox>`;
    const htmlOutput =
      `<Flexbox style="gap: 10px;"><Flexbox style="background-color: aqua;"></Flexbox></Flexbox>`;
    const input = script + htmlInput + style;
    const output = script + htmlOutput + style;

    const result = thread(input, "Test.svelte", options);
    expect(result).toEqual(output);
  });

  it("converts variable attribute", () => {
    const htmlInput = "<Flexbox cs={{ gap: gapAmount }}></Flexbox>";
    const htmlOutput = '<Flexbox style="gap: {gapAmount};"></Flexbox>';
    const input = script + htmlInput + style;
    const output = script + htmlOutput + style;

    const result = thread(input, "Test.svelte", options);
    expect(result).toEqual(output);
  });

  it("converts template literal attribute", () => {
    const htmlInput = "<Flexbox cs={{ gap: `${computedHeight}px` }}></Flexbox>";
    const htmlOutput = '<Flexbox style="gap: {computedHeight}px;"></Flexbox>';
    const input = script + htmlInput + style;
    const output = script + htmlOutput + style;

    const result = thread(input, "Test.svelte", options);
    expect(result).toEqual(output);
  });

  it("converts ternary attribute without equals", () => {
    const htmlInput =
      `<Flexbox cs={{ gap: isGap ? '10px' : '20px' }}></Flexbox>`;
    const htmlOutput =
      `<Flexbox style="gap: {isGap ? '10px' : '20px'};"></Flexbox>`;
    const input = script + htmlInput + style;
    const output = script + htmlOutput + style;

    const result = thread(input, "Test.svelte", options);
    expect(result).toEqual(output);
  });

  it("converts ternary attribute with equals", () => {
    const htmlInput =
      `<Flexbox cs={{ gap: isGap === 'yes' ? '10px' : '20px' }}></Flexbox>`;
    const htmlOutput =
      `<Flexbox style="gap: {isGap === 'yes' ? '10px' : '20px'};"></Flexbox>`;
    const input = script + htmlInput + style;
    const output = script + htmlOutput + style;

    const result = thread(input, "Test.svelte", options);
    expect(result).toEqual(output);
  });

  it("converts ternary attribute with not equals", () => {
    const htmlInput =
      `<Flexbox cs={{ gap: isGap !== 'yes' ? '10px' : '20px' }}></Flexbox>`;
    const htmlOutput =
      `<Flexbox style="gap: {isGap !== 'yes' ? '10px' : '20px'};"></Flexbox>`;
    const input = script + htmlInput + style;
    const output = script + htmlOutput + style;

    const result = thread(input, "Test.svelte", options);
    expect(result).toEqual(output);
  });

  it("combines existing style attribute with the newly parsed styles", () => {
    const htmlInput =
      `<Flexbox style="background-color: green; flex-flow: row;" cs={{ color: 'green' }}></Flexbox>`;
    const htmlOutput =
      `<Flexbox style="background-color: green; flex-flow: row; color: green;" ></Flexbox>`;
    const input = script + htmlInput + style;
    const output = script + htmlOutput + style;

    const result = thread(input, "Test.svelte", options);
    expect(result).toEqual(output);
  });

  it("combines existing style attribute when it is declared as a javascript variable", () => {
    const htmlInput = `<Flexbox {style} cs={{ color: 'green' }}></Flexbox>`;
    const htmlOutput = `<Flexbox style="{style} color: green;" ></Flexbox>`;
    const input = script + htmlInput + style;
    const output = script + htmlOutput + style;

    const result = thread(input, "Test.svelte", options);
    expect(result).toEqual(output);
  });
});

describe("camelToKebabCase", () => {
  it("converts camel case to kebab case", () => {
    expect(camelToKebabCase("backgroundColor")).toEqual("background-color");
  });
  it("converts camel case with multiple words to kebab case", () => {
    expect(camelToKebabCase("borderTopLeftRadius")).toEqual(
      "border-top-left-radius",
    );
  });
  it("does not convert kebab case", () => {
    expect(camelToKebabCase("bordertopleft")).toEqual("bordertopleft");
  });
});
