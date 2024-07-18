import { generateM3u8, mergeM3u8Contents } from "./m3u8";

const sampleM3U8_withDates_1 = `#EXTM3U
#EXT-X-TARGETDURATION:10
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:00.000Z
#EXTINF:10,
segment1.ts
#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:10.000Z
#EXTINF:10,
segment2.ts
#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:20.000Z
#EXTINF:10,stitched
segment-stitched.ts
#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:30.000Z
#EXTINF:10,
segment3.ts`;

const sampleM3U8_withDates_2 = `#EXTM3U
#EXT-X-TARGETDURATION:10
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10,
#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:00.000Z
segmentA.ts
#EXTINF:10,
#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:10.000Z
segmentB.ts
#EXTINF:10,
#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:20.000Z
segmentC.ts`;

describe('m3u8-utils', () => {
  test('generateM3u8 function should generate correct m3u8 content', () => {
    const manifest = {
      targetDuration: 10,
      mediaSequence: 0,
      segments: [
        { uri: "segment1.ts", duration: 10, title: "", dateTimeString: "" },
        { uri: "segment2.ts", duration: 10, title: "", dateTimeString: "" },
      ],
    };
    const expectedM3U8 = `#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA-SEQUENCE:0\n#EXTINF:10\nsegment1.ts\n#EXTINF:10\nsegment2.ts\n`;
    expect(generateM3u8(manifest)).toBe(expectedM3U8);
  });

  test('generateM3u8 should handle empty segments array', () => {
    const manifest = {
      targetDuration: 10,
      mediaSequence: 0,
      segments: [],
    };
    const expectedM3U8 = `#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA-SEQUENCE:0\n`;
    expect(generateM3u8(manifest)).toBe(expectedM3U8);
  });

  test('generateM3u8 should handle missing targetDuration and mediaSequence', () => {
    const manifest = {
      segments: [
        { uri: "segment1.ts", duration: 10, title: "", dateTimeString: "" },
        { uri: "segment2.ts", duration: 10, title: "", dateTimeString: "" },
      ],
    };
    const expectedM3U8 = `#EXTM3U\n#EXT-X-TARGETDURATION:0\n#EXT-X-MEDIA-SEQUENCE:0\n#EXTINF:10\nsegment1.ts\n#EXTINF:10\nsegment2.ts\n`;
    expect(generateM3u8(manifest)).toBe(expectedM3U8);
  });

  test('mergeM3u8Contents function should merge m3u8 contents correctly', () => {
    const mergedM3U8 = mergeM3u8Contents([sampleM3U8_withDates_1, sampleM3U8_withDates_2]);

    const expectedMergedM3U8 = `#EXTM3U
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10
segment1.ts
#EXTINF:10
segment2.ts
#EXTINF:10
segmentC.ts
#EXTINF:10
segment3.ts
`;

    expect(mergedM3U8).toBe(expectedMergedM3U8);
  });

  test('mergeM3u8Contents should handle empty m3u8 input', () => {
    const mergedM3U8 = mergeM3u8Contents([]);
    expect(mergedM3U8).toBe('');
  });

  test('mergeM3u8Contents should not remove the stitched segment if it does not have a corresponding segment in the other m3u8', () => {
    const mergedM3U8 = mergeM3u8Contents([sampleM3U8_withDates_1]);

    const expectedM3U8 = `#EXTM3U
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10
segment1.ts
#EXTINF:10
segment2.ts
#EXTINF:10
segment-stitched.ts
#EXTINF:10
segment3.ts
`;

    expect(mergedM3U8).toBe(expectedM3U8);
  });
});