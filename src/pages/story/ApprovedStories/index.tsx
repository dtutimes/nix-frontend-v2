import { TagIcon } from "@/assets/TagIcon";
import MoreMenu from "@/components/MoreMenu";
import SearchBar from "@/components/SearchBar";
import { Spinner } from "@/components/Spinner";
import Table from "@/components/Table";
import { ErrorContext } from "@/contexts/error";
import BlogCategory from "@/types/blogCategory";
import BlogStatus from "@/types/blogStatus";
import API from "@/services/API";
import { useContext, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Blog } from "@/types/blog";
import Permission from "@/types/permissions";

interface ApprovedStoriesState {
  blogs: Blog[];
  searchTerm: string;
  loading: boolean;
}

const initialState: ApprovedStoriesState = {
  blogs: [],
  searchTerm: "",
  loading: true,
};

const enum ActionType {
  SetBlogs,
  SetSearchTerm,
  SetLoading,
}

const reducer = (state: ApprovedStoriesState, action: {type: ActionType, payload }) => {
  const updatedData = { ...state };
  switch (action.type) {
  case ActionType.SetBlogs:
    updatedData.blogs = action.payload;
    break;
  case ActionType.SetSearchTerm:
    updatedData.searchTerm = action.payload;
    break;
  case ActionType.SetLoading:
    updatedData.loading = action.payload;
    break;
  default:
    return updatedData;
  }
  return updatedData;
};

const getFilteredBlogs = (blogs, searchTerm) => {
  return blogs.filter((blog) =>
    blog?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

const tableHeaders = ["To Publish On", "Author", "Title", "Category", "Status"];

const blogEndpoint = "/blog";

export default function ApprovedStories() {
  const navigate = useNavigate();
  const { setError } = useContext(ErrorContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    blogs,
    searchTerm,
    loading,
  } = state;

  const handleRead = (blogId) => {
    API.get(`/blog/get-blog/${blogId}`)
      .then((blogResponse) => {
        const blogDetails = blogResponse.data.data;
        navigate(`/story/${blogId}`, { state: { key: blogDetails } });
      })
      .catch((e) => setError(e));
  };

  const handleArchive = (blogId) => {
    //archive is same as takedown dw
    const choice = window.confirm(
      "Are you sure you want to archive this story?"
    );
    if (choice) {
      const archiveEndPoint = `/blog/take-down-blog/${blogId}`;

      API.put(archiveEndPoint)
        .then(() => {
          toast.success("Successfully archived");
          fetchBlogs();
        })
        .catch((e) => setError(e));
      console.debug("story archived");
    }
  };

  const fetchBlogs = () => {
    API.get(blogEndpoint)
      .then((blogResponse) => {
        dispatch({ type: ActionType.SetBlogs, payload: blogResponse.data.data.filter((blog) => blog.status == BlogStatus.Approved) });
        dispatch({ type: ActionType.SetLoading, payload: false });
      })
      .catch((error) => {
        setError(error);
        dispatch({ type: ActionType.SetLoading, payload: false });
      });
  };

  useEffect(() => {
    fetchBlogs();
  }, []);


  if (loading) return <div className="flex justify-center items-center"><Spinner /></div>;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-semibold text-center">Approved Stories</h1>
      <div className="px-3 mt-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearch={(value) => dispatch({ type: ActionType.SetSearchTerm, payload: value })}
        />
      </div>
      <main className="flex-grow p-6">
        <Table
          headers={tableHeaders}
          content={getFilteredBlogs(blogs, searchTerm).map(blog => [
            new Date(blog.published_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }),
            blog.user.name,
            blog.title,
            BlogCategory[blog.category_id],
            <span
              // tailwind is compiled to real css, so we can't use dynamic tailwind wale class names
              // alternative fix is to re-export these class names in index.css
              // i'm lazy, so i just did this impl instead
              className={`px-2 py-1 inline-block rounded-md ${BlogStatus[blog.status]}`}
              key={blog.category_id}
            >
              <TagIcon className="w-4 h-4 inline max-lg:hidden mr-1 size-min " />
              {BlogStatus[blog.status]}
            </span>,
            <MoreMenu
              options={[
                { label: "Read", handler: handleRead, show: true, permissions: [Permission.ReadBlog] },
                { label: "Archive", handler: handleArchive, show: true, permissions: [Permission.DeleteBlog] },
              ]}
              blogId={blog._id}
              key={blog._id}
            />
          ])}
        />
      </main>
    </div>
  );
}