Innovative habit tracking application that helps you drill down or build up from any scale. Built on Holochain for complete control over privacy and data sovereignty.

With the release of HabitFract 1.x, you will be able to:

    Create a never-ending fractal structure of goals and habits.
    Visualize your progress with intuitive, dynamic data visualisations.
    Maintain full control over your data with Holochain's encryption and data sovereignty features.
    Share and trade visualisations within a peer-to-peer network.
    Create private channels with other agents to share progress with, remain accountable to, or help mentor others.

Dive into the world of fractal habit tracking and join us on a quest to make consistent progress towards our goals. Whether you're a visionary thinker or a meticulous planner, Habit/Fract is your companion in the journey of self-improvement and achievement.

## Dev Environment Setup:
1: Install nix using the following command
`bash <(curl https://holochain.github.io/holochain/setup.sh)`

2: Run `nix develop` from this directory

3: Run `pnpm i` (assuming `pnpm` is installed globally)

4: Run `pnpm run --dir design-system build`

5: Rename `example.env` to `.env` (changing the port numbers as required)

6: `pnpm run dev`

7: Wait for a browser to open at http://localhost:8888/  (you may also need to refresh after a few moments)


For graphql intellisense based on the schema:

1: Install 'Graphql for VSCode' extension

2: Install Watchman. https://facebook.github.io/watchman/docs/install

If you get errors, check the output tab of your console under 'GraphQL - monorepo'

## Tests:

In a nix shell, run `pnpm test` from the workspace root.

## Production (after dev installation steps):

1. Open nix shell: `nix develop`
2. Build: `pnpm run build:frontend`
3. Run: `pnpm start`
