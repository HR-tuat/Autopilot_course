// 依存ライブラリなしの簡易C++ハイライタ。
// <pre><code class="language-cpp"> の中身を字句に分けて <span class="tok-*"> で包む。
// 完全な構文解析ではなく、講座のコード例が読みやすくなる程度を目標にしている。

const KEYWORDS = new Set([
    "alignas", "auto", "break", "case", "class", "const", "constexpr", "continue",
    "default", "delete", "do", "else", "enum", "explicit", "extern", "false", "final",
    "for", "friend", "if", "inline", "namespace", "new", "nullptr", "operator",
    "override", "private", "protected", "public", "return", "sizeof", "static",
    "static_cast", "struct", "switch", "template", "this", "true", "typename",
    "using", "virtual", "volatile", "while",
]);

const TYPES = new Set([
    "void", "bool", "char", "short", "int", "long", "float", "double", "unsigned", "signed",
    "int8_t", "uint8_t", "int16_t", "uint16_t", "int32_t", "uint32_t", "int64_t", "uint64_t",
    "size_t",
]);

type TokenClass = "kw" | "type" | "str" | "com" | "num" | "pre" | "fn" | "const" | null;

interface Token {
    text: string;
    cls: TokenClass;
}

const IDENT = /[A-Za-z_][A-Za-z0-9_]*/y;
const NUMBER = /(?:0[xX][0-9a-fA-F']+|0[bB][01']+|(?:\d[\d']*)?\.?\d[\d']*(?:[eE][+-]?\d+)?)[uUlLfF]*/y;

function isLineStart(src: string, index: number): boolean {
    for (let k = index - 1; k >= 0; k--) {
        const c = src[k];
        if (c === "\n") {
            return true;
        }
        if (c !== " " && c !== "\t") {
            return false;
        }
    }
    return true;
}

function classifyIdent(word: string, src: string, end: number): TokenClass {
    if (KEYWORDS.has(word)) {
        return "kw";
    }
    if (TYPES.has(word)) {
        return "type";
    }
    if (/^[A-Z][A-Z0-9_]+$/.test(word)) {
        return "const";
    }
    if (/^[A-Z][a-z]/.test(word)) {
        return "type";
    }
    const after = src.slice(end).match(/^\s*\(/);
    return after ? "fn" : null;
}

export function tokenizeCpp(src: string): Token[] {
    const tokens: Token[] = [];

    const push = (text: string, cls: TokenClass): void => {
        const last = tokens[tokens.length - 1];
        if (cls === null && last !== undefined && last.cls === null) {
            last.text += text;
            return;
        }
        tokens.push({ text, cls });
    };

    let i = 0;
    while (i < src.length) {
        const c = src[i];

        // コメント
        if (src.startsWith("//", i)) {
            const nl = src.indexOf("\n", i);
            const end = nl === -1 ? src.length : nl;
            push(src.slice(i, end), "com");
            i = end;
            continue;
        }
        if (src.startsWith("/*", i)) {
            const close = src.indexOf("*/", i + 2);
            const end = close === -1 ? src.length : close + 2;
            push(src.slice(i, end), "com");
            i = end;
            continue;
        }

        // プリプロセッサ指令（行末のコメントは別に扱う）
        if (c === "#" && isLineStart(src, i)) {
            const nl = src.indexOf("\n", i);
            let end = nl === -1 ? src.length : nl;
            const comment = src.indexOf("//", i);
            if (comment !== -1 && comment < end) {
                end = comment;
            }
            push(src.slice(i, end), "pre");
            i = end;
            continue;
        }

        // 文字列・文字リテラル
        if (c === "\"" || c === "'") {
            let j = i + 1;
            while (j < src.length && src[j] !== c && src[j] !== "\n") {
                j += src[j] === "\\" ? 2 : 1;
            }
            const end = Math.min(j + 1, src.length);
            push(src.slice(i, end), "str");
            i = end;
            continue;
        }

        // 数値
        if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
            NUMBER.lastIndex = i;
            const m = NUMBER.exec(src);
            if (m !== null && m[0].length > 0) {
                push(m[0], "num");
                i += m[0].length;
                continue;
            }
        }

        // 識別子
        if (/[A-Za-z_]/.test(c)) {
            IDENT.lastIndex = i;
            const m = IDENT.exec(src);
            if (m !== null) {
                const end = i + m[0].length;
                push(m[0], classifyIdent(m[0], src, end));
                i = end;
                continue;
            }
        }

        push(c, null);
        i += 1;
    }

    return tokens;
}

function escapeHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderTokens(tokens: Token[]): string {
    return tokens
        .map((t) => (t.cls === null ? escapeHtml(t.text) : `<span class="tok-${t.cls}">${escapeHtml(t.text)}</span>`))
        .join("");
}

export function highlightAll(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>("pre > code.language-cpp").forEach((code) => {
        const source = code.textContent ?? "";
        code.innerHTML = renderTokens(tokenizeCpp(source));
    });
}
