# マイコンで作る固定翼機の自動操縦

ESP32とC++で固定翼機のフライトコントローラを自作し、全日本学生室内飛行ロボットコンテスト統合部門の自動系サブミッション（自動水平旋回・自動8の字飛行・自動上昇旋回）を達成するための講座サイトです。「マイコンのためのC++講座」の続編にあたります。

公開サイト: <https://hr-tuat.github.io/Autopilot_course/>

## 構成

```text
.
├── .github/workflows/deploy.yml   GitHub Pages への自動公開
├── src/                           TypeScript（ビルドすると site/assets/js/ に出力）
│   ├── chapters.ts                章立て（ナビゲーションはすべてここから生成）
│   ├── highlight.ts               C++ の簡易シンタックスハイライタ
│   └── main.ts                    目次・前後リンク・ページ内目次・コピーボタン
├── site/                          公開されるファイル
│   ├── index.html                 トップページ
│   ├── rules.html                 大会ルールと要求仕様（ルール改訂時はここを更新）
│   ├── chapters/                  各章のページ
│   │   └── _template.html         新しい章のひな形
│   └── assets/css/                スタイル（../Cpp_course と同じ4分割）
│       ├── base.css               リセット・配色変数・タイポグラフィ
│       ├── layout.css             ヘッダ・サイドバー・本文幅・目次カラム
│       ├── components.css         表・囲み・図・カード・数式
│       └── code.css               コードブロックとシンタックスハイライト
├── package.json
└── tsconfig.json
```

依存ライブラリは使っていません。開発時に必要なのは TypeScript コンパイラ（`tsc`）だけです。

デザインは姉妹サイトの[マイコンのためのC++講座](https://hr-tuat.github.io/Cpp_course/)（`../Cpp_course`）と揃えてあります。配色変数・クラス名・CSS の分け方まで同じにしてあるので、見た目を直すときは**両方のリポジトリに同じ変更を入れてください**。向こうの書き方の手引きは `../Cpp_course/docs/html-guide.md` にあります。

## 手元で確認する

```sh
npm install        # 初回のみ（TypeScript を入れる）
npm run build      # src/*.ts → site/assets/js/*.js
npm run serve      # http://localhost:8000 で確認（Python 3 が必要）
```

ES モジュールを使っているため、HTML をファイルとして直接開くのではなく、上のようにローカルサーバ経由で開いてください。書きながら確認するときは `npm run watch` を別の端末で動かしておくと便利です。

## 公開する

1. このリポジトリを GitHub に push する
2. Settings → Pages → Build and deployment の Source を「GitHub Actions」にする
3. `main` ブランチに push するたびに、ビルドと公開が自動で行われる

`site/assets/js/` はビルドで生成されるので、Git には含めません（`.gitignore` 済み）。

## 章を追加する

1. `site/chapters/_template.html` をコピーして、`site/chapters/NN-name.html` を作る
2. `<body data-page="NN" data-base="../">` の `data-page` を決める（`data-base` はサイトルートへの相対パス。`site/` 直下なら `./`）
3. `src/chapters.ts` の該当する章の `status` を `"planned"` から `"draft"`（または `"ready"`）に変え、`href` とファイル名を一致させる

`status` が `"planned"` の章は、目次に灰色で表示されるだけでリンクされません。

## 書き方の決まり

- 文体は「です・ます」。用語は初出で説明する。
- コードの書式は C++ 講座に合わせる：波括弧は次の行に置く、`if` の中身が1行でも波括弧を付ける、コンストラクタはメンバ初期化リストを使う。
- コード例の `<`、`>`、`&` は HTML の中では `&lt;`、`&gt;`、`&amp;` と書く（ハイライタが元に戻して表示する）。
- コードは `<figure class="code">` の中に、`<figcaption>` でファイルのパスを付けて置く。
- 数式は MathML で書く。主要なブラウザはライブラリなしで表示できる。
- 囲みは4種類だけ使う：`callout-caution`（安全）、`callout-rule`（大会ルール）、`callout-cpp`（C++講座との対応・講座で扱わなかった書き方）、無印（補足）。
- 大会ルールに依存する記述は、できるだけ `rules.html` に集め、各章からはそこを参照する。

## 決定事項

| 項目 | 決定 |
|---|---|
| 対象 | 統合部門の自動系サブミッション（第22回ルールブック Version 1.1 を基準） |
| 飛行環境 | 室内、GPSなし |
| 受講者の数学 | 大学初年次（線形代数・微積分は既習） |
| 離陸 | 滑走路から自力滑走（統合部門では手動） |
| 自己位置推定 | マーカーは扱わない。機体に積んだセンサのみ |
| 期間 | 定めず、章立てのみ |
| マイコン環境 | ESP32、PlatformIO、Arduino フレームワーク |
| サイト | HTML + CSS + TypeScript、依存ライブラリなし、数式は MathML |
| デザイン | `../Cpp_course` と共通（配色変数・クラス名・CSS の分割まで揃える） |

## 未確定事項

- Arduino-ESP32 コアのバージョン（第4章は 3.x の API で記述し、2.x との違いを補足に記載）
- 使用する ESP32 の型番とセンサの型番
- モータ駆動の方式（ブラシレス＋ESC か、ブラシモータ＋FET か）
- PID シミュレータ（第12章に置く予定）の範囲
