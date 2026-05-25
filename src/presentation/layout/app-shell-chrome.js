/** Header shell seragam: tinggi tetap h-16 (64px), judul + deskripsi. */
export const APP_SHELL_HEADER_CLASS =
  'flex h-16 shrink-0 items-center border-b border-border/60 bg-white';

/** @deprecated Pakai APP_SHELL_HEADER_CLASS — tinggi sudah disamakan. */
export const APP_SHELL_HEADER_DESC_CLASS = APP_SHELL_HEADER_CLASS;

export const APP_SHELL_HEADER_X = 'px-4 md:px-6';

export const APP_SHELL_HEADER_TITLE_CLASS =
  'truncate font-display text-base font-black tracking-tight text-foreground md:text-lg';

export const APP_SHELL_HEADER_SUBTITLE_CLASS =
  'min-h-[14px] truncate text-[11px] font-medium text-muted-foreground';

/** Footer profil sidebar — tinggi sama dengan header. */
export const APP_SHELL_FOOTER_CLASS =
  'flex h-16 shrink-0 items-center border-t border-border/60 bg-white';

/** Tinggi baris navigasi sidebar. */
export const APP_SHELL_NAV_ROW_CLASS =
  'flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition';

/** Input pencarian — background putih, aksen oranye hanya saat fokus. */
export const APP_SHELL_SEARCH_INPUT_CLASS =
  'h-12 w-full min-w-0 rounded-full border border-border/60 bg-white pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-[#FF8000]/50 focus:ring-2 focus:ring-[#FF8000]/15 disabled:cursor-not-allowed disabled:opacity-50';

export const APP_SHELL_SEARCH_ICON_CLASS = 'text-muted-foreground';

/** Tombol sekunder tema (mis. keluar komunitas). */
export const APP_SHELL_SECONDARY_BUTTON_CLASS =
  'rounded-full border-2 border-[#FF8000] bg-[#FFF1E5] font-semibold text-[#FF8000] shadow-sm hover:border-[#E67300] hover:bg-[#FFE0C2] hover:text-[#E67300]';

/** Field form — background putih, border netral. */
export const APP_SHELL_FORM_INPUT_CLASS =
  'h-12 w-full min-w-0 rounded-xl border border-border/60 bg-white px-4 text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-[#FF8000]/50 focus:ring-2 focus:ring-[#FF8000]/15 disabled:cursor-not-allowed disabled:opacity-50';

export const APP_SHELL_FORM_TEXTAREA_CLASS =
  'flex min-h-[100px] w-full resize-y rounded-xl border border-border/60 bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-[#FF8000]/50 focus:ring-2 focus:ring-[#FF8000]/15 disabled:cursor-not-allowed disabled:opacity-50';

export const APP_SHELL_FORM_PICKER_CLASS =
  'relative flex h-12 w-full items-center rounded-xl border border-border/60 bg-white px-4 text-left text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow] focus:border-[#FF8000]/50 focus:ring-2 focus:ring-[#FF8000]/15';

export const APP_SHELL_FORM_PICKER_PLACEHOLDER_CLASS = 'text-muted-foreground';

export const APP_SHELL_FORM_SELECT_CLASS =
  'h-12 w-full rounded-xl border border-border/60 bg-white px-4 text-left text-sm text-foreground shadow-sm focus:border-[#FF8000]/50 focus:ring-2 focus:ring-[#FF8000]/15 data-[placeholder]:text-muted-foreground';

export const APP_SHELL_FORM_UPLOAD_ZONE_CLASS =
  'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/70 bg-white text-muted-foreground transition-colors hover:border-border hover:bg-muted/30';

export const APP_SHELL_FORM_SECTION_CLASS =
  'space-y-4 rounded-2xl border border-border/60 bg-white p-4 shadow-sm md:p-5';

/** Panel dropdown (Select, autocomplete). */
export const APP_SHELL_FORM_DROPDOWN_CONTENT_CLASS =
  'z-50 rounded-xl border border-border/60 bg-white text-foreground shadow-lg';

export const APP_SHELL_FORM_DROPDOWN_ITEM_CLASS =
  'rounded-lg focus:bg-muted/50 focus:text-foreground';
