## Setup:
1: Install nix using the following command
`bash <(curl https://holochain.github.io/holochain/setup.sh)`

2: Run `nix develop` from this directory

3: Run `pnpm i` (assuming `pnpm` is installed globally)

4: Rename `example.env` to `.env` (changing the port numbers are required)

5: `pnpm run dev`

6: Wait for a browser to open at http://localhost:8888/


For graphql intellisense based on the schema:

1: Install 'Graphql for VSCode' extension

2: Install Watchman. https://facebook.github.io/watchman/docs/install

If you get errors, check the output tab of your console under 'GraphQL - monorepo'

## Tests:

In a nix shell, run `pnpm test` from the workspace root.

## Production:

1. Open nix shell: `nix develop`
2. Build: `pnpm run build:frontend`
3. Run: `pnpm start`