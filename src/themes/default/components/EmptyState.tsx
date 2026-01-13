import { FileX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-12 text-center">
        <FileX className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">게시글이 없습니다</h3>
        <p className="text-muted-foreground text-sm">
          아직 등록된 게시글이 없습니다.
        </p>
      </CardContent>
    </Card>
  );
}
