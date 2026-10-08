import { useFonts } from 'expo-font';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import {
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_600SemiBold_Italic,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { GemunuLibre_700Bold } from '@expo-google-fonts/gemunu-libre';
import { FiraSans_400Regular, FiraSans_600SemiBold } from '@expo-google-fonts/fira-sans';

/**
 * Fonts are bundled TTFs, not downloaded from Google at runtime.
 * We load them in the background and never block the first screen.
 * Vector-icon fonts must be loaded too, or ticks/symbols pop in late.
 */
export function useILFonts() {
  const [loaded, error] = useFonts({
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_600SemiBold_Italic,
    PlayfairDisplay_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    GemunuLibre_700Bold,
    FiraSans_400Regular,
    FiraSans_600SemiBold,
    ...MaterialIcons.font,
    ...MaterialCommunityIcons.font,
  });

  return { fontsReady: loaded || !!error, fontError: error };
}
