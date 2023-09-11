export const posts = {
  do: async (req, res) => {
    const { page } = req.params;
    const pageSize = 10;
    const posts = await fetch(
      `https://jsonplaceholder.typicode.com/posts?_start=${
        page * pageSize
      }&_limit=${pageSize}`
    );
    const parsedPosts = await posts.json();
    console.log("posts", parsedPosts);
    res.json({
      ok: true,
      posts: parsedPosts,
    });
  },
};
