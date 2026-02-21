/*
############################################
	作者: KOBRA
	営利・非営利・18禁問わず配布可、改造も可、報告不要
	積極的に配布して皆のゲーム開発を快適にしてあげて
	http://cobrara.blogspot.jp/
	https://twitter.com/onarinin_san
############################################
*/
//とのことなのでGeminiくんに頼んで改造してもらいました

/*:
 * @target MZ
 * @plugindesc エロステータスをGUIで構築します
 * @author 
 *
 * @param SE
 * @text SE
 * @default Cursor3
 * @desc ページを変更した時のSE音を指定、デフォルト：Cursor3
 *
 * @param SEvol
 * @text SEボリューム
 * @type number
 * @default 100
 * @desc SE音の音量を指定、デフォルト：100
 *
 * @param window
 * @text ウィンドウの表示
 * @type boolean
 * @default true
 * @desc 背景としてウィンドウの枠を表示するかどうか
 *
 * @param font
 * @text フォント
 * @default 
 * @desc Project\fontsにwoffファイルを入れ、ファイル名を記入してください
 *
 * @help エロステータスプラグイン GUI
 *
 * エロステータスの詳細は本家プラグインを参照
 * 必ず本家プラグインのヘルプとサンプルプロジェクトに触れてから利用してください
 * 
 * ●重要：本家プラグインと同時に導入はできません
 * 　　　　当プラグイン及び本家プラグインを利用する際は
 * 　　　　必ずどちらか一方を無効にしてください
 * 
 * 「スクリプト」コマンドに
 * SceneManager.push(Scene_EroStatus)
 * と入力しエロステータスを開くとエディターウィンドウが表示されます
 * 
 * ゲーム画面の要素をクリックで選択できます
 * エディターからパラメータ入力の他、ドラッグで移動・サイズ変更も可能です
 * 
 * テキストの追加は[テキスト要素を追加]から
 * テキストの編集項目の下部には制御文字の入力補助が付いています
 * 
 * ピクチャの追加はゲーム画面にピクチャファイルをドラッグ＆ドロップ
 * なお、ピクチャはピクチャフォルダ以下にあるPNGファイルのみ受け付けます
 * 
 * セーブは[コモンEVに上書き]から行います
 * 事前にセーブ用のコモンイベントを用意してください
 * 
 */

//(function(){

var CBR = CBR || {};
CBR.eroStatus = {
	event: 0,
	se: "Cursor3",
	seVol: 100,
	addPage: 0,
	pageNow: 0,
	window: 0,
	font: false,
	data: [],
	originalData: []
};

if (!CBR_Game_Interpreter_command355) {
	var CBR_Game_Interpreter_command355 = Game_Interpreter.prototype.command355;
	Game_Interpreter.prototype.command355 = function () {
		//CBR-xxxの場合CBR.xxxにobjを渡す
		var key = this.currentCommand().parameters[0];
		if (key.match(/^CBR\-/)) {
			var obj = [];
			//下に続いてるスクリプトの取得
			while (this.nextEventCode() === 655) {
				this._index++;
				obj[obj.length] = this.currentCommand().parameters[0];
			}
			var temp = key.split('-');
			//CBR-×××があったら
			if (CBR[temp[1]]) {
				//下に続くデータを入れる
				CBR[temp[1]](obj);
			}
			//普通にスクリプト実行
		} else {
			CBR_Game_Interpreter_command355.call(this);
		}
		return true;
	};
};



CBR["エロステータス"] = function (ary) {	//スクリプト毎に実行されるヤツ
	//全てのデータを格納しよう
	//変数の変換は開く時かなー
	var obj = {};
	for (var A of ary) {
		//A = A.replace(/\\V\[(\d+)\]/g,function(a,b){//汚いけどこれは毎回やらないとね
		//		return $gameVariables.value(b);//律儀にNumberしなくてもいいか
		//});
		var temp = A.split(/\-(.*)/, 2);

		switch (temp[0]) {//初期化とページ変更はここで終わる
			case "初期化":
				if (temp[1] == 'ALL') {
					CBR.eroStatus.originalData.length = 0;
				} else {
					delete CBR.eroStatus.originalData[Number(temp[1]) - 1];
				}
				return;//break;
			case "ページ":
				CBR.eroStatus.addPage = Number(temp[1]) - 1;
				return;//break;
			case "画像":
			case "テキスト":
				obj.val = temp[1];
				obj.type = temp[0];
				break;
			case "x":
			case "y":
			case "サイズ":
			case "左右":
			case "上下":
			case "透明度":
				obj[temp[0]] = temp[1];
				break;
			default:
				//console.log("なにこれ？"+temp[0]);
				return;
		}
	}
	CBR.eroStatus.originalData[CBR.eroStatus.addPage] = CBR.eroStatus.originalData[CBR.eroStatus.addPage] || { "画像": [], "テキスト": [] };//ページがなかったら作る
	CBR.eroStatus.originalData[CBR.eroStatus.addPage][obj.type][CBR.eroStatus.originalData[CBR.eroStatus.addPage][obj.type].length] = obj;//んで入れる
};



//まずstarted const boxMargin = 4;が原因でマージンができてしまう

function Scene_EroStatus() {
	this.initialize(...arguments);
}

Scene_EroStatus.prototype = Object.create(Scene_Base.prototype);
Scene_EroStatus.prototype.constructor = Scene_EroStatus;

Scene_EroStatus.prototype.initialize = function () {
	Scene_Base.prototype.initialize.call(this);
	this._editorWindow = null;
};
Scene_EroStatus.prototype.create = function () {
	Scene_Base.prototype.create.call(this);
	//dataが空ならoriginalDataから複製
	if (!CBR.eroStatus.data || CBR.eroStatus.data.length === 0) {
		if (CBR.eroStatus.originalData) {
			CBR.eroStatus.data = JSON.parse(JSON.stringify(CBR.eroStatus.originalData));
		}
	}
	//data[{},{},,,]ってなってたら空の部分を削る
	var i = CBR.eroStatus.data.length - 1;
	while ((i >= 1) && !CBR.eroStatus.data[i]) {
		CBR.eroStatus.data.pop();
		i--;
	}

	//開いた時表示するページ
	CBR.eroStatus.pageNow = 0;
	if (i >= 0) {
		var i = 0;
		while (!CBR.eroStatus.data[i]) {
			i++
		}
	} else {
		i=0;
		CBR.eroStatus.data[i]={ "画像": [], "テキスト": [] };
	}
		CBR.eroStatus.pageNow = i;

		var param = PluginManager.parameters("CBR_EroStatus_GUI");
		CBR.eroStatus.se = (param["SE"] || 100);
		CBR.eroStatus.seVol = (param["SEvol"] || 100);
		if (param["window"] == "true") {
			CBR.eroStatus.window = true;
		} else {
			CBR.eroStatus.window = false;
		}
		CBR.eroStatus.font = param["font"] || false;
		if (CBR.eroStatus.font) {
			if (FontManager._urls["rmmz-mainfont"] != "fonts/" + CBR.eroStatus.font + ".woff") {
				FontManager._states["rmmz-mainfont"] = null;
				FontManager.load("rmmz-mainfont", CBR.eroStatus.font + ".woff");
			}
		}

		this.createBackground();
		this.createWindowLayer();
		this._windowLayer.x = 0;
		this._windowLayer.y = 0;
		this.createEroStatusWindow();
		this.openEditor();
		this.setupDragDrop();
	};
	Scene_EroStatus.prototype.terminate = function () {
		Scene_Base.prototype.terminate.call(this);
		this.removeDragDrop();
	};
	//今まで自力でロードフラグやってたけど今回は便利な物が、シーン.isReadyのおかげ
	Scene_EroStatus.prototype.start = function () {
		Scene_MenuBase.prototype.start.call(this);
		this._eroStatusWindow.refresh();
	};
	Scene_EroStatus.prototype.createEroStatusWindow = function () {
		const rect = this.eroStatusWindowRect();
		this._eroStatusWindow = new Window_EroStatus(rect);
		this._eroStatusWindow.setHandler("cancel", this.popScene.bind(this));
		this._eroStatusWindow.setOnSelect(this.onItemSelect.bind(this));
		this._eroStatusWindow.setOnPageChange(this.onPageChange.bind(this));
		this.addWindow(this._eroStatusWindow);
	};
	Scene_EroStatus.prototype.eroStatusWindowRect = function () {
		const ww = Graphics.width;
		const wh = Graphics.height;
		const wx = 0;
		const wy = 0;
		return new Rectangle(wx, wy, ww, wh);
	};
	Scene_EroStatus.prototype.update = function () {
		Scene_Base.prototype.update.call(this);
	};
	Scene_EroStatus.prototype.createBackground = function () {
		this._backgroundFilter = new PIXI.filters.BlurFilter();
		this._backgroundSprite = new Sprite();
		this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
		//なんか黒いフチが右下だけっていうのが気に入らないので四方に
		this._backgroundFilter.autoFit = false;

		this._backgroundSprite.filters = [this._backgroundFilter];
		this.addChild(this._backgroundSprite);
		this.setBackgroundOpacity(192);
	};
	Scene_EroStatus.prototype.setBackgroundOpacity = function (opacity) {
		this._backgroundSprite.opacity = opacity;
	};
	Scene_EroStatus.prototype.popScene = function () {
		FontManager._states["rmmz-mainfont"] = null;
		FontManager.load("rmmz-mainfont", $dataSystem.advanced.mainFontFilename);
		if (this._editorWindow && !this._editorWindow.closed) {
			this._editorWindow.close();
		}
		SceneManager.pop();
	};

	Scene_EroStatus.prototype.openEditor = function () {
		if (this._editorWindow && !this._editorWindow.closed) {
			this._editorWindow.focus();
			return;
		}
		const defaultFontSize = $dataSystem.advanced.fontSize;
		const editorHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>EroStatus Editor</title>
<style>
body { font-family: "Meiryo", sans-serif; font-size: 12px; background: #f4f4f4; margin: 0; padding: 10px; color: #333; }
.control-group { margin-bottom: 15px; background: #fff; padding: 10px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
.control-row { display: flex; align-items: center; margin-bottom: 5px; }
.control-row:last-child { margin-bottom: 0; }
.control-row label { width: 70px; color: #555; font-size: 11px; }
.control-row input, .control-row select { flex: 1; padding: 4px; border: 1px solid #ccc; border-radius: 3px; font-size: 12px; }
.control-row input:focus, .control-row select:focus { border-color: #88b; outline: none; }
h3 { margin: 0 0 10px 0; font-size: 12px; border-bottom: 1px solid #eee; padding-bottom: 5px; color: #333; font-weight: bold; }
button { padding: 5px 10px; border: 1px solid #ccc; background: #f8f8f8; border-radius: 3px; cursor: pointer; transition: all 0.2s; font-size: 12px; color: #333; }
button:hover { background: #e8e8e8; border-color: #bbb; }
button:active { background: #ddd; }
button.danger { background-color: #fff0f0; border-color: #ffcccc; color: #d00; }
button.danger:hover { background-color: #ffe0e0; border-color: #ffaaaa; }
button.primary { background-color: #f0f8ff; border-color: #cceeff; color: #0066cc; }
button.primary:hover { background-color: #e0f0ff; border-color: #99ddff; }
.btn-group { display: flex; gap: 5px; }
.btn-group button { flex: 1; }
.page-nav { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px; background: #fafafa; padding: 5px; border-radius: 4px; border: 1px solid #eee; }
.page-nav span { font-weight: bold; min-width: 50px; text-align: center; font-size: 13px; }
hr { border: 0; border-top: 1px solid #eee; margin: 10px 0; }
.full-width { width: 100%; }
.mt-5 { margin-top: 5px; }
.mb-5 { margin-bottom: 5px; }
.empty-state { color: #999; text-align: center; padding: 30px 10px; font-style: italic; }
</style>
</head>
<body oncontextmenu="event.preventDefault();">
<div class="control-group">
    <h3>ページ操作</h3>
    <div class="page-nav">
        <button onclick="prevPage()" style="width: 40px; margin-right: 10px;">＜</button>
        <span id="pageInfo" style="font-weight: bold; min-width: 60px; text-align: center; line-height: 24px;">ID: -</span>
        <button onclick="nextPage()" style="width: 40px; margin-left: 10px;">＞</button>
    </div>
    <div class="btn-group">
        <button onclick="addNewPage()" class="primary">ページ追加</button>
        <button onclick="deletePage()" class="danger">ページ削除</button>
    </div>
</div>

<div class="control-group">
    <h3>要素操作</h3>
    <button onclick="addNewText()" class="full-width">テキスト要素を追加</button>
    <div style="margin-top: 8px; font-size: 10px; color: #888; text-align: center;">
        ※画像はウィンドウへD&Dで追加
    </div>
</div>

<div id="content">
    <div class="control-group empty-state">
        要素を選択してください
    </div>
</div>

<div class="control-group">
    <h3>データ出力・管理</h3>
    <div class="control-row">
        <input type="checkbox" id="omitDefaults" checked style="flex: none; margin-right: 5px;">
        <label for="omitDefaults" style="width: auto; cursor: pointer;">デフォルト値を省略</label>
    </div>
    <div class="control-row">
        <button onclick="generateCommonEventScript()" style="flex: 1; font-size: 11px;">コモンイベントに上書き</button>
        <label for="commonEventId" style="width: 20px; text-align: right; margin-right: 5px;">ID:</label>
        <input type="number" id="commonEventId" value="1" min="1" style="width: 40px; flex: none;">
    </div>
    <div class="control-row" style="margin-top: 10px;">
    <button onclick="generateScript()" class="full-width mb-5">スクリプトをテキスト出力</button>
    </div>
    
    <hr>
    <button onclick="resetData()" class="full-width danger">リセット</button>
</div>
<script>
const defaultFontSize = ${defaultFontSize};
window.updateEditorView = function(item, index, total) {
    const content = document.getElementById('content');
    if (!item) {
        content.innerHTML = '<div class="control-group empty-state">要素を選択してください</div>';
        return;
    }
    const obj = item.obj;
    let html = '<div class="control-group">';
    
    // Header
    html += '<div class="control-row" style="justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">';
    html += '<h3 style="margin:0; border:0;">' + (item.type === 'image' ? '画像' : 'テキスト') + ' <span style="font-weight:normal; font-size:11px; color:#666;">(' + (index + 1) + '/' + total + ')</span></h3>';
    html += '<div class="btn-group" style="gap: 2px;">';
    html += '<button onclick="cycleItem(-1)" style="padding: 2px 6px; font-size: 10px;">≪</button>';
    html += '<button onclick="moveOrder(-1)" style="padding: 2px 6px; font-size: 10px;">奥へ</button>';
    html += '<button onclick="moveOrder(1)" style="padding: 2px 6px; font-size: 10px;">手前へ</button>';
    html += '<button onclick="cycleItem(1)" style="padding: 2px 6px; font-size: 10px;">≫</button>';
    html += '</div></div>';
    
    // Common Properties
    html += createInput('x', 'X座標', obj.x, 'number');
    html += createInput('y', 'Y座標', obj.y, 'number');
    
    if (item.type === 'image') {
        html += createInput('val', 'ファイル', obj.val);
        html += createInput('サイズ', 'サイズ(%)', obj['サイズ'] || 100, 'number');
        html += createInput('透明度', '透明度', obj['透明度'] || 100, 'number');
    } else if (item.type === 'text') {
        html += createInputWithHelper('val', 'テキスト', obj.val);
        html += createInput('サイズ', 'サイズ', obj['サイズ'] || defaultFontSize, 'number');
        html += createSelect('左右', '揃え(横)', obj['左右'] || '左', ['左', '中', '右']);
        html += createSelect('上下', '揃え(縦)', obj['上下'] || '上', ['上', '中', '下']);
    }
    
    html += '<hr>';
    html += '<button onclick="deleteItem()" class="full-width danger">この要素を削除</button>';
    html += '</div>';
    content.innerHTML = html;
};
function createInput(key, label, value, type = 'text') {
    return \`<div class="control-row"><label>\${label}</label><input type="\${type}" value="\${value}" oninput="onInputChange('\${key}', this)"></div>\`;
}
function createInputWithHelper(key, label, value) {
    const id = 'input_' + key;
    let html = \`<div class="control-row"><label>\${label}</label><input type="text" id="\${id}" value="\${value}" oninput="onInputChange('\${key}', this)"></div>\`;
    html += \`<div class="control-row" style="justify-content: flex-end; margin-top: -2px; margin-bottom: 5px;">\`;
    html += \`<select onchange="insertControlChar('\${id}', this)" style="width: auto; font-size: 10px; padding: 1px;">\`;
    html += \`<option value="">+ 制御文字</option>\`;
    html += \`<option value="\\\\V[1]">変数 \\\\V[n]</option>\`;
    html += \`<option value="\\\\N[1]">アクター名 \\\\N[n]</option>\`;
    html += \`<option value="\\\\P[1]">PT名 \\\\P[n]</option>\`;
    html += \`<option value="\\\\C[0]">色 \\\\C[n]</option>\`;
    html += \`<option value="\\\\{">文字大 \\\\{</option>\`;
    html += \`<option value="\\\\}">文字小 \\\\}</option>\`;
    html += \`</select></div>\`;
    return html;
}
function createSelect(key, label, value, options) {
    let html = \`<div class="control-row"><label>\${label}</label><select onchange="onInputChange('\${key}', this)">\`;
    options.forEach(opt => {
        const selected = opt === value ? 'selected' : '';
        html += \`<option value="\${opt}" \${selected}>\${opt}</option>\`;
    });
    html += \`</select></div>\`;
    return html;
}
window.updatePageInfo = function(pageIndex) {
    document.getElementById('pageInfo').innerText = 'ID: ' + (pageIndex + 1);
};
function addNewText() {
    if (window.openerScene) window.openerScene.addNewTextElement();
}
function addNewPage() {
    var id = prompt("追加するページIDを入力してください", "");
    if (id && window.openerScene) {
        window.openerScene.addNewPage(Number(id));
    }
}
function deletePage() {
    if (window.openerScene) window.openerScene.deletePage();
}
function resetData() {
    if (window.openerScene) window.openerScene.resetData();
}
function generateScript() {
    const omit = document.getElementById('omitDefaults').checked;
    if (window.openerScene) window.openerScene.generateScriptAndDownload(omit);
}
function generateCommonEventScript() {
    const commonEventId = document.getElementById('commonEventId').value;
    const omit = document.getElementById('omitDefaults').checked;
    if (window.openerScene) {
        window.openerScene.generateAndSaveToCommonEvent(Number(commonEventId), omit);
    }
}
function deleteItem() {
    if (confirm("この要素を削除しますか？")) {
        if (window.openerScene) window.openerScene.deleteItem();
    }
}
function prevPage() { if(window.openerScene) window.openerScene.changePage(-1); }
function nextPage() { if(window.openerScene) window.openerScene.changePage(1); }
function moveOrder(direction) {
    if (window.openerScene) window.openerScene.moveItemOrder(direction);
}
function cycleItem(direction) {
    if (window.openerScene) window.openerScene.cycleSelectedItem(direction);
}
window.insertControlChar = function(inputId, select) {
    if (!select.value) return;
    const input = document.getElementById(inputId);
    if (input) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;
        const insert = select.value;
        input.value = text.substring(0, start) + insert + text.substring(end);
        input.selectionStart = input.selectionEnd = start + insert.length;
        input.focus();
        const key = inputId.replace('input_', '');
        onInputChange(key, input);
    }
    select.value = "";
};
window.onInputChange = function(key, input) {
    let value = input.value;
    if (key === 'サイズ') {
        if (value !== '') {
            let num = parseInt(value);
            if (isNaN(num) || num < 1) num = 1;
            value = String(num);
            if (input.value !== value) input.value = value;
        }
    } else if (key === '透明度') {
        if (value !== '') {
            let num = parseInt(value);
            if (isNaN(num)) num = 0;
            if (num < 0) num = 0;
            if (num > 100) num = 100;
            value = String(num);
            if (input.value !== value) input.value = value;
        }
    }
    if (window.openerScene) window.openerScene.updateItemFromEditor(key, value);
};
</script></body></html>`;
		this._editorWindow = window.open('', 'EroStatusEditor', 'width=400,height=860,left=0,top=0');
		if (this._editorWindow) {
			this._editorWindow.document.write(editorHtml);
			this._editorWindow.openerScene = this;
			this.updateEditorPageInfo();
		}
	};
	Scene_EroStatus.prototype.onItemSelect = function (item) {
		if (this._editorWindow && !this._editorWindow.closed && this._editorWindow.updateEditorView) {
			let index = -1;
			let total = 0;
			if (item) {
				const pageData = CBR.eroStatus.data[CBR.eroStatus.pageNow];
				const typeKey = item.type === 'image' ? '画像' : 'テキスト';
				const list = pageData[typeKey];
				if (list) {
					index = list.indexOf(item.obj);
					total = list.length;
				}
			}
			this._editorWindow.updateEditorView(item, index, total);
		}
	};
	Scene_EroStatus.prototype.addNewTextElement = function () {
		const pageData = CBR.eroStatus.data[CBR.eroStatus.pageNow];
		if (pageData) {
			const newText = {
				type: "テキスト",
				val: "新規テキスト",
				x: "0",
				y: "0",
				"サイズ": String($dataSystem.advanced.fontSize),
				"左右": "左",
				"上下": "上"
			};
			pageData["テキスト"].push(newText);
			this._eroStatusWindow.refresh();
		}
	};
	Scene_EroStatus.prototype.addNewPage = function (pageId) {
		if (!pageId || isNaN(pageId) || pageId < 1) return;
		const index = pageId - 1;
		if (CBR.eroStatus.data[index]) {
			alert("ページID " + pageId + " は既に存在します。");
			return;
		}
		const newPage = { "画像": [], "テキスト": [] };
		CBR.eroStatus.data[index] = newPage;
		CBR.eroStatus.pageNow = index;
		this._eroStatusWindow._CBR_drawn = false;
		this._eroStatusWindow.refresh();
		this.onItemSelect(null);
		this.updateEditorPageInfo();
	};
	Scene_EroStatus.prototype.deletePage = function () {
		var pn = CBR.eroStatus.pageNow;
		if (pn === 0) {
			alert("ページID 1 は削除できません。");
			return;
		}
		if (!confirm("ページID " + (pn + 1) + " を削除しますか？")) {
			return;
		}

		delete CBR.eroStatus.data[pn];

		// 移動先を探す
		var next = -1;
		for (var i = pn - 1; i >= 0; i--) {
			if (CBR.eroStatus.data[i]) {
				next = i;
				break;
			}
		}
		if (next === -1) {
			for (var i = pn + 1; i < CBR.eroStatus.data.length; i++) {
				if (CBR.eroStatus.data[i]) {
					next = i;
					break;
				}
			}
		}
		if (next === -1) next = 0;

		CBR.eroStatus.pageNow = next;
		this._eroStatusWindow._CBR_drawn = false;
		this._eroStatusWindow.refresh();
		this.onPageChange();
	};
	Scene_EroStatus.prototype.resetData = function () {
		if (!confirm("現在の編集内容を破棄してシーンを閉じますか？")) {
			return;
		}
		CBR.eroStatus.data = [];
		this.popScene();
	};
	Scene_EroStatus.prototype.generateScriptLines = function (omitDefaults) {
		const scriptLines = [];

		CBR.eroStatus.data.forEach((pageData, index) => {
			if (!pageData) return; // 空のページはスキップ

			// ページ宣言
			scriptLines.push('CBR-エロステータス');
			scriptLines.push(`ページ-${index + 1}`);
			scriptLines.push('');

			// 画像要素
			if (pageData["画像"]) {
				pageData["画像"].forEach(obj => {
					scriptLines.push('CBR-エロステータス');
					scriptLines.push(`画像-${obj.val}`);
					if (obj.x !== undefined) scriptLines.push(`x-${obj.x}`);
					if (obj.y !== undefined) scriptLines.push(`y-${obj.y}`);
					if (!omitDefaults || (obj["透明度"] !== undefined && String(obj["透明度"]) !== "100")) {
						if (obj["透明度"] !== undefined) scriptLines.push(`透明度-${obj["透明度"]}`);
					}
					if (!omitDefaults || (obj["サイズ"] !== undefined && String(obj["サイズ"]) !== "100")) {
						if (obj["サイズ"] !== undefined) scriptLines.push(`サイズ-${obj["サイズ"]}`);
					}
					// 画像の左右・上下は元のスクリプトにはなかったので、もし必要なら追加
					scriptLines.push('');
				});
			}

			// テキスト要素
			if (pageData["テキスト"]) {
				pageData["テキスト"].forEach(obj => {
					scriptLines.push('CBR-エロステータス');
					scriptLines.push(`テキスト-${obj.val}`);
					if (obj.x !== undefined) scriptLines.push(`x-${obj.x}`);
					if (obj.y !== undefined) scriptLines.push(`y-${obj.y}`);
					if (!omitDefaults || (obj["サイズ"] !== undefined && String(obj["サイズ"]) !== String($dataSystem.advanced.fontSize))) {
						if (obj["サイズ"] !== undefined) scriptLines.push(`サイズ-${obj["サイズ"]}`);
					}
					if (!omitDefaults || (obj["左右"] !== undefined && obj["左右"] !== "左")) {
						if (obj["左右"] !== undefined) scriptLines.push(`左右-${obj["左右"]}`);
					}
					if (!omitDefaults || (obj["上下"] !== undefined && obj["上下"] !== "上")) {
						if (obj["上下"] !== undefined) scriptLines.push(`上下-${obj["上下"]}`);
					}
					scriptLines.push('');
				});
			}
		});
		return scriptLines;
	};
	Scene_EroStatus.prototype.generateScriptAndDownload = function (omitDefaults) {
		const scriptLines = this.generateScriptLines(omitDefaults);
		const scriptText = scriptLines.join('\n');
		const blob = new Blob([scriptText], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'EroStatusScript.txt';
		a.click();
		URL.revokeObjectURL(url);
	};
	Scene_EroStatus.prototype.generateAndSaveToCommonEvent = function (commonEventId, omitDefaults) {
		if (!commonEventId || commonEventId <= 0) {
			alert("有効なコモンイベントIDを指定してください。");
			return;
		}
		if (!confirm("コモンイベントID " + commonEventId + " を上書きしますか？")) {
			return;
		}

		const scriptLines = this.generateScriptLines(omitDefaults);
		const eventList = [];
		let inBlock = false;
		for (const line of scriptLines) {
			if (line === '') {
				inBlock = false;
				continue;
			}
			if (line === 'CBR-エロステータス') {
				eventList.push({ code: 355, indent: 0, parameters: [line] });
				inBlock = true;
			} else if (inBlock) {
				eventList.push({ code: 655, indent: 0, parameters: [line] });
			}
		}
		if (eventList.length > 0) {
			eventList.push({ "code": 0, "indent": 0, "parameters": [] });
		}

		if (typeof require !== 'function') {
			alert("この機能はNW.js環境でのみ利用可能です。");
			return;
		}
		const path = require('path');
		const fs = require('fs');
		const projectDir = path.dirname(process.mainModule.filename);
		const commonEventsPath = path.join(projectDir, 'data', 'CommonEvents.json');

		try {
			const data = fs.readFileSync(commonEventsPath, 'utf8');
			const commonEvents = JSON.parse(data);
			if (commonEvents && commonEvents[commonEventId]) {
				commonEvents[commonEventId].list = eventList;
				const newJsonString = JSON.stringify(commonEvents, null, 2);
				fs.writeFileSync(commonEventsPath, newJsonString, 'utf8');
				alert(`コモンイベントID ${commonEventId} にスクリプトを出力しました。`);
			} else {
				alert(`コモンイベントID ${commonEventId} が見つかりません。`);
			}
		} catch (e) {
			console.error(e);
			alert("CommonEvents.jsonの読み書きに失敗しました。");
		}
	};
	Scene_EroStatus.prototype.deleteItem = function () {
		const win = this._eroStatusWindow;
		if (!win || !win._selectedItem) return;

		const item = win._selectedItem;
		const pageData = CBR.eroStatus.data[CBR.eroStatus.pageNow];
		const typeKey = item.type === 'image' ? '画像' : 'テキスト';
		const list = pageData[typeKey];

		if (list) {
			const index = list.indexOf(item.obj);
			if (index > -1) {
				list.splice(index, 1);
				win._selectedItem = null;
				win.refresh();
				this.onItemSelect(null);
			}
		}
	};
	Scene_EroStatus.prototype.moveItemOrder = function (direction) {
		const win = this._eroStatusWindow;
		if (!win || !win._selectedItem) return;

		const item = win._selectedItem;
		const pageData = CBR.eroStatus.data[CBR.eroStatus.pageNow];
		const typeKey = item.type === 'image' ? '画像' : 'テキスト';
		const list = pageData[typeKey];

		if (!list) return;
		const index = list.indexOf(item.obj);
		if (index === -1) return;

		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= list.length) return;

		const temp = list[index];
		list[index] = list[newIndex];
		list[newIndex] = temp;

		win.refresh();
		this.onItemSelect(win._selectedItem);
	};
	Scene_EroStatus.prototype.cycleSelectedItem = function (direction) {
		const win = this._eroStatusWindow;
		if (!win || !win._selectedItem) return;

		const item = win._selectedItem;
		const pageData = CBR.eroStatus.data[CBR.eroStatus.pageNow];
		const typeKey = item.type === 'image' ? '画像' : 'テキスト';
		const list = pageData[typeKey];

		if (!list || list.length <= 1) return;

		const currentIndex = list.indexOf(item.obj);
		if (currentIndex === -1) return;

		const newIndex = (currentIndex + direction + list.length) % list.length;
		const newItemObj = list[newIndex];

		const newHitArea = win._hitAreas.find(area => area.obj === newItemObj);
		if (newHitArea) {
			win._selectedItem = newHitArea;
			this.onItemSelect(newHitArea);
			win.refresh();
		}
	};
	Scene_EroStatus.prototype.changePage = function (d) {
		var pn = CBR.eroStatus.pageNow;
		var n;
		// Window_EroStatus.updateと同じロジックで次/前の有効なページを探す
		if (d > 0) {
			for (var i = 1, len = CBR.eroStatus.data.length; i < len; i++) {
				n = i + pn;
				if (len <= i + pn) {
					n -= len;
				}
				if (CBR.eroStatus.data[n]) {
					break;
				}
			}
		} else if (d < 0) {
			for (var i = 1, len = CBR.eroStatus.data.length; i < len; i++) {
				n = pn - i;
				if (n < 0) {
					n += len;
				}
				if (CBR.eroStatus.data[n]) {
					break;
				}
			}
		}

		if (n !== undefined && CBR.eroStatus.data[n] && CBR.eroStatus.pageNow != n) {
			CBR.eroStatus.pageNow = n;
			this._eroStatusWindow._CBR_drawn = false;
			this._eroStatusWindow.refresh();
			this.onPageChange();
		}
	};
	Scene_EroStatus.prototype.onPageChange = function () {
		this.onItemSelect(null);
		this.updateEditorPageInfo();
	};
	Scene_EroStatus.prototype.updateEditorPageInfo = function () {
		if (this._editorWindow && !this._editorWindow.closed && this._editorWindow.updatePageInfo) {
			this._editorWindow.updatePageInfo(CBR.eroStatus.pageNow);
		}
	};
	Scene_EroStatus.prototype.updateItemFromEditor = function (key, value) {
		if (this._eroStatusWindow && this._eroStatusWindow._selectedItem) {
			this._eroStatusWindow._selectedItem.obj[key] = value;
			this._eroStatusWindow.refresh();
		}
	};
	Scene_EroStatus.prototype.setupDragDrop = function () {
		this._dragOverHandler = this.onDragOver.bind(this);
		this._dropHandler = this.onDrop.bind(this);
		document.addEventListener('dragover', this._dragOverHandler);
		document.addEventListener('drop', this._dropHandler);
	};
	Scene_EroStatus.prototype.removeDragDrop = function () {
		document.removeEventListener('dragover', this._dragOverHandler);
		document.removeEventListener('drop', this._dropHandler);
	};
	Scene_EroStatus.prototype.onDragOver = function (event) {
		event.preventDefault();
	};
	Scene_EroStatus.prototype.onDrop = function (event) {
		event.preventDefault();
		if (!CBR.eroStatus.data[CBR.eroStatus.pageNow]) return;

		const files = event.dataTransfer.files;
		if (files.length > 0) {
			if (typeof require !== 'function') return;
			const path = require('path');
			const projectDir = path.dirname(process.mainModule.filename);
			const picturesDir = path.join(projectDir, "img", "pictures");

			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				if (file.type !== 'image/png') {
					console.warn("PNGファイルではないためスキップされました: " + file.name);
					continue;
				}
				const filePath = file.path;
				const relative = path.relative(picturesDir, filePath);

				if (!relative.startsWith('..') && !path.isAbsolute(relative)) {
					const normalizedRelative = relative.replace(/\\/g, '/');
					this.addPictureElement(normalizedRelative);
				}
			}
		}
	};
	Scene_EroStatus.prototype.addPictureElement = function (fileName) {
		const pageData = CBR.eroStatus.data[CBR.eroStatus.pageNow];
		if (pageData) {
			const newPic = {
				type: "画像",
				val: fileName,
				x: "0",
				y: "0",
				"透明度": "100",
				"サイズ": "100",
			};
			pageData["画像"].push(newPic);
			this._eroStatusWindow.refresh();

			const win = this._eroStatusWindow;
			const hitArea = win._hitAreas.find(area => area.obj === newPic);
			if (hitArea) {
				win._selectedItem = hitArea;
				win.refresh();
				this.onItemSelect(hitArea);
			}
		}
	};

	//ウィンドウ
	function Window_EroStatus() {
		this.initialize(...arguments);
	}

	Window_EroStatus.prototype = Object.create(Window_Selectable.prototype);
	Window_EroStatus.prototype.constructor = Window_EroStatus;

	Window_EroStatus.prototype.initialize = function (rect) {
		Window_Selectable.prototype.initialize.call(this, rect);
		this._CBR_drawn = false;
		this._hitAreas = [];
		this._selectedItem = null;
		this._dragging = false;
		this._lastTouchX = 0;
		this._lastTouchY = 0;
		this._resizing = false;
		this._resizeStartSize = 100;
		this._resizeStartDist = 0;
		this._resizeCenter = { x: 0, y: 0 };
		this._onSelect = null;
		this._onPageChange = null;
		this.refresh();
	};
	Window_EroStatus.prototype.itemPadding = function () {
		return 0;
	};
	Window_EroStatus.prototype.updatePadding = function () {
		this.padding = 0;
	};

	Window_EroStatus.prototype.colSpacing = function () {
		return 0;
	};
	Window_EroStatus.prototype.rowSpacing = function () {
		return 0;
	};
	Window_EroStatus.prototype.setOnSelect = function (callback) {
		this._onSelect = callback;
	};
	Window_EroStatus.prototype.setOnPageChange = function (callback) {
		this._onPageChange = callback;
	};

	Window_EroStatus.prototype.update = function () {
		Window_Selectable.prototype.update.call(this);
		this.processTouch();

		if (CBR.eroStatus.data.length !== 1 && ImageManager.isReady() && FontManager.isReady()) {//読み込み終わってたら、結局画像読み終えてない限りリフレッシュする必要なし
			var pn = CBR.eroStatus.pageNow;
			var n;
			if (Input.isRepeated("right")) {
				for (var i = 1, len = CBR.eroStatus.data.length; i < len; i++) {
					n = i + pn;
					if (len <= i + pn) {
						n -= len;
					}
					if (CBR.eroStatus.data[n]) {
						break;
					}
				}
			} else if (Input.isRepeated("left")) {
				for (var i = 1, len = CBR.eroStatus.data.length; i < len; i++) {
					n = pn - i;
					if (n < 0) {
						n += len;
					}
					if (CBR.eroStatus.data[n]) {
						break;
					}
				}
			}
			if (n !== undefined && CBR.eroStatus.data[n] && CBR.eroStatus.pageNow != n) {//ページの変更だったら
				CBR.eroStatus.pageNow = n;
				AudioManager.playSe({ "name": CBR.eroStatus.se, "volume": CBR.eroStatus.seVol, "pitch": 100, "pan": 0 });
				this._CBR_drawn = false;
				this.refresh();
				if (this._onPageChange) this._onPageChange();
			} else if (!this._CBR_drawn) {//画像が読み込まれてるというのに描写されて無い時
				this.refresh();
			}
		}

	};

	Window_EroStatus.prototype.processTouch = function () {
		if (TouchInput.isTriggered()) {
			const x = TouchInput.x;
			const y = TouchInput.y;

			// リサイズハンドルの判定
			if (this._selectedItem) {
				const handles = this.getHandleRects(this._selectedItem.rect);
				const handleHit = handles.find(h =>
					x >= h.rect.x && x < h.rect.x + h.rect.width &&
					y >= h.rect.y && y < h.rect.y + h.rect.height
				);
				if (handleHit) {
					this._resizing = true;
					this._resizeStartSize = Number(this._selectedItem.obj["サイズ"] || 100);
					const cx = this._selectedItem.rect.x + this._selectedItem.rect.width / 2;
					const cy = this._selectedItem.rect.y + this._selectedItem.rect.height / 2;
					this._resizeCenter = { x: cx, y: cy };
					this._resizeStartDist = Math.hypot(x - cx, y - cy);
					return;
				}
			}

			const hit = this._hitAreas.slice().reverse().find(area => {
				return x >= area.rect.x && x < area.rect.x + area.rect.width &&
					y >= area.rect.y && y < area.rect.y + area.rect.height;
			});

			if (hit) {
				this._selectedItem = hit;
				this._dragging = true;
				this._lastTouchX = x;
				this._lastTouchY = y;
				this.refresh();
				if (this._onSelect) this._onSelect(this._selectedItem);
//				SoundManager.playCursor();
			} else if (this._selectedItem) {
				this._selectedItem = null;
				this.refresh();
				if (this._onSelect) this._onSelect(null);
			}
		} else if (TouchInput.isPressed()) {
			if (this._resizing && this._selectedItem) {
				const x = TouchInput.x;
				const y = TouchInput.y;
				const currentDist = Math.hypot(x - this._resizeCenter.x, y - this._resizeCenter.y);
				if (this._resizeStartDist > 0) {
					const scale = currentDist / this._resizeStartDist;
					let newSize = Math.floor(this._resizeStartSize * scale);
					if (newSize < 10) newSize = 10;
					this._selectedItem.obj["サイズ"] = newSize;
					this.refresh();
					if (this._onSelect) this._onSelect(this._selectedItem);
				}
			} else if (this._dragging && this._selectedItem) {
				const x = TouchInput.x;
				const y = TouchInput.y;
				const dx = x - this._lastTouchX;
				const dy = y - this._lastTouchY;
				if (dx !== 0 || dy !== 0) {
					this._selectedItem.obj.x = Number(this._selectedItem.obj.x) + dx;
					this._selectedItem.obj.y = Number(this._selectedItem.obj.y) + dy;
					this._lastTouchX = x;
					this._lastTouchY = y;
					this.refresh();
					if (this._onSelect) this._onSelect(this._selectedItem);
				}
			}
		} else if (TouchInput.isReleased()) {
			this._dragging = false;
			this._resizing = false;
		}
	};

	Window_EroStatus.prototype.refresh = function () {
		const rect = this.itemLineRect(0);
		const x = rect.x;
		const y = rect.y;
		const width = rect.width;
		this.contents.clear();
		this._hitAreas = [];

		var test = CBR.eroStatus.data[CBR.eroStatus.pageNow];//このページの画像&&テキスト
		if (!test) {
			return;
		}
		for (var obj of test["画像"]) {

			var val = obj.val.replace(/\\V\[(\d+)\]/g, function (a, b) {
				return $gameVariables.value(b);
			});
			const bitmap = ImageManager.loadPicture(val.slice(0, -4));

			const pw = bitmap.width;
			const ph = bitmap.height;
			var top = 0;
			var left = 0;
			if (obj["透明度"]) {
				this.contents.paintOpacity = 255 * Number(obj["透明度"]) / 100;
			}
			var zoom = 1;
			if (obj["サイズ"]) {
				zoom = Number(obj["サイズ"]) / 100;
			}
			var dx = Number(obj.x) + left;
			var dy = Number(obj.y) + top;
			var dw = pw * zoom;
			var dh = ph * zoom;
			this._hitAreas.push({ type: 'image', obj: obj, rect: new Rectangle(dx, dy, dw, dh) });

			this.contents.blt(bitmap, 0, 0, pw, ph, dx, dy, dw, dh);
			this.contents.paintOpacity = 255;
		}

		//画像読み込み全部終わってなかったら終了
		if (!ImageManager.isReady()) {
			return;
		}


		for (var obj of test["テキスト"]) {
			//まず変数や値を変換
			var text = obj.val.replace(/\\(\\)|\\([VNP])\[(\d+)\]|\\(<)(.+)\\>/g, function (a, b, c, d, e, f) {
				if (b) {//\\
					return '\\';
				} else if (c) {//[VNP]
					d = Number(d);
					switch (c) {
						case 'V':
							return $gameVariables.value(d);
							break;
						case 'N':
							return $gameActors._data[d]._name;
							break;
						case 'P':
							return $dataActors[$gameParty._actors[d - 1]].name;
							break;
					}
				} else {//script
					return eval(f);
				}
			});

			this.contents.context.font = this.contents._makeFontNameText();
			this.contents.fontSize = Number(obj["サイズ"]) || $gameSystem.mainFontSize();
			this.resetTextColor();

			const reg = RegExp(/\\([CI])\[(\d+)\]|\\\{|\\\}/, 'g');
			var ary;
			var c = 0;
			var left = 0;

			var strAry = [];//分割された文字列いれる
			var wAry = [];//分割された横幅いれる
			var fAry = [];//分割ごとの操作を入れる

			var ii = 0;
			var strWidth = 0;
			var maxH = this.contents.fontSize;
			//テキストのwidthや分割集め
			while ((ary = reg.exec(text)) !== null) {

				var str = text.substring(c, ary.index);//描写したい部分を抜き出す
				strAry[ii] = str;
				wAry[ii] = this.textWidth(str);
				strWidth += wAry[ii];

				switch (ary[1]) {
					case undefined://{や}の時
						if (ary[0].substring(1) == "{") {
							fAry[ii] = { type: "{" };
							this.contents.fontSize += 6;
							if (maxH < this.contents.fontSize) {
								maxH = this.contents.fontSize;
							}
						} else {
							fAry[ii] = { type: "}" };
							this.contents.fontSize -= 6;
						}
						break;
					default:
						fAry[ii] = { type: ary[1], val: ary[2] };
						break;
				}

				c = reg.lastIndex;
				ii++;
			}
			if (c != text.length) {
				var str = text.substring(c);//描写したい部分を抜き出す
				strAry[ii] = str;
				fAry[ii] = { type: false, val: false };
				wAry[ii] = this.textWidth(str);
				strWidth += wAry[ii];
				ii++;
			}

			this.contents.context.font = this.contents._makeFontNameText();
			this.contents.fontSize = Number(obj["サイズ"]) || $gameSystem.mainFontSize();

			var left = 0;
			var top = 0;
			if (obj["左右"] == "中") {
				left -= strWidth / 2;
			} else if (obj["左右"] == "右") {
				left -= strWidth;
			}

			var dx = Number(obj.x) + left;
			var dy = Number(obj.y);
			var dw = strWidth;
			var dh = maxH;
			this._hitAreas.push({ type: 'text', obj: obj, rect: new Rectangle(dx, dy, dw, dh) });

			for (var i = 0; i < ii; i++) {
				var top = 0;
				if (obj["上下"] == "中") {
					top = maxH / 2 - this.contents.fontSize / 2;
				} else if (obj["上下"] == "下") {
					top = maxH - this.contents.fontSize;
				}
				this.drawText(strAry[i], Number(obj.x) + left, Number(obj.y) + top, wAry[i], this.contents.fontSize, "right");
				left += wAry[i];
				switch (fAry[i].type) {
					case 'C':
						this.changeTextColor(ColorManager.textColor(fAry[i].val));//カラチェン
						break;
					case 'I':
						//return $gameActors._data[d]._name;
						break;
					case "{":
						this.contents.fontSize += 6;
						break;
					case "}":
						this.contents.fontSize -= 6;
						break;
				}
			}

			this.resetTextColor();
			this.contents.fontSize = $gameSystem.mainFontSize();
			this._CBR_drawn = true;
		}

		if (this._selectedItem) {
			const newSelected = this._hitAreas.find(area => area.obj === this._selectedItem.obj);
			if (newSelected) {
				this._selectedItem = newSelected;
			} else {
				this._selectedItem = null;
			}
		}

		if (this._selectedItem) {
			this.drawSelectionRect(this._selectedItem.rect);
		}
	};
	//window.drawTextだとlineHeightが36に固定されちゃうので変える
	Window_EroStatus.prototype.drawText = function (text, x, y, maxWidth, h, align) {
		this.contents.drawText(text, x, y, maxWidth, h, align);
	};

	Window_EroStatus.prototype.getHandleRects = function (rect) {
		const size = 12; // ハンドルサイズ
		const half = size / 2;
		return [
			{ rect: new Rectangle(rect.x - half, rect.y - half, size, size) },
			{ rect: new Rectangle(rect.x + rect.width - half, rect.y - half, size, size) },
			{ rect: new Rectangle(rect.x - half, rect.y + rect.height - half, size, size) },
			{ rect: new Rectangle(rect.x + rect.width - half, rect.y + rect.height - half, size, size) }
		];
	};

	Window_EroStatus.prototype.drawSelectionRect = function (rect) {
		const context = this.contents.context;
		context.save();
		context.strokeStyle = 'rgba(255, 255, 0, 0.8)';
		context.lineWidth = 2;
		context.strokeRect(rect.x, rect.y, rect.width, rect.height);

		// ハンドル描画
		context.fillStyle = 'rgba(255, 255, 255, 1)';
		context.strokeStyle = 'rgba(0, 0, 0, 1)';
		const handles = this.getHandleRects(rect);
		for (const h of handles) {
			context.fillRect(h.rect.x, h.rect.y, h.rect.width, h.rect.height);
			context.strokeRect(h.rect.x, h.rect.y, h.rect.width, h.rect.height);
		}

		context.restore();
	};

	Window_EroStatus.prototype.open = function () {
		this.refresh();
		Window_Selectable.prototype.open.call(this);
	};
	//アクティブじゃなくてもキャンセルできるように
	Window_EroStatus.prototype.processHandling = function () {
		if (this.isCancelEnabled() && this.isCancelTriggered()) {
			return this.processCancel();
		}
	};
	Window_EroStatus.prototype.loadWindowskin = function () {
		if (CBR.eroStatus.window) {
			this.windowskin = ImageManager.loadSystem("Window");
		} else {
			return;
		}
	};