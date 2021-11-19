import { User } from "../generated/user";

const user = User.sanitize({
  name: {
    last: "W",
  },
  address: {
    street: "123 George Street",
    city: "Sydney",
    postCode: 2000, // try "2000" instead to see error
    irrelevant: 123,
  },
});
console.log(user);

// You can create a new user with this convenience method:
User.create({
  name: {
    last: "W",
  },
  address: {
    street: "123 George Street",
    city: "Sydney",
    postCode: 2000,
    // Note: adding any unnecessary field will cause a TypeScript error!
  },
});
