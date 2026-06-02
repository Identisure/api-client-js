import { version } from "../package.json";
import { BankIdSeEndpoint } from "@/endpoints/bankid_se";
import { BankIdNoEndpoint } from "@/endpoints/bankid_no";
import { FrejaEndpoint } from "@/endpoints/freja";
import { MitIdEndpoint } from "@/endpoints/mitid";
import { FtnEndpoint } from "@/endpoints/ftn";
import { VippsEndpoint } from "@/endpoints/vipps";
import { DocumentEndpoint } from "@/endpoints/document";

/** Errors returned by all client operations. */
export class IdkollenError extends Error {
  constructor(
    /** Discriminant for the error kind: `"http"` for network failures, `"api"` for non-2xx responses, `"poll_timeout"` when a `waitFor*` call exceeds its timeout, and `"json"` for unexpected response shapes. */
    public readonly code: "http" | "api" | "poll_timeout" | "json",
    /** HTTP status code for `"api"` errors; `0` for all other kinds. */
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "IdkollenError";
  }
}

/** Options for the high-level `waitFor*` polling helpers. */
export class PollOptions {
  constructor(
    /** How long to sleep between status polls, in milliseconds. Default: 2000 ms. */
    public readonly intervalMs: number = 2000,
    /** Maximum total time to wait before throwing {@link IdkollenError} with code `"poll_timeout"`, in milliseconds. Default: 300 000 ms. */
    public readonly timeoutMs: number = 300_000,
  ) {}
}

/** Pre-configured API base URL selection. `"production"` targets `https://api.idkollen.se`; `"staging"` targets `https://stgapi.idkollen.se`. */
export type Environment = "production" | "staging";

const BASE_URLS: Record<Environment, string> = {
  production: "https://api.idkollen.se",
  staging: "https://stgapi.idkollen.se",
};

/** Builder for constructing an {@link IdkollenClient}. */
export class IdkollenClientBuilder {
  private _environment: Environment = "production";
  private _baseUrl?: string;
  private _userAgent: string = `idkollen-client-js/${version}`;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {}

  /** Select a pre-configured environment. Overridden by {@link baseUrl} if both are set. */
  environment(env: Environment): this {
    this._environment = env;
    return this;
  }

  /** Override the API base URL, bypassing the environment selection entirely. */
  baseUrl(url: string): this {
    this._baseUrl = url;
    return this;
  }

  /** Override the `User-Agent` header sent with every request. */
  userAgent(ua: string): this {
    this._userAgent = ua;
    return this;
  }

  /** Construct the {@link IdkollenClient} from the accumulated configuration. */
  build(): IdkollenClient {
    const baseUrl = this._baseUrl ?? BASE_URLS[this._environment];

    return new IdkollenClient(baseUrl, this.clientId, this.clientSecret, this._userAgent);
  }
}

/** Authenticated HTTP client for the Idkollen REST API. Obtain one via {@link IdkollenClientBuilder}. */
export class IdkollenClient {
  constructor(
    private readonly baseUrl: string,
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly userAgent: string,
  ) {}

  /** Return an endpoint handle for BankID SE operations. */
  bankidSe(): BankIdSeEndpoint {
    return new BankIdSeEndpoint(this);
  }

  /** Return an endpoint handle for BankID NO operations. */
  bankidNo(): BankIdNoEndpoint {
    return new BankIdNoEndpoint(this);
  }

  /** Return an endpoint handle for Freja eID operations. */
  freja(): FrejaEndpoint {
    return new FrejaEndpoint(this);
  }

  /** Return an endpoint handle for MitID operations. */
  mitId(): MitIdEndpoint {
    return new MitIdEndpoint(this);
  }

  /** Return an endpoint handle for Finnish Trust Network (FTN) operations. */
  ftn(): FtnEndpoint {
    return new FtnEndpoint(this);
  }

  /** Return an endpoint handle for Vipps MobilePay operations. */
  vipps(): VippsEndpoint {
    return new VippsEndpoint(this);
  }

  /** Return an endpoint handle for document upload/download operations. */
  document(): DocumentEndpoint {
    return new DocumentEndpoint(this);
  }

  private authHeader(): string {
    return `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`;
  }

  private commonHeaders(): Record<string, string> {
    return {
      Authorization: this.authHeader(),
      "User-Agent": this.userAgent,
    };
  }

  private async handleResponse<T>(resp: Response): Promise<T> {
    if (resp.ok) {
      try {
        return (await resp.json()) as T;
      } catch (err) {
        throw new IdkollenError("json", 0, (err as Error).message);
      }
    }

    const text = await resp.text().catch(() => "");

    throw new IdkollenError("api", resp.status, text);
  }

  async _get<T>(path: string): Promise<T> {
    let resp: Response;
    try {
      resp = await fetch(`${this.baseUrl}${path}`, {
        method: "GET",
        headers: this.commonHeaders(),
      });
    } catch (err) {
      throw new IdkollenError("http", 0, (err as Error).message);
    }

    return this.handleResponse<T>(resp);
  }

  async _post<T>(path: string, body: unknown): Promise<T> {
    let resp: Response;
    try {
      resp = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: {
          ...this.commonHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new IdkollenError("http", 0, (err as Error).message);
    }

    return this.handleResponse<T>(resp);
  }

  async _delete(path: string): Promise<void> {
    let resp: Response;
    try {
      resp = await fetch(`${this.baseUrl}${path}`, {
        method: "DELETE",
        headers: this.commonHeaders(),
      });
    } catch (err) {
      throw new IdkollenError("http", 0, (err as Error).message);
    }

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");

      throw new IdkollenError("api", resp.status, text);
    }
  }

  async _postMultipart<T>(path: string, form: FormData): Promise<T> {
    let resp: Response;
    try {
      resp = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: this.commonHeaders(),
        body: form,
      });
    } catch (err) {
      throw new IdkollenError("http", 0, (err as Error).message);
    }

    return this.handleResponse<T>(resp);
  }

  async _getBytes(path: string): Promise<Uint8Array> {
    let resp: Response;
    try {
      resp = await fetch(`${this.baseUrl}${path}`, {
        method: "GET",
        headers: this.commonHeaders(),
      });
    } catch (err) {
      throw new IdkollenError("http", 0, (err as Error).message);
    }

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");

      throw new IdkollenError("api", resp.status, text);
    }

    const buf = await resp.arrayBuffer();

    return new Uint8Array(buf);
  }
}
