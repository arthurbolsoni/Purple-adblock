//! `cargo run --bin media`: generates sim/media/ (gitignored) with ffmpeg (T-007).

use sim::media::{generate, RENDITIONS};
use std::path::PathBuf;

fn main() {
    let dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("media");
    for r in RENDITIONS.iter() {
        let _ = std::fs::remove_dir_all(dir.join(r.folder));
        print!("{} ({} s) ... ", r.folder, r.seconds);
        match generate(&dir, r, r.seconds) {
            Ok(()) => println!("ok"),
            Err(e) => {
                println!("{e}");
                std::process::exit(1);
            }
        }
    }
}
