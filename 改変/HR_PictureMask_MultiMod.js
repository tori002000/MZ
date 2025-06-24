/*:
 * @target MZ
 * @plugindesc ピクチャにマスクを設定します。
 * @author 改変：「」/オリジナル：はら様
 * @url 
 *
 * @help
 * HR_PictureMask_MultiMod.js
 * はら様のピクチャマスクプラグインを、
 * 複数のマスク範囲を登録できるように改変したもの
 * マスク範囲の合成に使う合成方法のパラメータを追加
 * マスク範囲の合成を毎フレーム行うためオリジナルに比べて負荷が非常に大きい
 * 利用についてはオリジナルと同様
 * 
 * 合成方法についてざっくり
 * 透過で穴をあけるなら1（乗算）、
 * 逆に全体を透過して一部を見せたいなら2（スクリーン）がオススメ
 * 
 * 
 * 以下オリジナルヘルプ
 * ----------------------------
 * plugindesc ピクチャにマスクを設定します。
 * author はら
 * url https://note.com/haranta/n/n01e393a40f53
 *
 * 
 * ピクチャにマスクを設定します。
 * 設定には【メイン画像】と【マスク範囲】の2つの画像が必要です。
 *
 * 【メイン画像】
 * 　マスク範囲に表示される方。
 * 　ピクチャの表示重ね順はこちらのピクチャIDが反映されます。
 *
 * 【マスク範囲】
 * 　マスクの範囲として使用される方。
 * 　画像の白い所にメイン画像が表示されます。
 * 　黒、透明部分は隠されます。
 * 　マスク範囲にしか影響しないので、ピクチャIDはいくつでも大丈夫です。
 * 　（他のピクチャより下層で隠れていたり、上層の方にあっても関係ない）
 *
 * ・使い方
 * 【メイン画像】【マスク範囲】ピクチャ表示後、
 * ウェイト1フレーム以上を入れてからプラグインコマンドを使用してください。
 * （ウェイトが無いと、他のピクチャが一瞬だけ消えることがあります）
 * 解除はプラグインコマンド「マスク解除」の他、
 * 通常のイベントコマンド「ピクチャの消去」を実行しても
 * マスク設定が一緒に消せます。
 * （どちらもメイン画像に対して処理）
 *
 * 更新履歴
 * 　2024/05/20 ver 1.1 ピクチャが一瞬消える現象についてヘルプに記載
 * 　2024/05/19 ver 1.0 作成
 *
 * 利用規約
 * 　禁止事項はありません。
 *
 *
 * @command SET_MASK
 * @text マスク設定
 * @desc マスクを設定します。ピクチャ表示後に実行してください。※直前にウェイトを1フレーム以上入れてください。
 *
 * @arg textureId
 * @text メインのピクチャID
 * @desc 【メイン画像】マスク範囲に表示されるピクチャIDです。
 * @default 1
 * @type number
 *
 * @arg maskId
 * @text マスクのピクチャID
 * @desc 【マスク範囲】マスク画像の白い所にテクスチャ画像が表示されます。黒、透明部分は隠されます。
 * @default 1
 * @type number[]
 * 
 * @arg blendMode
 * @text マスク同士の合成方法
 * @desc 【合成方法】0：標準　1：白背景に乗算　2：スクリーン
 * @default 1
 * @type number
 * 
 * @command CLEAR_MASK
 * @text マスク解除
 * @desc マスクを解除します。
 *
 * @arg textureId
 * @text テクスチャのピクチャID
 * @desc 【メイン画像】ピクチャIDを指定してください。（メイン画像を消去した場合、マスク解除は不要です）
 * @default 1
 * @type number
 *
 * @command CLEAR_ALL_MASK
 * @text マスク全解除
 * @desc すべてのマスクを解除します。
 */


(function () {
    'use strict';


    // ----------------プラグインコマンド----------------

    const pluginName = "HR_PictureMask_MultiMod";

    PluginManager.registerCommand(pluginName, "SET_MASK", args => {
        const numberArray = JSON.parse(args.maskId).map(Number);
        if (Array.isArray(numberArray)) {
            $gameScreen.setMask(args.textureId, numberArray, args.blendMode);
        } else {
            $gameScreen.setMask(args.textureId, args.maskId, args.blendMode);
        }

    });

    PluginManager.registerCommand(pluginName, "CLEAR_MASK", args => {
        $gameScreen.clearMask(args.textureId);
    });

    PluginManager.registerCommand(pluginName, "CLEAR_ALL_MASK", args => {
        $gameScreen.clearAllMask();
    });


    // ----------------マスクの設定、解除----------------

    Game_Screen.prototype.setMask = function (texId, maskIds, blend) {
        const gamePic = this.picture(texId);
        if (!gamePic) return;
        this.clearMask(texId);
        //メインピクチャにマスクピクチャを設定
        gamePic._maskIds = maskIds;
        gamePic._blend = blend;
        gamePic._renderTexture = null;
        //マスクピクチャに非表示の設定
        maskIds.forEach(element => {
            var maskPic = this.picture([element]);
            if (maskPic) {
                maskPic._maskPic = true;
            }
        });
    };

    Game_Screen.prototype.clearMask = function (texId) {
        const gamePic = this.picture(texId);
        if (!gamePic) return;
        const maskIds = gamePic._maskIds
        if (!maskIds) return;
        maskIds.forEach(element => {
            var maskPic = this.picture([element]);
            if (maskPic) {
                maskPic._maskPic = null;
            }
        });
        gamePic._maskIds = null;
        gamePic._blend = null;
        gamePic._renderTexture = null;
        const sprPicArr = SceneManager._scene._spriteset._pictureContainer.children;
        const texPic = sprPicArr[texId - 1];
        texPic.mask = null;
    };

    Game_Screen.prototype.clearAllMask = function () {
        this._pictures.forEach((gamePic, i) => {
            this.clearMask(i);
        });
    };

    const _Game_Screen_erasePicture = Game_Screen.prototype.erasePicture;
    Game_Screen.prototype.erasePicture = function (pictureId) {
        this.clearMask(pictureId);
        _Game_Screen_erasePicture.apply(this, arguments);
    };


    //更新
    const _Game_Screen_update = Game_Screen.prototype.update;
    Game_Screen.prototype.update = function () {
        _Game_Screen_update.apply(this, arguments);
        //マスクピクチャが設定されているピクチャのマスク処理
        const sprPicArr = SceneManager._scene._spriteset._pictureContainer.children;
        sprPicArr.forEach((texPic, index) => {
            const gamePic = this.picture(index + 1);
            if (gamePic && gamePic._maskIds) {
                texPic.mask = null
                //マスクテクスチャを生成
                   if (gamePic._renderTexture) {
                        gamePic._renderTexture.destroy(true); // 古いテクスチャを破棄
                    }
                gamePic._renderTexture = PIXI.RenderTexture.create(texPic.width, texPic.height);

                //白で塗りつぶして乗算の下準備
                if (Number(gamePic._blend) === 1) {
                    const white = new PIXI.Graphics();
                    white.beginFill(0xFFFFFF);
                    white.drawRect(0, 0, texPic.width, texPic.height);
                    white.endFill();
                    Graphics.app.renderer.render(white, gamePic._renderTexture, true);
                }
                // 各マスクピクチャをマスクテクスチャに描画
                gamePic._maskIds.forEach(element => {
                    const maskPic = sprPicArr[element - 1];
                    if (maskPic) {
                        //描画の瞬間のみマスクピクチャの表示設定オン・ブレンドモード設定
                        maskPic.visible = true;
                        var bm = maskPic.blendMode; //元のブレンドモードを退避
                        if (Number(gamePic._blend) === 1) { //乗算
                            maskPic.blendMode = PIXI.BLEND_MODES.MULTIPLY;
                        } else if (Number(gamePic._blend) === 2) { //スクリーン
                            maskPic.blendMode = PIXI.BLEND_MODES.SCREEN;
                        };
                        Graphics.app.renderer.render(maskPic, gamePic._renderTexture, false);
                        maskPic.blendMode = bm;
                        maskPic.visible = false;
                    }
                });
                //マスク適用
                const renderSprite = new PIXI.Sprite(gamePic._renderTexture);
                texPic.mask = renderSprite;
            }
        });
    }

    // マスク用ピクチャを非表示
    const _Sprite_Picture_update = Sprite_Picture.prototype.update;
    Sprite_Picture.prototype.update = function () {
        _Sprite_Picture_update.apply(this, arguments);
        const picture = this.picture();
        if (picture && picture._maskPic) {
            this.visible = false;  // マスク用ピクチャは非表示
        } else {
            this.visible = true;   // 通常のピクチャは表示
        }
    };

// マスクテクスチャを消去する
    Game_Picture.prototype.resetRenderTexture = function() {
        if (this._renderTexture) {
            this._renderTexture.destroy(true); 
            this._renderTexture = null;
        }
    };
// セーブ時にマスクテクスチャを消去
    const _DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        $gameScreen._pictures.forEach(picture => {
            if (picture) {
                picture.resetRenderTexture();
            }
        });
        return _DataManager_makeSaveContents.apply(this, arguments);
    };

    // ----------------状態の保存、復元----------------

    Game_Screen.prototype.savePictureMasks = function () {
        this._pictureMasks = this._pictures.map(pict => pict ? pict._maskIds : null);
    };

    Game_Screen.prototype.restorePictureMasks = function () {
        if (this._pictureMasks) {
            const sprPicArr = SceneManager._scene._spriteset._pictureContainer.children;
            this._pictureMasks.forEach((maskInfo, i) => {
                if (maskInfo) {
                    sprPicArr[i - 1].mask = sprPicArr[maskInfo - 1];
                }
            });
        }
    };

    const _Scene_Map_stop = Scene_Map.prototype.stop;
    Scene_Map.prototype.stop = function () {
        $gameScreen.savePictureMasks();
        _Scene_Map_stop.apply(this, arguments);
    };

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        _Scene_Map_start.apply(this, arguments);
        $gameScreen.restorePictureMasks();
    };

})();