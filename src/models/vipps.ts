import type { ApiErrorCode } from "@/models/common";

/** Request body for starting a Vipps MobilePay authentication session. */
export interface VippsAuthRequest {
  /** URL to redirect the user to after completing the flow. */
  redirectUrl?: string;
  /** Request the user's Norwegian personal number. */
  requestSsn?: boolean;
  /** Request the user's phone number. */
  requestPhone?: boolean;
  /** Request the user's email address. */
  requestEmail?: boolean;
  /** Request the user's registered address. */
  requestAddress?: boolean;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
  /** (BETA) Deep-link URI to return the user to your app after authentication. */
  appCallbackUri?: string;
}

/** Request body for starting a Vipps MobilePay backchannel authentication session. */
export interface VippsBackchannelAuthRequest {
  /** Phone number of the user to authenticate. */
  phone: string;
  /** Request the user's Norwegian personal number. */
  requestSsn?: boolean;
  /** Request the user's email address. */
  requestEmail?: boolean;
  /** Request the user's registered address. */
  requestAddress?: boolean;
  /** URL to receive the result callback on success or failure. */
  callbackUrl?: string;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
}

/** Vipps MobilePay session status discriminated union. */
export type VippsStatus =
  | ({ status: "PENDING" } & VippsPending)
  | ({ status: "COMPLETED" } & VippsCompleted)
  | ({ status: "FAILED" } & VippsFailed);

/** Returned while the user has not yet acted. */
export interface VippsPending {
  id: string;
  refId?: string;
  /** Redirect URL for the Vipps login page. */
  url?: string;
}

/** Returned when the Vipps session has completed successfully. */
export interface VippsCompleted {
  id: string;
  refId?: string;
  /** Present when `requestSsn` was `true`. */
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

/** Returned when the Vipps session has failed. */
export interface VippsFailed {
  id: string;
  refId?: string;
  error: ApiErrorCode;
}
