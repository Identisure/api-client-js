import type { ApiErrorCode } from "@/models/common";

/**
 * Request body for starting an age verification session.
 *
 * At least one of `minAge` or `maxAge` must be provided.
 * If both are given, `maxAge` must be >= `minAge`.
 */
export interface AgeVerificationRequest {
  /** Minimum age (inclusive). */
  minAge?: number;
  /** Maximum age (inclusive). */
  maxAge?: number;
  /** Reference ID returned verbatim in the result and callback. */
  refId?: string;
  /** URL to receive the result callback on success or failure. */
  callbackUrl?: string;
  /** URL to redirect the user to after completing age verification. */
  redirectUrl?: string;
}

/** Age verification session status discriminated union. */
export type AgeVerificationStatus =
  | ({ status: "PENDING" } & AgeVerificationPending)
  | ({ status: "COMPLETED" } & AgeVerificationCompleted)
  | ({ status: "FAILED" } & AgeVerificationFailed);

/** Returned while the user has not yet completed age verification. */
export interface AgeVerificationPending {
  id: string;
  url?: string;
  minAge?: number;
  maxAge?: number;
}

/** Returned when the age verification session has completed. */
export interface AgeVerificationCompleted {
  id: string;
  /** `true` if the user's age is within the requested range. */
  ageVerified: boolean;
}

/** Returned when the age verification session has failed. */
export interface AgeVerificationFailed {
  id: string;
  error: ApiErrorCode;
}
