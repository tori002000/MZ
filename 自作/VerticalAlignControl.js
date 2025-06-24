/*:
 * @plugindesc 行内の文字にサイズ差がある場合の縦方向揃えを変更する制御文字追加プラグイン
 * @target MZ
 * @help
 * VerticalAlignControl.js
 * 
 * うまく説明できないけど文章の表示で
 * 
 * \{ちゅう\}おう\}ぞろえ
 * \TAうえ\{ぞろ\{え
 * \BAした\}ぞろ\}え
 * 
 * って打ってイベントテストするとなんとなくわかってもらえると思う
 * 
 * 
 * @param def
 * @text デフォルト配置
 * @desc デフォルトの配置　デフォルト：center
 * 上揃え：top　中央揃え：center　下揃え：bottom
 * @type select
 * @option top
 * @option center
 * @option bottom
 * @default center
 * 
 * @param top
 * @text 上揃え制御文字
 * @desc 上揃えにする制御文字（\の後ろ部分）
 * デフォルト：TA
 * @default TA
 * 
 * @param center
 * @text 中央揃え制御文字
 * @desc 中央揃えにする制御文字（\の後ろ部分）
 * デフォルト：CA
 * @default CA
 * 
 * @param bottom
 * @text 下揃え制御文字
 * @desc 下揃えにする制御文字（\の後ろ部分）
 * デフォルト：BA
 * @default BA
 * 
 */

(() => {

    const PN = 'VerticalAlignControl';
    const param = PluginManager.parameters(PN);
    const topCharacter = (param.top || "TA");
    const centerCharacter = (param.center || "CA");
    const bottomCharacter = (param.bottom || "BA");
    const def = ((param.def === "top") - (param.def === "bottom"));

    //縦方向揃えのプロパティを追加
    const _Window_Base_createTextState = Window_Base.prototype.createTextState;
    Window_Base.prototype.createTextState = function (text, x, y, width) {
        const textState = _Window_Base_createTextState.call(this, text, x, y, width);
        textState.heightA = def;
        return textState;
    };
    //縦方向揃えを変更する制御文字を追加
    const _Window_Base_processEscapeCharacter = Window_Base.prototype.processEscapeCharacter;
    Window_Base.prototype.processEscapeCharacter = function (code, textState) {
        switch (code) {
            case topCharacter:
                textState.heightA = 1;
                break;
            case centerCharacter:
                textState.heightA = 0;
                break;
            case bottomCharacter:
                textState.heightA = -1;
                break;
            default:
                _Window_Base_processEscapeCharacter.call(this, code, textState);
                break;
        }
    };
    //既存メソッドの上書き（他プラグインとの競合注意）
    Window_Base.prototype.flushTextState = function (textState) {
        const text = textState.buffer;
        const rtl = textState.rtl;
        const width = this.textWidth(text);
        const height = textState.height;
        const x = rtl ? textState.x - width : textState.x;
        const y = textState.y;
        //y座標の補正値yyを計算
        const lineSpacing = this.lineHeight() - $gameSystem.mainFontSize();
        const yy = textState.heightA * (this.contents.fontSize + lineSpacing - height) / 2;
        if (textState.drawing) {
            this.contents.drawText(text, x, y + yy, width, height);//yyを足す
        }
        textState.x += rtl ? -width : width;
        textState.buffer = this.createTextBuffer(rtl);
        const outputWidth = Math.abs(textState.x - textState.startX);
        if (textState.outputWidth < outputWidth) {
            textState.outputWidth = outputWidth;
        }
        textState.outputHeight = y - textState.startY + height;
    };

    //MPP_MessageEX.js version 4.4.1 との競合対策（力技）
    const _importedPlugin = (...names) => {
        return names.some(name => PluginManager._scripts.includes(name));
    };

    const _Window_Base_flushTextState = Window_Base.prototype.flushTextState;
    if (_importedPlugin('MPP_MessageEX')) {
        console.log('MPP_MessageEX有効');
        Window_Message.prototype.flushTextState = function (textState) {
            if (textState.drawing && this.isCharacterAnimation()) {
                this.flushTextStateForAnimation(textState);
            } else {
                this.contents.paintOpacity = this._paintOpacity;
                _Window_Base_flushTextState.call(this, textState);
                this.contents.paintOpacity = 255;
            }
        };
        Window_Message.prototype.flushTextStateForAnimation = function (textState) {
            const list = this.getAnimationList();
            const text = textState.buffer;
            const rtl = textState.rtl;
            const { y, height } = textState;
            const width = this.textWidth(text);
            const x = rtl ? textState.x - width : textState.x;
            const bitmap = this.createCharacterBitmap(width + 8, height);

            const lineSpacing = this.lineHeight() - $gameSystem.mainFontSize();
            const yy = textState.heightA * (this.contents.fontSize + lineSpacing - height) / 2;
            bitmap.drawText(text, 4, yy, width + 4, height);

            const sprite = this.getTextCharacterSprite();
            const rect = new Rectangle(x, y, width, height);
            sprite.setup(bitmap, rect, list);
            textState.x += rtl ? -width : width;
            textState.buffer = this.createTextBuffer(rtl);

            const outputWidth = Math.abs(textState.x - textState.startX);
            if (textState.outputWidth < outputWidth) {
                textState.outputWidth = outputWidth;
            }
            textState.outputHeight = y - textState.startY + height;
        };
    };
})();
