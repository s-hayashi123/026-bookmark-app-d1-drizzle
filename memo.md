## 認証500エラーの原因と恒久対策メモ（Better Auth × Next.js × Drizzle × Cloudflare D1）

### 概要

- 発生事象: GitHubログイン時にバックエンドが 500。ログに「No database configuration provided. Using memory adapter in development」や `getCloudflareContext` 初期化エラー、D1の`prepare`関連TypeErrorなどが出る。
- 根本原因: Cloudflare D1バインディングの注入タイミングと `auth`/DB の初期化順序、エンドポイント表記ゆれ、Drizzle Kitの環境変数読込の誤解、既存テーブルとの衝突。

---

## 症状と原因

### 1) getCloudflareContext 初期化エラー（dev）

- 症状:
  - `ERROR: getCloudflareContext has been called without having called initOpenNextCloudflareForDev`
- 主因:
  - `getCloudflareContext()` を「リクエスト外（モジュール初期化時）」に呼び出し
  - `next.config.ts` で `initOpenNextCloudflareForDev()` が十分早く呼ばれていない
- 影響:
  - D1バインディングを取得できず、Better Auth が DB 未設定と判断 → メモリアダプタで起動 → OAuth フローで 500

### 2) D1 DB 未注入/未設定

- 症状:
  - `TypeError: Cannot read properties of undefined (reading 'prepare')`
  - `WARN [Better Auth]: No database configuration provided. Using memory adapter in development`
- 主因:
  - `process.env.DB` を参照（Node環境では存在しない）
  - D1 バインディング（`wrangler.jsonc` の `d1_databases[].binding`）を参照していない/一致していない
- 影響:
  - Drizzle が正しく接続できず、Better Auth がメモリアダプタにフォールバック

### 3) Drizzle Kit CLI 実行時の環境変数未設定

- 症状:
  - `Please provide required params for D1 HTTP driver: accountId/databaseId/token`
- 主因:
  - `.dev.vars` は `wrangler dev` 用で、`drizzle-kit` CLI は読み込まない
- 影響:
  - `push`/`migrate` が失敗
- 参考:
  - Cloudflare D1 HTTP API 用のDrizzleKit設定と環境変数ガイド
    - [Cloudflare D1 HTTP API with Drizzle Kit](https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit)
    - [Get Started with Drizzle and D1](https://orm.drizzle.team/docs/get-started/d1-new)

### 4) 既存テーブル衝突（SQLITE_ERROR）

- 症状:
  - `table 'bookmarks' already exists`
- 主因:
  - 既に存在するテーブルへ再度 CREATE を流している（IF NOT EXISTS ではない）
- 影響:
  - `push`/`migrate` が途中で停止

### 5) APIエンドポイントの表記ゆれ・呼び出し方法

- 症状:
  - 404や想定外の挙動
- 主因:
  - `/api/auth/signin`/`signout` を使用（正: `sign-in` / `sign-out`）
  - `<Link>` で APIルートへ遷移していた（推奨: `authClient.signIn.social({ provider: "github" })`）
- 参考:
  - Better Auth Next.js統合: [`/api/auth/[...all]`](https://www.better-auth.com/docs/integrations/next)
  - Drizzleアダプター: [Better Auth Drizzle adapter](https://www.better-auth.com/docs/adapters/drizzle)

---

## 修正ポイント（最終形）

### A) Next.js の dev 初期化

- `next.config.ts` の先頭で必ず初期化してから `export default` する

```ts
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
```

- 修正後は開発サーバーを再起動

### B) D1 への接続（Cloudflare 環境から取得）

- バインディング名は `wrangler.jsonc` の `d1_databases[].binding` と一致させる（本プロジェクトは `_026_db`）
- `src/lib/db/index.ts`

```ts
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const getDB = (env: { DB: D1Database }) => drizzle(env.DB, { schema });

export const getDBFromCloudflare = () => {
  const { env } = getCloudflareContext();
  const DB = (env as any)._026_db as D1Database; // wrangler.jsonc の binding
  return drizzle(DB, { schema });
};
```

### C) Better Auth の遅延初期化（リクエスト時）

- `src/lib/auth.ts`（例）

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const AUTH_URL =
  process.env.NODE_ENV === "production"
    ? "https://<YOUR_APP_URL>.pages.dev"
    : "http://localhost:3000";

function getDbFromCloudflare() {
  const { env } = getCloudflareContext();
  const DB = (env as any)._026_db as D1Database;
  return drizzle(DB, { schema });
}

let _auth: ReturnType<typeof betterAuth> | null = null;

export function getAuth() {
  if (_auth) return _auth;
  const db = getDbFromCloudflare(); // リクエストタイミングで取得
  _auth = betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite", usePlural: true }),
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },
    secret: process.env.AUTH_SECRET,
    baseURL: AUTH_URL,
  });
  return _auth;
}
```

### D) ルートハンドラでの呼び出し（必ずリクエスト時）

- `src/app/api/auth/[...all]/route.ts`

```ts
import { getAuth } from "@/lib/auth";

export async function GET(req: Request) {
  return getAuth().handler(req);
}
export async function POST(req: Request) {
  return getAuth().handler(req);
}
```

### E) サーバー側 呼び出し箇所の統一

- `middleware.ts` / サーバーコンポーネント / サーバーアクションはすべて `getAuth()` を使う
- `src/components/auth-components.tsx`（RSC）

```ts
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { SignInWithGithubButton, SignOutButton } from "@/components/auth-client-buttons";

export async function AuthButtons() {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  return session ? (
    <div className="flex items-center gap-4">
      <p>{session.user.email}</p>
      <SignOutButton />
    </div>
  ) : (
    <SignInWithGithubButton />
  );
}
```

### F) フロントのサインイン/アウトはクライアント関数で

- `<Link>` でAPIへ遷移しない。`authClient.signIn.social`/`authClient.signOut` を使用

---

## Drizzle Kit（マイグレーション/Push）運用

### 1) 環境変数の供給

- `.dev.vars` は `wrangler dev` 用。`drizzle-kit` CLI は読まない
- `.env`（または export）で以下を供給してからCLI実行:
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_DATABASE_ID`
  - `CLOUDFLARE_D1_TOKEN`
- 参考:
  - [Cloudflare D1 HTTP API with Drizzle Kit](https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit)
  - [Get Started with Drizzle and D1](https://orm.drizzle.team/docs/get-started/d1-new)

### 2) 既存テーブル衝突の回避

- `push` で衝突したら、衝突テーブルだけ `DROP TABLE IF EXISTS ...` → 再実行
- または `generate` → `wrangler d1 migrations apply` のフローに統一（本番は `--remote`）

---

## 開発・デプロイの起動方法の違い

- 開発（Next dev）: `npm run dev`（`initOpenNextCloudflareForDev`で `getCloudflareContext` 可）
- プレビュー/本番相当（OpenNext）: `npm run preview`（OpenNextビルド→wranglerでプレビュー）
- `wrangler dev` を直接叩く場合は、事前に OpenNext ビルドが必要（未ビルドだとデフォルトページ表示）

---

## GitHub OAuth設定の再確認

- ローカル: `http://localhost:3000/api/auth/callback/github`
- 本番: `https://<YOUR_APP_URL>.pages.dev/api/auth/callback/github`
- Better Auth の `baseURL` は環境に応じて正しく設定

---

## 再発防止チェックリスト

- [ ] `next.config.ts` の最上部で `initOpenNextCloudflareForDev()` 実行 → dev再起動
- [ ] D1バインディング名（`wrangler.jsonc`）とコードの参照が一致（`_026_db`）
- [ ] DB・Auth は「リクエスト時に初期化」（`getAuth()`、`getDBFromCloudflare()`）
- [ ] フロントのサインイン/アウトは `authClient` 経由（`signIn.social`/`signOut`）
- [ ] Drizzle CLI 実行時は `.env` で Cloudflareの `accountId/databaseId/token` を供給
- [ ] 既存テーブル衝突時は `DROP`、または `generate → migrations apply` を使用
- [ ] GitHub OAuth の Callback URL は `baseURL` と一致

---

## 参考リンク

- Cloudflare D1 × Drizzle Kit
  - [Cloudflare D1 HTTP API with Drizzle Kit](https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit)
  - [Get Started with Drizzle and D1](https://orm.drizzle.team/docs/get-started/d1-new)
- Better Auth
  - [Drizzle adapter](https://www.better-auth.com/docs/adapters/drizzle)
  - [Next.js integration](https://www.better-auth.com/docs/integrations/next)
