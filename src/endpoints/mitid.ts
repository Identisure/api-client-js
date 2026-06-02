import { IdkollenClient, IdkollenError, PollOptions } from "@/client";
import type {
  MitIdAuthRequest,
  MitIdBackchannelAuthRequest,
  MitIdSignRequest,
  MitIdStatus,
} from "@/models/mitid";

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** MitID operations. */
export class MitIdEndpoint {
  constructor(private readonly client: IdkollenClient) {}

  /** Start a MitID authentication session. */
  public async auth(req: MitIdAuthRequest): Promise<MitIdStatus> {
    return this.client._post("/v3/mitid/auth", req);
  }

  /** Start a MitID backchannel authentication session. */
  public async backchannelAuth(req: MitIdBackchannelAuthRequest): Promise<MitIdStatus> {
    return this.client._post("/v3/mitid/backchannel/auth", req);
  }

  /** Start a MitID signing session. */
  public async sign(req: MitIdSignRequest): Promise<MitIdStatus> {
    return this.client._post("/v3/mitid/sign", req);
  }

  /** Poll the current status of a MitID authentication session. */
  public async authStatus(id: string): Promise<MitIdStatus> {
    return this.client._get(`/v3/mitid/auth/${id}`);
  }

  /** Poll the current status of a MitID signing session. */
  public async signStatus(id: string): Promise<MitIdStatus> {
    return this.client._get(`/v3/mitid/sign/${id}`);
  }

  /** Cancel a MitID authentication session. */
  public async cancelAuth(id: string): Promise<void> {
    return this.client._delete(`/v3/mitid/auth/${id}`);
  }

  /** Cancel a MitID signing session. */
  public async cancelSign(id: string): Promise<void> {
    return this.client._delete(`/v3/mitid/sign/${id}`);
  }

  /**
   * Poll until the authentication session reaches a terminal state or the timeout elapses.
   * @throws {IdkollenError} with code `"poll_timeout"` if the timeout is exceeded.
   */
  public async waitForAuth(
    id: string,
    opts: PollOptions = new PollOptions(),
  ): Promise<MitIdStatus> {
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
  ): Promise<MitIdStatus> {
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
}
