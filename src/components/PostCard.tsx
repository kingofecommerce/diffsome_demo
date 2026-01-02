import { Eye, User, Clock, Pin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BoardPost } from "@back23/promptly-sdk";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface PostCardProps {
  post: BoardPost;
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
  const navigate = useNavigate();
  
  const formattedDate = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ko,
  });

  const handleClick = () => {
    navigate(`/posts/${post.id}`);
  };

  const authorName = post.member?.name || '익명';

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 border-border/50 bg-card animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={handleClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {post.is_notice && (
                <Badge variant="notice" className="flex items-center gap-1">
                  <Pin className="w-3 h-3" />
                  공지
                </Badge>
              )}
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {post.title}
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {post.excerpt}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {authorName}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {post.view_count}
              </span>
            </div>
          </div>
          
          <div className="text-3xl font-bold text-muted-foreground/20 group-hover:text-primary/20 transition-colors">
            {String(post.id).padStart(2, '0')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
