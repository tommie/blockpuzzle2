# Block Puzzle

This is a bug fixed reimplementation of [Block Puzzle](https://www.xpgameplus.com/games/blockpuzzle/index.html)

The original is computing game over wrongly, with more than one bug.
It also has a dead zone for dropping blocks at corners.
Both of those are annoying, so I'm building this.

It was built using [VueJS](https://vuejs.org/), [Bootstrap](https://getbootstrap.com/) and [PIXI.js](https://pixijs.download/).

## Features

- Persistent settings and game state
- Smooth animations
- Animations and sound effects can be disabled
- More standard UI elements
- Automatic optimization for landscape and portrait displays
- Local highscore
- No server dependencies

## Development

```sh
# To install dependencies
yarn

# To run the development server at http://localhost:5173/
yarn dev

# To build into dist/
yarn build

# To run lint checks
yarn lint

# To format the code
yarn format
```

## Sources

- https://pixabay.com/sound-effects/new-notification-07-210334/
- https://pixabay.com/sound-effects/training-program-incorrect1-88736/
- https://pixabay.com/sound-effects/confirm-tap-394001/
- https://pixabay.com/sound-effects/080205-life-lost-game-over-89697/
