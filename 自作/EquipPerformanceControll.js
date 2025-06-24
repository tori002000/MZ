/*:
 * @target MZ
 * @plugindesc 最強装備の評価ポイント操作プラグイン
 * @author やっつけ
 * @help EquipPerformanceControll.js
 * 
 * 「攻撃力100の剣より攻撃力5＆最大HP100アップのナイフの方が強い」…
 * おかしいよなぁコレ！？
 * というわけで最強装備の評価ポイントを操作するプラグイン
 * 
 * 最強装備の評価は能力値変化量の合計で決まるらしい
 * そこで隠しパラメータ（性能には影響しない）を設定して評価を調整しよう
 * というアプローチ
 * 
 * 装備品のメモ欄に
 * <PP:数値>
 * と記入すると評価ポイント（能力値変化量の合計）が数値の値になる
 * <AP:数値>
 * と記入すると数値のぶん評価ポイントが上がるor下がる
 * 併用可
 * 
 * -1000を下回ると他に着るものが無い場合でもそれを装備しなくなるよ
 * 
 * 利用について
 * 用途・改変・二次配布・ライセンス表示に制限なし
 * 
 * 生まれたばかりのプラグインです。
 * 応援して下さいね☆
 * @url https://www.yahoo.co.jp/
 */
(() => {
    const PN = 'EquipPerformanceControll';

    Game_Actor.prototype.bestEquipItem = function(slotId) {
        const etypeId = this.equipSlots()[slotId];
        const items = $gameParty
            .equipItems()
            .filter(item => item.etypeId === etypeId && this.canEquip(item));
        let bestItem = null;
        let bestPerformance = -1000;
        var PP = null;
        for (let i = 0; i < items.length; i++) {
            const performance = this.calcEquipItemPerformance(items[i]);
            if (items[i].meta.PP != null){ /* meta.PPが隠しパラメータ　<PP:数値>が都合悪いならmeta.○○に書き換えれば<○○:数値>になるよ */
            PP=Number(items[i].meta.PP);
            } else {
                PP=performance;
            }
            if (items[i].meta.AP != null){
                PP += Number(items[i].meta.AP); /* 調整値 名前を変えたいときは上に同じ */
            }
            if (PP > bestPerformance) {
                bestPerformance = PP;
                bestItem = items[i];
            }
        }
        return bestItem;
    };
})();
