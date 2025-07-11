export function filterPosts(posts, searchQuery) {
  if (!searchQuery.trim()) return posts;

  const query = searchQuery.toLowerCase();

  return posts.filter((post) => {
    // Search in content
    const contentMatch = post.content.toLowerCase().includes(query);

    // Search in author name
    const authorMatch = post.author.name.toLowerCase().includes(query);

    // Search in hashtags (extract hashtags from content)
    const hashtags = post.content.match(/#\w+/g) || [];
    const hashtagMatch = hashtags.some((tag) => tag.toLowerCase().includes(query));

    return contentMatch || authorMatch || hashtagMatch;
  });
}

export function sortPosts(posts, sortBy) {
  const sortedPosts = [...posts];

  switch (sortBy) {
    case "recent":
      return sortedPosts.sort((a, b) => {
        const getTimeValue = (timeAgo) => {
          if (timeAgo === "now") return 0;
          const value = parseInt(timeAgo);
          if (timeAgo.includes("m")) return value;
          if (timeAgo.includes("h")) return value * 60;
          if (timeAgo.includes("d")) return value * 60 * 24;
          return 0;
        };
        return getTimeValue(a.timeAgo) - getTimeValue(b.timeAgo);
      });

    case "top":
      return sortedPosts.sort((a, b) => b.engagement.likes - a.engagement.likes);

    case "relevant":
      return sortedPosts.sort((a, b) => {
        const getRelevanceScore = (post) => {
          const likesScore = post.engagement.likes * 2;
          const contentScore = post.content.length > 100 ? 10 : 5;
          const hashtagScore = (post.content.match(/#\w+/g) || []).length * 3;
          const imageScore = post.image ? 5 : 0;
          return likesScore + contentScore + hashtagScore + imageScore;
        };
        return getRelevanceScore(b) - getRelevanceScore(a);
      });

    default:
      return sortedPosts;
  }
}

export function getPostStats(posts) {
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, post) => sum + post.engagement.likes, 0);
  const avgLikes = totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0;

  return {
    totalPosts,
    totalLikes,
    avgLikes,
  };
}
