<img align="left" height="100" style="margin-right: 10px;" src="../img/icon.png">

# IDkollen JavaScript/TypeScript Client

[![npm][npm-image]][npm-url]
[![Downloads][downloads-image]][downloads-url]
[![Documentation][docs-image]][docs-url]
[![MIT license][license-image]][license-url]

[npm-image]: https://img.shields.io/npm/v/@idkollen/client?style=flat-square 
[npm-url]: https://www.npmjs.com/package/@idkollen/client
[downloads-image]: https://img.shields.io/npm/d18m/@idkollen/client?style=flat-square
[downloads-url]: https://www.npmjs.com/package/@idkollen/client?activeTab=versions
[docs-image]: https://img.shields.io/badge/github-docs-orange?logo=github&style=flat-square
[docs-url]: https://idkollen.github.io/idk-clients/js
[license-image]: https://img.shields.io/badge/license-MIT-blue?style=flat-square
[license-url]: https://opensource.org/license/mit

API client for the [IDkollen](https://developers.idkollen.se) REST API. Ships ESM and CJS bundles with full type declarations.

## Installation

```sh
npm install @idkollen/client
```

## Usage

```typescript
import { IdkollenClientBuilder, BankIdSeAuthRequest, PollOptions } from "@idkollen/client";

const client = new IdkollenClientBuilder("client_id", "client_secret")
  .environment("staging")
  .build();

const session = await client.bankidSe().auth(new BankIdSeAuthRequest());

const result = await client
  .bankidSe()
  .waitForAuth(session.id, new PollOptions());

console.log(result);
```

## Development

#### Prerequisites

* [Node 24+ & NPM 11+](https://nodejs.org/)

#### Build

To build the project, simply issue the following command:

```sh
$ npm run build
```

#### Test

##### Linting

```sh
$ npm run check
$ npm run lint
```

##### Unit Testing 

```sh
$ npm run test
```
