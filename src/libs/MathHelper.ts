import { provide } from "inversify-binding-decorators";
@provide(MathHelper)
export class MathHelper {
  public getDistanceBetweenPoints(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    let y = x2 - x1;
    let x = y2 - y1;

    return Math.sqrt(x * x + y * y);
  }
}
