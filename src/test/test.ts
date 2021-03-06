import fs from 'fs'
import path from 'path'
import tape from 'tape-await'
import {CIF} from '../index'

tape("Loading CIF File", function(t){
    var file = fs.readFileSync(path.resolve(__dirname, "files/cif.cif"), "utf-8")
    var mol = CIF.parse(file)
    //79 and 89, but disordering!
    t.equal(79, mol.atoms.length)
    t.equal(89, mol.bonds.length)
})