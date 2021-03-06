import { Atom } from "./primitives/atom";
import Molecule from "./primitives/molecule";
import { Vector3 } from "./primitives/vector3";

export default class CIF {

    content: string;
    a: number
    b: number
    c: number
    alpha: number
    beta: number
    gamma: number

    constructor(content: string) {
        this.content = content.replace(/(?:[\r])/g, "");
        this.setParameters();
    }

    static parse(content: string): Molecule {
        var cif = new CIF(content);
        return cif.parse();
    }

    public parse() : Molecule{
        var loops = this.content.split('loop_');
        var molLoop = loops.find(s => s.includes('_atom_site_label'));
        var bondLoop = loops.find(s => s.includes('_geom_bond_atom_site_label_1'));
        var atoms = this.extractAtoms(molLoop)
        var bonds = this.extractBonds(bondLoop, atoms)
        return new Molecule({ atoms, bonds });
    }     

    private extractAtoms(molLoop:string): Atom[] {
        let lines = molLoop.split('\n')
        let headers = lines.filter(s => s.trim().startsWith('_'));
        let body = lines.filter(s => !s.trim().startsWith('_'));
        let disorderIndex = headers.indexOf('_atom_site_disorder_group');

        let data = [];

        for (var i = 0; i < body.length; i++) {
            var raw_data = body[i].split(' ')
            if (disorderIndex >= 0
                && disorderIndex < raw_data.length
                && raw_data[disorderIndex] == "2" || raw_data.length != headers.length) continue;
            data.push(raw_data);
        }
        return this.calculateCartesian(data);
    }

    extractBonds(bondLoop :string, atoms: Atom[]) {
        let lines = bondLoop.split('\n')
        let body = lines.filter(s => !s.trim().startsWith('_'));

        var bonds = []

        for (var i = 0; i < body.length; i++) {
            var raw_data = body[i].split(" ")
            let atom1 = raw_data[0]
            let atom2 = raw_data[1]

            //check if atoms existing
            if (atoms.filter(s => s.title == atom1).length == 1 && atoms.filter(s => s.title == atom2).length == 1)
                bonds.push({ atom1: atoms.filter(s => s.title == atom1), atom2: atoms.filter(s => s.title == atom2) })
        }
        return bonds;
    }

    private cellParameters(type): string[] {
        let parameters: string[] = []
        let lines = this.content.split('\n')
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].startsWith("_" + type)) {
                //parameter value contains uncertainity in brackets, so strip that
                var tmp = lines[i].split(" ");
                var value = tmp[tmp.length - 1]; //last item
                parameters.push(value.split('(')[0]);
            }
        }
        return parameters;
    }

    private setParameters() {
        var lengths = this.cellParameters('cell_length')
        var angles = this.cellParameters('cell_angle')
        this.a = parseFloat(lengths[0])
        this.b = parseFloat(lengths[1])
        this.c = parseFloat(lengths[2])
        this.alpha = parseFloat(angles[0])
        this.beta = parseFloat(angles[1])
        this.gamma = parseFloat(angles[2])
    }

    private calculateCartesian(data) {
        //variables introduced to deconfuse
        var atoms: Atom[] = [];

        for (var i = 0; i < data.length; i++) {
            //get xyz in fractional coordinates
            //1 is label, 2 is x, 3 is y, 4 is z
            let xFrac = data[i][2].split('(')[0]
            let yFrac = data[i][3].split('(')[0]
            let zFrac = data[i][4].split('(')[0]
            let angle = Math.PI / 180;

            //transformation matrix: see https://en.wikipedia.org/wiki/Fractional_coordinates#Conversion_to_Cartesian_coordinates
            //a21, a31, a32 = 0
            //a11 = a
            //other matrix entries as below:
            let a12 = this.b * Math.cos(this.gamma * angle)
            let a13 = this.c * Math.cos(this.beta * angle)

            let a22 = this.b * Math.sin(this.gamma * angle)
            let a23 = this.c * (Math.cos(this.alpha * angle) - Math.cos(this.beta * angle) * Math.cos(this.gamma * angle)) / Math.sin(this.gamma * angle)

            let a33 = this.c * (Math.sqrt(1 - Math.pow(Math.cos(this.alpha * angle), 2) - Math.pow(Math.cos(this.beta * angle), 2) - Math.pow(Math.cos(this.gamma * angle), 2) + 2 * Math.cos(this.alpha * angle) * Math.cos(this.beta * angle) * Math.cos(this.gamma * angle))) / Math.sin(this.gamma * angle)

            //xyz = [A]*(xyz)_frac
            let x = this.a * xFrac + a12 * yFrac + a13 * zFrac
            let y = a22 * yFrac + a23 * zFrac
            let z = a33 * zFrac
            
            let element = data[i][1]
            var atom = new Atom(element, new Vector3(x, y, z));
            atom.title = data[i][0];
            atoms.push(atom)
        }
        return atoms;
    }
}