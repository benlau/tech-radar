# Tech Radar Renderer

This library provides a customizable Tech Radar visualization tool. It allows you to create and render a tech radar chart with configurable blips, categories, and statuses.

**Full Size Tech Radar**

![image](https://github.com/user-attachments/assets/0ddae351-7260-43dd-bc97-3c4e3fadba0a)

**Partial Tech Radar**

![image](https://github.com/user-attachments/assets/aadf0cbd-64aa-4b8a-b658-df04cc52a36a)

**Live Demo**

- [Storybook](https://benlau.github.io/tech-radar)

## Installation

To install the Tech Radar library, use npm:

```
npm i @benlau/tech-radar
```

## Installation via CDN

If you prefer not to use npm, you can also include the Tech Radar library directly in your HTML file using a CDN. This method is suitable for quickly prototyping or for projects that don't use a module bundler.

Add the following script tag to your HTML file:

```
<script src="https://unpkg.com/@benlau/tech-radar@0.1.0/dist/index.umd.min.js"></script>
```

## Usage

Here's a basic example of how to use the Tech Radar library:

```typescript
import { TechRadar, BlipItem, TechRadarConfig } from '@benlau/tech-radar';

// Define your blip items
const blipItems: BlipItem[] = [
    { name: "React", category: "languages", status: "adopt" },
    { name: "Angular", category: "languages", status: "assess" },
    { name: "Svelte", category: "languages", status: "trial" },  
    { name: "Vue", category: "languages", status: "hold", angle: 0.5, radius: 0.3 },
    // The optional `angle` and `radius` properties allow for manual positioning of blips on the Tech Radar:
    // - `angle`: Specifies the angular position of the blip in the category. It's a value between 0 and 1.
    // - `radius`: Determines how far the blip is from the start point inside the category. It's a value between 0 and 1.
    // If these are not provided, the position will be determined using a number generated from the name.
];

// Obtain the default configuration to render the radar
const config = TechRadar.getDefaultConfig();

// You may modify the config to render the radar in different style

// Create a new TechRadar instance using default config
const techRadar = new TechRadar(blipItems, config);
// Render the Tech Radar
techRadar.render('#tech-radar-container');
```

Make sure you have a container element in your HTML:

```html
<div id="tech-radar-container"></div>
```


If you're using the CDN version, the `TechRadar` object is globally available. Here's how you can use it:

```typescript
const techRadar = new TechRadar.TechRadar(blipItems);
```

See the demo example at [demo/umd/index.html](./demo/umd/index.html)

## Downloading the Tech Radar as SVG

The Tech Radar library provides a convenient method to download the rendered radar as an SVG file. This is useful for sharing or embedding the radar in other documents.

To download the Tech Radar as an SVG file, you can use the `downloadSVG()` method:

```typescript
techRadar.render("#tech-radar");
document.getElementById("download-button").addEventListener("click", () => {
   techRadar1.downloadSVG();  // You must run render function first
});
```

## Customization

You can customize the Tech Radar by passing a configuration object when creating a new TechRadar instance. The configuration object allows you to modify various aspects of the chart, such as colors, sizes, and labels.

```
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
```

Example:

```typescript
const customConfig: TechRadarConfig = {
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

const customTechRadar = new TechRadar(blipItems, customConfig);
```
