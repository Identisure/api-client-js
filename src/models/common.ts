/** Language preference for UI messages shown to the user. */
export type Language = "ENGLISH" | "SWEDISH" | "NORWEGIAN" | "DANISH" | "FINNISH";

/**
 * Standardised error code present in all `FAILED` status responses.
 *
 * - `"AUTH_FAILED"` — authentication was rejected by the provider.
 * - `"CANCELLED"` — user or RP cancelled the transaction.
 * - `"INVALID_ID"` — certificate or identity document is invalid or expired.
 * - `"CONFLICT"` — a conflicting transaction is already in progress.
 * - `"INTERNAL_ERROR"` — unexpected internal error.
 * - `"SESSION_TIMEOUT"` — the session expired before completion.
 * - `"UNSUPPORTED_CLIENT"` — the user's device or app version is not supported.
 */
export type ApiErrorCode =
  | "AUTH_FAILED"
  | "CANCELLED"
  | "INVALID_ID"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "SESSION_TIMEOUT"
  | "UNSUPPORTED_CLIENT";

/** Whether the user or the relying party (RP) initiated the phone call. */
export type CallInitiator = "USER" | "RP";

/** ISO 3166-1 country code string (e.g. `"SWEDEN"`, `"NORWAY"`). */
export type Country = string;
