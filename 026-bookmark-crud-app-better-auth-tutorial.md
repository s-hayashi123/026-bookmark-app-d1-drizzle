# 【決定版】Next.js 15 & Drizzle で作る！BetterAuth と Cloudflare で実現するブックマーク CRUD アプリ開発チュートリアル (026) 🚀

## 🎯 このチュートリアルで学べること

こんにちは！このチュートリアルでは、Web 開発の最前線で活躍する技術だけを使って、**認証付きのブックマーク管理アプリ**をゼロから作り上げる旅に出ます。完成する頃には、あなたもモダンなフルスタック開発者の一員です！

**具体的に作るのはこちら！**

- 🔐 **GitHub 認証:** 面倒なパスワード管理は不要！GitHub アカウントで簡単にログインできます。
- 🔖 **ブックマーク CRUD:** 自分だけのブックマークを、登録(Create)、一覧表示(Read)、削除(Delete)できます。
- ⚡️ **超高速な配信:** 作成したアプリは Cloudflare Pages にデプロイ！世界中のどこからでも瞬時にアクセスできる、爆速のアプリケーションが完成します。

**技術スタック（冒険の道具）**

| 道具名               | 役割                            | なぜこれを選ぶの？ 🤔                                                                                              |
| :------------------- | :------------------------------ | :----------------------------------------------------------------------------------------------------------------- |
| **Next.js 15**       | アプリの骨格 (フレームワーク)   | React 19 の最新機能を搭載！サーバーコンポーネントでパフォーマンスと開発体験を両立する、現代の Web 開発の王道です。 |
| **BetterAuth**       | 認証システムの番人              | シンプルかつ高機能な認証ライブラリ。少ないコードで堅牢なログイン機能を実現します。                                 |
| **Drizzle ORM**      | データベースとの通訳            | SQL ライクな書き心地で、TypeScript との相性も抜群！データベース操作を安全かつ直感的にします。                      |
| **Cloudflare D1**    | データの保管庫 (データベース)   | Cloudflare が提供するサーバーレス DB。世界中に分散配置され、ユーザーの近くでデータを処理するため、超低遅延です。   |
| **Cloudflare Pages** | アプリの公開場所 (ホスティング) | 静的サイトから動的なフルスタックアプリまで、簡単に公開できるプラットフォーム。Git と連携した自動デプロイが超便利！ |

このチュートリアルは、「世界一親切で、絶対に挫折させない」をモットーに進めていきます。各ステップで「何を」「どうやって」作るかだけでなく、**「なぜそうするのか」**という理由まで徹底的に解説するので、安心してついてきてくださいね！

---

## 1. 🚀 プロジェクトの離陸準備 (セットアップ)

まずは開発環境を整えます。Cloudflare に特化したプロジェクト作成コマンド `create-cloudflare` を使い、Next.js の雛形を効率的に構築するところから始めましょう！

### 1.1. `create-cloudflare` で未来のアプリを召喚！

**🎯 ゴール:** Cloudflare と相性抜群の Next.js プロジェクトを作成する。

**👉 The How:** ターミナルを開き、以下のコマンドを実行します。

```bash
npm create cloudflare@latest
```

すると、対話形式でいくつか質問されます。未来のアプリの仕様を決めていきましょう！

1.  **プロジェクト名**: `bookmark-app` と入力します。
2.  **アプリケーションの種類**: `"Website or web app"` を選択します。
3.  **使用するフレームワーク**: `"Next"` を選択します。
4.  **デプロイ計画**: `Yes` を選択して、Git とデプロイ設定を自動で行うようにします。

```
╭ Create an application with C3 ╮
│                               │
◇  Where do you want to create your application?
│  ./bookmark-app
│
◇  What type of application do you want to create?
│  "Website or web app"
│
◇  Which framework do you want to use?
│  "Next"
│
◇  Do you want to deploy your application?
│  Yes
│
╰───────────────────────────────╯
```

**🤔 The Why:** `create-cloudflare` を使うと、Next.js のプロジェクトが作成されるだけでなく、Cloudflare Pages へのデプロイに必要な設定ファイル `wrangler.toml` が自動で生成・設定されます。これにより、後のデプロイ作業が格段にスムーズになります。まさに「Cloudflare-first」な開発スタイルです。

完了したら、作成されたディレクトリに移動します。

```bash
cd bookmark-app
```

### 1.2. データの心臓部！D1 データベースの作成

**🎯 ゴール:** ブックマーク情報を保存するための D1 データベースを作成し、プロジェクトに接続する。

**👉 The How:**

まず、Cloudflare にログインします。ブラウザが開き、認証を求められます。

```bash
npx wrangler login
```

次に、D1 データベースを作成します。`<YOUR_DB_NAME>` は `bookmark-app-db` など、好きな名前に変更してください。

```bash
npx wrangler d1 create <YOUR_DB_NAME>
```

コマンドが成功すると、「`wrangler.toml` に設定を追記しますか？」と尋ねられます。`Yes` を選択しましょう。`wrangler.toml` にデータベース情報が自動で追記され、手動で編集する手間が省けます。

**🤔 The Why:** D1 は Cloudflare のネットワーク上で動作するサーバーレスデータベースです。`wrangler` CLI を通じて簡単に作成・管理でき、ローカルでの開発時にはエミュレータが、本番環境では実際の D1 が使われるようにシームレスに連携してくれます。

### 1.3. 冒険の道具を揃える (ライブラリのインストール)

**🎯 ゴール:** 認証やデータベース操作に必要なライブラリをプロジェクトに追加する。

**👉 The How:**

アプリケーション本体で利用するライブラリをインストールします。

```bash
npm install better-auth drizzle-orm
```

次に、開発時にのみ使用するライブラリをインストールします。(`wrangler`は`create-cloudflare`によって既にインストールされています)

```bash
npm install -D drizzle-kit @better-auth/cli
```

**🤔 The Why:**

- `better-auth`: 認証機能の主役。ログイン処理やセッション管理を担当します。
- `drizzle-orm`: データベース操作の相棒。Drizzle が SQL のような直感的なコードを提供し、Cloudflare D1 との通信を担います。
- `drizzle-kit` & `@better-auth/cli`: 開発の補助魔法。データベースのテーブル構造（スキーマ）をコードから自動生成してくれる便利なツールです。

### 1.4. 身分証明書の発行 (GitHub OAuth App)

**🎯 ゴール:** GitHub アカウントでログインできるように、GitHub に自分のアプリを登録する。

**👉 The How:**

1.  [GitHub Developer Settings](https://github.com/settings/developers) にアクセスします。
2.  `New OAuth App` をクリックします。
3.  以下の情報を入力します。
    - **Application name:** `Bookmark App (Dev)` など、分かりやすい名前
    - **Homepage URL:** `http://localhost:3000`
    - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4.  `Register application` をクリックします。
5.  表示された `Client ID` をコピーします。
6.  `Generate a new client secret` をクリックして `Client Secret` を生成し、同様にコピーします。

**🤔 The Why:** OAuth は、ユーザーのパスワードを直接扱わずに、安全にサービス間の連携（今回は「あなたのアプリ」と「GitHub」）を行うための仕組みです。`Authorization callback URL` は、GitHub が「このユーザーは本人で間違いないですよ」と認証情報を送り返してくれる、あなたのアプリ側の窓口（エンドポイント）です。開発中はローカルサーバーの URL を指定し、本番デプロイ後には本番用の URL を追加します。

### 1.5. 秘密の鍵を隠す (環境変数の設定)

**🎯 ゴール:** GitHub の認証情報など、公開してはいけない秘密の情報を安全に管理する。

**👉 The How:** プロジェクトのルートに `.env.local` ファイルを作成し、以下の内容を記述します。

**`.env.local`**

```env
# GitHub OAuth - 先ほどコピーした値を貼り付け
GITHUB_CLIENT_ID="gho_xxxxxxxxxxxxxxxxxxxx"
GITHUB_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# BetterAuth Secret - 以下のコマンドで生成した値を設定
# openssl rand -base64 32
AUTH_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Cloudflare D1用の認証情報（drizzle-kit用）
CLOUDFLARE_ACCOUNT_ID="your_account_id"
CLOUDFLARE_DATABASE_ID="your_database_id"
CLOUDFLARE_D1_TOKEN="your_d1_token"
```

`AUTH_SECRET` は、セッション情報などを暗号化するための秘密の文字列です。ターミナルで `openssl rand -base64 32` を実行して生成したランダムな文字列を設定してください。

**Cloudflare D1認証情報の取得方法:**

1. **Account ID**: Cloudflareダッシュボードの右サイドバーから確認できます
2. **Database ID**: `wrangler d1 list` コマンドで確認できます
3. **D1 Token**: Cloudflareダッシュボードの「My Profile」→「API Tokens」から作成できます（D1:Edit権限が必要）

**🤔 The Why:** `.env.local` ファイルは、Git の管理対象から意図的に除外される（`.gitignore`に記載されている）ファイルです。ここに秘密の情報を書くことで、誤って GitHub などに公開してしまう事故を防ぎます。本番環境では、Cloudflare のダッシュボードから直接これらの値を設定します。

---

## 2. 📖 データベースの設計図を描く (スキーマ設定)

いよいよデータベースの構造をコードで定義していきます。Drizzle ORM の真骨頂です！

### 2.1. Drizzle Kit の羅針盤 (設定ファイル)

**🎯 ゴール:** Drizzle Kit に、どこにあるスキーマ定義を元に、どこにマイグレーションファイルを生成すればよいか教える。

**👉 The How:** プロジェクトルートに `drizzle.config.ts` を作成します。

**`drizzle.config.ts`**

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts", // スキーマ定義ファイルの場所
  out: "./drizzle", // マイグレーションファイルの出力先
  dialect: "sqlite", // 使用するDBの種類 (D1はSQLite互換)
  driver: "d1-http", // Cloudflare D1用のHTTPドライバを指定
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});
```

**🤔 The Why:** この設定ファイルがあるおかげで、`drizzle-kit` コマンドは引数なしで実行しても、どのデータベースに対して、どのスキーマを元に作業すればよいかを正確に把握できます。

### 2.2. ブックマークテーブルの設計図

**🎯 ゴール:** ブックマーク情報を格納するためのテーブルをコードで定義する。

**👉 The How:** まず、スキーマファイルを格納するディレクトリを作成し、ファイルを作成します。

```bash
mkdir -p lib/db
touch lib/db/schema.ts
```

そして、`lib/db/schema.ts` に以下のコードを記述します。

**`lib/db/schema.ts`**

```ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// 'bookmarks' という名前のテーブルを定義
export const bookmarks = sqliteTable("bookmarks", {
  id: integer("id").primaryKey(), // 主キー (自動増分)
  userId: text("user_id").notNull(), // どのユーザーのブックマークかを示すID
  url: text("url").notNull(), // ブックマークのURL
  title: text("title").notNull(), // ブックマークのタイトル
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()), // 作成日時 (デフォルトで現在時刻)
});
```

**🤔 The Why:** Drizzle では、このように TypeScript のコードでデータベースのテーブル構造を定義します。これにより、`string` や `number` といった TypeScript の型とデータベースの型が紐づき、タイプセーフなデータベース操作が実現できます。SQL を直接書くよりもエラーが減り、開発効率が向上します。

### 2.3. 認証システムの心臓部 (BetterAuth 設定)

**🎯 ゴール:** BetterAuth を初期化し、Drizzle アダプターと GitHub プロバイダーを接続する。

**👉 The How:** `lib` フォルダに `auth.ts` ファイルを作成します。

**`lib/auth.ts`**

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";

const AUTH_URL =
  process.env.NODE_ENV === "production"
    ? "https://<YOUR_APP_URL>.pages.dev"
    : "http://localhost:3000";

// データベースインスタンスを動的に生成する関数
const getDb = (env: { DB: D1Database }) => {
  return drizzle(env.DB, { schema });
};

export const auth = betterAuth({
  database: drizzleAdapter(getDb({ DB: process.env.DB as any }), {
    provider: "sqlite",
    usePlural: true,
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  secret: process.env.AUTH_SECRET,
  baseURL: AUTH_URL,
});
```

**🤔 The Why:** ここが認証システムの中心です。`betterAuth` 関数に設定オブジェクトを渡すことで、認証の挙動をカスタマイズします。

- `database`: 認証ライブラリがユーザー情報やセッション情報をどこに保存するかを指定します。`drizzleAdapter` を使うことで、BetterAuth が Drizzle と会話できるようになります。Cloudflare D1では、`getDb`関数で動的にデータベースインスタンスを生成する必要があります。
- `socialProviders`: どのようなログイン方法を提供するかを定義します。今回は GitHub を設定しています。
- `secret` と `baseURL`: それぞれ環境変数と、認証サーバーのベースURLを指定しています。

> **💡 深掘りコラム: データベースアダプターの役割とCloudflare D1特有の対応**
> なぜ「アダプター」が必要なのでしょうか？ BetterAuth 自身は、特定のデータベース（MySQL, PostgreSQL, SQLite など）の具体的な操作方法を知りません。アダプターは、BetterAuth からの「ユーザー情報を保存して」といった抽象的な指示を、Drizzle ORM が理解できる具体的なコードに「翻訳」してくれる通訳のような存在です。
>
> **Cloudflare D1特有の対応**: 通常のNode.js環境では、データベースインスタンスを静的に作成できますが、Cloudflare D1では環境変数（`process.env.DB`）から動的にデータベース接続を取得する必要があります。そのため、`getDb`関数でCloudflare D1のバインディングを受け取り、適切なDrizzleインスタンスを生成しています。これにより、BetterAuth はデータベースの実装を気にすることなく、認証ロジックに集中できるのです。

### 2.4. 設計図からデータベースを構築！ (マイグレーション)

**🎯 ゴール:** Drizzle と BetterAuth のスキーマ定義を元に、実際の D1 データベースにテーブルを作成する。

**👉 The How:** 以下のコマンドを順番に実行します。

1.  **BetterAuth のスキーマを追記**
    この魔法のコマンドを実行すると、`lib/auth.ts` の設定が読み取られ、認証に必要なテーブル定義（`users`, `sessions`など）が `lib/db/schema.ts` に自動で追記されます。

    ```bash
    npx @better-auth/cli generate
    ```

2.  **マイグレーションファイルの生成**
    現在のスキーマ定義（ブックマークテーブル＋認証テーブル）と、実際のデータベースの状態を比較し、差分を埋めるための SQL ファイル（マイグレーションファイル）を生成します。

    ```bash
    npx drizzle-kit generate
    ```

    `drizzle` フォルダ内に `0000_xxxx.sql` のようなファイルが作成されたことを確認してください。

3.  **ローカル DB へのマイグレーション実行**
    生成された SQL ファイルを、Wrangler 経由でローカルの D1 データベースに実行します。

    ```bash
    npx wrangler d1 migrations apply <YOUR_DB_NAME> --local
    ```

**🤔 The Why:** この「マイグレーション」という仕組みにより、データベースの構造変更を安全かつ確実に管理できます。コードでスキーマを管理し（スキーマファースト）、その変更履歴をファイルとして残すことで、開発チーム内での認識齟齬を防いだり、過去の状態に切り戻したりすることが容易になります。

---

## 3. 🛂 アプリの門番を配置する (API とミドルウェア)

認証処理のバックエンド部分と、特定ページへのアクセス制御を実装します。

### 3.1. 認証リクエストの受付窓口 (API ルート)

**🎯 ゴール:** BetterAuth が認証処理（サインイン、コールバック、サインアウト等）を行うための API エンドポイントを作成する。

**👉 The How:** `app/api/auth/[...all]/route.ts` というファイルを作成します。

**`app/api/auth/[...all]/route.ts`**

```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// betterAuthの内部ハンドラをNext.jsのリクエスト/レスポンス形式に変換
export const { GET, POST } = toNextJsHandler(auth.handler);
```

**🤔 The Why:** `[...all]` というファイル名は「キャッチオールルート」と呼ばれ、`/api/auth/` 以下のすべてのリクエスト（例: `/api/auth/sign-in/github`, `/api/auth/callback/github`, `/api/auth/sign-out`）をこのファイルで処理することを示します。`toNextJsHandler` が、BetterAuth の内部ロジックと Next.js の作法を繋ぎこむアダプターの役割を果たしています。UI 側からは `<Link>` でこれらのパスへ直接遷移するのではなく、`authClient.signIn.social` / `authClient.signOut` を呼び出してフローを開始するのが推奨です。

### 3.2. ダッシュボードの警備員 (ミドルウェア)

**🎯 ゴール:** `/dashboard` ページを、ログインしているユーザーだけが見られるように保護する。

**👉 The How:** プロジェクトのルートに `middleware.ts` を作成します。

**`middleware.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // リクエストヘッダーからセッション情報を取得
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // セッションがなければ、未認証と判断
  if (!session) {
    // トップページに強制的にリダイレクト
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 認証済みであれば、要求されたページへのアクセスを許可
  return NextResponse.next();
}

// このミドルウェアがどのパスで実行されるかを定義
export const config = {
  runtime: "nodejs", // Next.js 15.2.0+でNode.js APIにアクセスするために必要
  matcher: ["/dashboard"],
};
```

**🤔 The Why:** Next.js のミドルウェアは、リクエストがページコンポーネントに到達する「前」に実行されるコードです。ここでセッションの有無をチェックすることで、権限のないユーザーを効率的に弾くことができます。これにより、保護されたページの内容が不正に表示されるのを防ぎます。`runtime: "nodejs"`は、Next.js 15.2.0+でNode.js API（`headers()`など）にアクセスするために必要です。

> **💡 深掘りコラム: 認証 (Authentication) vs 認可 (Authorization)**
> このミドルウェアが行っているのは**認証 (Authentication)**、つまり「あなた、誰ですか？（ログインしていますか？）」の確認です。一方、**認可 (Authorization)** は「あなたにこの操作をする権限がありますか？（例: 他人のブックマークを削除しようとしていませんか？）」の確認を指します。認可のチェックは、この後のサーバーアクションなど、より具体的な操作を行う場所で実装するのが一般的です。

---

## 4. 🎨 アプリの顔を作る (UI と機能実装)

いよいよユーザーが実際に触れる画面と、その裏で動くロジックを作っていきます。

### 4.1. D1 データベース接続の準備

**🎯 ゴール:** どこからでも簡単に D1 データベースに接続できる関数を準備する。

**👉 The How:** `lib/db/index.ts` を作成します。

**`lib/db/index.ts`**

```ts
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const getDb = (env: { DB: D1Database }) => {
  // Cloudflare Workers環境では、env経由で
  // wrangler.jsoncで設定したbinding名のオブジェクトにアクセスできる
  const db = drizzle(env.DB, { schema });
  return db;
};
```

**🤔 The Why:** この関数を介してデータベースインスタンスを取得することで、コードの再利用性が高まります。また、`env.DB` は Cloudflare の環境で実行される際に、`wrangler.jsonc` で設定した D1 データベースへの接続オブジェクトに自動的に置き換えられます。

### 4.2. アプリの頭脳 (サーバーアクション)

**🎯 ゴール:** ブックマークの追加と削除を行うためのバックエンドロジックを実装する。

**👉 The How:** `app/actions.ts` を作成します。

**`app/actions.ts`**

```ts
"use server";

import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { bookmarks } from "@/lib/db/schema";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// ブックマークを追加するアクション
export async function addBookmark(formData: FormData) {
  // 1. 認証チェック (本当にログインしてる？)
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  // 2. フォームからデータを取得
  const url = formData.get("url") as string;
  const title = formData.get("title") as string;

  if (!url || !title) {
    throw new Error("URL and title are required");
  }

  // 3. データベースに新しいブックマークを挿入
  // 注意: 実際の実装では、envオブジェクトを渡す必要があります
  const db = getDb({ DB: process.env.DB as any });
  await db.insert(bookmarks).values({
    userId: session.user.id, // 必ず自分のIDと紐付ける
    url,
    title,
  });

  // 4. キャッシュをクリアして画面を更新
  revalidatePath("/dashboard");
}

// ブックマークを削除するアクション
export async function deleteBookmark(id: number) {
  // 1. 認証チェック
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  // 注意: 実際の実装では、envオブジェクトを渡す必要があります
  const db = getDb({ DB: process.env.DB as any });

  // TODO: 認可チェック！本当にこのユーザーがこのブックマークの所有者か確認する

  // 2. 指定されたIDのブックマークを削除
  await db.delete(bookmarks).where(eq(bookmarks.id, id));

  // 3. キャッシュをクリアして画面を更新
  revalidatePath("/dashboard");
}
```

**🤔 The Why:** `"use server";` とファイルの先頭に書くことで、これらの関数は**サーバーアクション**として定義されます。サーバーアクションは、クライアント（ブラウザ）から直接呼び出せる安全なサーバーサイドの関数です。API ルートを別途作成する必要がなく、フォームの送信やボタンのクリックをきっかけに、シームレスにサーバーのロジックを実行できます。
`revalidatePath("/dashboard")` は、「/dashboard ページのキャッシュを無効にして、次にアクセスがあったら最新のデータを再取得してね」という Next.js への指示です。これにより、データベース更新後に画面が自動で最新の状態になります。

### 4.3. ログイン/ログアウトボタン

**🎯 ゴール:** ユーザーのログイン状態に応じて、適切なボタンを表示するコンポーネントを作成する。

**👉 The How:** まず `lib/auth-client.ts` と `components/auth-client-buttons.tsx` を作成し、その後に `components/auth-components.tsx` を作成します。

**`lib/auth-client.ts`**

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
```

**`components/auth-client-buttons.tsx`**

```tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignInWithGithubButton() {
  const handleClick = async () => {
    await authClient.signIn.social({ provider: "github" });
  };

  return (
    <button
      onClick={handleClick}
      className="bg-gray-800 text-white px-4 py-2 rounded-md"
    >
      Sign in with Github
    </button>
  );
}

export function SignOutButton() {
  const router = useRouter();

  const handleClick = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <button
      onClick={handleClick}
      className="bg-red-500 text-white px-4 py-2 rounded-md"
    >
      Sign Out
    </button>
  );
}
```

**`components/auth-components.tsx`**

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  SignInWithGithubButton,
  SignOutButton,
} from "@/components/auth-client-buttons";

// このコンポーネントはサーバーサイドでレンダリングされる (RSC)
export async function AuthButtons() {
  // サーバーサイドで直接セッション情報を取得
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    // ログインしている場合
    return (
      <div className="flex items-center gap-4">
        <p>{session.user.email}</p>
        <SignOutButton />
      </div>
    );
  }

  // ログインしていない場合
  return <SignInWithGithubButton />;
}
```

**🤔 The Why:** このコンポーネントは**React Server Component (RSC)** として動作します。サーバーサイドでレンダリングが完了するため、セッション取得のための API リクエストがクライアントに発生せず、表示が高速です。また、セッション情報のような機密データがクライアントに漏れる心配もありません。

> **💡 深掘りコラム: React Server Components (RSC) の衝撃**
> RSC は、React 18 から導入された新しいパラダイムです。コンポーネントがサーバーサイドで完結し、クライアントには HTML と、必要最低限の JavaScript だけが送信されます。これにより、初期表示の高速化、バンドルサイズの削減、そしてサーバーリソース（DB 接続など）への安全な直接アクセスが可能になり、Web 開発のあり方を大きく変えつつあります。

### 4.4. アプリの玄関 (トップページ)

**🎯 ゴール:** ユーザーが最初に訪れる、シンプルなトップページを作成する。

**👉 The How:** `app/page.tsx` を編集します。

**`app/page.tsx`**

```tsx
import { AuthButtons } from "@/components/auth-components";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Bookmark App</h1>
      <AuthButtons />
    </main>
  );
}
```

### 4.5. メインステージ (ダッシュボード)

**🎯 ゴール:** ログイン後に表示されるメイン画面。ブックマークの追加フォームと一覧を表示する。

**👉 The How:** `app/dashboard/page.tsx` を作成します。

**`app/dashboard/page.tsx`**

```tsx
import { addBookmark, deleteBookmark } from "@/app/actions";
import { AuthButtons } from "@/components/auth-components";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { bookmarks } from "@/lib/db/schema";

export default async function DashboardPage() {
  // サーバーサイドでセッションとDBからデータを取得
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null; // ミドルウェアで保護済みだが、念のためのチェック

  // 注意: 実際の実装では、envオブジェクトを渡す必要があります
  const db = getDb({ DB: process.env.DB as any });
  const userBookmarks = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, session.user.id),
    orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)],
  });

  return (
    <div className="max-w-2xl mx-auto p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Bookmarks</h1>
        <AuthButtons />
      </header>

      {/* ブックマーク追加フォーム: 送信時に`addBookmark`サーバーアクションが実行される */}
      <form action={addBookmark} className="mb-8 p-4 border rounded-md">
        <h2 className="text-lg font-semibold mb-2">Add New Bookmark</h2>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            name="title"
            placeholder="Title"
            required
            className="p-2 border rounded-md"
          />
          <input
            type="url"
            name="url"
            placeholder="https://example.com"
            required
            className="p-2 border rounded-md"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </form>

      {/* ブックマーク一覧 */}
      <div className="space-y-4">
        {userBookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="p-4 border rounded-md flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{bookmark.title}</h3>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:underline"
              >
                {bookmark.url}
              </a>
            </div>
            {/* 削除ボタン: 送信時に`deleteBookmark`サーバーアクションが実行される */}
            <form action={deleteBookmark.bind(null, bookmark.id)}>
              <button type="submit" className="text-red-500 hover:text-red-700">
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**🤔 The Why:** このページも RSC です。ページのレンダリングと同時に、サーバーサイドでデータベースからブックマーク一覧を取得しています。`<form action={addBookmark}>` のように、フォームの`action`にサーバーアクションを直接渡すだけで、フォーム送信とバックエンドロジックが繋がります。これが Next.js 15 のパワフルな機能です。

### 4.6. 👨‍💻 ローカルで動作確認

**🎯 ゴール:** ここまでの実装が正しく動作するか、自分の PC で確認する。

**👉 The How:** 以下のコマンドで開発サーバーを起動します。

```bash
npm run dev
```

1.  `http://localhost:3000` にアクセスします。
2.  `Sign in with GitHub` ボタンをクリックして、GitHub 認証を行います。
3.  認証後、`/dashboard` にリダイレクトされれば成功です！
4.  ブックマークの追加と削除を試してみてください。データが更新され、画面に即時反映されるはずです。

---

## 5. 🌍 世界へ公開！ (Cloudflare へのデプロイ)

いよいよ最後の仕上げです。作成したアプリケーションを Cloudflare Pages にデプロイして、世界中の誰もがアクセスできるようにします。

### 5.1. 本番環境用の URL 設定

**🎯 ゴール:** 本番環境で認証が正しく機能するように、`lib/auth.ts` を修正する。

**👉 The How:** デプロイ後の本番 URL を`baseURL`に設定するように修正します。

**`lib/auth.ts`**

```ts
// 環境(NODE_ENV)に応じてURLを切り替える
const AUTH_URL =
  process.env.NODE_ENV === "production"
    ? "https://<YOUR_APP_URL>.pages.dev" // 👈 デプロイ後にあなたのアプリのURLに書き換える
    : "http://localhost:3000";

export const auth = betterAuth({
  // データベースとの連携設定
  database: drizzleAdapter(getDb({ DB: process.env.DB as any }), {
    provider: "sqlite",
    usePlural: true, // テーブル名を複数形(users, sessions)にする
  }),
  // ログイン方法の設定 (今回はGitHub)
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  // セッション暗号化の秘密鍵
  secret: process.env.AUTH_SECRET,
  // 認証サーバーのベースURL
  baseURL: AUTH_URL,
});
```

**🤔 The Why:** 認証ライブラリは、リダイレクト先の URL などを生成するために、自分がどの URL で動作しているかを知る必要があります。`process.env.NODE_ENV` は、Cloudflare Pages などの本番環境では自動的に `"production"` に設定されるため、これを使ってローカル環境と本番環境の URL を動的に切り替えるのが定石です。

### 5.2. Cloudflare Pages へのデプロイ

**🎯 ゴール:** GitHub リポジトリと連携し、Cloudflare Pages にアプリケーションをデプロイする。

**👉 The How:** `create-cloudflare` を実行した際に、既に GitHub リポジトリへのプッシュと Cloudflare Pages プロジェクトの作成は完了しています。あとは、いくつかの設定を追加するだけです。

1.  **Cloudflare ダッシュボードに移動:** `Workers & Pages` から、作成された `bookmark-app` プロジェクトを選択します。
2.  **環境変数の設定:** `Settings` > `Environment variables` に移動し、`.env.local` と同じキーと値の**本番用**環境変数を設定します。
    - `GITHUB_CLIENT_ID`
    - `GITHUB_CLIENT_SECRET`
    - `AUTH_SECRET`
3.  **D1 データベースの紐付け:** `Settings` > `Functions` > `D1 database bindings` に移動し、`Add binding` をクリックします。
    - **Variable name:** `DB`
    - **D1 database:** プロジェクト作成時に作った D1 データベースを選択

### 5.3. GitHub OAuth Callback URL の更新

**🎯 ゴール:** 本番環境からの認証リクエストを GitHub が受け入れるように設定する。

**👉 The How:**

1.  Cloudflare Pages のデプロイが完了すると、`https://<YOUR_APP_URL>.pages.dev` という URL が生成されます。
2.  [GitHub Developer Settings](https://github.com/settings/developers) に戻り、作成した OAuth App の設定を開きます。
3.  `Authorization callback URL` に、本番環境の URL `https://<YOUR_APP_URL>.pages.dev/api/auth/callback/github` を**追加**します。（開発用の`localhost`の URL は残しておいて OK です）

**🤔 The Why:** セキュリティのため、GitHub は登録されていないコールバック URL へのリダイレクトを許可しません。本番環境の URL を明示的に追加することで、本番アプリからのログインが可能になります。

### 5.4. 本番データベースへのマイグレーション

**🎯 ゴール:** 本番環境の D1 データベースに、ローカルと同じテーブル構造を反映させる。

**👉 The How:** 以下のコマンドを一度だけ実行します。

```bash
npx wrangler d1 migrations apply <YOUR_DB_NAME> --remote
```

**🤔 The Why:** `--remote` フラグを付けることで、Wrangler はローカルのエミュレータではなく、Cloudflare 上の実際の D1 データベースに対してマイグレーションを実行します。これで、本番環境の準備は万端です！

**おめでとうございます！🎉** これでデプロイはすべて完了です！本番 URL にアクセスして、世界に公開されたあなたのアプリケーションを触ってみてください！

---

## 🎓 まとめと次のステップ

このチュートリアルでは、Next.js 15, BetterAuth, Drizzle, Cloudflare D1/Pages という、モダンな技術スタックの全体像を掴みながら、実際に動くフルスタックアプリケーションを構築しました。サーバーコンポーネントの考え方、エッジでのデータベースアクセス、Git ベースの CI/CD など、これからの Web 開発に不可欠なスキルを一度に体験できたはずです。

### 🔥 挑戦課題 (Challenges)

さらにスキルを磨くために、いくつかの機能追加に挑戦してみましょう！

- **Easy (簡単):** ブックマークに「お気に入り」フラグを追加してみよう。(`boolean` 型をスキーマに追加！)
- **Medium (普通):** ブックマークの**編集(Update)**機能を追加してみよう。モーダルウィンドウでタイトルを編集できるようにするとクールです。
- **Hard (難しい):** ブックマークに**タグ**を付けられるようにしてみよう。多対多のリレーション（`bookmarks`テーブルと`tags`テーブル、そして中間テーブル）の設計が必要になります。
- **Expert (達人):** 他のソーシャルログイン（Google, Twitter など）を追加してみよう。

このチュートリアルが、あなたの開発者としての新たな一歩となれば幸いです。Happy Hacking! 🚀
