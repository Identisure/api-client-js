# idkollen-client (TypeScript / JavaScript)

TypeScript client for the [IDkollen](https://idkollen.se) REST API. Ships ESM and CJS bundles with full type declarations.

## Installation

```sh
npm install idkollen-client
```

## Usage

```typescript
import { IdkollenClientBuilder } from "idkollen-client";
import { BankIdSeAuthRequest, PollOptions } from "idkollen-client";

const client = new IdkollenClientBuilder("client_id", "client_secret")
  .environment("staging")
  .build();

const session = await client.bankidSe().auth(new BankIdSeAuthRequest());

const result = await client
  .bankidSe()
  .waitForAuth(session.id, new PollOptions());

console.log(result);
```

## Error handling

All errors are thrown as `IdkollenError` instances with a `code` discriminant:

| `code`          | Meaning                                              |
|-----------------|------------------------------------------------------|
| `"http"`        | Network failure (no response received)               |
| `"api"`         | Non-2xx response from the server                     |
| `"poll_timeout"`| `waitFor*` deadline exceeded without terminal state  |
| `"json"`        | Unexpected response shape                            |

## Polling options

```typescript
// Custom poll interval and timeout
const opts = new PollOptions(
  1_000,   // intervalMs — how often to poll (default 2 000)
  60_000,  // timeoutMs  — give up after this long (default 300 000)
);
```

## Build

```sh
npm run build   # produce dist/
npm run check   # TypeScript type-check only
```
