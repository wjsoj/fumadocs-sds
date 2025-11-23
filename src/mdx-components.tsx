/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import {
  SurveyForm,
  SurveySubmitButton,
  LoadSavedButton,
  SingleSelect,
  MultiSelect,
  TextInput
} from '@/components/quiz';
import { PasswordMeterDemo } from '@/components/PasswordMeter';

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    img: (props) => <ImageZoom {...(props as any)} />,
    SurveyForm,
    SurveySubmitButton,
    LoadSavedButton,
    SingleSelect,
    MultiSelect,
    TextInput,
    PasswordMeterDemo,
    ...components,
  };
}
