# 🪽 Icarus

A mythological retro pixel-art arcade game built with [Phaser 3](https://phaser.io/) and [Vite](https://vitejs.dev/).

Take flight as Icarus with handmade wax-and-feather wings. Flip your wings to climb through the skies, collect radiant feathers, dodge mythical beasts, and survive legendary encounters against the gods and monsters of ancient Greece!

---

## 🎮 How to Play

- **Flap Wings**: Press `SPACE` or **Click / Tap** anywhere on the screen.
- **Goal**: Collect as many feathers as possible and survive bosses.
- **Sun Danger (Upper Zone)**: Flying too high scorches and melts your wings!
- **Sea Danger (Lower Zone)**: Dipping too low drowns your wings in the Aegean Sea!
- **Lives**: You have **5 lives** (hearts shown on the HUD) with temporary invulnerability (i-frames) upon taking a hit.

---

## 🦅 Mythological Creatures

As your score climbs, the skies grow increasingly treacherous:

| Creature | Unlock | Behavior |
|---|---|---|
| **Griffin** | 0 Feathers | Gentle, noble gliding with rhythmic wingbeats |
| **Stymphalian Bird** | 5 Feathers | High-speed, straight-line darting with bronze razor wings |
| **Harpy** | 12 Feathers | Frantic, undulating sine-wave flight pattern |

---

## ⚔️ Boss Encounters

Survive the wrath of mythological bosses to earn bonus feathers:

1. 🐍 **Medusa, the Gorgon**
   - **Stone Gaze**: Sweeping petrification beam that stuns Icarus in mid-air (gravity suspended).
   - **Serpent Volley**: Slithering homing snake projectiles launched directly after the gaze.
2. ⚡ **Zeus, King of Olympus**
   - **Radial Lightning Bolts**: Crackling electric beams radiating in straight lines angled 30° apart from his center.
   - **Thunderstorm Cloud**: Billowing dark storm cloud that drenches wings with rain and strikes lethal lightning inside.
3. 💨 **Aeolus, Keeper of the Winds**
   - **Wind Gust**: Forceful horizontal wind bands that push you toward the danger zones.
   - **Vortex**: Swirling cyclone that pulls Icarus toward its deadly core.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- npm

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/presende/icarus.git
cd icarus

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Visit `http://localhost:3000` to take flight!

---

## 🛠️ Tech Stack

- **Phaser 3**: Canvas rendering, Arcade physics, procedural pixel art generation.
- **Vite**: Ultra-fast frontend bundling and Hot Module Replacement.
- **Google Fonts**: Press Start 2P for authentic arcade typography.
