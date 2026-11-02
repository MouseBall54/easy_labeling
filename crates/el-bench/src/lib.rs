//! Fixture loading shared by the golden tests and the benches. Fixtures come from the TS
//! implementations (`node scripts/migration/gen-golden.mjs`), which are the reference.

use el_core::{preprocess::PreprocessConfig, refine};
use serde::Deserialize;
use std::collections::HashMap;
use std::path::PathBuf;

pub fn fixture_path(relative: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("fixtures").join(relative)
}

pub fn read_bytes(relative: &str) -> Vec<u8> {
    let path = fixture_path(relative);
    std::fs::read(&path).unwrap_or_else(|error| panic!("{}: {error} (run node scripts/migration/gen-golden.mjs)", path.display()))
}

pub fn read_json<T: for<'de> Deserialize<'de>>(relative: &str) -> T {
    serde_json::from_slice(&read_bytes(relative)).unwrap_or_else(|error| panic!("{relative}: {error}"))
}

/// Little-endian f32 samples, as Float32Array writes them.
pub fn read_f32(relative: &str) -> Vec<f32> {
    read_bytes(relative).as_chunks::<4>().0.iter().map(|bytes| f32::from_le_bytes(*bytes)).collect()
}

#[derive(Deserialize)]
pub struct PreprocessCase {
    pub name: String,
    pub width: usize,
    pub height: usize,
    pub input: String,
    pub config: PreprocessConfig,
    pub output: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RefineCase {
    pub name: String,
    pub width: usize,
    pub height: usize,
    pub image: String,
    pub boxes: Vec<refine::BoxInput>,
    /// Absent when the neighbours are the boxes themselves.
    pub neighbours: Option<Vec<refine::BoxInput>>,
    pub params_by_class: HashMap<String, refine::RefineParams>,
    pub expected: serde_json::Value,
}

/// SEM-sized bench input from fixtures/generated/manifest.json (`gen-golden.mjs --bench`).
#[derive(Deserialize)]
pub struct BenchInput {
    pub width: usize,
    pub height: usize,
    pub image: String,
    pub boxes: String,
    pub count: usize,
}

#[derive(Deserialize)]
pub struct ReviewCase {
    pub name: String,
    pub text: String,
    pub width: f64,
    pub height: f64,
    pub settings: el_core::review::ReviewSettings,
    pub expected: serde_json::Value,
    pub rows: usize,
}

/// JS results recorded by gen-golden.mjs; floats as big-endian IEEE-754 bit patterns in hex.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JsCases {
    pub parse_float: Vec<ParseFloatCase>,
    pub number_to_string: Vec<NumberToStringCase>,
    pub hypot: Vec<HypotCase>,
}

#[derive(Deserialize)]
pub struct HypotCase {
    pub a: String,
    pub b: String,
    pub bits: String,
}

#[derive(Deserialize)]
pub struct ParseFloatCase {
    pub input: String,
    pub bits: String,
}

#[derive(Deserialize)]
pub struct NumberToStringCase {
    pub bits: String,
    pub text: String,
}

pub fn f64_from_hex(bits: &str) -> f64 {
    f64::from_bits(u64::from_str_radix(bits, 16).unwrap_or_else(|error| panic!("{bits}: {error}")))
}
