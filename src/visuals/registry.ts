import type { CardVisualEntry } from "../types";
import { CompactVisual } from "./scenes/CompactVisual";
import { DiagnoseVisual } from "./scenes/DiagnoseVisual";
import { FixVisual } from "./scenes/FixVisual";
import { ModelVisual } from "./scenes/ModelVisual";
import { NewFreshChatVisual } from "./scenes/NewFreshChatVisual";
import { NewScaffoldVisual } from "./scenes/NewScaffoldVisual";
import { WorkspaceVisual } from "./scenes/WorkspaceVisual";
import { YoloVisual } from "./scenes/YoloVisual";

export const VISUAL_REGISTRY: Readonly<Record<string, CardVisualEntry>> = {
  fix: {
    component: FixVisual,
    alt: "Robot tightening a wrench on a cracked gear",
    sceneBrief: "A blob-head robot grips a wrench and tightens a cracked gear while sparks fly at the fix point.",
    metaphorFamily: "workshop",
  },
  compact: {
    component: CompactVisual,
    alt: "Robot pressing a tall paper stack into a small cube",
    sceneBrief: "A robot pushes down on a tall stack of session papers; they collapse into a dense cube.",
    metaphorFamily: "session",
  },
  "new-scaffold": {
    component: NewScaffoldVisual,
    alt: "Robot in hard hat raising a scaffold framework",
    sceneBrief: "A hard-hatted robot lifts an arm to place the top block on a rising scaffold structure.",
    metaphorFamily: "scaffolding",
  },
  "new-fresh-chat": {
    component: NewFreshChatVisual,
    alt: "Robot pressing a glowing reset button to a blank canvas",
    sceneBrief: "A robot touches a restart button; a clean blank canvas appears as everything resets.",
    metaphorFamily: "session",
  },
  yolo: {
    component: YoloVisual,
    alt: "Cape-wearing robot launching off a ramp with a grin",
    sceneBrief: "A grinning robot with a flowing cape launches into the air from a ramp, ignoring a warning sign.",
    metaphorFamily: "permissions",
  },
  workspace: {
    component: WorkspaceVisual,
    alt: "Robot at the center of a constellation of file nodes",
    sceneBrief: "A robot stands in the hub of a web connecting multiple file nodes via dashed lines.",
    metaphorFamily: "integration",
  },
  diagnose: {
    component: DiagnoseVisual,
    alt: "Robot with magnifying glass examining a code heartbeat trace",
    sceneBrief: "A robot peers at a flatline that spikes into a heartbeat pattern, tracing the problem source.",
    metaphorFamily: "workshop",
  },
  model: {
    component: ModelVisual,
    alt: "Robot pointing at a control panel with model selection cards",
    sceneBrief: "A robot gestures toward a control panel where model cards are arranged and one is highlighted.",
    metaphorFamily: "config",
  },
};

export function getVisual(visualId: string): CardVisualEntry | undefined {
  return VISUAL_REGISTRY[visualId];
}
