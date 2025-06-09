# Enigma Machine Bug Fix

## Bug Description
The Enigma implementation was missing the second plugboard swap in the `encryptChar` method. This caused encryption and decryption to fail when plugboard pairs were used.

## Root Cause
In a real Enigma machine, the electrical signal passes through the plugboard **twice**:
1. Once before entering the rotors (forward direction)
2. Once after exiting the rotors (after reflection)

The code only implemented the first plugboard pass, missing the critical second pass.

## The Fix
Added the missing second plugboard swap after the backward rotor pass:

```javascript
// In encryptChar method, after the backward rotor pass:
c = plugboardSwap(c, this.plugboardPairs);
```

## Signal Path (Corrected)
1. Input character
2. **Plugboard** (first pass)
3. Rotors (forward direction) 
4. Reflector
5. Rotors (backward direction)
6. **Plugboard** (second pass) ← This was missing
7. Output character

This fix ensures that encryption and decryption are symmetric and work correctly with all Enigma settings, including plugboard pairs. 