import { EditionStatus } from "./editionStatus";

export interface Edition extends EditionUpdateRequest {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EditionUpdateRequest extends EditionCreateRequest {
  _id: string;
}

export interface EditionCreateRequest {
  name: string;
  edition_id: number;
  edition_link: string;
  published_at?: Date;
  status: EditionStatus;
}
