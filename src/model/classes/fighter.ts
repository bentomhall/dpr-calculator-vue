import Dice from "../utility/dice";
import { AccuracyMode, AccuracyProvider, Preset, PresetProvider } from "../utility/types";
import { AttackDamageOptions, AttackSource, DamageOutput } from "../utility/attacks";
import { AttackModifier, Feat, FightingStyleHandler, WeaponDie } from "../utility/features";
import { CalculationProvider } from "../../controller";
import { ClassEntity } from "./ClassEntity";
import { ClassOptions } from "./ExtrasFactory";

class Fighter extends ClassEntity {
	public readonly name = 'Fighter';
	private baseModifiers = [3, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
	private featAt4Modifiers = [3, 3, 3, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
	private options: FighterOptions
	private resources: {rests: number, rounds: number}

	presets(provider: AccuracyProvider, mode: AccuracyMode): Preset[] {
		// return [
		// 	['champion_snb_nr', { name: 'SnB Champion Fighter (No Action Surge)', obj: this, type: 'snb', resources: null, options: {weaponDie: Dice.d8, weaponType: 'longsword'} }],
		// 	['champion_snb_3', { name: 'SnB Champion Fighter (1 SR / 3 rounds)', obj: this, type: 'snb', resources: { rounds: 3, rests: 0 }, options: {weaponDie: Dice.d8, weaponType: 'longsword'} }],
		// 	['champion_snb_6', { name: 'SnB Champion Fighter (1 SR / 6 rounds)', obj: this, type: 'snb', resources: { rounds: 6, rests: 0 }, options: {weaponDie: Dice.d8, weaponType: 'longsword'} }],
		// 	['champion_snb_9', { name: 'SnB Champion Fighter (1 SR / 9 rounds)', obj: this, type: 'snb', resources: { rounds: 9, rests: 0 }, options: {weaponDie: Dice.d8, weaponType: 'longsword'} }],
		// 	['champion_snb_4', { name: 'SnB Champion Fighter (1 SR / 4 rounds)', obj: this, type: 'snb', resources: { rounds: 4, rests: 0 }, options: {weaponDie: Dice.d8, weaponType: 'longsword'} }],
		// 	['champion_gs_nr', { name: 'GS Champion Fighter (No Action Surge)', obj: this, type: 'gs', resources: null, options: {weaponDie: 2*Dice.d6, weaponType: 'greatsword'} }],
		// 	['champion_gs_3', { name: 'GS Champion Fighter (1 SR / 3 rounds)', obj: this, type: 'gs', resources: { rounds: 3, rests: 0 }, options: {weaponDie: 2*Dice.d6, weaponType: 'greatsword'} }],
		// 	['champion_gs_6', { name: 'GS Champion Fighter (1 SR / 6 rounds)', obj: this, type: 'gs', resources: { rounds: 6, rests: 0 }, options: {weaponDie: 2*Dice.d6, weaponType: 'greatsword'} }],
		// 	['champion_gs_9', { name: 'GS Champion Fighter (1 SR / 9 rounds)', obj: this, type: 'gs', resources: { rounds: 9, rests: 0 }, options: {weaponDie: 2*Dice.d6, weaponType: 'greatsword'} }],
		// 	['champion_gs_4', { name: 'GS Champion Fighter (1 SR / 4 rounds)', obj: this, type: 'gs', resources: { rounds: 4, rests: 0 }, options: {weaponDie: 2*Dice.d6, weaponType: 'greatsword'} }],
		// 	['champion_gs_pa_9', { name: 'GWF (GS) Champion Fighter (Always Power Attack, 1 SR / 9 rounds)', obj: this, type: 'gs_pa', resources: { rounds: 9, rests: 0 }, options: {weaponDie: 2*Dice.d6, weaponType: 'greatsword', gWMStart: 1, gWMProc: 0, pAMStart: null} }],
		// 	['champion_gwm_pam_9', { name: 'GWF (glaive) Champion Fighter (PAM at 1, Always Power Attack from 4, 1 SR / 9 rounds)', obj: this, type: 'gwm_pam', resources: { rounds: 9, rests: 0 }, options: {weaponDie: Dice.d10, weaponType: 'glaive', gWMStart: 4, pAMStart: 1, gWMProc: 0} }],
		// 	['champion_pam_9', { name: 'GWF (glaive) Champion Fighter (PAM at 1, no GWM, 1 SR / 9 rounds)', obj: this, type: 'pam', resources: { rounds: 9, rests: 0 }, options: {weaponDie: Dice.d10, weaponType: 'polearm'} }],
		// ] as [string, Preset][]
		return [
			{name:'GS Champion (No AS)', type:'gs', obj:new Fighter(new ClassOptions(0, 0, 2*Dice.d6, 0, 2, null, WeaponDie.d6x2, new Map([['useActionSurge', false]])), provider, mode)}
		]
	}

	getDescription(key: string): string {
		switch(key) {
			case 'gs':
				return 'Greatsword (Champion)'
			case 'snb':
				return 'Sword n\' Board (Champion)'
			case 'gs_pa':
				return 'Power Attacking Greatsword'
			case 'pam':
				return 'Pole Arm Master (glaive)'
			case 'gwm_pam':
				return 'GWM/PAM (glaive)'
			case 'useActionSurge':
				return 'Enable Action Surge'
			case 'gWMProc':
				return 'GWM BA proc rate (decimal)'
			case 'gWMStart':
				return 'GWM starting at level'
			case 'rests':
				return 'Short rests per LR'
			case 'rounds':
				return 'Combat rounds per SR'
			default:
				return ''
		}
	}

	constructor(options: ClassOptions | null, provider: AccuracyProvider, mode: AccuracyMode) {
		super(provider, mode)
		this.validTypes = ['gs', 'snb', 'gs_pa', 'pam', 'gwm_pam']
		this.options = {
			weaponDie: options?.baseDieSize ?? Dice.d8,
			weaponType: options?.weaponType ?? WeaponDie.d8,
			advantage: options?.advantage ?? 0,
			disadvantage: options?.disadvantage ?? 0,
			useActionSurge: options?.toggles?.get('useActionSurge') ?? false,
			gWMProc: options?.dials?.get('gWMProc') ?? 0,
			gWMStart: options?.dials?.get('gWMStart') ?? 21
		}
		this.resources = {
			rests: options?.dials?.get('rests') ?? 0,
			rounds: options?.dials?.get('rounds') ?? 1
		}
		if (options) {
			this.baseModifiers = options.modifiers.normal
			this.featAt4Modifiers = options.modifiers.featAt4
		}
	}

	configure(options: ClassOptions): Fighter {
		this.options = {
			weaponDie: options.baseDieSize ?? Dice.d8,
			weaponType: options.weaponType ?? WeaponDie.d8,
			advantage: options.advantage ?? 0,
			disadvantage: options.disadvantage ?? 0,
			useActionSurge: options.toggles?.get('useActionSurge') ?? false,
			gWMProc: options.dials?.get('gWMProc') ?? 0,
			gWMStart: options.dials?.get('gWMStart') ?? 21
		}
		this.resources = {
			rests: options.dials?.get('rests') ?? 0,
			rounds: options.dials?.get('rounds') ?? 1
		}
		return this
	}

	calculate(type: string, level: number) {
		let aSUse = 0;
		if (this.options.useActionSurge) {
			let surges = this.actionSurges(level, this.resources.rests);
			aSUse = surges / this.resources.rounds;
		}
		let source = new AttackSource(this.accuracyProvider, this.accuracyMode, this.options.advantage, this.options.disadvantage);
		switch (type) {
			case 'snb':
				return this.dueling(level, aSUse, this.options, source);
			case 'gs':
				return this.greatWeaponMaster(level, aSUse, {weaponDie: this.options.weaponDie, weaponType: this.options.weaponType, gWMProc: 0, gWMStart: null, pAMStart: null}, source);
			case 'gs_pa':
				return this.greatWeaponMaster(level, aSUse, this.options, source);
			case 'gwm_pam':
				return this.greatWeaponMaster(level, aSUse, this.options, source);
			case 'pam':
				return this.polearmMasterOnly(level, aSUse, this.options, source);
			default:
				break;
		}
	}

	attacks(level: number) {
		if (level < 5) { return 1; }
		else if (level < 11) { return 2; }
		else if (level < 20) { return 3; }
		return 4;
	}
	extraCrit(level: number) {
		if (level < 3) { return 0; }
		else if (level < 15) { return 1; }
		return 2
	}
	actionSurges(level: number, shortRests: number) {
		if (level < 2) { return 0; }
		else if (level < 17) { return 1 * (shortRests + 1); }
		return 2 * (shortRests + 1);
	}

	private greatWeaponMaster(level: number, actionSurgeRate: number, options: FighterOptions, source: AttackSource) : DamageOutput {
		let attacks = this.attacks(level);
		let modifier = this.baseModifiers[level - 1];
		if (options.pAMStart && options.pAMStart > 1) {
			modifier = this.featAt4Modifiers[level - 1];
		}
		let extraCrit = this.extraCrit(level);
		let gwm = Feat.powerAttack();
		let gwfs = FightingStyleHandler.greatWeapon(options.weaponType);
		let accuracyMod = options.gWMStart && level >= options.gWMStart ? modifier + gwm.accuracy : modifier;
		let extraDamage = options.gWMStart && level >= options.gWMStart ? gwm.flatDamage + modifier + gwfs.flatDamage : gwfs.flatDamage;
		let primaryOpt = new AttackDamageOptions(options.weaponDie, extraDamage, 0, 0, extraCrit, true, true);
		let primary =  source.weaponAttacks(level, attacks, accuracyMod, primaryOpt);
		let pamAttack: AttackModifier | null = null;
		if (options.pAMStart && level >= options.pAMStart) {
			let pamExtra = FightingStyleHandler.greatWeapon(WeaponDie.d4).flatDamage + (level >= options.gWMStart ?  gwm.flatDamage : 0);
			let pamOpt = new AttackDamageOptions(Dice.d4, pamExtra, 0, 0, extraCrit, true, true);
			pamAttack = Feat.poleArmMaster(level, accuracyMod, pamOpt, source);
		}
		return {damage: (1 + actionSurgeRate) * primary.damage + (pamAttack?.flatDamage ?? 0), accuracy: primary.accuracy}
	}

	private dueling(level: number, actionSurgeRate: number, options: FighterOptions, source: AttackSource) : DamageOutput {
		let attacks = this.attacks(level);
		let modifier = this.baseModifiers[level - 1];
		let extra = FightingStyleHandler.dueling().flatDamage;
		let extraCrit = this.extraCrit(level);
		let primaryOpt = new AttackDamageOptions(options.weaponDie, extra, 0, 0, extraCrit, true, true);
		let primary = source.weaponAttacks(level, attacks, modifier, primaryOpt);
		return {damage: (1 + actionSurgeRate)*primary.damage, accuracy: primary.accuracy};
	}

	private polearmMasterOnly(level: number, actionSurgeRate: number, options: FighterOptions, source: AttackSource) : DamageOutput {
		let attacks = this.attacks(level);
		let modifier = this.baseModifiers[level - 1];
		let extra = FightingStyleHandler.greatWeapon(options.weaponType).flatDamage;
		let extraPam = FightingStyleHandler.greatWeapon(WeaponDie.d4).flatDamage;
		let extraCrit = this.extraCrit(level);
		let primaryOpt = new AttackDamageOptions(options.weaponDie, extra, 0, 0, extraCrit, true, true);
		let pamOpt = new AttackDamageOptions(Dice.d4, extraPam, 0, 0, extraCrit, true, true);
		let primary = source.weaponAttacks(level, attacks, modifier, primaryOpt);
		let pam = Feat.poleArmMaster(level, modifier, pamOpt, source);
		return {damage: (1+actionSurgeRate)*primary.damage + pam.flatDamage, accuracy: primary.accuracy}
	}
}

export default Fighter;

type FighterOptions = {
	weaponDie: number;
	weaponType: WeaponDie
	gWMStart?: number | null;
	pAMStart?: number | null;
	gWMProc?: number;
	advantage?: number,
	disadvantage?: number,
	useActionSurge?: boolean
}