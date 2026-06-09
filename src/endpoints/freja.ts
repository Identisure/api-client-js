import { IdkollenClient, IdkollenError, PollOptions } from "@/client";
import type {
  FrejaAuthRequest,
  FrejaBackchannelAuthRequest,
  FrejaBackchannelSignRequest,
  FrejaSignRequest,
  FrejaStatus,
} from "@/models/freja";
import type { AgeVerificationRequest, AgeVerificationStatus } from "@/models/age_verification";

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Freja eID operations. */
export class FrejaEndpoint {
  constructor(private readonly client: IdkollenClient) {}

  /** Start a Freja eID authentication session. */
  public async auth(req: FrejaAuthRequest): Promise<FrejaStatus> {
    return this.client._post("/v3/freja/auth", req);
  }

  /** Start a Freja eID backchannel authentication session. */
  public async backchannelAuth(req: FrejaBackchannelAuthRequest): Promise<FrejaStatus> {
    return this.client._post("/v3/freja/backchannel/auth", req);
  }

  /** Start a Freja eID signing session. */
  public async sign(req: FrejaSignRequest): Promise<FrejaStatus> {
    return this.client._post("/v3/freja/sign", req);
  }

  /** Start a Freja eID backchannel signing session. */
  public async backchannelSign(req: FrejaBackchannelSignRequest): Promise<FrejaStatus> {
    return this.client._post("/v3/freja/backchannel/sign", req);
  }

  /** Poll the current status of a Freja eID authentication session. */
  public async authStatus(id: string): Promise<FrejaStatus> {
    return this.client._get(`/v3/freja/auth/${id}`);
  }

  /** Poll the current status of a Freja eID signing session. */
  public async signStatus(id: string): Promise<FrejaStatus> {
    return this.client._get(`/v3/freja/sign/${id}`);
  }

  /** Cancel a Freja eID authentication session. */
  public async cancelAuth(id: string): Promise<void> {
    return this.client._delete(`/v3/freja/auth/${id}`);
  }

  /** Cancel a Freja eID signing session. */
  public async cancelSign(id: string): Promise<void> {
    return this.client._delete(`/v3/freja/sign/${id}`);
  }

  /** Start a Freja eID age verification session. */
  public async ageVerification(req: AgeVerificationRequest): Promise<AgeVerificationStatus> {
    return this.client._post("/v3/freja/age-verification", req);
  }

  /** Poll the current status of a Freja eID age verification session. */
  public async ageVerificationStatus(id: string): Promise<AgeVerificationStatus> {
    return this.client._get(`/v3/freja/age-verification/${id}`);
  }

  /** Cancel a Freja eID age verification session. */
  public async cancelAgeVerification(id: string): Promise<void> {
    return this.client._delete(`/v3/freja/age-verification/${id}`);
  }

  /**
   * Poll until the authentication session reaches a terminal state or the timeout elapses.
   * @throws {IdkollenError} with code `"poll_timeout"` if the timeout is exceeded.
   */
  public async waitForAuth(
    id: string,
    opts: PollOptions = new PollOptions(),
  ): Promise<FrejaStatus> {
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
  ): Promise<FrejaStatus> {
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
