import { Atom } from "./atom";
import { Bond } from "./bond";

export default class Molecule{
    constructor(atoms: Atom[], bonds: any[]) {
        this.atoms = atoms;
        this.bonds = bonds;
    }

    atoms: Atom[]
    bonds: Bond[]
}