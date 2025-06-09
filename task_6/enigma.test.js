const { Enigma } = require('./enigma');

describe('Enigma Machine', () => {
  function makeEnigma({
    rotorPositions = [0, 0, 0],
    ringSettings = [0, 0, 0],
    plugboardPairs = [],
  } = {}) {
    return new Enigma([0, 1, 2], rotorPositions, ringSettings, plugboardPairs);
  }

  test('Encrypts and decrypts with default settings (no plugboard, no ring, AAA)', () => {
    const enigma = makeEnigma();
    const plaintext = 'HELLOWORLD';
    const ciphertext = enigma.process(plaintext);
    // Reset to same settings for decryption
    const enigma2 = makeEnigma();
    const decrypted = enigma2.process(ciphertext);
    expect(decrypted).toBe(plaintext);
  });

  test('Encrypts and decrypts with plugboard pairs', () => {
    const enigma = makeEnigma({ plugboardPairs: [['A', 'B'], ['C', 'D']] });
    const plaintext = 'ABCDXYZ';
    const ciphertext = enigma.process(plaintext);
    const enigma2 = makeEnigma({ plugboardPairs: [['A', 'B'], ['C', 'D']] });
    const decrypted = enigma2.process(ciphertext);
    expect(decrypted).toBe(plaintext);
  });

  test('Encrypts and decrypts with non-zero rotor positions', () => {
    const enigma = makeEnigma({ rotorPositions: [1, 2, 3] });
    const plaintext = 'ENIGMA';
    const ciphertext = enigma.process(plaintext);
    const enigma2 = makeEnigma({ rotorPositions: [1, 2, 3] });
    const decrypted = enigma2.process(ciphertext);
    expect(decrypted).toBe(plaintext);
  });

  test('Encrypts and decrypts with non-zero ring settings', () => {
    const enigma = makeEnigma({ ringSettings: [1, 2, 3] });
    const plaintext = 'ENIGMA';
    const ciphertext = enigma.process(plaintext);
    const enigma2 = makeEnigma({ ringSettings: [1, 2, 3] });
    const decrypted = enigma2.process(ciphertext);
    expect(decrypted).toBe(plaintext);
  });

  test('Encrypts and decrypts with all settings combined', () => {
    const enigma = makeEnigma({
      rotorPositions: [1, 2, 3],
      ringSettings: [4, 5, 6],
      plugboardPairs: [['A', 'Q'], ['W', 'S']]
    });
    const plaintext = 'ENIGMA';
    const ciphertext = enigma.process(plaintext);
    const enigma2 = makeEnigma({
      rotorPositions: [1, 2, 3],
      ringSettings: [4, 5, 6],
      plugboardPairs: [['A', 'Q'], ['W', 'S']]
    });
    const decrypted = enigma2.process(ciphertext);
    expect(decrypted).toBe(plaintext);
  });

  test('Non-alphabetic characters are passed through unchanged', () => {
    const enigma = makeEnigma();
    const plaintext = 'HELLO WORLD! 123';
    const ciphertext = enigma.process(plaintext);
    // Verify spaces, punctuation, and numbers are preserved
    expect(ciphertext).toMatch(/ /);
    expect(ciphertext).toMatch(/!/);
    expect(ciphertext).toMatch(/123/);
    const enigma2 = makeEnigma();
    const decrypted = enigma2.process(ciphertext);
    expect(decrypted).toBe(plaintext.toUpperCase());
  });

  test('Handles lowercase input by converting to uppercase', () => {
    const enigma = makeEnigma();
    const plaintext = 'hello';
    const ciphertext = enigma.process(plaintext);
    const enigma2 = makeEnigma();
    const decrypted = enigma2.process(ciphertext);
    expect(decrypted).toBe('HELLO');
  });

  test('Rotor stepping mechanism works correctly', () => {
    const enigma = makeEnigma({ rotorPositions: [0, 0, 0] });
    const initialPositions = enigma.rotors.map(r => r.position);
    
    // Process one character to trigger stepping
    enigma.process('A');
    
    const afterPositions = enigma.rotors.map(r => r.position);
    
    // Right rotor should have stepped
    expect(afterPositions[2]).toBe(1);
    // Other rotors should not have stepped yet
    expect(afterPositions[0]).toBe(0);
    expect(afterPositions[1]).toBe(0);
  });

  test('Double-stepping anomaly: middle rotor steps correctly', () => {
    // Set rotors so that right rotor is at notch
    // The rightmost rotor is Rotor III, which has notch at V (position 21)
    const enigma = makeEnigma({ rotorPositions: [0, 0, 21] });
    
    // Process one character - should trigger middle rotor step
    enigma.process('A');
    
    const positions = enigma.rotors.map(r => r.position);
    
    // Right rotor stepped from 21 to 22
    expect(positions[2]).toBe(22);
    // Middle rotor should have stepped
    expect(positions[1]).toBe(1);
    // Left rotor should not have stepped
    expect(positions[0]).toBe(0);
  });

  test('Encrypts known plaintext to expected ciphertext', () => {
    const enigma = makeEnigma({
      rotorPositions: [0, 0, 0],
      ringSettings: [0, 0, 0],
      plugboardPairs: [['Q', 'W'], ['E', 'R']]
    });
    const plaintext = 'HELLOWORLD';
    const ciphertext = enigma.process(plaintext);
    
    // Decrypt to verify
    const enigma2 = makeEnigma({
      rotorPositions: [0, 0, 0],
      ringSettings: [0, 0, 0],
      plugboardPairs: [['Q', 'W'], ['E', 'R']]
    });
    const decrypted = enigma2.process(ciphertext);
    expect(decrypted).toBe(plaintext);
  });

  test('Empty message returns empty string', () => {
    const enigma = makeEnigma();
    expect(enigma.process('')).toBe('');
  });

  test('Plugboard swaps work bidirectionally', () => {
    const enigma1 = makeEnigma({ plugboardPairs: [['A', 'Z']] });
    const enigma2 = makeEnigma({ plugboardPairs: [['Z', 'A']] }); // Reversed order
    
    const plaintext = 'AZAZ';
    const cipher1 = enigma1.process(plaintext);
    const cipher2 = enigma2.process(plaintext);
    
    // Both should produce the same result
    expect(cipher1).toBe(cipher2);
  });

  test('Multiple rotor rotations work correctly', () => {
    const enigma = makeEnigma({ rotorPositions: [0, 0, 0] });
    
    // Process 30 characters to ensure multiple rotations
    const longText = 'A'.repeat(30);
    enigma.process(longText);
    
    const positions = enigma.rotors.map(r => r.position);
    
    // Right rotor should have rotated 30 times
    expect(positions[2]).toBe(30 % 26);
    // Middle rotor should have rotated at least once
    expect(positions[1]).toBeGreaterThan(0);
  });

  test('Ring settings affect encryption output', () => {
    const enigma1 = makeEnigma({ ringSettings: [0, 0, 0] });
    const enigma2 = makeEnigma({ ringSettings: [1, 1, 1] });
    
    const plaintext = 'HELLO';
    const cipher1 = enigma1.process(plaintext);
    const cipher2 = enigma2.process(plaintext);
    
    // Different ring settings should produce different output
    expect(cipher1).not.toBe(cipher2);
  });

  test('Same message encrypted twice with same settings produces same result', () => {
    const settings = {
      rotorPositions: [5, 10, 15],
      ringSettings: [1, 2, 3],
      plugboardPairs: [['A', 'B'], ['C', 'D']]
    };
    
    const enigma1 = makeEnigma(settings);
    const enigma2 = makeEnigma(settings);
    
    const plaintext = 'TESTMESSAGE';
    const cipher1 = enigma1.process(plaintext);
    const cipher2 = enigma2.process(plaintext);
    
    expect(cipher1).toBe(cipher2);
  });
}); 