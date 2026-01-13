import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/core/providers/AuthProvider";
import Index from "./pages/Index";
import PostDetail from "./pages/PostDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WritePost from "./pages/WritePost";
import EditPost from "./pages/EditPost";
import AuthCallback from "./pages/AuthCallback";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import MyOrders from "./pages/MyOrders";
import OrderDetail from "./pages/OrderDetail";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Reservations from "./pages/Reservations";
import ReservationBooking from "./pages/ReservationBooking";
import MyReservations from "./pages/MyReservations";
import ReservationDetail from "./pages/ReservationDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/write" element={<WritePost />} />
            <Route path="/posts/:id/edit" element={<EditPost />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/fail" element={<PaymentFail />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/:orderNumber" element={<OrderDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/reservations/book/:slug" element={<ReservationBooking />} />
            <Route path="/reservations/my" element={<MyReservations />} />
            <Route path="/reservations/my/:reservationNumber" element={<ReservationDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
