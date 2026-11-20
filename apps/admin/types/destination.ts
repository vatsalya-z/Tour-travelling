export type DestinationStatus = "published" | "draft";

export interface Destination {
  id: string;
  name: string;
  slug: string;
  state: string;
  description: string | null;
  cover_image: string | null;
  gallery_images: string[];
  best_time_to_visit: string | null;
  attractions: string[];
  meta_title: string | null;
  meta_description: string | null;
  status: DestinationStatus;
  created_at: string;
  updated_at: string;
}

