export type Type =
  | {
      kind: "alias";
      name: string;
    }
  | {
      kind: "any";
    }
  | {
      kind: "array";
      type: Type;
    }
  | {
      kind: "boolean";
    }
  | {
      kind: "literal";
      value: boolean | number | string;
    }
  | {
      kind: "null";
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
    }
  | {
      kind: "undefined";
    }
  | {
      kind: "union";
      types: Type[];
    }
  | {
      kind: "intersection";
      types: Type[];
    };

export type ObjectProperty = {
  type: Type;
  required: boolean;
};
