/*
############################################
	作者: COBRA
	改造や配布しても大丈夫だよ
	寧ろ積極的に配布して皆のゲーム快適にして
	http://cobrara.blogspot.jp/
############################################
*/

/*:
* @plugindesc 下着が見えるプラグイン　MZ改変
* @author COBRA　改変：「」
* @help --------------------------------------
* MZ用改変 V1
* CBR_tousi_MZ.js
* 公式プラグインPluginCommonBase.jsをベースにしているので
* PluginCommonBase.jsと一緒に導入し、このプラグインを下部に配置
* 覗き穴画像はimg/pictureに保存してください
* 
* プラグインパラメータ
* ・覗き穴画像
* 　覗き穴用の画像のファイル名（拡張子なし）
* 　ここで指定したファイルはデプロイメント時未使用ファイルとして除外されない
* 　Default: CBR_maru
* 
* ・覗き穴X座標、Y座標変数
* 　覗き穴の座標が格納されている変数ID
* 　指定した変数に格納されている座標を透視する（透視中に変数操作で移動可）
* 　0 or 空欄にした場合従来のようにカーソルに追従する
* 
* プラグインコマンド
* ・透視開始
* 　ピクチャ番号：透視したいピクチャの番号
* 　画像名：透視した時下に見える画像
* 　ここで指定したファイルはデプロイメント時未使用ファイルとして除外されない
* 
* ・透視終了
* 　ピクチャ番号：透視を終わらせたいピクチャの番号
* 
* 
* 変更点
* ・覗き穴の座標を変数の操作でも扱えるように
* ・透視していない時の透視終了でエラー落ちしないように
* ・ピクチャの表示　原点中央に対応
* 
* 
* 注意点 
* ・変数による画像指定に公式プラグインPluginCommonBase.jsを使用
* 　覗き穴画像をテキストタブ切り替えで\V[n]と記入し、
* 　変数の操作で変数nにスクリプト "CBR_maru" を代入（""込み・拡張子なし）
* 　覗き穴を変えるときは変数nに別の覗き穴のファイル名を代入
* 　のように使う
* ※変数で指定する画像はデプロイメント時に未使用ファイルとして除外されるため注意※
* 
* ・ピクチャの表示は拡大率100％で
* ・複数の画像ピクチャでマスクは非対応　服と穴は1対1
* ・終了コマンドのピクチャ番号は飾り　何を指定しても終了する
* 
* 
* 以下オリジナルのヘルプ
*--------------------------------------
* 
* Version 1.0.0
* 2018/4/1
*
* ピクチャを表示→スクリプトで
*
* CBR-tousi-start
* ピクチャ番号 = ピクチャ番号
* 画像 = 画像名
*
* または
* CBR.tousi.start(ピクチャ番号,"画像名");
*
*
* ピクチャ番号：透視したいピクチャの番号
* 画像名：透視した時下に見える画像
*
*
*
* 透視を終わらせたい→スクリプトを使って終了させます
*
*
*
* CBR-scan-end
* number = ピクチャ番号
*
* または
* CBR.scan.end(ピクチャ番号);
*
* CBR-scan-end
* CBR.scan.end()
* で一括終了
*
*
* 覗き穴画像はimg/pictureに保存してください
*
* 覗き穴画像に変数名を使いたい時は
* 画像名\\V[n] の形にしてください
*
*
* @param 覗き穴画像
* @desc 覗き穴画像、変数も使えます
* Default: CBR_maru
* @type file
* @dir img/pictures/
* @default CBR_maru
* 
* 
* @target MZ
* @base PluginCommonBase
* @orderAfter PluginCommonBase
* @param 覗き穴X座標変数
* @desc 覗き穴のX座標の変数
* 指定しない場合カーソルに追従する
* @type variable
* @default 0
* @param 覗き穴Y座標変数
* @desc 覗き穴のY座標の変数
* 指定しない場合カーソルに追従する
* @type variable
* @default 0
* @command tousi.start
* @text 透視開始
* @desc 透視を始めます
* @arg number
* @type string
* @text ピクチャ番号
* @desc 透視したいピクチャの番号
* @arg picture
* @type file
* @dir img/pictures/
* @text 画像
* @desc 透視した時下に見える画像
* @command scan.end
* @text 透視終了
* @desc 透視を終わらせます
* @arg number
* @type string
* @text ピクチャ番号
* @desc 透視を終わらせたいピクチャの番号
*/

const param = PluginManagerEx.createParameter(document.currentScript);
const hole = param['覗き穴画像'];
const holeX = param['覗き穴X座標変数'];
const holeY = param['覗き穴Y座標変数'];
PluginManagerEx.registerCommand(document.currentScript, "tousi.start", args => {
	CBR.tousi.start(args.number, args.picture);
});
PluginManagerEx.registerCommand(document.currentScript, "scan.end", args => {
	CBR.tousi.end(args.number);
});

var CBR = CBR || {};
CBR.tousi = {};

(function () {

	var CBR_Game_System_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function () {
		CBR_Game_System_initialize.call(this);
		this._CBR_scan = [];
	};
	//ロード時
	var CBR_Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
	Game_System.prototype.onAfterLoad = function () {
		CBR_Game_System_onAfterLoad.call(this);
		this._CBR_scan = this._CBR_scan || [];
	};

	//透視開始
	CBR.tousi.start = function (obj, b) {
		if (typeof obj == 'object') {
			$gameSystem.CBR_scan(Number(obj['ピクチャ番号']), obj['画像'], c);
		} else {
			$gameSystem.CBR_scan(obj, b);
		}
	};

	Game_System.prototype.CBR_scan = function (num, img) {
		this._CBR_scan.push({
			'num': num,
			'lingerie': img,
			'circle': param['覗き穴画像'],
			'del': null
		});
	};

	//透視停止
	CBR.tousi.end = function (num) {
		$gameSystem.CBR_scanEnd(num);
	};
	Game_System.prototype.CBR_scanEnd = function (num) {
		if (this._CBR_scan[num]) {//透視してない時のエラー落ち防止
			this._CBR_scan[num].del = true;
		}
	};

	var CBR_Scene_Map_updateMain = Scene_Map.prototype.updateMain;
	Scene_Map.prototype.updateMain = function () {
		CBR_Scene_Map_updateMain.call(this);//この位置を変えればメニューはなんとか
		var array_data = $gameSystem._CBR_scan;
		array_data.forEach(data => {
			if (data) {
				//プラグインコマンドで直接がいいけど　ここで消そう thisで消したいだけ　あとスクリプトで消してその後アップデート実行されない場合もあるかもしれないし
				if (data.del) {
					var CBR_sp = this._spriteset._pictureContainer.children[data.num - 1]
					CBR_sp.removeChildren();
					//delete data;
					$gameSystem._CBR_scan.splice(0, 1);
				} else {
					var pic = $gameScreen.picture(data.num);
					if (pic) {
						var x = pic.x();
						var y = pic.y();
						var CBR_sp = this._spriteset._pictureContainer.children[data.num - 1];//ピクチャ番号-1したスプライトが入ってる
						CBR_sp.removeChildren();
						//枠組みを作る
						var wrap_dummy = new PIXI.Sprite();
						var mapSprite = this._spriteset.children[0]; // 元のマップスプライト
						// RenderTextureを作成（指定したサイズで）
						var renderTexture = PIXI.RenderTexture.create({ width: CBR_sp.width, height: CBR_sp.height });
						// マップの特定の領域をRenderTextureに描画
						// マップ全体をRenderTextureにレンダリングするのではなく、特定の範囲を切り取る
						if (pic.origin()) {
						} else {
							Graphics.app.renderer.render(mapSprite, renderTexture, false,);
						}
						// 描画結果をSpriteとして作成
						var temp = new PIXI.Sprite(renderTexture);
						// wrap_dummyに追加
						wrap_dummy.addChild(temp);
						/*
						//直接xを変更したらアカンので
						var map_dummy = new PIXI.Sprite();
						var temp = Object.assign(new Sprite, this._spriteset.children[0]);//children[0]がマップのみ
						map_dummy.addChild(temp);
						map_dummy.x -= x;
						map_dummy.y -= y;
						wrap_dummy.addChild(map_dummy);
						*/
						//裸も追加 本当はサークルもここもPIXI.でやりたいけど暗号化の処理とbitmapの追加方法がよくわからんから
						//				var nude = new PIXI.Sprite(
						//					PIXI.Texture.fromImage('./img/pictures/'+this.CBR_scan.lingerie+'.png')
						//				);
						var nude = new Sprite();
						nude.bitmap = ImageManager.loadPicture(data.lingerie);
						//原点による位置調整
						if ($gameScreen.picture(data.num).origin()) {
							nude.x = nude.x - nude.width + nude.width / 2;
							nude.y = nude.y - nude.height + nude.height / 2;
						}
						wrap_dummy.addChild(nude);
						//円でマスクする
						var temp = data.circle;
						var circle = new Sprite();
						circle.bitmap = ImageManager.loadPicture(temp);
						if (holeX) {
							circle.x = $gameVariables.value(holeX) - x - circle.width / 2;
						} else {
							circle.x = TouchInput._CBR_x - x - circle.width / 2;
						}
						if (holeY) {
							circle.y = $gameVariables.value(holeY) - y - circle.height / 2;
						} else {
							circle.y = TouchInput._CBR_y - y - circle.height / 2;
						}
						wrap_dummy.mask = circle;
						wrap_dummy.addChild(circle);
						//ピクチャと合流させる
						CBR_sp.addChild(wrap_dummy);
					}
				}
			}
		});
	};
})();

if (!CBR_TouchInput_onMouseMove) {
	var CBR_TouchInput_onMouseMove = TouchInput._onMouseMove;
	TouchInput._onMouseMove = function (event) {
		var x = Graphics.pageToCanvasX(event.pageX);
		var y = Graphics.pageToCanvasY(event.pageY);
		this._CBR_onRealMove(x, y);
		CBR_TouchInput_onMouseMove.call(this, event);
	};
	TouchInput._CBR_onRealMove = function (x, y) {
		//	this._events.CBR_moved = true;　必要ないかな　常に変更されてるし
		this._CBR_x = x;
		this._CBR_y = y;
	};
}
