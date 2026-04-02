export type ColumnHeight = 'auto' | '25' | '50' | '75' | '100';
export type Display = 'block' | 'flex' | 'none' | 'inline-block' | '';
export type AlignItems = 'start' | 'center' | 'end' | 'stretch' | 'baseline' | '';
export type JustifyContent = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | '';
export type AlignSelf = 'auto' | 'start' | 'center' | 'end' | 'stretch' | '';

export interface ColumnSizes {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface Column {
  id: string;
  sizes: ColumnSizes;
  content: string;
  height?: ColumnHeight;
  customHeight?: string;
  display?: Display;
  alignSelf?: AlignSelf;
}

export interface Row {
  id: number;
  columns: Column[];
  height?: ColumnHeight;
  customHeight?: string;
  display?: Display;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
}
