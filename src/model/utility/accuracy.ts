import { AccuracyMode, AccuracyProvider, ArmorProvider, RollType, SaveType } from "./types";

const proficiency = [2, 2, 2, 2, 3, 3, 3 ,3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6];
class DMG implements ArmorProvider {
    _armorData = {
        bossAC: [13, 14, 15, 15, 15, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19],
        halfLevelAC: [13, 13, 13, 13, 13, 13, 13, 14, 14, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 17],
        onLevelAC: [13, 13, 13, 14, 15, 15, 15, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19]
    }
    _dexSave = {
        boss: [2, 2, 2, 3, 2, 2, 3, 4, 2, 3, 4, 3, 6, 5, 5, 5, 6, 7, 6, 8],
        halfLevel: [1, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 3],
        onLevel: [2, 1, 2, 2, 2, 2, 3, 2, 2, 3, 4, 2, 3, 4, 3, 6, 5, 5, 5, 6]
    }
    _wisSave = {
        boss: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 5, 7, 9, 6, 8, 8, 11, 11, 12],
        halfLevel: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4],
        onLevel: [0, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 5, 7, 9, 6, 8, 8]
    }
    armorForLevel(level: number, mode: AccuracyMode) {
        switch (mode) {
            case 'boss':
                return this._armorData.bossAC[level - 1];
            case 'half':
                return this._armorData.halfLevelAC[level - 1];
            case 'equal':
                return this._armorData.onLevelAC[level - 1];
            case 'ignore':
                return -10000;
            default:
                throw new Error('invalid mode: ' + mode);
        }
    }
    saveForLevel(level: number, mode: AccuracyMode, save: SaveType) {
        let source = save == 'DEX' ? this._dexSave : this._wisSave;
        
        switch (mode) {
            case 'boss':
                return source.boss[level - 1];
            case 'half':
                return source.halfLevel[level - 1];
            case 'equal':
                return source.onLevel[level - 1];
            case 'ignore':
                return -10000;
            default:
                throw new Error('invalid mode: '+mode);
        }
    }
}

class D20AccuracyProvider implements AccuracyProvider {
    _armorSource: ArmorProvider
    _flat = function (x: number): number {
        return 0.05*(21-x);
    }
    _advantage = function (x: number): number {
            return (21-x)*(x+19)/400;
        }
    _disadvantage = function (x: number): number {
            return Math.pow(21-x,2)/400;
        }
    
    constructor(source: string) {
        switch (source) {
            case 'dmg':
                this._armorSource = new DMG();
                break;
            default:
                throw new Error(`Source ${source} not supported`);
        }
    }

    vsAC(level: number, mode: AccuracyMode, modifier: number, extraCritRange: number, rollType: RollType) {
        let fullMod = modifier + proficiency[level - 1];
        let ac = this._armorSource.armorForLevel(level, mode);
        let toHit = ac-fullMod;
        let toCrit = 20-extraCritRange;
        let hit: number;
        let crit: number;
        if (mode == 'ignore') {
            hit = this._flat(-1000);
            crit = this._flat(toCrit);
        } else if (rollType == 'flat') {
            hit = this._flat(toHit);
            crit = this._flat(toCrit);
        } else if (rollType == 'advantage') {
            hit = this._advantage(toHit);
            crit = this._advantage(toCrit);
        } else if (rollType == 'disadvantage'){
            hit = this._disadvantage(toHit);
            crit = this._disadvantage(toCrit);
        } else if (rollType = 'flat-unproficient') {
            hit = this._flat(ac - modifier);
            crit = this._flat(toCrit);
        }
        return {
            hit: Math.max(0, Math.min(hit, 1-crit-0.05)),
            crit
        }
    }

    vsSave(level: number, mode: AccuracyMode, modifier: number, rollType: RollType, save: SaveType = 'DEX') {
        let dc = 8 + modifier + proficiency[level - 1];
        let saveBonus = this._armorSource.saveForLevel(level, mode, save);
        let success = 0;
        if (mode == "ignore") {}
        else if (rollType == 'flat') {
            success = this._flat(dc-saveBonus);
        } else if (rollType == 'advantage') {
            success = this._advantage(dc-saveBonus);
        } else if (rollType == 'disadvantage') {
            success = this._disadvantage(dc - saveBonus);
        }
        success = Math.max(0, success);
        return {fail: 1-success}
    }
}

export default D20AccuracyProvider