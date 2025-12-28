import { FileText } from "lucide-react";

interface BoardHeaderProps {
  total: number;
}

export function BoardHeader({ total }: BoardHeaderProps) {
  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">게시판</h1>
      </div>
      <p className="text-muted-foreground ml-14">
        총 <span className="font-semibold text-primary">{total}</span>개의 게시글이 있습니다
      </p>
    </div>
  );
}
