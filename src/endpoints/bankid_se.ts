import { IdkollenClient, IdkollenError, PollOptions } from "@/client";
import type {
  BankIdSeAuthRequest,
  BankIdSePhoneAuthRequest,
  BankIdSePhoneSignRequest,
  BankIdSeSignRequest,
  BankIdSeStatus,
  BankIdSeVerifyRequest,
  BankIdSeVerifyResponse,
} from "@/models/bankid_se";
import type { AgeVerificationRequest, AgeVerificationStatus } from "@/models/age_verification";

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** BankID SE operations. */
export class BankIdSeEndpoint {
  constructor(private readonly client: IdkollenClient) {}

  /** Start a BankID SE authentication session. */
  public async auth(req: BankIdSeAuthRequest): Promise<BankIdSeStatus> {
    return this.client._post("/v3/bankid-se/auth", req);
  }

  /** Start a BankID SE phone authentication session. */
  public async phoneAuth(req: BankIdSePhoneAuthRequest): Promise<BankIdSeStatus> {
    return this.client._post("/v3/bankid-se/phone/auth", req);
  }

  /** Start a BankID SE signing session. */
  public async sign(req: BankIdSeSignRequest): Promise<BankIdSeStatus> {
    return this.client._post("/v3/bankid-se/sign", req);
  }

  /** Start a BankID SE phone signing session. */
  public async phoneSign(req: BankIdSePhoneSignRequest): Promise<BankIdSeStatus> {
    return this.client._post("/v3/bankid-se/phone/sign", req);
  }

  /** Verify a scanned BankID SE QR code. */
  public async verify(req: BankIdSeVerifyRequest): Promise<BankIdSeVerifyResponse> {
    return this.client._post("/v3/bankid-se/verify", req);
  }

  /** Start a BankID SE age verification session. */
  public async ageVerification(req: AgeVerificationRequest): Promise<AgeVerificationStatus> {
    return this.client._post("/v3/bankid-se/age-verification", req);
  }

  /** Poll the current status of a BankID SE authentication session. */
  public async authStatus(id: string): Promise<BankIdSeStatus> {
    return this.client._get(`/v3/bankid-se/auth/${id}`);
  }

  /** Poll the current status of a BankID SE signing session. */
  public async signStatus(id: string): Promise<BankIdSeStatus> {
    return this.client._get(`/v3/bankid-se/sign/${id}`);
  }

  /** Poll the current status of a BankID SE age verification session. */
  public async ageVerificationStatus(id: string): Promise<AgeVerificationStatus> {
    return this.client._get(`/v3/bankid-se/age-verification/${id}`);
  }

  /** Cancel a BankID SE authentication session. */
  public async cancelAuth(id: string): Promise<void> {
    return this.client._delete(`/v3/bankid-se/auth/${id}`);
  }

  /** Cancel a BankID SE signing session. */
  public async cancelSign(id: string): Promise<void> {
    return this.client._delete(`/v3/bankid-se/sign/${id}`);
  }

  /** Cancel a BankID SE age verification session. */
  public async cancelAgeVerification(id: string): Promise<void> {
    return this.client._delete(`/v3/bankid-se/age-verification/${id}`);
  }

  /**
   * Poll until the authentication session reaches a terminal state or the timeout elapses.
   * @throws {IdkollenError} with code `"poll_timeout"` if the timeout is exceeded.
   */
  public async waitForAuth(
    id: string,
    opts: PollOptions = new PollOptions(),
  ): Promise<BankIdSeStatus> {
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
  ): Promise<BankIdSeStatus> {
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
