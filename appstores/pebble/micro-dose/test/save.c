// Luke Steuber. Interrupted campaign writes, migration and promotion persistence.
#include "save.h"
#include <assert.h>
#include <stdio.h>
#include <string.h>
static uint8_t data[20][256], backup[20][256];
static int lengths[20], old_lengths[20], writes, fail=-1;
static int rd(uint32_t key,void *p,size_t n) {
  assert(key<20 && n<=256);
  if(lengths[key]!=(int)n)return -1;
  memcpy(p,data[key],n);return n;
}
static int wr(uint32_t key,const void *p,size_t n) {
  assert(key<20 && n<=256);
  if(writes++==fail) {
    if(key!=12) {memcpy(data[key],p,n/2);lengths[key]=n/2;}
    return -1;
  }
  memcpy(data[key],p,n);lengths[key]=n;return n;
}
static const SaveIO io={rd,wr};
static void snapshot(void) {memcpy(backup,data,sizeof data);memcpy(old_lengths,lengths,sizeof lengths);}
static void reset(void) {memcpy(data,backup,sizeof data);memcpy(lengths,old_lengths,sizeof lengths);writes=0;}
int main(void) {
  Game first,next,loaded;game_init(&first,3);
  assert(!save_load(&io,&loaded));
  assert(save_store(&io,&first));
  next=first;next.cash=12000;next.earned=5000;next.good_nights=3;next.rank=2;
  assert(save_store(&io,&next));
  first=next;
  assert(buy(&next,true,0));
  snapshot();writes=0;assert(save_store(&io,&next));int total=writes;
  for(int fault=0;fault<total;fault++) {
    reset();fail=fault;
    assert(!save_store(&io,&next));
    assert(save_load(&io,&loaded) && !memcmp(&loaded,&first,sizeof first));
    fail=-1;assert(save_store(&io,&next));
    assert(save_load(&io,&loaded) && !memcmp(&loaded,&next,sizeof next));
  }
  int32_t selected;rd(12,&selected,sizeof selected);
  data[10+selected][0]^=1;
  assert(save_load(&io,&loaded) && !memcmp(&loaded,&first,sizeof first));
  snapshot();
  for(int fault=0;fault<total+1;fault++) {
    reset();fail=fault;
    assert(!save_store(&io,&next));
    assert(save_load(&io,&loaded) && !memcmp(&loaded,&first,sizeof first));
  }
  fail=-1;
  // Exact old single-record format: magic, old Game prefix, checksum.
  memset(data,0,sizeof data);memset(lengths,0,sizeof lengths);
  game_init(&first,17);first.cash=14567;first.day=80;first.lane=3;
  first.fronts=1;first.territories=3;
  uint8_t legacy[256]={0};uint32_t magic=0x4d443031;
  size_t prefix=4+offsetof(Game,earned);
  memcpy(legacy,&magic,4);memcpy(legacy+4,&first,offsetof(Game,earned));
  uint32_t hash=2166136261u;
  for(unsigned i=0;i<prefix;i++)hash=(hash^legacy[i])*16777619u;
  memcpy(legacy+prefix,&hash,4);wr(1,legacy,prefix+4);
  assert(save_load(&io,&loaded));
  assert(loaded.cash==14567 && loaded.day==80 && loaded.lane==3 &&
         loaded.fronts==1 && loaded.territories==3 && loaded.legacy_lanes==15 &&
         !loaded.rank && !loaded.earned && !loaded.good_nights);
  assert(save_store(&io,&loaded));
  next=loaded;assert(save_load(&io,&loaded) && !memcmp(&loaded,&next,sizeof next));
  loaded.rank=5;loaded.good_nights=10;loaded.earned=100000;
  assert(save_store(&io,&loaded));
  assert(save_load(&io,&next) && next.rank==5 && next.cash==14567);
  puts("PASS atomic purchases, interrupted saves, corrupt fallback, legacy assets and rank persistence");
}
