import type { ApiErrorCode, CallInitiator } from "@/models/common";

/** Request body for starting a BankID SE authentication session. */
export interface BankIdSeAuthRequest {
  /** Swedish personal identification number. Restricts the session to this user. */
  ssn?: string;
  /** End-user IP address (or the closest proxy address). */
  ipAddress?: string;
  /** URL to receive the result callback on success or failure. */
  callbackUrl?: string;
  /** Force PIN entry even when biometrics are enabled. */
  pinRequired?: boolean;
  /** Text describing the purpose of the identification, shown to the user. */
  intent?: string;
  /** Swedish organisation number — enables company signatory check. */
  orgNumber?: string;
  /** Fetch the user's registered address on completion. */
  requestAddress?: boolean;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
}

/** Request body for starting a BankID SE signing session. */
export interface BankIdSeSignRequest {
  /** Visible text the user must approve in BankID (max 50 000 chars). */
  text: string;
  /** Restrict the signing session to this Swedish personal number. */
  ssn?: string;
  /** End-user IP address (or the closest proxy address). */
  ipAddress?: string;
  /** URL to receive the result callback on success or failure. */
  callbackUrl?: string;
  /** Force PIN entry even when biometrics are enabled. */
  pinRequired?: boolean;
  /** Hash digest of an associated file. */
  digest?: string;
  /** Swedish organisation number — enables company signatory check. */
  orgNumber?: string;
  /** Fetch the user's registered address on completion. */
  requestAddress?: boolean;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
}

/** Request body for starting a BankID SE phone authentication session. */
export interface BankIdSePhoneAuthRequest {
  /** Swedish personal identification number of the user to authenticate. */
  ssn: string;
  /** Whether the user or the RP initiated the phone call. */
  callInitiator: CallInitiator;
  /** URL to receive the result callback on success or failure. */
  callbackUrl?: string;
  /** Force PIN entry even when biometrics are enabled. */
  pinRequired?: boolean;
  /** Text describing the purpose of the identification, shown to the user. */
  intent?: string;
  /** Swedish organisation number — enables company signatory check. */
  orgNumber?: string;
  /** Fetch the user's registered address on completion. */
  requestAddress?: boolean;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
}

/** Request body for starting a BankID SE phone signing session. */
export interface BankIdSePhoneSignRequest {
  /** Swedish personal identification number of the user to sign. */
  ssn: string;
  /** Whether the user or the RP initiated the phone call. */
  callInitiator: CallInitiator;
  /** Visible text the user must approve in BankID (max 50 000 chars). */
  text: string;
  /** URL to receive the result callback on success or failure. */
  callbackUrl?: string;
  /** Force PIN entry even when biometrics are enabled. */
  pinRequired?: boolean;
  /** Hash digest of an associated file. */
  digest?: string;
  /** Swedish organisation number — enables company signatory check. */
  orgNumber?: string;
  /** Fetch the user's registered address on completion. */
  requestAddress?: boolean;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
}

/** Request body for verifying a scanned BankID SE QR code. */
export interface BankIdSeVerifyRequest {
  /** Complete content of the scanned BankID QR code. */
  qrCode: string;
}

/** BankID SE session status discriminated union. */
export type BankIdSeStatus =
  | ({ status: "PENDING" } & BankIdSePending)
  | ({ status: "COMPLETED" } & BankIdSeCompleted)
  | ({ status: "FAILED" } & BankIdSeFailed);

/** Returned while the user has not yet acted in the BankID app. */
export interface BankIdSePending {
  /** BankID order reference / session ID. */
  id: string;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
  /** Token for launching the BankID app directly (autostart URL). */
  autoStartToken?: string;
  /** Static token used to seed the animated QR code. */
  qrStartToken?: string;
  /** Secret used together with `qrStartToken` to generate QR frames. */
  qrStartSecret?: string;
  /** BankID hint code describing the current waiting state. */
  hintCode?: string;
}

/** Returned when the BankID SE session has completed successfully. */
export interface BankIdSeCompleted {
  /** BankID order reference / session ID. */
  id: string;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
  /** Swedish personal identification number (personnummer). */
  ssn: string;
  name: string;
  givenName: string;
  surname: string;
  /** Date the BankID certificate became valid (YYYY-MM-DD). */
  certStartDate?: string;
  /** Present only when `requestAddress` was `true`. */
  address?: string;
  /** Company signatory result text. Present only when `orgNumber` was provided. */
  companySignatoryText?: string;
}

/** Returned when the BankID SE session has failed. */
export interface BankIdSeFailed {
  /** BankID order reference / session ID. */
  id: string;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
  error: ApiErrorCode;
}

/** Response from the BankID SE QR code verification endpoint. */
export interface BankIdSeVerifyResponse {
  /** Swedish personal identification number. */
  ssn: string;
  name: string;
  givenName: string;
  surname: string;
  age?: number;
  /** Date the QR code was verified (YYYY-MM-DD, UTC). */
  verifiedAt?: string;
}
