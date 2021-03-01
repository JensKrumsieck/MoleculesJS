import { Atom } from "./primitives/atom";
import { Bond } from "./primitives/bond";
import { Vector3 } from "./primitives/vector3";

var he = new Atom("He", new Vector3(0,0,0))
console.log(he)

var c1 = new Atom("C", new Vector3(1,0,0))
var c2 = new Atom("C", new Vector3(1,2,0))

var bond = new Bond(c1,c2);
console.log(bond)