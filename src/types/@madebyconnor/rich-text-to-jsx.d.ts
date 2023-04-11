declare module '@madebyconnor/rich-text-to-jsx' {
  import View from '../../src/types/View';
  import { EntryFields } from 'contentful';
  import RichText = EntryFields.RichText;

  interface RichTextProps {
    richText: RichText | undefined;
    overrides?: Record<string, any>;
  }

  const RichText: (props: RichTextProps) => View;
  export default RichText;
}
