{
  description = "Template for Holochain app development";

  inputs = {
    p2p-shipyard.url = "github:darksoil-studio/p2p-shipyard";
    versions.url  = "github:holochain/holochain?dir=versions/0_3";

    holochain-flake.url = "github:holochain/holochain";
    holochain-flake.inputs.versions.follows = "versions";

    nixpkgs.follows = "holochain-flake/nixpkgs";
    flake-parts.follows = "holochain-flake/flake-parts";
    
  };

  outputs = inputs:
    inputs.flake-parts.lib.mkFlake
      {
        inherit inputs;
      }
      {
        systems = builtins.attrNames inputs.holochain-flake.devShells;
        perSystem =
          { inputs'
          , config
          , pkgs
          , system
          , ...
          }: {
            devShells.default = pkgs.mkShell {
              inputsFrom = [
              inputs'.p2p-shipyard.devShells.holochainTauriDev inputs'.holochain-flake.devShells.holonix ];
              packages = [
                pkgs.nodejs_20
                pkgs.corepack_20
                pkgs.bun
                
              ];
            };
            devShells.androidDev = pkgs.mkShell {
              inputsFrom = [
              inputs'.p2p-shipyard.devShells.holochainTauriAndroidDev inputs'.holochain-flake.devShells.holonix ];
              packages = [
                pkgs.nodejs_20
                pkgs.corepack_20
                pkgs.bun
                
              ];
            };
          };
      };
}