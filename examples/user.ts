import { Address } from "./address";

export type User = {
  name: {
    first?: string;
    last: string;
  };
  address: Address;
};
