import { IdkollenClient } from "@/client";
import type { DocumentUploadResponse } from "@/models/document";

/** Document upload and download operations. */
export class DocumentEndpoint {
  constructor(private readonly client: IdkollenClient) {}

  /**
   * Upload a PDF document. Returns the document ID for use in sign requests.
   * @param file Raw file bytes.
   * @param filename Original filename sent as the multipart part name.
   * @param mimeType MIME type of the file. Defaults to `"application/pdf"`.
   */
  public async upload(
    file: Uint8Array,
    filename: string,
    mimeType?: string,
  ): Promise<DocumentUploadResponse> {
    const form = new FormData();
    const blob = new Blob([new Uint8Array(file)], { type: mimeType ?? "application/pdf" });
    form.append("file", blob, filename);

    return this.client._postMultipart("/document", form);
  }

  /**
   * Download a signed PDF by document ID.
   * @returns Raw PDF bytes.
   */
  public async download(id: string): Promise<Uint8Array> {
    return this.client._getBytes(`/document/${id}`);
  }

  /** Delete a document by ID. */
  public async delete(id: string): Promise<void> {
    return this.client._delete(`/document/${id}`);
  }
}
