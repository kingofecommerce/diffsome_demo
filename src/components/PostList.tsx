import { PostCard } from "./PostCard";
import type { BoardPost } from "@back23/promptly-sdk";

interface PostListProps {
  posts: BoardPost[];
}

export function PostList({ posts }: PostListProps) {
  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}
