// 各ページ共通の初期化。すべてのHTMLがこのファイルだけを読み込む。
//
// 構成・クラス名・配色は「マイコンのためのC++講座」(../Cpp_course) と揃えてある。
// 向こうの site/scripts/ に対応するもので、サイドバー・前へ/次へ・ページ内目次を
// chapters.ts から生成し、テーマの切り替えとコードのハイライトを担当する。
//
// 各ページの <body> に次の2つを書く。
//   data-page : chapters.ts の id
//   data-base : サイトのルートへの相対パス（トップ階層なら "./"、chapters/ 内なら "../"）

import { allChapters, chapterLabel, parts, type Chapter } from "./chapters.js";
import { highlightAll } from "./highlight.js";

const THEME_KEY = "autopilot-course:theme";

type Theme = "light" | "dark";

const base = document.body.dataset.base ?? "./";
const currentId = document.body.dataset.page ?? "";

/** 公開状態のうち、ラベルを出すものだけ。ready は何も出さない */
const STATUS_BADGE: Partial<Record<Chapter["status"], { text: string; cls: string }>> = {
    draft: { text: "草稿", cls: "badge badge-draft" },
    planned: { text: "準備中", cls: "badge badge-pending" },
};

function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    text?: string,
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (className !== undefined) {
        node.className = className;
    }
    if (text !== undefined) {
        node.textContent = text;
    }
    return node;
}

/* ---------- テーマ ---------- */

function storedTheme(): Theme | null {
    try {
        const value = window.localStorage.getItem(THEME_KEY);
        return value === "light" || value === "dark" ? value : null;
    } catch {
        return null;
    }
}

function applyTheme(theme: Theme | null): void {
    if (theme !== null) {
        document.documentElement.dataset.theme = theme;
    } else {
        delete document.documentElement.dataset.theme;
    }
}

function setupTheme(): void {
    applyTheme(storedTheme());

    const button = document.querySelector<HTMLButtonElement>(".theme-toggle");
    button?.addEventListener("click", () => {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const current = storedTheme() ?? (prefersDark ? "dark" : "light");
        const next: Theme = current === "dark" ? "light" : "dark";

        applyTheme(next);
        try {
            window.localStorage.setItem(THEME_KEY, next);
        } catch {
            // 保存できなくても表示は切り替える
        }
    });
}

/* ---------- サイドバー ---------- */

function renderNav(host: HTMLElement): void {
    for (const part of parts) {
        const group = el("div", "nav-group");
        group.append(el("p", "nav-group-title", part.title));

        const list = el("ul", "nav-list");
        for (const chapter of part.chapters) {
            // 準備中の章はリンクにしない。色だけで「まだ読めない」ことを示す
            const body = chapter.status === "planned"
                ? el("span", "nav-pending")
                : el("a", undefined);
            if (body instanceof HTMLAnchorElement) {
                body.href = base + chapter.href;
                if (chapter.id === currentId) {
                    body.setAttribute("aria-current", "page");
                }
            }
            body.append(el("span", "nav-num", chapterLabel(chapter)));
            body.append(el("span", undefined, chapter.title));

            const item = el("li");
            item.append(body);
            list.append(item);
        }

        group.append(list);
        host.append(group);
    }

    setupNavToggle(host);
}

function setupNavToggle(sidebar: HTMLElement): void {
    const button = document.querySelector<HTMLButtonElement>(".nav-toggle");
    if (button === null) {
        return;
    }

    const setOpen = (open: boolean): void => {
        sidebar.classList.toggle("is-open", open);
        button.setAttribute("aria-expanded", String(open));
    };

    button.addEventListener("click", () => {
        setOpen(!sidebar.classList.contains("is-open"));
    });

    // 狭い画面でリンクを踏んだら閉じる
    sidebar.addEventListener("click", (event) => {
        if ((event.target as HTMLElement).closest("a") !== null) {
            setOpen(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setOpen(false);
        }
    });
}

/* ---------- トップページの章一覧 ---------- */

function renderCards(host: HTMLElement): void {
    for (const part of parts) {
        const heading = el("h2", undefined, part.title);
        heading.id = part.id;

        const grid = el("div", "card-grid");
        for (const chapter of part.chapters) {
            const card = chapter.status === "planned"
                ? el("span", "card is-pending")
                : el("a", "card");
            if (card instanceof HTMLAnchorElement) {
                card.href = base + chapter.href;
            }

            const eyebrow = el("span", "card-eyebrow", chapterLabel(chapter));
            const badge = STATUS_BADGE[chapter.status];
            if (badge !== undefined) {
                eyebrow.append(el("span", badge.cls, badge.text));
            }

            card.append(eyebrow);
            card.append(el("span", "card-title", chapter.title));
            card.append(el("span", "card-desc", chapter.summary));
            grid.append(card);
        }

        host.append(heading, grid);
    }
}

/* ---------- 前へ / 次へ ---------- */

function renderPager(host: HTMLElement): void {
    // 準備中の章を挟まないよう、経路そのものを絞ってから前後を取る
    const order = allChapters().filter((chapter) => chapter.status !== "planned");
    const index = order.findIndex((chapter) => chapter.id === currentId);
    if (index === -1) {
        return;
    }

    const makeLink = (chapter: Chapter, direction: "prev" | "next"): HTMLAnchorElement => {
        const link = el("a", `pager-${direction}`);
        link.href = base + chapter.href;
        link.rel = direction;
        const label = direction === "prev"
            ? `← 前へ / ${chapterLabel(chapter)}`
            : `次へ / ${chapterLabel(chapter)} →`;
        link.append(el("span", "pager-label", label));
        link.append(el("span", "pager-title", chapter.title));
        return link;
    };

    const prev = order[index - 1];
    const next = order[index + 1];
    if (prev !== undefined) {
        host.append(makeLink(prev, "prev"));
    }
    if (next !== undefined) {
        host.append(makeLink(next, "next"));
    }
}

/* ---------- ページ内目次 ---------- */

interface Heading {
    id: string;
    text: string;
    level: 2 | 3;
}

function collectHeadings(): Heading[] {
    const nodes = Array.from(document.querySelectorAll<HTMLHeadingElement>(".prose h2, .prose h3"));

    return nodes.map((node, i) => {
        if (node.id === "") {
            node.id = `sec-${i + 1}`;
        }
        return {
            id: node.id,
            text: node.textContent ?? "",
            level: node.tagName === "H3" ? 3 : 2,
        };
    });
}

function renderToc(host: HTMLElement): void {
    const headings = collectHeadings();
    if (headings.length < 2) {
        return;
    }

    host.append(el("p", "toc-title", "このページの内容"));

    const list = el("ul");
    for (const heading of headings) {
        const item = el("li", heading.level === 3 ? "toc-h3" : undefined);
        const link = el("a", undefined, heading.text);
        link.href = `#${heading.id}`;
        item.append(link);
        list.append(item);
    }
    host.append(list);

    observeHeadings(host, headings);
}

/** スクロール位置に合わせて目次の現在地を光らせる */
function observeHeadings(host: HTMLElement, headings: Heading[]): void {
    const links = new Map<string, HTMLAnchorElement>();
    host.querySelectorAll("a").forEach((link) => {
        links.set(decodeURIComponent(link.getAttribute("href")?.slice(1) ?? ""), link);
    });

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    visible.add(entry.target.id);
                } else {
                    visible.delete(entry.target.id);
                }
            });

            const first = headings.find((heading) => visible.has(heading.id));
            if (first !== undefined) {
                links.forEach((link, key) => link.classList.toggle("is-active", key === first.id));
            }
        },
        { rootMargin: "-5rem 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element !== null) {
            observer.observe(element);
        }
    });
}

/* ---------- コードブロック ---------- */

function enhanceCodeBlocks(): void {
    highlightAll();

    if (!navigator.clipboard) {
        return;
    }

    document.querySelectorAll<HTMLElement>("figure.code").forEach((figure) => {
        const code = figure.querySelector("code");
        if (code === null) {
            return;
        }

        const button = el("button", "copy-btn", "コピー");
        button.type = "button";
        button.addEventListener("click", () => {
            void navigator.clipboard.writeText(code.textContent ?? "").then(
                () => {
                    button.textContent = "コピーしました";
                    button.classList.add("is-done");
                    window.setTimeout(() => {
                        button.textContent = "コピー";
                        button.classList.remove("is-done");
                    }, 1600);
                },
                () => {
                    button.textContent = "コピーできません";
                },
            );
        });

        figure.append(button);
    });
}

/* ---------- 初期化 ---------- */

function init(): void {
    setupTheme();

    const nav = document.querySelector<HTMLElement>("[data-nav]");
    if (nav !== null) {
        renderNav(nav);
    }

    const cards = document.querySelector<HTMLElement>("[data-cards]");
    if (cards !== null) {
        renderCards(cards);
    }

    const pager = document.querySelector<HTMLElement>("[data-pager]");
    if (pager !== null) {
        renderPager(pager);
    }

    const toc = document.querySelector<HTMLElement>("[data-toc]");
    if (toc !== null) {
        renderToc(toc);
    }

    enhanceCodeBlocks();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
