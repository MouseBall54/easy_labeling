//! 8-bit gray TIFF decoding for the image viewer, matching tiff.js (libtiff's
//! TIFFReadRGBAImageOriented, which the app draws through `toCanvas`): first page, top-left origin,
//! WhiteIsZero shown inverted. Anything else returns None and stays with tiff.js: other bit depths,
//! colour or palette images, extra samples, float samples, an Orientation other than top-left,
//! unsupported compressions (JPEG, fax) and damaged files.

use std::io::{Read, Seek};
use tiff::decoder::{Decoder, DecodingResult};
use tiff::tags::Tag;
use tiff::ColorType;

pub struct Gray8 {
    pub width: u32,
    pub height: u32,
    /// Row-major, one byte per pixel, as displayed (0 = black).
    pub pixels: Vec<u8>,
}

/// The first page as displayed, or None when tiff.js should decode the file.
pub fn decode_gray8<R: Read + Seek>(reader: R) -> Option<Gray8> {
    let mut decoder = Decoder::new(reader).ok()?;
    if decoder.colortype().ok()? != ColorType::Gray(8) {
        return None;
    }
    let tag = |decoder: &mut Decoder<R>, tag: Tag| decoder.find_tag_unsigned::<u32>(tag).ok();
    // BlackIsZero (1) or WhiteIsZero (0); the crate inverts WhiteIsZero like libtiff does.
    if !matches!(tag(&mut decoder, Tag::PhotometricInterpretation)?, Some(0 | 1)) {
        return None;
    }
    // libtiff flips rotated images into top-left order; leave those to it.
    if !matches!(tag(&mut decoder, Tag::Orientation)?, None | Some(1)) {
        return None;
    }
    if !matches!(tag(&mut decoder, Tag::SampleFormat)?, None | Some(1)) {
        return None;
    }
    let (width, height) = decoder.dimensions().ok()?;
    match decoder.read_image().ok()? {
        DecodingResult::U8(pixels) if pixels.len() == width as usize * height as usize => Some(Gray8 { width, height, pixels }),
        _ => None,
    }
}
