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
    let result: Address;
    if (typeof __value__ !== "object" || __value__ === null) {
      fail("Address is not an object", __value__);
    }
    {
      const _address: any = __value__;
      result = {} as any;
      let address_street: string;
      if (typeof _address["street"] !== "string") {
        fail("Address.street is not a string", _address["street"]);
      }
      address_street = _address["street"];
      result["street"] = address_street;
      let address_city: string;
      if (typeof _address["city"] !== "string") {
        fail("Address.city is not a string", _address["city"]);
      }
      address_city = _address["city"];
      result["city"] = address_city;
      let address_postCode: number;
      if (typeof _address["postCode"] !== "number") {
        fail("Address.postCode is not a number", _address["postCode"]);
      }
      address_postCode = _address["postCode"];
      result["postCode"] = address_postCode;
    }
    return result;
  },
} as const);

export type User = {
  name: {
    first?: string;
    last: string;
  } & {
    middle?: string;
  };
  address: Address;
  test?: {
    value: string;
  };
  parent?: User;
  siblings: Array<User>;
} & Type;

export const User = Object.freeze({
  name: "User",
  schema: {
    kind: "intersection",
    schemas: [
      {
        kind: "object",
        properties: {
          ["name"]: {
            schema: {
              kind: "intersection",
              schemas: [
                {
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
                {
                  kind: "object",
                  properties: {
                    ["middle"]: {
                      schema: {
                        kind: "string",
                      },
                      required: false,
                    },
                  },
                },
              ],
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
      {
        kind: "alias",
        type: () => Type,
      },
    ],
  },
  create(__value__: User): User {
    let result: User;
    result = {} as any;

    let user_0: {
      name: {
        first?: string;
        last: string;
      } & {
        middle?: string;
      };
      address: Address;
      test?: {
        value: string;
      };
      parent?: User;
      siblings: Array<User>;
    };
    if (typeof __value__ !== "object" || __value__ === null) {
      fail("User is not an object", __value__);
    }
    {
      const _user: any = __value__;
      user_0 = {} as any;
      let user_name: {
        first?: string;
        last: string;
      } & {
        middle?: string;
      };
      user_name = {} as any;

      let user_name_0: {
        first?: string;
        last: string;
      };
      if (typeof _user["name"] !== "object" || _user["name"] === null) {
        fail("User.name is not an object", _user["name"]);
      }
      {
        const _user_name: any = _user["name"];
        user_name_0 = {} as any;
        if (_user_name["first"] !== undefined) {
          let user_name_first: string;
          if (typeof _user_name["first"] !== "string") {
            fail("User.name.first is not a string", _user_name["first"]);
          }
          user_name_first = _user_name["first"];
          user_name_0["first"] = user_name_first;
        }
        let user_name_last: string;
        if (typeof _user_name["last"] !== "string") {
          fail("User.name.last is not a string", _user_name["last"]);
        }
        user_name_last = _user_name["last"];
        user_name_0["last"] = user_name_last;
      }
      user_name = {
        ...user_name,
        ...user_name_0,
      };
      let user_name_1: {
        middle?: string;
      };
      if (typeof _user["name"] !== "object" || _user["name"] === null) {
        fail("User.name is not an object", _user["name"]);
      }
      {
        const _user_name: any = _user["name"];
        user_name_1 = {} as any;
        if (_user_name["middle"] !== undefined) {
          let user_name_middle: string;
          if (typeof _user_name["middle"] !== "string") {
            fail("User.name.middle is not a string", _user_name["middle"]);
          }
          user_name_middle = _user_name["middle"];
          user_name_1["middle"] = user_name_middle;
        }
      }
      user_name = {
        ...user_name,
        ...user_name_1,
      };
      user_0["name"] = user_name;
      let user_address: Address;
      user_address = Address.create(_user["address"]);
      user_0["address"] = user_address;
      if (_user["test"] !== undefined) {
        let user_test: {
          value: string;
        };
        if (typeof _user["test"] !== "object" || _user["test"] === null) {
          fail("User.test is not an object", _user["test"]);
        }
        {
          const _user_test: any = _user["test"];
          user_test = {} as any;
          let user_test_value: string;
          if (typeof _user_test["value"] !== "string") {
            fail("User.test.value is not a string", _user_test["value"]);
          }
          user_test_value = _user_test["value"];
          user_test["value"] = user_test_value;
        }
        user_0["test"] = user_test;
      }
      if (_user["parent"] !== undefined) {
        let user_parent: User;
        user_parent = User.create(_user["parent"]);
        user_0["parent"] = user_parent;
      }
      let user_siblings: Array<User>;
      if (!Array.isArray(_user["siblings"])) {
        fail("User.siblings is not an array", _user["siblings"]);
      }
      user_siblings = [];
      for (const item of _user["siblings"]) {
        let user_siblings_item;
        user_siblings_item = User.create(item);
        user_siblings.push(user_siblings_item);
      }
      user_0["siblings"] = user_siblings;
    }
    result = {
      ...result,
      ...user_0,
    };
    let user_1: Type;
    user_1 = Type.create(__value__);
    result = {
      ...result,
      ...user_1,
    };
    return result;
  },
} as const);

export type Type = {
  type: "user";
};

export const Type = Object.freeze({
  name: "Type",
  schema: {
    kind: "object",
    properties: {
      ["type"]: {
        schema: {
          kind: "literal",
          value: "user",
        },
        required: true,
      },
    },
  },
  create(__value__: Type): Type {
    let result: Type;
    if (typeof __value__ !== "object" || __value__ === null) {
      fail("Type is not an object", __value__);
    }
    {
      const _type: any = __value__;
      result = {} as any;
      let type_type: "user";
      if (_type["type"] !== "user") {
        fail(`Type.type must equal "user"`, _type["type"]);
      }
      type_type = _type["type"];
      result["type"] = type_type;
    }
    return result;
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
    let result: UserList;
    if (!Array.isArray(__value__)) {
      fail("UserList is not an array", __value__);
    }
    result = [];
    for (const item of __value__) {
      let userList_item;
      userList_item = User.create(item);
      result.push(userList_item);
    }
    return result;
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

export type TsShiftType<T> = {
  readonly name: string;
  readonly schema: TsShiftSchema;
  create(value: unknown): T;
};

export type TsShiftSchema =
  | {
      readonly kind: "alias";
      readonly type: () => TsShiftType<unknown>;
    }
  | {
      readonly kind: "any";
    }
  | {
      readonly kind: "array";
      readonly schema: TsShiftSchema;
    }
  | {
      readonly kind: "boolean";
    }
  | {
      readonly kind: "intersection";
      readonly schemas: ReadonlyArray<TsShiftSchema>;
    }
  | {
      readonly kind: "literal";
      readonly value: boolean | number | string;
    }
  | {
      readonly kind: "null";
    }
  | {
      readonly kind: "number";
    }
  | {
      readonly kind: "object";
      readonly properties: Readonly<
        Record<string, TsShiftObjectSchemaProperty>
      >;
    }
  | {
      readonly kind: "string";
    }
  | {
      readonly kind: "undefined";
    }
  | {
      readonly kind: "union";
      readonly schemas: ReadonlyArray<TsShiftSchema>;
    };

export type TsShiftObjectSchemaProperty = {
  schema: TsShiftSchema;
  required: boolean;
};
