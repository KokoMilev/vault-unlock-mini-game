# Vault Game

A simple interactive vault-opening game built with Pixi.js and GSAP.

## Features

* Randomly generated combination lock
* Interactive handle you click to enter the combination
* Animated door opening with shadow
* Treasure blink effect when vault opens
* Responsive, crop-fill background scaling

## Prerequisites

* Node.js v14+ and npm

## Installation

```bash
# Clone the repo
git clone <https://github.com/KokoMilev/vault-unlock-mini-game.git>
cd pixi-project

# Install dependencies
npm install
```

## Development

```bash
# Start dev server with live reload
npm run dev
```

Then open [http://localhost:####](http://localhost:####) in your browser.

## Build

```bash
# Produce a production build
npm run build
```

## Usage

* Click the vault handle on the right half for clockwise steps, left for counter-clockwise.
* Enter the correct 3-part combination to open the vault.
* Watch the door animate open and see the treasure blink effect.

## Configuration

* Modify `src/main.ts` to adjust combination length, animation timings, or asset paths.
* Background scaling and sprite offsets are defined in `OFFSET` constants.

## Assets

* Place your images in `public/assets/`: `bg.png`, `door.png`, `doorOpen.png`, `doorOpenShadow.png`, `handle.png`, `handleShadow.png`, `blink.png`.
