import { User } from "../generated/user";

const user = User.create({
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
