//ほぼAIによるコード
//2025/7/3 構造見直し・バグ修正
//2025/7/5 再度構造見直し・スクロールアニメ追加
//2025/7/6 SNS画面を閉じているとき・開いたときの挙動を変更
//2025/7/27 1枚のスプライトとして表示するよう変更
/*:
 * @target MZ
 * @plugindesc SNS風画面
 * @author 
 * @base PluginCommonBase
 * @orderAfter PluginCommonBase
 * 
 * @param snsWidth
 * @text SNS画面幅
 * @type number
 * @default 600
 *
 * @param snsHeight
 * @text SNS画面高さ
 * @type number
 * @default 600
 * 
 * @param iconSize
 * @text アイコンサイズ
 * @type number
 * @default 48
 * @desc ユーザーアイコンの表示サイズ（ピクセル単位）
 * アイコン画像はこのサイズに縮小or拡大されて表示されます。
 * 
 * @param showSelfIcon
 * @text 自分のアイコンを表示
 * @type boolean
 * @default true
 * @desc 自分の発言にアイコンと名前を表示するかどうか。

 * @param showReadSwitch
 * @text 自分の既読を表示
 * @type boolean
 * @default true
 * @desc 自分の発言に既読を表示するかどうか。
 * 
 * @param selfPosition
 * @text 自分の表示位置
 * @type select
 * @option 左
 * @value left
 * @option 右
 * @value right
 * @default right
 * @desc 自分の発言ウィンドウを左または右に配置します。

 * @param otherPosition
 * @text 相手の表示位置
 * @type select
 * @option 左
 * @value left
 * @option 右
 * @value right
 * @default left
 * @desc 相手の発言ウィンドウを左または右に配置します。

 * @param selfWindowSkin
 * @text 自分のウィンドウスキン
 * @type file
 * @dir img/system
 * @default Window
 * @desc 自分の発言ウィンドウのスキン画像。

 * @param otherWindowSkin
 * @text 相手のウィンドウスキン
 * @type file
 * @dir img/system
 * @default Window
 * @desc 相手の発言ウィンドウのスキン画像。
 * 
 * @param systemWindowSkin
 * @text システム通知のウィンドウスキン
 * @type file
 * @dir img/system
 * @default Window
 * @desc システム通知のウィンドウのスキン画像。
 * 
 * @param windowFrameMargin
 * @text 発言ウィンドウのマージン
 * @default 4
 * @desc システム通知のウィンドウのスキン画像。
 * 角が突き出るなら増やす。
 * 
 * 
 * @param userMessageFont
 * @text ユーザーメッセージのフォント
 * @desc ユーザーが送信するメッセージのフォント設定
 * @type struct<Font>
 * @default {"size":"16","color":"#000000"}
 *
 * @param userNameFont
 * @text ユーザー名のフォント
 * @desc 表示されるユーザー名のフォント設定
 * @type struct<Font>
 * @default {"size":"12","color":"#FFFFFF"}
 *
 * @param timestampFont
 * @text タイムスタンプのフォント
 * @desc メッセージの時間表示のフォント設定
 * @type struct<Font>
 * @default {"size":"12","color":"#FFFFFF"}
 *
 * @param systemMessageFont
 * @text システムメッセージのフォント
 * @desc システムからの通知メッセージのフォント設定
 * @type struct<Font>
 * @default {"size":"14","color":"#FFFFFF"}
 *
 * 
 * @param bufMsgAmount
 * @text ログから読み込む件数
 * @type number
 * @default 10
 * @desc 処理軽減のため一番下の発言から前後の設定件数分の発言のみを
 * 表示します。画面から少しはみ出るくらいが理想です。
 * 
 * @param scrollAnimOffset
 * @text スクロールアニメ開始位置オフセット
 * @type number
 * @default 50
 * @desc アニメ開始位置を何ピクセルずらすか
 * 0ならアニメーションしない
 *
 * @param scrollAnimSpeed
 * @text スクロールアニメ速さ
 * @type number
 * @decimals 2
 * @default 0.15
 * @desc スクロールアニメの速さ（0.05～0.5程度が推奨、値が大きいほど速い）
 *
 * @param bbg
 * @text 仮背景を表示する
 * @type boolean
 * @default true
 * 
 * @command RegisterUser
 * @text ユーザーを登録
 * @desc 発言に使用するユーザー情報を登録します。
 *
 * @arg userId
 * @text ユーザーID
 * @desc ユーザーを識別する一意のIDです。
 *
 * @arg userName
 * @text ユーザー名
 * @desc 表示されるユーザー名です。
 *
 * @arg iconImage
 * @text アイコン画像
 * @type file
 * @dir img/pictures
 * @desc ユーザーのアイコン画像です。
 * 
 * @command SetSelfUserId
 * @text 自分のユーザーIDを設定
 * @desc SNSで自分として扱うユーザーIDを設定します。
 * @arg userId
 * @text ユーザーID
 * @desc 自分として扱うユーザーID
 * 
 * @command AddMessage
 * @text 発言を追加
 * @desc SNSログに新しい発言を追加します。
 * ユーザーIDを-1にするとシステムメッセージになります。
 *
 * @arg userId
 * @text ユーザーID
 * @desc 発言者のユーザーIDです。
 * -1はシステムメッセージとして扱われ特殊な表示になります。
 * 
 * @arg content
 * @text 内容
 * @desc 発言の内容。
 * @type multiline_string
 * 
 * @arg timestamp
 * @text タイムスタンプ
 * @desc 発言に表示する任意の文字列（例: "10:30" や "6月29日" など）。
 * 
 * @arg isRead
 * @text 既読
 * @type boolean
 * @default false
 * @desc この発言が既読かどうか。trueなら既読、falseなら未読。
 * 
 * @command AddImage
 * @text 画像を追加
 * @desc SNSログに新しい画像を追加します。
 *
 * @arg userId
 * @text ユーザーID
 * @desc 発言者のユーザーIDです。
 * 
 * @arg content
 * @text 画像
 * @desc 追加する画像。
 * @type file
 * @dir img/pictures/
 * 
 * @arg timestamp
 * @text タイムスタンプ
 * @desc 発言に表示する任意の文字列（例: "10:30" や "6月29日" など）。
 * 
 * @arg isRead
 * @text 既読
 * @type boolean
 * @default false
 * @desc この発言が既読かどうか。trueなら既読、falseなら未読。
 *
 * @command ShowSNS
 * @text SNS画面表示
 * @desc SNS画面を表示します。
 * @arg x
 * @text 表示原点X
 * @type number
 * @default 0
 * @arg y
 * @text 表示原点Y
 * @type number
 * @default 0
 *
 * @command HideSNS
 * @text SNS画面非表示
 * @desc SNS画面を閉じます。

 * @command SNSLogVariable
 * @text SNSログ変数操作
 * @desc SNSログとユーザー情報を変数に保存または変数から復元します。
 * @arg mode
 * @type select
 * @option save
 * @option load
 * @text モード
 * @desc save: 変数に保存 / load: 変数から復元
 * @arg variableId
 * @type variable
 * @text 変数ID
 * @desc 保存先または読み込み元の変数ID
 * 
 * @command ClearSNSLog
 * @text SNSログを初期化
 * @desc SNSログとユーザー情報をすべて初期化し、SNS画面を初期化します。
 * @arg clearUsers
 * @type boolean
 * @default true
 * @text ユーザー情報も初期化
 * @desc trueの場合、ユーザー情報も消去します。falseならログのみ初期化します。
 * 
 * @command ForceRefreshSNS
 * @text SNS画面強制リフレッシュ
 * @desc 表示中のSNS画面を再描画します。
 * 
 * @command MarkAllSelfMessagesRead
 * @text 自分の発言を全て既読に
 * @desc ログ内の自分の発言をすべて既読にし、SNS画面を再描画します。
 * 
 * @command EditMessage
 * @text 発言を編集
 * @desc 指定したログ番号の発言内容を上書きします。
 * 無記入の項目は変更しません。
 * @arg index
 * @type number
 * @text ログ番号
 * @desc 編集したい発言のログ配列番号（0から）
 * 
 * @arg userId
 * @text ユーザーID
 * @desc 発言者のユーザーIDです。
 * 無記入の場合変更しません。
 * 
 * @arg type
 * @text 種別
 * @type select
 * @option テキスト
 * @value text
 * @option 画像
 * @value image
 * @desc 発言の種別です。
 * 無記入の場合変更しません。

 * @arg content
 * @text 内容（テキスト or 画像名）
 * @desc 発言の内容。画像の場合はファイル名（拡張子不要）。
 * 無記入の場合変更しません。
 * @type multiline_string

 * @arg timestamp
 * @text タイムスタンプ
 * @desc 発言に表示する任意の文字列（例: "10:30" や "6月29日" など）。
 * 無記入の場合変更しません。

 * @arg isRead
 * @text 既読
 * @type boolean
 * @desc この発言が既読かどうか。trueなら既読、falseなら未読。
 * 無記入の場合変更しません。
 * 
 * @command SNSPrevTarget
 * @text 表示中の発言を遡る
 * @desc 過去の発言を見返します。
 * SNS画面を開いているときのみ有効です。
 * @arg amount
 * @type number
 * @default 1
 * @desc 戻す量
 *
 * @command SNSNextTarget
 * @text 表示中の発言を進める
 * @desc より新しい発言を表示します。
 * SNS画面を開いているときのみ有効です。
 * @arg amount
 * @type number
 * @default 1
 * @desc 進める量
 * @help
 * SNS風なメッセージ表示
 * 
 * 1.ユーザー登録コマンドで名前とアイコンを登録
 * 2.自分設定コマンドで自分として扱うユーザーを設定（デフォルトはID0）
 * 3.発言コマンドでメッセージを送信
 * 4.SNS画面表示コマンドで画面を表示する
 * 　背景はピクチャの表示併用でなんとか
 * 
 * 応用編
 * ・自分の発言に既読を付けて既読スルー・通知スルー
 * ・ユーザーID:-1 はシステムメッセージ　「--が入室しました」「--が退室しました」とか入れよう
 * ・直前のメッセージを発言取り消しシステムメッセージに書き変えて「送る相手間違えちゃった☆」な演出（送信画像でも可）
 * ・ユーザー登録コマンドで既存のユーザー情報を書き変えて「あいついつの間にかアイコン変わってる・ユーザー名も変わってる」
 * 
 * お役立ち情報
 * ・SNS画面を開いていて最新の発言を表示している状態で発言が追加されると
 * 　自動でSNS画面を更新して最新までスクロールする
 * 　閉じている状態で発言が追加されると現在位置が最新のものではなくなり、
 * 　自動スクロールが機能しなくなる
 * 　SNS画面を開くときには発言を進めるコマンド+99を併用がおすすめ
 * 　
 * ・$gameSystem._snsLog.length - 1
 * 　　└最後の発言の番号
 * ・SceneManager._scene._sns._targetIsLatest
 * 　　└現在ターゲットが最新の発言のときONになるフラグ
 * 
 * 
 * 
 * 
 */
/*~struct~Font:
 * @param size
 * @text サイズ
 * @desc フォントサイズ（数値）
 * @type number
 * @default 12
 *
 * @param color
 * @text 色
 * @desc フォントの色（"#RRGGBB"形式）
 * @type string
 * @default #ffffff
*/
var SNSBackgroundOpacity = 0;
(() => {
    const snsDebug = false;
    const PLUGIN = "SNSMessenger";
    const params = PluginManager.parameters(PLUGIN);
    const proiconsize = Number(params.iconSize) || 48;
    const selfWindowSkin = params.selfWindowSkin || "Window";
    const otherWindowSkin = params.otherWindowSkin || "Window";
    const systemWindowSkin = params.systemWindowSkin || "Window";
    const windowFrameMargin = Number(params.windowFrameMargin) || 4;
    const userMessageFont = parseFontParam(params.userMessageFont) || { "size": 16, "color": "#000000" };
    const userNameFont = parseFontParam(params.userNameFont) || { "size": 12, "color": "#FFFFFF" };
    const timestampFont = parseFontParam(params.timestampFont) || { "size": 12, "color": "#FFFFFF" };
    const systemMessageFont = parseFontParam(params.systemMessageFont) || { "size": 16, "color": "#FFFFFF" };
    const selfPosition = params.selfPosition || "right";
    const otherPosition = params.otherPosition || "left";
    const bufMsgAmount = Number(params.bufMsgAmount) || 10;
    const scrollAnimOffset = isNaN(Number(params.scrollAnimOffset)) ? 50 : Number(params.scrollAnimOffset);
    const scrollAnimSpeed = Number(params.scrollAnimSpeed) || 0.15;
    const nameHeight = userNameFont.size + 6;
    const cfg = {
        width: +params.snsWidth,
        height: +params.snsHeight,
        showSelfIcon: params.showSelfIcon === "true",
        systemWindowSkin: systemWindowSkin, // 追加
    };
    const SNSManager = {
        getUser(id) { return $gameSystem._users[id] || null; },
        getUsers() {
            return $gameSystem._users || {};
        },
        getLog() {
            return $gameSystem._snsLog || [];
        },
        getSelfId() {
            return $gameSystem._snsSelfId || "0";
        },
        registerUser(id, name, icon) {
            if (!$gameSystem._users) $gameSystem._users = {};
            $gameSystem._users[id] = { id, name, icon };
        },
        addMessage(userId, type, content, timestamp, isRead = false) {
            if (!$gameSystem._snsLog) $gameSystem._snsLog = [];
            $gameSystem._snsLog.push([userId, type, content, timestamp, !!isRead]);
            $gameTemp._snsLogChanged = true;
        },
        setSelf(id) {
            $gameSystem._snsSelfId = id;
        },
        isSelf(userId) {
            return String(userId) === String($gameSystem._snsSelfId);
        },
        markAllSelfMessagesRead() {
            const selfId = this.getSelfId();
            const log = $gameSystem._snsLog || [];
            for (let msg of log) {
                if (String(msg[0]) === String(selfId) && !msg[4]) {
                    msg[4] = true;
                }
            }
        }
    };

    function parseFontParam(param) {
        try {
            const obj = JSON.parse(param);
            obj.size = Number(obj.size) || 12; // 数値化
            return obj;
        } catch {
            return { size: 12, color: "#ffffff" };
        }
    }
    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function () {
        _Game_System_initialize.call(this);
        this._users = {};
        this._snsLog = [];
        this._snsSelfId = "0";
        this._snsTargetMsgIndex = 0;
        this._snsLastTargetIndex = 0;
        this._targetIsLatest = true;
        this._snsConfig = {
            show: false,
            x: 0,
            y: 0,
            bg: "",
            _inited: false
        };
    };
    Game_System.prototype.setSNSConfig = function (config) {
        this._snsConfig = Object.assign({}, config);
    };

    Game_System.prototype.getSNSConfig = function () {
        return this._snsConfig || { show: false };
    };
    PluginManagerEx.registerCommand(document.currentScript, "RegisterUser", args => {
        const id = args.userId;
        const name = args.userName;
        const icon = args.iconImage;
        SNSManager.registerUser(id, name, icon);
    });
    PluginManagerEx.registerCommand(document.currentScript, "SetSelfUserId", args => {
        SNSManager.setSelf(args.userId);
    });

    PluginManagerEx.registerCommand(document.currentScript, "AddMessage", args => {
        const userId = args.userId;
        const type = "text";
        const content = args.content;
        const timestamp = args.timestamp || "";
        const isRead = args.isRead === "true";
        SNSManager.addMessage(userId, type, content, timestamp, isRead);
        if (!SceneManager._scene._sns.visible) $gameSystem._targetIsLatest = false;
    });

    PluginManagerEx.registerCommand(document.currentScript, "AddImage", args => {
        const userId = args.userId;
        const type = "image";
        const content = args.content;
        const timestamp = args.timestamp || "";
        const isRead = args.isRead === "true";
        SNSManager.addMessage(userId, type, content, timestamp, isRead);
        if (!SceneManager._scene._sns.visible) $gameSystem._targetIsLatest = false;
    });


    PluginManagerEx.registerCommand(document.currentScript, "ShowSNS", args => {
        const config = {
            show: true,
            x: +args.x,
            y: +args.y,
        };
        $gameSystem.setSNSConfig(config);
        // $gameTemp._snsLogChanged = true; // 表示もトリガー
    });
    PluginManagerEx.registerCommand(document.currentScript, "HideSNS", () => {
        const config = $gameSystem.getSNSConfig();
        config.show = false;
        $gameSystem.setSNSConfig(config);
    });

    PluginManagerEx.registerCommand(document.currentScript, "ClearSNSLog", args => {
        const clearUsers = args && args.clearUsers === "true";
        if (clearUsers) {
            $gameSystem._users = {};
            $gameSystem._snsSelfId = "0";
        }
        $gameSystem._snsLog = [];
        $gameSystem._snsTargetMsgIndex = 0;
        $gameSystem._snsLastTargetIndex = 0;
        $gameSystem._targetIsLatest = true;
        $gameTemp._snsLogChanged = true;
        //ログが初期状態だとリフレッシュ時更新を行わないためここで初期化処理
        if (SceneManager._scene && SceneManager._scene._sns) {
            const config = $gameSystem.getSNSConfig();
            SceneManager._scene._sns._init(config);
        }
    });
    PluginManagerEx.registerCommand(document.currentScript, "ForceRefreshSNS", () => {
        if (SceneManager._scene && SceneManager._scene._sns) {
            SceneManager._scene._sns._refreshMessages();
        }
    });
    PluginManagerEx.registerCommand(document.currentScript, "SNSLogVariable", args => {
        const mode = args.mode;
        const variableId = Number(args.variableId);
        if (variableId > 0) {
            if (mode === "save") {
                const data = {
                    users: $gameSystem._users || {},
                    log: $gameSystem._snsLog || [],
                    selfId: $gameSystem._snsSelfId || "0"
                };
                $gameVariables.setValue(variableId, JsonEx.makeDeepCopy(data));
            } else if (mode === "load") {
                const data = $gameVariables.value(variableId);
                if (data && typeof data === "object") {
                    $gameSystem._users = JsonEx.makeDeepCopy(data.users || {});
                    $gameSystem._snsLog = JsonEx.makeDeepCopy(data.log || []);
                    $gameSystem._snsSelfId = data.selfId || "0";
                    $gameSystem._snsTargetMsgIndex = $gameSystem._snsLog;
                    $gameTemp._snsLogChanged = true;
                }
            }
        }
    });

    PluginManagerEx.registerCommand(document.currentScript, "MarkAllSelfMessagesRead", () => {
        SNSManager.markAllSelfMessagesRead();
        // SNS画面表示中なら即時リフレッシュ
        if (SceneManager._scene && SceneManager._scene._sns.visible) {
            SceneManager._scene._sns._refreshMessages();
        }
    });

    PluginManagerEx.registerCommand(document.currentScript, "EditMessage", args => {
        const index = Number(args.index);
        if ($gameSystem._snsLog && $gameSystem._snsLog[index]) {
            // userId
            if (args.userId !== "") {
                $gameSystem._snsLog[index][0] = args.userId;
            }
            // type
            if (args.type !== "") {
                $gameSystem._snsLog[index][1] = args.type;
            }
            // content
            if (args.content !== "") {
                $gameSystem._snsLog[index][2] = args.content;
            }
            // timestamp
            if (args.timestamp !== "") {
                $gameSystem._snsLog[index][3] = args.timestamp;
            }
            // isRead
            if (args.isRead !== "") {
                $gameSystem._snsLog[index][4] = (args.isRead === "true");
            }
            $gameTemp._snsLogChanged = true;
        }
    });
    PluginManagerEx.registerCommand(document.currentScript, "SNSPrevTarget", args => {
        // 指定量だけターゲットインデックスを戻す
        const amount = Number(args.amount) || 1;
        const log = $gameSystem._snsLog || [];
        if (SceneManager._scene && SceneManager._scene._sns && $gameSystem.getSNSConfig().show) {
            $gameSystem._snsTargetMsgIndex = Math.max(0, ($gameSystem._snsTargetMsgIndex || 1) - amount);
            SceneManager._scene._sns._refreshMessages();
        }
    });

    PluginManagerEx.registerCommand(document.currentScript, "SNSNextTarget", args => {
        // 指定量だけターゲットインデックスを進める
        const amount = Number(args.amount) || 1;
        const log = $gameSystem._snsLog || [];
        if (SceneManager._scene && SceneManager._scene._sns && $gameSystem.getSNSConfig().show) {
            $gameSystem._snsTargetMsgIndex = Math.min(Math.max(log.length - 1, 0), ($gameSystem._snsTargetMsgIndex || 1) + amount);
            SceneManager._scene._sns._refreshMessages();
        }
    });
    // MAPシーン拡張：レイヤ追加
    const _spMap_load = Scene_Map.prototype.createSpriteset;
    Scene_Map.prototype.createSpriteset = function () {
        _spMap_load.call(this);
        this._sns = new SNSLayer();
        this.addChild(this._sns);
        const log = SNSManager.getLog();
        const targetIndex = $gameSystem._snsTargetMsgIndex ?? (log.length - 1);
        $gameSystem._targetIsLatest = (targetIndex === Math.max(log.length - 1, 0));

        // 復元
        const config = $gameSystem.getSNSConfig();
        this._sns._init(config);
        if (config?.show) {
            this._sns.visible = true;
        }
    };

    // SNSオーバーレイクラス
    class SNSLayer extends Sprite {
        constructor() {
            super();
            this.visible = false;
            this._msgSprites = [];
            this._loading = false;
            this._lastMsgCount = 0;
            this._targetMsgIndex = 1;
            this._topY = 10;
            this._bottomY = 0;
            this._scrollTargetY = 0;
            this._scrollSpeed = scrollAnimSpeed; // 少し速め
            this._pendingScroll = false; // アニメーション開始フラグ
            this._renderedSprite = null; // 追加: 初期化
        }
        update() {
            super.update();
            const st = $gameSystem.getSNSConfig();
            if (st.show) {
                if (!this._inited) { this._init(st); }
                this.visible = true;
            } else if (!st.show && this.visible) {
                this.visible = false;
            }
            if (this.visible) {
                const log = SNSManager.getLog();
                if ($gameTemp._snsLogChanged && $gameSystem._targetIsLatest) {
                    $gameSystem._snsTargetMsgIndex = Math.max(log.length - 1, 0)
                    this._refreshMessages()
                    $gameTemp._snsLogChanged = false;
                }
                const targetIndex = $gameSystem._snsTargetMsgIndex ?? (log.length - 1);
                $gameSystem._targetIsLatest = (targetIndex === Math.max(log.length - 1, 0));
                // スクロールアニメーション
                if (this._msgContainer) {
                    if (this._pendingScroll) {
                        // イージング
                        if (Math.abs(this._renderedSprite.y - this._scrollTargetY) > 1) {
                            this._renderedSprite.y += (this._scrollTargetY - this._renderedSprite.y) * this._scrollSpeed;
                        } else {
                            this._renderedSprite.y = this._scrollTargetY;
                            this._pendingScroll = false;
                        }
                    }
                }
                // デバッグ用ページ送り
                if (snsDebug && this._msgContainer) {
                    const scrollStep = 60;
                    if (Input.isRepeated("pageup")) {
                        this._renderedSprite.y = this._renderedSprite.y + scrollStep;
                    }
                    if (Input.isRepeated("pagedown")) {
                        this._renderedSprite.y = this._renderedSprite.y - scrollStep;
                    }
                    const config = $gameSystem.getSNSConfig();
                    config.scrollY = this._renderedSprite.y;
                    $gameSystem.setSNSConfig(config);
                }
            }
        }

        _init(st) {
            this.x = st.x; this.y = st.y;
            if (params.bbg === "true") {
                // 青で塗りつぶしたBitmapを作成
                const bmp = new Bitmap(cfg.width, cfg.height);
                bmp.fillRect(0, 0, cfg.width, cfg.height, "rgba(130,180,230,1");
                this._bg = new Sprite(bmp);
                this._bg.x = 0; this._bg.y = 0;
                this.addChild(this._bg);
            }
            this._msgContainer = new Sprite();
            // 追加: _renderedSprite生成
            if (!this._renderedSprite) {
                this._renderedSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
                this._renderedSprite.x = 0;
                this._renderedSprite.y = (typeof st.scrollY === "number") ? st.scrollY : 10;
                this._renderedSprite.alpha = 1;
                this.addChild(this._renderedSprite);
            }
            // スクロール目標値も初期化
            this._scrollTargetY = this._renderedSprite.y;

            // メッセージ部分にマスクを設定 
            const mask = new PIXI.Graphics();
            mask.beginFill(0xffffff);
            mask.drawRect(0, 0, cfg.width, cfg.height);
            mask.endFill();
            this._renderedSprite.mask = mask;
            this.addChild(mask);

            this.addChild(this._renderedSprite);
            this._isOver = true;
            this._inited = true;
            this._refreshMessages();
        }

        async _refreshMessages() {
            if (!this._inited) {
                return;
            }
            this._loading = true;
            const log = SNSManager.getLog();
            let targetIndex = ($gameSystem._snsTargetMsgIndex >= 0 && $gameSystem._snsTargetMsgIndex < log.length)
                ? $gameSystem._snsTargetMsgIndex
                : Math.max(log.length - 1, 0);

            // 前回のターゲットインデックスを保存
            const prevTargetIndex = $gameSystem._snsLastTargetIndex ?? targetIndex;
            $gameSystem._snsLastTargetIndex = targetIndex;

            // バッファ用配列
            const bufferSprites = [];
            let y = 0;
            let topY = y;
            let bottomY = y;
            const targetLogEntry = log[targetIndex];
            if (!targetLogEntry ?? true) { return; }
            const targetUser = SNSManager.getUser(targetLogEntry[0]);
            const targetIsSelf = SNSManager.isSelf(targetLogEntry[0]);
            const targetSpr = new SNSMessageWindow(targetUser, targetLogEntry, targetIsSelf, cfg.width);
            await targetSpr.iconLoadPromise;
            targetSpr.y = y;
            bufferSprites.push(targetSpr);
            topY = y;
            bottomY = y + targetSpr._height + 10;
            let lastHeight = 0;
            // 上方向（ターゲットより前）
            for (let i = targetIndex - 1; i >= Math.max(0, targetIndex - bufMsgAmount); i--) {
                const logEntry = log[i];
                const user = SNSManager.getUser(logEntry[0]);
                const isSelf = SNSManager.isSelf(logEntry[0]);
                const spr = new SNSMessageWindow(user, logEntry, isSelf, cfg.width);
                await spr.iconLoadPromise;
                spr.y = topY - spr._height - 10;
                bufferSprites.unshift(spr); // 上に積む
                topY = spr.y;
            }
            // 下方向（ターゲットより後）
            for (let i = targetIndex + 1; i < Math.min(log.length, targetIndex + bufMsgAmount); i++) {
                const logEntry = log[i];
                const user = SNSManager.getUser(logEntry[0]);
                const isSelf = SNSManager.isSelf(logEntry[0]);
                const spr = new SNSMessageWindow(user, logEntry, isSelf, cfg.width);
                await spr.iconLoadPromise;
                spr.y = bottomY;
                bufferSprites.push(spr); // 下に積む
                bottomY = spr.y + spr._height + 10;
            }

            // 既存をクリアしてバッファ内容を差し替え
            this._msgContainer.removeChildren();
            for (const spr of bufferSprites) {
                this._msgContainer.addChild(spr);
            }
            this._msgSprites = bufferSprites;
            this._topY = topY;
            this._bottomY = bottomY;

            // --- ここからレンダーテクスチャ化 ---
            // すべてのアイコンロード完了まで待つ
            await Promise.all(bufferSprites.map(spr => spr.iconLoadPromise));

            this._msgContainer.visible = true;

            // ★ここでy座標を調整
            this._msgContainer.y = -topY;

            // レンダーテクスチャ作成
            const renderer = Graphics.app.renderer || PIXI.autoDetectRenderer();
            const renderTexture = PIXI.RenderTexture.create({ width: cfg.width, height: cfg.height *3});
            renderer.render(this._msgContainer, renderTexture);

            // スプライトのテクスチャのみ差し替え
            if (this._renderedSprite) {
                this._renderedSprite.texture = renderTexture;
            }

            // _msgContainer自体は非表示に
            this._msgContainer.y = 0; // 元に戻す
            this._msgContainer.visible = false;

            // スクロール位置調整
            const newTargetY = Math.min(-topY, cfg.height - targetSpr._height)+topY;

            // 方向判定
            let direction = 0;
            if (targetIndex > prevTargetIndex) direction = 1; // 次へ（下方向）
            else if (targetIndex < prevTargetIndex) direction = -1; // 前へ（上方向）

            // 50px分ずらした位置からアニメーション開始
            if (direction !== 0 && scrollAnimOffset - this._topY > cfg.height) {
                this._renderedSprite.y = newTargetY + direction * scrollAnimOffset;
                this._scrollTargetY = newTargetY;
                this._pendingScroll = true;
            } else {
                // 初回や同じ位置なら即座に
                this._renderedSprite.y = newTargetY;
                this._scrollTargetY = newTargetY;
                this._pendingScroll = false;
            }

            this._loading = false;
        }

    }

    class SNSMessageWindowFrame extends Sprite {
        constructor(skinBitmap, width, height) {
            super();
            this.skinBitmap = skinBitmap;
            this._width = width;
            this._height = height;
            this._createWindow_Frame();
        }
        _createWindow_Frame() {
            this._createFrameSprite();
            this._createBackSprite();
            this._refreshBack();
            this._refreshFram();
        }
        _createBackSprite() {
            this._backSprite = new Sprite();
            this._backSprite.addChild(new TilingSprite());
            this.addChild(this._backSprite);
        };
        _createFrameSprite() {
            this._frameSprite = new Sprite();
            for (let i = 0; i < 8; i++) {
                this._frameSprite.addChild(new Sprite());
            }
            this.addChild(this._frameSprite);
        };

        _refreshBack() {
            // Window.prototype._refreshBack を参考
            const m = windowFrameMargin;
            const w = Math.max(0, this._width - m * 2);
            const h = Math.max(0, this._height - m * 2);
            const sprite = this._backSprite;
            const tilingSprite = sprite.children[0];
            sprite.bitmap = this.skinBitmap;
            sprite.setFrame(0, 0, 95, 95);
            sprite.move(m, m);
            sprite.scale.x = w / 95;
            sprite.scale.y = h / 95;
            tilingSprite.bitmap = this.skinBitmap;
            tilingSprite.setFrame(0, 96, 96, 96);
            tilingSprite.move(0, 0, w, h);
            tilingSprite.scale.x = 1 / sprite.scale.x;
            tilingSprite.scale.y = 1 / sprite.scale.y;
            sprite.setColorTone([0, 0, 0, 0]);
        }

        _refreshFram() {
            // Windowクラスの枠描画処理を流用
            const drect = { x: 0, y: 0, width: this._width, height: this._height };
            const srect = { x: 96, y: 0, width: 96, height: 96 };
            const m = 24;
            const children = this._frameSprite.children;
            for (const child of children) {
                child.bitmap = this.skinBitmap;
            }
            this._setRectPartsGeometry(this._frameSprite, srect, drect, m);
        }

        _setRectPartsGeometry(sprite, srect, drect, m) {
            // Window.prototype._setRectPartsGeometryの内容をそのまま
            const sx = srect.x;
            const sy = srect.y;
            const sw = srect.width;
            const sh = srect.height;
            const dx = drect.x;
            const dy = drect.y;
            const dw = drect.width;
            const dh = drect.height;
            const smw = sw - m * 2;
            const smh = sh - m * 2;
            const dmw = dw - m * 2;
            const dmh = dh - m * 2;
            const children = sprite.children;
            sprite.setFrame(0, 0, dw, dh);
            sprite.move(dx, dy);
            // corner
            children[0].setFrame(sx, sy, m, m);
            children[1].setFrame(sx + sw - m, sy, m, m);
            children[2].setFrame(sx, sy + sw - m, m, m);
            children[3].setFrame(sx + sw - m, sy + sw - m, m, m);
            children[0].move(0, 0);
            children[1].move(dw - m, 0);
            children[2].move(0, dh - m);
            children[3].move(dw - m, dh - m);
            // edge
            children[4].move(m, 0);
            children[5].move(m, dh - m);
            children[6].move(0, m);
            children[7].move(dw - m, m);
            children[4].setFrame(sx + m, sy, smw, m);
            children[5].setFrame(sx + m, sy + sw - m, smw, m);
            children[6].setFrame(sx, sy + m, m, smh);
            children[7].setFrame(sx + sw - m, sy + m, m, smh);
            children[4].scale.x = dmw / smw;
            children[5].scale.x = dmw / smw;
            children[6].scale.y = dmh / smh;
            children[7].scale.y = dmh / smh;
            // center（今回は使わないので省略可）
            for (const child of children) {
                child.visible = dw > 0 && dh > 0;
            }
        }
    }
    // メッセージウィンドウ（フキダシ）
    class SNSMessageWindow extends Sprite {
        constructor(user, data, isSelf, maxW) {
            super();
            this.user = user; this.data = data;
            this.isSelf = isSelf;
            this._maxW = maxW * 0.7;
            this._systemNotice = String(data[0]) === "-1"; // システム通知判定
            this._side = isSelf ? selfPosition : otherPosition;
            this.iconLoadPromise = this._createWindow();
        }
        async _createWindow() {
            const type = this.data[1];
            const isRightSide = this._side === "right";
            const showIcon = !(this.isSelf && !cfg.showSelfIcon);
            const showName = showIcon;
            const leftMargin = showIcon ? (isRightSide ? 0 : proiconsize + 8) : 0;

            // フレーム・テキスト表示（システム通知・テキストの場合）
            if (this._systemNotice || type === "text") {
                const skinBitmap = ImageManager.loadSystem(this._systemNotice ? cfg.systemWindowSkin : (this.isSelf ? selfWindowSkin : otherWindowSkin));
                const txt = this.data[2];
                const lines = txt.split('\n');
                const fontSize = this._systemNotice ? systemMessageFont.size : userMessageFont.size;
                const fontColor = this._systemNotice ? systemMessageFont.color : userMessageFont.color;
                const lineCount = lines.length;
                const textH = lineCount * (fontSize + 8);
                this._width = cfg.width;
                this._height = textH + 20 + (this._systemNotice ? 0 : nameHeight);

                // テキスト
                const bmp = new Bitmap(this._width - 30, textH + 20 + nameHeight);
                bmp.fontSize = fontSize;
                bmp.textColor = fontColor;
                bmp.outlineWidth = 0;
                let maxLineWidth = 0;
                for (let i = 0; i < lineCount; i++) {
                    const w = bmp.measureTextWidth(lines[i]);
                    if (w > maxLineWidth) maxLineWidth = w;
                }
                this._width = Math.min(this._maxW, Math.ceil(maxLineWidth) + 40);
                for (let i = 0; i < lineCount; i++) {
                    bmp.drawText(lines[i], 0, i * (fontSize + 8) + 4, (maxLineWidth), fontSize, this._systemNotice ? "center" : "left");
                }

                const txtSpr = new Sprite(bmp);
                txtSpr.x = leftMargin + 15;
                txtSpr.y = this._systemNotice ? 10 : (showName ? nameHeight : 0) + 10;
                //枠にテキストを重ねるためaddChild（テキスト表示）は後

                //メッセージ枠
                const frameSize = maxLineWidth + 24 + 8;
                await new Promise(resolve => {
                    skinBitmap.addLoadListener(() => {
                        this.WindowFrame = new SNSMessageWindowFrame(skinBitmap, frameSize, textH + 24);
                        this.addChild(this.WindowFrame);
                        resolve();
                    });
                });
                this.WindowFrame.x = leftMargin;
                this.WindowFrame.y = this._systemNotice ? 0 : (showName ? nameHeight : 0);

                this.addChild(txtSpr);//テキスト表示

                //システム通知は位置を中央にして終了
                if (this._systemNotice) {
                    this._width = this.WindowFrame._width + leftMargin * 2;//整形
                    this.x = Math.ceil((cfg.width - this._width) / 2);
                    this.iconLoadPromise = Promise.resolve();
                    return this.iconLoadPromise;
                }
            }

            //テキストと画像が合流
            let nameSprite = null;
            const timestamp = this.data[3];
            let imgMargin = 0;
            // 名前表示用
            if (showName && this.user && this.user.name) {
                const nameFontSize = userNameFont.size;
                const nameFontColor = userNameFont.color;
                const nameBmp = new Bitmap(this._maxW, nameFontSize + 6);
                nameBmp.fontSize = nameFontSize;
                nameBmp.textColor = nameFontColor;
                nameBmp.outlineWidth = 0;
                nameBmp.drawText(this.user.name, 0, 0, this._maxW, nameFontSize + 6, this._side);
                nameSprite = new Sprite(nameBmp);
                // アイコンの上端と名前の上端をproiconsizeで揃える
                nameSprite.x = showIcon ? (isRightSide ? 0 : proiconsize + 4) : 0;
                nameSprite.y = 0;
                this.addChild(nameSprite);
            }
            // アイコン
            if (showIcon) {
                const icon = new Sprite(ImageManager.loadPicture(this.user.icon));
                icon.scale.x = icon.scale.y = proiconsize / icon.bitmap.height;
                this.addChild(icon);

                this.iconLoadPromise = new Promise(resolve => {
                    icon.bitmap.addLoadListener(() => {
                        icon.x = isRightSide ? this._width + 8 : 0;
                        icon.y = 0;
                        icon.scale.x = icon.scale.y = proiconsize / icon.bitmap.height;
                        this.x = isRightSide
                            ? (cfg.width - this._width - proiconsize - 18)
                            : 10;
                        if (nameSprite) {
                            nameSprite.x = icon.x + (isRightSide ? -nameSprite.width - 5 : proiconsize + 5);
                            nameSprite.y = icon.y;
                        }
                        resolve();
                    });
                });
            } else {
                // アイコン非表示時の位置調整
                this.x = isRightSide
                    ? (cfg.width - this._width - 10)
                    : 10;
                if (nameSprite) {
                    nameSprite.x = 0;
                    nameSprite.y = 0;
                }
            }
            //画像の分岐
            if (type === "image") {
                // 画像発言
                const imgName = this.data[2];
                const bmp = ImageManager.loadPicture(imgName);
                await new Promise(resolve => bmp.addLoadListener(resolve));
                this._width = Math.min(this._maxW, bmp.width);
                this._height = bmp.height + nameHeight;//+ 30 ;

                // 画像本体
                const imgSpr = new Sprite(bmp);
                if (isRightSide) {
                    imgSpr.x = bmp.width - cfg.width - proiconsize - 8;
                    imgMargin = bmp.width;
                } else {
                    imgSpr.x = leftMargin;
                }

                imgSpr.y = nameHeight;
                this.addChild(imgSpr);
            }

            // タイムスタンプ
            if (timestamp) {
                const stampFontSize = timestampFont.size || 12;
                const stampFontColor = timestampFont.color || "#999";
                const stamp = new Bitmap(this._width, stampFontSize + 6);
                stamp.fontSize = stampFontSize;
                stamp.textColor = stampFontColor;
                stamp.outlineWidth = 0;
                stamp.drawText(timestamp, 0, 0, this._width - 10, stampFontSize + 6, this._side);
                const stSpr = new Sprite(stamp);
                stSpr.x = isRightSide ? 5 - this._width - imgMargin : this._width + leftMargin + 5;
                stSpr.y = this._height - (stampFontSize + 4);
                this.addChild(stSpr);

                // 既読表示
                if (this.isSelf && this.data[4]) {
                    const readBmp = new Bitmap(this._width, stampFontSize + 6);
                    readBmp.fontSize = stampFontSize;
                    readBmp.textColor = stampFontColor;
                    readBmp.outlineWidth = 0;
                    readBmp.drawText("既読", 0, 0, this._width - 10, stampFontSize + 6, this._side);
                    const readSpr = new Sprite(readBmp);
                    readSpr.x = stSpr.x;
                    readSpr.y = stSpr.y - (stampFontSize + 6);
                    this.addChild(readSpr);
                }
            }
        }
    }
})();
