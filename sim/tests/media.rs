//! T-007: every rendition encodes, in the container and codecs its scenario variant names (ffmpeg and ffprobe needed).

use sim::media::{generate, probe, RENDITIONS};

#[test]
fn every_rendition_has_the_container_and_codecs_the_scenarios_name() {
    let dir = std::env::temp_dir().join(format!("sim-media-test-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    for r in RENDITIONS.iter() {
        generate(&dir, r, 2).unwrap_or_else(|e| panic!("{e}"));
        let folder = dir.join(r.folder);
        if r.hevc {
            let (format, codecs) = probe(&folder.join("init.mp4")).unwrap();
            assert!(format.contains("mp4"), "{}: {format}", r.folder);
            assert_eq!(codecs, vec!["hevc", "aac"], "{}", r.folder);
            assert!(folder.join("seg-000.m4s").exists(), "{}", r.folder);
        } else {
            let (format, codecs) = probe(&folder.join("seg-000.ts")).unwrap();
            assert_eq!(format, "mpegts", "{}", r.folder);
            assert_eq!(codecs, vec!["h264", "aac"], "{}", r.folder);
        }
        assert!(!folder.join("index.m3u8").exists(), "{}: ffmpeg's playlist removed", r.folder);
    }
    // live and ad differ: their first segments are not the same bytes
    let first = |name: &str| std::fs::read(dir.join(name).join("seg-000.ts")).unwrap();
    assert_ne!(first("live-720p"), first("ad-720p"));
    let _ = std::fs::remove_dir_all(&dir);
}
