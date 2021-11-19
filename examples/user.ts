import { Address } from "./address";

export interface User {
  name: {
    first?: string;
    last: string;
  };
  address: Address;
}
