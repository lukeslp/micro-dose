"""Stage a native testing package after matching emulator verification. Luke Steuber."""
import hashlib
import json
from pathlib import Path
import shutil
import zipfile

root = Path(__file__).resolve().parents[1]
meta = json.loads((root / "package.json").read_text())
name, version = meta["name"], meta["version"]
pbw = root / "build" / (name + ".pbw")
digest = hashlib.sha256(pbw.read_bytes()).hexdigest()
reports = []
for platform in meta["pebble"]["targetPlatforms"]:
    report = json.loads((root / "build/evidence" / (platform + "-report.json")).read_text())
    if not report.get("passed") or report["pbwSHA256"] != digest:
        raise SystemExit("Missing passing evidence for exact PBW: " + platform)
    reports.append(report)
out = root / "release" / version
if out.exists():
    raise SystemExit("Release already exists; use a new version")
out.mkdir(parents=True)
shutil.copy2(pbw, out / (name + "-" + version + ".pbw"))
shutil.copy2(root / "README.md", out / "README.md")
with zipfile.ZipFile(out / (name + "-" + version + "-source.zip"), "w", zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(root.rglob("*")):
        rel = path.relative_to(root)
        if path.is_file() and (rel.parts[0] in ("src", "test", "tools") or str(rel) in ("package.json", "wscript", "README.md", ".gitignore")) and "__pycache__" not in rel.parts:
            archive.write(path, name + "/" + str(rel))
for report in reports:
    platform = report["platform"]
    shutil.copy2(root / "build/evidence" / (platform + "-report.json"), out / (platform + "-report.json"))
    for frame in report["frames"]:
        shutil.copy2(root / frame, out / Path(frame).name)
(out / "manifest.json").write_text(json.dumps({"name":name,"version":version,"uuid":meta["pebble"]["uuid"],"pbwSHA256":digest,"validation":"Native emulators on firmware 4.33.2 only; physical watches unverified.","targets":meta["pebble"]["targetPlatforms"]},indent=2)+"\n")
(out / "SHA256SUMS.txt").write_text("".join(hashlib.sha256(p.read_bytes()).hexdigest()+"  "+p.name+"\n" for p in sorted(out.iterdir()) if p.is_file()))
print(out)
