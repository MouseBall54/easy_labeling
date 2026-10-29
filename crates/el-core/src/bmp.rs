//! Uncompressed 8-bit BMP with a gray palette: the cheapest format a browser `<img>` decodes losslessly,
//! used to hand natively decoded gray images to the page (one byte per pixel, no colour management:
//! BITMAPINFOHEADER carries no colour space, so pixels show as stored).

/// A top-down (negative height) 8-bit BMP of `pixels` (row-major gray, `width` x `height`).
pub fn gray8_bmp(width: u32, height: u32, pixels: &[u8]) -> Vec<u8> {
    const HEADERS: usize = 14 + 40 + 256 * 4;
    let width_px = width as usize;
    let stride = (width_px + 3) & !3;
    let image_size = stride * height as usize;
    let mut bmp = Vec::with_capacity(HEADERS + image_size);
    bmp.extend_from_slice(b"BM");
    bmp.extend(((HEADERS + image_size) as u32).to_le_bytes());
    bmp.extend([0; 4]);
    bmp.extend((HEADERS as u32).to_le_bytes());
    bmp.extend(40u32.to_le_bytes());
    bmp.extend((width as i32).to_le_bytes());
    bmp.extend((-(height as i32)).to_le_bytes()); // top-down rows
    bmp.extend(1u16.to_le_bytes()); // planes
    bmp.extend(8u16.to_le_bytes()); // bits per pixel
    bmp.extend(0u32.to_le_bytes()); // BI_RGB
    bmp.extend((image_size as u32).to_le_bytes());
    bmp.extend(2835u32.to_le_bytes()); // 72 dpi
    bmp.extend(2835u32.to_le_bytes());
    bmp.extend(256u32.to_le_bytes()); // palette entries
    bmp.extend(256u32.to_le_bytes());
    for level in 0..=255u8 {
        bmp.extend([level, level, level, 0]);
    }
    let padding = [0u8; 3];
    for row in pixels.chunks(width_px.max(1)).take(height as usize) {
        bmp.extend_from_slice(row);
        bmp.extend_from_slice(&padding[..stride - width_px]);
    }
    bmp
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn writes_padded_top_down_rows_after_a_gray_palette() {
        let bmp = gray8_bmp(3, 2, &[1, 2, 3, 4, 5, 6]);
        assert_eq!(&bmp[..2], b"BM");
        assert_eq!(u32::from_le_bytes(bmp[2..6].try_into().unwrap()) as usize, bmp.len());
        assert_eq!(i32::from_le_bytes(bmp[22..26].try_into().unwrap()), -2);
        assert_eq!(&bmp[54 + 4 * 200..54 + 4 * 201], &[200, 200, 200, 0]);
        assert_eq!(&bmp[1078..], &[1, 2, 3, 0, 4, 5, 6, 0]);
    }
}
