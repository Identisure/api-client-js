import type { ApiErrorCode } from "@/models/common";

/** Request body for starting a Finnish Trust Network (FTN) authentication session. */
export interface FtnAuthRequest {
  /** URL to redirect the user to after completing the flow. */
  redirectUrl?: string;
  /** Request the user's phone number. */
  requestPhone?: boolean;
  /** Request the user's email address. */
  requestEmail?: boolean;
  /** Request the user's registered address. */
  requestAddress?: boolean;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
}

/** FTN session status discriminated union. */
export type FtnStatus =
  | ({ status: "PENDING" } & FtnPending)
  | ({ status: "COMPLETED" } & FtnCompleted)
  | ({ status: "FAILED" } & FtnFailed);

/** Returned while the user has not yet acted. */
export interface FtnPending {
  id: string;
  refId?: string;
  /** Redirect URL for the FTN provider login page. */
  url: string;
}

/** Returned when the FTN session has completed successfully. */
export interface FtnCompleted {
  id: string;
  refId?: string;
  /** Finnish personal identity code (henkilötunnus). May be absent depending on the provider. */
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
}

/** Returned when the FTN session has failed. */
export interface FtnFailed {
  id: string;
  refId?: string;
  error: ApiErrorCode;
}
