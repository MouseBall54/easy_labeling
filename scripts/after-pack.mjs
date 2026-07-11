import path from "node:path";
import { rcedit } from "rcedit";

export default async function afterPack(context) {
  if (context.electronPlatformName !== "win32") {
    return;
  }

  const productName = context.packager.appInfo.productName;
  const productFilename = context.packager.appInfo.productFilename;
  const version = context.packager.appInfo.version;
  const executablePath = path.join(context.appOutDir, `${productFilename}.exe`);
  const iconPath = path.join(context.packager.projectDir, "assets", "icons", "easy-labeling.ico");

  await rcedit(executablePath, {
    icon: iconPath,
    "file-version": version,
    "product-version": version,
    "version-string": {
      CompanyName: "박영문",
      FileDescription: productName,
      InternalName: productFilename,
      LegalCopyright: "Copyright (c) 2026 박영문",
      OriginalFilename: `${productFilename}.exe`,
      ProductName: productName
    }
  });
}
