# Tech Radar Renderer

This library provides a customizable Tech Radar visualization tool. It allows you to create and render a tech radar chart with configurable blips, categories, and statuses.

## Installation

To install the Tech Radar library, use npm:

```
npm i @benlau/tech-radar
```

## Usage

Here's a basic example of how to use the Tech Radar library:

```typescript
import { TechRadar, BlipItem, TechRadarConfig } from '@benlau/tech-radar';

// Define your blip items
const blipItems: BlipItem[] = [
    { name: "React", category: "languages & frameworks", status: "adopt" },
    { name: "Angular", category: "languages & frameworks", status: "assess" },
    { name: "Svelte", category: "languages & frameworks", status: "trial" },
    { name: "Vue", category: "languages & frameworks", status: "hold" },
    // Add more items as needed
];
// Create a new TechRadar instance using default config
const techRadar = new TechRadar(blipItems);
// Render the Tech Radar
techRadar.render('#tech-radar-container');
```

Make sure you have a container element in your HTML:

```html
<div id="tech-radar-container"></div>
```


## Downloading the Tech Radar as SVG

The Tech Radar library provides a convenient method to download the rendered radar as an SVG file. This is useful for sharing or embedding the radar in other documents.

To download the Tech Radar as an SVG file, you can use the `downloadSVG()` method:

```typescript
techRadar.render("#tech-radar");
techRadar.downloadSVG(); // You must run render function first
```

## Customization

You can customize the Tech Radar by passing a configuration object when creating a new TechRadar instance. The configuration object allows you to modify various aspects of the chart, such as colors, sizes, and labels.


1. canvasSize: { width: number; height: number }
   Set the dimensions of the radar chart canvas.

2. scaleMode: "none" | "scaleToFit"
   Choose how the radar scales within its container.

3. strokeWidth: number
   Set the width of the radar's circular lines.

4. strokeColour: string
   Set the color of the radar's circular lines.

5. blipColor: string
   Set the default color of the blips.

6. blipHoverColor: string
   Set the color of blips when hovered over.

7. blipFontSize: number
   Set the font size for blip labels.

8. blipPointSize: number
   Set the size of the blip points.

9. blipLabelOffset: number
   Set the distance between blip points and their labels.

10. statuses: TechRadarStatus[]
    Define the statuses used in the radar, including their names, colors, and lengths.

11. statusLabelPosition: "up" | "down" | "left" | "right"
    Set the position of the status labels relative to the radar.

Example usage:

```typescript
const customConfig: TechRadarConfig = {
  canvasSize: { width: 800, height: 600 },
  scaleMode: "scaleToFit",
  strokeWidth: 2,
  strokeColour: "#ccc",
  blipColor: "#1ebccd",
  blipHoverColor: "#ff0000",
  blipFontSize: 12,
  blipPointSize: 10,
  blipLabelOffset: 5,
  statuses: [
    { name: "adopt", color: "#93c47d", length: 0.25 },
    { name: "trial", color: "#93d2c2", length: 0.25 },
    { name: "assess", color: "#fbdb84", length: 0.25 },
    { name: "hold", color: "#efafa9", length: 0.25 }
  ],
  statusLabelPosition: "right"
};

const customTechRadar = new TechRadar(blipItems, customConfig);
```