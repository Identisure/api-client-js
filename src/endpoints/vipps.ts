import { IdkollenClient, IdkollenError, PollOptions } from "@/client";
import type { VippsAuthRequest, VippsBackchannelAuthRequest, VippsStatus } from "@/models/vipps";

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Vipps MobilePay operations. */
export class VippsEndpoint {
  constructor(private readonly client: IdkollenClient) {}

  /** Start a Vipps authentication session. */
  public async auth(req: VippsAuthRequest): Promise<VippsStatus> {
    return this.client._post("/v3/vipps/auth", req);
  }

  /** Start a Vipps backchannel authentication session. */
  public async backchannelAuth(req: VippsBackchannelAuthRequest): Promise<VippsStatus> {
    return this.client._post("/v3/vipps/backchannel/auth", req);
  }

  /** Poll the current status of a Vipps authentication session. */
  public async authStatus(id: string): Promise<VippsStatus> {
    return this.client._get(`/v3/vipps/auth/${id}`);
  }

  /** Cancel a Vipps authentication session. */
  public async cancelAuth(id: string): Promise<void> {
    return this.client._delete(`/v3/vipps/auth/${id}`);
  }

  /**
   * Poll until the authentication session reaches a terminal state or the timeout elapses.
   * @throws {IdkollenError} with code `"poll_timeout"` if the timeout is exceeded.
   */
  public async waitForAuth(
    id: string,
    opts: PollOptions = new PollOptions(),
  ): Promise<VippsStatus> {
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
}
