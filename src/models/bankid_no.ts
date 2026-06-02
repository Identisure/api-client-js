import type { ApiErrorCode } from "@/models/common";

/** Request body for starting a BankID NO authentication session. */
export interface BankIdNoAuthRequest {
  /** URL to redirect the user to after completing the flow. */
  redirectUrl?: string;
  /** Request the user's Norwegian personal number (fødselsnummer). */
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

/** Request body for starting a BankID NO backchannel authentication session. */
export interface BankIdNoBackchannelAuthRequest {
  /** Norwegian personal number (fødselsnummer). */
  ssn: string;
  /** URL to receive the result callback on success or failure. */
  callbackUrl?: string;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
}

/** Request body for starting a BankID NO signing session. */
export interface BankIdNoSignRequest {
  /** URL to redirect the user to after completing the flow. */
  redirectUrl?: string;
  /** Text to sign (max 118 chars). Mutually exclusive with `documents`. */
  text?: string;
  /** Document IDs to sign (from `/v3/document`). Mutually exclusive with `text`. */
  documents?: string[];
  requestSsn?: boolean;
  requestPhone?: boolean;
  requestEmail?: boolean;
  requestAddress?: boolean;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
}

/** BankID NO session status discriminated union. */
export type BankIdNoStatus =
  | ({ status: "PENDING" } & BankIdNoPending)
  | ({ status: "COMPLETED" } & BankIdNoCompleted)
  | ({ status: "FAILED" } & BankIdNoFailed);

/** Returned while the user has not yet acted. */
export interface BankIdNoPending {
  id: string;
  refId?: string;
  /** Redirect URL for the browser-flow login page. */
  url?: string;
  /** Present in the backchannel flow — display this to the user. */
  bindingMessage?: string;
}

/** Returned when the BankID NO session has completed successfully. */
export interface BankIdNoCompleted {
  id: string;
  refId?: string;
  /** Norwegian personal number. Present when `requestSsn` was `true`. */
  ssn: string;
  name: string;
  givenName: string;
  surname: string;
  /** Present when `requestPhone` was `true`. */
  phone?: string;
  /** Present when `requestEmail` was `true`. */
  email?: string;
  /** Present when `requestAddress` was `true`. */
  address?: string;
  birthDate?: string;
  /** BankID PID. */
  pid?: string;
  bankId?: string;
  /** Present when the session was a signing session. */
  signResult?: BankIdNoSignResult;
  /** Present when documents were signed. */
  signedDocuments?: BankIdNoSignedDocument[];
}

/** Returned when the BankID NO session has failed. */
export interface BankIdNoFailed {
  id: string;
  refId?: string;
  error: ApiErrorCode;
}

/** Signing result returned in a completed BankID NO sign session. */
export interface BankIdNoSignResult {
  endUser: string;
  merchant: string;
  hash: string;
}

/** A signed document reference returned in a completed BankID NO sign session. */
export interface BankIdNoSignedDocument {
  /** Document UUID matching the uploaded document. */
  id: string;
  /** SHA hash of the signed PDF. */
  hash: string;
}
