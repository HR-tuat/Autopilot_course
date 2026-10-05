import { allChapters, parts, type Chapter } from "./chapters.js";
import { highlightAll } from "./highlight.js";

// 各ページの <body> に次の2つを書く。
//   data-page : chapters.ts の id
//   data-root : サイトのルートへの相対パス（トップ階層なら ""、chapters/ 内なら "../"）
const root = document.body.dataset.root ?? "";
const currentId = document.body.dataset.page ?? "";

const STATUS_LABEL: Record<Chapter["status"], string> = {
    ready: "",
    draft: "草稿",
    planned: "準備中",
};

function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    text?: string,
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (className) {
        node.className = className;
    }
    if (text !== undefined) {
        node.textContent = text;
    }
    return node;
}

/** 経路（章の並び）を1つの <ol> として作る。withSummary が true ならトップページ用の詳細表示。 */
function buildRoute(chapters: Chapter[], withSummary: boolean): HTMLOListElement {
    const list = el("ol", withSummary ? "route route--large" : "route");

    for (const chapter of chapters) {
        const item = el("li", `waypoint is-${chapter.status}`);
        const isCurrent = chapter.id === currentId;
        if (isCurrent) {
            item.classList.add("is-current");
        }

        const body = chapter.status === "planned" ? el("span", "waypoint-body") : el("a", "waypoint-body");
        if (body instanceof HTMLAnchorElement) {
            body.href = root + chapter.href;
            if (isCurrent) {
                body.setAttribute("aria-current", "page");
            }
        }

        body.append(el("span", "waypoint-number", chapter.number));

        const text = el("span", "waypoint-text");
        text.append(el("span", "waypoint-title", chapter.title));
        if (withSummary) {
            text.append(el("span", "waypoint-summary", chapter.summary));
        }
        const label = STATUS_LABEL[chapter.status];
        if (label !== "") {
            text.append(el("span", "waypoint-status", label));
        }
        body.append(text);

        item.append(body);
        list.append(item);
    }

    return list;
}

function buildRouteNav(container: HTMLElement, withSummary: boolean): void {
    for (const part of parts) {
        const heading = el(withSummary ? "h2" : "p", "route-part", part.title);
        container.append(heading, buildRoute(part.chapters, withSummary));
    }
}

function buildPager(container: HTMLElement): void {
    const available = allChapters().filter((c) => c.status !== "planned");
    const index = available.findIndex((c) => c.id === currentId);
    if (index === -1) {
        return;
    }

    const makeLink = (chapter: Chapter, direction: "prev" | "next"): HTMLAnchorElement => {
        const link = el("a", `pager-link pager-link--${direction}`);
        link.href = root + chapter.href;
        link.append(el("span", "pager-label", direction === "prev" ? "前へ" : "次へ"));
        const prefix = chapter.number !== "" ? `${chapter.number}. ` : "";
        link.append(el("span", "pager-title", prefix + chapter.title));
        return link;
    };

    const prev = available[index - 1];
    const next = available[index + 1];
    container.append(prev ? makeLink(prev, "prev") : el("span"));
    container.append(next ? makeLink(next, "next") : el("span"));
}

function buildPageToc(container: HTMLElement, article: HTMLElement): void {
    const headings = Array.from(article.querySelectorAll<HTMLElement>("h2, h3"));
    if (headings.length < 2) {
        container.closest("aside")?.setAttribute("hidden", "");
        return;
    }

    container.append(el("p", "page-toc-title", "このページ"));
    const list = el("ol", "page-toc-list");

    headings.forEach((heading, i) => {
        if (heading.id === "") {
            heading.id = `sec-${i + 1}`;
        }
        const item = el("li", heading.tagName === "H3" ? "toc-sub" : "toc-main");
        const link = el("a", undefined, heading.textContent ?? "");
        link.href = `#${heading.id}`;
        item.append(link);
        list.append(item);
    });

    container.append(list);
}

function setupNavToggle(): void {
    const button = document.getElementById("nav-toggle");
    const nav = document.getElementById("route-nav");
    if (button === null || nav === null) {
        return;
    }

    const setOpen = (open: boolean): void => {
        document.body.classList.toggle("nav-open", open);
        button.setAttribute("aria-expanded", String(open));
    };

    button.addEventListener("click", () => {
        setOpen(!document.body.classList.contains("nav-open"));
    });
    nav.addEventListener("click", (event) => {
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

function setupCodeCopy(): void {
    document.querySelectorAll<HTMLElement>("figure.code").forEach((figure) => {
        const code = figure.querySelector("code");
        const caption = figure.querySelector("figcaption");
        if (code === null || caption === null || !navigator.clipboard) {
            return;
        }
        const button = el("button", "copy-button", "コピー");
        button.type = "button";
        button.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(code.textContent ?? "");
                button.textContent = "コピーしました";
            } catch {
                button.textContent = "コピーできませんでした";
            }
            window.setTimeout(() => {
                button.textContent = "コピー";
            }, 2000);
        });
        caption.append(button);
    });
}

function main(): void {
    const routeNav = document.getElementById("route-nav");
    if (routeNav !== null) {
        buildRouteNav(routeNav, false);
    }

    const indexRoute = document.getElementById("index-route");
    if (indexRoute !== null) {
        buildRouteNav(indexRoute, true);
    }

    const pager = document.getElementById("pager");
    if (pager !== null) {
        buildPager(pager);
    }

    const toc = document.getElementById("page-toc");
    const article = document.querySelector<HTMLElement>("article");
    if (toc !== null && article !== null) {
        buildPageToc(toc, article);
    }

    highlightAll();
    setupCodeCopy();
    setupNavToggle();
}

main();
