// bun-patch.js — temporary Bun compatibility shim.
//
// WHY THIS EXISTS:
// The database library `bson` calls `v8.startupSnapshot.isBuildingSnapshot()`
// on startup. Node.js has that function; our Bun build doesn't yet, so it
// throws and crashes the server before it can run.
//
// This patch defines that function as a harmless "return false" so the
// library loads. It runs BEFORE our app (wired up in bunfig.toml → preload).
//
// SAFE TO DELETE once Bun implements isBuildingSnapshot (then the real one is used).

const v8 = process.getBuiltinModule?.("v8");
if (v8?.startupSnapshot) {
  v8.startupSnapshot.isBuildingSnapshot = () => false;
}
