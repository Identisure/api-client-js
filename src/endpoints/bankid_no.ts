import { IdkollenClient, IdkollenError, PollOptions } from "@/client";
import type {
  BankIdNoAuthRequest,
  BankIdNoBackchannelAuthRequest,
  BankIdNoSignRequest,
  BankIdNoStatus,
} from "@/models/bankid_no";
import type { AgeVerificationRequest, AgeVerificationStatus } from "@/models/age_verification";

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** BankID NO operations. */
export class BankIdNoEndpoint {
  constructor(private readonly client: IdkollenClient) {}

  /** Start a BankID NO authentication session. */
  public async auth(req: BankIdNoAuthRequest): Promise<BankIdNoStatus> {
    return this.client._post("/v3/bankid-no/auth", req);
  }

  /** Start a BankID NO backchannel authentication session. */
  public async backchannelAuth(req: BankIdNoBackchannelAuthRequest): Promise<BankIdNoStatus> {
    return this.client._post("/v3/bankid-no/backchannel/auth", req);
  }

  /** Start a BankID NO signing session. */
  public async sign(req: BankIdNoSignRequest): Promise<BankIdNoStatus> {
    return this.client._post("/v3/bankid-no/sign", req);
  }

  /** Poll the current status of a BankID NO authentication session. */
  public async authStatus(id: string): Promise<BankIdNoStatus> {
    return this.client._get(`/v3/bankid-no/auth/${id}`);
  }

  /** Poll the current status of a BankID NO signing session. */
  public async signStatus(id: string): Promise<BankIdNoStatus> {
    return this.client._get(`/v3/bankid-no/sign/${id}`);
  }

  /** Cancel a BankID NO authentication session. */
  public async cancelAuth(id: string): Promise<void> {
    return this.client._delete(`/v3/bankid-no/auth/${id}`);
  }

  /** Cancel a BankID NO signing session. */
  public async cancelSign(id: string): Promise<void> {
    return this.client._delete(`/v3/bankid-no/sign/${id}`);
  }

  /** Start a BankID NO age verification session. */
  public async ageVerification(req: AgeVerificationRequest): Promise<AgeVerificationStatus> {
    return this.client._post("/v3/bankid-no/age-verification", req);
  }

  /** Poll the current status of a BankID NO age verification session. */
  public async ageVerificationStatus(id: string): Promise<AgeVerificationStatus> {
    return this.client._get(`/v3/bankid-no/age-verification/${id}`);
  }

  /** Cancel a BankID NO age verification session. */
  public async cancelAgeVerification(id: string): Promise<void> {
    return this.client._delete(`/v3/bankid-no/age-verification/${id}`);
  }

  /**
   * Poll until the authentication session reaches a terminal state or the timeout elapses.
   * @throws {IdkollenError} with code `"poll_timeout"` if the timeout is exceeded.
   */
  public async waitForAuth(
    id: string,
    opts: PollOptions = new PollOptions(),
  ): Promise<BankIdNoStatus> {
    const deadline = Date.now() + opts.timeoutMs;

    while (true) {
      const status = await this.authStatus(id);

      if (status.status !== "PENDING") {
        return status;
      }

      if (Date.now() >= deadline) {
        throw new IdkollenError("poll_timeout", 0, "Poll timed out");
      }

      await sleep(opts.intervalMs);
    }
  }

  /**
   * Poll until the signing session reaches a terminal state or the timeout elapses.
   * @throws {IdkollenError} with code `"poll_timeout"` if the timeout is exceeded.
   */
  public async waitForSign(
    id: string,
    opts: PollOptions = new PollOptions(),
  ): Promise<BankIdNoStatus> {
    const deadline = Date.now() + opts.timeoutMs;

    while (true) {
      const status = await this.signStatus(id);

      if (status.status !== "PENDING") {
        return status;
      }

      if (Date.now() >= deadline) {
        throw new IdkollenError("poll_timeout", 0, "Poll timed out");
      }

      await sleep(opts.intervalMs);
    }
  }

  /**
   * Poll until the age verification session reaches a terminal state or the timeout elapses.
   * @throws {IdkollenError} with code `"poll_timeout"` if the timeout is exceeded.
   */
  public async waitForAgeVerification(
    id: string,
    opts: PollOptions = new PollOptions(),
  ): Promise<AgeVerificationStatus> {
    const deadline = Date.now() + opts.timeoutMs;

    while (true) {
      const status = await this.ageVerificationStatus(id);

      if (status.status !== "PENDING") {
        return status;
      }

      if (Date.now() >= deadline) {
        throw new IdkollenError("poll_timeout", 0, "Poll timed out");
      }

      await sleep(opts.intervalMs);
    }
  }
}
