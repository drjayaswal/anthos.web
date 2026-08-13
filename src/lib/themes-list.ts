export type ThemeColors = {
  primary: string;
  planMode: string;
  selection: string;
  thinking: string;
  success: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  dialogSurface: string;
  thinkingBorder: string;
  dimSeparator: string;
};

export type Theme = {
  name: string;
  colors: ThemeColors;
};

export const THEMES: Theme[] = [
  {
    name: "Flar",
    colors: {
      primary: "#ff3131",
      planMode: "#ffffff",
      selection: "#ff3131",
      thinking: "#ffffff",
      success: "#4ADE80",
      error: "#ff3131",
      info: "#1b59c5",
      background: "#000000",
      surface: "#111111",
      dialogSurface: "#080808",
      thinkingBorder: "#2A2A2A",
      dimSeparator: "#444444",
    },
  },
  {
    name: "Lithium",
    colors: {
      primary: "#FF5E57",
      planMode: "#FF8C42",
      selection: "#FFB26B",
      thinking: "#FF8C42",
      success: "#7DFFB3",
      error: "#FF3B30",
      info: "#FF7A59",
      background: "#120A0A",
      surface: "#1E1212",
      dialogSurface: "#0D0707",
      thinkingBorder: "#4A2A22",
      dimSeparator: "#6B3B30",
    },
  },
  {
    name: "Sodium",
    colors: {
      primary: "#FFB347",
      planMode: "#FFD166",
      selection: "#FFE29A",
      thinking: "#FFD166",
      success: "#9CFFB0",
      error: "#FF5C5C",
      info: "#FFC76B",
      background: "#140F08",
      surface: "#21170D",
      dialogSurface: "#0E0905",
      thinkingBorder: "#5A4322",
      dimSeparator: "#7B5A2E",
    },
  },
  {
    name: "Calcium",
    colors: {
      primary: "#FF7F50",
      planMode: "#FF9966",
      selection: "#FFB38A",
      thinking: "#FF9966",
      success: "#8AFFC1",
      error: "#FF4D4D",
      info: "#FF8C66",
      background: "#160C08",
      surface: "#24150F",
      dialogSurface: "#100806",
      thinkingBorder: "#5C3428",
      dimSeparator: "#7A4937",
    },
  },
  {
    name: "Potassium",
    colors: {
      primary: "#C77DFF",
      planMode: "#9D4EDD",
      selection: "#D0A2FF",
      thinking: "#9D4EDD",
      success: "#7DFFB3",
      error: "#FF5A5F",
      info: "#B388FF",
      background: "#100914",
      surface: "#1C1324",
      dialogSurface: "#0B0610",
      thinkingBorder: "#4B2E66",
      dimSeparator: "#6A4690",
    },
  },
  {
    name: "Copper",
    colors: {
      primary: "#3DDC97",
      planMode: "#2EC4B6",
      selection: "#76E4D2",
      thinking: "#2EC4B6",
      success: "#9BFFB0",
      error: "#FF595E",
      info: "#52D1C6",
      background: "#07120F",
      surface: "#10201B",
      dialogSurface: "#050C09",
      thinkingBorder: "#245047",
      dimSeparator: "#357065",
    },
  },
  {
    name: "Boron",
    colors: {
      primary: "#7AF5FF",
      planMode: "#4CC9F0",
      selection: "#A5F3FF",
      thinking: "#4CC9F0",
      success: "#8CFFB5",
      error: "#FF5E78",
      info: "#67E8F9",
      background: "#061116",
      surface: "#102029",
      dialogSurface: "#040A0D",
      thinkingBorder: "#284A5A",
      dimSeparator: "#3A687D",
    },
  },
  {
    name: "Strontium",
    colors: {
      primary: "#FF4D6D",
      planMode: "#FF758F",
      selection: "#FF9FB2",
      thinking: "#FF758F",
      success: "#8AFFC1",
      error: "#FF2D55",
      info: "#FF6B81",
      background: "#14070B",
      surface: "#220F16",
      dialogSurface: "#0C0407",
      thinkingBorder: "#5C2435",
      dimSeparator: "#7D3448",
    },
  },
  {
    name: "Barium",
    colors: {
      primary: "#9BE564",
      planMode: "#C7F464",
      selection: "#DFFF9F",
      thinking: "#C7F464",
      success: "#7DFFB3",
      error: "#FF5A5F",
      info: "#B8F26A",
      background: "#0B1207",
      surface: "#182010",
      dialogSurface: "#070C05",
      thinkingBorder: "#42552A",
      dimSeparator: "#5F753C",
    },
  },
  {
    name: "Rubidium",
    colors: {
      primary: "#D65DB1",
      planMode: "#C056C7",
      selection: "#E0A3D7",
      thinking: "#C056C7",
      success: "#7DFFC1",
      error: "#FF4F6D",
      info: "#D291E4",
      background: "#120812",
      surface: "#1F1220",
      dialogSurface: "#0A050A",
      thinkingBorder: "#53305A",
      dimSeparator: "#73427A",
    },
  },
  {
    name: "Cesium",
    colors: {
      primary: "#6C63FF",
      planMode: "#8B5CF6",
      selection: "#AFA8FF",
      thinking: "#8B5CF6",
      success: "#7DFFB3",
      error: "#FF5E5B",
      info: "#8EA2FF",
      background: "#0A0A16",
      surface: "#151526",
      dialogSurface: "#06060D",
      thinkingBorder: "#34345C",
      dimSeparator: "#4A4A80",
    },
  },
];
