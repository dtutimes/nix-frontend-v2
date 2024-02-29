/** should be same as backend BlogStatus enum
 * https://github.com/dtutimes/Backend_v2/blob/main/src/api/models/blogModel.ts#L4-L10
 */
enum BlogStatus {
    Pending = 0,
    Published = 1,
    Approved = 2,
    Draft = 3,
}

export default BlogStatus;