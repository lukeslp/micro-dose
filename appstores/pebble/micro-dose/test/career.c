// Luke Steuber. Promotion boundaries and actual-economy campaign traversal.
#include "game.h"
#include <assert.h>
#include <stdio.h>
#include <string.h>
static int count(int b) { int n=0; while(b) { n+=b&1;b>>=1; } return n; }
static void invest(Game *g) {
  static const int d[] = {1,2,3,4,6,6}, f[] = {0,0,1,2,3,3};
  for (int front=0;front<2;front++) {
    int owned=front?g->fronts:g->territories;
    if (count(owned)>=(front?f[g->rank]:d[g->rank])) continue;
    int best=-1,price=1000000;
    for(int i=0;i<(front?4:6);i++) {
      int cost=front?front_cost[i]:district_cost[i];
      if (!(owned&(1<<i)) && required_rank(front,i)<=g->rank && cost<price) {
        price=cost;best=i;
      }
    }
    if(best>=0 && g->cash>=price+1000) assert(buy(g,front,best));
  }
}
int main(void) {
  Game g;
  for (int target=1;target<6;target++) {
    game_init(&g,1);
    g.rank=target-1;g.earned=100000;g.good_nights=10;g.quiet_nights=1;
    g.territories=63;g.fronts=15;g.heat=20;
    g.over=1;career_update(&g);assert(g.rank==target-1);
    g.over=0;career_update(&g);assert(g.rank==5);
    career_update(&g);assert(g.rank==5); // No repeat rewards or increments.
  }
  game_init(&g,1);
  assert(lane_allowed(&g,0) && !lane_allowed(&g,1));
  g.lane=1;int day=g.day;run_night(&g);assert(g.day==day);
  g.lane=0;g.good_nights=2;g.earned=1500;career_update(&g);assert(g.rank==0);
  g.good_nights=3;g.earned=1499;career_update(&g);assert(g.rank==0);
  g.earned=1500;career_update(&g);assert(g.rank==1 && lane_allowed(&g,1));
  g.earned=5000;career_update(&g);assert(g.rank==1);
  g.cash=10000;assert(buy(&g,false,1));assert(g.rank==2 && lane_allowed(&g,2));
  assert(!buy(&g,true,1)); // Crypto remains locked.
  g.earned=60000;g.good_nights=20;g.quiet_nights=1;g.territories=63;g.fronts=15;
  g.heat=60;career_update(&g);assert(g.rank==4);
  g.heat=59;career_update(&g);assert(g.rank==5);
  int cash=g.cash;career_update(&g);assert(g.cash==cash);
  game_init(&g,4);g.heat=70;g.cash=1000;
  int units=g.units;lay_low(&g);
  assert(g.heat==52 && g.cash==850 && g.day==2 && g.units==units && g.good_nights==0);
  int victories=0,total_nights=0;
  for(unsigned seed=1;seed<=200;seed++) {
    game_init(&g,seed);g.price=60;g.units=15;g.purity=85;
    int previous=0;
    while(!g.over && g.rank<5 && g.day<500) {
      if(g.heat>45) lay_low(&g); else run_night(&g);
      if(!g.over) invest(&g);
      assert(game_valid(&g) && g.rank>=previous);previous=g.rank;
    }
    if(g.rank==5) {
      victories++;total_nights+=g.day-1;
      int day=g.day;
      if(g.heat>45)lay_low(&g);else run_night(&g);
      assert(!g.over && g.day==day+1 && g.rank==5);
    }
  }
  printf("Empire campaigns: %d/200; mean nights: %d\n",victories,victories?total_nights/victories:0);
  assert(victories>=190);
  puts("PASS rank boundaries, locks, quiet nights, failure guards and continued play");
}
