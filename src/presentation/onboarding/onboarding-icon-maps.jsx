import {
  Bike,
  Camera,
  ChefHat,
  CircleDot,
  CloudSun,
  Dice5,
  Feather,
  Footprints,
  Gamepad2,
  Moon,
  Mountain,
  PersonStanding,
  Sun,
  Sunrise,
  Target,
  Waves,
} from 'lucide-react';

/** Ikon per id aktivitas onboarding (step 2). */
export const onboardingActivityIconMap = {
  running: Footprints,
  padel: Target,
  cycling: Bike,
  yoga: PersonStanding,
  basketball: CircleDot,
  pokemon: Gamepad2,
  boardgames: Dice5,
  hiking: Mountain,
  swimming: Waves,
  badminton: Feather,
  photography: Camera,
  cooking: ChefHat,
};

/** Ikon per slot waktu favorit (step 3). */
export const eventTimeIconMap = {
  morning: Sunrise,
  midday: Sun,
  afternoon: CloudSun,
  evening: Moon,
};
