import { inspect } from "util";

function fail(message: string, value: unknown): never {
  throw new Error(message + ":\n" + inspect(value));
}

export type Type<T> = {
  sanitize(value: unknown): T;
};

export type Address = {
  street: string;
  city: string;
  postCode: number;
};

export const Address: Type<Address> = {
  sanitize(__value__: unknown): Address {
    return typeof __value__ === "object" && __value__ !== null
      ? (() => {
          const address = __value__ as any;
          return Object.fromEntries([
            [
              "street",
              typeof address["street"] === "string"
                ? address["street"]
                : fail("Address.street is not a string", address["street"]),
            ],
            [
              "city",
              typeof address["city"] === "string"
                ? address["city"]
                : fail("Address.city is not a string", address["city"]),
            ],
            [
              "postCode",
              typeof address["postCode"] === "number"
                ? address["postCode"]
                : fail("Address.postCode is not a number", address["postCode"]),
            ],
          ]);
        })()
      : fail("Address is not an object", __value__);
  },
};

export type User = {
  name: {
    first?: string;
    last: string;
  };
  address: Address;
  test: {
    value: string;
  };
  parent?: User;
};

export const User: Type<User> = {
  sanitize(__value__: unknown): User {
    return typeof __value__ === "object" && __value__ !== null
      ? (() => {
          const user = __value__ as any;
          return Object.fromEntries([
            [
              "name",
              typeof user["name"] === "object" && user["name"] !== null
                ? (() => {
                    const user_name = user["name"] as any;
                    return Object.fromEntries([
                      [
                        "first",
                        user["name"] === undefined ||
                          (typeof user_name["first"] === "string"
                            ? user_name["first"]
                            : fail(
                                "User.name.first is not a string",
                                user_name["first"]
                              )),
                      ],
                      [
                        "last",
                        typeof user_name["last"] === "string"
                          ? user_name["last"]
                          : fail(
                              "User.name.last is not a string",
                              user_name["last"]
                            ),
                      ],
                    ]);
                  })()
                : fail("User.name is not an object", user["name"]),
            ],
            ["address", Address.sanitize(user["address"])],
            [
              "test",
              typeof user["test"] === "object" && user["test"] !== null
                ? (() => {
                    const user_test = user["test"] as any;
                    return Object.fromEntries([
                      [
                        "value",
                        typeof user_test["value"] === "string"
                          ? user_test["value"]
                          : fail(
                              "User.test.value is not a string",
                              user_test["value"]
                            ),
                      ],
                    ]);
                  })()
                : fail("User.test is not an object", user["test"]),
            ],
            [
              "parent",
              __value__ === undefined || User.sanitize(user["parent"]),
            ],
          ]);
        })()
      : fail("User is not an object", __value__);
  },
};
