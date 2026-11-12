// The MCP server reports the app's version (package.json), so agents can tell an exe that does not match the app.
fn main() {
    let path = concat!(env!("CARGO_MANIFEST_DIR"), "/../../package.json");
    println!("cargo:rerun-if-changed={path}");
    let text = std::fs::read_to_string(path).expect("package.json next to the workspace");
    let after = &text[text.find("\"version\"").expect("version in package.json") + 9..];
    let version = after.split('"').nth(1).expect("quoted version");
    println!("cargo:rustc-env=EL_APP_VERSION={version}");
}
