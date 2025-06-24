/*:
 * @target MZ
 * @plugindesc タッチUIボタンの位置を変更するプラグイン
 * @help
 * ・選択肢のキャンセルボタン位置について
 * 選択肢にキャンセルによる分岐が設定されている場合、
 * キャンセルボタンが選択肢ウィンドウの右中央に表示されます
 * （ウインドウが画面右側の場合は左中央）
 * このボタンを16パターンの表示位置から選んで設定します
 * 
 * 1～17の数値で設定します
 * 2・4・6・8はテンキーの位置に対応しており、下左右上の中央に配置されます
 * 1・3・7・9もテンキーの位置に対応しており、それぞれ角に配置されます
 * 5は通常の位置（右中央or左中央）に配置されます
 * 10・12は1の右・上、11・13は3の左・上、
 * 14・16は7の下・右、15・17は9の左・下に配置されます
 * 
 * ざっくり
 * テンキーの数字の位置に配置、10以降はいい感じの位置
 * 
 * 簡易表
 *  ⑦⑯⑧⑰⑨
 * ⑭┌ ─ ┐⑮
 * ④│ 　 │⑥
 * ⑫└ ─ ┘⑬
 *  ①⑩②⑪③　　　　⑤デフォ
 * 
 * 
 * @param menuButton
 * @text メニューボタン位置変更
 * @desc マップシーンで表示されるメニューボタンの位置を変更します
 * @type boolean
 * @default true
 * 
 * @param menuButtonX
 * @text X座標
 * @desc メニューボタンのX座標を設定します
 * @type number
 * @min -9999
 * @default 0
 * @parent menuButton
 *
 * @param menuButtonY
 * @text Y座標
 * @desc メニューボタンのY座標を設定します
 * @type number
 * @min -9999
 * @default 0
 * @parent menuButton
 * 
 * @param choiceCancelButton
 * @text 選択肢のキャンセルボタン
 * 
 * @param absolutePosition
 * @text 指定位置固定
 * @desc 選択肢のキャンセルボタンの位置を指定の位置に表示します
 * @type boolean
 * @default false
 * @parent choiceCancelButton
 * 
 * @param cancelButtonX
 * @text 指定位置固定：X座標
 * @desc 選択肢のキャンセルボタンのX座標
 * 指定位置固定がONの場合に表示する位置
 * @type number
 * @min -9999
 * @default 8
 * @parent absolutePosition
 *
 * @param cancelButtonY
 * @text 指定位置固定：Y座標
 * @desc 選択肢のキャンセルボタンのY座標
 * 指定位置固定がONの場合に表示する位置
 * @type number
 * @min -9999
 * @default 8
 * @parent absolutePosition
 * 
 * @param relativePosition
 * @text ボタン位置
 * @desc 選択肢のキャンセルボタンの位置を設定します（1～17）
 * 位置についてはヘルプを参照
 * @type number
 * @default 5
 * @parent choiceCancelButton
 * 
 * @param cancelButtonOffsetX
 * @text Xオフセット
 * @desc ボタン位置からX方向にずらす値を設定します
 * @type number
 * @min -9999
 * @default 0
 * @parent relativePosition
 *
 * @param cancelButtonOffsetY
 * @text Yオフセット
 * @desc ボタン位置からY方向にずらす値を設定します
 * @type number
 * @min -9999
 * @default 0
 * @parent relativePosition
 *
 */

(() => {
    const pluginName = "CustomTouchUI";
    const parameters = PluginManager.parameters(pluginName);
    const menuButton = parameters["menuButton"] === "true";
    const menuButtonX = Number(parameters["menuButtonX"] || 0);
    const menuButtonY = Number(parameters["menuButtonY"] || 0);

    // メニューボタンの位置を変更
    const _Scene_Map_createMenuButton = Scene_Map.prototype.createMenuButton;
    Scene_Map.prototype.createMenuButton = function () {
        _Scene_Map_createMenuButton.call(this);
        if (menuButton) {
            this._menuButton.x = menuButtonX;
            this._menuButton.y = menuButtonY;
        }
    };

    const cancelButtonOffsetX = Number(parameters["cancelButtonOffsetX"] || 0);
    const cancelButtonOffsetY = Number(parameters["cancelButtonOffsetY"] || -50);
    const relativePosition = Number(parameters["relativePosition"] || "top");
    const absolutePosition = parameters["absolutePosition"] === "true";
    const cancelButtonX = Number(parameters["cancelButtonX"] || 0);
    const cancelButtonY = Number(parameters["cancelButtonY"] || 0);

    const _Window_ChoiceList_prototype_placeCancelButton = Window_ChoiceList.prototype.placeCancelButton;
    Window_ChoiceList.prototype.placeCancelButton = function () {
        const button = this._cancelButton;
        if (absolutePosition) {
            button.x = -this.x + cancelButtonX;
            button.y = -this.y + cancelButtonY;
            return;
        }
        if (relativePosition === 5) {
            _Window_ChoiceList_prototype_placeCancelButton.apply(this, arguments);
            button.x += cancelButtonOffsetX;
            button.y += cancelButtonOffsetY;

            return;
        }
        if (this._cancelButton) {
            button.x = this.calcCancelButtonX(relativePosition);
            button.y = this.calcCancelButtonY(relativePosition);
        }
    };

    Window_ChoiceList.prototype.calcCancelButtonX = function (Position) {
        const spacing = 8;
        const button = this._cancelButton;
        const right = this.x + this.width;
        var x;
        switch (Position) {
            case 1:
            case 4:
            case 7:
            case 12:
            case 14:
                x = -button.width - spacing;
                break;
            case 2:
            case 8:
                x = this.width / 2 - button.width / 2;
                break;
            case 3:
            case 6:
            case 9:
            case 13:
            case 15:
                x = this.width + spacing;
                break;
            case 10:
            case 16:
                x = spacing;
                break;
            case 11:
            case 17:
                x = this.width - button.width - spacing;
                break;
        }
        return x + cancelButtonOffsetX;
    };
    Window_ChoiceList.prototype.calcCancelButtonY = function (Position) {
        const spacing = 8;
        const button = this._cancelButton;
        const right = this.x + this.width;
        var y;
        switch (Position) {
            case 1:
            case 2:
            case 3:
            case 10:
            case 11:
                y = this.height + spacing;
                break;
            case 4:
            case 6:
                y = this.height / 2 - button.height / 2;
                break;
            case 7:
            case 8:
            case 9:
            case 16:
            case 17:
                y = - button.height - spacing;
                break;
            case 12:
            case 13:
                y = this.height - button.height - spacing;
                break;
            case 14:
            case 15:
                y = spacing;
                break;
        }
        return y + cancelButtonOffsetY;
    }



})();