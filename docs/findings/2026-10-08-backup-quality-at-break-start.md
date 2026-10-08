# Backup quality at a break's start (T-802, T-803)

Date: 2026-10-08. Data: soaks d, e and f (`~/purple-recordings/2026-10-08-soak-d`, `-soak-e`, `-soak-f`, outside the repo), logged out, extension with `debug`. Probe: [`break_backups_probe.py`](probes/break_backups_probe.py), which lists every change of the backup used (type and quality) in each break, the seconds from the page's navigation start, and how one break's last backup carries into the next on the same load.

## A midroll starting on the 360p picture-by-picture master (T-802)

On 8 pairs of consecutive breaks on one channel load, the next break started on the type the previous one ended on, 8 of 8 (F-10's pinned type). Two breaks ended on `picture-by-picture`, after `site`, `popout` and `frontpage` had announced breaks of their own near the end:

| Break that ended on `picture-by-picture` | Next midroll | Time on the 360p master | Then |
| --- | --- | --- | --- |
| soak d, `/channel-b`, 10:33 to 10:34:04 | 10:49:00 | 24 s | `site` 480p |
| soak e, `/channel-d`, 17:27:48 to 17:28:50 | 17:37:52 | 5 s | `site` 720p60 |

`picture-by-picture` masters have only 360p variants. F-10 now pins neither `autoplay` nor `picture-by-picture`: a clean `picture-by-picture` backup is still played, and the pinned type stays the last other type that gave a clean backup. Test: `worker.int.spec.ts`, "picture-by-picture is never pinned".

## A first backup at 160p (T-803)

Two midrolls started on a 160p backup:

| Break | Seconds after the page opened | Backups |
| --- | --- | --- |
| soak e, `/channel-a`, 15:15:45 | 12 | `site` 160p30 at 15:15:48.6, `popout` 160p30, then `popout` 720p60 at 15:15:54.7 |
| soak f, `/channel-k`, 18:30:38 | 5 | `site` 160p at 18:30:41.7, `popout` 160p, then `frontpage` 720p60 at 18:30:48.7 |

T-407 picks the backup variant that matches the variant of the media playlist the player polls. 5 to 12 s after the page opened, the player was still polling its 160p variant; 6 to 7 s later it polled 720p60 and the backups followed. Two other breaks in the first seconds of a load started on 720p (soak e 15:15:58, 5 s after the page opened, and soak f 17:47:52, 6 s), so the player's first variant varies between loads. Purple's choice follows the player, and nothing changes.

Both midrolls had no picture-by-picture request before them: they came 5 and 12 s after the page opened (B-044).
