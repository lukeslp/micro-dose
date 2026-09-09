#include "../src/c/report.h"
#include <assert.h>
#include <stdio.h>
int main(void) {
  Game g;
  game_init(&g, 1);
  g.profit = 100;
  assert(report_scene(&g, 0, 20) == SCENE_QUIET);
  g.profit = 400;
  assert(report_scene(&g, 0, 20) == SCENE_PROFIT);
  assert(report_scene(&g, 1, 20) == SCENE_CLUB);
  assert(report_scene(&g, 4, 20) == SCENE_DROUGHT);
  g.event = 2; // Tomorrow's forecast must not leak into tonight's scene.
  assert(report_scene(&g, 0, 20) == SCENE_PROFIT);
  assert(report_scene(&g, 2, 20) == SCENE_HEAT);
  assert(report_scene(&g, 5, 20) == SCENE_HEAT);
  g.profit = -100;
  assert(report_scene(&g, 0, 20) == SCENE_LOSS);
  g.heat = 27;
  assert(report_scene(&g, 0, 20) == SCENE_HEAT);
  g.heat = 70;
  assert(report_scene(&g, 0, 70) == SCENE_HEAT);
  g.over = 1;
  assert(report_scene(&g, 2, 20) == SCENE_BROKE);
  g.over = 2;
  assert(report_scene(&g, 0, 20) == SCENE_HEAT);
  puts("PASS report precedence, completed-night event, heat delta, terminal "
       "scenes");
}
