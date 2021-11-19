import { inspect } from "util";

export type Address = {
  street: string;
  city: string;
  postCode: number;
};

export const Address: Type<Address> = {
  name: "Address",
  schema: {
    kind: "object",
    properties: {
      ["street"]: {
        schema: {
          kind: "string",
        },
        required: true,
      },
      ["city"]: {
        schema: {
          kind: "string",
        },
        required: true,
      },
      ["postCode"]: {
        schema: {
          kind: "number",
        },
        required: true,
      },
    },
  },
  create(__value__: Address) {
    Address.validate(__value__);
    return __value__;
  },
  sanitize(__value__: unknown) {
    Address.validate(__value__);
    return (() => {
      const address: any = __value__;
      const address_sanitized: any = {};
      address_sanitized["street"] = address["street"];
      address_sanitized["city"] = address["city"];
      address_sanitized["postCode"] = address["postCode"];
      return address_sanitized;
    })();
  },
  validate(__value__: any, { errorCatcher } = {}): __value__ is Address {
    try {
      return (
        (typeof __value__ === "object" &&
          __value__ !== null &&
          (typeof (__value__ as any)["street"] === "string" ||
            fail(
              "Address.street is not a string",
              (__value__ as any)["street"]
            )) &&
          (typeof (__value__ as any)["city"] === "string" ||
            fail("Address.city is not a string", (__value__ as any)["city"])) &&
          (typeof (__value__ as any)["postCode"] === "number" ||
            fail(
              "Address.postCode is not a number",
              (__value__ as any)["postCode"]
            ))) ||
        fail("Address is not an object", __value__)
      );
    } catch (e: any) {
      if (!(e instanceof ValidationError)) {
        throw e;
      }
      if (errorCatcher) {
        errorCatcher.error = e.message;
        return false;
      } else {
        throw e;
      }
    }
  },
};

export type User = {
  name: {
    first?: string;
    last: string;
  };
  address: Address;
  test?: {
    value: string;
  };
  parent?: User;
};

export const User: Type<User> = {
  name: "User",
  schema: {
    kind: "object",
    properties: {
      ["name"]: {
        schema: {
          kind: "object",
          properties: {
            ["first"]: {
              schema: {
                kind: "string",
              },
              required: false,
            },
            ["last"]: {
              schema: {
                kind: "string",
              },
              required: true,
            },
          },
        },
        required: true,
      },
      ["address"]: {
        schema: {
          kind: "alias",
          type: () => Address,
        },
        required: true,
      },
      ["test"]: {
        schema: {
          kind: "object",
          properties: {
            ["value"]: {
              schema: {
                kind: "string",
              },
              required: true,
            },
          },
        },
        required: false,
      },
      ["parent"]: {
        schema: {
          kind: "alias",
          type: () => User,
        },
        required: false,
      },
    },
  },
  create(__value__: User) {
    User.validate(__value__);
    return __value__;
  },
  sanitize(__value__: unknown) {
    User.validate(__value__);
    return (() => {
      const user: any = __value__;
      const user_sanitized: any = {};
      user_sanitized["name"] = (() => {
        const user_name: any = user["name"];
        const user_name_sanitized: any = {};
        if (user_name["first"] !== undefined) {
          user_name_sanitized["first"] = user_name["first"];
        }
        user_name_sanitized["last"] = user_name["last"];
        return user_name_sanitized;
      })();
      user_sanitized["address"] = Address.sanitize(user["address"]);
      if (user["test"] !== undefined) {
        user_sanitized["test"] = (() => {
          const user_test: any = user["test"];
          const user_test_sanitized: any = {};
          user_test_sanitized["value"] = user_test["value"];
          return user_test_sanitized;
        })();
      }
      if (user["parent"] !== undefined) {
        user_sanitized["parent"] = User.sanitize(user["parent"]);
      }
      return user_sanitized;
    })();
  },
  validate(__value__: any, { errorCatcher } = {}): __value__ is User {
    try {
      return (
        (typeof __value__ === "object" &&
          __value__ !== null &&
          ((typeof (__value__ as any)["name"] === "object" &&
            (__value__ as any)["name"] !== null &&
            (((__value__ as any)["name"] as any)["first"] === undefined ||
              typeof ((__value__ as any)["name"] as any)["first"] ===
                "string" ||
              fail(
                "User.name.first is not a string",
                ((__value__ as any)["name"] as any)["first"]
              )) &&
            (typeof ((__value__ as any)["name"] as any)["last"] === "string" ||
              fail(
                "User.name.last is not a string",
                ((__value__ as any)["name"] as any)["last"]
              ))) ||
            fail("User.name is not an object", (__value__ as any)["name"])) &&
          Address.validate((__value__ as any)["address"]) &&
          ((__value__ as any)["test"] === undefined ||
            (typeof (__value__ as any)["test"] === "object" &&
              (__value__ as any)["test"] !== null &&
              (typeof ((__value__ as any)["test"] as any)["value"] ===
                "string" ||
                fail(
                  "User.test.value is not a string",
                  ((__value__ as any)["test"] as any)["value"]
                ))) ||
            fail("User.test is not an object", (__value__ as any)["test"])) &&
          ((__value__ as any)["parent"] === undefined ||
            User.validate((__value__ as any)["parent"]))) ||
        fail("User is not an object", __value__)
      );
    } catch (e: any) {
      if (!(e instanceof ValidationError)) {
        throw e;
      }
      if (errorCatcher) {
        errorCatcher.error = e.message;
        return false;
      } else {
        throw e;
      }
    }
  },
};

function fail(message: string, value: unknown): never {
  throw new ValidationError(message + ":\n" + inspect(value));
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function createErrorCatcher(): ErrorCatcher {
  return {
    error: "",
  };
}

export interface ErrorCatcher {
  error: string;
}

export type Type<T> = {
  name: string;
  schema: Schema;
  create(value: T): T;
  sanitize<S = T>(value: S): T;
  validate<S = T>(
    value: S,
    options?: {
      errorCatcher?: ErrorCatcher;
    }
  ): boolean;
};

export type Schema =
  | {
      kind: "alias";
      type: () => Type<unknown>;
    }
  | {
      kind: "any";
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
      properties: Record<string, ObjectSchemaProperty>;
    }
  | {
      kind: "string";
    }
  | {
      kind: "undefined";
    }
  | {
      kind: "union";
      schemas: Schema[];
    };

export type ObjectSchemaProperty = {
  schema: Schema;
  required: boolean;
};
