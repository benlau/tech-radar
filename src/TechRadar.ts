import * as d3 from "d3";

/** TechRadar
 *
 * Credits:
 * https://codepen.io/douglaseggleton/pen/YYBWvp
 */

class Helper {
  static radians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  static generateNumberFromString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Normalize the hash to a number between 0 and 1
    return (hash & 0x7fffffff) / 0x7fffffff;
  }

  static limitRange(value: number, min: number, max: number): number {
    return (max - min) * value + min;
  }
}

export const TechRadarScaleMode = {
  none: "none",
  scaleToFit: "scaleToFit",
};

export interface TechRadarStatus {
  name: string;
  color: string;
  length: number;
}

export interface TechRadarConfig {
  // Size of the canvas for the Tech Radar
  canvasSize: { width: number; height: number };
  // Determines how the radar scales within its container. It can be "none" | "scaleToFit"
  scaleMode: keyof typeof TechRadarScaleMode;

  // Width of the radar's circular lines
  strokeWidth: number;
  // Color of the radar's circular lines
  strokeColour: string;

  // Default color of the blips
  blipColor: string;
  // Color of blips when hovered over
  blipHoverColor: string;
  // Font size for blip labels
  blipFontSize: number;

  // Size of the blip points
  blipPointSize: number;
  // Distance between blip points and their labels
  blipLabelOffset: number;

  // Define the statuses used in the radar
  statuses: TechRadarStatus[];

  // Position of the status labels relative to the radar
  statusLabelPosition: "up" | "down" | "left" | "right";
  // Whether to show status labels
  statusLabelVisible: boolean;

  // Width of the status label
  statusLabelWidth: number;
  // Height of the status label
  statusLabelHeight: number;
  // Corner radius of the status label
  statusLabelRadius: number;
  // Font size of the status label text
  statusLabelFontSize: number;
  // Color of the status label text
  statusLabelColor: string;
  // Background color of the status label
  statusLabelBackgroundColor: string;

  // Move the center of the radar to a specific position
  centerOffset: { x: number; y: number };

  // Categories to be displayed on the radar
  categories: string[];
  // Color of the category text
  categoryColor: string;
  // Whether to show category labels
  categoryVisble: boolean;
}

export interface BlipItem {
  name: string;
  category: string;
  status: string;
  angle?: number;
  radius?: number;
  onClick?: (item: BlipItem) => void;
}

interface StatusLabelRect {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
}

interface BlipLayoutItem extends BlipItem {
  x: number;
  y: number;
}

interface Layout {
  radarItems: BlipLayoutItem[];
  statusLabelRect: StatusLabelRect[];
}

export class TechRadar {
  config: TechRadarConfig;
  blipItems: BlipItem[];
  _layout: Layout;
  chart: d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined;

  static getDefaultConfig(): TechRadarConfig {
    return {
      canvasSize: { width: 800, height: 800 },
      strokeWidth: 2,
      strokeColour: "#fff",
      categoryColor: "#444",
      categoryVisble: true,
      blipColor: "#5f5f5f",
      blipHoverColor: "#5f5f5f7f",
      blipFontSize: 16,
      blipPointSize: 2,
      blipLabelOffset: 5,
      scaleMode: "none",
      statusLabelPosition: "up",
      statusLabelVisible: true,
      centerOffset: { x: 0, y: 0 },
      statuses: [
        { name: "no-go", color: "#d8e5ee", length: 60 },
        { name: "hold", color: "#c1d8e8", length: 60 },
        { name: "assess", color: "#afcadd", length: 60 },
        { name: "trial", color: "#9ebcd6", length: 60 },
        { name: "adopt", color: "#8eafd2", length: 60 },
      ],
      categories: ["platform & frameworks", "tools", "techniques", "languages"],
      statusLabelWidth: 72,
      statusLabelHeight: 24,
      statusLabelRadius: 5,
      statusLabelFontSize: 14,
      statusLabelColor: "#7f7f7f",
      statusLabelBackgroundColor: "white",
    };
  }

  constructor(blipItems: BlipItem[], config?: TechRadarConfig) {
    this.config = config || TechRadar.getDefaultConfig();

    // The items to be rendered on the chart
    this.blipItems = blipItems || [];

    // The layout of the chart
    this._layout = {
      radarItems: [],
      statusLabelRect: [],
    };
    this.chart = undefined;
    this._createLayout();
  }

  getChartRadius(): number {
    return this.config.statuses.reduce((s, item) => item.length + s, 0);
  }

  getCenterPoint(): { x: number; y: number } {
    return {
      x: this.config.canvasSize.width / 2 + this.config.centerOffset.x,
      y: this.config.canvasSize.height / 2 + this.config.centerOffset.y,
    };
  }

  _getStatusPositionByString(status: string): number {
    return this.config.statuses.findIndex((element) => element.name === status);
  }

  _getStatusRadiusByIndex(index: number): number {
    if (index > this.config.statuses.length) {
      return 0;
    }
    const totalRadius = this.getChartRadius();
    let invRadius = 0;
    for (let i = 0; i < index; i++) {
      invRadius += this.config.statuses[i].length;
    }
    const ret = totalRadius - invRadius;
    return ret;
  }

  _getStatusRadiusMinMaxByIndex(index: number): { min: number; max: number } {
    const max = this._getStatusRadiusByIndex(index);
    const min = this._getStatusRadiusByIndex(index + 1);
    return { min, max };
  }

  _getCategoryPositionByString(category: string): number {
    return this.config.categories.findIndex((element) => element === category);
  }

  _getTechnologyPositionByString(technology: string): number {
    return this.blipItems.findIndex((element) => element.name === technology);
  }

  _getRadiansPerCategory(): number {
    return Helper.radians(360 / this.config.categories.length);
  }

  _createLayout(): void {
    const centerPoint = this.getCenterPoint();
    const radarItems = this.blipItems.map((d) => {
      const radiansPerCategory = this._getRadiansPerCategory();
      const categoryPosition = this._getCategoryPositionByString(d.category);
      const angleRatio =
        d.angle != null
          ? d.angle
          : Helper.limitRange(
              Helper.generateNumberFromString(d.name + "_agree"),
              0.1,
              0.9
            );

      const angle = radiansPerCategory * (categoryPosition + angleRatio);

      const statusPosition = this._getStatusPositionByString(d.status);
      const { min, max } = this._getStatusRadiusMinMaxByIndex(statusPosition);
      const statusSize = max - min;
      const radiusRatio =
        d.radius != null
          ? d.radius
          : Helper.limitRange(
              Helper.generateNumberFromString(d.name + "_radius"),
              0.1,
              0.9
            );

      const radius = min + statusSize * radiusRatio;
      const x = radius * Math.cos(angle) + centerPoint.x;
      const y = radius * Math.sin(angle) + centerPoint.y;

      return { ...d, x, y, radius };
    });

    const statusLabelRect = this.config.statuses
      .map((status, i) => {
        const cx = centerPoint.x;
        const cy = centerPoint.y;
        const { min, max } = this._getStatusRadiusMinMaxByIndex(i);
        const midpoint = (min + max) / 2;

        switch (this.config.statusLabelPosition) {
          case "up":
            return {
              x: cx - this.config.statusLabelWidth / 2,
              y: cy - midpoint - this.config.statusLabelHeight / 2,
              width: this.config.statusLabelWidth,
              height: this.config.statusLabelHeight,
              name: status.name,
            };
          case "down":
            return {
              x: cx - this.config.statusLabelWidth / 2,
              y: cy + midpoint - this.config.statusLabelHeight / 2,
              width: this.config.statusLabelWidth,
              height: this.config.statusLabelHeight,
              name: status.name,
            };
          case "left":
            return {
              x: cx - midpoint - this.config.statusLabelWidth / 2,
              y: cy - this.config.statusLabelHeight / 2,
              width: this.config.statusLabelWidth,
              height: this.config.statusLabelHeight,
              name: status.name,
            };
          case "right":
            return {
              x: cx + midpoint - this.config.statusLabelWidth / 2,
              y: cy - this.config.statusLabelHeight / 2,
              width: this.config.statusLabelWidth,
              height: this.config.statusLabelHeight,
              name: status.name,
            };
          default:
            return null;
        }
      })
      .filter((rect): rect is StatusLabelRect => rect !== null);

    this._layout = {
      radarItems,
      statusLabelRect,
    };
  }

  render(elem: string | HTMLDivElement): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const container = d3.select(elem as any);
    let radar: d3.Selection<SVGSVGElement, unknown, null, undefined>;

    if (this.config.scaleMode === "scaleToFit") {
      radar = container
        .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr(
          "viewBox",
          `0 0 ${this.config.canvasSize.width} ${this.config.canvasSize.height}`
        )
        .attr("width", null)
        .attr("height", null);
    } else {
      radar = container
        .append("svg")
        .attr("width", this.config.canvasSize.width)
        .attr("height", this.config.canvasSize.height);
    }

    this._drawCircles(radar);
    this._drawAxes(radar);
    this._drawStatusLabels(radar);
    this._drawRadarItems(radar);
    this.drawCategoryLabels(radar);

    this.chart = radar;
  }

  _drawCircles(
    radar: d3.Selection<SVGSVGElement, unknown, null, undefined>
  ): void {
    const centerPoint = this.getCenterPoint();
    radar
      .selectAll("circle")
      .data(this.config.statuses)
      .enter()
      .append("circle")
      .attr("stroke", this.config.strokeColour)
      .attr("stroke-width", this.config.strokeWidth)
      .attr("fill", (d) => d.color)
      .attr("r", (d, i) => this._getStatusRadiusByIndex(i))
      .attr("cx", centerPoint.x)
      .attr("cy", centerPoint.y);
  }

  _drawAxes(
    radar: d3.Selection<SVGSVGElement, unknown, null, undefined>
  ): void {
    const centerPoint = this.getCenterPoint();
    radar
      .selectAll("line")
      .data(this.config.categories)
      .enter()
      .append("line")
      .attr("x1", (data, i) => {
        const deg = (360 / this.config.categories.length) * i;
        const radius = this.getChartRadius();
        return centerPoint.x + radius * Math.cos((deg * Math.PI) / 180);
      })
      .attr("y1", (data, i) => {
        const deg = (360 / this.config.categories.length) * i;
        const radius = this.getChartRadius();
        return centerPoint.y + radius * Math.sin((deg * Math.PI) / 180);
      })
      .attr("x2", centerPoint.x)
      .attr("y2", centerPoint.y)
      .attr("stroke", this.config.strokeColour)
      .attr("stroke-width", this.config.strokeWidth);
  }

  _drawStatusLabels(
    radar: d3.Selection<SVGSVGElement, unknown, null, undefined>
  ): void {
    if (!this.config.statusLabelVisible) {
      return;
    }
    radar
      .selectAll("rect")
      .data(this._layout.statusLabelRect)
      .enter()
      .append("rect")
      .attr("x", (data) => data.x)
      .attr("y", (data) => data.y)
      .attr("height", (data) => data.height)
      .attr("width", (data) => data.width)
      .attr("fill", this.config.statusLabelBackgroundColor)
      .attr("rx", this.config.statusLabelRadius);

    radar
      .selectAll("text")
      .data(this._layout.statusLabelRect)
      .enter()
      .append("text")
      .text((data) => data.name.toUpperCase())
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("x", (d) => {
        return d.x + d.width / 2;
      })
      .attr("y", (d) => {
        return d.y + d.height / 2;
      })
      .attr("fill", this.config.statusLabelColor)
      .attr("font-size", this.config.statusLabelFontSize);
  }

  _drawRadarItems(
    radar: d3.Selection<SVGSVGElement, unknown, null, undefined>
  ): void {
    const techItems = this._layout.radarItems;
    const points = radar.append("g");
    const instance = this;

    const techItemGroups = points
      .selectAll(".discovery-item")
      .data(techItems)
      .enter()
      .append("g")
      .attr("class", "tech-item")
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this)
          .select("text")
          .attr("fill", instance.config.blipHoverColor);
        d3.select(this)
          .select("circle")
          .attr("fill", instance.config.blipHoverColor);
      })
      .on("mouseout", function () {
        d3.select(this).select("text").attr("fill", instance.config.blipColor);
        d3.select(this)
          .select("circle")
          .attr("fill", instance.config.blipColor);
      })
      .on("click", function (event: MouseEvent, d: BlipItem) {
        d?.onClick?.(d);
      });

    techItemGroups
      .append("text")
      .text((d) => d.name.toUpperCase())
      .attr("fill", this.config.blipColor)
      .attr("font-size", this.config.blipFontSize)
      .attr("x", (d) => (d.x || 0) + this.config.blipLabelOffset)
      .attr("y", (d) => (d.y || 0) + this.config.blipLabelOffset);

    techItemGroups
      .append("circle")
      .attr("fill", this.config.blipColor)
      .attr("r", this.config.blipPointSize)
      .attr("cx", (d) => d.x || 0)
      .attr("cy", (d) => d.y || 0);
  }

  drawCategoryLabels(
    radar: d3.Selection<SVGSVGElement, unknown, null, undefined>
  ): void {
    if (!this.config.categoryVisble) {
      return;
    }
    const centerPoint = this.getCenterPoint();
    radar
      .selectAll(".category-label")
      .data(this.config.categories)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("class", "category-label")
      .attr("fill", this.config.categoryColor)
      .text((d) => d.toUpperCase())
      .attr("x", (d) => {
        const radiansPerCategory = this._getRadiansPerCategory();
        const categoryPosition = this._getCategoryPositionByString(d);
        const categoryOffset = radiansPerCategory / 2;
        const angle = radiansPerCategory * categoryPosition + categoryOffset;
        const radius = this.config.canvasSize.width / 2;
        return radius * Math.cos(angle) + centerPoint.x;
      })
      .attr("y", (d) => {
        const radiansPerCategory = this._getRadiansPerCategory();
        const categoryPosition = this._getCategoryPositionByString(d);
        const categoryOffset = radiansPerCategory / 2;
        const angle = radiansPerCategory * categoryPosition + categoryOffset;
        const radius = this.config.canvasSize.height / 2;
        return radius * Math.sin(angle) + centerPoint.y;
      });
  }

  toSVG(): string {
    return (
      (
        this.chart
          ?.attr("title", "Tech Radar")
          .attr("version", 1.1)
          .attr("xmlns", "http://www.w3.org/2000/svg")
          .node()?.parentNode as any
      )?.innerHTML || ""
    );
  }

  downloadSVG(): void {
    try {
      !!new Blob();
    } catch (e) {
      alert("blob not supported");
      return;
    }
    const svgData = this.toSVG();
    // eslint-disable-next-line quotes
    const preface = '<?xml version="1.0" standalone="no"?>\r\n';
    const svgBlob = new Blob([preface, svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "tech_radar.svg";
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl); // Clean up the URL object
  }
}
