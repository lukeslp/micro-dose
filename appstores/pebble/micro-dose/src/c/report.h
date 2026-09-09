// Illustrated night reports. Luke Steuber.
#pragma once
#include "game.h"
typedef enum {
  SCENE_QUIET,
  SCENE_PROFIT,
  SCENE_LOSS,
  SCENE_HEAT,
  SCENE_CLUB,
  SCENE_DROUGHT,
  SCENE_EXPANSION,
  SCENE_BROKE
} ReportScene;
// Pass the completed night's event and heat, before forecast advances.
ReportScene report_scene(const Game *after, int event, int previous_heat);
