import BlogStatus from "./blogStatus";
import BlogCategory from "./blogCategory";

export interface Blog {
  _id: string;
  user: {
    id: string;
    name: string;
    email: string;
  }
  title: string;
  byliner: string;
  slug: string;
  status: BlogStatus;
  category_id: BlogCategory;
  cover: string;
  views: number;
  likes: number;
  metaDescription: string;
  metaTitle: string;
  published_at: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogDetails extends Blog {
  body: string;
}