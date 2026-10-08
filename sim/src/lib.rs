//! `sim/`: the level 2 server that reproduces Twitch's server behavior (docs/server/) for Purple's tests.
//! Scenarios in `sim/scenarios/*.json`; media generated into `sim/media/` (T-007); the isolated player page in
//! `sim/page/` (T-008). See docs/tests.md, "Level 2".

pub mod gql;
pub mod media;
pub mod playlist;
pub mod scenario;
pub mod server;
