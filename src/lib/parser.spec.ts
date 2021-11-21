import { parse } from "./parser";
import { Type } from "./types";
import { createMemoryReader, Reader, Writer } from "./vfs";

describe("Parser", () => {
  let fs: Reader & Writer;

  beforeEach(() => {
    fs = createMemoryReader("/");
  });

  test(
    "alias types",
    `
    type A = B;
    type B = string;
    `,
    {
      A: {
        kind: "string",
      },
      B: {
        kind: "string",
      },
    }
  );

  test(
    "boolean types",
    `
    type A = boolean;
    type B = false;
    type C = true;
    `,
    {
      A: {
        kind: "boolean",
      },
      B: {
        kind: "literal",
        value: false,
      },
      C: {
        kind: "literal",
        value: true,
      },
    }
  );

  test(
    "null types",
    `
    type A = null;
    `,
    {
      A: {
        kind: "null",
      },
    }
  );

  test(
    "number types",
    `
    type A = number;
    type B = 123;
    type C = -123;
    type D = 0;
    `,
    {
      A: {
        kind: "number",
      },
      B: {
        kind: "literal",
        value: 123,
      },
      C: {
        kind: "literal",
        value: -123,
      },
      D: {
        kind: "literal",
        value: 0,
      },
    }
  );

  test(
    "object types",
    `
    type A = {
      foo: string,
      bar?: number;
    }
    interface B {
      foo: string,
      bar?: number;
    }
    `,
    {
      A: {
        kind: "object",
        properties: {
          foo: {
            type: {
              kind: "string",
            },
            required: true,
          },
          bar: {
            type: {
              kind: "number",
            },
            required: false,
          },
        },
      },
      B: {
        kind: "object",
        properties: {
          foo: {
            type: {
              kind: "string",
            },
            required: true,
          },
          bar: {
            type: {
              kind: "number",
            },
            required: false,
          },
        },
      },
    }
  );

  test(
    "string types",
    `
    type A = string;
    type B = "";
    type C = "foo";
    `,
    {
      A: {
        kind: "string",
      },
      B: {
        kind: "literal",
        value: "",
      },
      C: {
        kind: "literal",
        value: "foo",
      },
    }
  );

  test(
    "undefined types",
    `
    type A = undefined;
    type B = void;
    `,
    {
      A: {
        kind: "undefined",
      },
      B: {
        kind: "undefined",
      },
    }
  );

  test(
    "union types",
    `
    type A = B | C;
    type B = string;
    type C = number;
    type D = "foo" | "bar";
    `,
    {
      A: {
        kind: "union",
        types: [
          {
            kind: "string",
          },
          {
            kind: "number",
          },
        ],
      },
      B: {
        kind: "string",
      },
      C: {
        kind: "number",
      },
      D: {
        kind: "union",
        types: [
          {
            kind: "literal",
            value: "foo",
          },
          {
            kind: "literal",
            value: "bar",
          },
        ],
      },
    }
  );

  function test(
    description: string,
    source: string,
    expected: Record<string, Type>
  ) {
    it(description, () => {
      const filePath = "/virtual/types.ts";
      fs.updateFile(filePath, source);
      expect(parse(fs, [filePath])).toEqual(expected);
    });
  }
});
