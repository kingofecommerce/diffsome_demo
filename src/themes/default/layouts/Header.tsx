import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/core/providers/AuthProvider";
import { useCart } from "@/core/hooks/useCart";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, PenSquare, Home, MessageSquare, ShoppingBag, BookOpen, ShoppingCart, Package, CalendarDays } from "lucide-react";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: cart } = useCart();
  const navigate = useNavigate();

  const cartItemCount = cart?.item_count || 0;

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
              <Link to="/blog">
                <BookOpen className="w-4 h-4 mr-1.5" />
                블로그
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/products">
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                상품
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/reservations">
                <CalendarDays className="w-4 h-4 mr-1.5" />
                예약
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
          {/* Cart Button */}
          <Button variant="ghost" size="sm" asChild className="relative">
            <Link to="/cart">
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>
          </Button>
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/orders">
                  <Package className="w-4 h-4 mr-1.5" />
                  주문내역
                </Link>
              </Button>
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
