/*
		takes in a parameter: binary ciphertext
		e.g. 01100101010110010101111101001110000100100001010100001101010101110101000101010000000000010101001001001001010111110101111100001110000101100000101001011000010010110101001000000000
		e.g. 0110001101001110010001010101110100000101010001010011001101010001010101100101000001010010010101010101001101010010

		decrypts using key
		e.g. !<<<key>>>!

		outputs plaintext
		e.g. Decryption successful!
		e.g. Bryan Johnston

		generates a PDF from PDF template and inserts plaintext, using pdf-lib.

		useful web tool for verification: https://md5decrypt.net/en/Xor/		

		000011010000001000011100000011110010011001110000000010010101110100100111000111100001011000011010001001110011111001001001
*/

/* --------------------------------------------------
									DECLARE FUNCTIONS 
 ---------------------------------------------------- */


// Decrypt Binary Ciphertext with XOR and key
// https://github.com/brattex/XOR-binary-decryption-demo-nodejs/blob/main/xor-binary-decrypt-demo.js
function xorDecryptFromBinary(binarySequence, key) {
	console.log('Decoding Ciphertext using key...');

	// set a blank string for the starting text
	let decryptedText = '';

	// Converting each 8-bit binary chunk into a decimal number for XOR.
	for (let i = 0; i < binarySequence.length; i += 8) {
		// Convert each 8-bit chunk to a decimal number
		const binaryChunk = binarySequence.substring(i, i + 8);

		// Parse string chunk as base 2, and return integer representation into decimalValue
		const decimalValue = parseInt(binaryChunk, 2);

		// bitwise XOR each decimal value with the corresponding character from the key
		// i/8 calculates index within the key for the current chunk of 8 bits.
		// if key.length is met, then wrap around with %
		const decryptedChar = String.fromCharCode(
			decimalValue ^ key.charCodeAt(Math.floor(i / 8) % key.length)
		);	// i/8 calculates index within the key for the current chunk of 8 bits.

		// Append the decrypted character to the result string
		decryptedText += decryptedChar;
	}


	console.log('Ciphertext decoded ... ');
	return decryptedText;
}

/* DECLARE REQUIREMENTS */

// import pdf-lib module to create and modify a PDF and import fs module
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');

// define constants
const inputPDFPath = './template.pdf';  // define the template PDF
const outputPDFPath = './output.pdf';  // define the output PDF
const xorKey = "!<<<key>>>!"; // Replace this with your chosen XOR key


// commandlineParameter should be the binary ciphertext string
const commandlineParameter = process.argv[2];	// e.g. node app <commandlineParameter>

// sanity check
console.log('Expected a binary ciphertext. The parameter received is: ', commandlineParameter);

async function createNewPDF() {
	console.log('Creating PDF from template and commandline parameter - ', inputPDFPath, commandlineParameter);

	// Read the existing template PDF
	console.log('Reading PDF template...');
	const inputPDFBytes = fs.readFileSync(inputPDFPath);

	// Create a new PDF document
	const pdfDoc = await PDFDocument.create();
	console.log('Opening a new PDF...');

	// Add the existing PDF to the new document
	const inputPDFDoc = await PDFDocument.load(inputPDFBytes);
	const [inputPDFPage] = await pdfDoc.copyPages(inputPDFDoc, [0]);
	pdfDoc.addPage(inputPDFPage);

	// Set up the new PDF for editing
	const page = pdfDoc.getPages()[0];	  // Access the first page of the new document 

	// Set up fonts on new PDF
	const docFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const textSize = 30;

	// Add decrypted ciphertext to the page
	xorEncryptedBinarySequence = commandlineParameter;

	const decryptedText = xorDecryptFromBinary(xorEncryptedBinarySequence, xorKey);

	text = decryptedText;

	const trimmedString = text.trim();

	console.log('Original String:', text);
	console.log('Trimmed String:', trimmedString);

	text = trimmedString;

	const textWidth = docFont.widthOfTextAtSize(text, textSize);
	const centerX = (page.getWidth() / 2 - textWidth / 2);
	page.drawText(text, { x: centerX, y: 380, font: docFont, size: textSize, color: rgb(0, 0, 0) });

	// Save the new PDF to a file
	const outputPDFBytes = await pdfDoc.save();
	fs.writeFileSync(outputPDFPath, outputPDFBytes);

	console.log('New PDF created successfully!', outputPDFPath);
	process.exit()

}

createNewPDF().catch((err) => {
	console.error('Error creating new PDF:', err);
});
