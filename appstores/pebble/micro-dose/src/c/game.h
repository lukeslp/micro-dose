// Micro Dose Syndicate. Fictional strategy game. Luke Steuber.
#pragma once
#include <stdbool.h>
#include <stdint.h>
#include <stddef.h>
typedef struct {
  uint32_t rng;
  int32_t cash, profit;
  int day, cred, heat, price, units, purity, lane, vibe, flow, event, sold,
      over, territories, fronts;
  char message[64];
  int32_t earned;
  uint32_t good_nights, quiet_nights;
  uint8_t rank, legacy_lanes;
} Game;
void game_init(Game *, uint32_t);
void run_night(Game *);
bool buy(Game *, bool, int);
bool game_valid(const Game *);
extern const char *lanes[4], *vibes[5], *flows[4], *events[7], *districts[6],
    *front_names[4];
extern const int district_cost[6], front_cost[4];

extern const char *ranks[6];
bool lane_allowed(const Game *, int lane);
int required_rank(bool front, int index);
void career_goal(const Game *, char *, size_t);
const char *career_reward(const Game *);
void lay_low(Game *);
void career_update(Game *);
