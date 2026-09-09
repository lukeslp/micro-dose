// Micro Dose Syndicate. Fictional strategy game. Luke Steuber.
#pragma once
#include <stdbool.h>
#include <stdint.h>
typedef struct {
  uint32_t rng;
  int32_t cash, profit;
  int day, cred, heat, price, units, purity, lane, vibe, flow, event, sold,
      over, territories, fronts;
  char message[64];
} Game;
void game_init(Game *, uint32_t);
void run_night(Game *);
bool buy(Game *, bool, int);
bool game_valid(const Game *);
extern const char *lanes[4], *vibes[5], *flows[4], *events[7], *districts[6],
    *front_names[4];
extern const int district_cost[6], front_cost[4];
