#!/bin/bash
# Build script: packages the extension as .zip (for Chrome Web Store) and
# .crx (for direct sharing).
# Usage: ./build.sh

set -e

EXTENSION_NAME="ai-to-glorified-autocomplete"
VERSION=$(grep '"version"' manifest.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')
ZIP_OUTPUT="${EXTENSION_NAME}-v${VERSION}.zip"
CRX_OUTPUT="${EXTENSION_NAME}-v${VERSION}.crx"
KEY_FILE="${EXTENSION_NAME}.pem"

EXTENSION_FILES=(
  manifest.json
  background.js
  content_script.js
  replacements.js
  popup.html
  popup.js
  icons/icon16.png
  icons/icon32.png
  icons/icon48.png
  icons/icon128.png
)

echo "Packaging ${EXTENSION_NAME} v${VERSION}..."

# Clean previous builds
rm -f "$ZIP_OUTPUT" "$CRX_OUTPUT"

# --- .zip (for Chrome Web Store) ---
zip -r "$ZIP_OUTPUT" "${EXTENSION_FILES[@]}"

echo ""
echo "Built: ${ZIP_OUTPUT} ($(du -h "$ZIP_OUTPUT" | cut -f1))"

# --- .crx (for direct sharing) ---
# Generate a signing key if one doesn't exist yet
if [ ! -f "$KEY_FILE" ]; then
  echo ""
  echo "Generating signing key: ${KEY_FILE}"
  openssl genrsa -out "$KEY_FILE" 2048 2>/dev/null
fi

# Build .crx using python to assemble CRX3 format
python3 - "${EXTENSION_FILES[*]}" "$KEY_FILE" "$CRX_OUTPUT" << 'PYTHON'
import sys, struct, subprocess, tempfile, os, zipfile

files_str, key_path, crx_path = sys.argv[1:4]
files = files_str.split()

# Create zip payload in memory
zip_path = tempfile.mktemp(suffix=".zip")
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
    for f in files:
        zf.write(f)

with open(zip_path, "rb") as f:
    zip_data = f.read()

# Get DER-encoded public key
pub_key = subprocess.check_output(
    ["openssl", "rsa", "-in", key_path, "-pubout", "-outform", "DER"],
    stderr=subprocess.DEVNULL,
)

os.unlink(zip_path)

import hashlib

# Protobuf encoding helpers
def encode_varint(value):
    result = b""
    while value > 0x7F:
        result += bytes([0x80 | (value & 0x7F)])
        value >>= 7
    result += bytes([value])
    return result

def encode_bytes_field(field_number, data):
    tag = encode_varint((field_number << 3) | 2)
    return tag + encode_varint(len(data)) + data

# CRX ID is the first 16 bytes of SHA-256 of the public key
crx_id = hashlib.sha256(pub_key).digest()[:16]

# SignedData protobuf: crx_id (field 1)
signed_header_data = encode_bytes_field(1, crx_id)

# The proof signature must sign: "CRX3 SignedData\x00" + header_size_le + signed_header_data + zip
# Re-sign with the correct signed data
header_size_placeholder = b""  # we need to compute this iteratively

# Build the signed data payload that gets signed
#   "CRX3 SignedData\x00" | uint32le(len(signed_header_data)) | signed_header_data | zip
sign_payload = (
    b"CRX3 SignedData\x00"
    + struct.pack("<I", len(signed_header_data))
    + signed_header_data
    + zip_data
)

# Write payload to temp file for openssl signing
sign_payload_path = tempfile.mktemp()
with open(sign_payload_path, "wb") as f:
    f.write(sign_payload)

sig = subprocess.check_output(
    ["openssl", "dgst", "-sha256", "-binary", "-sign", key_path, sign_payload_path],
    stderr=subprocess.DEVNULL,
)
os.unlink(sign_payload_path)

# AsymmetricKeyProof: public_key (field 1), signature (field 2)
proof = encode_bytes_field(1, pub_key) + encode_bytes_field(2, sig)

# CrxFileHeader: sha256_with_rsa (field 2), signed_header_data (field 10000)
header = encode_bytes_field(2, proof) + encode_bytes_field(10000, signed_header_data)

# Write CRX3 file
with open(crx_path, "wb") as f:
    f.write(b"Cr24")                        # magic number
    f.write(struct.pack("<I", 3))            # CRX version
    f.write(struct.pack("<I", len(header)))  # header length
    f.write(header)                          # header protobuf
    f.write(zip_data)                        # zip payload

PYTHON

echo "Built: ${CRX_OUTPUT} ($(du -h "$CRX_OUTPUT" | cut -f1))"
echo ""
echo "To share directly: send the .crx file. Recipients install by"
echo "dragging it into chrome://extensions (Developer mode required)."
