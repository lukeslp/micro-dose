#include "../src/c/game.h"
#include <assert.h>
#include <stdio.h>
int main(void) {
  for (unsigned s = 1; s <= 10000; s++) {
    Game g;
    game_init(&g, s);
    for (int n = 0; n < 40 && !g.over; n++) {
      g.price = 20 + (n * 15) % 185;
      g.units = (n * 7) % 201;
      g.purity = 60 + (n % 9) * 5;
      g.lane = n % 4;
      run_night(&g);
      assert(game_valid(&g));
    }
    if (g.over) {
      int day = g.day, cash = g.cash;
      run_night(&g);
      assert(day == g.day && cash == g.cash);
    }
  }
  Game g;
  game_init(&g, 1);
  assert(!buy(&g, false, 1));
  g.cash = 10000;
  assert(buy(&g, false, 1));
  assert(g.cash == 7000);
  assert(!buy(&g, false, 1));
  assert(g.cash == 7000);
  g.cash = 10000;
  assert(buy(&g, true, 0));
  assert(g.cash == 2000);
  g.heat = 99;
  g.lane = 3;
  g.event = 0;
  g.purity = 100;
  run_night(&g);
  assert(g.over == 2);
  game_init(&g, 1);
  g.cash = 0;
  g.units = 0;
  run_night(&g);
  assert(g.over == 1);
  puts("PASS 10000 economies, ownership charges, bankruptcy, bust, terminal "
       "guards");
}
