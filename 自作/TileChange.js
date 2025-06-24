/*:
 * @plugindesc タイルを書き換えるプラグイン
 * @target MZ
 * @base PluginCommonBase
 * @orderAfter PluginCommonBase
 * @url https://www.rakuten.co.jp/
 * 
 * @command setAutoTile_autoLayer
 * @text タイルを変更（自動レイヤー）
 * @desc 指定座標のタイルを書き換えます。
 * レイヤーはタイルに合わせて自動で設定されます。
 *
 * @arg X
 * @type string
 * @text X座標
 * @desc タイルのX座標
 * @default
 * 
 * @arg Y
 * @type string
 * @text Y座標
 * @desc タイルのY座標
 *
 * @arg tileId
 * @type string
 * @text タイルID
 * @desc 設定するタイルID
 * 
 * @arg isAutoTile
 * @type boolean
 * @text オートタイル
 * @desc オートタイルで周囲になじませる
 * タイルセットA1～A4までのものが対応
 * @default true
 *
 * @arg shadow
 * @type boolean
 * @text 影
 * @desc 周囲のタイル状況から必要に応じて影をかける
 * @default true
 * 
 * @command setAutoTile
 * @text タイルを変更
 * @desc 指定座標のタイルを書き換えます。
 *
 * @arg coordinates
 * @type struct<coordinates>
 * @text 座標
 * @desc タイルを変更する座標
 *
 * @arg tileId
 * @type string
 * @text タイルID
 * @desc 設定するタイルID
 * 
 * @arg isAutoTile
 * @type boolean
 * @text オートタイル
 * @desc オートタイルで周囲になじませる
 * タイルセットA1～A4までのものが対応
 * @default true
 *
 * @arg shadow
 * @type boolean
 * @text 影
 * @desc 周囲のタイル状況から必要に応じて影をかける
 * @default true
 * 
 * @command updateAutoTile
 * @text オートタイルを更新
 * @desc 指定座標のタイルをオートタイルで馴染ませます。
 * 
 * @arg coordinates
 * @type struct<coordinates>
 * @text 座標
 * @desc 更新するタイルの座標
 * 
 * @arg shadow
 * @type boolean
 * @text 影
 * @desc 周囲のタイル状況から必要に応じて影をかける
 * @default true
 * 
 * @command setNeighborsAutoTile
 * @text 周囲のオートタイルを変更
 * @desc 指定座標の周囲のタイルをオートタイルで馴染ませます。
 * 
 * @arg coordinates
 * @type struct<coordinates>
 * @text 座標
 * @desc 中心となるタイルの座標
 * 
 * @arg shadow
 * @type boolean
 * @text 影
 * @desc 周囲のタイル状況から必要に応じて影をかける
 * @default true
 * 
 * @command clearTileChanges
 * @text 指定マップのタイル変更をリセット
 * @desc 指定したマップIDのタイル変更情報をリセットします。
 * （1～: マップID, 0: 全てのマップ, -1: 現在のマップ）
 *
 * @arg mapId
 * @type string
 * @text マップID
 * @desc リセットするマップID
 * （1～: マップID, 0: 全てのマップ, -1: 現在のマップ）
 * 
 * @arg refresh
 * @type boolean
 * @text リフレッシュ
 * @desc リセット後にマップの再読み込みをする
 * @default true
 * 
 * @command checkTileId
 * @text タイルIDを取得
 * @desc 指定座標のタイルIDを取得し変数に格納します。
 *
 * @arg coordinates
 * @type struct<coordinates>
 * @text 座標
 * @desc 取得するタイルの座標
 * 
 * @arg variableId
 * @type variable
 * @text 変数ID
 * @desc 取得したタイルIDを格納する変数ID
 * 
 * 
 * @help
 * 指定座標のタイルをオートタイルを考慮し書き換えます。
 * 
 * 公式プラグインPluginCommonBase.jsをベースにしています。
 * PluginCommonBase.jsと共に導入してください。
 * 
 * タイルIDはエディター上で確認することができません。
 * 一度テストマップにタイルを置き、
 * コマンド「タイルIDを取得」を使って確認するのがおすすめです。
 * 
 * 注意点
 * ・大量のタイルの書き換えを行うと描画の処理が重くなる。
 * 　（数千タイルの書き換えには向かない）
 * 
 * 更新
 * ・各種書き換えコマンド終了時に再描画を行いラグを解消
 * ・リセット後の再描画を選択式に（タイル以外もリセットされるため）
 * ・自動レイヤー設定を実装
 * ・壁面タイルのオートタイルが入隅を判定するように
 * ・通常タイルをオートタイル設定で置く際、そのまま置くように修正
 * ・現在のマップのタイル変更をリセットした際の再描画をスムーズに
 * ・影に対応
 * ・マップ外と接する面は「同種のタイルと接している」として扱うように
 * ・パターン表1に本来設定不可能な隠しパターンのデータを追加
 * ・座標XYZを構造体で一まとめに
 * 
 * 
 * 
 * 
 * 利用について
 * 用途・改変・再配布・権利表示に制限なし
 * 
 */
/* 
 * 課題
 * ・必要のない座標調査が多い
 * 
 * ・タイル変更をリセットした後の再描画をシーン切り替えで実現しているため、タイル変更以外の状態もリセットされてしまう
 * 　またフェードの一時的な無効化を行っており、フェードを伴う処理と競合する可能性あり
 *  
 * 
 */

/*~struct~coordinates:
 *
 * @param X
 * @type string
 * @text X座標
 * @desc タイルのX座標
 * @default
 * @param Y
 * @type string
 * @text Y座標
 * @desc タイルのY座標
 * @default
 * @param Z
 * @type string
 * @text Z座標
 * @desc タイルのZ座標（0: 下層, 1: 中下層, 2: 中上層, 3: 上層）
 * @default
*/
(() => {
    const neighborsOffset = [
        { dx: 0, dy: 0 },                                        // 空データ
        { dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 },   // 下
        { dx: -1, dy: 0 }, { dx: 0, dy: 0 }, { dx: 1, dy: 0 },   // 中
        { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 } // 上
    ];
    const shadowOffset = [{ dx: -1, dy: 0 }, { dx: -1, dy: -1 }];

    //オートタイルパターン表
    const autoTilePattern1 = [//上下左右に加え斜めも接続するタイプ　パターン全48通り
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1, 1, 0, 1, 1], [0, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 1, 1, 1, 1, 1, 1, 0, 1, 0],//上下左右が繋がっているパターン
        [0, 1, 1, 0, 1, 1, 1, 1, 1, 1], [0, 1, 1, 0, 1, 1, 1, 0, 1, 1], [0, 1, 1, 0, 1, 1, 1, 1, 1, 0], [0, 1, 1, 0, 1, 1, 1, 0, 1, 0],//同上
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1], [0, 0, 1, 1, 1, 1, 1, 0, 1, 1], [0, 0, 1, 1, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 1, 1, 0, 1, 0],//同上
        [0, 0, 1, 0, 1, 1, 1, 1, 1, 1], [0, 0, 1, 0, 1, 1, 1, 0, 1, 1], [0, 0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 0, 1, 1, 1, 0, 1, 0],//同上
        [0, 0, 1, 1, 0, 1, 1, 0, 1, 1], [0, 0, 1, 1, 0, 1, 1, 0, 1, 0], [0, 0, 1, 0, 0, 1, 1, 0, 1, 1], [0, 0, 1, 0, 0, 1, 1, 0, 1, 0],//左が繋がっていないパターン
        [0, 1, 1, 1, 1, 1, 1, 0, 0, 0], [0, 1, 1, 0, 1, 1, 1, 0, 0, 0], [0, 0, 1, 1, 1, 1, 1, 0, 0, 0], [0, 0, 1, 0, 1, 1, 1, 0, 0, 0],//上が繋がっていないパターン
        [0, 1, 1, 0, 1, 1, 0, 1, 1, 0], [0, 0, 1, 0, 1, 1, 0, 1, 1, 0], [0, 1, 1, 0, 1, 1, 0, 0, 1, 0], [0, 0, 1, 0, 1, 1, 0, 0, 1, 0],//右が繋がっていないパターン
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 1, 1, 1, 0, 1, 1], [0, 0, 0, 0, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 1, 1, 1, 0, 1, 0],//下が繋がっていないパターン
        [0, 0, 1, 0, 0, 1, 0, 0, 1, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0],//左・右、上・下が繋がってないパターン
        [0, 0, 1, 1, 0, 1, 1, 0, 0, 0], [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],//左・上が繋がってないパターン　┌
        [0, 1, 1, 0, 1, 1, 0, 0, 0, 0], [0, 0, 1, 0, 1, 1, 0, 0, 0, 0],//右・上が繋がってないパターン　┐
        [0, 0, 0, 0, 1, 1, 0, 1, 1, 0], [0, 0, 0, 0, 1, 1, 0, 0, 1, 0],//右・下が繋がってないパターン　┘
        [0, 0, 0, 0, 0, 1, 1, 0, 1, 1], [0, 0, 0, 0, 0, 1, 1, 0, 1, 0],//左・下が繋がってないパターン　└
        [0, 0, 1, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 1, 0], [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],//下、右、上、左以外繋がってないパターン
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//どことも繋がってないパターンと無加工パターン（エディターでは設定不可）
    ];
    const autoTilePattern2 = [//上下左右のみ接続するタイプ　パターン全16通り　最下位ビットから左・上・右・下の順で2進数方式
        [0, 0, 1, 0, 1, 1, 1, 0, 1, 0], [0, 0, 1, 0, 0, 1, 1, 0, 1, 0], [0, 0, 1, 0, 1, 1, 1, 0, 0, 0], [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 0, 1, 1, 0, 0, 1, 0], [0, 0, 1, 0, 0, 1, 0, 0, 1, 0], [0, 0, 1, 0, 1, 1, 0, 0, 0, 0], [0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 0, 1, 0], [0, 0, 0, 0, 0, 1, 1, 0, 1, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 1, 0], [0, 0, 0, 0, 0, 1, 0, 0, 1, 0], [0, 0, 0, 0, 1, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    ];
    const autoTilePattern3 = [//左右のみ接続するタイプ　パターン全4通り
        [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 0, 1, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    ];

    var fadeON = true;

    PluginManagerEx.registerCommand(document.currentScript, "setAutoTile", args => {
        const x = Number(args.coordinates.X);
        const y = Number(args.coordinates.Y);
        const z = Number(args.coordinates.Z);
        const isAutoTile = Boolean(args.isAutoTile);
        const tileId = Number(args.tileId);
        const shadow = Boolean(args.shadow);
        if (isAutoTile && Tilemap.isAutotile(tileId)) {
            $gameMap.setAutoTile(x, y, z, tileId);//オートタイルON
        } else {
            $gameMap.setTile(x, y, z, tileId);//オートタイルOFF
        };
        if (shadow) $gameMap.setShadow(x, y);
        $gameMap.forceRefresh();
    });
    PluginManagerEx.registerCommand(document.currentScript, "updateAutoTile", args => {
        const x = Number(args.coordinates.X);
        const y = Number(args.coordinates.Y);
        const z = Number(args.coordinates.Z);
        const shadow = Boolean(args.shadow);
        $gameMap.updateAutoTile(x, y, z);
        if (shadow) $gameMap.setShadow(x, y);
        $gameMap.forceRefresh();
    });
    PluginManagerEx.registerCommand(document.currentScript, "setNeighborsAutoTile", args => {
        const x = Number(args.coordinates.X);
        const y = Number(args.coordinates.Y);
        const z = Number(args.coordinates.Z);
        const shadow = Boolean(args.shadow);
        neighborsOffset.forEach((offset, index) => {
            if (index === 0 || index === 5) { return; };// 空データと指定座標（中央）をスキップ
            const nx = x + offset.dx;
            const ny = y + offset.dy;
            if ($gameMap.isValid(nx, ny)) {
                $gameMap.updateAutoTile(nx, ny, z);
                if (shadow) $gameMap.setShadow(nx, ny);
            };
        });
        $gameMap.forceRefresh();
    });
    PluginManagerEx.registerCommand(document.currentScript, "clearTileChanges", args => {
        const mapId = Number(args.mapId);
        const ref = Number(args.refresh);
        if (mapId < 0) {
            $gameMap.clearTileChanges($gameMap.mapId(), ref);// 指定されたマップが-1の場合現在のマップIDに
        } else {
            $gameMap.clearTileChanges(mapId, ref);
        };
    });
    PluginManagerEx.registerCommand(document.currentScript, "checkTileId", args => {
        const x = Number(args.coordinates.X);
        const y = Number(args.coordinates.Y);
        const z = Number(args.coordinates.Z);
        const variableId = Number(args.variableId);
        if ($gameMap.isValid(x, y)) { $gameVariables.setValue(variableId, $gameMap.tileId(x, y, z)); };
    });
    PluginManagerEx.registerCommand(document.currentScript, "setAutoTile_autoLayer", args => {
        const x = Number(args.X);
        const y = Number(args.Y);
        const isAutoTile = Boolean(args.isAutoTile);
        const tileId = Number(args.tileId);
        const shadow = Boolean(args.shadow);
        var z;
        if (Tilemap.isAutotile(tileId) || Tilemap.isTileA5(tileId)) {//A系タイル
            if (Tilemap.isLayer1Tile(tileId)) {//レイヤー1に配置するタイル
                z = 1;
                if (Tilemap.isTileA1) {//水場（レイヤー0に水を配置もするタイル）
                    if (isAutoTile && Tilemap.isAutotile(tileId)) {
                        $gameMap.setAutoTile(x, y, 0, 2094);//オートタイルON
                    } else {
                        $gameMap.setTile(x, y, 0, 2094);//オートタイルOFF
                    };
                };
            } else {//レイヤー0に配置するタイル
                $gameMap.setTile(x, y, 1, 0);
                z = 0;
            };
        } else {//B・C・D・Eタイル
            z = 3;
            if (tileId === 0) {//タイルID0（消しゴム）
                $gameMap.setTile(x, y, 2, tileId);
            } else if ($gameMap.tileId(x, y, 3) !== tileId) {
                //レイヤー3に同じタイルが置かれてない場合、今置かれているタイルをレイヤー2に移動させる
                $gameMap.setTile(x, y, 2, $gameMap.tileId(x, y, 3));
            }
        };
        if (isAutoTile && Tilemap.isAutotile(tileId)) {
            $gameMap.setAutoTile(x, y, z, tileId);//オートタイルON
        } else {
            $gameMap.setTile(x, y, z, tileId);//オートタイルOFF
        };
        if (shadow) $gameMap.setShadow(x, y);
        $gameMap.forceRefresh();
    });

    //オートタイル変更
    Game_Map.prototype.setAutoTile = function (x, y, z, tileId) {
        if (!this.isValid(x, y)) return; // 無効な座標は無視
        const tileId1 = this.tileId(x, y, z);
        const tileKind = Tilemap.getAutotileKind(tileId);
        const tileCategory = Classify(tileId);

        // 周囲8方向を調査
        const neighborTiles = [];
        neighborsOffset.forEach((offset, index) => {
            if (index === 0) {             // 空データをスキップ
                neighborTiles.push(0);
                return;
            };
            if (index === 5) {             // 指定座標（中央）をスキップ
                neighborTiles.push(1);
                return;
            };
            const nx = x + offset.dx;
            const ny = y + offset.dy;
            if (this.isValid(nx, ny)) {
                const a = $gameMap.tileId(nx, ny, z);
                var b;
                if (tileCategory === 1) {//水面の場合、滝の隣接も判定
                    b = Number(Tilemap.isWaterfallTile(a) || Tilemap.isSameKindTile(a, tileId))
                } else if (tileCategory === 4) {//滝の場合、水面・滝の隣接も判定
                    b = Number(Tilemap.isWaterTile(a));
                } else {
                    b = Number(Tilemap.isSameKindTile(a, tileId));
                };
                neighborTiles.push(b);
            } else {
                neighborTiles.push(1);
            };
        });
        //調査結果を整形しパターン表と照合
        const shape = reshape(neighborTiles, tileCategory);

        //タイルIDを再計算して変更の必要がある（現在のタイルとは違うタイル・パターンになる）場合変更
        const tileId3 = Tilemap.makeAutotileId(tileKind, shape);
        if (tileId1 !== tileId3) {
            this.setTile(x, y, z, tileId3);
        };

    };

    //タイルを変更
    Game_Map.prototype.setTile = function (x, y, z, tileId) {
        if (!this.isValid(x, y)) return; // 無効な座標は無視

        const width = $dataMap.width;
        const height = $dataMap.height;
        const index = x + y * width + z * width * height;

        $dataMap.data[index] = tileId;  // タイルデータを書き換え

        // 履歴に記録
        const mapId = this.mapId();
        $gameSystem._tileChanges = $gameSystem._tileChanges || {};
        $gameSystem._tileChanges[mapId] = $gameSystem._tileChanges[mapId] || [];
        // 重複チェック（同じ座標の変更が既に記録されていれば更新）
        const changes = $gameSystem._tileChanges[mapId];
        const existingChange = changes.find(change => change.x === x && change.y === y && change.z === z);
        if (existingChange) {
            existingChange.tileId = tileId;
        } else {
            changes.push({ x, y, z, tileId });
        }
    };

    //影を変更
    Game_Map.prototype.setShadow = function (x, y) {
        if (!this.isValid(x, y)) return; // 無効な座標は無視
        // 左と左上のタイルを調査
        var shadow = true;
        shadowOffset.forEach((offset) => {
            if (!shadow) return;
            const nx = x + offset.dx;
            const ny = y + offset.dy;
            if (this.isValid(nx, ny)) {
                const a = $gameMap.tileId(nx, ny, 0);
                shadow = Tilemap.isShadowingTile(a);
            } else {
                shadow = false;
            };
        });
        //変更の必要がある（現在の影とは違うパターンになる）場合変更
        const shadow1 = this.tileId(x, y, 4);
        const tileId1 = this.tileId(x, y, 0);
        const b = !Tilemap.isShadowingTile(tileId1);
        if (b && shadow) {
            if (shadow1 !== 5) {
                this.setTile(x, y, 4, 5);
            }
        } else if ((shadow1 !== 0)) {
            this.setTile(x, y, 4, 0);
        };
    };

    //指定座標がオートタイルか判別し、オートタイルなら更新
    Game_Map.prototype.updateAutoTile = function (x, y, z) {
        if (!this.isValid(x, y)) return;
        const tileId = this.tileId(x, y, z);
        const isAutoTile = Tilemap.isAutotile(tileId);
        if (isAutoTile) {
            this.setAutoTile(x, y, z, tileId);
        };
    };

    //履歴の消去
    Game_Map.prototype.clearTileChanges = function (mapId, ref) {
        if (mapId === 0) {//指定されたマップが0の場合全消去
            delete $gameSystem._tileChanges;
            if (ref) {// 現在のマップを消去した場合リフレッシュ
                fadeON = false;//フェード抑制
                SceneManager.goto(Scene_Map);
            };
        } else if ($gameSystem._tileChanges?.[mapId]) {
            delete $gameSystem._tileChanges[mapId];
            if (ref) {
                fadeON = false;
                SceneManager.goto(Scene_Map);
            };
        };
    };

    //オートタイルのタイルパターンの分類を返す関数
    function Classify(tileId) {
        if (Tilemap.isWaterTile(tileId)) {
            if (Tilemap.isWaterfallTile(tileId)) {
                return 4;//autoTilePattern3_滝
            } else {
                return 1;//autoTilePattern1_水面
            };
        } else if (Tilemap.isWallSideTile(tileId)) {
            return 3;    //autoTilePattern2_壁側面
        } else if (Tilemap.isRoofTile(tileId)) {
            return 2;    //autoTilePattern2_屋根
        } else {
            return 0;    //autoTilePattern1_地面等
        };
    };

    //分類と周囲のタイルからパターンの番号を返す関数
    function reshape(neighborTiles, tileCategory) {
        if (tileCategory < 0) { console.warn("整形エラー1"); return };
        if (tileCategory <= 1) { //パターン1の場合、上下左右の繋がっている面に合わせて斜めの情報を塗りつぶし
            if (!neighborTiles[2]) {
                neighborTiles[1] = 0;
                neighborTiles[3] = 0;
            };
            if (!neighborTiles[4]) {
                neighborTiles[1] = 0;
                neighborTiles[7] = 0;
            };
            if (!neighborTiles[6]) {
                neighborTiles[3] = 0;
                neighborTiles[9] = 0;
            };
            if (!neighborTiles[8]) {
                neighborTiles[7] = 0;
                neighborTiles[9] = 0;
            }
            //パターン表と照合
            const shape = autoTilePattern1.findIndex(element => element.every((value, index) => value === neighborTiles[index]));
            if (shape < 0) { console.warn("パターン照合エラー1"); return; };//エラーチェック
            return shape;
        } else if (tileCategory <= 3) {//パターン2の場合、斜めの情報を塗りつぶし
            if (tileCategory === 3) {//壁面の場合、左右が入隅かに合わせて左右の情報を塗りつぶし
                if (neighborTiles[4] && (neighborTiles[1] !== neighborTiles[2]) || (neighborTiles[7] !== neighborTiles[8])) {
                    neighborTiles[4] = 0;
                };
                if (neighborTiles[6] && (neighborTiles[3] !== neighborTiles[2]) || (neighborTiles[9] !== neighborTiles[8])) {
                    neighborTiles[6] = 0;
                };
            }
            neighborTiles[1] = 0;
            neighborTiles[3] = 0;
            neighborTiles[7] = 0;
            neighborTiles[9] = 0;
            //パターン表と照合
            const shape = autoTilePattern2.findIndex(element => element.every((value, index) => value === neighborTiles[index]));
            if (shape < 0) { console.warn("パターン照合エラー2"); return; };//エラーチェック
            return shape;
        } else if (tileCategory === 4) {//パターン3の場合、横以外の情報を塗りつぶし
            neighborTiles[1] = 0;
            neighborTiles[2] = 0;
            neighborTiles[3] = 0;
            neighborTiles[7] = 0;
            neighborTiles[8] = 0;
            neighborTiles[9] = 0;
            //パターン表と照合
            const shape = autoTilePattern3.findIndex(element => element.every((value, index) => value === neighborTiles[index]));
            if (shape < 0) { console.warn("パターン照合エラー3"); return; };//エラーチェック
            return shape;
        } else {
            console.warn("整形エラー2");
        }
    };

    //自動レイヤー時レイヤー1に配置されるタイルかを返すメソッド
    Tilemap.isLayer1Tile = function (tileId) {
        const a = (2096 <= tileId && tileId <= 2239);
        const b = (this.TILE_ID_A2 + (48 * 4) <= tileId) && (tileId <= this.TILE_ID_A2 + (48 * 8) - 1);
        const c = (this.TILE_ID_A2 + (48 * 12) <= tileId) && (tileId <= this.TILE_ID_A2 + (48 * 16) - 1);
        const d = (this.TILE_ID_A2 + (48 * 20) <= tileId) && (tileId <= this.TILE_ID_A2 + (48 * 24) - 1);
        const e = (this.TILE_ID_A2 + (48 * 28) <= tileId) && (tileId <= this.TILE_ID_A2 + (48 * 32) - 1);
        return a || b || c || d || e;
    };

    //タイルの再描画
    Game_Map.prototype.forceRefresh = function () {
        const scene = SceneManager._scene;
        if (scene instanceof Scene_Map) {
            // マップデータを更新
            $gameMap.requestRefresh();
            // 必要なスプライトの再描画を個別に処理
            const spriteset = scene._spriteset;
            spriteset._tilemap.refresh(); 
            spriteset.update();           
        }
    };

    // マップ読み込み時に履歴を元に変更を適用
    const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function () {
        _Scene_Map_onMapLoaded.call(this);
        $gameMap.applyTileChanges();
    };
    Game_Map.prototype.applyTileChanges = function () {
        const mapId = this.mapId();
        const changes = $gameSystem._tileChanges?.[mapId];
        if (changes) {
            changes.forEach(change => {
                const width = $dataMap.width;
                const height = $dataMap.height;
                const index = change.x + change.y * width + change.z * width * height;
                $dataMap.data[index] = change.tileId;
            });
        }
    };

    //フェード抑制の処理
    const _Scene_Base_startFadeOut = Scene_Base.prototype.startFadeOut;
    Scene_Base.prototype.startFadeOut = function () {
        if (fadeON) {
            _Scene_Base_startFadeOut.call(this);
        } else {
            fadeON = true;
        };
    };
})();
