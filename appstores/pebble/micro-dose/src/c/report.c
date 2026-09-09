#include "report.h"
ReportScene report_scene(const Game *g, int event, int previous_heat) {
  if (g->over == 2)
    return SCENE_HEAT;
  if (g->over == 1)
    return SCENE_BROKE;
  if (g->heat >= 70 || g->heat - previous_heat >= 7 || event == 2 || event == 5)
    return SCENE_HEAT;
  if (g->profit < 0)
    return SCENE_LOSS;
  if (event == 4)
    return SCENE_DROUGHT;
  if (event == 1)
    return SCENE_CLUB;
  if (g->profit >= 400)
    return SCENE_PROFIT;
  return SCENE_QUIET;
}
