import { thread } from "../thread.ts";
import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { options, script, style } from "./mock.ts";

describe("parsing attributes", () => {
  it("converts a single attribute", () => {
    const htmlInput = `<Flexbox cs={{ gap: '10px' }}></Flexbox>`;
    const htmlOutput = `<Flexbox style="gap: 10px;"></Flexbox>`;
    const input = script + htmlInput + style;
    const output = script + htmlOutput + style;

    const result = thread(input, "Test.svelte", options);
    expect(result).toEqual(output);
  });

  it("converts a single attribute that is a css variable", () => {
    const htmlInput = `<Flexbox cs={{ '--gap': '10px' }}></Flexbox>`;
    const htmlOutput = `<Flexbox style="--gap: 10px;"></Flexbox>`;
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

  it("converts ternary attribute without alternative", () => {
    const htmlInput = `<Flexbox cs={{ gap: isGap && '10px' }}></Flexbox>`;
    const htmlOutput =
      `<Flexbox style="{isGap && \`gap: \${'10px'}\`};"></Flexbox>`;
    const input = script + htmlInput + style;
    const output = script + htmlOutput + style;

    const result = thread(input, "Test.svelte", options);
    expect(result).toEqual(output);

    const htmlInputWithVar = `<Flexbox cs={{ gap: isGap && isGap }}></Flexbox>`;
    const htmlOutputWithVar =
      `<Flexbox style="{isGap && \`gap: \${isGap}\`};"></Flexbox>`;
    const inputWithVar = script + htmlInputWithVar + style;
    const outputWithVar = script + htmlOutputWithVar + style;

    const resultWithVar = thread(inputWithVar, "Test.svelte", options);
    expect(resultWithVar).toEqual(outputWithVar);
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

  it("converts ternary with undefined", () => {
    const htmlInput =
      `<Flexbox cs={{ gap: isGap ? '10px' : undefined }}></Flexbox>`;
    const htmlOutput =
      `<Flexbox style="{isGap && \`gap: \${'10px'}\`};"></Flexbox>`;
    const input = script + htmlInput + style;
    const output = script + htmlOutput + style;

    const result = thread(input, "Test.svelte", options);
    expect(result).toEqual(output);

    const htmlInputOposite =
      `<Flexbox cs={{ gap: isGap ? undefined : '10px' }}></Flexbox>`;
    const htmlOutputOpposite =
      `<Flexbox style="{isGap && \`gap: \${'10px'}\`};"></Flexbox>`;
    const secondInput = script + htmlInputOposite + style;
    const secondOutput = script + htmlOutputOpposite + style;

    const secondResult = thread(secondInput, "Test.svelte", options);
    expect(secondResult).toEqual(secondOutput);
  });

  it("converts negative ternary with undefined", () => {
    const htmlInput =
      `<Flexbox cs={{ gap: !isGap ? '10px' : undefined }}></Flexbox>`;
    const htmlOutput =
      `<Flexbox style="{!isGap && \`gap: \${'10px'}\`};"></Flexbox>`;
    const input = script + htmlInput + style;
    const output = script + htmlOutput + style;

    const result = thread(input, "Test.svelte", options);
    expect(result).toEqual(output);

    const htmlInputUndefinedOpposite =
      `<Flexbox cs={{ gap: !isGap ? undefined : '10px'}}></Flexbox>`;
    const htmlOuptutUndefinedOpposite =
      `<Flexbox style="{!isGap && \`gap: \${'10px'}\`};"></Flexbox>`;
    const secondInput = script + htmlInputUndefinedOpposite + style;
    const secondOutput = script + htmlOuptutUndefinedOpposite + style;

    const secondResult = thread(secondInput, "Test.svelte", options);
    expect(secondResult).toEqual(secondOutput);
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
