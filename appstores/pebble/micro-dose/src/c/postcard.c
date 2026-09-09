#include "postcard.h"
static GBitmap *city;
static void box(GContext *c, int x, int y, int w, int h, GColor color) {
  graphics_context_set_fill_color(c, color);
  graphics_fill_rect(c, GRect(x, y, w, h), 0, GCornerNone);
}
static void line(GContext *c, int x, int y, int x2, int y2, GColor color) {
  graphics_context_set_stroke_color(c, color);
  graphics_draw_line(c, GPoint(x, y), GPoint(x2, y2));
}
void postcard_release(void) {
  if (city)
    gbitmap_destroy(city);
  city = NULL;
}
void postcard_draw(GContext *c, GPoint p, ReportScene scene, int night) {
  const int x = p.x, y = p.y;
  box(c, x, y, 144, 64, GColorOxfordBlue);
  if (!city)
    city = gbitmap_create_with_resource(RESOURCE_ID_CITY);
  if (city) {
    // Native-resolution crop; no filtering, generated art, or game RNG calls.
    GBitmap *crop = gbitmap_create_as_sub_bitmap(
        city, GRect((night % 6) * 18, 62, 144, 64));
    if (crop) {
      graphics_draw_bitmap_in_rect(c, crop, GRect(x, y, 144, 64));
      gbitmap_destroy(crop);
    }
  }
  box(c, x, y + 42, 144, 22, GColorBlack);
  line(c, x, y + 62, x + 143, y + 62, GColorDarkGray);
  // A foreground rooftop and moon give every postcard a readable silhouette.
  if (scene == SCENE_QUIET) {
    graphics_context_set_fill_color(c, GColorPastelYellow);
    graphics_fill_circle(c, GPoint(x + 120, y + 12), 6);
    graphics_context_set_fill_color(c, GColorOxfordBlue);
    graphics_fill_circle(c, GPoint(x + 123, y + 10), 5);
    box(c, x + 18, y + 32, 56, 29, GColorDarkGray);
    box(c, x + 14, y + 30, 64, 3, GColorLightGray);
    for (int i = 0; i < 4; i++)
      box(c, x + 24 + i * 12, y + 39, 4, 7,
          i % 2 ? GColorBlack : GColorPastelYellow);
    line(c, x + 56, y + 30, x + 56, y + 18, GColorLightGray);
    line(c, x + 50, y + 21, x + 62, y + 21, GColorLightGray);
  } else if (scene == SCENE_HEAT) {
    // Car, wheels, roof light and striped barricade distinguish heat without
    // color.
    box(c, x + 14, y + 47, 56, 10, GColorLightGray);
    box(c, x + 26, y + 39, 29, 9, GColorWhite);
    box(c, x + 29, y + 41, 9, 6, GColorOxfordBlue);
    box(c, x + 41, y + 41, 10, 6, GColorOxfordBlue);
    box(c, x + 34, y + 35, 7, 4, GColorRed);
    box(c, x + 41, y + 35, 7, 4, GColorCyan);
    box(c, x + 20, y + 55, 9, 5, GColorDarkGray);
    box(c, x + 54, y + 55, 9, 5, GColorDarkGray);
    box(c, x + 90, y + 43, 4, 18, GColorLightGray);
    box(c, x + 125, y + 43, 4, 18, GColorLightGray);
    box(c, x + 85, y + 45, 49, 7, GColorChromeYellow);
    for (int i = 0; i < 5; i++)
      line(c, x + 89 + i * 9, y + 45, x + 95 + i * 9, y + 51, GColorBlack);
  } else if (scene == SCENE_DROUGHT) {
    box(c, x + 22, y + 29, 100, 31, GColorDarkGray);
    box(c, x + 31, y + 34, 55, 26, GColorBlack);
    box(c, x + 29, y + 29, 59, 3, GColorLightGray);
    box(c, x + 98, y + 47, 15, 13, GColorLightGray);
    box(c, x + 100, y + 49, 11, 9, GColorBlack);
    line(c, x + 101, y + 50, x + 109, y + 56, GColorLightGray);
    line(c, x + 23, y + 61, x + 124, y + 61, GColorChromeYellow);
  } else {
    // Shop with awning, door and two display windows.
    box(c, x + 30, y + 27, 84, 34, GColorDarkGray);
    box(c, x + 26, y + 24, 92, 7,
        scene == SCENE_CLUB ? GColorMagenta : GColorCyan);
    for (int i = 0; i < 8; i++)
      box(c, x + 28 + i * 11, y + 26, 5, 5, GColorWhite);
    GColor lit = (scene == SCENE_LOSS || scene == SCENE_BROKE)
                     ? GColorBlack
                     : GColorPastelYellow;
    box(c, x + 36, y + 37, 21, 17, lit);
    box(c, x + 88, y + 37, 20, 17, lit);
    box(c, x + 66, y + 35, 15, 26, GColorBlack);
    if (scene == SCENE_LOSS || scene == SCENE_BROKE) {
      for (int j = 0; j < 4; j++)
        line(c, x + 35, y + 38 + j * 5, x + 108, y + 38 + j * 5,
             GColorLightGray);
      if (scene == SCENE_BROKE) {
        line(c, x + 63, y + 35, x + 83, y + 59, GColorChromeYellow);
        line(c, x + 83, y + 35, x + 63, y + 59, GColorChromeYellow);
      } else {
        for (int i = 0; i < 16; i++) {
          int xx = x + 3 + (i * 31) % 133, yy = y + 3 + (i * 13) % 34;
          line(c, xx, yy, xx - 2, yy + 5, GColorLightGray);
        }
      }
    } else if (scene == SCENE_EXPANSION) {
      // Scaffold and a large key.
      for (int i = 0; i < 3; i++) {
        line(c, x + 15, y + 20 + i * 15, x + 28, y + 20 + i * 15, GColorWhite);
      }
      line(c, x + 16, y + 19, x + 16, y + 61, GColorWhite);
      line(c, x + 27, y + 19, x + 27, y + 61, GColorWhite);
      graphics_context_set_stroke_color(c, GColorChromeYellow);
      graphics_draw_circle(c, GPoint(x + 127, y + 37), 5);
      box(c, x + 125, y + 42, 3, 15, GColorChromeYellow);
      box(c, x + 128, y + 51, 5, 3, GColorChromeYellow);
      box(c, x + 128, y + 56, 5, 3, GColorChromeYellow);
    } else if (scene == SCENE_CLUB) {
      for (int i = 0; i < 4; i++) {
        int xx = x + 76 + i * 14;
        graphics_context_set_fill_color(c, GColorWhite);
        graphics_fill_circle(c, GPoint(xx, y + 49), 2);
        box(c, xx - 2, y + 52, 5, 8, GColorLightGray);
      }
      line(c, x + 53, y + 10, x + 68, y + 23, GColorCyan);
      line(c, x + 93, y + 10, x + 78, y + 23, GColorMagenta);
    } else {
      // Bicycle beside the bright shop.
      graphics_context_set_stroke_color(c, GColorWhite);
      graphics_draw_circle(c, GPoint(x + 16, y + 55), 5);
      graphics_draw_circle(c, GPoint(x + 32, y + 55), 5);
      line(c, x + 16, y + 55, x + 23, y + 46, GColorCyan);
      line(c, x + 23, y + 46, x + 32, y + 55, GColorCyan);
      line(c, x + 16, y + 55, x + 32, y + 55, GColorCyan);
    }
  }
  graphics_context_set_stroke_color(c, GColorLightGray);
  graphics_draw_rect(c, GRect(x, y, 144, 64));
}
