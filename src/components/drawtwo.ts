import MapGeneration from './mapgeneration';

export default class DrawTwo {
  private readonly width:   number;
  private readonly height:  number;
  private readonly canvas:  HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private mapImageData!:      ImageData;
  private originalImageData!: ImageData;
  private heightMap:    ArrayLike<number> | null = null;
  private oldPlayerX: number | undefined;
  private oldPlayerY: number | undefined;

  constructor(width: number, height: number, selector: string) {
    this.width  = width;
    this.height = height;

    this.canvas  = document.querySelector(selector) as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.canvas.width  = width;
    this.canvas.height = height;

    this.init();
  }

  private init(): void {
    this.canvas.style.width  = `${this.canvas.offsetHeight * (this.canvas.width / this.canvas.height)}px`;
    this.mapImageData        = this.context.createImageData(this.width, this.height);
    this.originalImageData   = this.context.createImageData(this.width, this.height);
  }

  private printHeightmap(heightMap: ArrayLike<number>): void {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const i     = (y * this.width + x) * 4;
        const h     = heightMap[i / 4];
        const color = MapGeneration.getColorFromHeight(h);
        const alpha = h < 0.16 ? 0 : 255;

        this.mapImageData.data[i]     = color[0];
        this.mapImageData.data[i + 1] = color[1];
        this.mapImageData.data[i + 2] = color[2];
        this.mapImageData.data[i + 3] = alpha;
        this.originalImageData.data[i]     = color[0];
        this.originalImageData.data[i + 1] = color[1];
        this.originalImageData.data[i + 2] = color[2];
        this.originalImageData.data[i + 3] = alpha;
      }
    }
  }

  private updateHeightmap(playerX: number, playerY: number): void {
    if (this.oldPlayerX !== undefined && this.oldPlayerY !== undefined) {
      for (let x = this.oldPlayerX - 5; x <= this.oldPlayerX + 5; x++) {
        for (let y = this.oldPlayerY - 5; y <= this.oldPlayerY + 5; y++) {
          const i = (y * this.width + x) * 4;
          this.mapImageData.data[i]     = this.originalImageData.data[i];
          this.mapImageData.data[i + 1] = this.originalImageData.data[i + 1];
          this.mapImageData.data[i + 2] = this.originalImageData.data[i + 2];
          this.mapImageData.data[i + 3] = this.originalImageData.data[i + 3];
        }
      }
    }

    for (let x = playerX - 5; x <= playerX + 5; x++) {
      for (let y = playerY - 5; y <= playerY + 5; y++) {
        const i = (y * this.width + x) * 4;
        this.mapImageData.data[i]     = 255;
        this.mapImageData.data[i + 1] = 0;
        this.mapImageData.data[i + 2] = 0;
        this.mapImageData.data[i + 3] = 255;
      }
    }

    this.oldPlayerX = playerX;
    this.oldPlayerY   = playerY;
  }

  updateImage(heightMap: ArrayLike<number>): void {
    this.heightMap = heightMap;
    this.printHeightmap(this.heightMap);
    this.context.putImageData(this.mapImageData, 0, 0);
  }

  updatePlayer(playerX: number, playerY: number): void {
    this.updateHeightmap(
      Math.trunc(playerX + this.width  / 2),
      Math.trunc(playerY + this.height / 2)
    );
    this.context.putImageData(this.mapImageData, 0, 0);
  }
}
