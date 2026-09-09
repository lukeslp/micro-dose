// Micro Dose Syndicate for Pebble. Luke Steuber.
#include "game.h"
#include <pebble.h>
static Game g;
static Window *win;
static Layer *layer;
static int w, h, choice, menu, screen = 2, sx, sy;
static bool touch_on, touching, moved;
static int district = 1, front;
static AppTimer *tap_timer;
typedef struct {
  uint32_t magic;
  Game game;
  uint32_t checksum;
} Save;
_Static_assert(sizeof(Save) <= PERSIST_DATA_MAX_LENGTH, "Save too large");
static uint32_t sum(const Save *s) {
  const uint8_t *p = (const uint8_t *)s;
  uint32_t v = 2166136261u;
  for (unsigned i = 0; i < offsetof(Save, checksum); i++)
    v = (v ^ p[i]) * 16777619u;
  return v;
}
static void save(void) {
  Save s = {0};
  s.magic = 0x4d443031;
  s.game = g;
  s.checksum = sum(&s);
  persist_write_data(1, &s, sizeof s);
}
static void text(GContext *c, const char *s, int y, int height, bool large) {
  graphics_context_set_text_color(c, GColorWhite);
  graphics_draw_text(c, s,
                     fonts_get_system_font(large ? FONT_KEY_GOTHIC_24_BOLD
                                                 : FONT_KEY_GOTHIC_18_BOLD),
                     GRect(26, y, w - 52, height), GTextOverflowModeWordWrap,
                     GTextAlignmentCenter, NULL);
}
static void row(GContext *c, const char *s, int y, bool on) {
  graphics_context_set_fill_color(c, GColorBlack);
  graphics_fill_rect(c, GRect(26, y, w - 52, 32), 5, GCornersAll);
  if (on) {
    graphics_context_set_fill_color(c, GColorCyan);
    graphics_fill_rect(c, GRect(27, y + 5, 3, 22), 0, GCornerNone);
    graphics_context_set_stroke_color(c, GColorLightGray);
    graphics_draw_round_rect(c, GRect(26, y, w - 52, 32), 5);
  }
  text(c, s, y + 3, 28, false);
}

static void value(char *b, size_t n) {
  switch (choice) {
  case 0:
    snprintf(b, n, "Price: $%d", g.price);
    break;
  case 1:
    snprintf(b, n, "Cook: %d bags", g.units);
    break;
  case 2:
    snprintf(b, n, "Quality: %d%%", g.purity);
    break;
  case 3:
    snprintf(b, n, "%s", lanes[g.lane]);
    break;
  case 4:
    snprintf(b, n, "%s\n$%d%s", districts[district], district_cost[district],
             g.territories & (1 << district) ? " (owned)" : "");
    break;
  case 5:
    snprintf(b, n, "%s\n$%d%s", front_names[front], front_cost[front],
             g.fronts & (1 << front) ? " (owned)" : "");
    break;
  default:
    snprintf(b, n, "Run night %d", g.day);
  }
}
static void draw(Layer *l, GContext *c) {
  graphics_context_set_fill_color(c, GColorBlack);
  graphics_fill_rect(c, GRect(0, 0, w, h), 0, GCornerNone);
  char b[80];
  if (screen == 2) {
    text(c, "MICRO DOSE", 18, 32, true);
    text(c,
         "Up/Down browse.\nSelect edits or runs.\nPlan, then run a "
         "night.\nGrow cash and cred.\nKeep heat below 100.",
         54, 128, false);
    text(c, "Select to begin", h - 37, 28, false);
    return;
  }
  if (screen == 1) {
    text(c, "PAUSED", 20, 32, true);
    const char *r[] = {"Resume", "How to play", "New empire", "Save and exit"};
    for (int i = 0; i < 4; i++)
      row(c, r[i], 58 + i * 34, menu == i);
    return;
  }
  if (screen == 3) {
    text(c, "Start over?", 35, 35, true);
    text(c, "Replace your saved empire?", 80, 48, false);
    row(c, "Keep playing", 132, menu == 0);
    row(c, "New empire", 168, menu == 1);
    return;
  }
  if (screen == 6) {
    text(c, "Confirm purchase", 30, 35, true);
    value(b, sizeof b);
    text(c, b, 75, 60, false);
    row(c, "Cancel", 140, menu == 0);
    row(c, "Buy", 178, menu == 1);
    return;
  }
  if (screen == 5) {
    text(c, "NIGHT REPORT", 22, 34, true);
    text(c, g.message, 66, 60, true);
    snprintf(b, sizeof b, "Cash $%ld\nCred %d  Heat %d", (long)g.cash, g.cred,
             g.heat);
    text(c, b, 135, 52, false);
    text(c, "Select to continue", h - 36, 28, false);
    return;
  }
  if (g.over) {
    text(c, g.over == 1 ? "CREW BROKE" : "TASK FORCE BUST", 34, 65, true);
    snprintf(b, sizeof b, "Survived %d nights\nCash $%ld", g.day, (long)g.cash);
    text(c, b, 112, 62, false);
    text(c, "Back: new empire", h - 38, 28, false);
    return;
  }
  if (screen == 4) {
    text(c, "EDIT PLAN", 23, 34, true);
    value(b, sizeof b);
    text(c, b, 80, 65, true);
    text(c, "Up - / Down +", 151, 30, false);
    row(c, "Select to keep", h - 46, true);
    return;
  }
  // A compact city silhouette frames the ledger without occupying text rows.
  graphics_context_set_fill_color(c, GColorDarkGray);
  for (int i = 0; i < 7; i++) {
    int xx = w / 2 - 70 + i * 21, hh = 10 + ((i * 13) % 23);
    graphics_fill_rect(c, GRect(xx, 69 - hh, 15, hh), 0, GCornerNone);
  }
  snprintf(b, sizeof b, "NIGHT %d", g.day);
  text(c, b, 13, 24, false);
  snprintf(b, sizeof b, "$%ld", (long)g.cash);
  // Opaque central plaque keeps large cash digits distinct from the skyline.
  graphics_context_set_fill_color(c, GColorBlack);
  graphics_fill_rect(c, GRect(w / 2 - 48, 38, 96, 32), 2, GCornersAll);
  text(c, b, 37, 32, true);
  snprintf(b, sizeof b, "Cred %d   Heat %d", g.cred, g.heat);
  text(c, b, 72, 23, false);
  int barw = (w - 70) / 2;
  for (int k = 0; k < 2; k++) {
    int xx = 30 + k * (barw + 10), v = k ? g.heat : g.cred;
    if (v < 0)
      v = 0;
    if (v > 100)
      v = 100;
    graphics_context_set_stroke_color(c, GColorLightGray);
    graphics_draw_rect(c, GRect(xx, 98, barw, 6));
    graphics_context_set_fill_color(c, k ? GColorOrange : GColorCyan);
    graphics_fill_rect(c, GRect(xx + 1, 99, (barw - 2) * v / 100, 4), 0,
                       GCornerNone);
  }
  snprintf(b, sizeof b, "%s / %s\n%s", vibes[g.vibe], flows[g.flow],
           events[g.event]);
  text(c, b, 106, 43, false);
  graphics_context_set_stroke_color(c, GColorLightGray);
  graphics_draw_round_rect(c, GRect(26, 151, w - 52, 47), 4);
  graphics_context_set_fill_color(c, GColorCyan);
  graphics_fill_rect(c, GRect(28, 156, 3, 36), 0, GCornerNone);
  value(b, sizeof b);
  text(c, b, 153, 43, false);
  snprintf(b, sizeof b, h > 240 ? "%d/7  Select" : "%d/7  Up/Down  Select", choice + 1);
  text(c, b, h - (h > 240 ? 45 : 28), 23, false);
}
static void refresh(void) {
  APP_LOG(APP_LOG_LEVEL_INFO,
          "MD screen=%d choice=%d day=%d cash=%ld heat=%d over=%d", screen,
          choice, g.day, (long)g.cash, g.heat, g.over);
  layer_mark_dirty(layer);
}
static int adjust(int v, int d, int lo, int hi) {
  v += d;
  return v < lo ? lo : v > hi ? hi : v;
}
static void action(int b) {
  if (screen == 2 || screen == 5) {
    screen = 0;
    refresh();
    return;
  }
  if (screen == 3) {
    if (b == 3)
      screen = 1;
    else if (b == 0 || b == 2)
      menu = 1 - menu;
    else {
      if (menu) {
        game_init(&g, (uint32_t)time(NULL));
        choice = 0;
        save();
      }
      screen = 0;
    }
    refresh();
    return;
  }
  if (screen == 6) {
    if (b == 3)
      screen = 0;
    else if (b == 0 || b == 2)
      menu = 1 - menu;
    else {
      if (menu) {
        buy(&g, choice == 5, choice == 5 ? front : district);
        save();
        screen = 5;
      } else
        screen = 0;
    }
    refresh();
    return;
  }
  if (screen == 1) {
    if (b == 3)
      screen = 0;
    else if (b == 0)
      menu = (menu + 3) % 4;
    else if (b == 2)
      menu = (menu + 1) % 4;
    else {
      int m = menu;
      if (m == 0)
        screen = 0;
      if (m == 1)
        screen = 2;
      if (m == 2) {
        screen = 3;
        menu = 0;
      }
      if (m == 3) {
        save();
        window_stack_pop_all(false);
        return;
      }
    }
    refresh();
    return;
  }
  if (screen == 4) {
    if (b == 1) {
      screen = choice == 4 || choice == 5 ? 6 : 0;
      menu = 0;
      save();
    } else if (b == 3)
      screen = 0;
    else {
      int d = b == 0 ? -1 : 1;
      if (choice == 0)
        g.price = adjust(g.price, d * 5, 20, 200);
      if (choice == 1)
        g.units = adjust(g.units, d * 5, 0, 200);
      if (choice == 2)
        g.purity = adjust(g.purity, d * 5, 60, 100);
      if (choice == 3)
        g.lane = (g.lane + d + 4) % 4;
      if (choice == 4)
        district = 1 + (district - 1 + d + 5) % 5;
      if (choice == 5)
        front = (front + d + 4) % 4;
    }
    refresh();
    return;
  }
  if (b == 3) {
    screen = 1;
    menu = 0;
  } else if (!g.over) {
    if (b == 0)
      choice = (choice + 6) % 7;
    else if (b == 2)
      choice = (choice + 1) % 7;
    else if (choice == 6) {
      run_night(&g);
      save();
      screen = 5;
    } else
      screen = 4;
  }
  refresh();
}
static void up(ClickRecognizerRef r, void *x) { action(0); }
static void select_click(ClickRecognizerRef r, void *x) { action(1); }
static void down(ClickRecognizerRef r, void *x) { action(2); }
static void back(ClickRecognizerRef r, void *x) { action(3); }
static void clicks(void *x) {
  window_single_click_subscribe(BUTTON_ID_UP, up);
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click);
  window_single_click_subscribe(BUTTON_ID_DOWN, down);
  window_single_click_subscribe(BUTTON_ID_BACK, back);
}
static void cancel_tap(void) {
  if (tap_timer) {
    app_timer_cancel(tap_timer);
    tap_timer = NULL;
  }
  touching = false;
}
static void expire(void *x) {
  tap_timer = NULL;
  touching = false;
}
static void touch(const TouchEvent *e, void *x) {
  if (e->type == TouchEvent_Touchdown) {
    cancel_tap();
    sx = e->x;
    sy = e->y;
    touching = true;
    moved = false;
    tap_timer = app_timer_register(350, expire, NULL);
  } else if (e->type == TouchEvent_PositionUpdate) {
    if (abs(e->x - sx) > 8 || abs(e->y - sy) > 8)
      moved = true;
  } else {
    bool tap = touching && !moved && abs(e->x - sx) <= 8 && abs(e->y - sy) <= 8;
    cancel_tap();
    if (!tap)
      return;
    if (screen == 2 || screen == 5)
      action(1);
    else if (screen == 1 && sy >= 58 && sy < 194) {
      menu = (sy - 58) / 34;
      action(1);
    } else if (screen == 3 && sy >= 132 && sy < 200) {
      menu = sy >= 168;
      action(1);
    } else if (screen == 6 && sy >= 140 && sy < 210) {
      menu = sy >= 178;
      action(1);
    } else if (screen == 4) {
      if (sy >= h - 46)
        action(1);
      else if (sy >= 75)
        action(sx < w / 2 ? 0 : 2);
    } else if (!screen && sy >= 150) {
      if (sy >= h - 35)
        action(sx < w / 2 ? 0 : 2);
      else
        action(1);
    }
  }
}
static void focus(bool active) {
  cancel_tap();
  if (!active)
    save();
}
static void load(Window *x) {
  GRect b = layer_get_bounds(window_get_root_layer(x));
  w = b.size.w;
  h = b.size.h;
  layer = layer_create(b);
  layer_set_update_proc(layer, draw);
  layer_add_child(window_get_root_layer(x), layer);
  refresh();
}
static void unload(Window *x) { layer_destroy(layer); }
int main(void) {
  game_init(&g, (uint32_t)time(NULL));
  Save s = {0};
  if (persist_read_data(1, &s, sizeof s) == sizeof s && s.magic == 0x4d443031 &&
      s.checksum == sum(&s) && game_valid(&s.game)) {
    g = s.game;
    screen = 0;
  }
  win = window_create();
  window_set_background_color(win, GColorBlack);
  window_set_window_handlers(win,
                             (WindowHandlers){.load = load, .unload = unload});
  window_set_click_config_provider(win, clicks);
  window_stack_push(win, false);
  WatchInfoVersion v = watch_info_get_firmware_version();
  touch_on = v.major > 4 || (v.major == 4 &&
                             (v.minor > 33 || (v.minor == 33 && v.patch >= 2)));
  if (touch_on)
    touch_service_subscribe(touch, NULL);
  app_focus_service_subscribe(focus);
  app_event_loop();
  cancel_tap();
  save();
  if (touch_on)
    touch_service_unsubscribe();
  app_focus_service_unsubscribe();
  window_destroy(win);
}
