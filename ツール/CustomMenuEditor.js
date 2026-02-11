/*:
 * @target MZ
 * @plugindesc カスタムメニュー編集プラグイン
 * @author 
 * @help
 * PluginCommonBase.js, SceneCustomMenu.jsと併せて導入してください。
 * 同梱のhtmlファイルを同じディレクトリに置いてください。
 * 
 * シーン呼び出し時にエディター画面が開きます。
 * 編集後は[ウィンドウを更新]ボタンを押し、ゲーム画面でシーンを閉じてください。
 * もう一度シーンを呼び出すと編集後の設定が適用されています。
 * 
 * ウィンドウが一つも登録されていない場合、操作ができないためウィンドウを追加後、
 * [メニュー強制終了]ボタンでシーンを閉じられます。
 * 
 * [変更を保存]はplugins.jsを上書きします。
 * 導入している全てのプラグインのパラメータが記録されるファイルですので
 * 必ずバックアップを取って使用してください。
 * 
 * テストプレイの場合、[変更を保存]後にRPGツクール本体でゲームの変更を保存すると
 * 編集前に巻き戻ってしまいます。
 * 編集後はゲームの変更を保存せずに再起動orプロジェクトを開き直してください。
 * 
 * v 0.2
 * 
 * SceneCustomMenu.js 1.53.1
 */
/*
 0.2    ウィンドウを更新のエラーを解消・ウィンドウ追加ウィザードの文言を修正
        エディターのシステムメッセージの表示を改善・テンプレートの修正及び追加
        関数を整理しコードを簡潔化・ヘルプ加筆
 0.1.1  一覧取得スクリプトの設定フォームが消えていた不具合の修正
 0.1    公開
*/
(() => {
    "use strict";
    const script = document.currentScript;
    const param = PluginManagerEx.createParameter(script);
    PluginManagerEx.registerCommand(script, 'CALL_SCENE_BY_NUMBER', args => {
        param.SceneList[args.sceneNumber]
        SceneManager.callCustomMenu();
    });


    let editorWindow = null;

    // グローバル空間に公開（HTMLから呼び出し可能にする）
    window.CustomMenuEditor = {
        updateCustomData: function (changedData) {
            if (SceneManager._scene && SceneManager._scene._customData) {
                const customData = SceneManager._scene._customData;
                Object.keys(changedData).forEach(key => {
                    customData[key] = changedData[key];
                });
                console.log('Custom data updated:', customData);
                return true;
            }
            return false;
        },
        saveToPluginsJs: function (changedData, sceneKey) {
            if (!Utils.isNwjs()) {
                console.error('saveToPluginsJs: Not running under NW.js');
                return false;
            }

            try {
                const fs = require('fs');
                const path = require('path');

                // ゲーム実行ファイルのディレクトリを取得
                const pluginsJsPath = scriptUrls[11];
                const pluginsPath = path.join(pluginsJsPath);

                // plugins.jsを読み込む
                let pluginsContent = fs.readFileSync(pluginsPath, 'utf8');

                // シーンキーが指定されていない場合はIDから検索（フォールバック）
                if (!sceneKey) {
                    sceneKey = this.findSceneKey(changedData.Id);
                }

                if (!sceneKey) {
                    console.error('Scene key not found for Id:', changedData.Id);
                    return false;
                }

                // PluginParamのラッパーを解除してプレーンなオブジェクトに変換
                const unwrap = (obj) => {
                    if (obj && typeof obj === 'object') {
                        if (obj._parameter !== undefined) {
                            const plain = unwrap(obj._parameter);
                            // インスタンスに直接追加されたプロパティもマージ
                            Object.keys(obj).forEach(key => {
                                if (key !== '_parameter' && plain[key] === undefined) {
                                    plain[key] = unwrap(obj[key]);
                                }
                            });
                            return plain;
                        }
                        if (Array.isArray(obj)) {
                            return obj.map(unwrap);
                        }
                        const newObj = {};
                        for (const key in obj) {
                            newObj[key] = unwrap(obj[key]);
                        }
                        return newObj;
                    }
                    return obj;
                };

                const rawData = unwrap(changedData);

                // 構造体をJSON文字列に変換（RPGツクールの仕様に合わせる）
                const stringifyStruct = (obj) => {
                    if (typeof obj === 'object' && obj !== null) {
                        return JSON.stringify(obj);
                    }
                    return obj;
                };

                // シーン情報の構造体を文字列化
                if (rawData.InitialEvent) rawData.InitialEvent = stringifyStruct(rawData.InitialEvent);
                if (rawData.ActorChangeEvent) rawData.ActorChangeEvent = stringifyStruct(rawData.ActorChangeEvent);
                if (rawData.Panorama) rawData.Panorama = stringifyStruct(rawData.Panorama);

                // ウィンドウリストの構造体を文字列化
                if (rawData.WindowList && Array.isArray(rawData.WindowList)) {
                    const windowList = rawData.WindowList.map(win => {
                        // ウィンドウ内の構造体を文字列化
                        if (win.CommandList && Array.isArray(win.CommandList)) {
                            const commandList = win.CommandList.map(cmd => {
                                if (cmd.DecisionEvent) cmd.DecisionEvent = stringifyStruct(cmd.DecisionEvent);
                                if (cmd.OkSound) cmd.OkSound = stringifyStruct(cmd.OkSound);
                                return JSON.stringify(cmd);
                            });
                            win.CommandList = JSON.stringify(commandList);
                        }
                        if (win.ButtonEvent && Array.isArray(win.ButtonEvent)) {
                            const buttonList = win.ButtonEvent.map(btn => {
                                if (btn.Event) btn.Event = stringifyStruct(btn.Event);
                                return JSON.stringify(btn);
                            });
                            win.ButtonEvent = JSON.stringify(buttonList);
                        }
                        if (win.DecisionEvent) win.DecisionEvent = stringifyStruct(win.DecisionEvent);
                        if (win.CancelEvent) win.CancelEvent = stringifyStruct(win.CancelEvent);
                        if (win.CursorEvent) win.CursorEvent = stringifyStruct(win.CursorEvent);
                        if (win.okSound) win.okSound = stringifyStruct(win.okSound);
                        if (win.ItemDrawScript && Array.isArray(win.ItemDrawScript)) {
                            win.ItemDrawScript = JSON.stringify(win.ItemDrawScript);
                        }

                        // winオブジェクトのプリミティブ値のみを文字列に変換
                        for (const key in win) {
                            if (Object.prototype.hasOwnProperty.call(win, key)) {
                                const value = win[key];
                                if (typeof value !== 'object' || value === null) {
                                    win[key] = String(value);
                                }
                            }
                        }
                        return JSON.stringify(win);
                    });
                    rawData.WindowList = JSON.stringify(windowList);
                }

                // rawDataのトップレベルのプリミティブ値も文字列に変換
                for (const key in rawData) {
                    if (Object.prototype.hasOwnProperty.call(rawData, key)) {
                        const value = rawData[key];
                        if (typeof value !== 'object' || value === null) {
                            rawData[key] = String(value);
                        }
                    }
                }

                // plugins.jsのJSON部分を抽出してパース
                const jsonStart = pluginsContent.indexOf('[');
                const jsonEnd = pluginsContent.lastIndexOf(']');
                if (jsonStart === -1 || jsonEnd === -1) {
                    throw new Error('Invalid plugins.js format');
                }

                const jsonString = pluginsContent.substring(jsonStart, jsonEnd + 1);
                const plugins = JSON.parse(jsonString);

                // SceneCustomMenuプラグインを探す
                const customMenuPlugin = plugins.find(p => p.name === 'SceneCustomMenu');
                if (!customMenuPlugin || !customMenuPlugin.parameters) {
                    throw new Error('SceneCustomMenu plugin not found in plugins.js');
                }

                // パラメータを更新
                customMenuPlugin.parameters[sceneKey] = JSON.stringify(rawData);

                // JSONを文字列に戻す
                const newJsonString = JSON.stringify(plugins, null, 4);

                // 元のファイル内容のJSON部分を置き換え
                const newContent = pluginsContent.substring(0, jsonStart) +
                    newJsonString +
                    pluginsContent.substring(jsonEnd + 1);

                // ファイルに書き込む
                fs.writeFileSync(pluginsPath, newContent, 'utf8');
                console.log(`Successfully saved scene data to plugins.js (${sceneKey})`);
                return true;

            } catch (error) {
                console.error('Error saving to plugins.js:', error);
                return false;
            }
        },

        findSceneKey: function (sceneId) {
            try {
                if (!$plugins) {
                    return null;
                }

                // SceneCustomMenuプラグインを取得
                const customMenuPlugin = $plugins.find(p => p.name === 'SceneCustomMenu');
                if (!customMenuPlugin || !customMenuPlugin.parameters) {
                    return null;
                }

                // 各SceneキーをチェックしてIdが一致するものを見つける
                for (let key in customMenuPlugin.parameters) {
                    if (key.match(/^Scene\d+$/)) {
                        try {
                            const sceneData = JSON.parse(customMenuPlugin.parameters[key]);
                            if (sceneData.Id === sceneId) {
                                return key;
                            }
                        } catch (e) {
                            // JSONパース失敗は無視
                        }
                    }
                }
            } catch (error) {
                console.error('Error finding scene key:', error);
            }
            return null;
        }
    };

    function getEditorHtmlPath() {
        const jsPath = getThisPluginPath();
        if (!jsPath) return null;
        return jsPath.replace(/\.js$/, ".html");
    }

    function getThisPluginPath() {
        const stack = new Error().stack;
        const scripts = PluginManager._scripts;

        for (const name of scripts) {
            // CustomMenuEditor.js を探す
            const regex = new RegExp(`${name}\\.js`, "i");
            if (regex.test(stack)) {
                return `js/plugins/${name}.js`;
            }
        }
        return null;
    }

    function openEditorWindow() {
        if (!Utils.isNwjs()) return;

        // すでに有効なウィンドウがあれば再利用
        if (editorWindow && !editorWindow.closed) {
            editorWindow.focus();
            return;
        }

        const htmlPath = getEditorHtmlPath();
        if (!htmlPath) return;

        nw.Window.open(htmlPath, {
            width: 900,
            height: 700,
            position: "center",
            focus: true
        }, win => {
            editorWindow = win;

            win.on("closed", () => {
                editorWindow = null;
            });
        });
    }

    // テスト用：メニュー開始時
    const _Scene_CustomMenu_start = Scene_CustomMenu.prototype.start;
    Scene_CustomMenu.prototype.start = function () {
        _Scene_CustomMenu_start.call(this);
        openEditorWindow();
    };

    // 非アクティブ時でも動作
    SceneManager.isGameActive = function () {
        return true;
    };
})();