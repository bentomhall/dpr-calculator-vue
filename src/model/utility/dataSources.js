export class DMG {
    _armorData = {
        bossAC: [13, 14, 15, 15, 15, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19],
        halfLevelAC: [13, 13, 13, 13, 13, 13, 13, 14, 14, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 17],
        onLevelAC: [13, 13, 13, 14, 15, 15, 15, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19]
    };
    _dexSave = {
        boss: [2, 2, 2, 3, 2, 2, 3, 4, 2, 3, 4, 3, 6, 5, 5, 5, 6, 7, 6, 8],
        halfLevel: [1, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 3],
        onLevel: [2, 1, 2, 2, 2, 2, 3, 2, 2, 3, 4, 2, 3, 4, 3, 6, 5, 5, 5, 6]
    };
    _wisSave = {
        boss: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 5, 7, 9, 6, 8, 8, 11, 11, 12],
        halfLevel: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4],
        onLevel: [0, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 5, 7, 9, 6, 8, 8]
    };
    _hitPoints = {
        boss: [123, 138, 153, 168, 183, 198, 213, 228, 243, 258, 273, 288, 303, 318, 333, 348, 378, 423, 468, 513],
        halfLevel: [60, 78, 78, 93, 93, 108, 108, 123, 123, 138, 138, 153, 153, 168, 168, 183, 183, 198, 198, 213],
        onLevel: [78, 93, 108, 123, 138, 153, 168, 183, 198, 213, 228, 243, 258, 273, 288, 303, 318, 333, 348, 378]
    };
    armorForLevel(level, mode) {
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
    saveForLevel(level, mode, save) {
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
                throw new Error('invalid mode: ' + mode);
        }
    }
    hitPointsForLevel(level, mode) {
        let source = this._hitPoints;
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
                throw new Error('invalid mode: ' + mode);
        }
    }
}
