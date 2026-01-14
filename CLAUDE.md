# Diffsome Frontend Starter - React (Vite)

- **GitHub**: https://github.com/kingofecommerce/diffsome_demo

## 기술 스택
- React 18 + Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- @diffsome/sdk (백엔드 API 연동)

## 프로젝트 구조 (Core/Theme 분리)

```
src/
├── core/                         # SDK 통합 레이어 (수정 주의)
│   ├── index.ts                  # export all
│   ├── lib/diffsome.ts           # SDK 인스턴스
│   ├── hooks/                    # React Hooks (데이터 로직)
│   │   ├── usePosts.ts
│   │   ├── useBlog.ts
│   │   ├── useProducts.ts
│   │   ├── useCart.ts
│   │   ├── useOrder.ts
│   │   ├── useComments.ts
│   │   ├── useBlogComments.ts
│   │   ├── useReservation.ts
│   │   └── ...
│   └── providers/
│       └── AuthProvider.tsx      # 인증 Context
│
├── themes/default/               # 테마 (자유롭게 수정)
│   ├── index.ts                  # export all
│   ├── components/               # UI 컴포넌트
│   │   ├── PostCard.tsx
│   │   ├── PostList.tsx
│   │   ├── CommentList.tsx
│   │   ├── BlogCommentList.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductReviews.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── LoadingState.tsx
│   │   ├── ErrorState.tsx
│   │   └── EmptyState.tsx
│   └── layouts/
│       ├── Header.tsx
│       └── Footer.tsx
│
├── components/ui/                # shadcn/ui (수정 금지)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
│
├── pages/                        # 페이지 (core + theme 조합)
│   ├── Index.tsx
│   ├── Blog.tsx
│   ├── BlogDetail.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   └── ...
│
├── lib/utils.ts                  # 유틸리티
├── types/                        # 타입 정의
└── App.tsx                       # 라우팅
```

## 아키텍처 패턴

### Core vs Theme 분리
- **`core/`**: SDK 연동 로직 (수정 주의) - hooks, providers, client
- **`themes/default/`**: 컴포넌트 구조와 props 참고용
- **`themes/새테마명/`**: 디자인을 새롭게 작성하여 테마 생성
- **`components/ui/`**: shadcn/ui 컴포넌트 (수정 금지)

### 사용법

```tsx
// Core에서 hooks 가져오기
import { usePosts, useAuth, useCart } from '@/core';

// Theme에서 컴포넌트 가져오기
import { PostCard, Header, Footer } from '@/themes/default';

// 페이지에서 조합
function BlogPage() {
  const { data, isLoading } = usePosts();

  if (isLoading) return <LoadingState />;

  return (
    <>
      <Header />
      {data?.map(post => <PostCard key={post.id} post={post} />)}
      <Footer />
    </>
  );
}
```

### SDK 클라이언트 직접 사용

```tsx
import { diffsome } from '@/core';

// 상품
const products = await diffsome.shop.listProducts();

// 블로그
const posts = await diffsome.blog.list();

// Custom Entity
const records = await diffsome.entities.listRecords('customers');
```

## 새 테마 만들기

1. `themes/` 폴더에 새 테마 폴더 생성
2. components, layouts 구현
3. index.ts에서 export
4. pages에서 import 경로 변경

```
themes/
├── default/     # 기본 테마
└── modern/      # 새 테마
    ├── components/
    ├── layouts/
    └── index.ts
```

## 환경 설정

SDK 설정은 `core/lib/diffsome.ts`에서:
```typescript
export const diffsome = new Diffsome({
  tenantId: 'your-tenant',
  apiKey: 'your-api-key',
});
```

## 개발 명령어

```bash
npm run dev      # 개발 서버 (포트 5173)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 미리보기
```
