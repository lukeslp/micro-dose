# Street Stand Simulator

A micro-tycoon game where you run a scrappy city stand, set prices, manage inventory, and navigate daily challenges.

## About

You've inherited a tiny permit and a folding table. Each day brings new weather, foot traffic, and events. Price your goods wisely, prep enough stock, and maintain your reputation to survive in the competitive street economy.

## Features

- Day-by-day business simulation
- Dynamic pricing system
- Weather and event impacts
- Reputation tracking
- Marketing boost options
- Cash flow trend charting
- Historical performance tracking
- Random events (inspectors, festivals, competitors)

## How to Play

1. Open `index.html` in a browser
2. Each day:
   - Review weather forecast and expected foot traffic
   - Set your price per drink/item
   - Choose how many units to prepare (costs ingredients upfront)
   - Optionally purchase marketing boosts
   - Click "Run Day" to see results
3. Track your cash, reputation, and profit trends
4. Survive as long as possible or reach a cash goal

## Game Mechanics

### Pricing Strategy

- Higher prices = more profit per sale, but fewer customers
- Lower prices = more volume, but thinner margins
- Optimal price varies by weather, traffic, and reputation

### Inventory Management

- Prepare units before each day
- Unsold units may spoil (depending on game mode)
- Running out of stock means lost sales
- Overproducing wastes money

### Reputation System

- Starts at 50 (Local Newcomer)
- Increases with fair prices and good service
- Decreases with price gouging or poor quality
- Higher reputation attracts more customers

### Weather Effects

- **Sunny**: Normal demand, stable traffic
- **Hot**: Increased demand for cold drinks
- **Rain**: Reduced foot traffic
- **Cold**: Lower demand, fewer browsers

### Random Events

- City inspector visits (may fine you or approve your operation)
- Local festivals (boost traffic)
- Competitor opens nearby (splits customers)
- Supply shortages (increase ingredient costs)

## Controls

- **Price Input**: Set your selling price
- **Units Input**: Choose production quantity
- **Marketing Options**: Purchase advertising boosts
- **Run Day Button**: Execute the day's operations
- **Restart Button**: Start a new game (after game over)

## Victory/Loss

- **Success**: Build up significant cash reserves and reputation
- **Failure**: Run out of money or lose all reputation

## Technical Details

- Vanilla JavaScript (no dependencies)
- HTML5 Canvas for profit trend chart
- CSS Grid layout
- Responsive design
- Works offline after initial load

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## File Structure

```
micro-dose/
├── index.html    # Main game page
├── game.js       # Game logic and simulation
├── styles.css    # Styling
└── README.md     # This file
```

## Tips

- Study the weather forecast and adjust pricing
- Don't overproduce on slow traffic days
- Invest in marketing during festivals
- Keep prices fair to build reputation
- Watch your cash flow chart for trends

## Credits

Created by Luke Steuber
