export type Address = {
  street: string;
  city: string;
  postCode: number;
};

export const Address = Object.freeze({
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
  create(__value__: Address): Address {
    if (!Address.validate(__value__, { allowAdditionalProperties: true })) {
      // This error will never be thrown because
      // validate() already throws.
      throw new ValidationError();
    }
    return (() => {
      const address: any = __value__;
      const address_sanitized: any = {};
      address_sanitized["street"] = address["street"];
      address_sanitized["city"] = address["city"];
      address_sanitized["postCode"] = address["postCode"];
      return address_sanitized;
    })();
  },
  validate(
    __value__: Address,
    { errorCatcher, allowAdditionalProperties }: ValidateOptions = {}
  ): __value__ is Address {
    try {
      if (typeof __value__ !== "object" || __value__ === null) {
        fail("Address is not an object", __value__);
      }
      const address = __value__ as any;
      if (!allowAdditionalProperties) {
        const allowedKeys = new Set(["street", "city", "postCode"]);
        for (const key of Object.keys(address)) {
          if (!allowedKeys.has(key)) {
            fail("Address does not allow key " + key, __value__);
          }
        }
      }
      if (typeof address["street"] !== "string") {
        fail("Address.street is not a string", address["street"]);
      }
      if (typeof address["city"] !== "string") {
        fail("Address.city is not a string", address["city"]);
      }
      if (typeof address["postCode"] !== "number") {
        fail("Address.postCode is not a number", address["postCode"]);
      }
      return true;
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
} as const);

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
  siblings: Array<User>;
};

export const User = Object.freeze({
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
      ["siblings"]: {
        schema: {
          kind: "array",
          schema: {
            kind: "alias",
            type: () => User,
          },
        },
        required: true,
      },
    },
  },
  create(__value__: User): User {
    if (!User.validate(__value__, { allowAdditionalProperties: true })) {
      // This error will never be thrown because
      // validate() already throws.
      throw new ValidationError();
    }
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
      user_sanitized["address"] = Address.create(user["address"]);
      if (user["test"] !== undefined) {
        user_sanitized["test"] = (() => {
          const user_test: any = user["test"];
          const user_test_sanitized: any = {};
          user_test_sanitized["value"] = user_test["value"];
          return user_test_sanitized;
        })();
      }
      if (user["parent"] !== undefined) {
        user_sanitized["parent"] = User.create(user["parent"]);
      }
      user_sanitized["siblings"] = (user["siblings"] as Array<any>).map(
        (item) => User.create(item)
      );
      return user_sanitized;
    })();
  },
  validate(
    __value__: User,
    { errorCatcher, allowAdditionalProperties }: ValidateOptions = {}
  ): __value__ is User {
    try {
      if (typeof __value__ !== "object" || __value__ === null) {
        fail("User is not an object", __value__);
      }
      const user = __value__ as any;
      if (!allowAdditionalProperties) {
        const allowedKeys = new Set([
          "name",
          "address",
          "test",
          "parent",
          "siblings",
        ]);
        for (const key of Object.keys(user)) {
          if (!allowedKeys.has(key)) {
            fail("User does not allow key " + key, __value__);
          }
        }
      }
      if (typeof user["name"] !== "object" || user["name"] === null) {
        fail("User.name is not an object", user["name"]);
      }
      const user_name = user["name"] as any;
      if (!allowAdditionalProperties) {
        const allowedKeys = new Set(["first", "last"]);
        for (const key of Object.keys(user_name)) {
          if (!allowedKeys.has(key)) {
            fail("User.name does not allow key " + key, user["name"]);
          }
        }
      }
      if (user_name["first"] !== undefined) {
        if (typeof user_name["first"] !== "string") {
          fail("User.name.first is not a string", user_name["first"]);
        }
      }
      if (typeof user_name["last"] !== "string") {
        fail("User.name.last is not a string", user_name["last"]);
      }
      Address.validate(user["address"], { allowAdditionalProperties });
      if (user["test"] !== undefined) {
        if (typeof user["test"] !== "object" || user["test"] === null) {
          fail("User.test is not an object", user["test"]);
        }
        const user_test = user["test"] as any;
        if (!allowAdditionalProperties) {
          const allowedKeys = new Set(["value"]);
          for (const key of Object.keys(user_test)) {
            if (!allowedKeys.has(key)) {
              fail("User.test does not allow key " + key, user["test"]);
            }
          }
        }
        if (typeof user_test["value"] !== "string") {
          fail("User.test.value is not a string", user_test["value"]);
        }
      }
      if (user["parent"] !== undefined) {
        User.validate(user["parent"], { allowAdditionalProperties });
      }
      if (!Array.isArray(user["siblings"])) {
        fail("User.siblings is not an array", user["siblings"]);
      }
      for (const item of user["siblings"]) {
        User.validate(item, { allowAdditionalProperties });
      }
      return true;
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
} as const);

export type UserList = Array<User>;

export const UserList = Object.freeze({
  name: "UserList",
  schema: {
    kind: "array",
    schema: {
      kind: "alias",
      type: () => User,
    },
  },
  create(__value__: UserList): UserList {
    if (!UserList.validate(__value__, { allowAdditionalProperties: true })) {
      // This error will never be thrown because
      // validate() already throws.
      throw new ValidationError();
    }
    return (__value__ as Array<any>).map((item) => User.create(item));
  },
  validate(
    __value__: UserList,
    { errorCatcher, allowAdditionalProperties }: ValidateOptions = {}
  ): __value__ is UserList {
    try {
      if (!Array.isArray(__value__)) {
        fail("UserList is not an array", __value__);
      }
      for (const item of __value__) {
        User.validate(item, { allowAdditionalProperties });
      }
      return true;
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
} as const);

function fail(message: string, value: unknown): never {
  let debugValue: string;
  try {
    debugValue = JSON.stringify(value, null, 2);
  } catch (e) {
    // Not representable in JSON.
    debugValue = `${value}`;
  }
  throw new ValidationError(message + ":\n" + debugValue);
}

export class ValidationError extends Error {
  constructor(message = "") {
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
  readonly name: string;
  readonly schema: Schema;
  create<S = T>(value: S): T;
  validate<S = T>(value: S, options?: ValidateOptions): boolean;
};

export interface ValidateOptions {
  errorCatcher?: ErrorCatcher;
  allowAdditionalProperties?: boolean | undefined;
}

export type Schema =
  | {
      kind: "alias";
      type: () => Type<unknown>;
    }
  | {
      kind: "any";
    }
  | {
      kind: "array";
      schema: Schema;
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
