//! Image dimensions from file headers, as the app sees them after decoding: the browser's
//! naturalWidth/naturalHeight (JPEG EXIF orientation applied) and tiff.js for TIFF (first directory,
//! orientation ignored). Returns None whenever that answer is not certain from the header (unknown or
//! damaged files, GIF, PNG with an eXIf chunk), so the caller decodes the image the old way instead.

use std::io::{Read, Seek, SeekFrom};

fn read_exact<R: Read>(reader: &mut R, length: usize) -> Option<Vec<u8>> {
    let mut buffer = vec![0; length];
    reader.read_exact(&mut buffer).ok()?;
    Some(buffer)
}

fn u16_at(bytes: &[u8], at: usize, little: bool) -> Option<u16> {
    let pair: [u8; 2] = bytes.get(at..at + 2)?.try_into().ok()?;
    Some(if little { u16::from_le_bytes(pair) } else { u16::from_be_bytes(pair) })
}

fn u32_at(bytes: &[u8], at: usize, little: bool) -> Option<u32> {
    let quad: [u8; 4] = bytes.get(at..at + 4)?.try_into().ok()?;
    Some(if little { u32::from_le_bytes(quad) } else { u32::from_be_bytes(quad) })
}

/// Width, height and orientation (tag 0x0112) of a TIFF structure's first directory, `start` being
/// where the "II"/"MM" header begins in `reader`.
fn tiff_ifd0<R: Read + Seek>(reader: &mut R, start: u64) -> Option<(Option<u32>, Option<u32>, Option<u16>)> {
    reader.seek(SeekFrom::Start(start)).ok()?;
    let header = read_exact(reader, 8)?;
    let little = match &header[..4] {
        b"II*\0" => true,
        b"MM\0*" => false,
        _ => return None,
    };
    reader.seek(SeekFrom::Start(start + u64::from(u32_at(&header, 4, little)?))).ok()?;
    let count = u16_at(&read_exact(reader, 2)?, 0, little)? as usize;
    let entries = read_exact(reader, count * 12)?;
    let (mut width, mut height, mut orientation) = (None, None, None);
    for entry in entries.as_chunks::<12>().0.iter().map(|entry| entry.as_slice()) {
        let value = match u16_at(entry, 2, little)? {
            3 => u32::from(u16_at(entry, 8, little)?),
            4 => u32_at(entry, 8, little)?,
            _ => continue,
        };
        match u16_at(entry, 0, little)? {
            256 => width = Some(value),
            257 => height = Some(value),
            0x0112 => orientation = u16::try_from(value).ok(),
            _ => {}
        }
    }
    Some((width, height, orientation))
}

fn png<R: Read + Seek>(reader: &mut R) -> Option<(u32, u32)> {
    reader.seek(SeekFrom::Start(8)).ok()?;
    let mut size = None;
    // Walk the chunks up to the image data: an eXIf chunk could rotate the image in the browser.
    loop {
        let head = read_exact(reader, 8)?;
        let length = u32_at(&head, 0, false)?;
        match &head[4..8] {
            b"IHDR" => {
                let body = read_exact(reader, 8)?;
                size = Some((u32_at(&body, 0, false)?, u32_at(&body, 4, false)?));
                reader.seek(SeekFrom::Current(i64::from(length) - 8 + 4)).ok()?;
            }
            b"eXIf" => return None,
            b"IDAT" | b"IEND" => return size,
            _ => {
                reader.seek(SeekFrom::Current(i64::from(length) + 4)).ok()?;
            }
        }
    }
}

fn jpeg<R: Read + Seek>(reader: &mut R) -> Option<(u32, u32)> {
    reader.seek(SeekFrom::Start(2)).ok()?;
    let mut orientation = 1;
    loop {
        let mut marker = read_exact(reader, 2)?;
        while marker[0] == 0xFF && marker[1] == 0xFF {
            marker = vec![0xFF, read_exact(reader, 1)?[0]]; // fill bytes
        }
        if marker[0] != 0xFF {
            return None;
        }
        let kind = marker[1];
        if kind == 0xD8 || (0xD0..=0xD7).contains(&kind) || kind == 0x01 {
            continue; // markers without a length
        }
        let length = u16_at(&read_exact(reader, 2)?, 0, false)? as i64;
        if length < 2 {
            return None;
        }
        let body_start = reader.stream_position().ok()?;
        match kind {
            // SOF0..SOF15 except DHT (C4), JPG (C8) and DAC (CC).
            0xC0..=0xCF if !matches!(kind, 0xC4 | 0xC8 | 0xCC) => {
                let body = read_exact(reader, 5)?;
                let (height, width) = (u32::from(u16_at(&body, 1, false)?), u32::from(u16_at(&body, 3, false)?));
                // Orientations 5-8 turn the image by 90 degrees (the browser applies them).
                return Some(if (5..=8).contains(&orientation) { (height, width) } else { (width, height) });
            }
            0xE1 if orientation == 1 => {
                if read_exact(reader, 6).as_deref() == Some(b"Exif\0\0") {
                    if let Some((_, _, Some(value))) = tiff_ifd0(reader, body_start + 6) {
                        orientation = value;
                    }
                }
            }
            0xDA | 0xD9 => return None, // image data before any frame header
            _ => {}
        }
        reader.seek(SeekFrom::Start(body_start + length as u64 - 2)).ok()?;
    }
}

/// Dimensions the app would see after decoding, or None when only a full decode can tell.
pub fn dimensions<R: Read + Seek>(reader: &mut R) -> Option<(u32, u32)> {
    reader.seek(SeekFrom::Start(0)).ok()?;
    let magic = read_exact(reader, 8)?;
    let size = if magic == [0x89, b'P', b'N', b'G', 0x0D, 0x0A, 0x1A, 0x0A] {
        png(reader)
    } else if magic[..3] == [0xFF, 0xD8, 0xFF] {
        jpeg(reader)
    } else if &magic[..4] == b"II*\0" || &magic[..4] == b"MM\0*" {
        match tiff_ifd0(reader, 0)? {
            (Some(width), Some(height), _) => Some((width, height)),
            _ => None,
        }
    } else {
        None
    }?;
    // A zero side never decodes; leave it to the decoder's error.
    (size.0 > 0 && size.1 > 0).then_some(size)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Cursor;

    fn png_bytes(width: u32, height: u32, exif: bool) -> Vec<u8> {
        let mut bytes = vec![0x89, b'P', b'N', b'G', 0x0D, 0x0A, 0x1A, 0x0A];
        let mut chunk = |kind: &[u8], body: &[u8]| {
            bytes.extend((body.len() as u32).to_be_bytes());
            bytes.extend(kind);
            bytes.extend(body);
            bytes.extend([0; 4]); // CRC is not checked
        };
        let mut ihdr = width.to_be_bytes().to_vec();
        ihdr.extend(height.to_be_bytes());
        ihdr.extend([8, 0, 0, 0, 0]);
        chunk(b"IHDR", &ihdr);
        if exif {
            chunk(b"eXIf", b"MM\0*");
        }
        chunk(b"IDAT", &[0; 3]);
        bytes
    }

    fn tiff_bytes(little: bool, width: u32, height: u32, orientation: Option<u16>, ifd_at_end: bool) -> Vec<u8> {
        let mut entries: Vec<(u16, u16, u32)> = vec![(256, 4, width), (257, 3, height)];
        entries.extend(orientation.map(|o| (0x0112, 3, u32::from(o))));
        let u16b = |v: u16| if little { v.to_le_bytes() } else { v.to_be_bytes() };
        let u32b = |v: u32| if little { v.to_le_bytes() } else { v.to_be_bytes() };
        let padding = if ifd_at_end { 100 } else { 0 };
        let mut bytes: Vec<u8> = if little { b"II*\0".to_vec() } else { b"MM\0*".to_vec() };
        bytes.extend(u32b(8 + padding));
        bytes.extend(vec![0xAB; padding as usize]);
        bytes.extend(u16b(entries.len() as u16));
        for (tag, kind, value) in entries {
            bytes.extend(u16b(tag));
            bytes.extend(u16b(kind));
            bytes.extend(u32b(1));
            if kind == 3 {
                bytes.extend(u16b(value as u16));
                bytes.extend([0, 0]);
            } else {
                bytes.extend(u32b(value));
            }
        }
        bytes.extend([0; 4]);
        bytes
    }

    fn jpeg_bytes(width: u16, height: u16, orientation: Option<u16>) -> Vec<u8> {
        let mut bytes = vec![0xFF, 0xD8];
        if let Some(orientation) = orientation {
            let mut exif = b"Exif\0\0".to_vec();
            exif.extend(tiff_bytes(false, 1, 1, Some(orientation), false));
            bytes.extend([0xFF, 0xE1]);
            bytes.extend(((exif.len() + 2) as u16).to_be_bytes());
            bytes.extend(exif);
        }
        bytes.extend([0xFF, 0xDB, 0, 4, 0, 0]); // a table segment before the frame
        bytes.extend([0xFF, 0xFF, 0xC0, 0, 11, 8]); // fill byte, SOF0
        bytes.extend(height.to_be_bytes());
        bytes.extend(width.to_be_bytes());
        bytes.extend([1, 1, 0x11, 0]);
        bytes.extend([0xFF, 0xDA, 0, 2]);
        bytes
    }

    fn size(bytes: Vec<u8>) -> Option<(u32, u32)> {
        dimensions(&mut Cursor::new(bytes))
    }

    #[test]
    fn reads_png_jpeg_and_tiff_headers() {
        assert_eq!(size(png_bytes(2048, 1536, false)), Some((2048, 1536)));
        assert_eq!(size(png_bytes(2048, 1536, true)), None);
        assert_eq!(size(jpeg_bytes(1157, 650, None)), Some((1157, 650)));
        assert_eq!(size(jpeg_bytes(1157, 650, Some(1))), Some((1157, 650)));
        assert_eq!(size(jpeg_bytes(1157, 650, Some(3))), Some((1157, 650)));
        assert_eq!(size(jpeg_bytes(1157, 650, Some(6))), Some((650, 1157)));
        assert_eq!(size(jpeg_bytes(1157, 650, Some(8))), Some((650, 1157)));
        for little in [true, false] {
            assert_eq!(size(tiff_bytes(little, 4096, 3072, None, false)), Some((4096, 3072)));
            // tiff.js ignores the orientation tag.
            assert_eq!(size(tiff_bytes(little, 4096, 3072, Some(6), true)), Some((4096, 3072)));
        }
    }

    #[test]
    fn leaves_unknown_and_damaged_files_to_the_decoder() {
        assert_eq!(size(b"GIF89a\x10\x00\x10\x00".to_vec()), None);
        assert_eq!(size(b"not an image".to_vec()), None);
        assert_eq!(size(vec![]), None);
        let mut truncated = png_bytes(10, 10, false);
        truncated.truncate(20);
        assert_eq!(size(truncated), None);
        let mut cut_jpeg = jpeg_bytes(10, 10, Some(6));
        cut_jpeg.truncate(30);
        assert_eq!(size(cut_jpeg), None);
        assert_eq!(size(png_bytes(0, 10, false)), None);
    }
}
