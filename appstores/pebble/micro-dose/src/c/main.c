// Micro Dose Syndicate for Pebble. Luke Steuber.
#include "game.h"
#include "save.h"
#include "postcard.h"
#include <pebble.h>
static Game g;
static ReportScene scene;
static int report_day;
static bool purchase_report, rest_report;
static int previous_rank;
static bool save_failed;
static Window *win;
static Layer *layer;
static int w, h, choice, menu, screen = 2, sx, sy;
static bool touch_on, touching, moved;
static int district = 1, front;
static AppTimer *tap_timer;
static const SaveIO save_io = {persist_read_data, persist_write_data};
static bool save(void) {
  save_failed = !save_store(&save_io, &g);
  return !save_failed;
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
    if (!(g.territories & (1 << district)) && g.rank < required_rank(false, district)) {
      snprintf(b,n,"%s\nNeeds level %d",districts[district],required_rank(false,district)+1);
      break;
    }
    snprintf(b, n, "%s\n$%d%s", districts[district], district_cost[district],
             g.territories & (1 << district) ? " (owned)" : "");
    break;
  case 5:
    if (!(g.fronts & (1 << front)) && g.rank < required_rank(true, front)) {
      snprintf(b,n,"%s\nNeeds level %d",front_names[front],required_rank(true,front)+1);
      break;
    }
    snprintf(b, n, "%s\n$%d%s", front_names[front], front_cost[front],
             g.fronts & (1 << front) ? " (owned)" : "");
    break;
  case 6:
    snprintf(b, n, "Run night %d", g.day);
    break;
  case 7:
    snprintf(b, n, "Career: %s", ranks[g.rank]);
    break;
  default:
    snprintf(b, n, "Lay low: $150\nHeat -18; takes a night");
  }
}
static void draw(Layer *l, GContext *c) {
  graphics_context_set_fill_color(c, GColorBlack);
  graphics_fill_rect(c, GRect(0, 0, w, h), 0, GCornerNone);
  char b[80];
  if (save_failed) {
    text(c, "SAVE INTERRUPTED", 30, 52, true);
    text(c, "Select to retry.\nPlay pauses until saved.", 96, 74, false);
    return;
  }
  if (screen == 7) {
    text(c, g.rank == 5 ? "EMPIRE BUILT" : "YOUR CAREER", 22, 33, true);
    snprintf(b, sizeof b, "Level %d/6: %s", g.rank + 1, ranks[g.rank]);
    text(c, b, 60, 44, false);
    career_goal(&g, b, sizeof b);
    text(c, b, 108, 48, false);
    text(c, career_reward(&g), 160, 38, false);
    text(c, "Select to return", h - 28, 24, false);
    return;
  }
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
    int offset = h > 240 ? 16 : 0;
    if (g.rank > previous_rank && g.rank == 5)
      snprintf(b, sizeof b, "EMPIRE BUILT");
    else if (g.rank > previous_rank)
      snprintf(b, sizeof b, "PROMOTED %d/6", g.rank + 1);
    else if (purchase_report)
      snprintf(b, sizeof b, "PURCHASE");
    else
      snprintf(b, sizeof b, "NIGHT %d", report_day);
    text(c, b, 12 + offset, 24, false);
    postcard_draw(c, GPoint((w - 144) / 2, 42 + offset), scene, report_day);
    if (purchase_report) {
      if (g.rank > previous_rank) {
        text(c, ranks[g.rank], 108 + offset, 24, false);
        text(c, g.message, 130 + offset, 24, false);
      } else {
        text(c, g.message, 110 + offset, 44, false);
      }
    } else {
      if (g.rank > previous_rank) snprintf(b, sizeof b, "%s", ranks[g.rank]);
      else if (rest_report) snprintf(b, sizeof b, "Lay low: heat -18");
      else snprintf(b, sizeof b, "Sold %d / %d", g.sold, g.units);
      text(c, b, 108 + offset, 24, false);
      snprintf(b, sizeof b, "Net %s$%ld", g.profit < 0 ? "-" : "+",
               (long)(g.profit < 0 ? -g.profit : g.profit));
      text(c, b, 129 + offset, 30, true);
    }
    snprintf(b, sizeof b, "Cash $%ld", (long)g.cash);
    text(c, b, 157 + offset, 24, false);
    snprintf(b, sizeof b, "Cred %d  Heat %d", g.cred, g.heat);
    text(c, b, 179 + offset, 24, false);
    text(c, g.rank == 5 ? "Select: keep playing" : "Select: continue", 201 + offset, 24, false);
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
  snprintf(b, sizeof b, "NIGHT %d  L%d", g.day, g.rank + 1);
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
  snprintf(b, sizeof b, h > 240 ? "%d/9  Select" : "%d/9  Up/Down  Select",
           choice + 1);
  text(c, b, h - (h > 240 ? 45 : 28), 23, false);
}
static void refresh(void) {
  APP_LOG(APP_LOG_LEVEL_INFO, "MD assets territories=%d fronts=%d", g.territories, g.fronts);
  APP_LOG(APP_LOG_LEVEL_INFO, "MD career rank=%d earned=%ld good=%lu quiet=%lu",
          g.rank, (long)g.earned, (unsigned long)g.good_nights, (unsigned long)g.quiet_nights);
  APP_LOG(APP_LOG_LEVEL_INFO,
          "MD screen=%d choice=%d day=%d cash=%ld heat=%d over=%d", screen,
          choice, g.day, (long)g.cash, g.heat, g.over);
  if (screen == 5)
    APP_LOG(APP_LOG_LEVEL_INFO, "MD report_scene=%d report_day=%d purchase=%d",
            scene, report_day, purchase_report);
  else
    postcard_release();
  layer_mark_dirty(layer);
}
static int adjust(int v, int d, int lo, int hi) {
  v += d;
  return v < lo ? lo : v > hi ? hi : v;
}
static void action(int b) {
  if (save_failed) {
    if (b == 1) save();
    refresh();
    return;
  }
  if (screen == 7) {
    screen = 0;
    refresh();
    return;
  }
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
        previous_rank = g.rank;
        bool purchased = buy(&g, choice == 5, choice == 5 ? front : district);
        purchase_report = true;
        report_day = g.day;
        scene = purchased ? SCENE_EXPANSION : SCENE_QUIET;
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
        if (!save()) { refresh(); return; }
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
      if (choice == 3) {
        int candidate = g.lane;
        do { candidate = (candidate + d + 4) % 4; } while (!lane_allowed(&g, candidate));
        g.lane = candidate;
      }
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
      choice = (choice + 8) % 9;
    else if (b == 2)
      choice = (choice + 1) % 9;
    else if (choice == 7) screen = 7;
    else if (choice == 6 || choice == 8) {
      int completed_event = g.event, previous_heat = g.heat;
      report_day = g.day;
      purchase_report = false;
      rest_report = choice == 8;
      previous_rank = g.rank;
      if (rest_report) lay_low(&g); else run_night(&g);
      scene = report_scene(&g, rest_report ? 0 : completed_event, previous_heat);
      if (g.rank > previous_rank) scene = SCENE_EXPANSION;
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
    if (save_failed || screen == 2 || screen == 5 || screen == 7)
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
  if (save_load(&save_io, &g)) screen = 0;
  save();
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
  postcard_release();
  window_destroy(win);
}
