import { readFileSync } from "node:fs";
import { createServer, type IncomingHttpHeaders, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { IdkollenClient, IdkollenClientBuilder, IdkollenError, PollOptions } from "../src/index";

interface RecordedRequest {
  method: string;
  path: string;
  headers: IncomingHttpHeaders;
  body: string;
}

interface QueuedResponse {
  status: number;
  body: string;
}

interface Session {
  status: string;
  id?: string;
}

const FAST = new PollOptions(1, 5_000);
const BASIC_AUTH = `Basic ${btoa("client-id:client-secret")}`;

function fixtureText(path: string): string {
  return readFileSync(new URL(`../../fixtures/${path}`, import.meta.url), "utf8");
}

function fixture(path: string): unknown {
  return JSON.parse(fixtureText(path));
}

let server: Server;
let queue: QueuedResponse[];
let requests: RecordedRequest[];
let client: IdkollenClient;

function respond(status: number, path: string): void {
  queue.push({ status, body: fixtureText(path) });
}

function requestLines(): string[] {
  return requests.map((r) => `${r.method} ${r.path}`);
}

beforeEach(async () => {
  queue = [];
  requests = [];
  server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      requests.push({
        method: req.method ?? "",
        path: req.url ?? "",
        headers: req.headers,
        body: Buffer.concat(chunks).toString("utf8"),
      });
      const next = queue.shift();
      if (!next) {
        res.writeHead(500).end();
        return;
      }
      res.writeHead(next.status, { "Content-Type": "application/json" }).end(next.body);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  client = new IdkollenClientBuilder("client-id", "client-secret")
    .baseUrl(`http://127.0.0.1:${port}`)
    .build();
});

afterEach(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

interface AuthProvider {
  dir: string;
  segment: string;
  start: (c: IdkollenClient) => Promise<Session>;
  wait: (c: IdkollenClient, id: string) => Promise<Session>;
}

const AUTH_PROVIDERS: AuthProvider[] = [
  {
    dir: "bankid_se",
    segment: "bankid-se",
    start: (c) => c.bankidSe().auth({}),
    wait: (c, id) => c.bankidSe().waitForAuth(id, FAST),
  },
  {
    dir: "bankid_no",
    segment: "bankid-no",
    start: (c) => c.bankidNo().auth({}),
    wait: (c, id) => c.bankidNo().waitForAuth(id, FAST),
  },
  {
    dir: "freja",
    segment: "freja",
    start: (c) => c.freja().auth({}),
    wait: (c, id) => c.freja().waitForAuth(id, FAST),
  },
  {
    dir: "mitid",
    segment: "mitid",
    start: (c) => c.mitId().auth({}),
    wait: (c, id) => c.mitId().waitForAuth(id, FAST),
  },
  {
    dir: "ftn",
    segment: "ftn",
    start: (c) => c.ftn().auth({}),
    wait: (c, id) => c.ftn().waitForAuth(id, FAST),
  },
  {
    dir: "vipps",
    segment: "vipps",
    start: (c) => c.vipps().auth({}),
    wait: (c, id) => c.vipps().waitForAuth(id, FAST),
  },
];

const SIGN_PROVIDERS: AuthProvider[] = [
  {
    dir: "bankid_se",
    segment: "bankid-se",
    start: (c) => c.bankidSe().sign({ text: "Sign this" }),
    wait: (c, id) => c.bankidSe().waitForSign(id, FAST),
  },
  {
    dir: "bankid_no",
    segment: "bankid-no",
    start: (c) => c.bankidNo().sign({ text: "Sign this" }),
    wait: (c, id) => c.bankidNo().waitForSign(id, FAST),
  },
  {
    dir: "freja",
    segment: "freja",
    start: (c) => c.freja().sign({ text: "Sign this" }),
    wait: (c, id) => c.freja().waitForSign(id, FAST),
  },
  {
    dir: "mitid",
    segment: "mitid",
    start: (c) => c.mitId().sign({ text: "Sign this" }),
    wait: (c, id) => c.mitId().waitForSign(id, FAST),
  },
];

async function startAndWait(p: AuthProvider, pendingFixture: string): Promise<Session> {
  const started = await p.start(client);
  expect(started).toEqual(fixture(pendingFixture));

  return p.wait(client, started.id ?? "");
}

describe.each(AUTH_PROVIDERS)("$dir auth", (p) => {
  const id = (fixture(`${p.dir}/auth_pending.json`) as Session).id;
  const statusPath = `/v3/${p.segment}/auth/${id}`;

  it("polls until completed", async () => {
    respond(201, `${p.dir}/auth_pending.json`);
    respond(200, `${p.dir}/auth_pending.json`);
    respond(200, `${p.dir}/auth_completed.json`);

    const result = await startAndWait(p, `${p.dir}/auth_pending.json`);

    expect(result).toEqual(fixture(`${p.dir}/auth_completed.json`));
    expect(requestLines()).toEqual([
      `POST /v3/${p.segment}/auth`,
      `GET ${statusPath}`,
      `GET ${statusPath}`,
    ]);
    for (const r of requests) {
      expect(r.headers.authorization).toBe(BASIC_AUTH);
    }
    expect(requests[0].headers["content-type"]).toBe("application/json");
  });

  it("returns failed", async () => {
    respond(201, `${p.dir}/auth_pending.json`);
    respond(200, `${p.dir}/auth_failed.json`);

    const result = await startAndWait(p, `${p.dir}/auth_pending.json`);

    expect(result).toEqual(fixture(`${p.dir}/auth_failed.json`));
    expect(result).toMatchObject({ status: "FAILED", error: "CANCELLED" });
  });

  it("returns unknown", async () => {
    respond(201, `${p.dir}/auth_pending.json`);
    respond(200, `${p.dir}/auth_unknown.json`);

    const result = await startAndWait(p, `${p.dir}/auth_pending.json`);

    expect(result).toEqual({ status: "UNKNOWN", rawStatus: "SOMETHING_NEW" });
  });
});

describe.each(SIGN_PROVIDERS)("$dir sign", (p) => {
  it("polls until completed", async () => {
    const id = (fixture(`${p.dir}/auth_pending.json`) as Session).id;
    respond(201, `${p.dir}/auth_pending.json`);
    respond(200, `${p.dir}/auth_pending.json`);
    respond(200, `${p.dir}/sign_completed.json`);

    const result = await startAndWait(p, `${p.dir}/auth_pending.json`);

    expect(result).toEqual(fixture(`${p.dir}/sign_completed.json`));
    expect(requestLines()).toEqual([
      `POST /v3/${p.segment}/sign`,
      `GET /v3/${p.segment}/sign/${id}`,
      `GET /v3/${p.segment}/sign/${id}`,
    ]);
    expect(JSON.parse(requests[0].body)).toMatchObject({ text: "Sign this" });
  });
});

describe("bankid_se", () => {
  it("phone auth polls until completed", async () => {
    respond(201, "bankid_se/phone_auth_pending.json");
    respond(200, "bankid_se/auth_completed.json");

    const started = await client
      .bankidSe()
      .phoneAuth({ ssn: "199001011239", callInitiator: "USER" });
    expect(started).toEqual(fixture("bankid_se/phone_auth_pending.json"));
    const id = (started as Session).id ?? "";
    const result = await client.bankidSe().waitForAuth(id, FAST);

    expect(result).toEqual(fixture("bankid_se/auth_completed.json"));
    expect(requestLines()).toEqual([
      "POST /v3/bankid-se/phone/auth",
      `GET /v3/bankid-se/auth/${id}`,
    ]);
  });

  it("verifies a QR code", async () => {
    respond(200, "bankid_se/verify.json");

    const result = await client.bankidSe().verify({ qrCode: "bankid.qr" });

    expect(result).toEqual(fixture("bankid_se/verify.json"));
    expect(requestLines()).toEqual(["POST /v3/bankid-se/verify"]);
    expect(JSON.parse(requests[0].body)).toEqual({ qrCode: "bankid.qr" });
  });
});

describe("age verification", () => {
  it.each(["completed", "failed"])("polls until %s", async (outcome) => {
    const id = (fixture("age_verification/pending.json") as Session).id;
    respond(201, "age_verification/pending.json");
    respond(200, "age_verification/pending.json");
    respond(200, `age_verification/${outcome}.json`);

    const started = await client.bankidSe().ageVerification({ minAge: 18 });
    expect(started).toEqual(fixture("age_verification/pending.json"));
    const result = await client
      .bankidSe()
      .waitForAgeVerification(started.status === "PENDING" ? started.id : "", FAST);

    expect(result).toEqual(fixture(`age_verification/${outcome}.json`));
    expect(requestLines()).toEqual([
      "POST /v3/bankid-se/age-verification",
      `GET /v3/bankid-se/age-verification/${id}`,
      `GET /v3/bankid-se/age-verification/${id}`,
    ]);
  });

  it("returns unknown", async () => {
    respond(201, "age_verification/pending.json");
    respond(200, "age_verification/unknown.json");

    const started = await client.bankidSe().ageVerification({ minAge: 18 });
    const result = await client
      .bankidSe()
      .waitForAgeVerification(started.status === "PENDING" ? started.id : "", FAST);

    expect(result).toEqual({ status: "UNKNOWN", rawStatus: "SOMETHING_NEW" });
  });
});

describe("document", () => {
  it("uploads a file", async () => {
    respond(201, "document/upload.json");

    const result = await client.document().upload(new Uint8Array([37, 80, 68, 70]), "contract.pdf");

    expect(result).toEqual(fixture("document/upload.json"));
    expect(requestLines()).toEqual(["POST /v3/document"]);
    expect(requests[0].headers["content-type"]).toMatch(/^multipart\/form-data/);
    expect(requests[0].body).toContain('filename="contract.pdf"');
  });
});

describe("errors", () => {
  it("throws IdkollenError on an API error", async () => {
    respond(400, "error.json");

    const err = await client
      .ftn()
      .auth({})
      .catch((e: unknown) => e);

    expect(err).toBeInstanceOf(IdkollenError);
    expect(err).toMatchObject({ code: "api", status: 400 });
    expect((err as IdkollenError).message).toContain("Invalid request");
  });
});
