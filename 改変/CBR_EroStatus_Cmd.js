/*:
 * @target MZ
 * @plugindesc エロステータスプラグインにプラグインコマンドを追加するプラグイン
 * @base CBR_EroStatus
 * @orderAfter CBR_EroStatus
 * @author 
 *
 * @command openEroStatus
 * @text エロステータスを開く
 * @desc 
 * 
 * @command crearEroStatus
 * @text ページ初期化
 * @desc エロステータスページを初期化
 * 0:全てのページを初期化
 * 
 * @arg pageId
 * @text ページID
 * @desc 初期化するページのID
 * 0:全てのページを初期化
 * @default 0
 * 
 * @command declaratePageId
 * @text ページの宣言
 * @desc このコマンド以降の画像・テキストの挿入は宣言したページに挿入される
 * 
 * @arg pageId
 * @text ページID
 * @desc 宣言するページのID
 * @type number
 * @default 1
 * 
 * @command insertPicture
 * @text ピクチャの挿入
 * @desc 宣言されたページにピクチャを挿入
 * 
 * @arg picture
 * @text ピクチャファイル
 * @desc 表示するピクチャのファイル
 * 自動で拡張子pngが付与されるため拡張子は不要
 * @type file
 * @dir img/pictures
 * @default 
 * 
 * @arg x
 * @text X座標
 * @desc 
 * @type number
 * @min -9999
 * @default 0
 * 
 * @arg y
 * @text Y座標
 * @desc 
 * @type number
 * @min -9999
 * @default 0
 * 
 * @arg opacity
 * @text 不透明度
 * @desc 0～100
 * @type number
 * @max 100
 * @default 100
 * 
 * @arg scale
 * @text 拡大率
 * @desc 100:原寸
 * @type number
 * @default 100
 * 
 * @command insertText
 * @text テキストの挿入
 * @desc 宣言されたページにテキストを挿入
 * 
 * @arg text
 * @text テキスト
 * @desc 表示するテキストの内容
 * @default 
 * 
 * @arg x
 * @text X座標
 * @desc 
 * @type number
 * @min -9999
 * @default 0
 * 
 * @arg y
 * @text Y座標
 * @desc 
 * @type number
 * @min -9999
 * @default 0
 * 
 * @arg fontSize
 * @text フォントサイズ
 * @desc 
 * @type number
 * @default 28
 * 
 * @arg origin
 * @text X座標原点
 * @desc X座標の始点を指定
 * @type select
 * @option 左
 * @option 中
 * @option 右
 * @default 左
 * 
 * @arg alignment
 * @text テキスト配置（揃え）
 * @desc 途中でフォントサイズ大きくした時の揃え方を指定
 * @type select
 * @option 上
 * @option 中
 * @option 下
 * @default 上
 * 
 * @help エロステータスプラグインコマンド追加プラグイン
 * CBR_EroStatusの下位に登録してください
 * プラグインコマンドから各種命令ができるようになります
 * 
 * 数値やファイルを入力するダイアログでは、テキストタブに切り替えることで
 * スクリプト同様に変数の記入をすることができます
 * 
 * 
 */
(() => {

	const PN = 'CBR_EroStatus_Cmd';

	PluginManager.registerCommand(PN, "openEroStatus", args => {
		SceneManager.push(Scene_EroStatus);
	});
	PluginManager.registerCommand(PN, "crearEroStatus", args => {
		const pageId = (Number(args.pageId) || 0);
		if (!pageId) {
			CBR.eroStatus.data.length = 0;
		} else {
			delete CBR.eroStatus.data[pageId];
		}
	});
	PluginManager.registerCommand(PN, "declaratePageId", args => {
		const pageId = (Number(args.pageId) || 1);
		CBR.eroStatus.addPage = pageId - 1;
	});
	PluginManager.registerCommand(PN, "insertPicture", args => {
		const pictObj = [
			"画像-" + (args.picture || "") + ".png" + "\n",
			"x-" + (args.x || "0") + "\n",
			"y-" + (args.y || "0") + "\n",
			"透明度-" + (args.opacity || "100") + "\n",
			"サイズ-" + (args.scale || "100")
		];
		CBR["エロステータス"](pictObj);
	});
	PluginManager.registerCommand(PN, "insertText", args => {
		const textObj = [
			"テキスト-" + (args.text || "") + "\n",
			"x-" + (args.x || "0") + "\n",
			"y-" + (args.y || "0") + "\n",
			"左右-" + (args.origin || "左") + "\n",
			"上下-" + (args.alignment || "上") + "\n",
			"サイズ-" + (args.fontSize || String($gameSystem.mainFontSize()))
		];
		CBR["エロステータス"](textObj);
	});
})();