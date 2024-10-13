import type { Meta } from "@storybook/html";
import {
  BlipItem,
  TechRadar,
  TechRadarConfig,
  TechRadarScaleMode,
} from "../src/TechRadar";

interface TechRadarProps {
  blipItems: BlipItem[];
  config: TechRadarConfig;
}

const createTechRadar = ({ blipItems, config }: TechRadarProps) => {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "10px";
  container.style.width = "100vw";
  container.style.height = "90vh";

  const placeholder = document.createElement("div");

  const techRadar = new TechRadar(blipItems, config);
  techRadar.render(placeholder);

  container.appendChild(placeholder);

  return container;
};

const FULL_BLIP_ITEMS: BlipItem[] = [
  {
    name: "Noteful",
    category: "tools",
    status: "adopt",
    angle: 0.7,
    radius: 0.9,
  },
  {
    name: "Exxxnote",
    category: "tools",
    status: "no-go",
    angle: 0.8,
  },
  { name: "Foam", category: "tools", status: "trial" },
  { name: "Bun", category: "platform & frameworks", status: "assess" },
  {
    name: "Web Component",
    category: "platform & frameworks",
    status: "hold",
  },
  {
    name: "ray",
    category: "languages & frameworks",
    status: "trial",
    angle: 0.8,
  },
  {
    name: "RAG",
    category: "techniques",
    status: "trial",
    radius: 0.9,
  },
];

const meta: Meta<TechRadarProps> = {
  title: "Tech Radar",
  render: (args) => createTechRadar(args),
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const BasicRadar = {
  args: {
    blipItems: FULL_BLIP_ITEMS,
    config: TechRadar.getDefaultConfig(),
  },
  render: (args) => {
    const container = createTechRadar(args);
    return container;
  },
};

export const ScaleToFitRadar = {
  args: {
    blipItems: FULL_BLIP_ITEMS,
    scaleMode: TechRadarScaleMode.scaleToFit,
  },
  argTypes: {
    scaleMode: {
      control: "select",
      options: Object.values(TechRadarScaleMode),
    },
  },
  render: (args) => {
    const config = TechRadar.getDefaultConfig();

    const container = createTechRadar({
      ...args,
      config: {
        ...config,
        scaleMode: args.scaleMode,
      },
    });
    return container;
  },
};

export const HorizonalRadar = {
  args: {
    blipItems: [
      { name: "adopt", category: "platform & frameworks", status: "adopt" },
      { name: "trial", category: "platform & frameworks", status: "trial" },
      {
        name: "no-go",
        category: "platform & frameworks",
        status: "no-go",
        angle: 0.1,
        radius: 0.5,
      },
      { name: "assess", category: "platform & frameworks", status: "assess" },
      {
        name: "hold",
        category: "platform & frameworks",
        status: "hold",
        angle: 0.2,
        radius: 0.4,
      },
    ],
  },
  render: (args) => {
    const config = TechRadar.getDefaultConfig();
    config.canvasSize = {
      width: 600,
      height: 200,
    };
    config.scaleMode = "scaleToFit";
    config.statuses = [
      { name: "no-go", color: "#d8e5ee", length: 100 }, // 60
      { name: "hold", color: "#c1d8e8", length: 100 },
      { name: "assess", color: "#afcadd", length: 100 },
      { name: "trial", color: "#9ebcd6", length: 100 },
      { name: "adopt", color: "#8eafd2", length: 100 },
    ];
    config.statusLabelPosition = "right";
    config.centerOffset = {
      x: -300,
      y: -70,
    };
    config.statusLabelVisible = true;
    config.categoryVisble = false;

    const container = createTechRadar({ ...args, config });
    return container;
  },
};

export const VerticalRadar = {
  args: {
    blipItems: [
      { name: "adopt", category: "platform & frameworks", status: "adopt" },
      { name: "trial", category: "platform & frameworks", status: "trial" },
      {
        name: "no-go",
        category: "platform & frameworks",
        status: "no-go",
        angle: 0.9,
        radius: 0.5,
      },
      {
        name: "assess",
        category: "platform & frameworks",
        status: "assess",
        angle: 0.8,
      },
      {
        name: "hold",
        category: "platform & frameworks",
        status: "hold",
        angle: 0.8,
        radius: 0.4,
      },
    ],
  },
  render: (args) => {
    const config = TechRadar.getDefaultConfig();
    config.scaleMode = "scaleToFit";
    config.canvasSize = {
      width: 400,
      height: 600,
    };
    config.statuses = [
      { name: "no-go", color: "#d8e5ee", length: 100 }, // 60
      { name: "hold", color: "#c1d8e8", length: 100 },
      { name: "assess", color: "#afcadd", length: 100 },
      { name: "trial", color: "#9ebcd6", length: 100 },
      { name: "adopt", color: "#8eafd2", length: 100 },
    ];
    config.categories = [
      "platform & frameworks",
      "tools & methodology",
      "productivity",
      "AI & ML",
    ];
    config.statusLabelPosition = "down";
    config.centerOffset = {
      x: -150,
      y: -320,
    };
    config.categoryVisble = false;

    const container = createTechRadar({ ...args, config });
    return container;
  },
};
