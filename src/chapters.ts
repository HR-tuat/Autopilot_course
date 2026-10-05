// 講座の章立て。ナビゲーション・前後リンク・トップページの経路表示はすべてここから生成する。
// 章を追加・並べ替えるときはこのファイルだけを編集する。

/** ready: 公開可能 / draft: 草稿（公開するが内容は未確定） / planned: 準備中（リンクしない） */
export type ChapterStatus = "ready" | "draft" | "planned";

export interface Chapter {
    /** ページの <body data-page="..."> と一致させる */
    id: string;
    /** 表示用の章番号（空文字なら番号なし） */
    number: string;
    title: string;
    summary: string;
    /** サイトのルートからの相対パス */
    href: string;
    status: ChapterStatus;
}

export interface Part {
    /** トップページの見出しに付けるid（ページ内目次のリンク先になる） */
    id: string;
    title: string;
    chapters: Chapter[];
}

export const parts: Part[] = [
    {
        id: "intro",
        title: "導入",
        chapters: [
            {
                id: "00",
                number: "0",
                title: "講座の全体像",
                summary: "自動操縦システムの構成と、各章がどの部分を作るのか。",
                href: "chapters/00-overview.html",
                status: "draft",
            },
            {
                id: "rules",
                number: "",
                title: "大会ルールと要求仕様",
                summary: "統合部門の自動系サブミッションから、フライトコントローラに必要な機能を導く。",
                href: "rules.html",
                status: "draft",
            },
            {
                id: "01",
                number: "1",
                title: "固定翼の飛行力学",
                summary: "舵面の役割、揚力と失速、協調旋回、バンク角と旋回半径。",
                href: "chapters/01-flight-dynamics.html",
                status: "planned",
            },
            {
                id: "02",
                number: "2",
                title: "座標系と姿勢表現",
                summary: "機体座標とNED、オイラー角、回転行列、クォータニオン。",
                href: "chapters/02-attitude.html",
                status: "planned",
            },
            {
                id: "03",
                number: "3",
                title: "制御ループとタイミング",
                summary: "固定周期の実行、dtの計測、割り込み、FreeRTOSのタスク。",
                href: "chapters/03-timing.html",
                status: "planned",
            },
        ],
    },
    {
        id: "io",
        title: "入出力と通信",
        chapters: [
            {
                id: "04",
                number: "4",
                title: "PWM出力：サーボとESC",
                summary: "パルス幅とduty、ESP32のLEDC、サーボ・ESCのクラス化。",
                href: "chapters/04-pwm.html",
                status: "draft",
            },
            {
                id: "05",
                number: "5",
                title: "RC受信機入力・モード切替・発光表示",
                summary: "受信機信号の読み取り、手動と自動の切替、ルールで決められた発光。",
                href: "chapters/05-rc-input.html",
                status: "planned",
            },
            {
                id: "06",
                number: "6",
                title: "I2C・SPI・UART",
                summary: "シリアル通信の仕組み、レジスタの読み書き、センサドライバの設計。",
                href: "chapters/06-serial-bus.html",
                status: "planned",
            },
        ],
    },
    {
        id: "sensing",
        title: "センサと状態推定",
        chapters: [
            {
                id: "07",
                number: "7",
                title: "センサと較正",
                summary: "IMU・気圧・ToF。バイアス、6面較正、取付向きの補正。",
                href: "chapters/07-sensors.html",
                status: "planned",
            },
            {
                id: "08",
                number: "8",
                title: "デジタルフィルタ",
                summary: "サンプリングとエイリアシング、ローパス、Biquad、ノッチ。",
                href: "chapters/08-filters.html",
                status: "planned",
            },
            {
                id: "09",
                number: "9",
                title: "姿勢推定（1）相補フィルタ・Mahony・Madgwick",
                summary: "ジャイロと加速度を組み合わせて姿勢を求める。",
                href: "chapters/09-attitude-filters.html",
                status: "planned",
            },
            {
                id: "10",
                number: "10",
                title: "姿勢推定（2）カルマンフィルタとEKF",
                summary: "高度のカルマンフィルタから始めて、姿勢EKFへ進む。",
                href: "chapters/10-ekf.html",
                status: "planned",
            },
        ],
    },
    {
        id: "control",
        title: "制御",
        chapters: [
            {
                id: "11",
                number: "11",
                title: "PID制御",
                summary: "アンチワインドアップ、微分フィルタ、出力制限、フィードフォワード。",
                href: "chapters/11-pid.html",
                status: "planned",
            },
            {
                id: "12",
                number: "12",
                title: "カスケードPID",
                summary: "角速度ループの外側に角度ループを重ね、高度と旋回の指令へつなぐ。",
                href: "chapters/12-cascade-pid.html",
                status: "planned",
            },
        ],
    },
    {
        id: "autoflight",
        title: "自動飛行",
        chapters: [
            {
                id: "13",
                number: "13",
                title: "旋回誘導：水平旋回・8の字・上昇旋回",
                summary: "旋回量の判定と旋回方向の切替、3mをまたぐ上昇旋回。",
                href: "chapters/13-turn-guidance.html",
                status: "planned",
            },
            {
                id: "14",
                number: "14",
                title: "自動飛行の開始・介入・フェイルセーフ",
                summary: "手動飛行中に自動へ入り、いつでも安全に手動へ戻す。",
                href: "chapters/14-engage-failsafe.html",
                status: "planned",
            },
            {
                id: "15",
                number: "15",
                title: "ログ・テレメトリ・調整",
                summary: "飛行中のデータを記録して読み、ゲインを詰める。",
                href: "chapters/15-logging-tuning.html",
                status: "planned",
            },
        ],
    },
];

export function allChapters(): Chapter[] {
    return parts.flatMap((part) => part.chapters);
}

/**
 * サイドバーとカードの左に出す短いラベル。
 * ../Cpp_course の `label`（「第3回」）にあたるもので、そちらと見た目を揃えている。
 * 数字の章は「第N章」、番号を持たないページは「—」。
 * 数字以外の番号を付けた章は、その文字列をそのまま出す。
 */
export function chapterLabel(chapter: Chapter): string {
    if (chapter.number === "") {
        return "—";
    }
    return /^\d+$/.test(chapter.number) ? `第${chapter.number}章` : chapter.number;
}
