//! Integration test for Datasworn JTD-generated Rust types.
//!
//! This program attempts to deserialize Datasworn JSON files using the
//! generated types, verifying that the JTD schema correctly represents
//! the actual data structure.
//!
//! Usage: cargo run -- <json_file> [json_file...]
//!
//! Exit codes:
//!   0 - All files parsed successfully
//!   1 - One or more files failed to parse

mod datasworn;

use std::fs;
use std::process::ExitCode;

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();

    if args.is_empty() {
        eprintln!("Usage: datasworn-rust-test <json_file> [json_file...]");
        return ExitCode::from(1);
    }

    let mut success_count = 0;
    let mut failure_count = 0;

    for json_path in &args {
        match test_file(json_path) {
            Ok(pkg_id) => {
                println!("[PASS] {} ({})", json_path, pkg_id);
                success_count += 1;
            }
            Err(e) => {
                eprintln!("[FAIL] {}: {}", json_path, e);
                failure_count += 1;
            }
        }
    }

    println!("\nResults: {} passed, {} failed", success_count, failure_count);

    if failure_count > 0 {
        ExitCode::from(1)
    } else {
        ExitCode::from(0)
    }
}

fn test_file(json_path: &str) -> Result<String, String> {
    let json_content = fs::read_to_string(json_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let pkg: datasworn::RulesPackage = serde_json::from_str(&json_content)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;

    let pkg_id = match pkg {
        datasworn::RulesPackage::Ruleset(r) => r.id,
        datasworn::RulesPackage::Expansion(e) => e.id,
    };

    Ok(pkg_id)
}
