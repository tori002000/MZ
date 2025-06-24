/*:
 * @target MZ
 * @plugindesc 一部の画像の復号化処理を無効化します。
 * @author 
 * @help 
 * このプラグインは暗号化画像と非暗号化画像両方を扱えるようにします。
 * 
 * ゲーム内の特定の画像の差し替えをユーザー側が(ゲーム外から)行うことを可能にする
 * という用途を想定して作成されています。
 * 
 * 
 * 指定されたディレクトリ内の画像は暗号化されていない画像として読み込まれます。
 * 
 * デフォルトではimg/pictures/unencryptedフォルダが指定されています。
 * 
 * デプロイメント後、指定ディレクトリ内の画像を
 * 暗号化後のもの(.png_)から暗号化前のもの(.png)に置き換えてください。
 * 
 * 非暗号化画像を個別で指定する場合は「画像ファイル」項目から指定できます。
 * 
 * 利用について：自由
 * 
 * @param Directroy
 * @text ディレクトリ
 * @desc 非暗号化ピクチャのディレクトリを指定します。
 * ディレクトリの階層は /（スラッシュ） で区切ります。
 * @default ["img/pictures/unencrypted"]
 * @type string[]
 * 
 * @param ImageFiles
 * @text 画像ファイル
 * @desc 非暗号化ピクチャを個別で指定します。
 * @default []
 * @type file[]
 */
(() => {
    const pluginName = "DisableDecryption";
    const parameters = PluginManager.parameters(pluginName);
    const Directroy = JSON.parse(parameters['Directroy'] || 0);
    const ImageFiles = JSON.parse(parameters['ImageFiles'] || 0);

    const _Bitmap__startLoading = Bitmap.prototype._startLoading;
    Bitmap.prototype._startLoading = function () {
        if (Directroy) {
            const path = this.url;
            const lastSlashIndex = path.lastIndexOf('/') || 0;
            if (lastSlashIndex) {
                const picPath = path.substring(0, lastSlashIndex);
                if (Directroy.includes(picPath)) {
                    const temp = Utils.EncryptionImagesInfo();
                    Utils.setEncryptionImagesInfo(false);
                    _Bitmap__startLoading.call(this);
                    Utils.setEncryptionImagesInfo(temp);
                    return;
                }
            }
        }
        if (ImageFiles) {
            const path = this.url;
            const ExtensionIndex = path.lastIndexOf('.') || 0;
            const url = path.substring(0, ExtensionIndex);
            if (ImageFiles.includes(url)) {
                const temp = Utils.EncryptionImagesInfo();
                Utils.setEncryptionImagesInfo(false);
                _Bitmap__startLoading.call(this);
                Utils.setEncryptionImagesInfo(temp);
                return;
            }
        }
        _Bitmap__startLoading.call(this);
    };

    Utils.EncryptionImagesInfo = function () {
        return this._hasEncryptedImages;
    };

    Utils.setEncryptionImagesInfo = function (hasImages) {
        this._hasEncryptedImages = hasImages;
    };

})();