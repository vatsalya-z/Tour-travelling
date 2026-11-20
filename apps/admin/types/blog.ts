export type BlogStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  category: string | null;
  author_name: string | null;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  image_alt: string | null;
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  category?: string;
  author_name?: string;
  seo_title?: string;
  seo_description?: string;
  focus_keyword?: string;
  image_alt?: string;
  status?: BlogStatus;
  published_at?: string;
}

export interface UpdateBlogInput extends Partial<CreateBlogInput> {}

