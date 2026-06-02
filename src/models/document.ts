/** Response from the document upload endpoint. */
export interface DocumentUploadResponse {
  /** Document UUID — pass this as a reference in signing requests. */
  id: string;
  /** SHA hash of the uploaded document for integrity verification. */
  hash: string;
}
