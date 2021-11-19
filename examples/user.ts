import { Address } from "./address";

export interface User {
  name: {
    first?: string;
    last: string;
  };
  address: Address;
  test: Box<string>;
  parent?: User;
}

interface Box<T> {
  value: T;
}
