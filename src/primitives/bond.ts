import { Atom } from "./atom";

export class Bond {

    constructor(atom1: Atom, atom2: Atom) {
        this.atom1 = atom1
        this.atom2 = atom2
    }
    atom1: Atom
    atom2: Atom
}