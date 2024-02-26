{ pkgs, legacyPolygott }: {
	deps = [
		pkgs.bashInteractive
    pkgs.nodejs_20

    pkgs.nodePackages.pm2
    pkgs.nodePackages.ts-node
    
    pkgs.nodePackages.typescript
    pkgs.nodePackages.typescript-language-server
	] ++ legacyPolygott;
}
