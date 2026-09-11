// CC0 city backdrop with native foreground illustration. Luke Steuber.
#pragma once
#define POSTCARD_WIDTH 180
#define POSTCARD_HEIGHT 80
#include "report.h"
#include <pebble.h>
void postcard_draw(GContext *, GPoint, ReportScene, int night);
void postcard_release(void);
