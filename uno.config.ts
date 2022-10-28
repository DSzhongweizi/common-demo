import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno
} from "unocss";

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
        margin: "8px",
      },
      collections: {
        // ep: () =>
        //   import("@iconify-json/ep/icons.json").then((i) => i.default as any),
      },
      customizations: {
        transform(svg) {
          return svg.replace(/#ffffff/, "currentColor");
        },
      },
    }),
  ],
  // 保证动态的图标资源可以被正确加载
  safelist: [
  ].map((item) => "i-menu:" + item),
  theme: {
    colors: {
      default: "#4700FF", // class="text-defalut"
      // gray:'#F3F5F7'
    },
  },
  shortcuts: {
    "e-auto": "pointer-events-auto",
  },
  rules: [
    ["flex-row", { display: "flex", "flex-direction": "row" }],
    ["flex-col", { display: "flex", "flex-direction": "column" }],
    [
      "flex-center",
      { display: "flex", "justify-content": "center", "align-items": "center" },
    ],
    [
      "absolute-center",
      {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%,-50%)",
      },
    ],
    ["nowrap", { "white-space": "nowrap" }],
  ],
});
