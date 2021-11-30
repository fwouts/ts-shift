import { parse } from "./parser";
import { Type } from "./types";
import { createMemoryReader, Reader, Writer } from "./vfs";

describe("Parser", () => {
  let fs: Reader & Writer;

  beforeEach(() => {
    fs = createMemoryReader("/");
  });

  // test(
  //   "alias types",
  //   `
  //   export type A = B;
  //   type B = string;
  //   `,
  //   {
  //     A: {
  //       kind: "string",
  //     },
  //   }
  // );

  // test(
  //   "any types",
  //   `
  //   export type A = any;
  //   `,
  //   {
  //     A: {
  //       kind: "any",
  //     },
  //   }
  // );

  // test(
  //   "array types",
  //   `
  //   // Note: E[] wouldn't work in test environment
  //   // because it doesn't have access to TypeScript
  //   // standard library.
  //   export type A = Array<C>;
  //   export type B = {
  //     foo: Array<C>;
  //   }
  //   type C = string;
  //   `,
  //   {
  //     A: {
  //       kind: "array",
  //       type: {
  //         kind: "string",
  //       },
  //     },
  //     B: {
  //       kind: "object",
  //       properties: {
  //         foo: {
  //           type: {
  //             kind: "array",
  //             type: {
  //               kind: "string",
  //             },
  //           },
  //           required: true,
  //         },
  //       },
  //     },
  //   }
  // );

  // test(
  //   "boolean types",
  //   `
  //   export type A = boolean;
  //   export type B = false;
  //   export type C = true;
  //   `,
  //   {
  //     A: {
  //       kind: "boolean",
  //     },
  //     B: {
  //       kind: "literal",
  //       value: false,
  //     },
  //     C: {
  //       kind: "literal",
  //       value: true,
  //     },
  //   }
  // );

  // test(
  //   "null types",
  //   `
  //   export type A = null;
  //   `,
  //   {
  //     A: {
  //       kind: "null",
  //     },
  //   }
  // );

  // test(
  //   "number types",
  //   `
  //   export type A = number;
  //   export type B = 123;
  //   export type C = -123;
  //   export type D = 0;
  //   `,
  //   {
  //     A: {
  //       kind: "number",
  //     },
  //     B: {
  //       kind: "literal",
  //       value: 123,
  //     },
  //     C: {
  //       kind: "literal",
  //       value: -123,
  //     },
  //     D: {
  //       kind: "literal",
  //       value: 0,
  //     },
  //   }
  // );

  // test(
  //   "object types",
  //   `
  //   export type A = {
  //     foo: string;
  //     bar?: number;
  //     baz: C;
  //     baz2: D;
  //     recursive?: A;
  //   }
  //   export interface B {
  //     foo: string;
  //     bar?: number;
  //     baz: C;
  //     baz2: D;
  //     recursive?: B;
  //   }
  //   type C = {
  //     qux: string;
  //   }
  //   interface D {
  //     qux2: string;
  //   }
  //   `,
  //   {
  //     A: {
  //       kind: "object",
  //       properties: {
  //         foo: {
  //           type: {
  //             kind: "string",
  //           },
  //           required: true,
  //         },
  //         bar: {
  //           type: {
  //             kind: "number",
  //           },
  //           required: false,
  //         },
  //         baz: {
  //           type: {
  //             kind: "alias",
  //             name: "C",
  //           },
  //           required: true,
  //         },
  //         baz2: {
  //           type: {
  //             kind: "alias",
  //             name: "D",
  //           },
  //           required: true,
  //         },
  //         recursive: {
  //           type: {
  //             kind: "alias",
  //             name: "A",
  //           },
  //           required: false,
  //         },
  //       },
  //     },
  //     B: {
  //       kind: "object",
  //       properties: {
  //         foo: {
  //           type: {
  //             kind: "string",
  //           },
  //           required: true,
  //         },
  //         bar: {
  //           type: {
  //             kind: "number",
  //           },
  //           required: false,
  //         },
  //         baz: {
  //           type: {
  //             kind: "alias",
  //             name: "C",
  //           },
  //           required: true,
  //         },
  //         baz2: {
  //           type: {
  //             kind: "alias",
  //             name: "D",
  //           },
  //           required: true,
  //         },
  //         recursive: {
  //           type: {
  //             kind: "alias",
  //             name: "B",
  //           },
  //           required: false,
  //         },
  //       },
  //     },
  //     C: {
  //       kind: "object",
  //       properties: {
  //         qux: {
  //           type: {
  //             kind: "string",
  //           },
  //           required: true,
  //         },
  //       },
  //     },
  //     D: {
  //       kind: "object",
  //       properties: {
  //         qux2: {
  //           type: {
  //             kind: "string",
  //           },
  //           required: true,
  //         },
  //       },
  //     },
  //   }
  // );

  // test(
  //   "string types",
  //   `
  //   export type A = string;
  //   export type B = "";
  //   export type C = "foo";
  //   `,
  //   {
  //     A: {
  //       kind: "string",
  //     },
  //     B: {
  //       kind: "literal",
  //       value: "",
  //     },
  //     C: {
  //       kind: "literal",
  //       value: "foo",
  //     },
  //   }
  // );

  // test(
  //   "undefined types",
  //   `
  //   export type A = undefined;
  //   export type B = void;
  //   `,
  //   {
  //     A: {
  //       kind: "undefined",
  //     },
  //     B: {
  //       kind: "undefined",
  //     },
  //   }
  // );

  // test(
  //   "union types",
  //   `
  //   export type A = B | C;
  //   type B = string;
  //   type C = number;
  //   export type D = "foo" | "bar";
  //   `,
  //   {
  //     A: {
  //       kind: "union",
  //       types: [
  //         {
  //           kind: "string",
  //         },
  //         {
  //           kind: "number",
  //         },
  //       ],
  //     },
  //     D: {
  //       kind: "union",
  //       types: [
  //         {
  //           kind: "literal",
  //           value: "foo",
  //         },
  //         {
  //           kind: "literal",
  //           value: "bar",
  //         },
  //       ],
  //     },
  //   }
  // );

  // test(
  //   "intersection types",
  //   `
  //   export type A = {
  //     foo: string
  //   } & B;
  //   type B = {
  //     bar: string
  //   };
  //   `,
  //   {
  //     A: {
  //       kind: "intersection",
  //       types: [
  //         {
  //           kind: "object",
  //           properties: {
  //             foo: {
  //               required: true,
  //               type: {
  //                 kind: "string",
  //               },
  //             },
  //           },
  //         },
  //         {
  //           kind: "alias",
  //           name: "B",
  //         },
  //       ],
  //     },
  //     B: {
  //       kind: "object",
  //       properties: {
  //         bar: {
  //           required: true,
  //           type: {
  //             kind: "string",
  //           },
  //         },
  //       },
  //     },
  //   }
  // );

  test(
    "generic types",
    `
    export type A = {
      foo: string
    } & Kinded<"a">;

    export type Kinded<T extends string> = {
      kind: T
    };
    `,
    {
      A: {
        kind: "intersection",
        types: [
          {
            kind: "object",
            properties: {
              foo: {
                required: true,
                type: {
                  kind: "string",
                },
              },
            },
          },
          {
            kind: "object",
            properties: {
              kind: {
                type: {
                  kind: "literal",
                  value: "a",
                },
                required: true,
              },
            },
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
