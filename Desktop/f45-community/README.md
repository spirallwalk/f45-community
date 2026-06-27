# F45 커뮤니티

F45 Training 회원들을 위한 운동 기록 & 랭킹 커뮤니티 사이트입니다.

## 기능

- **닉네임 + 지점명**으로 간편 가입
- **오늘 수업 완료** 버튼으로 하루 한 번 기록
- **누적 횟수 자동 계산** (Supabase 트리거)
- **티셔츠 뱃지 자동 달성**
  - 🟡 45회 - 옐로우 티셔츠
  - 🔴 100회 - 레드 티셔츠
  - ⚫ 200회 - 블랙 티셔츠
  - 💎 300회 - 다이아몬드
- **지점별 랭킹 + 전체 랭킹**

## 시작하기

### 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 내용 전체 실행
3. Project Settings > API 탭에서 URL과 anon key 복사

### 2. 환경 변수 설정

`.env.local` 파일에 값 입력:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. 로컬 실행

```bash
npm install
npm run dev
```

### 4. Vercel 배포

```bash
# Vercel CLI 사용
npx vercel

# 또는 GitHub 연결 후 자동 배포
# Vercel 대시보드에서 환경 변수 설정 필수
```

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
