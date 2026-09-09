// Luke Steuber. Alternating snapshot records, selector committed last.
#include "save.h"
#include <string.h>
typedef struct {
  uint32_t magic;
  Game game;
  uint32_t checksum;
} Save;
typedef struct {
  uint32_t rng;
  int32_t cash, profit;
  int day, cred, heat, price, units, purity, lane, vibe, flow, event, sold,
      over, territories, fronts;
  char message[64];
} LegacyGame;
typedef struct {
  uint32_t magic;
  LegacyGame game;
  uint32_t checksum;
} LegacySave;
_Static_assert(sizeof(Save) <= 256, "Snapshot exceeds Pebble record size");
_Static_assert(offsetof(Game, earned) == sizeof(LegacyGame), "Legacy prefix changed");
static uint32_t hash(const void *v, size_t n) {
  const uint8_t *p = v;
  uint32_t sum = 2166136261u;
  while (n--) sum = (sum ^ *p++) * 16777619u;
  return sum;
}
static int selected(const SaveIO *io) {
  int32_t bank = 0;
  if (io->read(12, &bank, sizeof bank) != sizeof bank || bank < 0 || bank > 1) return 0;
  return bank;
}
static bool load_bank(const SaveIO *io, int bank, Game *g) {
  Save s;
  if (io->read(10 + bank, &s, sizeof s) != sizeof s || s.magic != 0x4d443032 ||
      s.checksum != hash(&s, offsetof(Save, checksum)) || !game_valid(&s.game)) return false;
  *g = s.game;
  return true;
}
bool save_load(const SaveIO *io, Game *g) {
  int bank = selected(io);
  if (load_bank(io, bank, g) || load_bank(io, bank ^ 1, g)) return true;
  LegacySave old;
  if (io->read(1, &old, sizeof old) != sizeof old || old.magic != 0x4d443031 ||
      old.checksum != hash(&old, offsetof(LegacySave, checksum))) return false;
  memset(g, 0, sizeof *g);
  memcpy(g, &old.game, sizeof old.game);
  // Previous releases had all lanes. Preserve that access, but never invent
  // historical profit or promotion rewards from a cash balance.
  g->legacy_lanes = 15;
  return game_valid(g);
}
bool save_store(const SaveIO *io, const Game *g) {
  if (!game_valid(g)) return false;
  int bank = selected(io) ^ 1;
  Game previous;
  if (!load_bank(io, bank ^ 1, &previous) && load_bank(io, bank, &previous)) {
    int32_t fallback = bank;
    if (io->write(12, &fallback, sizeof fallback) != sizeof fallback) return false;
    bank ^= 1;
  }
  Save s = {0};
  s.magic = 0x4d443032;
  s.game = *g;
  s.checksum = hash(&s, offsetof(Save, checksum));
  if (io->write(10 + bank, &s, sizeof s) != sizeof s) return false;
  int32_t selector = bank;
  return io->write(12, &selector, sizeof selector) == sizeof selector;
}
