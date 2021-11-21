import { Address } from "./address";

export interface User {
  name: {
    first?: string;
    last: string;
  };
  address: Address;
  test?: Box<string>;
  parent?: User;
  siblings: User[];
}

export type UserList = User[];

interface Box<T> {
  value: T;
}
