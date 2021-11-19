import { Address } from "../generated/user";

const address = Address.sanitize({
  street: "123 George Street",
  city: "Sydney",
  postCode: 2000, // try "2000" instead to see error
  irrelevant: 123,
});
console.log(address);
