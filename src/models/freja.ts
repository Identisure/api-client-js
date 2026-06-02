import type { ApiErrorCode, Country } from "@/models/common";

/**
 * Minimum required Freja eID registration level.
 * - `"EXTENDED"` — standard Freja eID registration (default).
 * - `"PLUS"` — enhanced Freja eID+ registration.
 */
export type FrejaRegistrationLevel = "EXTENDED" | "PLUS";

/** Request body for starting a Freja eID authentication session. */
export interface FrejaAuthRequest {
  /** Personal number of the user to authenticate. */
  ssn?: string;
  /** URL to receive the result callback on success or failure. */
  callbackUrl?: string;
  /** Minimum required Freja registration level. */
  minRegistrationLevel?: FrejaRegistrationLevel;
  /** Organisation number — enables company signatory check. */
  orgNumber?: string;
  /** Fetch the user's registered address on completion. */
  requestAddress?: boolean;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
}

/** Request body for starting a Freja eID backchannel authentication session. */
export interface FrejaBackchannelAuthRequest {
  /** Personal number of the user to authenticate. */
  ssn: string;
  /** Country of the user's Freja identity document. */
  country: Country;
  /** URL to receive the result callback on success or failure. */
  callbackUrl?: string;
  /** Minimum required Freja registration level. */
  minRegistrationLevel?: FrejaRegistrationLevel;
  /** Organisation number — enables company signatory check. */
  orgNumber?: string;
  /** Fetch the user's registered address on completion. */
  requestAddress?: boolean;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
}

/** Request body for starting a Freja eID signing session. */
export interface FrejaSignRequest {
  /** Text to sign, displayed to the user in the Freja app. */
  text: string;
  /** Personal number of the user to sign. */
  ssn?: string;
  /** URL to receive the result callback on success or failure. */
  callbackUrl?: string;
  /** Minimum required Freja registration level. */
  minRegistrationLevel?: FrejaRegistrationLevel;
  /** Organisation number — enables company signatory check. */
  orgNumber?: string;
  /** Fetch the user's registered address on completion. */
  requestAddress?: boolean;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
}

/** Request body for starting a Freja eID backchannel signing session. */
export interface FrejaBackchannelSignRequest {
  /** Personal number of the user to sign. */
  ssn: string;
  /** Country of the user's Freja identity document. */
  country: Country;
  /** Text to sign, displayed to the user in the Freja app. */
  text: string;
  /** URL to receive the result callback on success or failure. */
  callbackUrl?: string;
  /** Minimum required Freja registration level. */
  minRegistrationLevel?: FrejaRegistrationLevel;
  /** Organisation number — enables company signatory check. */
  orgNumber?: string;
  /** Fetch the user's registered address on completion. */
  requestAddress?: boolean;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
}

/** Freja eID session status discriminated union. */
export type FrejaStatus =
  | ({ status: "PENDING" } & FrejaPending)
  | ({ status: "COMPLETED" } & FrejaCompleted)
  | ({ status: "FAILED" } & FrejaFailed);

/** Returned while the user has not yet acted in the Freja app. */
export interface FrejaPending {
  id: string;
  refId?: string;
  /** Freja transaction reference — also used as the autostart token. */
  autoStartToken: string;
  /** Data string to render as the Freja QR code. */
  qrData: string;
}

/** Returned when the Freja eID session has completed successfully. */
export interface FrejaCompleted {
  id: string;
  refId?: string;
  ssn: string;
  /** Country of the user's identity document (e.g. `"SWEDEN"`). */
  country: Country;
  name: string;
  givenName: string;
  surname: string;
  /** Present only when `requestAddress` was `true`. */
  address?: string;
  /** Present only when `orgNumber` was provided. */
  companySignatoryText?: string;
}

/** Returned when the Freja eID session has failed. */
export interface FrejaFailed {
  id: string;
  refId?: string;
  error: ApiErrorCode;
}
