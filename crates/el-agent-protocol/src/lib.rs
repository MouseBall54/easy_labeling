//! Frames between easy-labeling-mcp.exe and the running app over a Windows named pipe:
//! `u32 LE header length | header JSON | u32 LE body length | body bytes` (body empty unless a reply carries
//! bytes, e.g. a PNG). Message shapes are in docs/AGENT_MCP_PLAN_KO.md section 3.1.

use serde_json::Value;
use tokio::io::{AsyncRead, AsyncReadExt, AsyncWrite, AsyncWriteExt};

/// Bumped when a frame or message shape changes; both sides refuse a different one.
pub const PROTOCOL: u64 = 1;

/// Largest header or body accepted (a 4K screen capture as PNG stays far below it).
const MAX_PART: usize = 256 * 1024 * 1024;

/// The pipe the app listens on: `EASY_LABELING_AGENT_PIPE` (tests run their own app) or one per Windows user.
/// Pipe names are machine-wide, so the user is part of the name; the pipe's default DACL already keeps
/// other non-admin users from opening it for writing.
pub fn pipe_name() -> String {
    if let Some(name) = std::env::var_os("EASY_LABELING_AGENT_PIPE") {
        return name.to_string_lossy().into_owned();
    }
    let user = format!("{}\\{}", std::env::var("USERDOMAIN").unwrap_or_default(), std::env::var("USERNAME").unwrap_or_default());
    // FNV-1a: a short stable tag, not a secret.
    let hash = user.to_lowercase().bytes().fold(0xcbf2_9ce4_8422_2325u64, |hash, byte| (hash ^ u64::from(byte)).wrapping_mul(0x100_0000_01b3));
    format!(r"\\.\pipe\easy-labeling-agent-{hash:016x}")
}

pub async fn write_frame<W: AsyncWrite + Unpin>(writer: &mut W, header: &Value, body: &[u8]) -> std::io::Result<()> {
    let header = serde_json::to_vec(header)?;
    let mut frame = Vec::with_capacity(8 + header.len() + body.len());
    frame.extend_from_slice(&part_len(header.len())?.to_le_bytes());
    frame.extend_from_slice(&header);
    frame.extend_from_slice(&part_len(body.len())?.to_le_bytes());
    frame.extend_from_slice(body);
    writer.write_all(&frame).await?;
    writer.flush().await
}

/// The next frame, or None when the other side closed the pipe between frames.
pub async fn read_frame<R: AsyncRead + Unpin>(reader: &mut R) -> std::io::Result<Option<(Value, Vec<u8>)>> {
    let mut length = [0u8; 4];
    match reader.read_exact(&mut length).await {
        Ok(_) => {}
        Err(error) if error.kind() == std::io::ErrorKind::UnexpectedEof => return Ok(None),
        Err(error) => return Err(error),
    }
    let header = read_part(reader, u32::from_le_bytes(length)).await?;
    reader.read_exact(&mut length).await?;
    let body = read_part(reader, u32::from_le_bytes(length)).await?;
    let header = serde_json::from_slice(&header).map_err(|error| std::io::Error::new(std::io::ErrorKind::InvalidData, error))?;
    Ok(Some((header, body)))
}

fn part_len(length: usize) -> std::io::Result<u32> {
    if length > MAX_PART {
        return Err(std::io::Error::new(std::io::ErrorKind::InvalidInput, "frame part too large"));
    }
    Ok(length as u32)
}

async fn read_part<R: AsyncRead + Unpin>(reader: &mut R, length: u32) -> std::io::Result<Vec<u8>> {
    let length = length as usize;
    if length > MAX_PART {
        return Err(std::io::Error::new(std::io::ErrorKind::InvalidData, "frame part too large"));
    }
    let mut part = vec![0u8; length];
    reader.read_exact(&mut part).await?;
    Ok(part)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[tokio::test]
    async fn frames_round_trip_and_end_cleanly() {
        let (mut client, mut server) = tokio::io::duplex(64);
        let writer = tokio::spawn(async move {
            write_frame(&mut client, &json!({ "type": "call", "id": "c1", "tool": "app_state", "args": {} }), &[]).await.expect("write");
            write_frame(&mut client, &json!({ "type": "result", "id": "c1", "ok": true }), &[1, 2, 3, 250]).await.expect("write");
        });
        let (header, body) = read_frame(&mut server).await.expect("read").expect("frame");
        assert_eq!(header["tool"], "app_state");
        assert!(body.is_empty());
        let (header, body) = read_frame(&mut server).await.expect("read").expect("frame");
        assert_eq!(header["ok"], true);
        assert_eq!(body, [1, 2, 3, 250]);
        writer.await.expect("writer");
        assert!(read_frame(&mut server).await.expect("eof").is_none());
    }

    #[tokio::test]
    async fn oversized_and_truncated_frames_are_errors() {
        let (mut client, mut server) = tokio::io::duplex(64);
        client.write_all(&u32::MAX.to_le_bytes()).await.expect("write");
        assert_eq!(read_frame(&mut server).await.expect_err("too large").kind(), std::io::ErrorKind::InvalidData);
        let (mut client, mut server) = tokio::io::duplex(64);
        client.write_all(&[5, 0, 0, 0, b'{']).await.expect("write");
        drop(client);
        assert_eq!(read_frame(&mut server).await.expect_err("truncated").kind(), std::io::ErrorKind::UnexpectedEof);
    }

    #[test]
    fn pipe_name_is_per_user_unless_overridden() {
        let name = pipe_name();
        assert!(name.starts_with(r"\\.\pipe\easy-labeling-agent"), "{name}");
    }
}
