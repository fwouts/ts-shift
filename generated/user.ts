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
          const address: any = __value__;
          const address_sanitized: any = {};
          address_sanitized["street"] =
            typeof address["street"] === "string"
              ? address["street"]
              : fail("Address.street is not a string", address["street"]);
          address_sanitized["city"] =
            typeof address["city"] === "string"
              ? address["city"]
              : fail("Address.city is not a string", address["city"]);
          address_sanitized["postCode"] =
            typeof address["postCode"] === "number"
              ? address["postCode"]
              : fail("Address.postCode is not a number", address["postCode"]);
          return address_sanitized;
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
          const user: any = __value__;
          const user_sanitized: any = {};
          user_sanitized["name"] =
            typeof user["name"] === "object" && user["name"] !== null
              ? (() => {
                  const user_name: any = user["name"];
                  const user_name_sanitized: any = {};
                  if (user_name["first"] !== undefined) {
                    user_name_sanitized["first"] =
                      typeof user_name["first"] === "string"
                        ? user_name["first"]
                        : fail(
                            "User.name.first is not a string",
                            user_name["first"]
                          );
                  }
                  user_name_sanitized["last"] =
                    typeof user_name["last"] === "string"
                      ? user_name["last"]
                      : fail(
                          "User.name.last is not a string",
                          user_name["last"]
                        );
                  return user_name_sanitized;
                })()
              : fail("User.name is not an object", user["name"]);
          user_sanitized["address"] = Address.sanitize(user["address"]);
          user_sanitized["test"] =
            typeof user["test"] === "object" && user["test"] !== null
              ? (() => {
                  const user_test: any = user["test"];
                  const user_test_sanitized: any = {};
                  user_test_sanitized["value"] =
                    typeof user_test["value"] === "string"
                      ? user_test["value"]
                      : fail(
                          "User.test.value is not a string",
                          user_test["value"]
                        );
                  return user_test_sanitized;
                })()
              : fail("User.test is not an object", user["test"]);
          if (user["parent"] !== undefined) {
            user_sanitized["parent"] = User.sanitize(user["parent"]);
          }
          return user_sanitized;
        })()
      : fail("User is not an object", __value__);
  },
};
