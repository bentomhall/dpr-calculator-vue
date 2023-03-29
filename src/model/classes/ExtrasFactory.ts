import Dice from "../utility/dice"
import { WeaponDie } from "../utility/features"
import { SaveType } from "../utility/types"

export type ClassDisplayExtras = {
    typeOptions: string[],
    configurationOptions: OptionDisplayItem[]
}

export class ExtrasFactory {
    static getRogue(): ClassDisplayExtras {
        let options : OptionDisplayItem[] = [
            {
                name: 'baseDieSize',
                label: 'Weapon Die Size',
                type: 'number',
                default: Dice.d6
            },
            {
                name: 'advantage',
                label: 'Fraction w/advantage',
                type: 'number',
                default: 0
            },
            {
                name: 'disadvantage',
                label: 'Fraction w/disadvantage',
                type: 'number',
                default: 0
            },
            {
                name: 'procChance',
                label: 'Sneak Attack Chance (%)',
                type: 'number',
                default: 1
            }
        ]

        return {
            typeOptions: ['red', 'twf'],
            configurationOptions: options
        }
    }
}

export type OptionDisplayItem = {name: string, label: string, type: 'select' | 'binary' | 'number', items?: string[], default?: string | boolean | number}

export class ClassOptions {
    baseDieCount: number = 1
    baseDieSize: number = Dice.d8
    procChance: number = 0
    saveType: SaveType = 'DEX'
    weaponType: WeaponDie = WeaponDie.d8
    advantage: number = 0
    disadvantage: number = 0
    toggles: Map<string, boolean> = new Map()
    dials: Map<string, number> = new Map()
    modifiers: {
        normal: number[] ,
        featAt4: number[],
        featAt8: number[],
        special: number[]
    } = {
        normal: [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
        featAt4: [3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5],
        featAt8: [3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5],
        special: [3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5]
    }

    constructor(advantage: number, disadvantage: number, dieSize: number, procChance: number, dieCount: number = 1, saveType: SaveType = 'DEX', weaponType: WeaponDie = WeaponDie.d8, toggles?: Map<string, boolean>, dials?: Map<string, number>, modifiers?: {normal: number[], featAt4: number[], featAt8: number[], special: number[]}) {
        this.advantage = advantage
        this.disadvantage = disadvantage
        this.baseDieSize = dieSize
        this.procChance = procChance
        this.baseDieCount = dieCount
        this.saveType = saveType
        this.weaponType = weaponType
        this.toggles = toggles
        this.dials = dials
        if (toggles) {
            this.toggles = toggles
        }
        if (dials) {
            this.dials = dials
        }
        if (modifiers) {
            this.modifiers = modifiers
        }
    }
}

export class ClassResources {
    rounds: number = 0
    combats: number = 0
    shortRests: number = 0
}