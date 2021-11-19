import { createErrorCatcher, User } from "../generated/user";

const errorCatcher = createErrorCatcher();
if (
  !User.validate(
    {},
    {
      errorCatcher,
    }
  )
) {
  console.log(errorCatcher.error);
}

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
