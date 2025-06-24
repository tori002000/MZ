/*:
 * @plugindesc 早送りスイッチプラグイン
 * @target MZ
 * @help
 * FastForwardSwitch.js
 * 
 * 指定したスイッチがONの間ボタン長押し早送り状態になります
 * 
 * 利用について:
 * 　自由
 * 
 * @param mapSwitchId
 * @text スイッチID
 * @desc スイッチがONの間早送り状態になります
 * @type switch
 * @default 
 */

(() => {
    const PN = 'FastForwardSwitch';
    const parameters = PluginManager.parameters(PN);
    const mapSwitchId = Number(parameters["mapSwitchId"] || 0);

    const _Scene_Map_isFastForward = Scene_Map.prototype.isFastForward;
    Scene_Map.prototype.isFastForward = function () {
        if ($gameMap.isEventRunning() && !SceneManager.isSceneChanging() && $gameSwitches.value(mapSwitchId) && !!mapSwitchId)
            return true;
        return _Scene_Map_isFastForward();
    };
})();