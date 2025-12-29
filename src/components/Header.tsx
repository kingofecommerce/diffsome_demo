import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, PenSquare, Home, MessageSquare, ShoppingBag } from "lucide-react";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-lg text-foreground">Promptly</span>
          </Link>
          
          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-1.5" />
                홈
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/write">
                <PenSquare className="w-4 h-4 mr-1.5" />
                글쓰기
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/products">
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                상품
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/contact">
                <MessageSquare className="w-4 h-4 mr-1.5" />
                문의하기
              </Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{user?.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1.5" />
                로그아웃
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={() => navigate("/login")}>
              <LogIn className="w-4 h-4 mr-1.5" />
              로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
