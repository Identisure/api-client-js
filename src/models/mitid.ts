import type { ApiErrorCode } from "@/models/common";

/** Request body for starting a MitID authentication session. */
export interface MitIdAuthRequest {
  /** URL to redirect the user to after completing the flow. */
  redirectUrl?: string;
  /** Text shown to the user during authentication. Must not contain `%` or `<` (max 130 chars). */
  referenceText?: string;
  /** Request the user's phone number. */
  requestPhone?: boolean;
  /** Request the user's email address. */
  requestEmail?: boolean;
  /** Request the user's registered address. */
  requestAddress?: boolean;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
}

/** Request body for starting a MitID backchannel authentication session. */
export interface MitIdBackchannelAuthRequest {
  /** Danish CPR number. */
  ssn: string;
  /** Message displayed in the MitID app to bind the session. */
  bindingMessage: string;
  /** URL to receive the result callback on success or failure. */
  callbackUrl?: string;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
}

/** Request body for starting a MitID signing session. */
export interface MitIdSignRequest {
  /** Text to sign, displayed in MitID (max 600 chars). */
  text: string;
  /** URL to redirect the user to after completing the flow. */
  redirectUrl?: string;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
}

/** MitID session status discriminated union. */
export type MitIdStatus =
  | ({ status: "PENDING" } & MitIdPending)
  | ({ status: "COMPLETED" } & MitIdCompleted)
  | ({ status: "FAILED" } & MitIdFailed);

/** Returned while the user has not yet acted. */
export interface MitIdPending {
  id: string;
  refId?: string;
  url?: string;
  /** Present in the backchannel flow — display this to the user. */
  bindingMessage?: string;
}

/** Returned when the MitID session has completed successfully. */
export interface MitIdCompleted {
  id: string;
  refId?: string;
  /** Danish CPR number. */
  ssn: string;
  name: string;
  givenName: string;
  surname: string;
  phone?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  pid?: string;
  bankId?: string;
  /** Present when the session was a signing session. */
  signResult?: MitIdSignResult;
}

/** Returned when the MitID session has failed. */
export interface MitIdFailed {
  id: string;
  refId?: string;
  error: ApiErrorCode;
}

/** Signing result returned in a completed MitID sign session. */
export interface MitIdSignResult {
  checksum: string;
}
