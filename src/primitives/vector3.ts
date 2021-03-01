export interface IVector3 {
    x: number
    y: number
    z: number
}

export class Vector3 implements IVector3 {
    x: number
    y: number
    z: number

    constructor(x: number, y: number, z: number) {
        this.x = x
        this.y = y
        this.z = z
    }

    setX(x: number) {
        this.x = x
    }

    setY(y: number) {
        this.y = y
    }
    setZ(z: number) {
        this.z = z
    }
}