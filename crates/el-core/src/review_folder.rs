//! Folder-wide label review: reads each image's YOLO file, takes the image size from its header and
//! runs the checks, images in parallel. Mirrors refreshReviewFindings in
//! src/bootstrap/file-system-adapter.ts; an image whose size needs a full decode comes back as None
//! so the caller decodes it the TS way.

use crate::review::{inspect_detection_labels, ReviewFinding, ReviewSettings};
use crate::{image_info, js};
use rayon::prelude::*;
use std::fmt;
use std::io::{BufReader, ErrorKind};
use std::path::{Path, PathBuf};

pub struct FolderImage {
    /// File name, which names the label file (`imageFileNameToBaseName` + ".txt").
    pub name: String,
    pub path: PathBuf,
    /// Unsaved label text of the open image, used instead of its file.
    pub edited_text: Option<String>,
}

#[derive(Debug, PartialEq)]
pub enum ReviewError {
    Cancelled,
    /// A read failed for another reason than a missing label file (the TS review fails too).
    Io(String),
}

impl fmt::Display for ReviewError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ReviewError::Cancelled => formatter.write_str("cancelled"),
            ReviewError::Io(message) => formatter.write_str(message),
        }
    }
}

/// `imageFileNameToBaseName`: drops the last extension (`/\.[^/.]+$/`).
pub fn image_base_name(name: &str) -> &str {
    match name.rfind('.') {
        Some(dot) if dot + 1 < name.len() && !name[dot + 1..].contains('/') => &name[..dot],
        _ => name,
    }
}

/// `File.text()`: UTF-8 with invalid bytes replaced and one leading BOM dropped.
fn read_text(path: &Path) -> Result<Option<String>, ReviewError> {
    match std::fs::read(path) {
        Ok(bytes) => {
            let text = String::from_utf8_lossy(&bytes);
            Ok(Some(text.strip_prefix('\u{FEFF}').unwrap_or(&text).to_string()))
        }
        Err(error) if error.kind() == ErrorKind::NotFound => Ok(None),
        Err(error) => Err(ReviewError::Io(format!("{}: {error}", path.display()))),
    }
}

fn review_image(label_folder: Option<&Path>, image: &FolderImage, settings: &ReviewSettings) -> Result<Option<ReviewFinding>, ReviewError> {
    let text = match (&image.edited_text, label_folder) {
        (Some(text), _) => text.clone(),
        (None, Some(folder)) => read_text(&folder.join(format!("{}.txt", image_base_name(&image.name))))?.unwrap_or_default(),
        (None, None) => String::new(),
    };
    // Like the TS code, an image without labels is checked against a 1x1 frame without being opened.
    if js::trim(&text).is_empty() {
        return Ok(Some(inspect_detection_labels(&text, 1.0, 1.0, settings)));
    }
    let file = std::fs::File::open(&image.path).map_err(|error| ReviewError::Io(format!("{}: {error}", image.path.display())))?;
    Ok(image_info::dimensions(&mut BufReader::new(file)).map(|(width, height)| inspect_detection_labels(&text, f64::from(width), f64::from(height), settings)))
}

/// `parseYoloRows(text, 1, 1).length`: the label count the image list and its filters show.
pub fn count_label_rows(text: &str) -> usize {
    text.split('\n').filter(|line| !js::trim(line).is_empty()).count()
}

/// Row counts of every `.txt` file in `folder` (refreshImageWorkflowStatus in image-session-service.ts),
/// files read in parallel.
pub fn label_row_counts(folder: &Path) -> Result<Vec<(String, usize)>, ReviewError> {
    let io = |error: std::io::Error| ReviewError::Io(format!("{}: {error}", folder.display()));
    let mut names = Vec::new();
    for entry in std::fs::read_dir(folder).map_err(io)? {
        let entry = entry.map_err(io)?;
        // Like fs_read_dir in src-tauri: plain files only, symbolic links not followed.
        let is_file = entry.file_type().map(|kind| kind.is_file()).unwrap_or(false);
        let name = entry.file_name().to_string_lossy().into_owned();
        if is_file && name.ends_with(".txt") {
            names.push(name);
        }
    }
    names
        .into_par_iter()
        .map(|name| {
            let text = read_text(&folder.join(&name))?.unwrap_or_default();
            Ok((name, count_label_rows(&text)))
        })
        .collect()
}

/// Findings in `images` order (None: decode that image to learn its size). Stops with
/// `ReviewError::Cancelled` once `cancelled` returns true; `advance` runs after each image.
pub fn review_images(
    label_folder: Option<&Path>,
    images: &[FolderImage],
    settings: &ReviewSettings,
    cancelled: impl Fn() -> bool + Sync,
    advance: impl Fn() + Sync,
) -> Result<Vec<Option<ReviewFinding>>, ReviewError> {
    images
        .par_iter()
        .map(|image| {
            if cancelled() {
                return Err(ReviewError::Cancelled);
            }
            let finding = review_image(label_folder, image, settings)?;
            advance();
            Ok(finding)
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};

    #[test]
    fn base_names_follow_the_ts_regex() {
        for (name, base) in [("a.png", "a"), ("a.b.tif", "a.b"), ("name.", "name."), (".png", ""), ("noext", "noext"), ("x.JPG", "x")] {
            assert_eq!(image_base_name(name), base, "{name}");
        }
    }

    fn png_header(width: u32, height: u32) -> Vec<u8> {
        let mut bytes = vec![0x89, b'P', b'N', b'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 13];
        bytes.extend(b"IHDR");
        bytes.extend(width.to_be_bytes());
        bytes.extend(height.to_be_bytes());
        bytes.extend([8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        bytes.extend(b"IDAT");
        bytes
    }

    #[test]
    fn reviews_a_folder_like_the_ts_loop() {
        let folder = std::env::temp_dir().join(format!("el-core-review-{}", std::process::id()));
        let labels = folder.join("label");
        std::fs::create_dir_all(&labels).expect("temp folder");
        std::fs::write(folder.join("a.png"), png_header(100, 50)).expect("write");
        std::fs::write(folder.join("b.gif"), b"GIF89a").expect("write");
        std::fs::write(labels.join("a.txt"), "\u{FEFF}0 0.5 0.5 0.01 0.5\n").expect("write");
        std::fs::write(labels.join("b.txt"), "0 0.5 0.5 0.5 0.5\n").expect("write");
        let settings = ReviewSettings { minimum_box_size_px: 4.0, duplicate_iou_threshold: 0.9, required_class_ids: vec![] };
        let image = |name: &str, edited: Option<&str>| FolderImage { name: name.into(), path: folder.join(name), edited_text: edited.map(String::from) };
        let images = [image("a.png", None), image("b.gif", None), image("c.png", None), image("a.png", Some(""))];
        let advanced = AtomicUsize::new(0);
        let findings = review_images(
            Some(&labels),
            &images,
            &settings,
            || false,
            || {
                advanced.fetch_add(1, Ordering::Relaxed);
            },
        )
        .expect("review");
        // a.png: 1 px wide box on a 100x50 image (BOM stripped, so class "0" parses).
        assert_eq!(findings[0], Some(inspect_detection_labels("0 0.5 0.5 0.01 0.5\n", 100.0, 50.0, &settings)));
        assert_eq!(findings[0].as_ref().map(|finding| finding.issues[0].kind), Some("small-box"));
        assert_eq!(findings[1], None, "GIF sizes need the decoder");
        assert_eq!(findings[2], Some(inspect_detection_labels("", 1.0, 1.0, &settings)), "missing label file reads as empty");
        assert_eq!(findings[3], Some(inspect_detection_labels("", 1.0, 1.0, &settings)), "edited text wins over the file");
        assert_eq!(advanced.load(Ordering::Relaxed), 4);
        assert_eq!(review_images(Some(&labels), &images, &settings, || true, || {}), Err(ReviewError::Cancelled));
        let _ = std::fs::remove_dir_all(&folder);
    }
}
