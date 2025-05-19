# QR Code Scanner & Generator

A web application for scanning and generating QR codes with customization options and history tracking.

## Features

### QR Code Scanning
- Scan QR codes using your device's camera
- Upload and scan QR codes from gallery images
- View and interact with scan results
- Copy scanned content to clipboard
- Open URLs directly if the QR code contains a valid link

### QR Code Generation
- Generate QR codes for different types of content:
  - URLs
  - Plain text
  - Contact information (vCard format)
  - WiFi network credentials
- Customize QR code colors (foreground and background)
- Download generated QR codes as PNG images
- Share QR codes (on supported devices)

### History Tracking
- Keep track of all scanned and generated QR codes
- Filter history by type (scanned or generated)
- Copy content from history items
- Open URLs from history
- Regenerate QR codes from history

## How to Use

### Scanning QR Codes
1. Click the "Scan QR" tab
2. Click "Start Camera" to use your device's camera for scanning
3. Alternatively, click "Upload Image" to scan a QR code from a saved image
4. Once a QR code is detected, the result will be displayed
5. Use the "Copy" button to copy the content to your clipboard
6. If the QR code contains a URL, use the "Open Link" button to navigate to it

### Generating QR Codes
1. Click the "Generate QR" tab
2. Select the type of QR code you want to create (URL, Text, Contact, WiFi)
3. Fill in the required information
4. Customize the QR code colors if desired
5. Click "Generate QR Code"
6. Use the "Download" button to save the QR code as an image
7. On supported devices, use the "Share" button to share the QR code

### Managing History
1. Click the "History" tab to view your QR code history
2. Use the filter buttons to show all items, only scanned items, or only generated items
3. Click "Copy" on any history item to copy its content
4. Click "Open" on URL items to navigate to the link
5. Click "Regenerate" on generated items to recreate the QR code
6. Use the "Clear History" button to remove all history items

## Technical Details

This application uses:
- HTML5 QR Code library for QR code scanning
- QRCode.js for QR code generation
- Local storage for saving history
- Web Share API for sharing (on supported devices)

## Browser Compatibility

This application works best on modern browsers with camera access capabilities. For full functionality, the following features are required:
- Camera access (for scanning)
- File API (for gallery uploads)
- Canvas API (for QR code generation)
- Local Storage (for history)
- Web Share API (for sharing, optional)

## Privacy

All data is stored locally on your device. No information is sent to any server.
