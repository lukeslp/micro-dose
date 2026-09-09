// Core economy adapted from game.js; compact watch campaign. Luke Steuber.
#include "game.h"
#include <math.h>
#include <stdio.h>
#include <string.h>
const char *lanes[] = {"Solo corners", "Bike runners", "Club residency",
                       "Ghost lockers"};
const char *vibes[] = {"Calm", "Buzzing", "Frantic", "Tense", "Euphoric"};
const char *flows[] = {"Sparse", "Steady", "Flood", "Tour bus"};
const char *events[] = {
    "Quiet night",    "Underground rave", "Vice sweep",     "Crypto conference",
    "Supply drought", "Community patrol", "Influencer drop"};
const char *districts[] = {"Downtown",    "East Side",  "The Docks",
                           "The Heights", "Industrial", "Quiet Suburbs"};
const int district_cost[] = {0, 3000, 5000, 8000, 6500, 4500};
const char *front_names[] = {"Laundromat", "Crypto mixer", "Dispensary",
                             "Restaurant"};
const int front_cost[] = {8000, 12000, 15000, 20000};
const char *ranks[] = {"Runner", "Dealer", "Operator", "District Boss", "Syndicate Chief", "Empire"};
static int owned_count(int bits) {
  int n = 0;
  while (bits) { n += bits & 1; bits >>= 1; }
  return n;
}
bool lane_allowed(const Game *g, int lane) {
  static const int level[] = {0, 1, 2, 4};
  return lane >= 0 && lane < 4 && (g->rank >= level[lane] || (g->legacy_lanes & (1 << lane)));
}
int required_rank(bool front, int i) {
  static const int f[] = {2, 4, 3, 4}, d[] = {0, 0, 1, 3, 2, 2};
  return i >= 0 && i < (front ? 4 : 6) ? (front ? f[i] : d[i]) : 6;
}
static int missing(const Game *g, int rank) {
  static const int cash[] = {0, 1500, 5000, 12000, 30000, 60000};
  static const int districts_needed[] = {0, 1, 2, 3, 4, 6};
  static const int fronts_needed[] = {0, 0, 0, 1, 2, 3};
  if (g->good_nights < 3) return 1;
  if (g->earned < cash[rank]) return 2;
  if (owned_count(g->territories) < districts_needed[rank]) return 3;
  if (owned_count(g->fronts) < fronts_needed[rank]) return 4;
  if (rank >= 4 && !g->quiet_nights) return 5;
  if (rank == 5 && g->heat >= 60) return 6;
  return 0;
}
void career_update(Game *g) {
  if (g->over) return;
  while (g->rank < 5 && !missing(g, g->rank + 1)) g->rank++;
}
const char *career_reward(const Game *g) {
  static const char *reward[] = {"Unlock bike runners", "Unlock clubs and fronts",
    "Unlock Heights and dispensary", "Unlock lockers and crypto", "Build your Empire", "Campaign won. Keep playing."};
  return reward[g->rank];
}
void career_goal(const Game *g, char *out, size_t n) {
  static const int dollars[] = {0,1500,5000,12000,30000,60000};
  static const int districts_needed[] = {0,1,2,3,4,6}, fronts_needed[] = {0,0,0,1,2,3};
  if (g->rank == 5) { snprintf(out,n,"All promotions earned."); return; }
  int rank = g->rank + 1;
  switch (missing(g, rank)) {
  case 1: snprintf(out,n,"Profitable nights: %lu/3",(unsigned long)g->good_nights); break;
  case 2: snprintf(out,n,"Net $%ld\nGoal $%d",(long)g->earned,dollars[rank]); break;
  case 3: snprintf(out,n,"Districts owned: %d/%d",owned_count(g->territories),districts_needed[rank]); break;
  case 4: snprintf(out,n,"Fronts owned: %d/%d",owned_count(g->fronts),fronts_needed[rank]); break;
  case 5: snprintf(out,n,"Profit with heat below 50."); break;
  case 6: snprintf(out,n,"Bring heat below 60."); break;
  default: snprintf(out,n,"Ready for promotion."); break;
  }
}
static unsigned rnd(Game *g) {
  unsigned x = g->rng;
  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  return g->rng = x;
}
static int clamp(int x, int a, int b) { return x < a ? a : x > b ? b : x; }
static void forecast(Game *g) {
  g->vibe = rnd(g) % 5;
  g->flow = rnd(g) % 4;
  g->event = rnd(g) % 3 == 0 ? 1 + rnd(g) % 6 : 0;
}
void game_init(Game *g, uint32_t seed) {
  memset(g, 0, sizeof *g);
  g->rng = seed ? seed : 1;
  g->cash = 750;
  g->cred = 55;
  g->heat = 20;
  g->day = 1;
  g->price = 60;
  g->units = 30;
  g->purity = 85;
  g->territories = 1;
  forecast(g);
  snprintf(g->message, 64, "Read intel. Set your plan. Run night.");
}
bool buy(Game *g, bool front, int i) {
  if (g->over || i < 0 || i >= (front ? 4 : 6))
    return false;
  int *owned = front ? &g->fronts : &g->territories,
      cost = front ? front_cost[i] : district_cost[i];
  if (*owned & (1 << i)) {
    snprintf(g->message, 64, "Already owned.");
    return false;
  }
  if (g->rank < required_rank(front, i)) {
    snprintf(g->message, 64, "Unlock at %s.", ranks[required_rank(front, i)]);
    return false;
  }
  if (g->cash < cost) {
    snprintf(g->message, 64, "Need $%d to purchase.", cost);
    return false;
  }
  g->cash -= cost;
  *owned |= 1 << i;
  career_update(g);
  snprintf(g->message, 64, "Bought %s", front ? front_names[i] : districts[i]);
  return true;
}
void run_night(Game *g) {
  if (g->over)
    return;
  if (!lane_allowed(g, g->lane)) {
    snprintf(g->message, 64, "This lane needs a promotion.");
    return;
  }
  const float vm[] = {.9f, 1.1f, 1.3f, .8f, 1.5f}, fm[] = {.7f, 1, 1.25f, 1.4f},
              lm[] = {.95f, 1.15f, 1.3f, 1.45f},
              em[] = {1, 1.6f, .6f, 1.35f, .85f, .75f, 1.4f};
  const int lc[] = {0, 60, 140, 220}, lh[] = {0, 3, 6, 10},
            ec[] = {0, 3, -2, 2, 0, -1, 4}, eh[] = {0, 4, 10, 2, -4, 7, 1},
            income[] = {150, 280, 350, 450};
  float reach = 1;
  for (int i = 1; i < 6; i++)
    if (g->territories & (1 << i))
      reach += .08f;
  float d = 55 * vm[g->vibe] * fm[g->flow] * lm[g->lane] * em[g->event] *
            reach * (.6f + (g->purity - 60) * .01f) *
            fmaxf(.25f, 1.4f - g->price / 120.f) * (.65f + g->cred / 150.f) *
            fmaxf(.35f, 1.05f - g->heat / 80.f) *
            (.8f + (rnd(g) % 4501) / 10000.f);
  g->sold = clamp((int)roundf(d), 0, g->units);
  int cost = (int)roundf(g->units * 12 * (g->purity / 80.f)) + lc[g->lane] + 95;
  g->profit = g->sold * g->price - cost;
  for (int i = 0; i < 4; i++)
    if (g->fronts & (1 << i))
      g->profit += income[i];
  // Bound the long-running score to avoid integer overflow on endless saves.
  int64_t total = (int64_t)g->cash + g->profit;
  g->cash = total > 99999999 ? 99999999 : (int32_t)total;
  g->earned = clamp(g->earned + g->profit, -100000, 99999999);
  float rate = g->units ? g->sold / (float)g->units : 0;
  int cred = 0, heat = lh[g->lane];
  if (g->units) {
    if (rate > .95f)
      cred += 4;
    else if (rate > .75f)
      cred += 2;
    else if (rate < .4f)
      cred -= 2;
    if (g->units - g->sold > g->units * .4f)
      cred--;
  }
  if (g->price >= 120 && rate < .5f)
    cred -= 2;
  if (g->purity >= 90 && rate > .6f)
    cred += 2;
  if (g->profit < 0)
    cred -= 2;
  if (g->price > 150)
    heat += 3;
  else if (g->price < 60)
    heat--;
  if (g->purity >= 90)
    heat += 2;
  if (rate > .9f && g->sold > 80)
    heat += 2;
  if (rate < .25f)
    heat -= 2;
  if (g->sold < 30 && !g->lane)
    heat--;
  g->cred = clamp(g->cred + cred + ec[g->event], 0, 120);
  g->heat = clamp(g->heat + clamp(heat, -6, 10) + eh[g->event], 0, 120);
  snprintf(g->message, 64, "Sold %d/%d. Net %s$%ld", g->sold, g->units,
           g->profit < 0 ? "-" : "+",
           (long)(g->profit < 0 ? -g->profit : g->profit));
  if (g->cash < 0)
    g->over = 1;
  else if (g->heat >= 100)
    g->over = 2;
  else {
    if (g->profit > 0) {
      if (g->good_nights < 99999) g->good_nights++;
      if (g->heat < 50 && g->quiet_nights < 99999) g->quiet_nights++;
    }
    career_update(g);
    if (g->day < 99999)
      g->day++;
    forecast(g);
  }
}
void lay_low(Game *g) {
  if (g->over) return;
  static const int income[] = {150, 280, 350, 450};
  g->profit = -150;
  for (int i = 0; i < 4; i++) if (g->fronts & (1 << i)) g->profit += income[i];
  g->cash = clamp(g->cash + g->profit, -100000, 99999999);
  g->earned = clamp(g->earned + g->profit, -100000, 99999999);
  g->heat = clamp(g->heat - 18, 0, 120);
  g->cred = clamp(g->cred - 1, 0, 120);
  g->sold = 0;
  snprintf(g->message, 64, "Laid low. Heat -18; expenses $150.");
  if (g->cash < 0) g->over = 1;
  else {
    career_update(g);
    if (g->day < 99999) g->day++;
    forecast(g);
  }
}
bool game_valid(const Game *g) {
  return g->rng && g->cash >= -100000 && g->cash <= 99999999 && g->day > 0 &&
         g->day <= 99999 && g->cred >= 0 && g->cred <= 120 && g->heat >= 0 &&
         g->heat <= 120 && g->price >= 20 && g->price <= 200 && g->units >= 0 &&
         g->units <= 200 && g->purity >= 60 && g->purity <= 100 &&
         g->lane >= 0 && g->lane < 4 && g->vibe >= 0 && g->vibe < 5 &&
         g->flow >= 0 && g->flow < 4 && g->event >= 0 && g->event < 7 &&
         g->over >= 0 && g->over <= 2 && g->territories >= 1 &&
         g->territories < 64 && g->fronts >= 0 && g->fronts < 16 &&
         g->message[63] == 0 && g->rank <= 5 && g->legacy_lanes <= 15 &&
         g->earned >= -100000 && g->earned <= 99999999 &&
         g->good_nights <= 99999 && g->quiet_nights <= g->good_nights;
}
