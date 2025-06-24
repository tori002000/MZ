/*:
 * @target MZ
 * @plugindesc 虚無魔人（5枚目）
 * @author やっつけ
 * @base PluginCommonBase
 * @orderAfter PluginCommonBase
 * @help 
 * 公式プラグインPluginCommonBase.jsと一緒に入れてね
 * 
 * 機能
 * ・戦闘グラフィック、マップスクロール、ウィンドウをUIエリアに収める
 * ・原点座標を指定しUIエリアの表示位置をずらす
 * ・UIエリアサイズを画面サイズに合わせるモード
 * 
 * 備考
 * ・UIエリアの原点はx,yを両方0に設定すれば左上に、
 * 　両方「画面の幅 - UIエリアサイズ」の値に設定すれば右下にずれる
 * 
 * ・UIエリアサイズはデフォルトの816*624、画面の大きさはそれ以上での想定
 * 　あんまり極端に小さいor大きいエリアサイズにしなければ破綻はしないと思う
 * 
 * ・UIエリア外の虚無空間はピクチャとかで隠して
 * 　公式プラグインのExtraImage.jsや
 * 　特定のタイミングでコモンイベント起動するプラグインとかと併用するといいかも
 * 
 * ・各種コマンドは実行した後にマップ切り替えをしたときに適用される
 * 
 * 
 * 更新：
 * ・戦闘シーン中固定機能を追加
 * ・シーン別ウィンドウ設定のタイトル画面設定を、
 * 　タイトル画面でのロード画面、オプションにも適用するよう改善
 * 
 * //4→5の変更点
 * ・なんとなくPluginCommonBase.jsをベースに
 * ・四隅を指定する形式から原点座標を指定する形式に変更
 * ・コマンド、パラメータの仕様変更
 * ・設定の保存に変数を使う形式を廃止
 * ・拡張プラグインの機能を内蔵
 * 
 * 絶対どっかでボロが出るか他プラグインと衝突するけどおこらないでね
 * 
 * 利用について
 * 用途・改変・再配布・権利表示に制限なし
 * 
 * 生まれたばかりのプラグインです。
 * 応援して下さいね☆
 * @url https://www.yahoo.co.jp/
 * 
 * @param x
 * @text X座標
 * @desc UIエリア原点のX座標
 * @default 0
 * @type number
 * 
 * @param y
 * @text Y座標
 * @desc UIエリア原点のY座標
 * @default 0
 * @type number
 * 
 * @param valid
 * @text 起動時ずらし
 * @desc ずらしを有効化した状態で起動します
 * @default true
 * @type boolean
 * 
 * @param maximizationUI
 * @text 起動時UIエリアサイズ最大化
 * @desc UIエリアサイズを画面サイズに合わせた状態で起動します
 * @default false
 * @type boolean
 * 
 * @param SceneWindow
 * @text シーン別ウィンドウ設定
 * @desc ウィンドウをずらすかをシーンごとに設定します
 * @default {"Title":"false","Map":"true","Menu":"true","Battle":"true","Other":"true"}
 * @type struct<Scene>
 * 
 * @param onBattle
 * @text 戦闘シーン中固定
 * @desc 戦闘シーン中はUIエリア原点を指定座標で固定します
 * @default false
 * @type boolean
 * 
 * @param bx
 * @text X座標
 * @desc 戦闘シーン中のUIエリア原点のX座標
 * @default 0
 * @type number
 * @parent onBattle
 * 
 * @param by
 * @text Y座標
 * @desc 戦闘シーン中のUIエリア原点のY座標
 * @default 0
 * @type number
 * @parent onBattle
 * 
 * @command SetOrigin
 * @text 原点変更
 * @desc UIエリアの原点を変更する（マップ切り替えで適用）
 * 
 * @arg　x
 * @text X座標
 * @desc UIエリア原点のX座標
 * @default 
 * 
 * @arg y
 * @text Y座標
 * @desc UIエリア原点のY座標
 * @default 
 * 
 * @command SetValid
 * @text ずらしON/OFF
 * @desc UIエリアずらしの有効/無効を切り替える（マップ切り替えで適用）
 * 
 * @arg SwitchType
 * @text 切り替え
 * @desc ON/OFF/反転
 * @default 
 * @type select
 * @option ON
 * @value ON
 * @option OFF
 * @value OFF
 * @option 反転
 * @value SWITCH
 * 
 * @command maximizationUI
 * @text UIエリア最大化
 * @desc UIエリアサイズを画面サイズに合わせる（マップ切り替えで適用）
 * 
 * @arg SwitchType
 * @text 切り替え
 * @desc ON/OFF/反転
 * @default 
 * @type select
 * @option ON
 * @value ON
 * @option OFF
 * @value OFF
 * @option 反転
 * @value SWITCH
 * 
 * @command SceneWindowSwitch
 * @text シーン別ウィンドウ設定変更
 * @desc ウィンドウをずらすかのシーンごとの設定を変更します
 * @arg scene
 * @text 場面
 * @desc どの場面の設定を切り替えるか
 * @default 
 * @type select
 * @option マップ
 * @value Map
 * @option メニュー
 * @value Menu
 * @option バトル
 * @value Battle
 * 　
 * @arg SwitchType
 * @text 切り替え
 * @desc ON/OFF/反転
 * @default 
 * @type select
 * @option ON
 * @value ON
 * @option OFF
 * @value OFF
 * @option 反転
 * @value SWITCH
*/
/*~struct~Scene:ja
 *
 * @param Title
 * @text タイトル
 * @desc タイトル画面のウィンドウをずらす
 * @type boolean
 * @default true
 * 
 * @param Map
 * @text マップ
 * @desc マップ画面のウィンドウをずらす
 * @type boolean
 * @default true
 * 
 * @param Menu
 * @text メニュー
 * @desc メニュー画面のウィンドウをずらす
 * @type boolean
 * @default true
 * 
 * @param Battle
 * @text バトル
 * @desc バトル画面のウィンドウをずらす
 * @type boolean
 * @default true
 * 
 * @param Other
 * @text その他
 * @desc その他の画面のウィンドウをずらす
 * @type boolean
 * @default true
 */
(() => {
    const param = PluginManagerEx.createParameter(document.currentScript);
    const SceneWindow = { ...param.SceneWindow._parameter };
    const onBattle = param.onBattle;
    const bx = param.bx;
    const by = param.by;

    //画面とUIエリアの初期サイズ設定を取得
    //ついでに初回設定
    var hidariue_width;
    var hidariue_boxWidth;
    var hidariue_height;
    var hidariue_boxHeight;
    const _Scene_Boot_adjustBoxSize = Scene_Boot.prototype.adjustBoxSize;
    Scene_Boot.prototype.adjustBoxSize = function () {
        _Scene_Boot_adjustBoxSize.apply(this, arguments);
        hidariue_width = Graphics.width;
        hidariue_boxWidth = Graphics.boxWidth;
        hidariue_height = Graphics.height;
        hidariue_boxHeight = Graphics.boxHeight;
        $gameSystem._UIx2 = param.x;
        $gameSystem._UIy2 = param.y;
        $gameSystem._valid2 = param.valid;
        $gameSystem._maximizationUI2 = param.maximizationUI;
        reset();
        reload();
        UI_Apply();
    };
    PluginManagerEx.registerCommand(document.currentScript, "SetOrigin", args => {
        $gameSystem._UIx = args.x;
        $gameSystem._UIy = args.y;
    });
    PluginManagerEx.registerCommand(document.currentScript, "SetValid", args => {
        const SwitchType = args.SwitchType;
        if (SwitchType === "ON") $gameSystem._valid = true;
        else if (SwitchType === "OFF") $gameSystem._valid = false;
        else if (SwitchType === "SWITCH") $gameSystem._valid = !$gameSystem._valid;
    });
    PluginManagerEx.registerCommand(document.currentScript, "maximizationUI", args => {
        const SwitchType = args.SwitchType;
        if (SwitchType === "ON") $gameSystem._maximizationUI = true;
        else if (SwitchType === "OFF") $gameSystem._maximizationUI = false;
        else if (SwitchType === "SWITCH") $gameSystem._maximizationUI = !$gameSystem._maximizationUI;
    });
    PluginManagerEx.registerCommand(document.currentScript, "SceneWindowSwitch", args => {
        const scene = args.scene;
        const SwitchType = args.SwitchType;
        if (SwitchType === "ON") $gameSystem._SlideWindowScene[scene] = true;
        else if (SwitchType === "OFF") $gameSystem._SlideWindowScene[scene] = false;
        else if (SwitchType === "SWITCH") $gameSystem._SlideWindowScene[scene] = !$gameSystem._SlideWindowScene[scene];
    });

    // UIエリア切り替え関数 
    function UI_Apply() {
        if ($gameSystem._maximizationUI2) {
            Graphics.boxWidth = hidariue_width - 8;
            Graphics.boxHeight = hidariue_height - 8;
        } else {
            Graphics.boxWidth = hidariue_boxWidth;
            Graphics.boxHeight = hidariue_boxHeight;
        };
    };
    // マップ切り替えで適用　
    const _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function (mapId) {
        _Game_Map_setup.apply(this, arguments);
        reload();
        UI_Apply();
        SceneManager._fromTitle = false;// タイトル画面フラグを降ろす（シーン別設定用）
    };

    // ウィンドウをずらす
    const _Scene_Base_createWindowLayer = Scene_Base.prototype.createWindowLayer;
    Scene_Base.prototype.createWindowLayer = function () {
        const stackTrace = (new Error()).stack;
        const a = stackTrace.includes('Scene_Title');
        const b = stackTrace.includes('Scene_Map');
        const c = stackTrace.includes('Scene_Menu');
        const d = stackTrace.includes('Scene_Battle');
        const e = !a && !b && !c && !d;
        //無効化ON or シーン別設定でOFF時は通常表示
        if (!$gameSystem._valid2 ||
            (a && !$gameSystem._SlideWindowScene.Title) ||
            (!$gameSystem._SlideWindowScene.Title && SceneManager._fromTitle) ||//タイトル画面からマップ移行前に呼び出されたウィンドウ
            (b && !$gameSystem._SlideWindowScene.Map) ||
            (c && !$gameSystem._SlideWindowScene.Menu) ||
            (d && !$gameSystem._SlideWindowScene.Battle) ||
            (e && !$gameSystem._SlideWindowScene.Other)) {
            _Scene_Base_createWindowLayer.apply(this, arguments);
            return;
        };
        //戦闘シーン中固定時の戦闘
        if (onBattle && d) {
            this._windowLayer = new WindowLayer();
            this._windowLayer.x = bx + 8 / 2;
            this._windowLayer.y = by + 8 / 2;
            this.addChild(this._windowLayer);
            return;
        }
        this._windowLayer = new WindowLayer();
        this._windowLayer.x = $gameSystem._UIx2 + 8 / 2;
        this._windowLayer.y = $gameSystem._UIy2 + 8 / 2;
        this.addChild(this._windowLayer);
    };

    // バトルキャラクターのグラフィックをずらす 
    const _Spriteset_Battle_createBattleField = Spriteset_Battle.prototype.createBattleField;
    Spriteset_Battle.prototype.createBattleField = function () {
        if (!$gameSystem._valid2) {
            _Spriteset_Battle_createBattleField.apply(this, arguments);
            return;
        };
        const width = Graphics.boxWidth;
        const height = Graphics.boxHeight;
        const x = $gameSystem._UIx2;
        const y = $gameSystem._UIy2;
        this._battleField = new Sprite();
        this._battleField.setFrame(0, 0, width, height);
        this._battleField.x = x;
        this._battleField.y = y - this.battleFieldOffsetY();
        if (onBattle) {
            this._battleField.x = bx;
            this._battleField.y = by - this.battleFieldOffsetY();
        };
        this._baseSprite.addChild(this._battleField);
        this._effectsContainer = this._battleField;
    };

    // 戦闘背景をずらす 
    const _Sprite_Battleback_adjustPosition = Sprite_Battleback.prototype.adjustPosition;
    Sprite_Battleback.prototype.adjustPosition = function () {
        if (!$gameSystem._valid2) {
            _Sprite_Battleback_adjustPosition.apply(this, arguments);
            return;
        };
        this.width = Math.floor((1000 * (Graphics.boxWidth + 8)) / 816);
        this.height = Math.floor((740 * (Graphics.boxHeight + 8)) / 624);
        if (onBattle) {
            this.x = bx + ((Graphics.boxWidth + 8) - this.width) / 2;
            if ($gameSystem.isSideView()) {
                this.y = by + (Graphics.boxHeight + 8) - this.height;
            } else {
                this.y = by;
            }
        } else {
            this.x = $gameSystem._UIx2 + ((Graphics.boxWidth + 8) - this.width) / 2;
            if ($gameSystem.isSideView()) {
                this.y = $gameSystem._UIy2 + (Graphics.boxHeight + 8) - this.height;
            } else {
                this.y = $gameSystem._UIy2;
            }
        }
        const ratioX = this.width / this.bitmap.width;
        const ratioY = this.height / this.bitmap.height;
        const scale = Math.max(ratioX, ratioY, 1.0);
        this.scale.x = scale;
        this.scale.y = scale;

    };

    // マップをずらす 
    // マスを数える関数の定義 
    Game_Map.prototype.UIAreaTileX = function () {
        return Math.round(((Graphics.boxWidth + 8) / this.tileWidth()) * 16) / 16;
    };
    Game_Map.prototype.UIAreaTileY = function () {
        return Math.round(((Graphics.boxHeight + 8) / this.tileHeight()) * 16) / 16;
    };
    Game_Map.prototype.slideX = function () {
        return $gameSystem._UIx2 / this.tileWidth();
    };
    Game_Map.prototype.slideY = function () {
        return $gameSystem._UIy2 / this.tileHeight();
    };

    // カメラ位置ずらし 
    const _Game_Player_centerX = Game_Player.prototype.centerX;
    Game_Player.prototype.centerX = function () {
        if (!$gameSystem._valid2) {
            return _Game_Player_centerX.apply(this, arguments);
        } else {
            return $gameMap.slideX() + ($gameMap.UIAreaTileX() - 1) / 2;
        };
    };
    const _Game_Player_centerY = Game_Player.prototype.centerY;
    Game_Player.prototype.centerY = function () {
        if (!$gameSystem._valid2) {
            return _Game_Player_centerY.apply(this, arguments);
        } else {
            return $gameMap.slideY() + ($gameMap.UIAreaTileY() - 1) / 2;
        };
    };

    // マップ呼び出し時のずらし 
    const _Game_Map_setDisplayPos = Game_Map.prototype.setDisplayPos;
    Game_Map.prototype.setDisplayPos = function (x, y) {
        if (!$gameSystem._valid2) {
            _Game_Map_setDisplayPos.apply(this, arguments);
            return;
        };
        if (this.isLoopHorizontal()) {
            this._displayX = x.mod(this.width());
            this._parallaxX = x;
        } else {
            const endX = this.width() - this.UIAreaTileX();
            const sX = $gameMap.slideX();
            if ($gameMap.slideX() < 0)
                this._displayX = (endX < 0 ? (endX / 2) - sX : x.clamp(0 - sX, endX));
            else
                this._displayX = (endX < 0 ? (endX / 2) - sX : x.clamp(0, endX - sX));
            this._parallaxX = this._displayX;
        }
        if (this.isLoopVertical()) {
            this._displayY = y.mod(this.height());
            this._parallaxY = y;
        } else {
            const endY = this.height() - this.UIAreaTileY();
            const sY = $gameMap.slideY();
            if ($gameMap.slideY() < 0)
                this._displayY = endY < 0 ? (endY / 2) - sY : y.clamp(0 - sY, endY);
            else
                this._displayY = endY < 0 ? (endY / 2) - sY : y.clamp(0, endY - sY);
            this._parallaxY = this._displayY;
        };
    };
    // スクロールの調整 
    const _Game_Map_scrollDown = Game_Map.prototype.scrollDown;
    Game_Map.prototype.scrollDown = function (distance) {
        if (!$gameSystem._valid2) {
            _Game_Map_scrollDown.apply(this, arguments);
            return;
        }
        if (this.isLoopVertical()) {
            this._displayY += distance;
            this._displayY %= $dataMap.height;
            if (this._parallaxLoopY) {
                this._parallaxY += distance;
            }
        } else if (this.height() >= this.UIAreaTileY()) {
            const lastY = this._displayY;
            this._displayY = Math.min(
                this._displayY + distance,
                this.height() - this.UIAreaTileY() - $gameMap.slideY()
            );
            this._parallaxY += this._displayY - lastY;
        }
    };
    const _Game_Map_scrollLeft = Game_Map.prototype.scrollLeft;
    Game_Map.prototype.scrollLeft = function (distance) {
        if (!$gameSystem._valid2) {
            _Game_Map_scrollLeft.apply(this, arguments);
            return;
        }
        if (this.isLoopHorizontal()) {
            this._displayX += $dataMap.width - distance;
            this._displayX %= $dataMap.width;
            if (this._parallaxLoopX) {
                this._parallaxX -= distance;
            }
        } else if (this.width() >= this.UIAreaTileX()) {
            const lastX = this._displayX;
            this._displayX = Math.max(this._displayX - distance, 0 - $gameMap.slideX());
            this._parallaxX += this._displayX - lastX;
        }
    };
    const _Game_Map_scrollRight = Game_Map.prototype.scrollRight;
    Game_Map.prototype.scrollRight = function (distance) {
        if (!$gameSystem._valid2) {
            _Game_Map_scrollRight.apply(this, arguments);
            return;
        }
        if (this.isLoopHorizontal()) {
            this._displayX += distance;
            this._displayX %= $dataMap.width;
            if (this._parallaxLoopX) {
                this._parallaxX += distance;
            }
        } else if (this.width() >= this.UIAreaTileX()) {
            const lastX = this._displayX;
            this._displayX = Math.min(
                this._displayX + distance,
                this.width() - this.UIAreaTileX() - $gameMap.slideX()
            );
            this._parallaxX += this._displayX - lastX;
        }
    };
    const _Game_Map_scrollUp = Game_Map.prototype.scrollUp;
    Game_Map.prototype.scrollUp = function (distance) {
        if (!$gameSystem._valid2) {
            _Game_Map_scrollUp.apply(this, arguments);
            return;
        }
        if (this.isLoopVertical()) {
            this._displayY += $dataMap.height - distance;
            this._displayY %= $dataMap.height;
            if (this._parallaxLoopY) {
                this._parallaxY -= distance;
            }
        } else if (this.height() >= this.UIAreaTileY()) {
            const lastY = this._displayY;
            this._displayY = Math.max(this._displayY - distance, 0 - $gameMap.slideY());
            this._parallaxY += this._displayY - lastY;
        }
    };
    // タイトルに戻った際設定を初期化 
    const _Scene_Title_create = Scene_Title.prototype.create;
    Scene_Title.prototype.create = function () {
        reset();
        reload();
        UI_Apply();
        SceneManager._fromTitle = true;// タイトル画面フラグを立てる（シーン別設定用）
        _Scene_Title_create.apply(this, arguments);
    };

    // ニューゲーム時の設定 
    const _DataManager_setupNewGame = DataManager.setupNewGame;
    DataManager.setupNewGame = function () {
        _DataManager_setupNewGame.apply(this, arguments);
        reset();
        UI_Apply();
    };

    // ロードゲーム時に設定読み込み
    const _DataManager_loadGame = DataManager.loadGame;
    DataManager.loadGame = function (savefileId) {
        return _DataManager_loadGame.apply(this, arguments).then(result => {
            reload();
            UI_Apply();
            return result;
        })
    };

    //設定を起動時に戻す関数
    function reset() {
        $gameSystem._UIx = param.x;
        $gameSystem._UIy = param.y;
        $gameSystem._valid = param.valid;
        $gameSystem._maximizationUI = param.maximizationUI;
        $gameSystem._SlideWindowScene = { ...SceneWindow };
    };
    //設定を適用する関数
    function reload() {
        $gameSystem._UIx2 = $gameSystem._UIx;
        $gameSystem._UIy2 = $gameSystem._UIy;
        $gameSystem._valid2 = $gameSystem._valid;
        $gameSystem._maximizationUI2 = $gameSystem._maximizationUI;
    };
})();
