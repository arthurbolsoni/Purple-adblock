//! `cargo run --release -- [--port N] [--scenario NAME] [--purple FILE]`: serves Twitch's simulated hosts, the isolated page and the
//! control API on 127.0.0.1 (docs/tests.md, "Level 2").

use sim::scenario::Scenario;
use sim::server::{system_clock, App, Dirs};
use std::path::PathBuf;

#[tokio::main]
async fn main() {
    let args: Vec<String> = std::env::args().collect();
    let value = |flag: &str| args.iter().position(|a| a == flag).and_then(|i| args.get(i + 1)).cloned();
    let port: u16 = value("--port").and_then(|p| p.parse().ok()).unwrap_or(8787);
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let purple = value("--purple").map(PathBuf::from).unwrap_or_else(|| root.join("..").join("serviceWorker").join("dist").join("bundle.js"));
    let dirs = Dirs { scenarios: root.join("scenarios"), media: root.join("media"), page: root.join("page"), purple };
    let app = App::new(dirs.clone(), system_clock());
    if let Some(name) = value("--scenario") {
        let text = std::fs::read_to_string(dirs.scenarios.join(format!("{name}.json"))).expect("scenario file");
        app.load(Scenario::from_json(&text).expect("scenario"));
    }
    let listener = tokio::net::TcpListener::bind(("127.0.0.1", port)).await.expect("bind");
    println!("sim listening on http://127.0.0.1:{port}");
    axum::serve(listener, app.router()).await.expect("serve");
}
