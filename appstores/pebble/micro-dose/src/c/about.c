// One-screen author information. Luke Steuber.
#include "about.h"
#include "ui_style.h"
static GBitmap *portrait;
static bool tried;
void about_release(void) {
  if (portrait) gbitmap_destroy(portrait);
  portrait = NULL;
  tried = false;
}
static void line(GContext *c, const char *value, int width, int top,
                 int height, const char *font) {
  graphics_context_set_text_color(c, GColorWhite);
  graphics_draw_text(c, value, fonts_get_system_font(font),
                    GRect(8, top, width - 16, height),
                    GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
}
void about_draw(GContext *c, int width) {
  if (!tried) {
    portrait = gbitmap_create_with_resource(RESOURCE_ID_AUTHOR_PORTRAIT);
    tried = true;
  }
  line(c, "ABOUT", width, 14, 32, UI_FONT_TITLE);
  if (portrait)
    graphics_draw_bitmap_in_rect(c, portrait, GRect((width - 96) / 2, 47, 96, 96));
  line(c, "Luke Steuber", width, 144, 31, UI_FONT_BODY);
  line(c, "Version 0.5.1", width, 176, 23, UI_FONT_SMALL);
  line(c, "Select / Back: return", width, 203, 23, UI_FONT_SMALL);
}
