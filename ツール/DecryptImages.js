/*:
 * @target MZ
 * @plugindesc 暗号化画像をゲーム起動時に復号化するプラグイン
 * @author 
 * @help
 * DecryptImages.js
 * ゲーム起動時にゲームフォルダの暗号化された画像を復号化し保存します。
 * 既に復号化された同名のファイルが存在する場合はスキップします。
 * 
 * 【使い方】
 * 必ずバックアップを取った上で使用してください。
 * 
 * 1：js\pluginsフォルダにこのプラグインを入れます。
 * 
 * 2：次にjsフォルダ内のplugins.jsをテキストエディタで開きます。
 *    最初の方にある
 * var $plugins =
 * [
 *    を、
 * var $plugins =
 * [{"name":"DecryptImages","status":true},
 *    としてください。このプラグインが有効になります。
 * 
 * 3：ゲームを起動します。
 * 
 * 【注意】
 * - 当プラグインはプラグインはライセンスの侵害を目的としたものでは
 *   ありません。使用の際は、対象のゲーム及び素材のライセンスに
 *   ご注意ください。
 * - 当プラグインによって発生した問題に対し、製作者は補償を致しません。
 */

(() => {
    "use strict";

    const pluginName = "DecryptImages";
    var decrypting = false;



    const _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function () {
        this.setEncryptionInfo();
        DecryptImages.start();
        DecryptAudio.start();
        _Scene_Boot_start.call(this);
    };
    Utils.setEncryptionInfo = function (hasImages, hasAudio, key) {
        // [Note] This function is implemented for module independence.
        this._hasEncryptedImages = true;
        this._hasEncryptedAudio = true;
        this._encryptionKey = key;
    };
    class DecryptImages {
        static start() {
            const fs = require("fs");
            const mainModulePath = process.mainModule.path;
            if (!fs.existsSync(mainModulePath)) {
                console.error("フォルダが見つかりません。");
                return;
            }

            console.log("画像復号化予約開始");
            decrypting = true;
            this._decryptFolder(mainModulePath);
            decrypting = false;
            console.log("画像復号化予約完了");
        }

        static _decryptFolder(folderPath) {
            const fs = require("fs");
            const path = require("path");

            fs.readdirSync(folderPath).forEach(file => {
                const filePath = path.join(folderPath, file);
                if (fs.statSync(filePath).isDirectory()) {
                    this._decryptFolder(filePath); // サブフォルダを再帰処理
                } else if (file.endsWith("png_")) {
                    const decryptedPath = filePath.slice(0, -1); // "_" を削除
                    if (fs.existsSync(decryptedPath)) {
                        console.log(`スキップ: ${decryptedPath}（既に存在）`);
                        return;
                    }
                    this._decryptFile(decryptedPath);
                }
            });
        }

        static _decryptFile(filePath) {
            const convertedFilePath = filePath.replace(/\\/g, "/");
            ImageManager.loadBitmapFromUrl_d(convertedFilePath);
        }
    }
    ImageManager.loadBitmapFromUrl_d = function (url) {
        const cache = url.includes("/system/") ? this._system : this._cache;
        cache[url] = Bitmap.load(url);
        return cache[url];
    };
    Bitmap.prototype._startDecrypting = function () {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", this._url + "_");
        xhr.responseType = "arraybuffer";
        if (decrypting) {
            xhr.decrypt = true;
        }
        xhr.onload = () => this._onXhrLoad(xhr);
        xhr.onerror = this._onError.bind(this);
        xhr.send();
    };

    Bitmap.prototype._onXhrLoad = function (xhr) {
        if (xhr.status < 400) {
            const arrayBuffer = Utils.decryptArrayBuffer(xhr.response);
            const blob = new Blob([arrayBuffer]);
            this._image.src = URL.createObjectURL(blob);
            if (xhr.decrypt) {
                const fs = require("fs");
                fs.writeFileSync(this._url, Buffer.from(arrayBuffer));
                console.log(`復号化完了: ${this._url}`);
            }
        } else {
            this._onError();
        }
    };

    class DecryptAudio {
        static start() {
            const fs = require("fs");
            const mainModulePath = process.mainModule.path;
            if (!fs.existsSync(mainModulePath)) {
                console.error("フォルダが見つかりません。");
                return;
            }

            console.log("音声復号化予約開始");
            decrypting = true;
            this._decryptFolder(mainModulePath);
            decrypting = false;
            console.log("音声復号化予約完了");
        }

        static _decryptFolder(folderPath) {
            const fs = require("fs");
            const path = require("path");

            fs.readdirSync(folderPath).forEach(file => {
                const filePath = path.join(folderPath, file);
                if (fs.statSync(filePath).isDirectory()) {
                    this._decryptFolder(filePath); // サブフォルダを再帰処理
                } else if (file.endsWith("ogg_")) {
                    const decryptedPath = filePath.slice(0, -1); // "_" を削除
                    if (fs.existsSync(decryptedPath)) {
                        console.log(`スキップ: ${decryptedPath}（既に存在）`);
                        return;
                    }
                    this._decryptFile(decryptedPath);
                }
            });
        }

        static _decryptFile(filePath) {
            const convertedFilePath = filePath.replace(/\\/g, "/");
            const buffer = new WebAudio(convertedFilePath);
            buffer.destroy();
        }
    }

    WebAudio.prototype._startLoading = function () {
        if (WebAudio._context) {
            const url = this._realUrl();
            this._startXhrLoading(url);
            const currentTime = WebAudio._currentTime();
            this._lastUpdateTime = currentTime - 0.5;
            this._isError = false;
            this._isLoaded = false;
            this._destroyDecoder();
            if (this._shouldUseDecoder()) {
                this._createDecoder();
            }
        }
    };

    WebAudio.prototype._startXhrLoading = function (url) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "arraybuffer";
        if (decrypting) {
            xhr.decrypt = true;
            xhr._url = url;
        }
        xhr.onload = () => this._onXhrLoad(xhr);
        xhr.onerror = this._onError.bind(this);
        xhr.send();
    };

    WebAudio.prototype._onXhrLoad = function (xhr) {
        if (xhr.status < 400) {
            this._data = new Uint8Array(xhr.response);
            if (xhr.decrypt) {
                const fileName = xhr._url.slice(0, -1);
                const fs = require("fs");
                fs.writeFileSync(fileName, Buffer.from(this._readableBuffer()));
                console.log(`復号化完了: ${fileName}`);
            }
            this._isLoaded = true;
            this._updateBuffer();
        } else {
            this._onError();
        }
    };

})();
