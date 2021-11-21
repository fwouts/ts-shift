# ts-shift

`ts-shift` generates efficient, TypeScript-friendly value validators from TypeScript types.

## Installation

```
npm install -D ts-shift # npm
yarn add -D ts-shift # yarn
pnpm add -D ts-shift # pnpm
```

## Example: validating incoming requests

Say you're building a POST endpoint for user sign-up. Simply define a request type in TypeScript:

```ts
// api/create-user-request.ts
export type CreateUserRequest = {
  email: string;
  password: string;
};
```

Run `ts-shift` to generate validators:

```sh
ts-shift api/create-user-request.ts -o types/create-user-request.ts
```

Then, simply do:

```ts
import { CreateUserRequest } from './types/create-user-request';

async function (req: Request) {
  const body = CreateUserRequest.create(req.body);
  // ...
}
```

Now, any invalid payload will throw an error, and additional properties will be stripped out. If a user tries to add `"admin": true`, it won't make it through anymore.

## Why you should use it

**✅ Zero dependencies**

**✅ No runtime reflection**

✅ Handles complex types thanks to TypeScript's own type resolver

✅ Generated code that you can understand

## Status

This package was created in November 2021. It's lacking tests, so usage in production is not yet encouraged.

## License

MIT
