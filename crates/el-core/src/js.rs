//! JavaScript semantics the TS reference code relies on. Ports that must match the TS output byte
//! for byte use these instead of the Rust equivalents, which differ in edge cases (whitespace sets,
//! NaN in min/max, number formatting, lenient float parsing).

/// ECMAScript WhiteSpace and LineTerminator code points: what `String.prototype.trim` and `parseFloat`
/// skip. Unlike `char::is_whitespace` it includes U+FEFF and excludes U+0085.
pub fn is_whitespace(c: char) -> bool {
    matches!(
        c,
        '\u{0009}'..='\u{000D}' | ' ' | '\u{00A0}' | '\u{1680}' | '\u{2000}'..='\u{200A}' | '\u{2028}' | '\u{2029}' | '\u{202F}' | '\u{205F}' | '\u{3000}' | '\u{FEFF}'
    )
}

/// `String.prototype.trim`.
pub fn trim(text: &str) -> &str {
    text.trim_matches(is_whitespace)
}

/// `parseFloat`: skips leading whitespace, then reads the longest prefix that is a decimal literal
/// (or `Infinity`) with an optional sign; NaN when there is none.
pub fn parse_float(text: &str) -> f64 {
    let text = text.trim_start_matches(is_whitespace);
    let bytes = text.as_bytes();
    let mut end = usize::from(matches!(bytes.first(), Some(b'+' | b'-')));
    if text[end..].starts_with("Infinity") {
        return if bytes[0] == b'-' { f64::NEG_INFINITY } else { f64::INFINITY };
    }
    let digits = |from: usize| bytes[from..].iter().take_while(|b| b.is_ascii_digit()).count();
    let integer = digits(end);
    end += integer;
    let mut fraction = 0;
    if bytes.get(end) == Some(&b'.') {
        fraction = digits(end + 1);
        if integer + fraction > 0 {
            end += 1 + fraction;
        }
    }
    if integer + fraction == 0 {
        return f64::NAN;
    }
    if matches!(bytes.get(end), Some(b'e' | b'E')) {
        let sign = usize::from(matches!(bytes.get(end + 1), Some(b'+' | b'-')));
        let exponent = digits(end + 1 + sign);
        if exponent > 0 {
            end += 1 + sign + exponent;
        }
    }
    // The prefix is a valid Rust float literal ("5.", ".5", "+1e400" included); both parsers round correctly.
    text[..end].parse().unwrap_or(f64::NAN)
}

/// `Math.max(a, b)`: NaN when either is NaN.
pub fn max(a: f64, b: f64) -> f64 {
    if a.is_nan() || b.is_nan() {
        f64::NAN
    } else {
        a.max(b)
    }
}

/// `Math.min(a, b)`: NaN when either is NaN.
pub fn min(a: f64, b: f64) -> f64 {
    if a.is_nan() || b.is_nan() {
        f64::NAN
    } else {
        a.min(b)
    }
}

/// `Number.prototype.toString()` (radix 10), e.g. in template literals: 4 -> "4", 1e21 -> "1e+21".
pub fn number_to_string(value: f64) -> String {
    if value.is_nan() {
        return "NaN".into();
    }
    if value == 0.0 {
        return "0".into();
    }
    if value < 0.0 {
        return format!("-{}", number_to_string(-value));
    }
    if value.is_infinite() {
        return "Infinity".into();
    }
    // Rust's `{:e}` prints the shortest round-tripping digits, as ECMAScript requires: "d.ddde<exp>".
    let scientific = format!("{value:e}");
    let (mantissa, exponent) = scientific.split_once('e').unwrap_or((&scientific, "0"));
    let digits: String = mantissa.chars().filter(char::is_ascii_digit).collect();
    let k = digits.len() as i32;
    let n = exponent.parse::<i32>().unwrap_or(0) + 1;
    if k <= n && n <= 21 {
        format!("{digits}{}", "0".repeat((n - k) as usize))
    } else if 0 < n && n <= 21 {
        format!("{}.{}", &digits[..n as usize], &digits[n as usize..])
    } else if -6 < n && n <= 0 {
        format!("0.{}{digits}", "0".repeat((-n) as usize))
    } else {
        let sign = if n - 1 < 0 { '-' } else { '+' };
        let rest = if k > 1 { format!(".{}", &digits[1..]) } else { String::new() };
        format!("{}{rest}e{sign}{}", &digits[..1], (n - 1).abs())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_float_reads_the_longest_decimal_prefix() {
        let cases: [(&str, f64); 14] = [
            ("0.5", 0.5),
            ("  \u{FEFF}\u{A0}1.25abc", 1.25),
            ("5.", 5.0),
            (".5", 0.5),
            ("-.5e1x", -5.0),
            ("1e", 1.0),
            ("1e+", 1.0),
            ("2E-1", 0.2),
            ("+Infinityx", f64::INFINITY),
            ("-Infinity", f64::NEG_INFINITY),
            ("1e400", f64::INFINITY),
            ("0x10", 0.0),
            ("1_000", 1.0),
            ("007", 7.0),
        ];
        for (text, expected) in cases {
            assert_eq!(parse_float(text), expected, "{text:?}");
        }
        for text in ["", ".", "-", "abc", "undefined", "\u{85}1", "e5", "+.e1"] {
            assert!(parse_float(text).is_nan(), "{text:?}");
        }
        assert!(parse_float("-0").is_sign_negative());
    }

    #[test]
    fn number_to_string_matches_ecmascript() {
        let cases: [(f64, &str); 14] = [
            (4.0, "4"),
            (2.5, "2.5"),
            (0.1 + 0.2, "0.30000000000000004"),
            (1e21, "1e+21"),
            (123456789012345680000.0, "123456789012345680000"),
            (1.5e-7, "1.5e-7"),
            (0.000001, "0.000001"),
            (1e-7, "1e-7"),
            (-0.0, "0"),
            (-12.5, "-12.5"),
            (5e-324, "5e-324"),
            (f64::MAX, "1.7976931348623157e+308"),
            (100.0, "100"),
            (f64::INFINITY, "Infinity"),
        ];
        for (value, expected) in cases {
            assert_eq!(number_to_string(value), expected, "{value:e}");
        }
    }

    #[test]
    fn min_max_propagate_nan_like_math() {
        assert!(max(0.0, f64::NAN).is_nan());
        assert!(min(f64::NAN, 1.0).is_nan());
        assert_eq!(max(1.0, 2.0), 2.0);
    }
}
