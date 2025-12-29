import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        toast({
          title: "로그인 취소",
          description: "Google 로그인이 취소되었습니다.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      if (!code) {
        toast({
          title: "오류",
          description: "인증 코드를 찾을 수 없습니다.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const result = await handleGoogleCallback(code);

      if (result.success) {
        toast({
          title: "로그인 성공",
          description: "환영합니다!",
        });
        navigate("/");
      } else {
        toast({
          title: "로그인 실패",
          description: result.message || "소셜 로그인에 실패했습니다. 다시 시도해주세요.",
          variant: "destructive",
        });
        navigate("/login");
      }

      setIsProcessing(false);
    };

    processCallback();
  }, [searchParams, handleGoogleCallback, navigate, toast]);

  if (!isProcessing) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Google 로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
