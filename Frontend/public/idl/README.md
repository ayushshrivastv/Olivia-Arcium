# IDL Directory

This directory should contain the program IDL (Interface Definition Language) file.

## Setup Instructions

1. Build the Anchor program to generate the IDL:
   ```bash
   cd /Users/ayushsrivastava/Olivia
   anchor build
   ```

2. Copy the generated IDL file to this directory:
   ```bash
   cp target/idl/prediction_market.json Frontend/public/idl/prediction_market.json
   ```

Alternatively, if the IDL file is generated in a different location, update the path in:
`Frontend/src/trade/SwapUI.tsx` (line 113)

## File Required
- `prediction_market.json` - The Anchor program IDL file

