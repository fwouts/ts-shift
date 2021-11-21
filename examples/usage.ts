import { User } from "../generated/user";

const payload = <any>{
  name: {
    last: "W",
  },
  address: {
    street: "123 George Street",
    city: "Sydney",
    postCode: 2000, // try "2000" instead to see error
    irrelevant: 123,
  },
  siblings: [],
};

const user = User.create(payload);
console.log(user);
