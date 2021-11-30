import { Address } from "./address";

export type User = {
  name: {
    first?: string;
    last: string;
  } & {
    middle?: string;
  };
  address: Address;
  test?: Box<string>;
  parent?: User;
  siblings: User[];
} & Type<"user">;

type Type<T extends string> = {
  type: T;
};

export type UserList = User[];

interface Box<T> {
  value: T;
}
