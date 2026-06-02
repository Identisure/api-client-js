import { IdkollenClient, IdkollenError, PollOptions } from "@/client";
import type { FtnAuthRequest, FtnStatus } from "@/models/ftn";
import type { AgeVerificationRequest, AgeVerificationStatus } from "@/models/age_verification";

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Finnish Trust Network (FTN) operations. */
export class FtnEndpoint {
  constructor(private readonly client: IdkollenClient) {}

  /** Start a FTN authentication session. */
  public async auth(req: FtnAuthRequest): Promise<FtnStatus> {
    return this.client._post("/v3/ftn/auth", req);
  }

  /** Start a FTN age verification session. */
  public async ageVerification(req: AgeVerificationRequest): Promise<AgeVerificationStatus> {
    return this.client._post("/v3/ftn/age-verification", req);
  }

  /** Poll the current status of a FTN authentication session. */
  public async authStatus(id: string): Promise<FtnStatus> {
    return this.client._get(`/v3/ftn/auth/${id}`);
  }

  /** Poll the current status of a FTN age verification session. */
  public async ageVerificationStatus(id: string): Promise<AgeVerificationStatus> {
    return this.client._get(`/v3/ftn/age-verification/${id}`);
  }

  /** Cancel a FTN authentication session. */
  public async cancelAuth(id: string): Promise<void> {
    return this.client._delete(`/v3/ftn/auth/${id}`);
  }

  /** Cancel a FTN age verification session. */
  public async cancelAgeVerification(id: string): Promise<void> {
    return this.client._delete(`/v3/ftn/age-verification/${id}`);
  }

  /**
   * Poll until the authentication session reaches a terminal state or the timeout elapses.
   * @throws {IdkollenError} with code `"poll_timeout"` if the timeout is exceeded.
   */
  public async waitForAuth(id: string, opts: PollOptions = new PollOptions()): Promise<FtnStatus> {
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
