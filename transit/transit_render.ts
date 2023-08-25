import { CanvasRenderingContext2D, createCanvas } from "canvas";
import tinycolor from "tinycolor2";
import fs from "fs";
import dayjs, { Dayjs } from "dayjs";
import { $Font, Font } from "bdfparser";
import child_process from "child_process";
import getline from "readlineiter";

export interface Bus {
  route: string;
  colour: string;
  arrivalTime: Dayjs;
}

function drawBus(ctx: CanvasRenderingContext2D, font: Font, x: number, y: number, bus: Bus) {
  const textSize = bus.route.length * 4 - 1;
  const textOffset = Math.floor(textSize / 2);

  const colour = tinycolor(bus.colour);
  ctx.beginPath();
  ctx.fillStyle = colour.toHexString();
  ctx.roundRect(x, y, 19, 7, 5);
  ctx.fill();

  ctx.save();
  ctx.translate(x + 9 - textOffset, y + 1);
  const textColor = tinycolor.mostReadable(colour, ["white", "black"]).toHexString();
  font.draw(bus.route, { direction: "lr" }).draw2canvas(ctx, { "0": null, "1": textColor, "2": null });
  ctx.restore();

  const eta = bus.arrivalTime.diff(dayjs(), "seconds");
  const minutes = Math.floor(eta / 60);
  const seconds = eta % 60;

  ctx.save();
  ctx.translate(x + 21, y + 1);
  font.draw(minutes.toString(), { direction: "lr" }).draw2canvas(ctx, { "0": null, "1": "white", "2": null });
  ctx.restore();

  if (seconds !== 0) {
    const offset = minutes.toString().length * 4;

    ctx.fillStyle = "white";
    ctx.fillRect(x + offset + 21, y + 2, 1, 1);
    ctx.fillRect(x + offset + 21, y + 4, 1, 1);

    ctx.save();
    ctx.translate(x + offset + 23, y + 1);
    font.draw(seconds.toString().padStart(2, "0"), { direction: "lr" }).draw2canvas(ctx, { "0": null, "1": "white", "2": null });
    ctx.restore();
  }

  // absolute time of arrival
  // ctx.save();
  // ctx.translate(x + 45, y + 1);
  // font.draw(bus.arrivalTime.format("mm"), { direction: "lr" }).draw2canvas(ctx, { "0": null, "1": "white", "2": null });
  // ctx.restore();

  // ctx.fillStyle = "white";
  // ctx.fillRect(x + 53, y + 2, 1, 1);
  // ctx.fillRect(x + 53, y + 4, 1, 1);

  // ctx.save();
  // ctx.translate(x + 55, y + 1);
  // font.draw(bus.arrivalTime.format("ss"), { direction: "lr" }).draw2canvas(ctx, { "0": null, "1": "white", "2": null });
  // ctx.restore();
}
export async function drawBuses(buses: Bus[], output = "../../pixlet/image") {
  const font = await $Font(getline("tom-thumb.bdf"));
  if (!font || !font.headers) {
    throw new Error("Unable to load font");
  }
  //   console.log(`Loaded font. Global size is \
  // ${font.headers.fbbx} x ${font.headers.fbby} (pixel), \
  // it contains ${font.length} glyphs.`);
  const canvas = createCanvas(64, 32);
  const ctx = canvas.getContext("2d");
  drawBus(ctx, font, 1, 0, buses[0]);
  drawBus(ctx, font, 1, 8, buses[1]);
  drawBus(ctx, font, 1, 16, buses[2]);
  drawBus(ctx, font, 1, 24, buses[3]);
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(`${output}.png`, buffer);
  fs.writeFileSync(`${output}.pg`, buffer);
  child_process.execSync(`cwebp -q 100 -lossless ${output}.png -o ${output}.webp`);
}

if (require.main === module) {
  (async () => {
    try {
      drawBuses([
        { route: "301n", colour: "blue", arrivalTime: dayjs().add(142, "seconds") },
        { route: "301S", colour: "blue", arrivalTime: dayjs().add(400, "seconds") },
        { route: "201", colour: "grey", arrivalTime: dayjs().add(718, "seconds") },
        { route: "31", colour: "tan", arrivalTime: dayjs().add(2000, "seconds") },
      ]);
    } catch (error) {
      throw error;
    }
  })();
}
