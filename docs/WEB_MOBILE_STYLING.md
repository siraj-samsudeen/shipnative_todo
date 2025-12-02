# Web vs Mobile Styling Differences

## Issue Summary

The styling between web and mobile versions of the app doesn't match, particularly:
- **Fonts**: Different font rendering (system fonts vs Space Grotesk)
- **Colors**: Potential color rendering differences
- **Layout**: Different spacing and component rendering

## Root Causes

### 1. Font Loading Mismatch

**Problem**: The theme was using font names that don't match how fonts are loaded on web vs native.

- **Native**: Uses PostScript font names like `"SpaceGrotesk-Regular"`, `"SpaceGrotesk-Medium"`, etc.
- **Web**: Google Fonts uses the font family name `"Space Grotesk"` (with space) and handles weights via CSS `font-weight` property, not separate font families.

**Fix Applied**:
- Updated `unistyles.ts` to use `Platform.select()` for font names:
  - Web: `"Space Grotesk"` (single font family)
  - Native: `"SpaceGrotesk-Regular"`, `"SpaceGrotesk-Medium"`, etc. (separate font families)

### 2. Font Weight Handling

**Problem**: The `Text` component was using different font families for each weight, which works on native but not on web.

**Fix Applied**:
- Updated `Text.tsx` to use `font-weight` CSS property on web:
  - Web: Same font family (`"Space Grotesk"`) with `fontWeight: "400"`, `"500"`, `"600"`, `"700"`
  - Native: Separate font families for each weight (existing behavior)

## Files Changed

1. **`app/theme/unistyles.ts`**
   - Added `Platform.select()` for font family names
   - Web uses `"Space Grotesk"`, native uses PostScript names

2. **`app/components/Text.tsx`**
   - Added `Platform.select()` for font weight handling
   - Web uses `font-weight` CSS property, native uses separate font families

## Additional Considerations

### Font Loading on Web

**Note**: `expo-google-fonts` should automatically handle font loading on web, but if fonts still don't appear correctly, you may need to:

1. Verify fonts are loaded in `app.tsx` via `useFonts(customFontsToLoad)`
2. Check browser console for font loading errors
3. Consider adding a Google Fonts link tag in `index.html` if using React Native Web directly:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
   ```

### Color Differences

Colors should be consistent since they're defined in the theme, but web browsers may render colors slightly differently due to:
- Color profile differences
- Screen calibration
- Browser rendering engines

### Layout Differences

React Native Web translates React Native styles to CSS, which can cause minor differences:
- Flexbox behavior may differ slightly
- Shadow rendering differs (CSS shadows vs native elevation)
- Border radius may render differently

## Testing

After these fixes, verify:

1. **Fonts**: 
   - Web should show Space Grotesk font (not system fonts)
   - Mobile should continue using Space Grotesk
   - Font weights should match between platforms

2. **Colors**:
   - Compare color values between web and mobile
   - Check dark mode rendering on both platforms

3. **Layout**:
   - Compare spacing and component sizes
   - Verify buttons, inputs, and cards render similarly

## Next Steps

1. Test the fixes on both web and mobile
2. If fonts still don't load on web, add Google Fonts link tag
3. Consider creating a web-specific font loading utility if needed
4. Document any remaining differences that are platform-specific by design


