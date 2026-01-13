import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/core/providers/AuthProvider";
import { useToast } from "@/core/hooks/use-toast";
import { Loader2 } from "lucide-react";

const API_BASE_URL = "https://diffsome.webbyon.com/api/demo";
const API_KEY = "pky_zX1JITGIZefP9Fm2oBF9qk7oekwNmlqJ7uRfBXznbRi3P9kAfq2CM6hiBX8B";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { handleSocialCallback } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get("token");
      const provider = searchParams.get("provider");
      const error = searchParams.get("error");

      if (error) {
        toast({
          title: "로그인 취소",
          description: "소셜 로그인이 취소되었습니다.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      if (!token) {
        toast({
          title: "오류",
          description: "인증 토큰을 찾을 수 없습니다.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Fetch user info with the token
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "X-API-Key": API_KEY,
            "Accept": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("사용자 정보를 가져올 수 없습니다.");
        }

        const userData = await response.json();
        
        handleSocialCallback(token, userData.data);

        toast({
          title: "로그인 성공",
          description: "환영합니다!",
        });
        navigate("/");
      } catch (err) {
        toast({
          title: "로그인 실패",
          description: "소셜 로그인에 실패했습니다. 다시 시도해주세요.",
          variant: "destructive",
        });
        navigate("/login");
      }

      setIsProcessing(false);
    };

    processCallback();
  }, [searchParams, handleSocialCallback, navigate, toast]);

  if (!isProcessing) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
