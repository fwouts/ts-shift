export type Type =
  | {
      kind: "alias";
      name: string;
    }
  | {
      kind: "number";
    }
  | {
      kind: "object";
      properties: Record<string, ObjectProperty>;
    }
  | {
      kind: "string";
    };

export type ObjectProperty = {
  type: Type;
  required: boolean;
};
