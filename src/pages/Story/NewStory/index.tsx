import { NixImage } from "@/components/NixImage";
import TextEditor from "@/components/TextEditor";
import { CurrUserCtx } from "@/contexts/current_user";
import { ErrorContext } from "@/contexts/error";
import API, { refreshAuthToken } from "@/services/API";
import BlogCategory from "@/types/blogCategory";
import BlogStatus from "@/types/blogStatus";
import { useContext, useEffect, useReducer, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// const TextEditor = React.lazy(() => import("@/components/TextEditor"))

interface NewStoryState {
  title: string;
  byliner: string;
  content: string;
  slug: string;
  selectedCategory: BlogCategory;
  createdAt: string;
  blogImage: string | null;
  metaDescription: string;
  metaTitle: string;
}

const initialState: NewStoryState = {
  title: "",
  byliner: "",
  content: "",
  slug: "",
  selectedCategory: BlogCategory.Editorial, //to do
  createdAt: "",
  blogImage: null,
  metaDescription: "",
  metaTitle: "",
};

const enum ActionType {
  SetTitle,
  SetByliner,
  SetContent,
  SetSlug,
  SetSelectedCategory,
  SetBlogImage,
  SetMetaDescription,
  SetMetaTitle,
  SetBlogImageLink,
}

export default function NewStory() {
  const navigate = useNavigate();
  const { setError } = useContext(ErrorContext);
  const { user } = useContext(CurrUserCtx);
  const location = useLocation();
  const toastId = useRef(null);

  const reducer = (
    state: NewStoryState,
    action: { type: ActionType; payload },
  ) => {
    const updatedData = { ...state };
    switch (action.type) {
      case ActionType.SetTitle:
        updatedData.title = action.payload;
        updatedData.slug = (
          (action.payload as string).replace(/[^a-zA-Z0-9\s]/g, "") +
          " " +
          Math.floor(Math.random() * 1001)
        )
          .split(/\s+/)
          .slice(0, 7)
          .join("-")
          .toLowerCase();
        break;
      case ActionType.SetByliner:
        updatedData.byliner = action.payload;
        break;
      case ActionType.SetContent:
        updatedData.content = action.payload;
        break;
      case ActionType.SetSlug:
        updatedData.slug = action.payload;
        break;
      case ActionType.SetSelectedCategory:
        updatedData.selectedCategory = action.payload;
        break;
      case ActionType.SetBlogImage:
        {
          const image = action.payload as File;
          if (image) {
            toastId.current = toast.info("Uploading 0%", { autoClose: false });
            const form = new FormData();
            form.append("image", image);
            const endpoint = state.blogImage
              ? `/images/update/${state.blogImage}`
              : "/images/upload";
            const requestMethod = state.blogImage ? "PUT" : "POST";

            API({
              method: requestMethod,
              url: endpoint,
              data: form,
              onUploadProgress: (progressEvent) => {
                const progress = progressEvent.loaded / progressEvent.total;
                const percentCompleted = Math.round(progress * 100);
                console.debug(progress);
                toast.update(toastId.current, {
                  render: `Uploading ${percentCompleted}%`,
                  type: "info",
                  progress: progress,
                });
              },
            })
              .then((res) => {
                toast.update(toastId.current, {
                  render: "Uploading complete!",
                  type: "info",
                  progress: 1,
                });
                toast.done(toastId.current);
                toast.success("Image uploaded successfully");
                const image_name = res.data.data.name;
                dispatch({
                  type: ActionType.SetBlogImageLink,
                  payload: image_name,
                });
              })
              .catch((e) => {
                toast.done(toastId.current);
                setError(e);
              })
              .finally(() => (toastId.current = null));
          }
        }
        break;
      case ActionType.SetMetaDescription:
        updatedData.metaDescription = action.payload;
        break;
      case ActionType.SetMetaTitle:
        updatedData.metaTitle = action.payload;
        break;
      case ActionType.SetBlogImageLink:
        updatedData.blogImage = action.payload;
        break;
      default:
        return updatedData;
    }
    return updatedData;
  };

  const draftBlog = location.state?.key; //if we are redirected from edit in allstory
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    title,
    byliner,
    content,
    slug,
    selectedCategory,
    blogImage,
    metaDescription,
    metaTitle,
  } = state;

  useEffect(() => {
    // never ever expire while writing blog, its frustrating
    refreshAuthToken().catch((e) => setError(e));

    if (draftBlog) {
      dispatch({ type: ActionType.SetTitle, payload: draftBlog.title });
      dispatch({ type: ActionType.SetByliner, payload: draftBlog.byliner });
      dispatch({ type: ActionType.SetContent, payload: draftBlog.body });
      dispatch({ type: ActionType.SetSlug, payload: draftBlog.slug });
      dispatch({
        type: ActionType.SetSelectedCategory,
        payload: draftBlog.category_id,
      });
      dispatch({ type: ActionType.SetBlogImageLink, payload: draftBlog.cover });
      dispatch({
        type: ActionType.SetMetaDescription,
        payload: draftBlog.meta_description,
      });
      dispatch({
        type: ActionType.SetMetaTitle,
        payload: draftBlog.meta_title,
      });
    }
  }, []);

  const handleInput = (e) => {
    dispatch({ type: ActionType.SetTitle, payload: e.target.value });
    e.target.style.height = "inherit";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSubmit = (e, saveAsDraft: boolean) => {
    console.debug(saveAsDraft);
    e.preventDefault();
    if (!title || !byliner || !metaDescription || !metaTitle || !slug) {
      toast.error("Please fill out all the required fields.");
      return;
    }

    const request = {
      title: title,
      byliner: byliner,
      slug: slug,
      body: content,
      category_id: selectedCategory,
      meta_title: metaTitle,
      meta_description: metaDescription,
      user_id: user.id,
      status: saveAsDraft ? BlogStatus.Draft : BlogStatus.Pending,
      cover: blogImage,
    };

    console.debug(request);
    const endPoint = draftBlog
      ? `/blog/update-blog/${draftBlog._id}`
      : "/blog/create-blog";
    const requestMethod = draftBlog ? "PUT" : "POST";

    API({
      method: requestMethod,
      url: endPoint,
      data: request,
    })
      .then(() => {
        const successMessage = saveAsDraft
          ? "Successfully saved"
          : "Successfully submitted";
        toast.success(successMessage);
        navigate("/story/your-stories", { replace: true });
      })
      .catch((e) => setError(e));
  };

  return (
    <form className="max-w-4xl mx-auto my-10 p-8 bg-white shadow rounded">
      {/* {user ? <h1>{user.name}</h1> : <h1>HY</h1>} */}
      <h1>
        {/* <input
          className="text-4xl w-full mb-4 focus:outline-none leading-tight"
          id="title"
          placeholder="Give this story some title"
          autoFocus={true}
          value={title}
          onChange={(e) =>
            dispatch({ type: ActionType.SetTitle, payload: e.target.value })
          }
        /> */}
        <textarea
          className="text-4xl w-full mb-4 overflow-y-hidden focus:outline-none leading-tight"
          id="title"
          placeholder="Give this story some title"
          autoFocus={true}
          value={title}
          onChange={handleInput}
          maxLength={75}
        />
        <div className="w-full font-medium text-sm flex flex-row-reverse">
          {title.length}/75
        </div>
      </h1>
      <div className="mb-6">
        <label className="block mb-2" htmlFor="byliner">
          Byliner
        </label>
        <input
          className="w-full p-2 border border-gray-300 rounded"
          id="byliner"
          placeholder="Byliner sells the story, give this a byliner."
          value={byliner}
          onChange={(e) =>
            dispatch({ type: ActionType.SetByliner, payload: e.target.value })
          }
        />
      </div>

      <div className="mb-6">
        {/*  todo: fix type error */}
        <div className="block mb-2" /** htmlFor="ck_editor"*/>
          Content
          <div className="py-2 w-full border-gray-300 rounded " id="ck_editor">
            <TextEditor
              value={content}
              onChange={(value) =>
                dispatch({ type: ActionType.SetContent, payload: value })
              }
            />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">SEO Details</h2>
      <div className="mb-6">
        <label className="block mb-2" htmlFor="category">
          Category
        </label>
        <select
          className="w-full p-2 border border-gray-300 rounded"
          id="category"
          value={selectedCategory}
          onChange={(e) =>
            dispatch({
              type: ActionType.SetSelectedCategory,
              payload: Number(e.target.value),
            })
          }
        >
          {Object.keys(BlogCategory)
            .map((v) => Number(v))
            .filter((v) => !isNaN(v))
            .map((category_id) => (
              <option
                className="bg-white border-none"
                key={category_id}
                value={category_id}
              >
                {BlogCategory[category_id]}
              </option>
            ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block mb-2" htmlFor="blog-image">
          Blog image
        </label>
        <input
          className="w-full p-2 border border-gray-300 rounded"
          id="blog-image"
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={(e) =>
            dispatch({
              type: ActionType.SetBlogImage,
              payload: e.target.files[0],
            })
          }
        />
      </div>
      {blogImage}
      {blogImage ? (
        <NixImage
          className="max-w-md max-h-md"
          image_id={blogImage}
          thumbnail={true} // 256
          image_type={1}
          force_refresh={true}
          alt={blogImage}
        />
      ) : (
        <>No image uploaded yet</>
      )}

      <div className="mb-6">
        <label className="block mb-2" htmlFor="meta-description">
          Meta Description
        </label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded h-20"
          id="meta-description"
          placeholder="Enter meta description here"
          value={metaDescription}
          onChange={(e) =>
            dispatch({
              type: ActionType.SetMetaDescription,
              payload: e.target.value,
            })
          }
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2" htmlFor="meta-title">
          Meta Title
        </label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded h-20"
          id="meta-title"
          placeholder="Enter meta title here"
          value={metaTitle}
          onChange={(e) =>
            dispatch({ type: ActionType.SetMetaTitle, payload: e.target.value })
          }
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2" htmlFor="slug">
          Slug
        </label>
        <input
          className="w-full p-2 border border-gray-300 rounded"
          id="slug"
          placeholder="Enter slug here"
          value={slug}
          onChange={(e) =>
            dispatch({ type: ActionType.SetSlug, payload: e.target.value })
          }
        />
      </div>

      <div className="flex space-x-4">
        <button
          className="bg-gray-200 text-black p-2 rounded hover:bg-indigo-500 hover:text-white"
          onClick={(e) => handleSubmit(e, true)}
        >
          Save as Draft
        </button>
        <button
          className="bg-green-500 text-white p-2 rounded hover:bg-indigo-500"
          onClick={(e) => handleSubmit(e, false)}
        >
          Submit for approval
        </button>
      </div>
    </form>
  );
}
